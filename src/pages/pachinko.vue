<script setup lang="ts">
import { useWindowHeight } from '@/composables/useWindowHeight'
import { useWindowWidthAndDevice } from '@/composables/useWindowWidthAndDevice'
import { usePachinkoSimulator } from '@/composables/usePachinkoSimulator'

const { windowHeight } = useWindowHeight()
const { windowWidth, deviceType } = useWindowWidthAndDevice()

const { userInput, simulationState, simulateAll, isCalculating } =
    usePachinkoSimulator()

const inputDefault = () => {
    userInput.value.jackpotAttempts = 10000
    userInput.value.jackpotProbability = 100
    userInput.value.kakuhenEntryRate = 80
    userInput.value.kakuhenContinuationRate = 80
    userInput.value.firstJackpotPayout = 800
    userInput.value.kakuhenJackpotProbability = 10
    userInput.value.avgJackpotPayoutDuringRush = 1000
    userInput.value.jitanModeRounds = 100
    userInput.value.pricePerBall = 4
    userInput.value.exchangeRatePerBall = 1
    userInput.value.avgSpinsPer1000yen = 18
    userInput.value.startingMoney = 1000
}

/*
const startOnceDenSapoSpin = () => {
    if (!simulationState.value.isSimulationStart) {
        startSimulation()
    }

    spinDenSupports()
}

const startSimulateOnce = () => {
    if (!simulationState.value.isSimulationStart) {
        startSimulation()
    }

    simulateOnce()
}
*/
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
                <h1>パチンコシミュレーター</h1>
                <p v-if="isCalculating">計算中です...</p>
                <p v-if="simulationState.isSimulationStart">
                    現在{{ simulationState.currentSimulationCount }}回まで終了
                </p>
                <PachinkoChart
                    v-if="simulationState.isSimulationStart"
                    :data="simulationState.frequencySpinsFirstJackpotItems"
                />
                <Button
                    v-if="!simulationState.isSimulationStart"
                    @click="inputDefault()"
                    text="default"
                    color="blue"
                />

                <form
                    v-if="!simulationState.isSimulationStart"
                    class="Page__userForm"
                >
                    <ul class="Page__userInputList">
                        <li class="Page__userInputItem">
                            <label
                                class="Page__userInputLabel"
                                for="jackpotAttempts"
                                >大当たり試行回数</label
                            >
                            <input
                                class="Page__userInput"
                                id="jackpotAttempts"
                                type="number"
                                min="1"
                                max="1000000"
                                v-model="userInput.jackpotAttempts"
                            />
                            回
                        </li>
                        <li class="Page__userInputItem">
                            <label
                                class="Page__userInputLabel"
                                for="jackpotProbability"
                                >大当たり(初当たり)確率</label
                            >
                            1 /
                            <input
                                class="Page__userInput"
                                id="jackpotProbability"
                                type="number"
                                min="1"
                                v-model="userInput.jackpotProbability"
                            />
                        </li>
                        <li class="Page__userInputItem">
                            <label
                                class="Page__userInputLabel"
                                for="kakuhenEntryRate"
                                >確変突入率</label
                            >
                            <input
                                class="Page__userInput"
                                id="kakuhenEntryRate"
                                type="number"
                                min="1"
                                max="100"
                                v-model="userInput.kakuhenEntryRate"
                            />
                            %
                        </li>
                        <li class="Page__userInputItem">
                            <label
                                class="Page__userInputLabel"
                                for="kakuhenContinuationRate"
                                >確変継続率</label
                            >
                            <input
                                class="Page__userInput"
                                id="kakuhenContinuationRate"
                                type="number"
                                min="1"
                                max="100"
                                v-model="userInput.kakuhenContinuationRate"
                            />
                            %
                        </li>
                        <li class="Page__userInputItem">
                            <label
                                class="Page__userInputLabel"
                                for="firstJackpotPayout"
                                >初当たり時出玉数</label
                            >
                            <input
                                class="Page__userInput"
                                id="firstJackpotPayout"
                                type="number"
                                min="0"
                                max="10000"
                                v-model="userInput.firstJackpotPayout"
                            />
                            個
                        </li>
                        <li class="Page__userInputItem">
                            <label
                                class="Page__userInputLabel"
                                for="kakuhenJackpotProbability"
                                >確変中大当たり確率 1 /</label
                            >
                            <input
                                class="Page__userInput"
                                id="kakuhenJackpotProbability"
                                type="number"
                                min="1"
                                max="100"
                                v-model="userInput.kakuhenJackpotProbability"
                            />
                        </li>
                        <li class="Page__userInputItem">
                            <label
                                class="Page__userInputLabel"
                                for="avgJackpotPayoutDuringRush"
                                >確変中大当たり時平均出玉数</label
                            >
                            <input
                                class="Page__userInput"
                                id="avgJackpotPayoutDuringRush"
                                type="number"
                                min="0"
                                max="10000"
                                v-model="userInput.avgJackpotPayoutDuringRush"
                            />
                            個
                        </li>
                        <li class="Page__userInputItem">
                            <label
                                class="Page__userInputLabel"
                                for="jitanModeRounds"
                                >時短回数</label
                            >
                            <input
                                class="Page__userInput"
                                id="jitanModeRounds"
                                type="number"
                                min="0"
                                max="10000"
                                v-model="userInput.jitanModeRounds"
                            />
                            回
                        </li>
                        <li class="Page__userInputItem">
                            <label
                                class="Page__userInputLabel"
                                for="pricePerBall"
                                >1玉あたりの値段</label
                            >
                            <input
                                class="Page__userInput"
                                id="pricePerBall"
                                type="number"
                                min="0"
                                max="10000"
                                v-model="userInput.pricePerBall"
                            />
                            円
                        </li>
                        <li class="Page__userInputItem">
                            <label
                                class="Page__userInputLabel"
                                for="exchangeRatePerBall"
                                >1玉あたりの換金レート</label
                            >
                            <input
                                class="Page__userInput"
                                id="exchangeRatePerBall"
                                type="number"
                                min="0"
                                max="10000"
                                v-model="userInput.exchangeRatePerBall"
                            />
                            円
                        </li>
                        <li class="Page__userInputItem">
                            <label
                                class="Page__userInputLabel"
                                for="avgSpinsPer1000yen"
                                >通常時1kあたりの平均回転数</label
                            >
                            <input
                                class="Page__userInput"
                                id="avgSpinsPer1000yen"
                                type="number"
                                min="0"
                                max="10000"
                                v-model="userInput.avgSpinsPer1000yen"
                            />
                            回
                        </li>
                        <li class="Page__userInputItem">
                            <label
                                class="Page__userInputLabel"
                                for="startingMoney"
                                >所持金</label
                            >
                            <input
                                class="Page__userInput"
                                id="startingMoney"
                                type="number"
                                min="1000"
                                max="10000"
                                v-model="userInput.startingMoney"
                            />
                            円
                        </li>
                    </ul>
                    <div class="Page__buttonWrap">
                        <button class="Page__button" @click="simulateAll()">
                            <span class="Page__buttonText">開始</span>
                        </button>
                    </div>
                </form>

                <!--
                <Button
                    @click="startOnceSpin()"
                    text="通常1回転"
                    color="blue"
                />
                <Button
                    @click="startOnceDenSapoSpin()"
                    text="電サポ1回転"
                    color="blue"
                />
               
                <Button
                    @click="startSimulateOnce()"
                    text="1シミュレーション開始"
                    color="blue"
                />
   -->

                <table
                    v-if="simulationState.isSimulationStart"
                    class="Page__table"
                >
                    <tbody>
                        <tr>
                            <th>所持金</th>
                            <td>{{ simulationState.hasMoney }}</td>
                            <th>持ち球</th>
                            <td>{{ simulationState.hasBalls }}</td>
                        </tr>
                        <tr>
                            <th>投入した金額合計</th>
                            <td>{{ simulationState.totalPayout }}</td>
                            <th>合計出玉</th>
                            <td>{{ simulationState.totalPayoutBalls }}</td>
                        </tr>
                        <tr>
                            <th>初当たりまでの平均回転数</th>
                            <td>{{ simulationState.avgSpinsFirstJackpot }}</td>
                            <th>初当たりまでの回転数の中央値</th>
                            <td>
                                {{ simulationState.medianSpinsFirstJackpot }}
                            </td>
                        </tr>
                        <tr>
                            <th>初当たりまでの回転数の分散</th>
                            <td>{{ simulationState.varSpinsFirstJackpot }}</td>
                            <th>初当たりまでの回転数の標準偏差</th>
                            <td>
                                {{ simulationState.stdDevSpinsFirstJackpot }}
                            </td>
                        </tr>
                        <tr>
                            <th>初当たりまでの最大ハマり回転数</th>
                            <td>{{ simulationState.maxMissSpins }}</td>
                            <th>初当たりまでの最速回転数</th>
                            <td>{{ simulationState.minMissSpins }}</td>
                        </tr>
                        <tr>
                            <th>確変中の最大ハマり回転数</th>
                            <td>{{ simulationState.maxMissSpinsInKakuhen }}</td>
                            <th>確変中の最速当たり回転数</th>
                            <td>{{ simulationState.minMissSpinsInKakuhen }}</td>
                        </tr>
                        <tr>
                            <th>最大連チャン数</th>
                            <td>
                                {{ simulationState.maxKakuhenJackpotChain }}
                            </td>
                            <th>平均連チャン数</th>
                            <td>
                                {{ simulationState.avgKakuhenJackpotChain }}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table
                    v-if="simulationState.isSimulationStart"
                    class="Page__table"
                >
                    <tbody>
                        <tr>
                            <th>大当たり試行回数</th>
                            <td>{{ userInput.jackpotAttempts }}</td>
                            <th>大当たり(初当たり)確率</th>
                            <td>1 / {{ userInput.jackpotProbability }}</td>
                        </tr>
                        <tr>
                            <th>確変突入率</th>
                            <td>{{ userInput.kakuhenEntryRate }}%</td>
                            <th>確変継続率</th>
                            <td>{{ userInput.kakuhenContinuationRate }}%</td>
                        </tr>
                        <tr>
                            <th>初当たり時出玉数</th>
                            <td>{{ userInput.firstJackpotPayout }}個</td>
                            <th>確変中大当たり確率</th>
                            <td>{{ userInput.kakuhenJackpotProbability }}%</td>
                        </tr>
                        <tr>
                            <th>確変中大当たり時平均出玉数</th>
                            <td>
                                {{ userInput.avgJackpotPayoutDuringRush }}個
                            </td>
                            <th>時短回数</th>
                            <td>{{ userInput.jitanModeRounds }}回</td>
                        </tr>
                        <tr>
                            <th>1玉あたりの値段</th>
                            <td>{{ userInput.pricePerBall }}円</td>
                            <th>1玉あたりの換金レート</th>
                            <td>{{ userInput.exchangeRatePerBall }}</td>
                        </tr>
                        <tr>
                            <th>通常時1kあたりの平均回転数</th>
                            <td>{{ userInput.avgSpinsPer1000yen }}個</td>
                            <th>開始時所持金</th>
                            <td>{{ userInput.startingMoney }}円</td>
                        </tr>
                    </tbody>
                </table>

                <!-- <pre>userInput: {{ userInput }}</pre> -->
                <!-- <pre>onceSimulationState: {{ onceSimulationState }}</pre> -->
            </div>
        </el-scrollbar>
    </div>
