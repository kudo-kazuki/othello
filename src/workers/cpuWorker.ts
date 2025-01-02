/// <reference lib="webworker" />
import { BoardState, StoneColor } from '@/logics/board'
import { getAlphaBetaMove } from '@/logics/cpu'

export interface WorkerInputMessage {
    board: BoardState
    color: StoneColor
    depth: number
}

export interface WorkerOutputMessage {
    row: number
    col: number
    success: boolean
}

self.addEventListener('message', (event) => {
    const data = event.data as WorkerInputMessage
    const move = getAlphaBetaMove(data.board, data.color, data.depth)
    if (move) {
        const [row, col] = move
        const resp: WorkerOutputMessage = { row, col, success: true }
        self.postMessage(resp)
    } else {
        self.postMessage({ success: false } as WorkerOutputMessage)
    }
})
