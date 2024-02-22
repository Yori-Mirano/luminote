import './AutoHiddenLayer.scss';

export class AutoHiddenLayer {
  element: HTMLElement;
  delay: number;
  mouseover: boolean;

  private _timeout: NodeJS.Timeout;

  constructor(element: HTMLElement, delay = 3000) {
    this.element    = element;
    this.delay      = delay;
    this.mouseover  = false;

    this.element.classList.add('auto-hidden-layer');

    this.initRules();
    this.autoHide();
  }

  initRules() {
    document.addEventListener('mousemove', () => {
      this.show();
      if (!this.mouseover) {
        this.autoHide();
      }
    });

    this.element.addEventListener('keydown', () => { this.stopAutoHiding; this.show() });
    this.element.addEventListener('focusin', () => { this.stopAutoHiding; this.show() });

    this.element.addEventListener('mouseenter', () => {
      this.mouseover = true;
      this.stopAutoHiding();
    });

    this.element.addEventListener('mouseleave', () => {
      this.mouseover = false;
    });
  }

  autoHide() {
    this.stopAutoHiding();
    if (this.mouseover === false) {
      clearTimeout(this._timeout);
      this._timeout = setTimeout(() => this.hide(), this.delay);
    }
  }

  stopAutoHiding() {
    if (this._timeout) { clearTimeout(this._timeout) }
  }

  hide() {
    this.element.classList.add('auto-hidden-layer--hidden')
  }

  show() {
    this.element.classList.remove('auto-hidden-layer--hidden')
  }
}
