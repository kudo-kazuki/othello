<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import Konva from 'konva'
import { calcTotalDistance } from '@/utility/distance' // 共通距離関数
import type { City } from '@/types/salseman'

const cityNum = ref(5)
const calcEngine = ref(1)
const isCalculating = ref(false)
const isStart = ref(false)
const isEnd = ref(false)
const totalDistance = ref(0) // ✅ 総距離
const initialDistance = ref(0) // ✅ 初期経路の距離を追加
const elapsedTime = ref(0) // 計算経過時間（ms）

const stageRef = ref<Konva.Stage | null>(null)
const layerRef = ref<Konva.Layer | null>(null)
const canvasContainer = ref<HTMLDivElement | null>(null)

const workerRef = ref<Worker | null>(null)
const progress = ref(0)

// ---------------------------
// 非同期sleep関数（アニメーション用）
// ---------------------------
/*
const sleep = (ms: number): Promise<void> =>
    new Promise<void>((resolve) => {
        if (ms <= 0) {
            requestAnimationFrame(() => resolve())
        } else {
            setTimeout(() => resolve(), ms)
        }
    })
*/

// ------------------------------------
// 初期化処理
// ------------------------------------
const initCanvas = () => {
    if (!canvasContainer.value) return

    const width = canvasContainer.value.clientWidth
    const height = canvasContainer.value.clientHeight

    // 既存のステージがあれば破棄
    if (stageRef.value) stageRef.value.destroy()

    const stage = new Konva.Stage({
        container: canvasContainer.value,
        width,
        height,
    })

    const layer = new Konva.Layer()
    stage.add(layer)

    stageRef.value = stage
    layerRef.value = layer
}

// ------------------------------------
// ランダム都市生成
// ------------------------------------
const generateRandomCities = (count: number): City[] => {
    const width = stageRef.value?.width() ?? 800
    const height = stageRef.value?.height() ?? 600
    const cities: City[] = []
    const minDistance = 7 // 重なり防止

    while (cities.length < count) {
        const x = Math.random() * (width - 40) + 20
        const y = Math.random() * (height - 40) + 20

        // 既存座標と重複チェック
        if (!cities.some((c) => Math.hypot(c.x - x, c.y - y) < minDistance)) {
            cities.push({ x, y })
        }
    }

    return cities
}

// ------------------------------------
// 都市描画
// ------------------------------------
const drawCities = (cities: City[]) => {
    if (!layerRef.value) return

    layerRef.value.destroyChildren() // 一旦クリア

    console.log('drawCities')

    cities.forEach((city) => {
        const circle = new Konva.Circle({
            x: city.x,
            y: city.y,
            radius: 3,
            fill: 'red',
            stroke: '#666',
            strokeWidth: 1,
        })
        layerRef.value?.add(circle)
    })

    layerRef.value.draw()
}

// ------------------------------------
// 2点間に線を引く
// ------------------------------------
const drawLineBetweenPoints = (a: City, b: City) => {
    if (!layerRef.value) return

    const line = new Konva.Line({
        points: [a.x, a.y, b.x, b.y],
        stroke: 'black',
        strokeWidth: 1,
        lineCap: 'round',
        lineJoin: 'round',
    })

    layerRef.value.add(line)
}

// ------------------------------------
// ランダム経路を描画
// ------------------------------------
/*
const drawRandomRoute = (cities: City[]) => {
    if (!layerRef.value || cities.length === 0) return

    // ランダム順にシャッフル
    const shuffled = [...cities].sort(() => Math.random() - 0.5)

    // 各都市を順番に線で結ぶ
    for (let i = 0; i < shuffled.length - 1; i++) {
        const a = shuffled[i]
        const b = shuffled[i + 1]
        drawLineBetweenPoints(a, b)
    }

    // 最後の都市→最初の都市で閉じる
    drawLineBetweenPoints(shuffled[shuffled.length - 1], shuffled[0])

    layerRef.value.batchDraw()

    // 総距離を計算して反映
    totalDistance.value = calcTotalDistance(shuffled)
}
*/

// ---------------------------
// 任意順で経路を描画する汎用関数
// ---------------------------
const drawRoute = (cities: City[], order: number[]) => {
    if (!layerRef.value) return
    layerRef.value.destroyChildren()

    // 都市を再描画
    cities.forEach((city) => {
        const circle = new Konva.Circle({
            x: city.x,
            y: city.y,
            radius: 3,
            fill: 'red',
            stroke: '#666',
            strokeWidth: 1,
        })
        layerRef.value?.add(circle)
    })

    // 経路を描画
    for (let i = 0; i < order.length - 1; i++) {
        const a = cities[order[i]]
        const b = cities[order[i + 1]]
        drawLineBetweenPoints(a, b)
    }
    // 最後→最初で閉じる
    const first = cities[order[0]]
    const last = cities[order[order.length - 1]]
    drawLineBetweenPoints(last, first)

    layerRef.value.batchDraw()
}

