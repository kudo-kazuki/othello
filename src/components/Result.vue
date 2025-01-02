<script setup lang="ts">
import { useGameStore } from '@/stores/game'
const gameStore = useGameStore()
</script>

<template>
    <div class="Result">
        <div class="Result__inner">
            <p class="Result__end">終了</p>

            <p
                v-if="gameStore.blackStoneCount === gameStore.whiteStoneCount"
                class="Result__hikiwake"
            >
                引き分け
            </p>
            <p v-else class="Result__winingInfo">
                <span>{{ gameStore.humanIsWinning ? 'あなた' : 'CPU' }}</span
                >の
                <span v-if="gameStore.humanIsWinning" class="Result__resultText"
                    >勝ち</span
                >
                <span v-else class="Result__resultText Result__resultText--lose"
                    >負け</span
                >
            </p>

            <div class="Result__count">
                <p>黒：{{ gameStore.blackStoneCount }}個</p>
                <p>白：{{ gameStore.whiteStoneCount }}個</p>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.Result {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    padding: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 9999;

    &__inner {
        padding: 40px;
        background-color: #fff;
        border-radius: 10px;
        text-align: center;
    }

    &__end {
        font-size: 120px;
        text-align: center;
        line-height: 0.95em;
        font-weight: bold;
        color: transparent;
        background-color: #fff;
        background-image: repeating-linear-gradient(
                0deg,
                rgba(13, 71, 161, 0.6) 0px 6px,
                /*青*/ rgba(255, 255, 255, 0.6) 6px 8px,
                /*白*/ rgba(13, 71, 161, 0.6) 8px 10px,
                /*青*/ rgba(255, 214, 0, 0.6) 10px 12px,
                /*黄*/ rgba(13, 71, 161, 0.6) 12px 18px,
                /*青*/ rgba(213, 0, 0, 0.6) 18px 34px /*赤*/
            ),
            repeating-linear-gradient(
                90deg,
                rgba(13, 71, 161, 1) 0px 6px,
                /*青*/ rgba(255, 255, 255, 1) 6px 8px,
                /*白*/ rgba(13, 71, 161, 1) 8px 10px,
                /*青*/ rgba(255, 214, 0, 1) 10px 12px,
                /*黄*/ rgba(13, 71, 161, 1) 12px 18px,
                /*青*/ rgba(213, 0, 0, 1) 18px 34px /*赤*/
            );
        -webkit-background-clip: text;
        -webkit-text-stroke: 1px #000;
        margin-bottom: 30px;
    }

    &__hikiwake {
        font-size: 40px;
        font-weight: bold;
        color: #666;
    }

    &__winingInfo {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
    }

    &__resultText {
        font-size: 40px;
        color: crimson;
        font-weight: bold;
        margin-left: 8px;

        &--lose {
            color: darkgray;
        }
    }

    &__count {
        font-size: 20px;
        margin-top: 16px;
    }
}
</style>
