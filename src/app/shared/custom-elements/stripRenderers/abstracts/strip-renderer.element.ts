import { Strip } from "../../../strip/strip";
import { CustomElement } from "../../custom-element";

export abstract class StripRendererElement extends HTMLElement implements CustomElement {

  canvas: HTMLCanvasElement;
  factor: number = 1;
  private _strip: Strip;

  get strip() {
    return this._strip;
  }
  set strip(strip: Strip) {
    this._strip = strip;
    this.init();
  }

  connectedCallback() {
    this._initStyle();
    this._initCanvas();

    requestAnimationFrame(() => this._resize());

    window.addEventListener('resize', () => {
      this._resize();
    });
  }

  private _initStyle() {
    const style = document.createElement('style');

    // language=css
    style.innerHTML = `
      ${ this.tagName } {
        position: relative;
      }

      ${ this.tagName } > canvas {
        position: absolute;
        inset: 0;
      }
    `;

    this.appendChild(style);
  }

  private _initCanvas() {
    this.canvas = document.createElement('canvas');
    this.appendChild(this.canvas);
  }

  private _resize() {
    this.canvas.height = this.clientHeight;
    this.canvas.width  = this.clientWidth;
  }

  init() {
    if (this.strip) {
      this.onInit();
    }
  }

  render() {
    if (this.strip) {
      this.onRender();
    }
  }

  abstract onInit(): void;
  abstract onRender(): void;

}
