/*
 * Config
 */
import './app.scss';
import { MidiNoteTools } from "./app/MidiNoteTools";
import { PianoKeyboard } from "./app/PianoKeyboard/PianoKeyboard";
import { RemoteStrip } from "./app/RemoteStrip";
import { LineStripRenderer } from "./app/stripRenderers/LineStripRenderer";
import { SlideUpStripRenderer } from "./app/stripRenderers/SlideUpStripRenderer";
import { MidiAccess, NoteOffEvent, NoteOnEvent, SustainEvent } from "./app/MidiAccess";
import { SimpleStripBehaviour } from "./app/stripBehaviours/SimpleStripBehaviour";
import { RipplesStripBehaviour } from "./app/stripBehaviours/RipplesStripBehaviour";
import { AssistantStripBehaviour } from "./app/stripBehaviours/AssistantStripBehaviour";
import { Strip } from "./app/Strip";
import { Note } from "./app/Note.interface";

const config = {
  remoteStrip: {
    //host: localStorage.remoteStripHost = prompt('host ip', localStorage.remoteStripHost || '192.168.xx.xx'), // TODO: create a user friendly interface
    host: '192.168.1.43', // TODO: remove this dev shortcut
    startNote: MidiNoteTools.getMidiNote('A1'),
  },

  pianoKeyboard: {
    noteRange: {
      start:  MidiNoteTools.getMidiNote('A1'),
      end:    MidiNoteTools.getMidiNote('C9')
    }
  },
}

const remoteStripOffset = config.remoteStrip.startNote - config.pianoKeyboard.noteRange.start;


/*
 * Piano Keyboard
 */
const pianoKeyboard = new PianoKeyboard(
  document.getElementById('pianoKeyboard'),
  config.pianoKeyboard.noteRange.start,
  config.pianoKeyboard.noteRange.end
);


/*
 * Strip
 */
const strip = new Strip(config.pianoKeyboard.noteRange.end - config.pianoKeyboard.noteRange.start + 1);


/*
 * Remote strip
 */
let remoteStrip: Strip;
let syncRemoteStrip:() => void;

new RemoteStrip(config.remoteStrip.host, (_strip: Strip, _syncRemoteStrip: () => void) => {
  remoteStrip     = _strip;
  syncRemoteStrip = _syncRemoteStrip;
});


/*
 * StripRenderer
 */
const stripElement = document.getElementById('strip');
stripElement.style.marginLeft = pianoKeyboard.leftMargin + '%';
stripElement.style.marginRight = pianoKeyboard.rightMargin + '%';
const lineStripRenderer = new LineStripRenderer(stripElement, strip, 8);

const viewportElement = document.getElementById('viewport');
viewportElement.style.marginLeft = pianoKeyboard.leftMargin + '%';
viewportElement.style.marginRight = pianoKeyboard.rightMargin + '%';
const slideUpStripRenderer = new SlideUpStripRenderer(viewportElement, strip, 4);


/*
 * Notes
 */
const notes: Note[] = [];
strip.forEach(i => {
  notes[i] = {
    pressed: false,
    pedal: false,
    velocity: 0,
  }
});


/*
 * Midi Access
 */
const midiAccess = new MidiAccess();

midiAccess.addEventListener(MidiAccess.ON_INPUT_CONNECTED, () => {
  pianoKeyboard.enable();
});

midiAccess.addEventListener(MidiAccess.ON_INPUT_DISCONNECTED, () => {
  pianoKeyboard.disable();
});

midiAccess.addEventListener(MidiAccess.ON_NOTE_ON, (event: CustomEvent<NoteOnEvent>) => {
  pianoKeyboard.pressKey(event.detail.note);
  notes[event.detail.note - config.pianoKeyboard.noteRange.start].pressed   = true;
  notes[event.detail.note - config.pianoKeyboard.noteRange.start].pedal     = pianoKeyboard.isPedalDown();
  notes[event.detail.note - config.pianoKeyboard.noteRange.start].velocity  = event.detail.velocity / 128;
})

midiAccess.addEventListener(MidiAccess.ON_NOTE_OFF, (event: CustomEvent<NoteOffEvent>) => {
  pianoKeyboard.releaseKey(event.detail.note);
  notes[event.detail.note - config.pianoKeyboard.noteRange.start].pressed = false;
});

midiAccess.addEventListener(MidiAccess.ON_SUSTAIN, (event: CustomEvent<SustainEvent>) => {
  pianoKeyboard.setPedal(event.detail.level);

  if (pianoKeyboard.isPedalDown()) {
    notes.forEach(note => note.pedal = !!(note.pressed || note.pedal));
  } else {
    notes.forEach(note => note.pedal = false);
  }
});

midiAccess.requestMidiAccess();

pianoKeyboard.addEventListener(PianoKeyboard.ON_NOTE_ON, (event: CustomEvent<NoteOnEvent>) => {
  midiAccess.triggerNoteOn(event.detail.note, event.detail.velocity);
  midiAccess.sendNoteOn(event.detail.note, event.detail.velocity);
});

pianoKeyboard.addEventListener(PianoKeyboard.ON_NOTE_OFF, (event: CustomEvent<NoteOffEvent>) => {
  midiAccess.triggerNoteOff(event.detail.note);
  midiAccess.sendNoteOff(event.detail.note);
});


/*
 * Loop
 */
const framePerSecond = 60;
const frameInterval = 1000 / framePerSecond;

//const simpleStripBehaviour = new SimpleStripBehaviour(strip, notes);
const ripplesStripBehaviour = new RipplesStripBehaviour(strip, notes);
//const assistantStripBehaviour = new AssistantStripBehaviour(strip, notes);

function loop() {
  ripplesStripBehaviour.update()

  if (remoteStrip && syncRemoteStrip) {
    strip.copyTo(remoteStrip, remoteStripOffset);
    syncRemoteStrip();
  }

  lineStripRenderer.render();
  slideUpStripRenderer.render();

  setTimeout(loop, frameInterval);
}

loop();
