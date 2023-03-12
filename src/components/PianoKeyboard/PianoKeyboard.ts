import './PianoKeyboard.scss';
import MidiNoteTools from "../MidiNoteTools";

/**
 * @external MidiNoteTools
 */
export default class PianoKeyboard {
  /**
   * Retourne `true` si la note correspond à une touche noire d'une clavier de piano.
   * @param   {number}     midiNote Code midi de la note
   * @returns {boolean}
   */
  static isBlackKey(midiNote: number)
  {
    return MidiNoteTools.getName(midiNote).indexOf('#') !== -1;
  }


  /**
   * Retourne `true` si la note correspond à une touche blanche d'une clavier de piano.
   * @param   {number}     midiNote Code midi de la note
   * @returns {boolean}
   */
  static isWhiteKey(midiNote: number)
  {
    return !PianoKeyboard.isBlackKey(midiNote);
  }

  element: HTMLElement;
  noteStart: number;
  noteEnd: number;
  pedalThreshold = 43;
  pedalLevel = 0;
  keys: {[key: number] : HTMLElement} = {};


  /**
   *
   * @param element   {HTMLElement}
   * @param noteStart {number|string}
   * @param noteEnd   {number|string}
   */
  constructor(element: HTMLElement, noteStart: string|number = 'A1', noteEnd: string|number = 'C9') {
    this.element        = element;

    if (typeof noteStart === 'string') {
      this.noteStart      = MidiNoteTools.getMidiNote(noteStart);
    } else {
      this.noteStart      = noteStart;
    }

    if (typeof noteEnd === 'string') {
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
    const keyboardBlackKeyContainer = document.createElement('div');
    keyboardBlackKeyContainer.classList.add('pianoKeyboard_blackKeys');
    keyboardBlackKeyContainer.style.left = this.leftMargin + '%';
    keyboardBlackKeyContainer.style.right = this.rightMargin + '%';
    this.element.appendChild(keyboardBlackKeyContainer);

    for (let midiNote = this.noteStart; midiNote <= this.noteEnd; midiNote++) {
      const keyboardKey = document.createElement('div');
      keyboardKey.classList.add('pianoKeyboard_key');
      this.keys[midiNote] = keyboardKey;

      if (PianoKeyboard.isWhiteKey(midiNote)) {
        keyboardKey.classList.add('-white');
        this.element.appendChild(keyboardKey);
        keyboardBlackKeyContainer.appendChild(document.createElement('div'));

      } else {
        keyboardKey.classList.add('-black');
        keyboardBlackKeyContainer.appendChild(keyboardKey);
      }
    }
  }


  disable() {
    this.element.classList.add('-disabled');
  }

  enable() {
    this.element.classList.remove('-disabled');
  }

  get leftMargin () {
    const previousCNote = MidiNoteTools.getPreviousMidiNoteByName('C', this.noteStart);
    return (this.noteStart - previousCNote) * this.blackKeyWidthPercent
           - this.getWhiteKeyCount(previousCNote, this.noteStart -1) * this.whiteKeyWidthPercent;
  }

  get rightMargin () {
    const nextCNote = MidiNoteTools.getNextMidiNoteByName('B', this.noteEnd);
    return (nextCNote - this.noteEnd) * this.blackKeyWidthPercent
           - this.getWhiteKeyCount(this.noteEnd +1 , nextCNote) * this.whiteKeyWidthPercent;
  }

  get whiteKeyWidthPercent () {
    return 100 / this.getWhiteKeyCount();
  }

  get blackKeyWidthPercent () {
    return this.whiteKeyWidthPercent * 7/12
  }


  /**
   *
   * @param midiNote {number}
   */
  pressKey(midiNote: number) {
    if (this.keys[midiNote]) {
      this.keys[midiNote].classList.add('-on');

      if (this.isPedalDown()) {
        this.keys[midiNote].classList.add('-pedal');
      }
    }
  }

  /**
   *
   * @param midiNote {number}
   */
  releaseKey(midiNote: number) {
    if (this.keys[midiNote]) {
      this.keys[midiNote].classList.remove('-on');
    }
  }

  /**
   *
   * @param level {number}
   */
  setPedal(level: number) {
    this.pedalLevel = level;

    if (this.isPedalDown()) {
      this.element.querySelectorAll('.-on').forEach(noteElement => {
        noteElement.classList.add('-pedal');
      })
    } else {
      this.element.querySelectorAll('.-pedal').forEach(noteElement => {
        noteElement.classList.remove('-pedal');
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
  getWhiteKeyCount(from = this.noteStart, to = this.noteEnd) {
    let whiteKeyCount = 0;

    for (let midiNote = from; midiNote <= to; midiNote++) {
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
  getBlackKeyCount(from = this.noteStart, to = this.noteEnd) {
    let blackKeyCount = 0;

    for (let midiNote = from; midiNote <= to; midiNote++) {
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
  getKeyCount() {
    return this.noteEnd - this.noteStart + 1;
  }
}
