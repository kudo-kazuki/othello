<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
</script>

<template>
    <div class="Board" :class="{ 'Board--yakiniku': gameStore.isYakiniku }">
        <div
            v-for="(rowCells, rowIndex) in gameStore.board"
            :key="rowIndex"
            class="Board__row"
        >
            <Cell
                v-for="(cell, colIndex) in rowCells"
                :key="colIndex"
                class="Board__cell"
                :state="cell"
                :row="rowIndex"
                :col="colIndex"
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
.Board {
    display: flex;
    position: relative;
    width: 640px;
    background-color: #00a944;
    flex-wrap: wrap;
    border: 1px solid #222;
    z-index: 1;

    &--yakiniku {
        background-color: transparent;
        background: url(/src/assets/images/BGSet.png) no-repeat 0 0;
        background-size: cover;
        border: none;
    }

    &__row {
        display: flex;
    }

    @media screen and (max-width: 740px) {
        width: var.vw(640);
    }
}
</style>
