import { Scene } from 'phaser'
import {
  type CellMark,
  chooseAIMove,
  getGameResult,
  type Mark,
} from '../logic/ticTacToe'

export class Game extends Scene {
  private board: CellMark[] = Array(9).fill('')
  private markTexts: (Phaser.GameObjects.Text | null)[] = Array(9).fill(null)

  private currentTurn: Mark = 'X'
  private playerMark: Mark = 'X'
  private aiMark: Mark = 'O'
  private gameOver = false

  private boardSize = 0
  private cellSize = 0
  private originX = 0
  private originY = 0

  private infoText!: Phaser.GameObjects.Text
  private restartText!: Phaser.GameObjects.Text

  constructor() {
    super('Game')
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor('#0b1533')

    this.setupBoardGeometry()
    this.drawGrid()
    this.createCells()
    this.createUI()

    this.playerMark = Math.random() < 0.5 ? 'X' : 'O'
    this.aiMark = this.playerMark === 'X' ? 'O' : 'X'
    this.startNewGame(false)
  }

  private setupBoardGeometry(): void {
    const width = this.scale.width
    const height = this.scale.height
    this.boardSize = Math.floor(Math.min(width, height) * 0.7)
    this.cellSize = Math.floor(this.boardSize / 3)
    this.originX = Math.floor((width - this.boardSize) / 2)
    this.originY = Math.floor((height - this.boardSize) / 2)
  }

  private drawGrid(): void {
    const g = this.add.graphics()
    g.lineStyle(6, 0xffffff, 0.75)

    for (let i = 1; i <= 2; i += 1) {
      const x = this.originX + i * this.cellSize
      const y = this.originY + i * this.cellSize
      g.strokeLineShape(
        new Phaser.Geom.Line(x, this.originY, x, this.originY + this.boardSize)
      )
      g.strokeLineShape(
        new Phaser.Geom.Line(this.originX, y, this.originX + this.boardSize, y)
      )
    }

    g.lineStyle(6, 0x6aa0ff, 0.65)
    g.strokeRect(this.originX, this.originY, this.boardSize, this.boardSize)
  }

  private createCells(): void {
    for (let index = 0; index < 9; index += 1) {
      const { cx, cy } = this.getCellCenter(index)
      const rect = this.add
        .rectangle(cx, cy, this.cellSize, this.cellSize, 0x000000, 0)
        .setInteractive({ useHandCursor: true })

      rect.on('pointerdown', () => this.handlePlayerMove(index))
    }
  }

  private createUI(): void {
    this.infoText = this.add
      .text(this.scale.width / 2, this.originY - 40, '', {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    this.restartText = this.add
      .text(
        this.scale.width / 2,
        this.originY + this.boardSize + 50,
        'Restart',
        {
          fontFamily: 'Arial Black',
          fontSize: '30px',
          color: '#ffffff',
          backgroundColor: '#1f3b82',
          padding: { x: 16, y: 8 },
          stroke: '#000000',
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })

    this.restartText.on('pointerdown', () => {
      this.startNewGame(true)
    })
  }

  private startNewGame(swapPlayerMark: boolean): void {
    if (swapPlayerMark) {
      this.playerMark = this.playerMark === 'X' ? 'O' : 'X'
      this.aiMark = this.playerMark === 'X' ? 'O' : 'X'
    }

    this.board = Array(9).fill('')
    this.gameOver = false
    this.currentTurn = 'X'
    this.clearRenderedMarks()

    this.updateInfoText()

    if (this.playerMark === 'O') {
      this.time.delayedCall(350, () => this.aiMove())
    }
  }

  private clearRenderedMarks(): void {
    for (let i = 0; i < this.markTexts.length; i += 1) {
      this.markTexts[i]?.destroy()
      this.markTexts[i] = null
    }
  }

  private handlePlayerMove(index: number): void {
    if (this.gameOver) return
    if (this.currentTurn !== this.playerMark) return
    if (this.board[index] !== '') return

    this.placeMark(index, this.playerMark)

    const result = getGameResult(this.board)
    if (result) {
      this.endGame(result)
      return
    }

    this.time.delayedCall(300, () => this.aiMove())
  }

  private aiMove(): void {
    if (this.gameOver) return
    if (this.currentTurn !== this.aiMark) return

    const move = chooseAIMove(this.board, this.aiMark, this.playerMark)
    if (move !== -1) {
      this.placeMark(move, this.aiMark)
    }

    const result = getGameResult(this.board)
    if (result) {
      this.endGame(result)
    }
  }

  private placeMark(index: number, mark: Mark): void {
    this.board[index] = mark
    const { cx, cy } = this.getCellCenter(index)
    const size = Math.floor(this.cellSize * 0.7)
    const color = mark === 'X' ? '#ffcc66' : '#66ffd1'
    const text = this.add
      .text(cx, cy, mark, {
        fontFamily: 'Arial Black',
        fontSize: `${size}px`,
        color,
        stroke: '#000000',
        strokeThickness: Math.max(4, Math.floor(size * 0.12)),
      })
      .setOrigin(0.5)

    this.markTexts[index] = text
    this.currentTurn = mark === 'X' ? 'O' : 'X'
    this.updateInfoText()
  }

  private endGame(result: Mark | 'draw'): void {
    this.gameOver = true
    if (result === 'draw') {
      this.infoText.setText(`Draw! Click Restart to play again.`)
    } else if (result === this.playerMark) {
      this.infoText.setText(
        `You win as ${this.playerMark}! Click Restart to swap and play again.`
      )
    } else {
      this.infoText.setText(
        `AI wins as ${this.aiMark}. Click Restart to swap and play again.`
      )
    }
  }

  private getCellCenter(index: number): { cx: number; cy: number } {
    const row = Math.floor(index / 3)
    const col = index % 3
    const cx = this.originX + col * this.cellSize + this.cellSize / 2
    const cy = this.originY + row * this.cellSize + this.cellSize / 2
    return { cx, cy }
  }

  private updateInfoText(): void {
    if (this.gameOver) return
    const yourTurn = this.currentTurn === this.playerMark
    const role = `You are ${this.playerMark}`
    this.infoText.setText(
      yourTurn ? `${role} — Your turn` : `${role} — AI is thinking...`
    )
  }

  // Logic helpers moved to ../logic/ticTacToe for testability
}
