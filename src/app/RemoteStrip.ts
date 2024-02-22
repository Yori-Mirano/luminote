import { Strip } from "./Strip";

export class RemoteStrip extends EventTarget {
  /**
   * @eventProperty
   */
  static readonly ON_CONNECTED = 'connected';

  /**
   * @eventProperty
   */
  static readonly ON_DISCONNECTED = 'disconnected';

  host: string;
  socket: WebSocket;
  strip: Strip;
  fpsMax: number;
  modeEcoDelay = 60; // in seconds
  _lastSyncTime = 0;
  _modeEcoTimeInterval: ReturnType<typeof setInterval>;
  _isEcoMode = false;
  _isClosed = true;
  _isDisconnectionRequested = false;
  onConnected: (strip: Strip, syncRemoteStrip: () => void) => void

  constructor(host: string, callback: (strip: Strip, syncRemoteStrip: () => void) => void) {
    super();
    this.host = host;
    this.onConnected = callback;
    this.connect();
  }

  connect() {
    this._isDisconnectionRequested = false;
    this.socket = new WebSocket(`ws://${this.host}`);

    // onopen
    this.socket.onopen = () => {
      console.log('RemoteStrip -> Websocket: Connection established');
      console.time('RemoteStrip -> Websocket: connected');
      this.dispatchEvent(new Event(RemoteStrip.ON_CONNECTED));
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
      this.dispatchEvent(new Event(RemoteStrip.ON_DISCONNECTED));
      this._isClosed = true;

      if (!this._isDisconnectionRequested) {
        this.connect();
      }
    };


    // onerror
    this.socket.onerror = (err: ErrorEvent) => {
      console.error('RemoteStrip -> Websocket: Socket encountered error: ', err.message, ' Closing socket');
      this.socket.close();
    };
  }

  disconnect() {
    if (this.socket) {
      this._isDisconnectionRequested = true;
      this.socket.close();
    }
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
