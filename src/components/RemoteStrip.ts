import Strip from "./Strip";

export default class RemoteStrip {
  host: string;
  socket: WebSocket;
  strip: Strip;
  fpsMax: number;
  modeEcoDelay = 60; // in seconds
  _lastSyncTime = 0;
  _modeEcoTimeInterval: ReturnType<typeof setInterval>;
  _isEcoMode = false;
  _isClosed = true;
  onConnected: (strip: Strip, syncRemoteStrip: () => void) => void

  constructor(host: string, callback: (strip: Strip, syncRemoteStrip: () => void) => void) {
    this.host = host;
    this.onConnected = callback;
    this.connect();
  }

  connect() {
    this.socket = new WebSocket(`ws://${this.host}`);

    // onopen
    this.socket.onopen = () => {
      console.log('RemoteStrip -> Websocket: Connection established');
      console.time('RemoteStrip -> Websocket: connected');
      this._isClosed = false;
    };
    
    
    // onmessage
    this.socket.onmessage = event => {
      console.log('RemoteStrip -> Websocket: Data reception: ' + event.data);
    
      try {
        const jsonData = JSON.parse(event.data);
        
        if (jsonData.stripLength && jsonData.colorPerPixel && jsonData.fpsMax) {
          this.fpsMax = jsonData.fpsMax;
          this.strip = new Strip(jsonData.stripLength, jsonData.colorPerPixel);

          if (typeof this.onConnected === 'function') {
            this.onConnected(this.strip, () => this.sync());
          }

          this._modeEcoTimeInterval = setInterval(() => this._isEcoMode = true, this.modeEcoDelay * 1000);
        }
      } catch (e) {
        console.log(e)
      }
    };
    
    
    // onclose
    this.socket.onclose = () => {
      console.log('RemoteStrip -> Websocket: Connection closed');
      console.timeEnd('RemoteStrip -> Websocket: connected');
      clearInterval(this._modeEcoTimeInterval);
      this._isClosed = true;
      this.connect();
    };


    // onerror
    this.socket.onerror = (err: ErrorEvent) => {
      console.error('RemoteStrip -> Websocket: Socket encountered error: ', err.message, ' Closing socket');
      this.socket.close();
    };
  }


  sync() {
    const time = performance.now();

    if (
      time > this._lastSyncTime + (1000 / this.fpsMax)
      && !this._isClosed
      && this.socket
      && this.strip
      && (!this._isEcoMode || (this._isEcoMode && this.strip.isDirty))
    ) {
      //console.log('RemoteStrip -> sync')
      this._lastSyncTime = time;
      this._isEcoMode = false;
      this.strip.isDirty = false;
      this.socket.send(this.strip.getIntRawData());
    }
  }
}
