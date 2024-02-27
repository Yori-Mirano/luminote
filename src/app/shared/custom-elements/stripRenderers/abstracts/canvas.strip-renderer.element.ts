/**
 * @module CanvasStripRendererElement
 */
import { StripRendererElement } from "./strip-renderer.element";

export abstract class CanvasStripRendererElement extends StripRendererElement {

  context: CanvasRenderingContext2D;

  onInit() {
    this.context = this.canvas.getContext('2d');
  }

}
