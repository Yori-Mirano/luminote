/**
 * @group Strip
 * @module LineStripRendererElement
 */
import { CanvasStripRendererElement } from "./abstracts/canvas.strip-renderer.element";

export class LineStripRendererElement extends CanvasStripRendererElement {

  onRender() {
    const pixelWidth = this.canvas.width / this.strip.length;
    const pixelheight = this.canvas.height;

    this.strip.forEach(i => {
      const color = this.strip.get(i);

      const r = Math.min(255, (255 * color.r  +  255 * color.w * .50) * this.factor);
      const g = Math.min(255, (255 * color.g  +  255 * color.w * .50) * this.factor);
      const b = Math.min(255, (255 * color.b  +  255 * color.w * .35) * this.factor);

      this.context.fillStyle = `rgb(${r}, ${g}, ${b})`;
      this.context.fillRect(pixelWidth * i, this.canvas.height - pixelheight, pixelWidth, pixelheight);
    });
  }

}

customElements.define('app-line-strip-renderer', LineStripRendererElement);
