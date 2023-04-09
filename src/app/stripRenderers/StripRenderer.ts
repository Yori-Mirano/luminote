import { Strip } from "../Strip";

export abstract class StripRenderer {
  parentElement: HTMLElement
  strip: Strip;
  factor: number;
  canvas: HTMLCanvasElement;

  protected constructor(parentElement: HTMLElement, strip: Strip, factor = 1) {
    this.parentElement = parentElement;
    this.strip = strip;
    this.factor = factor;

    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.inset = '0';
    this.parentElement.appendChild(this.canvas);

    this._resize();

    window.addEventListener('resize', () => {
      this._resize();
    });
  }

  _resize() {
    this.canvas.height = this.parentElement.clientHeight;
    this.canvas.width  = this.parentElement.clientWidth;
  }

  abstract render(): void;
}