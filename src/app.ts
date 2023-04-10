/*
 * Config
 */
import './app.scss';
import { MidiNoteTools } from "./app/MidiNoteTools";
import { PianoKeyboard } from "./app/PianoKeyboard/PianoKeyboard";
import { RemoteStrip } from "./app/RemoteStrip";
import { SimpleStripRenderer } from "./app/stripRenderers/SimpleStripRenderer";
import { MidiAccess, NoteOffEvent, NoteOnEvent, SustainEvent } from "./app/MidiAccess";
import { SimpleStripBehaviour } from "./app/stripBehaviours/SimpleStripBehaviour";
import { RipplesStripBehaviour } from "./app/stripBehaviours/RipplesStripBehaviour";
import { AssistantStripBehaviour } from "./app/stripBehaviours/AssistantStripBehaviour";
import { Strip } from "./app/Strip";
import { Note } from "./app/Note.interface";
import { GlslStripRenderer } from "./app/stripRenderers/GlslStripRenderer";

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
const simpleStripRenderer = new SimpleStripRenderer(document.getElementById('strip'), strip, 8);
const glslStripRenderer = new GlslStripRenderer(document.getElementById('viewport'), strip, 4);

glslStripRenderer.parentElement.style.marginLeft = pianoKeyboard.leftMargin + '%';
glslStripRenderer.parentElement.style.marginRight = pianoKeyboard.rightMargin + '%';
requestAnimationFrame(() => glslStripRenderer._resize());

simpleStripRenderer.parentElement.style.marginLeft = pianoKeyboard.leftMargin + '%';
simpleStripRenderer.parentElement.style.marginRight = pianoKeyboard.rightMargin + '%';
requestAnimationFrame(() => simpleStripRenderer._resize());


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

const simpleStripBehaviour = new SimpleStripBehaviour(strip, notes);
const ripplesStripBehaviour = new RipplesStripBehaviour(strip, notes);
const assistantStripBehaviour = new AssistantStripBehaviour(strip, notes);

function loop() {
  //simpleStripBehaviour.update();
  ripplesStripBehaviour.update()
  //assistantStripBehaviour.update()

  if (remoteStrip && syncRemoteStrip) {
    const remoteStripOffset = config.remoteStrip.startNote - config.pianoKeyboard.noteRange.start;
    strip.copyTo(remoteStrip, remoteStripOffset);
    syncRemoteStrip();
  }

  simpleStripRenderer.render();
  glslStripRenderer.render();

  setTimeout(loop, frameInterval);
}

loop();
