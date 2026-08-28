import { PLANT_COOLDOWNS, PLANT_COSTS, renderPlantIcon, type PlantType } from '../objects/Plant';
import type { LevelConfig } from '../config/levelConfig';
import {
  BOARD_OFFSET_X,
  BOARD_OFFSET_Y,
  CELL_SIZE,
  GRID_COLS,
  GRID_ROWS,
} from '../utils/constants';

export interface GridCell {
  row: number;
  col: number;
}

interface CardLayout {
  type: PlantType;
  x: number;
  y: number;
  width: number;
  height: number;
  cooldown: number;
  currentCooldown: number;
}

const CARD_WIDTH = 70;
const CARD_HEIGHT = 80;
const CARD_GAP = 10;
const CARD_Y = 10;
const CARD_START_X = BOARD_OFFSET_X + 120;

export class Grid {
  readonly rows = GRID_ROWS;
  readonly cols = GRID_COLS;

  private cards: CardLayout[] = [];
  private activeRows: number[] = [];

  applyLevel(level: LevelConfig): void {
    this.activeRows = level.activeRows;
    this.cards = level.unlockedPlants.map((type, index) => ({
      type,
      x: CARD_START_X + index * (CARD_WIDTH + CARD_GAP),
      y: CARD_Y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      cooldown: PLANT_COOLDOWNS[type],
      currentCooldown: 0,
    }));
  }

  unlockPlant(type: PlantType): void {
    if (this.cards.some((card) => card.type === type)) {
      return;
    }
    const index = this.cards.length;
    this.cards.push({
      type,
      x: CARD_START_X + index * (CARD_WIDTH + CARD_GAP),
      y: CARD_Y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      cooldown: PLANT_COOLDOWNS[type],
      currentCooldown: 0,
    });
  }

  isRowActive(row: number): boolean {
    return this.activeRows.includes(row);
  }

  cellToPixel(row: number, col: number): { x: number; y: number } {
    return {
      x: BOARD_OFFSET_X + col * CELL_SIZE,
      y: BOARD_OFFSET_Y + row * CELL_SIZE,
    };
  }

  pixelToCell(x: number, y: number): GridCell | null {
    const col = Math.floor((x - BOARD_OFFSET_X) / CELL_SIZE);
    const row = Math.floor((y - BOARD_OFFSET_Y) / CELL_SIZE);

    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }

    return { row, col };
  }

  getCardAt(x: number, y: number): PlantType | null {
    for (const card of this.cards) {
      if (x >= card.x && x <= card.x + card.width && y >= card.y && y <= card.y + card.height) {
        return card.type;
      }
    }
    return null;
  }

  updateCooldowns(dt: number): void {
    for (const card of this.cards) {
      card.currentCooldown = Math.max(0, card.currentCooldown - dt);
    }
  }

  startCooldown(type: PlantType): void {
    const card = this.cards.find((c) => c.type === type);
    if (card) {
      card.currentCooldown = card.cooldown;
    }
  }

  getCurrentCooldown(type: PlantType): number {
    return this.cards.find((c) => c.type === type)?.currentCooldown ?? 0;
  }

  resetCooldowns(): void {
    for (const card of this.cards) {
      card.currentCooldown = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;

    for (let row = 0; row < this.rows; row++) {
      const active = this.isRowActive(row);
      for (let col = 0; col < this.cols; col++) {
        const { x, y } = this.cellToPixel(row, col);
        if (active) {
          ctx.fillStyle = (row + col) % 2 === 0 ? '#8bc34a' : '#7cb342';
        } else {
          ctx.fillStyle = (row + col) % 2 === 0 ? '#8d6b3a' : '#795548';
        }
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }

    ctx.restore();
  }

  renderHUD(ctx: CanvasRenderingContext2D, sunCount: number, selectedCard: PlantType | null): void {
    ctx.save();

    // sun counter
    ctx.fillStyle = '#fdd835';
    ctx.beginPath();
    ctx.arc(BOARD_OFFSET_X + 20, CARD_Y + CARD_HEIGHT / 2, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#212121';
    ctx.font = 'bold 20px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(sunCount), BOARD_OFFSET_X + 48, CARD_Y + CARD_HEIGHT / 2);

    // cards
    for (const card of this.cards) {
      const isSelected = selectedCard === card.type;

      ctx.fillStyle = '#c8e6c9';
      ctx.fillRect(card.x, card.y, card.width, card.height);

      ctx.strokeStyle = isSelected ? '#ffeb3b' : '#4e342e';
      ctx.lineWidth = isSelected ? 4 : 2;
      ctx.strokeRect(card.x + 1, card.y + 1, card.width - 2, card.height - 2);

      const iconCx = card.x + card.width / 2;
      const iconCy = card.y + card.height * 0.4;
      renderPlantIcon(ctx, card.type, iconCx, iconCy, 20);

      ctx.fillStyle = '#212121';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(PLANT_COSTS[card.type]), iconCx, card.y + card.height - 12);
      ctx.textAlign = 'left';

      if (card.currentCooldown > 0) {
        const ratio = card.currentCooldown / card.cooldown;
        const maskHeight = card.height * ratio;

        ctx.fillStyle = 'rgba(60, 60, 60, 0.65)';
        ctx.fillRect(card.x, card.y + card.height - maskHeight, card.width, maskHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(Math.ceil(card.currentCooldown)), iconCx, card.y + card.height / 2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
      }
    }

    ctx.restore();
  }
}
