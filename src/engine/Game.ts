import { GameEngine } from './GameEngine';
import { Grid, type GridCell } from './Grid';
import { InputManager } from './InputManager';
import { EventBus } from '../utils/EventBus';
import {
  CherryBomb,
  PLANT_COSTS,
  Peashooter,
  Plant,
  Repeater,
  SnowPea,
  Sunflower,
  WallNut,
  type PlantType,
} from '../objects/Plant';
import { CELL_SIZE } from '../utils/constants';

const PLANT_FACTORIES: Record<PlantType, (x: number, y: number, row: number) => Plant> = {
  sunflower: (x, y, row) => new Sunflower(x, y, row),
  peashooter: (x, y, row) => new Peashooter(x, y, row),
  wallnut: (x, y, row) => new WallNut(x, y, row),
  snowpea: (x, y, row) => new SnowPea(x, y, row),
  repeater: (x, y, row) => new Repeater(x, y, row),
  cherrybomb: (x, y, row) => new CherryBomb(x, y, row),
};

export class Game extends GameEngine {
  private readonly grid = new Grid();

  private sunCount = 0;
  private selectedPlant: PlantType | null = null;
  private highlightedCell: GridCell | null = null;

  readonly events = new EventBus();
  readonly input: InputManager;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.input = new InputManager(canvas);
    this.input.onClick((point) => this.handleClick(point.x, point.y));
  }

  private handleClick(x: number, y: number): void {
    if (this.handleGlobalClick(x, y)) {
      return;
    }

    const collectedSun = this.collectSunAt(x, y);
    if (collectedSun !== null) {
      this.sunCount += collectedSun;
      return;
    }

    const rewardPlant = this.collectRewardCardAt(x, y);
    if (rewardPlant !== null) {
      this.grid.unlockPlant(rewardPlant);
      return;
    }

    const card = this.grid.getCardAt(x, y);
    if (card) {
      const onCooldown = this.grid.getCurrentCooldown(card) > 0;
      const affordable = this.sunCount >= PLANT_COSTS[card];
      if (onCooldown || !affordable) {
        return;
      }
      this.selectedPlant = this.selectedPlant === card ? null : card;
      return;
    }

    const cell = this.grid.pixelToCell(x, y);
    if (!cell) {
      return;
    }

    if (!this.selectedPlant) {
      this.highlightedCell = cell;
      return;
    }

    this.tryPlant(this.selectedPlant, cell);
  }

  private tryPlant(type: PlantType, cell: GridCell): void {
    if (!this.levelManager.isRowActive(cell.row)) {
      return;
    }

    const cost = PLANT_COSTS[type];
    if (this.sunCount < cost) {
      return;
    }

    const { x, y } = this.grid.cellToPixel(cell.row, cell.col);
    const occupied = this.plants.some(
      (plant) => plant.active && plant.x === x + 5 && plant.y === y + 5,
    );
    if (occupied) {
      return;
    }

    const plant = PLANT_FACTORIES[type](x + 5, y + 5, cell.row);

    this.sunCount -= cost;
    this.addPlant(plant);
    this.narrator.narratePlanted(type);
    this.grid.startCooldown(type);
    this.selectedPlant = null;
    this.highlightedCell = null;
  }

  protected startLevel(levelId: string): void {
    super.startLevel(levelId);
    this.sunCount = this.levelManager.currentLevel.initialSun;
    this.selectedPlant = null;
    this.highlightedCell = null;
    this.grid.applyLevel(this.levelManager.currentLevel);
  }

  protected update(dt: number): void {
    this.grid.updateCooldowns(dt);
  }

  protected draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.grid.render(this.ctx);

    if (this.selectedPlant && this.highlightedCell) {
      const { x, y } = this.grid.cellToPixel(this.highlightedCell.row, this.highlightedCell.col);
      this.ctx.save();
      this.ctx.strokeStyle = '#ffeb3b';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(x + 1.5, y + 1.5, CELL_SIZE - 3, CELL_SIZE - 3);
      this.ctx.restore();
    }

    this.grid.renderHUD(this.ctx, this.sunCount, this.selectedPlant);
  }
}