// ---------------------------
// メイン実行
// ---------------------------
const startSalesMan = async () => {
    isStart.value = true
    isEnd.value = false
    elapsedTime.value = 0
    totalDistance.value = 0
    progress.value = 0

    const cities = generateRandomCities(cityNum.value)
    drawCities(cities)

    // 🟥 まず初期ランダム経路を表示
    const shuffled = [...Array(cities.length).keys()].sort(
        () => Math.random() - 0.5,
    )
    drawRoute(cities, shuffled)

    // ✅ 初期総距離を計算・表示しておく
    initialDistance.value = calcTotalDistance(shuffled.map((i) => cities[i]))
    totalDistance.value = initialDistance.value

    // 〇秒間初期状態を見せる
    await new Promise((resolve) => setTimeout(resolve, 2000))

    isCalculating.value = true

    // 既存Workerがあれば終了
    if (workerRef.value) {
        workerRef.value.terminate()
    }

    // ✅ Worker生成
    if (calcEngine.value === 1) {
        workerRef.value = new Worker(
            new URL('@/workers/salesmanWorker.ts', import.meta.url),
            { type: 'module' },
        )
    } else if (calcEngine.value === 2) {
        workerRef.value = new Worker(
            new URL('@/workers/salesmanRustWorker.ts', import.meta.url),
            { type: 'module' },
        )
    }

    const startTime = performance.now()

    // ✅ メッセージ受信
    workerRef.value!.onmessage = (e: MessageEvent) => {
        let data = e.data

        // 🧩 Rustからの返却が文字列（JSON文字列）の場合に対応
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data)
            } catch (err) {
                console.error('[RustWorker] JSON parse error:', err)
                return
            }
        }

        console.log('data:', data)

        // 🧩 Rust版Worker対応（typeが存在しない場合）
        if (!data.type && data.distance && data.route) {
            drawRoute(cities, data.route)
            totalDistance.value = data.distance
            elapsedTime.value = performance.now() - startTime
            isCalculating.value = false
            isStart.value = false
            isEnd.value = true
            workerRef.value?.terminate()
            workerRef.value = null
            progress.value = 1
            return
        }

        // 🧩 JS版Worker対応（typeがprogress/done）
        if (data.type === 'progress') {
            drawRoute(cities, data.route)
            totalDistance.value = data.distance
            elapsedTime.value = performance.now() - startTime
            progress.value = data.progress
        } else if (data.type === 'done') {
            drawRoute(cities, data.route)
            totalDistance.value = data.distance
            elapsedTime.value = data.elapsedTime
            isCalculating.value = false
            isStart.value = false
            isEnd.value = true
            workerRef.value?.terminate()
            workerRef.value = null
            progress.value = 1
        }
    }

    // ✅ 都市データ送信（計算開始）
    workerRef.value!.postMessage({ cities })
}

onMounted(async () => {
    await nextTick()
    initCanvas()
    console.log('mounted and canvas initialized')
})
</script>

<template>
    <div class="SalesMan">
        <div class="SalesMan__inputWrap">
            <label class="SalesMan__cityNumLable">
                <span class="SalesMan__cityNumText">都市の数：</span
                ><input
                    class="SalesMan__cityNumInput"
                    id="cityNum"
                    type="number"
                    min="5"
                    placeholder="5以上"
                    :disabled="isStart"
                    v-model="cityNum"
            /></label>

            <div class="SalesMan__engineWrap">
                <p>計算方法：</p>
                <ul class="SalesMan__engines">
                    <li>
                        <Radio
                            id="engine1"
                            name="engine"
                            text="js"
                            :value="1"
                            :isDisabled="isStart"
                            v-model="calcEngine"
                        />
                    </li>
                    <li>
                        <Radio
                            id="engine2"
                            name="engine"
                            text="rust"
                            :value="2"
                            :isDisabled="isStart"
                            v-model="calcEngine"
                        />
                    </li>
                </ul>
            </div>
        </div>

        <Button
            class="SalesMan__startButton"
            color="blue"
            text="開始"
            :isDisabled="isStart"
            @click="startSalesMan()"
        />

        <p class="SalesMan__nowStatus">
            最初の総距離：{{ initialDistance.toFixed(2) }}<br />
            現在の総距離：{{ totalDistance.toFixed(2) }}<br />
            経過時間：{{ (elapsedTime / 1000).toFixed(2) }} 秒
        </p>
        <div class="SalesMan__canvas" id="canvas" ref="canvasContainer"></div>
        <p class="SalesMan__calcNews">
            <span v-if="isStart && isCalculating">計算中</span
            ><span v-if="isEnd && !isCalculating">計算終了</span>
        </p>
    </div>
</template>

<style lang="scss" scoped>
.SalesMan {
    &__inputWrap {
        display: flex;
        align-items: center;
        column-gap: 16px;
        row-gap: 16px;
        flex-wrap: wrap;
    }

    &__cityNumLable {
        display: flex;
        align-items: center;
    }

    &__cityNumText {
        flex-shrink: 0;
    }

    &__cityNumInput[type='number']:not(.el-input__inner) {
        width: 88px;
        flex-shrink: 0;
    }

    &__engineWrap {
        display: flex;
        align-items: center;
        column-gap: 8px;
    }

    &__engines {
        display: flex;
        column-gap: 12px;
        align-items: center;
    }

    & &__startButton {
        margin: 16px auto;
    }

    &__canvas {
        width: 100%;
        height: 500px;
        border: 1px solid #333;
    }

    &__nowStatus {
        margin: 16px 0;
        font-weight: bold;
    }

    &__calcNews {
        margin: 12px 0 0;
    }

    &__progressBar {
        width: 100%;
        height: 8px;
        background: #eee;
        border-radius: 4px;
        overflow: hidden;
        margin-top: 6px;
    }

    &__progressInner {
        height: 100%;
        background: linear-gradient(90deg, #4facfe, #00f2fe);
        transition: width 0.1s linear;
    }

    @media screen and (max-width: 740px) {
        &__canvas {
            height: 380px;
        }
    }
}
</style>
