import { StripRenderer } from "./StripRenderer";
import GlslCanvas from "glslCanvas";

export abstract class GlslStripRenderer extends StripRenderer {

  glslCanvas: GlslCanvas;

  onInit() {
    const fragment = this.onInitFragment()
    this.glslCanvas = new GlslCanvas(this.canvas, { fragmentString: fragment });
  }

  abstract onInitFragment(): string;

  onRender() {
    this.glslCanvas.setUniform('u_array', ...this.strip._floatRawData);
  }

}
