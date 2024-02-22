import { StripRenderer } from "./StripRenderer";

export abstract class CanvasStripRenderer extends StripRenderer {

  context: CanvasRenderingContext2D;

  onInit() {
    this.context = this.canvas.getContext('2d');
  }

}
