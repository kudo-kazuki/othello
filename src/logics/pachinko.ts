/* --------------------------------------------------
 * src/logics/pachinko.ts
 * --------------------------------------------------
 * Vue 非依存のパチンコシミュレーション純粋ロジック。
 *  - createInitialSimulationState()
 *  - createInitialOnceState()
 *  - simulateOnceCore() : 1 試行だけ進めて状態を破壊的更新
 *  - simulatePachinko() : N 試行まとめて実行（統計値集計込み）
 * --------------------------------------------------*/

import {
    UserInput,
    SimulationState,
    OnceSimulationState,
} from '@/types/pachinko'

/* --------------------------------------------------
 * 定数・ユーティリティ
 * --------------------------------------------------*/
export const BALLS_PER_1000_YEN = 250

export const rng = (() => {
    const buf = new Uint32Array(1)
    const max = 0xffffffff
    return (): number => {
        crypto.getRandomValues(buf)
        return buf[0] / (max + 1)
    }
})()

export const randomizedBallCost = (perSpin: number): number => {
    const int = Math.floor(perSpin)
    const frac = perSpin - int
    return rng() < frac ? int + 1 : int
}

/* --------------------------------------------------
 * 初期化ヘルパ
 * --------------------------------------------------*/
export const createInitialSimulationState = (): SimulationState => ({
    isSimulationStart: false,
    isSimulationEnd: false,
    remainingSimulations: 0,
    currentSimulationCount: 0,
    hasMoney: 0,
    hasBalls: 0,
    totalPayout: 0,
    totalPayoutBalls: 0,
    avgSpinsFirstJackpot: 0,
    medianSpinsFirstJackpot: 0,
    varSpinsFirstJackpot: 0,
    stdDevSpinsFirstJackpot: 0,
    maxMissSpins: 0,
    minMissSpins: Number.POSITIVE_INFINITY,
    maxMissSpinsInKakuhen: 0,
    minMissSpinsInKakuhen: Number.POSITIVE_INFINITY,
    maxKakuhenJackpotChain: 0,
    avgKakuhenJackpotChain: 0,
    frequencySpinsFirstJackpotItems: {},
})

export const createInitialOnceState = (): OnceSimulationState => ({
    mode: 'normal',
    currentSpins: 0,
    currentKakuhenJackpotChain: 0,
    maxMissSpinsInKakuhen: 0,
    minMissSpinsInKakuhen: 1,
})

/* --------------------------------------------------
 * simulateOnceCore : 1 試行のみ進める低レベル API
 *   - sim / once を破壊的に更新
 *   - 戻り値 : rushChain
 * --------------------------------------------------*/
