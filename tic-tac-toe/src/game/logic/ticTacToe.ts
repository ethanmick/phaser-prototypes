export type Mark = 'X' | 'O'
export type CellMark = Mark | ''

/**
 * Return indices of empty cells in the board
 */
export function getEmptyIndices(board: CellMark[]): number[] {
  return board.map((_, index) => index).filter((index) => board[index] === '')
}

/**
 * Determine the game result for the given board state.
 * - Returns the winning Mark ('X' or 'O')
 * - Returns 'draw' if the board is full with no winner
 * - Returns null if the game is still ongoing
 */
export function getGameResult(board: CellMark[]): Mark | 'draw' | null {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ] as const

  for (const [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Mark
    }
  }

  if (board.every((c) => c !== '')) return 'draw'
  return null
}

/**
 * Choose an AI move using a simple heuristic:
 * 1) Win immediately if possible
 * 2) Block opponent immediate win
 * 3) Take center
 * 4) Take a random corner
 * 5) Take any remaining random empty cell
 *
 * Provide an optional RNG for deterministic tests.
 */
export function chooseAIMove(
  board: CellMark[],
  aiMark: Mark,
  playerMark: Mark,
  rng: () => number = Math.random
): number {
  const empty = getEmptyIndices(board)
  if (empty.length === 0) return -1

  // 1) Try to win now
  for (const i of empty) {
    const clone = [...board]
    clone[i] = aiMark
    if (getGameResult(clone) === aiMark) return i
  }

  // 2) Block opponent immediate win
  for (const i of empty) {
    const clone = [...board]
    clone[i] = playerMark
    if (getGameResult(clone) === playerMark) return i
  }

  // 3) Center
  if (board[4] === '') return 4

  // 4) Corners
  const corners = [0, 2, 6, 8].filter((i) => board[i] === '')
  if (corners.length > 0) {
    const r = clampIndex(rng(), corners.length)
    return corners[r]
  }

  // 5) Any remaining
  const r = clampIndex(rng(), empty.length)
  return empty[r]
}

function clampIndex(value: number, length: number): number {
  if (length <= 0) return 0
  const v = isFinite(value) ? value : 0
  const idx = Math.floor(v * length)
  // Guard against rng() accidentally returning 1
  return Math.min(Math.max(idx, 0), length - 1)
}
