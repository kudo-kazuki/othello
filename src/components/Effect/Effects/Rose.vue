<script setup lang="ts">
import RoseImage from '@/assets/effects/pipo-roseeffect02_192.png'
</script>

<template>
    <div class="Rose">
        <img class="Rose__image" :src="RoseImage" alt="" />
    </div>
</template>

<style scoped lang="scss">
.Rose {
    width: 192px;
    height: 192px;
    overflow: hidden;

    &__image {
        max-width: none;
        object-fit: none; /* 画像全体ではなく、切り取った部分を表示 */
        object-position: 0 0; /* 開始位置 */
        animation: spriteAnimation 0.5s steps(15) infinite;
    }

    @media screen and (max-width: 740px) {
        width: 96px;
        height: 96px;

        &__image {
            transform: scale(0.5);
            transform-origin: top left;
        }
    }
}

@keyframes spriteAnimation {
    from {
        object-position: 0 0;
    }
    to {
        object-position: -2880px 0;
    }
}
</style>
