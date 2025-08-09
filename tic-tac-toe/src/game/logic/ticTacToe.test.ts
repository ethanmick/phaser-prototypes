import { describe, expect, it } from 'vitest'
import {
  chooseAIMove,
  getGameResult,
  type CellMark,
  type Mark,
} from './ticTacToe'

const X: Mark = 'X'
const O: Mark = 'O'

describe('getGameResult', () => {
  it('detects row win', () => {
    const b: CellMark[] = [X, X, X, '', '', '', '', '', '']
    expect(getGameResult(b)).toBe(X)
  })

  it('detects column win', () => {
    const b: CellMark[] = [O, '', '', O, '', '', O, '', '']
    expect(getGameResult(b)).toBe(O)
  })

  it('detects diagonal win', () => {
    const b: CellMark[] = [X, '', '', '', X, '', '', '', X]
    expect(getGameResult(b)).toBe(X)
  })

  it('detects draw', () => {
    const b: CellMark[] = [X, O, X, X, O, O, O, X, X]
    expect(getGameResult(b)).toBe('draw')
  })

  it('returns null if ongoing', () => {
    const b: CellMark[] = [X, O, X, '', O, '', '', '', '']
    expect(getGameResult(b)).toBeNull()
  })
})

describe('chooseAIMove', () => {
  const rng = () => 0 // deterministic

  it('wins immediately if possible', () => {
    const b: CellMark[] = [X, X, '', '', O, '', '', '', O]
    // AI is X, should choose index 2 to win
    expect(chooseAIMove(b, X, O, rng)).toBe(2)
  })

  it('blocks opponent immediate win', () => {
    const b: CellMark[] = [O, O, '', X, '', '', '', '', '']
    // AI is X, opponent O about to win at index 2
    expect(chooseAIMove(b, X, O, rng)).toBe(2)
  })

  it('takes center if available', () => {
    const b: CellMark[] = ['', '', '', '', '', '', '', '', '']
    expect(chooseAIMove(b, X, O, rng)).toBe(4)
  })

  it('picks a corner when center is taken', () => {
    const b: CellMark[] = ['', '', '', '', O, '', '', '', '']
    expect([0, 2, 6, 8]).toContain(chooseAIMove(b, X, O, rng))
  })

  it('falls back to any empty cell', () => {
    const b: CellMark[] = [X, O, X, O, X, O, '', O, X]
    expect(chooseAIMove(b, X, O, rng)).toBe(6)
  })
})
