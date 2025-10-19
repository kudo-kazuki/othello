<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWindowHeight } from '@/composables/useWindowHeight'
import { useWindowWidthAndDevice } from '@/composables/useWindowWidthAndDevice'

const { windowHeight } = useWindowHeight()
const { windowWidth, deviceType } = useWindowWidthAndDevice()

const desiredSeatCount = ref(1)
const totalSeatCount = ref(1)
const remainingSeatCount = ref(0)

// 組み合わせ計算関数
function combination(n: number, r: number): number {
    if (r > n) return 0
    if (r === 0 || r === n) return 1
    let result = 1
    for (let i = 1; i <= r; i++) {
        result = (result * (n - i + 1)) / i
    }
    return result
}

const probability = computed(() => {
    const n = totalSeatCount.value
    const r = remainingSeatCount.value // 残り席数
    const d = desiredSeatCount.value

    if (n <= 0 || d <= 0) return 0
    if (r < 0 || r > n) return 0
    if (d > n) return 0

    const o = n - r // 埋まってる数に変換

    // 埋まってる席数が希望席数より少ない場合、
    // 全部埋まることは不可能 ⇒ 確率100%
    if (o < d) return 100

    const totalWays = combination(n, o)
    const allDesiredOccupiedWays = combination(n - d, o - d)

    const pAllDesiredOccupied = allDesiredOccupiedWays / totalWays
    const pAtLeastOneFree = 1 - pAllDesiredOccupied

    return pAtLeastOneFree * 100
})

type SeatVarName = 'desiredSeatCount' | 'totalSeatCount' | 'remainingSeatCount'

const seatVars: Record<SeatVarName, typeof desiredSeatCount> = {
    desiredSeatCount,
    totalSeatCount,
    remainingSeatCount,
}

const arithmetic = (name: SeatVarName, method: 'plus' | 'minus') => {
    const target = seatVars[name]

    // 各変数の最小値
    const minValues: Record<SeatVarName, number> = {
        desiredSeatCount: 1,
        totalSeatCount: 1,
        remainingSeatCount: 0,
    }

    // 各変数の最大値（nullなら制限なし）
    const maxValues: Record<SeatVarName, number | null> = {
        desiredSeatCount: totalSeatCount.value,
        totalSeatCount: null,
        remainingSeatCount: totalSeatCount.value,
    }

    if (method === 'plus') {
        const max = maxValues[name]
        if (max === null || target.value < max) {
            target.value++
        }
    } else {
        if (target.value > minValues[name]) {
            target.value--
        }
    }
}

const reset = () => {
    totalSeatCount.value = 1
    remainingSeatCount.value = 0
    desiredSeatCount.value = 1
    return false
}

const runSimu = (num: number) => {
    if (num === 14) {
        totalSeatCount.value = 14
        desiredSeatCount.value = 3
    }

    if (num === 12) {
        totalSeatCount.value = 12
        desiredSeatCount.value = 1
    }

    if (num === 8) {
        totalSeatCount.value = 8
        desiredSeatCount.value = 4
    }

    return false
}
</script>

<template>
    <div
        class="Page"
        :style="{ height: `${windowHeight}px` }"
        :data-device="deviceType"
        :data-windowWidth="windowWidth"
    >
        <ul class="Page__inputItems">
            <li class="Page__inputItem">
                <label class="Page__inputItemLabel" for="totalSeatCount"
                    >全体の席の数</label
                >
                <input
                    class="Page__input"
                    id="totalSeatCount"
                    type="number"
                    min="1"
                    v-model="totalSeatCount"
                />
                <div class="Page__buttons">
                    <button
                        class="Page__button"
                        @click="arithmetic('totalSeatCount', 'plus')"
                    >
                        ＋
                    </button>
                    <button
                        class="Page__button Page__button--minus"
                        @click="arithmetic('totalSeatCount', 'minus')"
                    >
                        －
                    </button>
                </div>
            </li>
            <li class="Page__inputItem">
                <label class="Page__inputItemLabel" for="desiredSeatCount"
                    >座りたい席の数</label
                >
                <input
                    class="Page__input"
                    id="desiredSeatCount"
                    type="number"
                    min="1"
                    v-model="desiredSeatCount"
                />
                <div class="Page__buttons">
                    <button
                        class="Page__button"
                        @click="arithmetic('desiredSeatCount', 'plus')"
                    >
                        ＋
                    </button>
                    <button
                        class="Page__button Page__button--minus"
                        @click="arithmetic('desiredSeatCount', 'minus')"
                    >
                        －
                    </button>
                </div>
            </li>

            <li class="Page__inputItem">
                <label class="Page__inputItemLabel" for="remainingSeatCount"
                    >残り席数</label
                >
                <input
                    class="Page__input"
                    id="remainingSeatCount"
                    type="number"
                    min="0"
                    v-model="remainingSeatCount"
                />
                <div class="Page__buttons">
                    <button
                        class="Page__button"
                        @click="arithmetic('remainingSeatCount', 'plus')"
                    >
                        ＋
                    </button>
                    <button
                        class="Page__button Page__button--minus"
                        @click="arithmetic('remainingSeatCount', 'minus')"
                    >
                        －
                    </button>
                </div>
            </li>
        </ul>

        <p class="Page__resetButtonWrap">
            <button class="Page__resetButton" @click="reset()">リセット</button>
        </p>

        <div class="Page__result">{{ probability }}%</div>

        <div style="margin-top: 30px">
            <ul>
                <li>
                    <a href="" @click.prevent="runSimu(14)">14</a>
                </li>
                <li>
                    <a href="" @click.prevent="runSimu(12)">12</a>
                </li>
                <li>
                    <a href="" @click.prevent="runSimu(8)">8</a>
                </li>
            </ul>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.Page {
    overflow: hidden;
    height: 100vh;
    padding: 12px;

    &__inputItems {
        display: flex;
        flex-direction: column;
        row-gap: 12px;
    }

    &__inputItem {
        display: flex;
        align-items: center;
    }

    &__inputItemLabel {
        width: 140px;
        flex-shrink: 0;
    }

    &__input[type='number'] {
        width: 88px;
    }

    &__buttons {
        display: flex;
        align-items: center;
        column-gap: 16px;
        margin-left: auto;
    }

    &__button {
        display: flex;
        justify-content: center;
        align-items: center;
        $size: 36px;
        width: $size;
        height: $size;
        font-size: 24px;
        font-weight: bold;
        border: 1px solid #333;
        border-radius: 50%;
        line-height: 0;
        background-color: blue;
        color: #fff;

        &--minus {
            background-color: crimson;
        }
    }

    &__resetButtonWrap {
        margin: 16px 0 0;
        display: flex;
        justify-content: flex-end;
    }

    &__resetButton {
        border: 1px solid #111;
        border-radius: 10px;
        padding: 2px 8px;
        font-size: 12px;
    }

    &__result {
        padding-top: 16px;
        margin-top: 16px;
        border-top: 1px solid #333;
        font-size: 24px;
    }

    @media screen and (max-width: 740px) {
    }
}
</style>
