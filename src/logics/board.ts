export const EMPTY = 0
export const WHITE = -1
export const BLACK = 1

// StoneColor は BLACK か WHITE のどちらか
export type StoneColor = typeof BLACK | typeof WHITE

// 1マスの型 (optional)
export type CellState = typeof EMPTY | StoneColor

// 8×8の盤面の型
export type BoardState = CellState[][]

// 盤面初期化
export function createInitialBoard(): BoardState {
    const board: BoardState = Array.from({ length: 8 }, () =>
        Array.from({ length: 8 }, () => EMPTY),
    )

    // 初期配置
    board[3][3] = WHITE
    board[3][4] = BLACK
    board[4][3] = BLACK
    board[4][4] = WHITE

    return board
}
