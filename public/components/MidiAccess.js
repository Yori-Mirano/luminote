class MidiAccess {
  /**
   *
   * @type {boolean}
   */
  static debug = false;

  /**
   *
   * @param {string} message
   */
  static log(message) {
    if (MidiAccess.debug) {
      console.log(message);
    }
  }


  /**
   * Callback placeholder.
   */
  onInputConnect = () => {};


  /**
   * Callback placeholder.
   */
  onInputDisonnect = () => {};


  /**
   * Callback placeholder.
   * @param {number} note
   * @param {number} velocity
   */
  onKeyDown = (note, velocity) => {};


  /**
   * Callback placeholder.
   * @param {number} note
   */
  onKeyUp   = note => {};


  /**
   * Callback placeholder.
   * @param {number} level
   */
  onPedal = level => {};


  /**
   *
   */
  constructor() {
    if (navigator.requestMIDIAccess) {

      navigator.requestMIDIAccess({ sysex: false, software: false })
          .then(this._onMidiSuccess, this._onMidiFailure);

    } else {
      alert("No MIDI support in your browser. Please try with Google Chrome.");
    }
  }


  /**
   *
   * @param {MIDIAccess} midiAccess
   */
  _onMidiSuccess = midiAccess => {
    console.log('MidiAccess -> API: OK');

    this._connectInput(midiAccess);

    midiAccess.onstatechange = event => {
      const port = event.port;

      if(port.type === 'input') {
        switch (port.state) {

          case 'connected':
            switch (port.connection) {

              case 'closed':
                this._connectInput(midiAccess);
                break;

              case 'open':
                console.log('MidiAccess -> Device: Input connected');
                this.onInputConnect();
                break;

              default:
            }
            break;

          case 'disconnected':
            console.log('MidiAccess -> Device: Input disconnected');
            this.onInputDisonnect();
            break;

          default:
        }
      }
    };
  };


  /**
   *
   * @param {string} error
   */
  _onMidiFailure = error => {
    console.log("MidiAccess: No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + error);
  };


  /**
   *
   * @param {MIDIAccess} midiAccess
   */
  _connectInput(midiAccess) {
    const inputs = midiAccess.inputs.values();

    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
      console.log(input);
      input.value.onmidimessage = this._onMidiMessage;
    }

    /*
    const outputs = midiAccess.outputs.values();

    for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
      console.log(output);
      output.value.send([0b1001 << 4, 60, 127]); // sends the message: note on, middle C, full velocity
    }
    */
  }


  /**
   *
   * @param {MIDIMessageEvent} event
   */
  _onMidiMessage = event => {
    let data      = event.data,
        command   = data[0] >> 4,
        channel   = data[0] & 0b00001111,
        note      = data[1],
        velocity  = data[2];

    switch (command) {
      // Note On/Off
      case 0b1001:
        MidiAccess.log('MidiAccess -> data: ' + data);

        // Note ON
        if (velocity > 0) {
          this.onKeyDown(note, velocity);

          // Note OFF
        } else {
          this.onKeyUp(note, velocity);
        }
        break;

      // Note Off
      case 0b1000:
        this.onKeyUp(note, velocity);
        break;

      // Pedal
      case 0b1011:
        if (note === 0b01000000) {
          this.onPedal(velocity);
        }
        break;

      // System message
      case 0b1111:
        break;

      default:
        MidiAccess.log('MidiAccess -> data: ' + data);
    }
  };
}
