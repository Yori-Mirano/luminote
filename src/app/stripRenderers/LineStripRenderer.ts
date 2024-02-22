import { CanvasStripRenderer } from "./abstracts/CanvasStripRenderer";

export class LineStripRenderer extends CanvasStripRenderer {

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
