import { StripBehavior } from "./abstracts/StripBehavior";

export class AssistantStripBehavior extends StripBehavior {

  onTick() {
    this.strip.forEach(i => {
      if (!this.notes[i].pressed && !this.notes[i].pedal) {
        this.strip.set(i, 0, 0, 0, 0);
      }
    });
    
    this.strip.forEach(i => {
      if (this.notes[i].pressed || this.notes[i].pedal) {
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
        
      } else if (this.notes[i].pedal) {
        this.strip.set(i, .20, .40, .40, 0);
      }
    });
  }

}
