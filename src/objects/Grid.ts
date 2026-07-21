import {
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  CELL_SIZE,
  GRID_COLS,
  GRID_ROWS,
} from '../utils/constants';

export class Grid {
  readonly rows = GRID_ROWS;
  readonly cols = GRID_COLS;

  cellToPixel(row: number, col: number): { x: number; y: number } {
    return {
      x: BOARD_OFFSET_X + col * CELL_SIZE,
      y: BOARD_OFFSET_Y + row * CELL_SIZE,
    };
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const { x, y } = this.cellToPixel(row, col);
        ctx.fillStyle = (row + col) % 2 === 0 ? '#8bc34a' : '#7cb342';
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }

    ctx.restore();
  }
}
