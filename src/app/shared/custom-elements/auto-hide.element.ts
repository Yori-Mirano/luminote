/**
 * @module AutoHideElement
 */
import { CustomElement } from "../custom-element";

/**
 * An element that automatically hides itself after a specified delay
 *
 * <app-auto-hide data-delay="1000">
 *   <!-- some content -->
 * </app-auto-hide>
 */
export class AutoHideElement extends HTMLElement implements CustomElement {

  static tagName = 'app-auto-hide';

  dataset: {
    delay: string;
    hidden: string;
  }

  mouseover: boolean = false;
  hasFocus: boolean = false;
  private timeout: ReturnType<typeof setTimeout>;

  connectedCallback() {
    this.initStyle();
    this.initEventListeners();
    this.startAutoHidingDelay();
  }

  initStyle() {
    const styleElement = document.createElement('style');

    // language=css
    styleElement.innerHTML = `
      @keyframes app-auto-hide--fade-in {
        from { opacity: 0.1; transform: translateX(-5vw); }
        to   { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes app-auto-hide--fade-out {
        from { opacity: 1; transform: translateX(0); }
        to   { opacity: 0; transform: translateX(-5vw); }
      }
      
      ${ this.tagName }:not([data-hidden]) {
        animation: app-auto-hide--fade-in 120ms forwards cubic-bezier(0, 0, 0.2, 1);
      }

      ${ this.tagName }[data-hidden] {
        animation: app-auto-hide--fade-out 300ms forwards cubic-bezier(0.4, 0, 1, 1);
      }
    `;

    this.prepend(styleElement);
  }

  initEventListeners() {
    this.parentElement.addEventListener('mousemove', () => { this.show(); this.startAutoHidingDelay() });

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

customElements.define(AutoHideElement.tagName, AutoHideElement);
