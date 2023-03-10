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


  /**
   *
   * @param element {HTMLElement}
   * @param pedalThreshold
   * @param noteNameStart
   * @param noteNameEnd
   */
  constructor(element, pedalThreshold = 43, noteNameStart = 'A1', noteNameEnd= 'C9') {
    this.element        = element;
    this.noteStart      = MidiNoteTools.getMidiNote(noteNameStart);
    this.noteEnd        = MidiNoteTools.getMidiNote(noteNameEnd);
    this.pedalThreshold = pedalThreshold;
    this.pedalLevel     = 0
    this.keys           = {};

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
      this.element.style.setProperty('--white-keys-count', this.whiteKeyCount);
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
    this.keys[midiNote].classList.add('piano-keyboard__key--on');

    if (this.isPedalDown()) {
      this.keys[midiNote].classList.add('piano-keyboard__key--pedal');
    }
  }

  /**
   *
   * @param midiNote {number}
   */
  releaseKey(midiNote) {
    this.keys[midiNote].classList.remove('piano-keyboard__key--on');
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