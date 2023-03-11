class SimpleStripRenderer {
  parentElement
  strip;
  factor;
  canvas;
  context;

  constructor(parentElement, strip, factor = 1) {
    this.parentElement = parentElement;
    this.strip = strip;
    this.factor = factor;

    this.canvas = document.createElement('canvas');
    this.canvas.style.position  = 'absolute';
    this.canvas.style.top       = '0';
    this.canvas.style.bottom    = '0';
    this.canvas.style.left      = '0';
    this.canvas.style.right     = '0';
    this.context                = this.canvas.getContext('2d');
    this.parentElement.appendChild(this.canvas);
    
    this._resize();

    window.addEventListener('resize', () => {
      this._resize();
    });
  }

  
  _resize() {
    this.canvas.height = this.parentElement.clientHeight;
    this.canvas.width  = this.parentElement.clientWidth;
  }


  render() {
    const pixelWidth = this.canvas.width / this.strip.length;
    const pixelheight = this.canvas.height;

    this.strip.forEach(i => {
      const color = this.strip.get(i);

      const r = Math.min(255, 255 * color.r * this.factor  +  255 * color.w * this.factor * .50);
      const g = Math.min(255, 255 * color.g * this.factor  +  255 * color.w * this.factor * .50);
      const b = Math.min(255, 255 * color.b * this.factor  +  255 * color.w * this.factor * .35);

      this.context.fillStyle = `rgb(${r}, ${g}, ${b})`;
      this.context.fillRect(pixelWidth * i, this.canvas.height - pixelheight, pixelWidth, pixelheight);
    });
  }
}