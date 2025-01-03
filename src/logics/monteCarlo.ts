import { BoardState, StoneColor, BLACK, WHITE } from '@/logics/board'
import { getPlaceableCells, placeStone } from '@/logics/gameRules'

/**
 * 色を反転させる（黒→白、白→黒）
 */
function getReverseStoneColor(color: StoneColor): StoneColor {
    return color === BLACK ? WHITE : BLACK
}

/**
 * 現在の盤面から勝利色を判定する
 * 今回はシンプルに「黒石の数 > 白石の数 なら黒勝利、それ以外は白勝利」としています。
 * 実際のオセロ仕様に合わせて、同数なら引き分け等のロジックを入れてもOKです。
 */
function getWinStoneState(board: BoardState): StoneColor {
    let blackCount = 0
    let whiteCount = 0

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === BLACK) {
                blackCount++
            } else if (board[r][c] === WHITE) {
                whiteCount++
            }
        }
    }

    return blackCount > whiteCount ? BLACK : WHITE
}

/**
 * 指定回数ゲームを行い、指定した色が勝利した回数を返却する
 * @param board 初期の8×8盤面
 * @param checkStoneColor 最初に置く石の色（BLACK or WHITE）
 * @param checkRow 最初に置くセルの行
 * @param checkCol 最初に置くセルの列
 * @param playCount 試行回数
 * @returns 勝利回数
 */
export function getPlayGameWinCount(
    board: BoardState,
    checkStoneColor: StoneColor,
    checkRow: number,
    checkCol: number,
    playCount: number,
): number {
    let winCount = 0

    for (let i = 0; i < playCount; i++) {
        // 盤面をコピーして毎回リセット
        const activeBoard = board.map((row) => [...row])

        // 1. 最初の一手を置く
        placeStone(activeBoard, checkRow, checkCol, checkStoneColor)

        // 2. ゲームが終わるまで手番を交互に進める
        let activeColor = checkStoneColor
        while (true) {
            // 次の手番色へ
            activeColor = getReverseStoneColor(activeColor)

            // その手番色が置けるマスを取得
            const placeableCells = getPlaceableCells(activeBoard, activeColor)
            if (placeableCells.length === 0) {
                // 置けるマスがなければゲーム終了
                break
            }

            // ランダムに1マス選んで石を置く
            const randomIndex = Math.floor(
                Math.random() * placeableCells.length,
            )
            const [r, c] = placeableCells[randomIndex]
            placeStone(activeBoard, r, c, activeColor)
        }

        // 3. 勝者の判定
        if (getWinStoneState(activeBoard) === checkStoneColor) {
            winCount++
        }
    }

    return winCount
}

/**
 * モンテカルロ法による着手位置の探索
 * @param board 現在の盤面(8×8)
 * @param putStoneColor これから置くストーンの色 (BLACK or WHITE)
 * @param playCount モンテカルロシミュレーションの試行回数
 * @returns 最適と思われる [row, col] の位置。置き場所がなければ null。
 */
export function searchMonteCarloStone(
    board: BoardState,
    putStoneColor: StoneColor,
    playCount: number,
): [number, number] | null {
    let resultCell: [number, number] | null = null
    let maxWinCount = -1

    // 現在の盤面で、指定色(putStoneColor)が置ける全てのマスを取得
    const canPutCells = getPlaceableCells(board, putStoneColor)

    // 置けるマスが無い場合は null を返却
    if (canPutCells.length === 0) {
        return null
    }

    // 各マスに対してモンテカルロシミュレーションを行い、
    // 勝利数(winCount)が最大となるマスを選択
    for (const [row, col] of canPutCells) {
        const winCount = getPlayGameWinCount(
            board,
            putStoneColor,
            row,
            col,
            playCount,
        )
        if (winCount > maxWinCount) {
            maxWinCount = winCount
            resultCell = [row, col]
        }
    }

    return resultCell
}
