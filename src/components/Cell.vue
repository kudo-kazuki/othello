<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { BLACK, WHITE, CellState } from '@/logics/board'

interface Props {
    state: CellState
    row: number
    col: number
}

const props = withDefaults(defineProps<Props>(), {})

const gameStore = useGameStore()

const isPlaceAbled = computed(() => {
    return (
        gameStore.currentColor == gameStore.humanColor &&
        !gameStore.isCpuThinking &&
        gameStore.placeableCells.some(
            ([r, c]) => r === props.row && c === props.col,
        )
    )
})

const placeStone = () => {
    if (!isPlaceAbled.value) {
        return false
    }
    gameStore.placeStone(props.row, props.col)
}
</script>

<template>
    <div
        class="Cell"
        :class="[
            { 'Cell--placeAble': isPlaceAbled },
            { 'Cell--yakiniku': gameStore.isYakiniku },
            {
                'Cell--yakiniku--placeAble':
                    isPlaceAbled && gameStore.isYakiniku,
            },
        ]"
        :data-col="col"
        :data-row="row"
        @click="placeStone()"
    >
        <Stone
            v-if="state === BLACK || state === WHITE"
            class="Cell__stone"
            :color="state"
        />
    </div>
</template>

<style scoped lang="scss">
.Cell {
    display: flex;
    box-sizing: border-box;
    border: 1px solid #222;
    width: 80px;
    height: 80px;
    position: relative;
    justify-content: center;
    align-items: center;
    transition: 0.2s ease all;

    &--placeAble {
        cursor: pointer;
        background-color: yellow;

        &:hover {
            background-color: red;
        }
    }

    &--yakiniku--placeAble {
        background-color: rgba(255, 255, 0, 0.8);
        border: none;

        &:hover {
            background: url(/src/assets/images/cursor.png) no-repeat 0 0;
        }
    }

    @media screen and (max-width: 740px) {
        width: var.vw(80);
        height: var.vw(80);

        &--yakiniku--placeAble {
            &:hover {
                background-size: var.vw(80) var.vw(80);
            }
        }
    }
}
</style>
