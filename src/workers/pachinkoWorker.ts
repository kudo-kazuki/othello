/* --------------------------------------------------
 * Web Worker 側スクリプト
 *  - メインスレッドから userInput を受け取り、
 *    simulatePachinko() を実行して結果を返すだけ
 * --------------------------------------------------*/

/// <reference lib="webworker" />

/// <reference lib="webworker" />
import {
    createInitialSimulationState,
    createInitialOnceState,
    simulateOnceCore,
    BALLS_PER_1000_YEN,
} from '@/logics/pachinko'
import {
    UserInput,
    SimulationState,
    OnceSimulationState,
} from '@/types/pachinko'

interface WorkerMsg {
    userInput: UserInput
    batch?: number // 何回ごとに progress を返すか (default 100)
}

declare const self: DedicatedWorkerGlobalScope

self.onmessage = (e: MessageEvent<WorkerMsg>) => {
    const { userInput, batch = 100 } = e.data

    const sim: SimulationState = createInitialSimulationState()
    const once: OnceSimulationState = createInitialOnceState()

    const totalRuns = userInput.jackpotAttempts ?? 0
    sim.isSimulationStart = true
    sim.remainingSimulations = totalRuns
    sim.hasMoney = userInput.startingMoney ?? 0
    sim.hasMoney -= 1000
    sim.hasBalls = BALLS_PER_1000_YEN

    const costPerSpin = (() => {
        const avg = userInput.avgSpinsPer1000yen ?? 0
        return avg ? BALLS_PER_1000_YEN / avg : 0
    })()

    let totalRushChain = 0

    for (let i = 0; i < totalRuns; i++) {
        const rush = simulateOnceCore(userInput, sim, once, costPerSpin)
        totalRushChain += rush
        sim.currentSimulationCount++
        sim.remainingSimulations = totalRuns - (i + 1)

        if ((i + 1) % batch === 0) {
            self.postMessage({ type: 'progress', payload: { ...sim } })
        }
    }

    const spinsFreq = sim.frequencySpinsFirstJackpotItems
    const spinValues: number[] = []
    let sumSpins = 0
    Object.entries(spinsFreq).forEach(([k, v]) => {
        const spin = Number(k)
        const freq = v as number
        sumSpins += spin * freq
        for (let j = 0; j < freq; j++) spinValues.push(spin)
    })
    const n = spinValues.length
    spinValues.sort((a, b) => a - b)
    const mean = n ? sumSpins / n : 0
    const median = n
        ? n % 2
            ? spinValues[(n - 1) / 2]
            : (spinValues[n / 2 - 1] + spinValues[n / 2]) / 2
        : 0
    const varSpins = n
        ? spinValues.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n
        : 0

    sim.avgSpinsFirstJackpot = mean
    sim.medianSpinsFirstJackpot = median
    sim.varSpinsFirstJackpot = varSpins
    sim.stdDevSpinsFirstJackpot = Math.sqrt(varSpins)
    sim.avgKakuhenJackpotChain = totalRuns ? totalRushChain / totalRuns : 0
    sim.isSimulationEnd = true

    self.postMessage({ type: 'done', payload: sim })
}
