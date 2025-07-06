import { ref } from 'vue'
import {
    UserInput,
    SimulationState,
    OnceSimulationState,
} from '@/types/pachinko'

const BALLS_PER_1000_YEN = 250

export const usePachinkoSimulator = () => {
    // 入力フォーム用
    const userInput = ref<UserInput>({})

    /**シミュレーション全体を通しての状態 */
    const simulationState = ref<SimulationState>({
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
        minMissSpins: 0,
        maxMissSpinsInKakuhen: 0,
        minMissSpinsInKakuhen: 0,
        maxKakuhenJackpotChain: 0,
        avgKakuhenJackpotChain: 0,
        frequencySpinsFirstJackpotItems: {},
    })

    const onceSimulationState = ref<OnceSimulationState>({
        mode: 'normal', // 通常 or 時短 or 確変
        currentSpins: 0, // 現在の回転数（時短 or 確変突入時は0にリセット）
        currentKakuhenJackpotChain: 0, // 現在の確変中の大当たり連続回数
        maxMissSpinsInKakuhen: 0,
        minMissSpinsInKakuhen: 0,
    })

    const startSimulation = () => {
        simulationState.value.isSimulationStart = true
        simulationState.value.hasMoney = userInput.value.startingMoney ?? 0
        simulationState.value.hasMoney -= 1000
        simulationState.value.hasBalls = BALLS_PER_1000_YEN
        simulationState.value.currentSimulationCount = 0
    }

    /* --------------------------------------------------
     * ④ 計算キャッシュ（computed）
     * --------------------------------------------------*/
    const costPerSpin = computed<number>(() => {
        const avg = userInput.value.avgSpinsPer1000yen ?? 0
        return avg ? BALLS_PER_1000_YEN / avg : 0
    })

    /* --------------------------------------------------
     * ④ 乱数・ユーティリティ
     * --------------------------------------------------*/
    const rng = (() => {
        const buf = new Uint32Array(1) // 32bit 乱数バッファ
        const max = 0xffffffff // 2^32 - 1

        return (): number => {
            crypto.getRandomValues(buf) // CSPRNG で値を埋める
            return buf[0] / (max + 1) // 0 <= x < 1 の浮動小数に正規化
        }
    })()

    const randomizedBallCost = (perSpin: number): number => {
        const int = Math.floor(perSpin)
        const frac = perSpin - int
        return rng() < frac ? int + 1 : int
    }

    // 玉を消費し、マイナスになれば 250 発補充して所持金を減算
    const consumeBalls = (balls: number) => {
        simulationState.value.hasBalls -= balls
        if (simulationState.value.hasBalls < 0) {
            const deficit = -simulationState.value.hasBalls
            const refill = BALLS_PER_1000_YEN - deficit
            const pricePerBall = userInput.value.pricePerBall ?? 0
            // 投資額更新
            simulationState.value.totalPayout += refill * pricePerBall
            simulationState.value.hasMoney -= refill * pricePerBall
            simulationState.value.hasBalls += refill
        }
    }

    const chance = (percent: number): boolean => rng() < percent / 100

    /* --------------------------------------------------
     * 初当たり統計更新 helper
     * --------------------------------------------------*/
    const updateFirstHitStats = (spins: number) => {
        const freq = simulationState.value.frequencySpinsFirstJackpotItems
        freq[spins] = (freq[spins] || 0) + 1
        if (spins > simulationState.value.maxMissSpins)
            simulationState.value.maxMissSpins = spins
        if (spins < simulationState.value.minMissSpins)
            simulationState.value.minMissSpins = spins
    }

    /* --------------------------------------------------
     * 通常時に 1 回転させる関数
     * --------------------------------------------------*/
    const spinNormal = (): boolean => {
        const jackpotProb = userInput.value.jackpotProbability
            ? 1 / userInput.value.jackpotProbability
            : 0

        if (!costPerSpin.value || !jackpotProb) return false

        // ❶ 玉を消費
        consumeBalls(randomizedBallCost(costPerSpin.value))

        // ❷ 回転数カウント
        onceSimulationState.value.currentSpins += 1

        // ❸ 当たり判定
        return rng() < jackpotProb
    }

    /* --------------------------------------------------
     * ⑦ 電サポ中 1 回転（jitan / kakuhen 共通）
     *    - 1/20 で玉を 1 個消費
     *    - jitan モードなら通常確率、kakuhen モードなら高確率
     * --------------------------------------------------*/
    const spinDenSupports = (): boolean => {
        // 1/20 で 1 発消費
        if (rng() < 1 / 20) consumeBalls(1)

        // モードに応じた確率
        let hitProb = 0
        if (onceSimulationState.value.mode === 'jitan') {
            hitProb = userInput.value.jackpotProbability
                ? 1 / userInput.value.jackpotProbability
                : 0
        } else if (onceSimulationState.value.mode === 'kakuhen') {
            hitProb = userInput.value.kakuhenJackpotProbability
                ? 1 / userInput.value.kakuhenJackpotProbability
                : 0
        }

        onceSimulationState.value.currentSpins += 1
        return rng() < hitProb
    }

    /* --------------------------------------------------
     * ⑧ 1 試行 (simulateOnce)
     * --------------------------------------------------*/
    const simulateOnce = (): number => {
        // reset per‑trial fields
        onceSimulationState.value.mode = 'normal'
        onceSimulationState.value.currentSpins = 0
        onceSimulationState.value.currentKakuhenJackpotChain = 0
        onceSimulationState.value.maxMissSpinsInKakuhen = 0
        onceSimulationState.value.minMissSpinsInKakuhen = 1

        // ****** 通常時 → 初当たり ******
        while (!spinNormal()) {}
        const spinsToFirst = onceSimulationState.value.currentSpins
        updateFirstHitStats(spinsToFirst)
        // 出玉加算（初当たり）
        simulationState.value.totalPayoutBalls +=
            userInput.value.firstJackpotPayout ?? 0

        // reset spins counter after hit
        onceSimulationState.value.currentSpins = 0

        // ****** 確変 or 時短 ******
        let inRush = chance(userInput.value.kakuhenEntryRate ?? 0)
        onceSimulationState.value.mode = inRush ? 'kakuhen' : 'jitan'
        let remainJitan = userInput.value.jitanModeRounds ?? 0
        let rushChain = 0
        let kakuhenMissCnt = 0

        while (true) {
            const isHit = spinDenSupports()
            if (isHit) {
                // 出玉加算
                if (onceSimulationState.value.mode === 'kakuhen') {
                    simulationState.value.totalPayoutBalls +=
                        userInput.value.avgJackpotPayoutDuringRush ?? 0
                } else {
                    simulationState.value.totalPayoutBalls +=
                        userInput.value.firstJackpotPayout ?? 0
                }

                // ※ 確変中のハマり更新
                if (onceSimulationState.value.mode === 'kakuhen') {
                    if (
                        kakuhenMissCnt >
                        onceSimulationState.value.maxMissSpinsInKakuhen
                    ) {
                        onceSimulationState.value.maxMissSpinsInKakuhen =
                            kakuhenMissCnt
                    }
                    if (
                        kakuhenMissCnt <
                        onceSimulationState.value.minMissSpinsInKakuhen
                    ) {
                        onceSimulationState.value.minMissSpinsInKakuhen =
                            kakuhenMissCnt
                    }
                    kakuhenMissCnt = 0
                }

                // reset spins for next loop
                onceSimulationState.value.currentSpins = 0

                if (onceSimulationState.value.mode === 'kakuhen') {
                    rushChain++
                    if (!chance(userInput.value.kakuhenContinuationRate ?? 0)) {
                        onceSimulationState.value.mode = 'jitan'
                        remainJitan = userInput.value.jitanModeRounds ?? 0
                    }
                } else {
                    if (chance(userInput.value.kakuhenEntryRate ?? 0)) {
                        onceSimulationState.value.mode = 'kakuhen'
                        rushChain = 0
                    } else {
                        remainJitan = userInput.value.jitanModeRounds ?? 0
                    }
                }
            } else {
                if (onceSimulationState.value.mode === 'kakuhen')
                    kakuhenMissCnt++
                if (onceSimulationState.value.mode === 'jitan') {
                    remainJitan--
                    if (remainJitan <= 0) break
                }
            }
        }

        // update global stats
        if (rushChain > simulationState.value.maxKakuhenJackpotChain)
            simulationState.value.maxKakuhenJackpotChain = rushChain
        if (
            onceSimulationState.value.maxMissSpinsInKakuhen >
            simulationState.value.maxMissSpinsInKakuhen
        )
            simulationState.value.maxMissSpinsInKakuhen =
                onceSimulationState.value.maxMissSpinsInKakuhen
        if (
            onceSimulationState.value.minMissSpinsInKakuhen <
            simulationState.value.minMissSpinsInKakuhen
        ) {
            simulationState.value.minMissSpinsInKakuhen =
                onceSimulationState.value.minMissSpinsInKakuhen
        }

        return rushChain
    }

    /* --------------------------------------------------
     * ⑨ 全試行 (simulateAll)
     * --------------------------------------------------*/
    const simulateAll = (): void => {
        startSimulation()

        const totalRuns = userInput.value.jackpotAttempts ?? 0
        let totalRushChain = 0

        for (let i = 0; i < totalRuns; i++) {
            const rushChain = simulateOnce()
            totalRushChain += rushChain
            simulationState.value.currentSimulationCount++
            simulationState.value.remainingSimulations = totalRuns - (i + 1)
        }

        // ---- 統計集計 ----
        const spinsFreq = simulationState.value.frequencySpinsFirstJackpotItems
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

        simulationState.value.avgSpinsFirstJackpot = mean
        simulationState.value.medianSpinsFirstJackpot = median
        simulationState.value.varSpinsFirstJackpot = varSpins
        simulationState.value.stdDevSpinsFirstJackpot = Math.sqrt(varSpins)

        simulationState.value.avgKakuhenJackpotChain = totalRuns
            ? totalRushChain / totalRuns
            : 0
        simulationState.value.isSimulationEnd = true
    }

    /** 呼び出し元へ渡す */
    return {
        userInput,
        simulationState,
        onceSimulationState,
        startSimulation,
        spinNormal, // まずは通常時 1 回転を外から呼び出せるように
        spinDenSupports,
        simulateOnce,
        simulateAll,
    }
}
