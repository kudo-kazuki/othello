<script setup lang="ts">
import { useWindowHeight } from '@/composables/useWindowHeight'
import { useWindowWidthAndDevice } from '@/composables/useWindowWidthAndDevice'

const { windowHeight } = useWindowHeight()
const { windowWidth, deviceType } = useWindowWidthAndDevice()
</script>

<template>
    <div
        class="Page"
        :style="{ height: `${windowHeight}px` }"
        :data-device="deviceType"
        :data-windowWidth="windowWidth"
    >
        <el-scrollbar always>
            <div class="Page__inner">
                <SalesMan />
            </div>
        </el-scrollbar>
    </div>
</template>
<style lang="scss" scoped>
.Page {
    overflow: hidden;
    height: 100vh;

    &__inner {
        padding: 12px;
    }

    @media screen and (max-width: 740px) {
    }
}
</style>
