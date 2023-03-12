import Strip from "../Strip";
import Note from "../Note.interface";

export default class RipplesStripBehaviour {
  strip;
  notes;
  stripBuffer;

  constructor(strip: Strip, notes: Note[]) {
    this.strip = strip;
    this.notes = notes;
    this.stripBuffer = new Strip(strip.length, strip.getColorPerPixel());
  }


  update() {
      this.stripBuffer.forEach(i => {
        const currentColor = this.strip.get(i);
        let leftColor, rightColor;
  
        if (i > 0) {
          leftColor = this.strip.get(i-1);
        }
  
        if (i < this.stripBuffer.length -1) {
          rightColor = this.strip.get(i+1);
        }
  
        const newColor = {
          r: ((leftColor ? leftColor.r : 0) + currentColor.r + (rightColor ? rightColor.r : 0)) / (1 + (leftColor ? 1 : 0) + (rightColor ? 1 : 0)),
          g: ((leftColor ? leftColor.g : 0) + currentColor.g + (rightColor ? rightColor.g : 0)) / (1 + (leftColor ? 1 : 0) + (rightColor ? 1 : 0)),
          b: ((leftColor ? leftColor.b : 0) + currentColor.b + (rightColor ? rightColor.b : 0)) / (1 + (leftColor ? 1 : 0) + (rightColor ? 1 : 0)),
          w: ((leftColor ? leftColor.w : 0) + currentColor.w + (rightColor ? rightColor.w : 0)) / (1 + (leftColor ? 1 : 0) + (rightColor ? 1 : 0)),
        }
        this.stripBuffer.set(i, newColor.r, newColor.g, newColor.b, newColor.w);
      });
  

      this.strip.forEach(i => {
        const newColor = this.stripBuffer.get(i);
  
        if (this.notes[i].pressed) {
          this.strip.set(i, newColor.r, newColor.g, newColor.b, newColor.w + this.notes[i].velocity*.2);
          this.notes[i].velocity *= 0.99;
          
        } else if (this.notes[i].pedal) {
          this.strip.set(
            i,
            newColor.r + this.notes[i].velocity*.15 *.2,
            newColor.g + this.notes[i].velocity*.3  *.2,
            newColor.b + this.notes[i].velocity*.3  *.2,
            newColor.w * 0.95);
            
          this.notes[i].velocity *= 0.99;
  
        } else {
          this.strip.set(i, newColor.r * 0.95, newColor.g * 0.95, newColor.b * 0.95, newColor.w * 0.95);
        }
      });
  }
}
