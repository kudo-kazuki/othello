/// <reference lib="webworker" />
import { BoardState, StoneColor } from '@/logics/board'
import { getRandomMove, getAlphaBetaMove } from '@/logics/cpu'
import { searchMonteCarloStone } from '@/logics/monteCarlo'

export interface WorkerInputMessage {
    board: BoardState
    color: StoneColor
    depth: number
    cpuStrong: number
}

export interface WorkerOutputMessage {
    row: number
    col: number
    success: boolean
}

self.addEventListener('message', (event) => {
    const data = event.data as WorkerInputMessage
    let move

    if (data.cpuStrong === 1) {
        console.log('ランダム')
        move = getRandomMove(data.board, data.color)
    } else if (data.cpuStrong === 2) {
        console.log('minmax')
        move = getAlphaBetaMove(data.board, data.color, data.depth)
    } else if (data.cpuStrong === 3) {
        console.log('モンテカルロ')
        move = searchMonteCarloStone(data.board, data.color, data.depth)
    }

    if (move) {
        const [row, col] = move
        const resp: WorkerOutputMessage = { row, col, success: true }
        self.postMessage(resp)
    } else {
        self.postMessage({ success: false } as WorkerOutputMessage)
    }
})
