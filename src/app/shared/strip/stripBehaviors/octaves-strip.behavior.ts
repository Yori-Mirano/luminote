/**
 * @group Strip
 * @module OctavesStripBehavior
 */
import { StripBehavior } from "./abstracts/strip-behavior";

export class OctavesStripBehavior extends StripBehavior {

  onTick() {
    this.strip.forEach(i => {
      if (!this.notes[i].pressed && !this.notes[i].sustained) {
        this.strip.set(i, 0, 0, 0, 0);
      }
    });
    
    this.strip.forEach(i => {
      if (this.notes[i].pressed || this.notes[i].sustained) {
        this.strip.forEach(j => {
          if (i !== j && i % 12 === j % 12) {
            this.strip.set(j, .02, .04, .04, 0);
          }
        });
      }
    });

    this.strip.forEach(i => {
      if (this.notes[i].pressed) {
        this.strip.set(i, 0, 0, 0, .60);
        
      } else if (this.notes[i].sustained) {
        this.strip.set(i, .20, .40, .40, 0);
      }
    });
  }

}
