use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use serde_wasm_bindgen::from_value;
use serde_json::json; // ←★ これが抜けていた
use fastrand::Rng;
use web_sys::console;

// ✅ panic発生時にRust側のスタックトレースをブラウザのコンソールに出力
#[wasm_bindgen(start)]
pub fn main_js() {
    console_error_panic_hook::set_once();
    console::log_1(&"WASM initialized".into());
}

#[derive(Serialize, Deserialize, Clone)]
pub struct City {
    pub x: f64,
    pub y: f64,
}

#[wasm_bindgen]
pub fn two_opt(cities_js: JsValue) -> JsValue {
    // ✅ 受け取ったJS配列をRustのVec<City>に変換
    let cities: Vec<City> = from_value(cities_js).unwrap();
    let mut route: Vec<usize> = (0..cities.len()).collect();

    // ✅ ランダム初期経路を生成
    let mut rng = Rng::new();
    for i in 0..cities.len() {
        let j = rng.usize(..cities.len());
        route.swap(i, j);
    }

    let mut best_distance = calc_total_distance(&cities, &route);
    let mut improved = true;
    let mut iteration = 0;

    // ✅ 改善が続く限り2-optを繰り返す（ただし無限ループ防止の上限つき）
    while improved && iteration < 1000 {
        improved = false;
        iteration += 1;

        for i in 1..(route.len() - 2) {
            for j in i + 1..(route.len() - 1) {
                let mut new_route = route.clone();
                new_route[i..=j].reverse();
                let new_distance = calc_total_distance(&cities, &new_route);
                if new_distance < best_distance {
                    route = new_route;
                    best_distance = new_distance;
                    improved = true;
                }
            }
        }
    }

    // ✅ serde_wasm_bindgenを使わずserde_json→String→JsValueで返す
    let result = json!({
        "route": route,
        "distance": best_distance
    });
    JsValue::from_str(&result.to_string())
}

fn calc_total_distance(cities: &Vec<City>, route: &Vec<usize>) -> f64 {
    let mut dist = 0.0;
    for i in 0..route.len() {
        let a = &cities[route[i]];
        let b = &cities[route[(i + 1) % route.len()]];
        dist += ((a.x - b.x).powi(2) + (a.y - b.y).powi(2)).sqrt();
    }
    dist
}
