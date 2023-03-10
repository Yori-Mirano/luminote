/*
 * Piano Keyboard
 */
console.log('[ Piano Keyboard ]');
const pianoKeyboard = new PianoKeyboard(document.getElementById('piano-keyboard'));


/*
 * Remote strip
 */
console.log('[ Remote strip ]');

const hostname  = prompt('host ip', localStorage.hostname || '192.168.xx.xx');
localStorage.hostname = hostname;

const remoteStrip = new RemoteStrip(hostname, (strip, syncRemoteStrip) => {
  /*
   * StripRenderer
   */
  console.log('[ StripRenderer ]');
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

  midiAccess.onInputConnect = () => {
    pianoKeyboard.element.classList.add('piano-keyboard--connected');
  };

  midiAccess.onInputDisonnect = () => {
    pianoKeyboard.element.classList.remove('piano-keyboard--connected');
  };

  midiAccess.onKeyDown = (note, velocity) => {
    pianoKeyboard.pressKey(note);
    notes[note -21].pressed   = true;
    notes[note -21].pedal     = pianoKeyboard.isPedalDown();
    notes[note -21].velocity  = velocity / 128;
  };

  midiAccess.onKeyUp = note => {
    pianoKeyboard.releaseKey(note);
    notes[note -21].pressed = false;
  };

  midiAccess.onPedal = (level) => {
    pianoKeyboard.setPedal(level);

    if (pianoKeyboard.isPedalDown()) {
      notes.forEach(note => note.pedal = !!(note.pressed || note.pedal));
    } else {
      notes.forEach(note => note.pedal = false);
    }
  };


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