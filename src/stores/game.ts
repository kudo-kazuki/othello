import { defineStore } from 'pinia'
import {
    createInitialBoard,
    BoardState,
    BLACK,
    WHITE,
    EMPTY,
    StoneColor,
} from '@/logics/board'
import {
    canPlaceStone,
    getPlaceableCells,
    placeStone,
    isGameEnd,
} from '@/logics/gameRules'

interface gameStore {
    board: BoardState
    isGameStart: boolean
    isGameEnd: boolean
    turn: number
    currentColor: StoneColor
    humanColor: StoneColor
    placeableCells: Array<[number, number]>
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
    }),
    actions: {
        startGame() {
            this.isGameStart = true
            this.updatePlaceableCells()
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

            this.currentColor = this.currentColor === BLACK ? WHITE : BLACK
            this.turn++

            // --- 終局判定 ---
            this.isGameEnd = isGameEnd(this.board, this.currentColor, this.turn)
            if (this.isGameEnd) {
                console.log('ゲーム終了')
            }

            this.updatePlaceableCells()
        },
    },
})
