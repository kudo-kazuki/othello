export interface UserInput {
    jackpotAttempts?: number //大当たり試行回数（シミュレーション回数）
    jackpotProbability?: number // 大当たり(初当たり)確率 (実際は1/jackpotProbabilityとして使うので注意)
    kakuhenEntryRate?: number // 確変突入率（%）
    kakuhenContinuationRate?: number // 確変継続率（%）
    firstJackpotPayout?: number // 初当たり時出玉数（個）
    kakuhenJackpotProbability?: number //確変中大当たり確率 (実際は1/kakuhenJackpotProbabilityとして使うので注意)
    avgJackpotPayoutDuringRush?: number // 確変中大当たり時平均出玉数（個）
    jitanModeRounds?: number // 時短回数（回）
    pricePerBall?: number // 1玉あたりの値段（円）
    exchangeRatePerBall?: number // 1玉あたりの換金レート（1が最大。0.9など。）
    avgSpinsPer1000yen?: number // 通常時1kあたりの平均回転数（回数）
    startingMoney?: number // シミュレーションスタート時の所持金（円）
}

/**シミュレーション全体を通しての状態 */
export interface SimulationState {
    isSimulationStart: boolean // シミュレーションがスタートしたか
    isSimulationEnd: boolean // シミュレーションが終了したか
    remainingSimulations: number // 残りのシミュレーション回数
    currentSimulationCount: number // 現在何回目のシミュレーションか
    hasMoney: number // 所持金
    hasBalls: number // 持ち球
    totalPayout: number // 投入した金額合計
    totalPayoutBalls: number // 合計出玉（純粋に出玉の合計）
    avgSpinsFirstJackpot: number // 初当たりまでの平均回転数
    medianSpinsFirstJackpot: number // 初当たりまでの回転数の中央値
    varSpinsFirstJackpot: number // 初当たりまでの回転数の分散
    stdDevSpinsFirstJackpot: number // 初当たりまでの回転数の標準偏差
    maxMissSpins: number // 初当たりまでの最大ハマり回転数
    minMissSpins: number // 初当たりまでの最小ハマり回転数（つまり最短当たり回転数）
    maxMissSpinsInKakuhen: number // 確変中の最大ハマり回転数
    minMissSpinsInKakuhen: number // 確変中の最小ハマり回転数
    maxKakuhenJackpotChain: number // 最大連チャン数（確変中の大当たりの最大連続数）
    avgKakuhenJackpotChain: number // 平均連チャン数（確変中の大当たりの平均連続数）
    frequencySpinsFirstJackpotItems: Record<number, number> // 初当たりが何回点目だったのか、その頻度を表す（keyが回転数、値が頻度）
}

/**1回のシミュレーション（初当たり→時短or確変終了まで）における状態 */
export interface OnceSimulationState {
    mode: 'normal' | 'jitan' | 'kakuhen' // 通常 or 時短 or 確変
    currentSpins: number // 現在の回転数（時短 or 確変突入時は0にリセット）
    currentKakuhenJackpotChain: number // 現在の確変中の大当たり連続回数
    maxMissSpinsInKakuhen: number
    minMissSpinsInKakuhen: number
}