</template>

<style lang="scss" scoped>
.Page {
    overflow: hidden;
    height: 100vh;
    display: flex;
    flex-direction: column;

    &__inner {
        padding: 20px;
    }

    &__userForm {
        text-align: center;
    }

    &__userInputList {
        display: flex;
        flex-direction: column;
        text-align: left;
    }

    &__userInputItem {
        display: flex;
        align-items: center;
        padding: 12px 20px;
    }

    &__userInputItem + &__userInputItem {
        border-top: 1px solid #ccc;
    }

    &__userInputLabel {
        &:after {
            content: '：';
        }
    }

    &__userInput:not(.el-input__inner) {
        width: 120px;
        margin: 0 8px 0 16px;
    }

    &__cpuThinking {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        font-size: 40px;
        color: #fff;
        text-shadow: 1px 1px 0 #000;
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

    &__table {
        width: 100%;
        table-layout: fixed;

        tbody {
            tr {
                th,
                td {
                    padding: 12px 16px;
                    border: 1px solid #ccc;
                    vertical-align: middle;
                }

                $thWidth: 260px;

                th {
                    background-color: #f9f9f9;
                    width: $thWidth;
                }

                td {
                    width: calc((100% - ($thWidth * 2)) / 2);
                }
            }
        }
    }

    &__table + &__table {
        margin-top: 32px;
    }

    @media screen and (max-width: 740px) {
        &__table {
            tbody {
                tr {
                    display: flex;
                    flex-wrap: wrap;

                    th,
                    td {
                        font-size: 12px;
                        padding: 8px;
                        border-width: 0.5px;
                    }

                    th {
                        width: 150px;
                        flex-shrink: 0;
                        background-color: #f9f9f9;
                    }

                    td {
                        flex: 1;
                        min-width: 0;
                    }
                }
            }
        }

        &__table + &__table {
            margin-top: 16px;
        }
    }
}
</style>
