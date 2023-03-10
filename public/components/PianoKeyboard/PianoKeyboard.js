/**
 * Requiert MidiNoteTools.js
 */
class PianoKeyboard {
  /**
   * Retourne `true` si la note correspond à une touche noire d'une clavier de piano.
   * @param   {int}     midiNote Code midi de la note
   * @returns {boolean}
   */
  static isBlackKey(midiNote)
  {
    return MidiNoteTools.getName(midiNote).indexOf('#') !== -1;
  }


  /**
   * Retourne `true` si la note correspond à une touche blanche d'une clavier de piano.
   * @param   {int}     midiNote Code midi de la note
   * @returns {boolean}
   */
  static isWhiteKey(midiNote)
  {
    return !PianoKeyboard.isBlackKey(midiNote);
  }

  element;
  noteStart;
  noteEnd;
  pedalThreshold = 43;
  pedalLevel = 0;
  keys = {};


  /**
   *
   * @param element   {HTMLElement}
   * @param noteStart {number|string}
   * @param noteEnd   {number|string}
   */
  constructor(element, noteStart = 'A1', noteEnd= 'C9') {
    this.element        = element;

    if (typeof noteStart === 'string') {
      this.noteStart      = MidiNoteTools.getMidiNote(noteStart);
    } else {
      this.noteStart      = noteStart;
    }

    if (typeof noteStart === 'string') {
      this.noteEnd        = MidiNoteTools.getMidiNote(noteEnd);
    } else {
      this.noteEnd        = noteEnd;
    }

    this.init();
  }

  /**
   *
   * @returns {number}
   */
  get totalKeys() {
    return this.noteEnd - this.noteStart + 1;
  }

  /**
   *
   */
  init() {
    let whiteKeyPosition = 0;
    let blackKeyPosition = 0;

    for (let midiNote = this.noteStart; midiNote <= this.noteEnd; midiNote++) {
      this.element.style.setProperty('--key-count', this.keyCount);
      this.element.style.setProperty('--white-key-count', this.whiteKeyCount);
      const whiteKeyWidth = 100 / this.whiteKeyCount;
      const blackKeyWidth = (100 - 1.25) / this.keyCount; // FIXME: position de la première note noire à gauche et de la dernière à droite

      const keyboardKey = document.createElement('div');

      if (PianoKeyboard.isWhiteKey(midiNote)) {
        const keyElementPosition  = whiteKeyPosition * whiteKeyWidth;
        keyboardKey.style.left  = keyElementPosition + '%';
        keyboardKey.classList.add('piano-keyboard__white-key');
        whiteKeyPosition++;
        blackKeyPosition++;

      } else {
        const keyElementPosition  = blackKeyPosition * blackKeyWidth;
        keyboardKey.style.left  = `calc(.55% + ${keyElementPosition}%)`; // FIXME: position de la première note noire à gauche et de la dernière à droite
        keyboardKey.classList.add('piano-keyboard__black-key');
        blackKeyPosition++;
      }

      this.keys[midiNote] = keyboardKey;
      this.element.appendChild(keyboardKey);
    }
  }


  /**
   *
   * @param midiNote {number}
   */
  pressKey(midiNote) {
    if (this.keys[midiNote]) {
      this.keys[midiNote].classList.add('piano-keyboard__key--on');

      if (this.isPedalDown()) {
        this.keys[midiNote].classList.add('piano-keyboard__key--pedal');
      }
    }
  }

  /**
   *
   * @param midiNote {number}
   */
  releaseKey(midiNote) {
    if (this.keys[midiNote]) {
      this.keys[midiNote].classList.remove('piano-keyboard__key--on');
    }
  }

  /**
   *
   * @param level {number}
   */
  setPedal(level) {
    this.pedalLevel = level;

    if (this.isPedalDown()) {
      this.element.querySelectorAll('.piano-keyboard__key--on').forEach(noteElement => {
        noteElement.classList.add('piano-keyboard__key--pedal');
      })
    } else {
      this.element.querySelectorAll('.piano-keyboard__key--pedal').forEach(noteElement => {
        noteElement.classList.remove('piano-keyboard__key--pedal');
      })
    }
  }

  isPedalDown() {
    return this.pedalLevel > this.pedalThreshold;
  }


  /**
   *
   * @returns {number}
   */
  get whiteKeyCount() {
    let whiteKeyCount = 0;

    for (let midiNote = this.noteStart; midiNote <= this.noteEnd; midiNote++) {
      if (PianoKeyboard.isWhiteKey(midiNote)) {
        whiteKeyCount++;
      }
    }

    return whiteKeyCount;
  }


  /**
   *
   * @returns {number}
   */
  get blackKeyCount() {
    let blackKeyCount = 0;

    for (let midiNote = this.noteStart; midiNote <= this.noteEnd; midiNote++) {
      if (PianoKeyboard.isBlackKey(midiNote)) {
        blackKeyCount++;
      }
    }

    return blackKeyCount;
  }


  /**
   *
   * @returns {number}
   */
  get keyCount() {
    return this.whiteKeyCount + this.blackKeyCount;
  }
}