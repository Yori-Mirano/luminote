class Strip {
  _stripLength;
  _colorPerPixel;
  _floatRawData;
  _intRawData;
  isDirty = false

  constructor(length, colorPerPixel, r = 0, g = 0, b = 0, w = 0) {
    this._stripLength   = length;
    this._colorPerPixel = colorPerPixel;
    this._floatRawData  = [new Float64Array(this._stripLength * this._colorPerPixel)];
    this._intRawData    = new Uint8Array(this._stripLength * this._colorPerPixel);

    this.fill(r, g, b, w);
  }

  getLength() {
    return this._stripLength;
  }

  getColorPerPixel() {
    return this._colorPerPixel;
  }

  set(index, r, g, b, w = 0) {
    const lastR = this._floatRawData[index * this._colorPerPixel];
    const lastG = this._floatRawData[index * this._colorPerPixel + 1];
    const lastB = this._floatRawData[index * this._colorPerPixel + 2];
    let lastW = 0;

    if (this._colorPerPixel === 4) {
      lastW = this._floatRawData[index * this._colorPerPixel + 3];
    }

    if  (Math.round(r * 10000) !== Math.round(lastR * 10000)
      || Math.round(g * 10000) !== Math.round(lastG * 10000)
      || Math.round(b * 10000) !== Math.round(lastB * 10000)
      || Math.round(w * 10000) !== Math.round(lastW * 10000)) {
        
      this._floatRawData[index * this._colorPerPixel]    = r;
      this._floatRawData[index * this._colorPerPixel +1] = g;
      this._floatRawData[index * this._colorPerPixel +2] = b;
  
      this._intRawData[index * this._colorPerPixel]    = Math.floor(r * 256);
      this._intRawData[index * this._colorPerPixel +1] = Math.floor(g * 256);
      this._intRawData[index * this._colorPerPixel +2] = Math.floor(b * 256);
  
      if (this._colorPerPixel === 4) {
        this._floatRawData[index * this._colorPerPixel +3] = w;
        this._intRawData[index * this._colorPerPixel +3] = Math.floor(w * 256);
      }
  
      this.isDirty = true;
    }
  }

  get(index) {
    const color = {
      r: this._floatRawData[index * this._colorPerPixel],
      g: this._floatRawData[index * this._colorPerPixel +1],
      b: this._floatRawData[index * this._colorPerPixel +2],
    }
    
    if (this._colorPerPixel === 4) {
      color.w = this._floatRawData[index * this._colorPerPixel +3];
    }

    return color;
  }

  getInt(index) {
    const color = {
      r: this._intRawData[index * this._colorPerPixel],
      g: this._intRawData[index * this._colorPerPixel +1],
      b: this._intRawData[index * this._colorPerPixel +2],
    }
    
    if (this._colorPerPixel === 4) {
      color.w = this._intRawData[index * this._colorPerPixel +3];
    }

    return color;
  }

  fill(r, g, b, w = 0) {
    for (let i = 0; i < this._stripLength; i++) {
      this.set(i, r, b, b, w);
    }
  }

  getIntRawData() {
    return this._intRawData;
  }

  forEach(fn) {
    for (let i = 0, l = this.getLength(); i < l; i++) {
      fn(i);
    }
  }
}