export const simulateOnceCore = (
    userInput: UserInput,
    sim: SimulationState,
    once: OnceSimulationState,
    costPerSpinCached: number,
): number => {
    const chance = (percent: number): boolean => rng() < percent / 100

    const consumeBalls = (balls: number): void => {
        sim.hasBalls -= balls
        if (sim.hasBalls < 0) {
            const deficit = -sim.hasBalls
            const refill = BALLS_PER_1000_YEN - deficit
            const pricePerBall = userInput.pricePerBall ?? 0
            sim.totalPayout += refill * pricePerBall
            sim.hasMoney -= refill * pricePerBall
            sim.hasBalls += refill
        }
    }

    const updateFirstHitStats = (spins: number): void => {
        const freq = sim.frequencySpinsFirstJackpotItems
        freq[spins] = (freq[spins] || 0) + 1
        if (spins > sim.maxMissSpins) sim.maxMissSpins = spins
        if (spins < sim.minMissSpins) sim.minMissSpins = spins
    }

    const spinNormal = (): boolean => {
        const jackpotProb = userInput.jackpotProbability
            ? 1 / userInput.jackpotProbability
            : 0
        if (!costPerSpinCached || !jackpotProb) return false
        consumeBalls(randomizedBallCost(costPerSpinCached))
        once.currentSpins += 1
        return rng() < jackpotProb
    }

    const spinDenSupports = (): boolean => {
        if (rng() < 1 / 20) consumeBalls(1)
        let hitProb = 0
        if (once.mode === 'jitan') {
            hitProb = userInput.jackpotProbability
                ? 1 / userInput.jackpotProbability
                : 0
        } else if (once.mode === 'kakuhen') {
            hitProb = userInput.kakuhenJackpotProbability
                ? 1 / userInput.kakuhenJackpotProbability
                : 0
        }
        once.currentSpins += 1
        return rng() < hitProb
    }

    /* ---------- 1 試行ロジック ---------- */
    once.mode = 'normal'
    once.currentSpins = 0
    once.currentKakuhenJackpotChain = 0
    once.maxMissSpinsInKakuhen = 0
    once.minMissSpinsInKakuhen = 1

    // 通常時で初当たりまで回す
    while (!spinNormal()) {}
    const spinsToFirst = once.currentSpins
    updateFirstHitStats(spinsToFirst)
    {
        const payout = userInput.firstJackpotPayout ?? 0
        sim.totalPayoutBalls += payout
        sim.hasBalls += payout // ★ 出玉を持ち球へ加算
    }
    once.currentSpins = 0

    // 確変 or 時短
    let inRush = chance(userInput.kakuhenEntryRate ?? 0)
    once.mode = inRush ? 'kakuhen' : 'jitan'
    let remainJitan = userInput.jitanModeRounds ?? 0
    let rushChain = 0
    let kakuhenMissCnt = 0

    while (true) {
        const isHit = spinDenSupports()
        if (isHit) {
            // 出玉加算
            let payout = 0
            if (once.mode === 'kakuhen') {
                payout = userInput.avgJackpotPayoutDuringRush ?? 0
            } else {
                payout = userInput.firstJackpotPayout ?? 0
            }
            sim.totalPayoutBalls += payout
            sim.hasBalls += payout // ★ 出玉を持ち球へ加算

            // 確変中ハマり更新
            if (once.mode === 'kakuhen') {
                if (kakuhenMissCnt > once.maxMissSpinsInKakuhen)
                    once.maxMissSpinsInKakuhen = kakuhenMissCnt
                if (kakuhenMissCnt < once.minMissSpinsInKakuhen)
                    once.minMissSpinsInKakuhen = kakuhenMissCnt
                kakuhenMissCnt = 0
            }

            once.currentSpins = 0

            if (once.mode === 'kakuhen') {
                rushChain++
                if (!chance(userInput.kakuhenContinuationRate ?? 0)) {
                    once.mode = 'jitan'
                    remainJitan = userInput.jitanModeRounds ?? 0
                }
            } else {
                if (chance(userInput.kakuhenEntryRate ?? 0)) {
                    once.mode = 'kakuhen'
                    rushChain = 0
                } else {
                    remainJitan = userInput.jitanModeRounds ?? 0
                }
            }
        } else {
            if (once.mode === 'kakuhen') kakuhenMissCnt++
            if (once.mode === 'jitan') {
                remainJitan--
                if (remainJitan <= 0) break
            }
        }
    }

    // グローバル統計更新
    if (rushChain > sim.maxKakuhenJackpotChain)
        sim.maxKakuhenJackpotChain = rushChain
    if (once.maxMissSpinsInKakuhen > sim.maxMissSpinsInKakuhen)
        sim.maxMissSpinsInKakuhen = once.maxMissSpinsInKakuhen
    if (once.minMissSpinsInKakuhen < sim.minMissSpinsInKakuhen)
        sim.minMissSpinsInKakuhen = once.minMissSpinsInKakuhen

    return rushChain
}

/* --------------------------------------------------
 * simulatePachinko : 高レベル API（N 試行まとめて実行）
 * --------------------------------------------------*/
export const simulatePachinko = (userInput: UserInput): SimulationState => {
    const sim = createInitialSimulationState()
    const once = createInitialOnceState()

    // 準備
    const totalRuns = userInput.jackpotAttempts ?? 0
    sim.isSimulationStart = true
    sim.remainingSimulations = totalRuns
    sim.hasMoney = userInput.startingMoney ?? 0
    sim.hasMoney -= 1000 // 開始時に 1k 投資
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
    }

    /* ---- 統計集計 ---- */
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

    return sim
}
