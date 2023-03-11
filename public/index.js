/*
 * Config
 */
const config = {
  remoteStrip: {
    //hostname: localStorage.remoteStripHostname = prompt('host ip', localStorage.remoteStripHostname || '192.168.xx.xx'), // TODO: create a user friendly interface
    hostname: '192.168.1.43', // TODO: remove this dev shortcut
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
let remoteStrip;
let syncRemoteStrip;

new RemoteStrip(config.remoteStrip.hostname, (_strip, _syncRemoteStrip) => {
  remoteStrip     = _strip;
  syncRemoteStrip = _syncRemoteStrip;
});


/*
 * StripRenderer
 */
const simpleStripRenderer = new SimpleStripRenderer(document.getElementById('viewport'), strip, 8);
//const historyStripRenderer = new HistoryStripRenderer(document.getElementById('viewport'), strip, 8);


/*
 * Notes
 */
const notes = [];
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

midiAccess.addEventListener('note_on', event => {
  pianoKeyboard.pressKey(event.detail.note);
  notes[event.detail.note - config.pianoKeyboard.noteRange.start].pressed   = true;
  notes[event.detail.note - config.pianoKeyboard.noteRange.start].pedal     = pianoKeyboard.isPedalDown();
  notes[event.detail.note - config.pianoKeyboard.noteRange.start].velocity  = event.detail.velocity / 128;
})

midiAccess.addEventListener('note_off', event => {
  pianoKeyboard.releaseKey(event.detail.note);
  notes[event.detail.note - config.pianoKeyboard.noteRange.start].pressed = false;
});

midiAccess.addEventListener('sustain', event => {
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
window.framePerSecond = 50;
window.frameInterval = 1000 / framePerSecond;

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