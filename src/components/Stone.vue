<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BLACK, StoneColor } from '@/logics/board'
import { useGameStore } from '@/stores/game'

interface Props {
    color: StoneColor
}

const props = withDefaults(defineProps<Props>(), {})

const gameStore = useGameStore()

const colorName = computed(() => {
    return props.color === BLACK ? 'black' : 'white'
})

// ========================
// Stone がアニメ中かどうかのフラグ
// ========================
const isFlipping = ref(false)
watch(
    () => props.color,
    () => {
        isFlipping.value = true
        setTimeout(() => {
            isFlipping.value = false
        }, 500)
    },
)
</script>

<template>
    <div
        class="Stone"
        :class="[
            `Stone--${colorName}`,
            { 'Stone--flip': isFlipping },
            { 'Stone--yakiniku': gameStore.isYakiniku },
            gameStore.isYakiniku ? 'Stone--yakiniku--' + colorName : '',
        ]"
    ></div>
</template>

<style scoped lang="scss">
.Stone {
    display: flex;
    width: 50px;
    height: 50px;
    position: relative;
    z-index: 1;
    line-height: 0;
    border-radius: 50%;
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);

    &--black {
        background-color: #000;
    }

    &--white {
        background-color: #fff;
    }

    &--flip {
        animation: stone-flip 0.5s forwards;
    }

    &--yakiniku {
        width: 70px;
        height: 70px;
        background-size: 70px;
    }

    &--yakiniku--black {
        background: url(/src/assets/images/black.png) no-repeat 0 0;
    }

    &--yakiniku--white {
        background: url(/src/assets/images/white.png) no-repeat 0 0;
    }

    @media screen and (max-width: 740px) {
        width: var.vw(50);
        height: var.vw(50);

        &--yakiniku {
            width: var.vw(70);
            height: var.vw(70);
            background-size: var.vw(70);
        }
    }
}

@keyframes stone-flip {
    0% {
        transform: rotateY(0deg) scale(1.5);
    }
    100% {
        transform: rotateY(180deg) scale(1);
    }
}
</style>
