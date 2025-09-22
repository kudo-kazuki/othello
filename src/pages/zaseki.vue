<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWindowHeight } from '@/composables/useWindowHeight'
import { useWindowWidthAndDevice } from '@/composables/useWindowWidthAndDevice'

const { windowHeight } = useWindowHeight()
const { windowWidth, deviceType } = useWindowWidthAndDevice()

const desiredSeatCount = ref(1)
const totalSeatCount = ref(1)
const occupiedSeatCount = ref(0)

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
    const o = occupiedSeatCount.value
    const d = desiredSeatCount.value

    // 入力バリデーション
    if (n <= 0 || d <= 0) return 0
    if (o < 0 || o > n) return 0
    if (d > n) return 0

    // o < d のとき「希望席を全部埋める」は不可能 ⇒ 少なくとも1つ空いている確率は1
    if (o < d) return 100

    const totalWays = combination(n, o)
    const allDesiredOccupiedWays = combination(n - d, o - d)

    const pAllDesiredOccupied = allDesiredOccupiedWays / totalWays
    const pAtLeastOneFree = 1 - pAllDesiredOccupied

    return pAtLeastOneFree * 100
})

type SeatVarName = 'desiredSeatCount' | 'totalSeatCount' | 'occupiedSeatCount'

const seatVars: Record<SeatVarName, typeof desiredSeatCount> = {
    desiredSeatCount,
    totalSeatCount,
    occupiedSeatCount,
}

const arithmetic = (name: SeatVarName, method: 'plus' | 'minus') => {
    const target = seatVars[name]

    // 各変数の最小値
    const minValues: Record<SeatVarName, number> = {
        desiredSeatCount: 1,
        totalSeatCount: 1,
        occupiedSeatCount: 0,
    }

    // 各変数の最大値（nullなら制限なし）
    const maxValues: Record<SeatVarName, number | null> = {
        desiredSeatCount: totalSeatCount.value,
        totalSeatCount: null,
        occupiedSeatCount: totalSeatCount.value,
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
    occupiedSeatCount.value = 1
    desiredSeatCount.value = 0
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
                <label class="Page__inputItemLabel" for="occupiedSeatCount"
                    >既に埋まってる<br />席の数</label
                >
                <input
                    class="Page__input"
                    id="occupiedSeatCount"
                    type="number"
                    min="0"
                    v-model="occupiedSeatCount"
                />
                <div class="Page__buttons">
                    <button
                        class="Page__button"
                        @click="arithmetic('occupiedSeatCount', 'plus')"
                    >
                        ＋
                    </button>
                    <button
                        class="Page__button Page__button--minus"
                        @click="arithmetic('occupiedSeatCount', 'minus')"
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
