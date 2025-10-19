import type { City } from '@/types/salseman'

// ---------------------------
// 距離計算
// ---------------------------
export const calcTotalDistance = (cities: City[]): number => {
    if (cities.length < 2) return 0

    let total = 0
    for (let i = 0; i < cities.length - 1; i++) {
        const a = cities[i]
        const b = cities[i + 1]
        total += Math.hypot(b.x - a.x, b.y - a.y)
    }

    // 最後の都市→最初の都市で閉じる
    const first = cities[0]
    const last = cities[cities.length - 1]
    total += Math.hypot(first.x - last.x, first.y - last.y)

    return total
}
