<script setup lang="ts">
import { computed, watch } from 'vue'
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

const isPlaced = computed(() => {
    if (!gameStore.currentPlaceStoneCell) {
        return false
    }

    const [stoneRow, stoneCol] = gameStore.currentPlaceStoneCell
    return props.row === stoneRow && props.col === stoneCol
})

const isEffect = ref(false)
watch(
    () => isPlaced.value,
    (newVal) => {
        isEffect.value = newVal

        setTimeout(() => {
            isEffect.value = false
        }, 500)
    },
)
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
        <Effect v-if="isEffect" class="Cell__circleAura" name="Rose" />
    </div>
</template>

<style scoped lang="scss">
.Cell {
    position: relative;
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

    & &__circleAura {
        position: absolute;
        pointer-events: none;
        z-index: 99999;
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
