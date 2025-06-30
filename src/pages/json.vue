<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useWindowHeight } from '@/composables/useWindowHeight'
import { useWindowWidthAndDevice } from '@/composables/useWindowWidthAndDevice'

const { windowHeight } = useWindowHeight()
const { windowWidth, deviceType } = useWindowWidthAndDevice()

/* ---------- state ---------- */
const input = ref('')
const isDynamoDB = ref(false)
const output = ref('')
const parseError = ref<string | null>(null)

/* ---------- DynamoDB → 普通の JSON に変換 ---------- */
const convertDynamo = (v: any): any => {
    // 配列はそのまま要素ごとに再帰
    if (Array.isArray(v)) return v.map(convertDynamo)

    // オブジェクトなら中身をチェック
    if (v && typeof v === 'object') {
        const keys = Object.keys(v)

        // ★ DynamoDBラッパー判定：キーが1つ かつ AttributeValue タグ
        if (
            keys.length === 1 &&
            ['S', 'N', 'BOOL', 'NULL', 'L', 'M', 'SS', 'NS', 'BS'].includes(
                keys[0],
            )
        ) {
            const type = keys[0]
            const val = (v as any)[type]

            switch (type) {
                case 'S':
                case 'BOOL':
                    return val
                case 'N':
                    return Number(val)
                case 'NULL':
                    return null
                case 'L':
                    return Array.isArray(val) ? val.map(convertDynamo) : val
                case 'M':
                    return convertDynamo(val) // val はオブジェクト
                case 'SS':
                case 'NS':
                case 'BS':
                    return Array.isArray(val) ? val : [] // セット型は配列で返却
                default:
                    return v
            }
        }

        // ★ それ以外（複数キーなど）は通常のオブジェクトとして各値を再帰変換
        return Object.fromEntries(
            Object.entries(v).map(([k, vv]) => [k, convertDynamo(vv)]),
        )
    }

    // プリミティブ型はそのまま
    return v
}

/* ---------- 出力を再計算する関数 ---------- */
const updateOutput = (): void => {
    if (!input.value.trim()) {
        output.value = ''
        parseError.value = null
        return
    }

    try {
        const raw = JSON.parse(input.value)
        const result = isDynamoDB.value ? convertDynamo(raw) : raw
        output.value = JSON.stringify(result, null, 2)
        parseError.value = null
    } catch (e: any) {
        output.value = ''
        parseError.value = e.message
    }
}

/* ---------- watch: input と isDynamoDB を監視 ---------- */
watch([input, isDynamoDB], updateOutput, { immediate: true })

const clear = () => {
    input.value = ''
}

const toastRef = ref<HTMLElement | null>(null)
const showToast = ref(false)
const toastX = ref(0)
const toastY = ref(0)
const copy = async (e: MouseEvent) => {
    try {
        await navigator.clipboard.writeText(output.value)

        // 初期位置：クリック座標
        toastX.value = e.clientX
        toastY.value = e.clientY

        // アニメーションをリセット
        showToast.value = false
        await nextTick() // 旧要素が外れる
        showToast.value = true
        await nextTick() // ★トーストが DOM に載る

        // DOM が確実にある状態で幅を測定
        if (toastRef.value) {
            const { width } = toastRef.value.getBoundingClientRect()
            const padding = 16
            const maxX = window.innerWidth - padding - width
            toastX.value = Math.min(toastX.value, maxX)
        }

        // 秒後にフェードアウト
        setTimeout(() => (showToast.value = false), 500)
    } catch (err) {
        console.error('コピー失敗:', err)
    }
}
</script>

<template>
    <div
        class="Page"
        :style="{ height: `${windowHeight}px` }"
        :data-device="deviceType"
        :data-windowWidth="windowWidth"
    >
        <main class="Page__inner">
            <h1>
                json整形
                <Button
                    text="クリア"
                    color="blue"
                    size="s"
                    @click="clear()"
                ></Button>
            </h1>

            <div class="Page__contents">
                <div class="Page__contentsInput">
                    <el-scrollbar always>
                        <div class="Page__contentsInputInner">
                            <p class="Page__title">入力</p>
                            <textarea
                                class="Page__inputTextarea"
                                v-model="input"
                                id="input"
                            ></textarea>
                        </div>
                    </el-scrollbar>
                </div>
                <div class="Page__contentsInput">
                    <el-scrollbar always>
                        <div class="Page__contentsInputInner">
                            <div class="Page__title Page__title--output">
                                <span>出力</span>
                                <label class="Page__optionLabel"
                                    ><input
                                        type="checkbox"
                                        v-model="isDynamoDB"
                                    />DynamoDB形式を元に戻す</label
                                >
                                <Button
                                    class="Page__copyButton"
                                    text="コピー"
                                    color="orange"
                                    size="s"
                                    @click="copy($event)"
                                ></Button>
                            </div>
                            <textarea
                                id="output"
                                class="Page__outputTextarea"
                                >{{ output }}</textarea
                            >
                            <p v-if="parseError" class="Page__error">
                                ⚠️ {{ parseError }}
                            </p>
                        </div>
                    </el-scrollbar>
                </div>
            </div>
        </main>

        <Teleport to="body">
            <transition name="fade">
                <div
                    v-if="showToast"
                    ref="toastRef"
                    class="Page__toast"
                    :style="{ top: toastY + 'px', left: toastX + 'px' }"
                >
                    コピーしました。
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<style lang="scss" scoped>
.Page {
    overflow: hidden;
    height: 100vh;
    display: flex;
    flex-direction: column;

    h1 {
        padding: 12px 16px 0;
        display: flex;
        column-gap: 16px;
    }

    &__inner {
        margin: 0 auto;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    &__contents {
        display: flex;
        height: 100%;
        overflow: hidden;
    }

    &__contentsInput {
        width: 50%;
    }

    &__contentsInputInner {
        padding: 16px;
    }

    &__inputTextarea,
    &__outputTextarea {
        height: 70vh;
        resize: vertical;
        margin-top: 12px;
    }

    &__error {
        margin-top: 16px;
    }

    &__title {
        display: flex;
        font-size: 20px;
        align-items: center;
    }

    &__optionLabel {
        margin-left: 12px;
        cursor: pointer;
        font-size: 16px;

        input {
            margin-right: 4px;
        }
    }

    & &__copyButton {
        margin-left: auto;
    }

    &__toast {
        width: 160px;
        position: fixed;
        top: 10px;
        left: 10px;
        background-color: #28a746;
        color: #fff;
        font-weight: bold;
        padding: 8px 16px;
        border-radius: 8px;
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
        pointer-events: none;
        z-index: 9999;
    }

    @media screen and (max-width: 740px) {
        &__cpuThinking {
            font-size: var.vw(70);
        }
    }
}

/* フェード用トランジション */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
