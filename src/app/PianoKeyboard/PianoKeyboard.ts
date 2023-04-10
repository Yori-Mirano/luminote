import './PianoKeyboard.scss';
import { MidiNoteTools } from "../MidiNoteTools";

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

/**
 * @external MidiNoteTools
 */
export class PianoKeyboard extends EventTarget{
  /**
   * @eventProperty
   */
  static readonly ON_NOTE_ON= "note_on";

  /**
   * @eventProperty
   */
  static readonly ON_NOTE_OFF= "note_off";

  /**
   * Retourne `true` si la note correspond à une touche noire d'une clavier de piano.
   * @param   midiNote - Code midi de la note
   * @returns
   */
  static isBlackKey(midiNote: number): boolean
  {
    return MidiNoteTools.getName(midiNote).indexOf('#') !== -1;
  }


  /**
   * Retourne `true` si la note correspond à une touche blanche d'une clavier de piano.
   * @param   midiNote - Code midi de la note
   * @returns
   */
  static isWhiteKey(midiNote: number): boolean
  {
    return !PianoKeyboard.isBlackKey(midiNote);
  }

  /**
   * Return the vertical position of the mouse on the target element in range [0, 1]
   * @param event
   * @param target
   */
  static getMouseVerticalPositionFromTarget(event: MouseEvent, target: HTMLElement): number {
    const rect = target.getBoundingClientRect();
    const y = event.clientY - rect.top;
    return y / target.offsetHeight;
  }

  element: HTMLElement;
  noteStart: number;
  noteEnd: number;
  pedalThreshold = 43;
  pedalLevel = 0;
  keys: {[key: number] : HTMLElement} = {};


  isKeyOn = false;


  /**
   *
   * @param element
   * @param noteStart
   * @param noteEnd
   */
  constructor(element: HTMLElement, noteStart: string|number = 'A1', noteEnd: string|number = 'C9') {
    super();

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

  get totalKeys(): number {
    return this.noteEnd - this.noteStart + 1;
  }

  init() {
    this.element.addEventListener('mousedown', this.onKeyboardKeyDown);
    document.addEventListener('mouseup', this.onKeyboardKeyUp);

    const keyboardBlackKeyContainer = document.createElement('div');
    keyboardBlackKeyContainer.classList.add('pianoKeyboard_blackKeys');
    keyboardBlackKeyContainer.style.left = this.leftMargin + '%';
    keyboardBlackKeyContainer.style.right = this.rightMargin + '%';
    this.element.appendChild(keyboardBlackKeyContainer);

    for (let midiNote = this.noteStart; midiNote <= this.noteEnd; midiNote++) {
      const keyboardKey = document.createElement('div');
      keyboardKey.classList.add('pianoKeyboard_key');
      this.initKeyEventListeners(keyboardKey, midiNote);
      this.keys[midiNote] = keyboardKey;

      if (PianoKeyboard.isWhiteKey(midiNote)) {
        keyboardKey.classList.add('-white');
        this.element.appendChild(keyboardKey);

        const blackKeySpacer = document.createElement('div');
        this.initKeyEventListeners(blackKeySpacer, midiNote);
        keyboardBlackKeyContainer.appendChild(blackKeySpacer);

      } else {
        keyboardKey.classList.add('-black');
        keyboardBlackKeyContainer.appendChild(keyboardKey);
      }
    }
  }

  initKeyEventListeners(keyElement: HTMLElement, midiNote: number) {
    keyElement.addEventListener('mousedown', event => {
      const velocity = Math.round(PianoKeyboard.getMouseVerticalPositionFromTarget(event, keyElement) * 127);
      this.triggerNoteOn(midiNote, velocity);
    });

    keyElement.addEventListener('mouseenter', event => {
      if (this.isKeyOn) {
        const velocity = Math.round(PianoKeyboard.getMouseVerticalPositionFromTarget(event, keyElement) * 127);
        this.triggerNoteOn(midiNote, velocity);
      }
    });

    keyElement.addEventListener('mouseup', () => {
      this.triggerNoteOff(midiNote);
    });

    keyElement.addEventListener('mouseleave', () => {
      if (this.isKeyOn) {
        this.triggerNoteOff(midiNote);
      }
    });
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
   * @param midiNote
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
   * @param midiNote
   */
  releaseKey(midiNote: number) {
    if (this.keys[midiNote]) {
      this.keys[midiNote].classList.remove('-on');
    }
  }

  /**
   *
   * @param level
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


  getWhiteKeyCount(from = this.noteStart, to = this.noteEnd): number {
    let whiteKeyCount = 0;

    for (let midiNote = from; midiNote <= to; midiNote++) {
      if (PianoKeyboard.isWhiteKey(midiNote)) {
        whiteKeyCount++;
      }
    }

    return whiteKeyCount;
  }


  getBlackKeyCount(from = this.noteStart, to = this.noteEnd): number {
    let blackKeyCount = 0;

    for (let midiNote = from; midiNote <= to; midiNote++) {
      if (PianoKeyboard.isBlackKey(midiNote)) {
        blackKeyCount++;
      }
    }

    return blackKeyCount;
  }


  getKeyCount(): number {
    return this.noteEnd - this.noteStart + 1;
  }

  private triggerNoteOn(note: number, velocity: number) {
    const event: CustomEventInit<NoteOnEvent> = {
      detail: {
        note: note,
        velocity: velocity
      }
    };
    this.dispatchEvent(new CustomEvent(PianoKeyboard.ON_NOTE_ON, event));
  }

  private triggerNoteOff(note: number) {
    const event: CustomEventInit<NoteOffEvent> = {
      detail: {
        note: note
      }
    }
    this.dispatchEvent(new CustomEvent(PianoKeyboard.ON_NOTE_OFF, event));
  }

  private onKeyboardKeyDown = () => {
    this.isKeyOn = true;
  }

  private onKeyboardKeyUp = () => {
    this.isKeyOn = false;
  }

  releaseListeners() {
    this.element.removeEventListener('mousedown', this.onKeyboardKeyDown);
    document.removeEventListener('mouseup', this.onKeyboardKeyUp);
  }

  destroy() {
    this.releaseListeners();
  }
}
