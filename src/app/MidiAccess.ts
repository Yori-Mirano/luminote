import MIDIAccess = WebMidi.MIDIAccess;
import MIDIMessageEvent = WebMidi.MIDIMessageEvent;


export interface NoteOnEvent {
  /** Midi note id from 0 to 127 */
  note: number;

  /** Velocity from 0 to 127 */
  velocity: number;
}

export interface NoteOffEvent {
  /** Midi note id from 0 to 127 */
  note: number;
}

export interface SustainEvent {
  /** Level from 0 to 127 */
  level: number;
}

export interface SoftPedalEvent {
  /** Level from 0 to 127 */
  level: number;
}

export class MidiAccess extends EventTarget {
  /**
   * @eventProperty
   */
  static readonly ON_INPUT_CONNECTED= "input_connected";

  /**
   * @eventProperty
   */
  static readonly ON_INPUT_DISCONNECTED= "input_disconnected";

  /**
   * @eventProperty
   */
  static readonly ON_NOTE_ON= "note_on";

  /**
   * @eventProperty
   */
  static readonly ON_NOTE_OFF= "note_off";

  /**
   * @eventProperty
   */
  static readonly ON_SUSTAIN= "sustain";

  /**
   * @eventProperty
   */
  static readonly ON_SOFT_PEDAL= "softPedal";


  requestMidiAccess() {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess({ sysex: false })
        .then(this._onMidiSuccess)
        .catch(this._onMidiFailure);

    } else {
      alert("No MIDI support in your browser. Please try with Google Chrome.");
    }
  }

  /**
   *
   * @param midiAccess
   */
  _onMidiSuccess = (midiAccess: MIDIAccess) => {
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
                this.dispatchEvent(new Event(MidiAccess.ON_INPUT_CONNECTED));
                break;

              default:
            }
            break;

          case 'disconnected':
            console.log('MidiAccess -> Device: Input disconnected');
            this.dispatchEvent(new Event(MidiAccess.ON_INPUT_DISCONNECTED));
            break;

          default:
        }
      }
    });

    this._connectInput(midiAccess);
  };


  /**
   *
   * @param error
   */
  _onMidiFailure = (error: string) => {
    console.log("MidiAccess: No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + error);
  };


  /**
   *
   * @param midiAccess
   */
  _connectInput(midiAccess: MIDIAccess) {
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
   * @see: http://www.petesqbsite.com/sections/express/issue18/midifilespart1.html
   *
   * @param event
   */
  _onMidiMessage = (event: MIDIMessageEvent) => {
    let data      = event.data,
        status    = data[0] & 0xF0,
        //channel   = data[0] & 0x0F,
        data1     = data[1],
        data2     = data[2];

    switch (status) {
      // Note On/Off
      case 0x90: {
        if (/* Velocity: */ data2 > 0) {
          this.triggerNoteOn(data1 /* note */, data2 /*velocity */);

        } else {
          this.triggerNoteOff(data1 /* note */);
        }
        break;
      }

      // Note Off
      case 0x80: {
        this.triggerNoteOff(data1 /* note */);
        break;
      }

      // Control Change
      case 0xB0: {
        switch (/* Controller type: */ data1) {
          // Sustain
          case 0x40: {
            this.triggerSustain(data2 /* level */);
            break;
          }

          // Soft Pedal
          case 0x43: {
            this.triggerSoftPedal(data2 /* level */);
            break;
          }
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

  triggerNoteOn(note: number, velocity: number) {
    const event: CustomEventInit<NoteOnEvent> = {
      detail: {
        note: note,
        velocity: velocity
      }
    };
    this.dispatchEvent(new CustomEvent(MidiAccess.ON_NOTE_ON, event));
  }

  triggerNoteOff(note: number) {
    const event: CustomEventInit<NoteOffEvent> = {
      detail: {
        note: note
      }
    };
    this.dispatchEvent(new CustomEvent(MidiAccess.ON_NOTE_OFF, event));
  }

  triggerSustain(level: number) {
    const event: CustomEventInit<SustainEvent> = {
      detail: {
        level: level
      }
    };
    this.dispatchEvent(new CustomEvent(MidiAccess.ON_SUSTAIN, event));
  }

  triggerSoftPedal(level: number) {
    const event: CustomEventInit<SoftPedalEvent> = {
      detail: {
        level: level
      }
    };
    this.dispatchEvent(new CustomEvent(MidiAccess.ON_SOFT_PEDAL, event));
  }
}
