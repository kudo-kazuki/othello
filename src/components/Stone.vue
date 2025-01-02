<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { BLACK, StoneColor } from '@/logics/board'

interface Props {
    color: StoneColor
}

const props = withDefaults(defineProps<Props>(), {})

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
        }, 300)
    },
)
</script>

<template>
    <div
        class="Stone"
        :class="[`Stone--${colorName}`, { 'Stone--flip': isFlipping }]"
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
        animation: stone-flip 0.3s forwards;
    }

    @media screen and (max-width: 740px) {
        width: var.vw(50);
        height: var.vw(50);
    }
}

@keyframes stone-flip {
    0% {
        transform: rotateY(0deg);
    }
    100% {
        transform: rotateY(180deg);
    }
}
</style>
