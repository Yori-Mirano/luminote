/**
 * @group Strip
 * @module SimpleStripBehavior
 */
import { StripBehavior } from "./abstracts/strip-behavior";

export class SimpleStripBehavior extends StripBehavior {

  onTick() {
    this.strip.forEach(i => {
      if (this.notes[i].pressed) {
        this.strip.set(i, 0, 0, 0, this.notes[i].velocity);
        this.notes[i].velocity *= 0.99;
        
      } else if (this.notes[i].sustained) {
        this.strip.set(i, this.notes[i].velocity*.15, this.notes[i].velocity*.3, this.notes[i].velocity*.3, 0);
        this.notes[i].velocity *= 0.99;

      } else {
        const previousColor = this.strip.get(i);
        this.strip.set(i, previousColor.r * 0.8, previousColor.g * 0.8, previousColor.b * 0.8, previousColor.w * 0.8);
      }
    });
  }

}
