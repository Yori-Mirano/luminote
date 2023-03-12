/*
 * Config
 */
import './app.scss';
import MidiNoteTools from "./components/MidiNoteTools";
import PianoKeyboard from "./components/PianoKeyboard/PianoKeyboard";
import RemoteStrip from "./components/RemoteStrip";
import SimpleStripRenderer from "./components/stripRenderers/SimpleStripRenderer";
import MidiAccess from "./components/MidiAccess";
import SimpleStripBehaviour from "./components/stripBehaviours/SimpleStripBehaviour";
import RipplesStripBehaviour from "./components/stripBehaviours/RipplesStripBehaviour";
import AssistantStripBehaviour from "./components/stripBehaviours/AssistantStripBehaviour";
import Strip from "./components/Strip";
import Note from "./components/Note.interface";


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
const stripElement = document.getElementById('strip');
const simpleStripRenderer = new SimpleStripRenderer(stripElement, strip, 8);
//const historyStripRenderer = new HistoryStripRenderer(document.getElementById('viewport'), strip, 8);

stripElement.style.marginLeft = pianoKeyboard.leftMargin + '%';
stripElement.style.marginRight = pianoKeyboard.rightMargin + '%';
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

midiAccess.addEventListener('input_connected', () => {
  pianoKeyboard.enable();
});

midiAccess.addEventListener('input_disconnected', () => {
  pianoKeyboard.disable();
});

midiAccess.addEventListener('note_on', (event: CustomEvent) => {
  pianoKeyboard.pressKey(event.detail.note);
  notes[event.detail.note - config.pianoKeyboard.noteRange.start].pressed   = true;
  notes[event.detail.note - config.pianoKeyboard.noteRange.start].pedal     = pianoKeyboard.isPedalDown();
  notes[event.detail.note - config.pianoKeyboard.noteRange.start].velocity  = event.detail.velocity / 128;
})

midiAccess.addEventListener('note_off', (event: CustomEvent) => {
  pianoKeyboard.releaseKey(event.detail.note);
  notes[event.detail.note - config.pianoKeyboard.noteRange.start].pressed = false;
});

midiAccess.addEventListener('sustain', (event: CustomEvent) => {
  pianoKeyboard.setPedal(event.detail.level);

  if (pianoKeyboard.isPedalDown()) {
    notes.forEach(note => note.pedal = !!(note.pressed || note.pedal));
  } else {
    notes.forEach(note => note.pedal = false);
  }
});

midiAccess.requestMidiAccess();


/*
 * Loop
 */
const framePerSecond = 50;
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
  //historyStripRenderer.render();

  setTimeout(loop, frameInterval);
}

loop();
