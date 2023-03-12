import Strip from "../Strip";
import Note from "../Note.interface";

export default class AssistantStripBehaviour {
  strip;
  notes;

  constructor(strip: Strip, notes: Note[]) {
    this.strip = strip;
    this.notes = notes;
  }

  update() {
    this.strip.forEach(i => {
      if (!this.notes[i].pressed && !this.notes[i].pedal) {
        this.strip.set(i, 0, 0, 0, 0);
      }
    });
    
    this.strip.forEach(i => {
      if (this.notes[i].pressed || this.notes[i].pedal) {
        this.strip.forEach(j => {
          if (i !== j && i % 12 === j % 12) {
            this.strip.set(j, 2, 4, 4, 0);
          }
        });
      }
    });

    this.strip.forEach(i => {
      if (this.notes[i].pressed) {
        this.strip.set(i, 0, 0, 0, 60);
        
      } else if (this.notes[i].pedal) {
        this.strip.set(i, 20, 40, 40, 0);
      }
    });
  }
}
