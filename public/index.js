/*
 * Config
 */
console.log('[ Config ]');
const config = {
  remoteStripHostname : prompt('host ip', localStorage.remoteStripHostname || '192.168.xx.xx'),

  pianoKeyboardNoteRange: {
    start:  MidiNoteTools.getMidiNote('A1'),
    end:    MidiNoteTools.getMidiNote('C9')
  }
}

localStorage.remoteStripHostname = config.remoteStripHostname;


/*
 * Piano Keyboard
 */
console.log('[ Piano Keyboard ]');
const pianoKeyboard = new PianoKeyboard(
  document.getElementById('piano-keyboard'),
  config.pianoKeyboardNoteRange.start,
  config.pianoKeyboardNoteRange.end
);


/*
 * Remote strip
 */
console.log('[ Remote strip ]');
const remoteStrip = new RemoteStrip(config.remoteStripHostname, (strip, syncRemoteStrip) => {
  /*
   * StripRenderer
   */
  console.log('[ Strip Renderer ]');
  const simpleStripRenderer = new SimpleStripRenderer(document.getElementById('strip'), strip, 8);
  const historyStripRenderer = new HistoryStripRenderer(document.getElementById('strip'), strip, 8);

  
  /*
   * Notes
   */
  console.log('[ Notes ]');
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
  console.log('[ Midi Access ]');
  const midiAccess = new MidiAccess();

  midiAccess.addEventListener('input_connected', () => {
    pianoKeyboard.element.classList.add('piano-keyboard--connected');
  });

  midiAccess.addEventListener('input_disconnected', () => {
    pianoKeyboard.element.classList.remove('piano-keyboard--connected');
  });

  midiAccess.addEventListener('note_on', event => {
    pianoKeyboard.pressKey(event.detail.note);
    notes[event.detail.note - config.pianoKeyboardNoteRange.start].pressed   = true;
    notes[event.detail.note - config.pianoKeyboardNoteRange.start].pedal     = pianoKeyboard.isPedalDown();
    notes[event.detail.note - config.pianoKeyboardNoteRange.start].velocity  = event.detail.velocity / 128;
  })

  midiAccess.addEventListener('note_off', event => {
    pianoKeyboard.releaseKey(event.detail.note);
    notes[event.detail.note - config.pianoKeyboardNoteRange.start].pressed = false;
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
  console.log('[ Loop ]');

  window.framePerSecond = 50;
  window.frameInterval = 1000 / framePerSecond;

  const simpleStripBehaviour = new SimpleStripBehaviour(strip, notes);
  const ripplesStripBehaviour = new RipplesStripBehaviour(strip, notes);
  const assistantStripBehaviour = new AssistantStripBehaviour(strip, notes);

  function loop() {
    //simpleStripBehaviour.update();
    ripplesStripBehaviour.update()
    //assistantStripBehaviour.update()

    syncRemoteStrip();

    simpleStripRenderer.render();
    //historyStripRenderer.render();

    setTimeout(loop, frameInterval);
  }

  loop();
});