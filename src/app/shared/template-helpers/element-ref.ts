/**
 * @group Template helpers
 * @module ElementRef
 */
export class ElementRef<T = HTMLElement> {

  static count = 0;

  private _element: T;
  private _ref: number;

  constructor() {
    ElementRef.count++;
    this._ref = ElementRef.count;
  }

  toString() {
    return this.token;
  }

  get token() {
    return `data-element-ref="${ this.ref }"`;
  }

  get ref() {
    return this._ref
  };

  get element(): T {
    if (!this._element) {
      this._element = <T>document.querySelector(`[${ this.token }]`);
    }

    return this._element;
  }

}
