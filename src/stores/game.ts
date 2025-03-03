import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import {
    createInitialBoard,
    initialDebugBoard1,
    BoardState,
    BLACK,
    WHITE,
    StoneColor,
} from '@/logics/board'
import {
    canPlaceStone,
    getPlaceableCells,
    placeStone,
    isGameEnd,
} from '@/logics/gameRules'
import { WorkerInputMessage, WorkerOutputMessage } from '@/workers/cpuWorker'
import { playAudio } from '@/utility/audio'

interface gameStore {
    board: BoardState
    isGameStart: boolean
    isGameEnd: boolean
    turn: number
    currentColor: StoneColor
    humanColor: StoneColor
    placeableCells: Array<[number, number]>
    currentPlaceStoneCell: [number, number] | null
    cpuStrong: number
    isCpuThinking: boolean
    isYakiniku: boolean
    isYugami: boolean
    isDebug: boolean
}

export const useGameStore = defineStore('game', {
    state: (): gameStore => ({
        board: createInitialBoard(),
        isGameStart: false,
        isGameEnd: false,
        turn: 1,
        currentColor: BLACK,
        humanColor: BLACK,
        placeableCells: [],
        currentPlaceStoneCell: null,
        cpuStrong: 1,
        isCpuThinking: false,
        isYakiniku: false,
        isYugami: false,
        isDebug: false,
    }),
    actions: {
        startGame() {
            this.setDebug()

            this.isGameStart = true
            this.updatePlaceableCells()

            if (this.currentColor !== this.humanColor) {
                this.runCpu()
            }
        },

        updatePlaceableCells() {
            this.placeableCells = getPlaceableCells(this.board, this.humanColor)
        },

        placeStone(row: number, col: number) {
            if (!canPlaceStone(this.board, row, col, this.currentColor)) {
                console.log('置けません')
                return
            }

            placeStone(this.board, row, col, this.currentColor)
            this.currentPlaceStoneCell = [row, col]

            playAudio('tetterette')

            this.currentColor = this.currentColor === BLACK ? WHITE : BLACK
            this.turn++

            this.setYugami()

            // --- 終局判定 ---
            this.isGameEnd = isGameEnd(this.board, this.currentColor, this.turn)
            if (this.isGameEnd) {
                console.log('ゲーム終了')
                if (this.humanIsWinning) {
                    playAudio('victory')
                }
                return false
            }

            this.updatePlaceableCells()

            // --- パス判定 ---
            if (this.isPass()) {
                alert(`${this.currentPlayerName}はパスしました`)
                console.log(
                    `パス: ${this.currentColor === BLACK ? '黒' : '白'} が打てない`,
                )

                // パスするだけなら手番を切り替える
                this.currentColor = this.currentColor === BLACK ? WHITE : BLACK

                // CPUターンならここで runCpu()
                if (this.currentColor !== this.humanColor) {
                    this.runCpu()
                }

                return false
            }

            // CPUの番なら、CPUを走らせる
            if (this.currentColor !== this.humanColor) {
                this.runCpu()
            }
        },

        async runCpu() {
            this.isCpuThinking = true
            await nextTick()

            let move: [number, number] | null = null
            let depth = 1

            await new Promise((resolve) => setTimeout(resolve, 500))

            if (this.cpuStrong === 2) {
                if (this.turn > 50) {
                    depth = 8
                } else if (this.turn > 35) {
                    depth = 7
                } else if (this.turn > 25) {
                    depth = 6
                } else if (this.turn > 20) {
                    depth = 5
                } else if (this.turn > 15) {
                    depth = 4
                } else if (this.turn > 10) {
                    depth = 3
                } else if (this.turn > 4) {
                    depth = 2
                }
                // move = getAlphaBetaMove(this.board, this.currentColor, 6)
            } else if (this.cpuStrong === 3) {
                depth = 200
            }

            // 結果を受け取るまで待ちたい → Promiseでラップし、resolve()されたら先へ
            await new Promise<void>((resolve) => {
                const worker = new Worker(
                    new URL('@/workers/cpuWorker.ts', import.meta.url),
                    { type: 'module' },
                )

                // worker に送るデータ
                worker.postMessage({
                    board: JSON.parse(JSON.stringify(this.board)),
                    color: this.currentColor,
                    depth: depth,
                    cpuStrong: this.cpuStrong,
                } as WorkerInputMessage)

                // worker から結果を受け取る
                worker.addEventListener('message', (event) => {
                    const data = event.data as WorkerOutputMessage
                    worker.terminate() // 1回使い捨てなら terminate() してしまう

                    this.isCpuThinking = false

                    if (data.success) {
                        console.log('data', data)
                        move = [data.row, data.col]
                    } else {
                        move = null
                    }

                    resolve() // ここで「Worker処理が終わった」としてPromiseを解決
                })
            })

            this.isCpuThinking = false

            if (move) {
                const [row, col] = move as [number, number]
                // CPU が石を置く
                this.placeStone(row, col)
            }
        },

        isPass(): boolean {
            const moves = getPlaceableCells(this.board, this.currentColor)
            return moves.length === 0
        },

        setYugami() {
            if (!this.isYugami) {
                return
            }

            const body = document.getElementsByTagName('body')[0]
            const nowStyle = body.style.transform
                ? body.style.transform
                : 'skew(0deg, 0deg)'
            let style = ''

            if (
                nowStyle == '' ||
                nowStyle == ' ' ||
                nowStyle == 'skew(0deg, 0deg)'
            ) {
                style = 'skew(0deg, 0deg)'
            }
            console.log('style:', style)
            let xDeg = 0
            let yDeg = 0

            const nowDeg = nowStyle.split('skew')[1]

            xDeg = parseFloat(nowDeg.split(',')[0].slice(1).split('deg')[0])
            yDeg = parseFloat(nowDeg.split(',')[0].slice(1).split('deg')[0])

            xDeg += 0.55
            yDeg += 0.65

            style = 'skew(' + xDeg + 'deg, ' + yDeg + 'deg)'

            body.style.transform = style
        },

        setDebug() {
            if (!this.isDebug) {
                return false
            }
            this.board = initialDebugBoard1()
            this.turn = 21
        },
    },

    getters: {
        currentPlayerName: (state): string => {
            return state.currentColor === state.humanColor ? 'あなた' : 'CPU'
        },

        /**
         * 現在の盤面にある黒石の数
         */
        blackStoneCount(state): number {
            return state.board.reduce((sum, row) => {
                return sum + row.filter((cell) => cell === BLACK).length
            }, 0)
        },

        /**
         * 現在の盤面にある白石の数
         */
        whiteStoneCount(state): number {
            return state.board.reduce((sum, row) => {
                return sum + row.filter((cell) => cell === WHITE).length
            }, 0)
        },

        /**
         * 「自分(humanColor)が現時点で勝っているかどうか」を真偽値で返す
         * 例: 自分が黒の場合、黒石が白石より多ければtrue
         */
        humanIsWinning(): boolean {
            const blackCount = this.blackStoneCount
            const whiteCount = this.whiteStoneCount

            if (this.humanColor === BLACK) {
                return blackCount > whiteCount
            } else {
                return whiteCount > blackCount
            }
        },
    },
})
