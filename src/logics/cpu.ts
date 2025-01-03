import { BoardState, StoneColor, BLACK, WHITE } from '@/logics/board'
import { getPlaceableCells, placeStone } from '@/logics/gameRules'

// 8x8の重みテーブル
const WEIGHT_TABLE: number[][] = [
    [2000, -200, 20, 5, 5, 20, -200, 2000],
    [-200, -400, -5, -5, -5, -5, -400, -200],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [-200, -400, -5, -5, -5, -5, -400, -200],
    [2000, -200, 20, 5, 5, 20, -200, 2000],
]

/**
 * ランダムに置く。置けるマスがなければ null を返す
 */
export function getRandomMove(
    board: BoardState,
    cpuColor: StoneColor,
): [number, number] | null {
    const moves = getPlaceableCells(board, cpuColor)
    if (moves.length === 0) {
        return null // 置ける場所がない
    }

    const randomIndex = Math.floor(Math.random() * moves.length)
    return moves[randomIndex]
}

/**
 * αβ法で最善手を返す (depth: 探索深さ)
 * 返せる手がなければ null
 */
export function getAlphaBetaMove(
    board: BoardState,
    color: StoneColor,
    depth: number,
): [number, number] | null {
    // 置ける手が無ければ null
    const moves = getPlaceableCells(board, color)
    if (moves.length === 0) {
        return null
    }

    // ★ ここで move ordering (着手の並び替え) ★
    moves.sort((a, b) => {
        return WEIGHT_TABLE[b[0]][b[1]] - WEIGHT_TABLE[a[0]][a[1]]
    })

    let bestMove: [number, number] | null = null
    let bestValue = -Infinity

    // α= -∞, β= +∞ でスタート
    let alpha = -Infinity
    let beta = Infinity

    for (const move of moves) {
        // 1手打った後のボードコピーを作り、再帰探索
        const nextBoard = copyBoard(board)
        placeStone(nextBoard, move[0], move[1], color)

        // Minノード(相手番)を深さ depth-1 で評価
        // console.log('Minノード(相手番)を深さ depth-1 で評価の直前の係数', color)
        const value =
            color *
            alphaBetaSearch(
                nextBoard,
                getOpponentColor(color),
                depth - 1,
                alpha,
                beta,
                false,
            )

        // console.log(`move=(${move[0]},${move[1]}) => value=${value}`)

        // 最大値を更新
        if (value > bestValue) {
            bestValue = value
            bestMove = move
        }

        alpha = Math.max(alpha, bestValue)
        if (alpha >= beta) {
            // βカット（相手がこの値より良い手を避けるので、探索不要）
            break
        }
    }
    return bestMove
}

/**
 * 再帰的にαβ探索する
 * isMax=true → 現在の手番が「最大化」したいプレイヤー
 * isMax=false → 現在の手番が「最小化」したいプレイヤー
 *
 * @param board 現在の盤面
 * @param color 現在の手番
 * @param depth 残り探索深さ
 * @param alpha α値
 * @param beta β値
 * @param isMax 現在がMax層(true)かMin層(false)か
 * @returns 評価値
 */
function alphaBetaSearch(
    board: BoardState,
    color: StoneColor,
    depth: number,
    alpha: number,
    beta: number,
    isMax: boolean,
): number {
    // 終了条件1: depth=0
    if (depth <= 0) {
        return evaluateBoard(board)
    }

    // 終了条件2: ボードが終局状態なら評価値を返す
    // ここでは簡易的に「置けるマスが黒白ともに無い場合」を終局とみなし、評価値を返す
    const moves = getPlaceableCells(board, color)
    if (moves.length === 0) {
        // パスの場合は相手へ手番を回す → 相手も置けないなら終局
        const opponentMoves = getPlaceableCells(board, getOpponentColor(color))
        if (opponentMoves.length === 0) {
            // 両者置けない → 終局
            return evaluateBoard(board)
        }
        // 片方だけ置けないならパス扱いで同じ深さで相手番へ
        // isMax を反転して相手へ
        return alphaBetaSearch(
            board,
            getOpponentColor(color),
            depth - 1,
            alpha,
            beta,
            !isMax,
        )
    }

    // αβ探索
    if (isMax) {
        // Maxノード → 自分にとって最良(最大)の値を探す
        let value = -Infinity
        for (const move of moves) {
            const nextBoard = copyBoard(board)
            placeStone(nextBoard, move[0], move[1], color)

            value = Math.max(
                value,
                alphaBetaSearch(
                    nextBoard,
                    getOpponentColor(color),
                    depth - 1,
                    alpha,
                    beta,
                    false,
                ),
            )
            alpha = Math.max(alpha, value)
            if (alpha >= beta) {
                // βカット
                break
            }
        }
        return value
    } else {
        // Minノード → 相手にとって最悪(最小)の値を探す
        let value = Infinity
        for (const move of moves) {
            const nextBoard = copyBoard(board)
            placeStone(nextBoard, move[0], move[1], color)

            value = Math.min(
                value,
                alphaBetaSearch(
                    nextBoard,
                    getOpponentColor(color),
                    depth - 1,
                    alpha,
                    beta,
                    true,
                ),
            )
            beta = Math.min(beta, value)
            if (beta <= alpha) {
                // αカット
                break
            }
        }
        return value
    }
}

/**
 * 盤面評価関数 (簡易版)
 * 黒石数 - 白石数 を返す。
 * より賢くしたい場合は位置評価や定石などを盛り込む。
 */
function evaluateBoard(board: BoardState): number {
    let positionScore = 0
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === BLACK) {
                positionScore += WEIGHT_TABLE[r][c]
            } else if (board[r][c] === WHITE) {
                positionScore -= WEIGHT_TABLE[r][c]
            }
        }
    }

    // モビリティ差
    const blackMoves = getPlaceableCells(board, BLACK).length
    const whiteMoves = getPlaceableCells(board, WHITE).length
    const mobilityScore = (blackMoves - whiteMoves) * 2 // 重みはお好み

    return positionScore + mobilityScore
}

/**
 * ボードをディープコピーする
 */
function copyBoard(board: BoardState): BoardState {
    // 8×8固定なら単純ループでOK
    const newBoard: BoardState = []
    for (let r = 0; r < 8; r++) {
        newBoard[r] = board[r].slice() // 1行をコピー
    }
    return newBoard
}

/**
 * 相手の色を返す（黒→白、白→黒）
 */
function getOpponentColor(color: StoneColor): StoneColor {
    return color === BLACK ? WHITE : BLACK
}
