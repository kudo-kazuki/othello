<script setup lang="ts">
import CircleAuraImage from '@/assets/effects/pipo-btleffect045.png'
</script>

<template>
    <div class="CircleAura">
        <img :src="CircleAuraImage" alt="" />
    </div>
</template>

<style scoped lang="scss">
.CircleAura {
    display: inline-flex;
    mix-blend-mode: lighten;
    width: 120px;
    height: 120px;
    overflow: hidden;

    img {
        max-width: none;
    }
}
</style>
