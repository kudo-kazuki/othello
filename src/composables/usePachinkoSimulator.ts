/* --------------------------------------------------
 * src/composables/usePachinkoSimulator.ts
 * --------------------------------------------------
 * Vue 3 用コンポーザブル。
 *  - Web Worker で streaming 実行 (progress / done)
 *  - isCalculating フラグで「計算中です」を制御
 * --------------------------------------------------*/

import { ref, computed, onUnmounted } from 'vue'
import {
    UserInput,
    SimulationState,
    OnceSimulationState,
} from '@/types/pachinko'
import {
    createInitialSimulationState,
    simulatePachinko,
} from '@/logics/pachinko'

export const usePachinkoSimulator = () => {
    const userInput = ref<UserInput>({})
    const simulationState = ref<SimulationState>(createInitialSimulationState())
    const onceSimulationState = ref<OnceSimulationState>({
        mode: 'normal',
        currentSpins: 0,
        currentKakuhenJackpotChain: 0,
        maxMissSpinsInKakuhen: 0,
        minMissSpinsInKakuhen: 0,
    })
    const isCalculating = ref(false)

    const BALLS_PER_1000_YEN = 250
    const costPerSpin = computed(() => {
        const avg = userInput.value.avgSpinsPer1000yen ?? 0
        return avg ? BALLS_PER_1000_YEN / avg : 0
    })

    /* ---------- Worker --------- */
    let worker: Worker | null = null
    const ensureWorker = () => {
        if (worker) return worker
        worker = new Worker(
            new URL('@/workers/pachinkoWorker.ts', import.meta.url),
            { type: 'module' },
        )
        worker.onmessage = (e: MessageEvent) => {
            const { type, payload } = e.data
            if (type === 'progress') {
                simulationState.value = payload as SimulationState
            } else if (type === 'done') {
                simulationState.value = payload as SimulationState
                isCalculating.value = false
            }
        }
        worker.onerror = (e) => {
            console.error('Worker Error', e)
            isCalculating.value = false
        }
        return worker
    }

    onUnmounted(() => {
        worker?.terminate()
        worker = null
    })

    /* ---------- Helpers ---------- */
    const resetOnce = () => {
        onceSimulationState.value = {
            mode: 'normal',
            currentSpins: 0,
            currentKakuhenJackpotChain: 0,
            maxMissSpinsInKakuhen: 0,
            minMissSpinsInKakuhen: 0,
        }
    }

    const startSimulation = () => {
        simulationState.value = createInitialSimulationState()
        simulationState.value.isSimulationStart = true
        resetOnce()
    }

    /* ---------- Public API ---------- */
    const simulateAll = () => {
        isCalculating.value = true
        startSimulation()
        ensureWorker().postMessage({
            userInput: { ...userInput.value },
            batch: 100,
        })
    }

    const simulateOnce = () => {
        const input: UserInput = { ...userInput.value, jackpotAttempts: 1 }
        simulationState.value = simulatePachinko(input)
        // onceSimulationState を軽く反映
        onceSimulationState.value.currentSpins =
            simulationState.value.avgSpinsFirstJackpot
    }

    const spinNormal = () => console.warn('spinNormal は利用不可です')
    const spinDenSupports = () => console.warn('spinDenSupports は利用不可です')

    return {
        userInput,
        simulationState,
        onceSimulationState,
        isCalculating,
        costPerSpin,
        startSimulation,
        simulateAll,
        simulateOnce,
        spinNormal,
        spinDenSupports,
    }
}
