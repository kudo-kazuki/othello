<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
</script>

<template>
    <div class="Board">
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

    &__row {
        display: flex;
    }
}
</style>
