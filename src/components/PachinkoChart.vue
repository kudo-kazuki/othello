<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import {
    Chart,
    BarController,
    BarElement,
    LinearScale,
    CategoryScale,
} from 'chart.js'
Chart.register(BarController, BarElement, LinearScale, CategoryScale)

const props = defineProps<{
    data: Record<number, number> // 例: { 1: 10, 2: 5, 3: 0, 4: 8 }
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

onMounted(() => {
    if (!chartRef.value) return
    chart = new Chart(chartRef.value, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: '初当たりまでの回転数分布',
                    data: [],
                    backgroundColor: '#a3d5ff',
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: '初当たりまでの回転数' } },
                y: {
                    title: { display: true, text: '頻度' },
                    beginAtZero: true,
                },
            },
        },
    })
})

watch(
    () => props.data,
    (val) => {
        if (!chart) return
        const labels = Object.keys(val)
            .map(Number)
            .sort((a, b) => a - b)
        chart.data.labels = labels.map((n) => n.toString())
        chart.data.datasets[0].data = labels.map((n) => val[n])
        chart.update()
    },
    { deep: true, immediate: true },
)

onUnmounted(() => {
    chart?.destroy()
})
</script>

<template>
    <div class="PachinkoChart">
        <canvas class="PachinkoChart__canvas" ref="chartRef"></canvas>
    </div>
</template>

<style lang="scss" scoped>
.PachinkoChart {
    width: 100%;
    height: 30vh;

    &__canvas {
        width: 100%;
        height: 100%;
    }
}
</style>
