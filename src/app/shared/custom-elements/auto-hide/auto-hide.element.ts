import './auto-hide.element.scss';
import { CustomElement } from "../custom-element";

/**
 * An element that automatically hides itself after a specified delay
 *
 * <app-auto-hide data-delay="1000">
 *   <!-- some content -->
 * </app-auto-hide>
 */
export class AutoHideElement extends HTMLElement implements CustomElement {

  dataset: {
    delay: string;
    hidden: string;
  }

  mouseover: boolean = false;
  hasFocus: boolean = false;
  private timeout: ReturnType<typeof setTimeout>;

  connectedCallback() {
    this.initEventListeners();
    this.startAutoHidingDelay();
  }

  initEventListeners() {
    document.addEventListener('mousemove', () => { this.show(); this.startAutoHidingDelay() });

    this.addEventListener('focusin', () => { this.hasFocus = true; this.cancelAutoHidingDelay(); this.show() });
    this.addEventListener('focusout', () => { this.hasFocus = false; this.startAutoHidingDelay() });

    this.addEventListener('mouseenter', () => { this.mouseover = true; this.cancelAutoHidingDelay() });
    this.addEventListener('mouseleave', () => { this.mouseover = false; this.startAutoHidingDelay() });
  }

  startAutoHidingDelay() {
    if (!this.mouseover && !this.hasFocus) {
      this.cancelAutoHidingDelay();

      this.timeout = setTimeout(
        () => this.hide(),
        parseInt(this.dataset.delay)
      );
    }
  }

  cancelAutoHidingDelay() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  hide() {
    this.dataset.hidden = '';
  }

  show() {
    delete this.dataset.hidden;
  }
}

customElements.define('app-auto-hide', AutoHideElement);
