/**
 * @group Strip
 * @module StripElement
 */
import { CustomElement } from "../custom-element";
import { Strip } from "../strip/strip";

export class StripElement extends HTMLElement implements CustomElement {

  static tagName = 'app-strip';

  private _strip: Strip;
  private _ledElements: HTMLInputElement[] = [];

  factor: number = 8;

  get strip() {
    return this._strip;
  }
  set strip(strip: Strip) {
    this._strip = strip;
    this.init();
  }

  connectedCallback() {
    const styleElement = document.createElement('style');

    // language=css
    styleElement.innerHTML = `
      ${ this.tagName } {
        display: flex;
        
        > * {
          aspect-ratio: 1/2;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background: none;
          border: 0;
          cursor: pointer;
          padding: 0;
          height: auto;
          transform: scale(0.2, 0.7);
          overflow: hidden;

          &::-webkit-color-swatch-wrapper {
            padding: 0;
          }

          &::-webkit-color-swatch{
            border: 0;
            border-radius: 0;
          }

          &::-moz-color-swatch,
          &::-moz-focus-inner{
            border: 0;
          }

          &::-moz-focus-inner{
            padding: 0;
          }
        }
      }
    `;

    this.prepend(styleElement);
  }

  init() {
    this._strip.forEach(() => {
      const ledElement = document.createElement('input');

      ledElement.setAttribute('type', 'color');

      ledElement.addEventListener('input', () => {
        if (StripElement.hasFixedColor(ledElement) && ledElement.value === '#000000') {
          StripElement.disableFixedColor(ledElement);
        } else {
          StripElement.enableFixedColor(ledElement);
        }
      })

      this.appendChild(ledElement);
      this._ledElements.push(ledElement);
    });
  }

  update() {
    this._strip.forEach((i) => {
      const element = this._ledElements[i];

      const color = this.strip.get(i);
      const r = StripElement.fromNormalToHexa((255 * color.r  +  255 * color.w * .50) * this.factor);
      const g = StripElement.fromNormalToHexa((255 * color.g  +  255 * color.w * .50) * this.factor);
      const b = StripElement.fromNormalToHexa((255 * color.b  +  255 * color.w * .35) * this.factor);

      if (StripElement.hasFixedColor(element)) {
        const stripR = Math.min(1, color.r + StripElement.fromHexaToNormal( element.value.substring(1, 2)));
        const stripG = Math.min(1, color.g + StripElement.fromHexaToNormal( element.value.substring(3, 4)));
        const stripB = Math.min(1, color.b + StripElement.fromHexaToNormal( element.value.substring(5, 6)));
        this._strip.set(i, stripR, stripG, stripB, color.w);

      } else {

        element.value = `#${ r }${ g }${ b }`;
      }
    });
  }

  static hasFixedColor(element: HTMLElement) {
    return 'fixedColor' in element.dataset;
  }

  static enableFixedColor(element: HTMLElement) {
    element.dataset.fixedColor = '';
  }

  static disableFixedColor(element: HTMLElement) {
    delete element.dataset.fixedColor
  }

  static fromHexaToNormal(hexaNumber: string) {
    return parseInt( hexaNumber, 16 ) / 255
  }

  static fromNormalToHexa(normalNumber: number) {
    return Math.floor(Math.min(255, normalNumber)).toString(16).padStart(2, '0');
  }

}

customElements.define(StripElement.tagName, StripElement);
