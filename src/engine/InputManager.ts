export interface CanvasPoint {
  x: number;
  y: number;
}

export class InputManager {
  private canvas: HTMLCanvasElement;
  private clickHandlers: Array<(point: CanvasPoint) => void> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.addEventListener('click', this.handleClick);
  }

  onClick(handler: (point: CanvasPoint) => void): void {
    this.clickHandlers.push(handler);
  }

  private handleClick = (event: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const point: CanvasPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    this.clickHandlers.forEach((handler) => handler(point));
  };

  destroy(): void {
    this.canvas.removeEventListener('click', this.handleClick);
  }
}
