<script setup lang="ts">
import {
    createInitialBoard,
    BoardState,
    BLACK,
    WHITE,
    EMPTY,
    StoneColor,
} from '@/logics/board'
import { useGameStore } from '@/stores/game'
const gameStore = useGameStore()

const colorMap: Record<string, string> = {}
colorMap[BLACK] = '黒'
colorMap[WHITE] = '白'
</script>

<template>
    <div class="GameInfo">
        <p>あなた：{{ colorMap[gameStore.humanColor] }}</p>
        <p>
            {{
                gameStore.currentColor === gameStore.humanColor
                    ? 'あなた'
                    : 'CPU'
            }}のターン
        </p>
        <p v-if="gameStore.isCpuThinking">CPU考え中</p>
        <p>黒：{{ gameStore.blackStoneCount }}個</p>
        <p>白：{{ gameStore.whiteStoneCount }}個</p>
        <p>
            <span v-if="gameStore.isGameEnd">ゲーム終了</span
            ><span v-else>{{ gameStore.turn }}ターン目</span>
        </p>
    </div>
</template>

<style scoped lang="scss">
.GameInfo {
    position: fixed;
    top: 0;
    left: 0;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.8);
    color: #fff;

    @media screen and (max-width: 740px) {
        font-size: var.vw(18);
    }
}
</style>
