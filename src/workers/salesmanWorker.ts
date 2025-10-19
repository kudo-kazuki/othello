// salesmanWorker.ts
import { calcTotalDistance } from '@/utility/distance' // 共通距離関数
import type { City } from '@/types/salseman'

// Worker → メインへのメッセージ型
interface ProgressMessage {
    type: 'progress'
    route: number[]
    distance: number
    progress?: number
}

interface DoneMessage {
    type: 'done'
    route: number[]
    distance: number
    elapsedTime: number
}

self.onmessage = async (e: MessageEvent) => {
    const { cities } = e.data as { cities: City[] }

    const start = performance.now()
    let route = [...Array(cities.length).keys()]
    route.sort(() => Math.random() - 0.5)

    let improved = true
    let updateCount = 0
    const updateEvery = Math.max(1, Math.floor(Math.sqrt(cities.length) * 5))
    let totalDistance = calcTotalDistance(route.map((i) => cities[i]))

    while (improved) {
        improved = false

        const totalSteps = ((cities.length - 2) * (cities.length - 1)) / 2
        let stepCount = 0

        for (let i = 1; i < route.length - 2; i++) {
            for (let j = i + 1; j < route.length - 1; j++) {
                stepCount++
                const newOrder = [...route]
                newOrder.splice(
                    i,
                    j - i + 1,
                    ...route.slice(i, j + 1).reverse(),
                )

                const newDist = calcTotalDistance(
                    newOrder.map((idx) => cities[idx]),
                )
                if (newDist < totalDistance) {
                    route = newOrder
                    totalDistance = newDist
                    improved = true
                    updateCount++

                    // 進捗報告を一定間隔で送信
                    if (updateCount % updateEvery === 0) {
                        const progress = Math.min(1, stepCount / totalSteps)

                        const msg: ProgressMessage = {
                            type: 'progress',
                            route,
                            distance: totalDistance,
                            progress,
                        }
                        postMessage(msg)
                    }
                }
            }
        }
    }

    const elapsedTime = performance.now() - start
    const doneMsg: DoneMessage = {
        type: 'done',
        route,
        distance: totalDistance,
        elapsedTime,
    }
    postMessage(doneMsg)
}
