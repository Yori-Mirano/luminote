/**
 * @group Strip
 * @module GlslStripRendererElement
 */
import { StripRendererElement } from "./strip-renderer.element";
import GlslCanvas from "glslCanvas";

export abstract class GlslStripRendererElement extends StripRendererElement {

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
