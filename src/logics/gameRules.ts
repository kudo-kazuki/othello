import { BoardState, StoneColor, BLACK, WHITE, EMPTY } from '@/logics/board'

function isInBoard(r: number, c: number): boolean {
    return r >= 0 && r < 8 && c >= 0 && c < 8
}

/**
 * 置いたときに反転すべきマスの座標配列を返す
 */
export function getFlips(
    board: BoardState,
    row: number,
    col: number,
    color: StoneColor,
): [number, number][] {
    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
    ]
    const flips: [number, number][] = []

    for (const [dr, dc] of directions) {
        const tmp: [number, number][] = []
        let r = row + dr
        let c = col + dc

        while (
            isInBoard(r, c) &&
            board[r][c] !== EMPTY &&
            board[r][c] !== color
        ) {
            tmp.push([r, c])
            r += dr
            c += dc
        }

        if (isInBoard(r, c) && board[r][c] === color) {
            flips.push(...tmp)
        }
    }
    return flips
}

/**
 * row,colに置けるかどうか(反転できるかどうか)をチェック
 */
export function canPlaceStone(
    board: BoardState,
    row: number,
    col: number,
    color: StoneColor,
) {
    // 空いてない場合は置けない
    if (board[row][col] !== EMPTY) {
        return false
    }
    // 反転できる石が1つでもあるかどうか
    const flips = getFlips(board, row, col, color)
    return flips.length > 0
}

/**
 * ボード全体をチェックし、指定した色(color)で置けるすべてのマス(row,col)を返す
 */
export function getPlaceableCells(
    board: BoardState,
    color: StoneColor,
): Array<[number, number]> {
    const moves: Array<[number, number]> = []

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (canPlaceStone(board, row, col, color)) {
                moves.push([row, col])
            }
        }
    }
    return moves
}

/**
 * 石を置いてひっくり返し、更新したboardを返す(直接書き換え注意)
 */
export function placeStone(
    board: BoardState,
    row: number,
    col: number,
    color: StoneColor,
) {
    const flips = getFlips(board, row, col, color)
    // 置く
    board[row][col] = color
    // ひっくり返す
    flips.forEach(([r, c]) => {
        board[r][c] = color
    })
    return board
}

/**
 * 終局判定
 * 1. 60手に達したらゲーム終了 (turn >= 60)
 * 2. (現在の手番)で置ける手がある場合は終了しない
 * 3. (相手の手番)で置ける手がある場合も終了しない
 */
export function isGameEnd(
    board: BoardState,
    currentColor: StoneColor,
    turn: number,
): boolean {
    // まず 60手に達していれば終了
    if (turn >= 60) {
        return true
    }

    // 現在の手番で置ける手があれば未終了
    const currentMoves = getPlaceableCells(board, currentColor)
    if (currentMoves.length > 0) {
        return false
    }

    // 相手の手番を計算し、相手が置ける手があれば未終了
    const nextColor = currentColor === BLACK ? WHITE : BLACK
    const nextMoves = getPlaceableCells(board, nextColor)
    if (nextMoves.length > 0) {
        return false
    }

    // 上記条件をすべて満たさなければ終局
    return true
}
