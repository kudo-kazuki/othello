<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'

interface Props {
    name: string
}

const props = withDefaults(defineProps<Props>(), {})

const component = computed(() => {
    try {
        return defineAsyncComponent(
            () => import(`@/components/Effect/Effects/${props.name}.vue`),
        )
    } catch {
        return null
    }
})
</script>

<template>
    <div class="Effect">
        <component :is="component" v-if="component"></component>
        <p v-else>コンポーネントが見つかりません。</p>
    </div>
</template>

<style scoped lang="scss">
.Effect {
    display: inline-flex;
}
</style>
