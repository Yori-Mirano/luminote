class MidiAccess extends EventTarget {
  requestMidiAccess() {
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
   *
   * @fires MidiAccess#input_connected
   * @fires MidiAccess#input_disconnected
   */
  _onMidiSuccess = midiAccess => {
    console.log('MidiAccess -> API: OK');

    midiAccess.addEventListener("statechange", event => {
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

                /**
                 * Input connected
                 *
                 * @event MidiAccess#input_connected
                 */
                this.dispatchEvent(new Event('input_connected'));
                break;

              default:
            }
            break;

          case 'disconnected':
            console.log('MidiAccess -> Device: Input disconnected');

            /**
             * Input disconnected
             *
             * @event MidiAccess#input_disconnected
             */
            this.dispatchEvent(new Event('input_disconnected'));
            break;

          default:
        }
      }
    });

    this._connectInput(midiAccess);
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
   * Ressource: http://www.petesqbsite.com/sections/express/issue18/midifilespart1.html
   *
   * @param {MIDIMessageEvent} event
   *
   * @fires MidiAccess#note_on
   * @fires MidiAccess#note_off
   * @fires MidiAccess#sustain
   * @fires MidiAccess#softPedal
   */
  _onMidiMessage = event => {
    let data      = event.data,
        status    = data[0] & 0xF0,
        channel   = data[0] & 0x0F,
        data1     = data[1],
        data2     = data[2];

    switch (status) {
      // Note On/Off
      case 0x90: {
        if (/* Velocity: */ data2 > 0) {
          /**
           * Note On
           *
           * @event MidiAccess#note_on
           * @property {number} note (0 to 127)
           * @property {number} velocity (0 to 127)
           */
          this.dispatchEvent(new CustomEvent('note_on', {
            detail: {
              note: data1,
              velocity: data2
            }
          }));

        } else {
          /**
           * Note Off
           *
           * @event MidiAccess#note_off
           * @property {number} note (0 to 127)
           */
          this.dispatchEvent(new CustomEvent('note_off', {
            detail: {
              note: data1
            }
          }));
        }
        break;
      }

      // Note Off
      case 0x80: {
        /**
         * Note Off
         *
         * @event MidiAccess#note_off
         * @property {number} note (0 to 127)
         */
        this.dispatchEvent(new CustomEvent('note_off', {
          detail: {
            note: data1
          }
        }));
        break;
      }

      // Control Change
      case 0xB0: {
        switch (/* Controller type: */ data1) {
          // Sustain
          case 0x40:
            /**
             * Sustain
             *
             * @event MidiAccess#sustain
             * @property {number} level (0 to 127)
             */
            this.dispatchEvent(new CustomEvent('sustain', {
              detail: {
                level: data2
              }
            }));
            break;

          // Soft Pedal
          case 0x43:
            /**
             * Soft pedal
             *
             * @event MidiAccess#softPedal
             * @property {number} level (0 to 127)
             */
            this.dispatchEvent(new CustomEvent('softPedal', {
              detail: {
                level: data2
              }
            }));
            break;
        }

        break;
      }

      // System message
      case 0xF0:
        break;

      default:
        //console.log('MidiAccess -> data: ' + data);
    }
  };
}
