<script setup lang="ts">
import { BLACK, WHITE } from '@/logics/board'
import { preloadAudioFiles } from '@/utility/audio'
import { useGameStore } from '@/stores/game'
const gameStore = useGameStore()

const colorMap: Record<string, string> = {}
colorMap[BLACK] = '黒（先攻）'
colorMap[WHITE] = '白（後攻）'
</script>

<template>
    <section class="SettingStart">
        <div class="SettingStart__inner">
            <h1 class="SettingStart__hdg">あなたの色</h1>
            <ul class="SettingStart__items">
                <li>
                    <Radio
                        id="humanColor1"
                        name="humanColor"
                        :text="colorMap[BLACK]"
                        :value="BLACK"
                        v-model="gameStore.humanColor"
                    />
                </li>
                <li>
                    <Radio
                        id="humanColor2"
                        name="humanColor"
                        :text="colorMap[WHITE]"
                        :value="WHITE"
                        v-model="gameStore.humanColor"
                    />
                </li>
            </ul>

            <h1 class="SettingStart__hdg">CPUの強さ</h1>
            <ul class="SettingStart__items">
                <li>
                    <Radio
                        id="cpu1"
                        name="cpuStrong"
                        text="弱い"
                        :value="1"
                        v-model="gameStore.cpuStrong"
                    />
                </li>
                <li>
                    <Radio
                        id="cpu2"
                        name="cpuStrong"
                        text="微妙に強い"
                        :value="2"
                        v-model="gameStore.cpuStrong"
                    />
                </li>
                <li>
                    <Radio
                        id="cpu3"
                        name="cpuStrong"
                        text="強いかも"
                        :value="3"
                        v-model="gameStore.cpuStrong"
                    />
                </li>
            </ul>

            <h1 class="SettingStart__hdg">スキン</h1>
            <ul class="SettingStart__items">
                <li>
                    <Radio
                        id="skin1"
                        name="skin"
                        text="ノーマル"
                        :value="false"
                        v-model="gameStore.isYakiniku"
                    />
                </li>
                <li>
                    <Radio
                        id="skin2"
                        name="skin"
                        text="焼き肉"
                        :value="true"
                        v-model="gameStore.isYakiniku"
                    />
                </li>
            </ul>

            <h1 class="SettingStart__hdg">ゆがみ</h1>
            <ul class="SettingStart__items">
                <li>
                    <Radio
                        id="yugami1"
                        name="yugami"
                        text="なし"
                        :value="false"
                        v-model="gameStore.isYugami"
                    />
                </li>
                <li>
                    <Radio
                        id="yugami2"
                        name="yugami"
                        text="あり"
                        :value="true"
                        v-model="gameStore.isYugami"
                    />
                </li>
            </ul>

            <div class="SettingStart__buttonWrap">
                <button
                    class="SettingStart__button"
                    @click="(gameStore.startGame(), preloadAudioFiles())"
                >
                    <span class="SettingStart__buttonText">開始</span>
                </button>
            </div>
        </div>
    </section>
</template>

<style scoped lang="scss">
.SettingStart {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    padding: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 9999;

    &__inner {
        padding: 40px;
        background-color: #fff;
        border-radius: 10px;
        text-align: center;
    }

    &__hdg {
        font-size: 18px;
        font-weight: bold;
        text-align: left;
    }

    &__items {
        display: flex;
        column-gap: 16px;
        margin: 6px 0 20px;
    }

    &__buttonWrap {
        margin-top: 12px;
        display: inline-block;
        padding: 0.2rem;
        border-radius: 0.5rem;
        background-image: linear-gradient(
            135deg,
            #704308 0%,
            #ffce08 37%,
            #fefeb2 47%,
            #fafad6 50%,
            #fefeb2 53%,
            #e1ce08 63%,
            #704308 100%
        );
        border-radius: 5px;
    }

    &__button {
        font-weight: 700;
        line-height: 1.5;
        position: relative;
        display: inline-block;
        padding: 10px 40px;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-transition: all 0.3s;
        transition: all 0.3s;
        text-align: center;
        vertical-align: middle;
        text-decoration: none;
        letter-spacing: 0.1em;
        color: #212529;
        border-radius: 4px;
        font-size: 20px;
        background: #000;
        border: none;
    }

    &__buttonWrap:hover &__button {
        text-shadow:
            0 0 15px rgba(250, 250, 214, 0.5),
            0 0 15px rgba(250, 250, 214, 0.5),
            0 0 15px rgba(250, 250, 214, 0.5),
            0 0 15px rgba(250, 250, 214, 0.5);
    }

    &__buttonText {
        background: linear-gradient(to top, #ffffdb, #a16422);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    @media screen and (max-width: 740px) {
        padding: 16px;

        &__inner {
            width: 100%;
            padding: 16px;
        }
    }
}
</style>
