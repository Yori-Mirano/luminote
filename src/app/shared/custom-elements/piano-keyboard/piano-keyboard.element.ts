import './piano-keyboard.element.scss';
import { CustomElement } from "../custom-element";
import { MidiNoteTools } from "../../midi/midi-note-tools";

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
 * <app-piano-keyboard data-from="A1" data-to="C9" class="-no-strip"></app-piano-keyboard>
 *
 * @external MidiNoteTools
 */
export class PianoKeyboardElement extends HTMLElement implements CustomElement {

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
    return !PianoKeyboardElement.isBlackKey(midiNote);
  }

  /**
   * Return the vertical position of the mouse on the target element in range [0, 1]
   * @param event
   * @param target
   */
  static getMouseVerticalPositionFromTarget(event: PointerEvent, target: HTMLElement): number {
    const rect = target.getBoundingClientRect();
    const y = event.clientY;

    return (y - rect.top) / target.offsetHeight;
  }


  dataset: {
    lowestKey: string,
    highestKey: string,
    disabled: string,
  }

  static observedAttributes = ['data-lowest-key', 'data-highest-key'];

  noteStart: number;
  noteEnd: number;
  pedalThreshold = 43;
  pedalLevel = 0;
  keys: {[key: number] : HTMLElement} = {};
  isKeyOn = false;


  connectedCallback() {
    this.dataset.lowestKey ??= 'A1';
    this.dataset.highestKey ??= 'C9';

    this.disable();
    this.init();
  }

  disconnectedCallback() {
    this.destroy();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue && (name === 'data-lowest-key' || name === 'data-highest-key')) {
      this.init();
    }
  }

  updateNoteRangeFromElementDataset() {
    this.noteStart = this.getMidiNote(this.dataset.lowestKey);
    this.noteEnd = this.getMidiNote(this.dataset.highestKey);
  }

  private getMidiNote(noteData: string): number {
    if (/^\d+$/.test(noteData)) {
      return parseInt(noteData);
    } else {
      return MidiNoteTools.getMidiNote(noteData);
    }
  }

  get totalKeys(): number {
    return this.noteEnd - this.noteStart + 1;
  }

  init() {
    this.destroy();
    this.updateNoteRangeFromElementDataset();

    this.addEventListener('pointerdown', this.onKeyboardKeyDown);
    document.addEventListener('pointerup', this.onKeyboardKeyUp);

    const keyboardBlackKeyContainer = document.createElement('div');
    keyboardBlackKeyContainer.classList.add('pianoKeyboard_blackKeys');
    keyboardBlackKeyContainer.style.left = this.leftMargin + '%';
    keyboardBlackKeyContainer.style.right = this.rightMargin + '%';
    this.appendChild(keyboardBlackKeyContainer);

    for (let midiNote = this.noteStart; midiNote <= this.noteEnd; midiNote++) {
      const keyboardKey = document.createElement('button');
      keyboardKey.classList.add('pianoKeyboard_key');
      this.initKeyEventListeners(keyboardKey, midiNote);
      this.keys[midiNote] = keyboardKey;

      if (PianoKeyboardElement.isWhiteKey(midiNote)) {
        keyboardKey.classList.add('-white');
        this.appendChild(keyboardKey);

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
    keyElement.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.triggerNoteOn(midiNote, this.getVelocityFromPosition(event, keyElement));
    });

    ['pointerup', 'blur'].forEach(eventType =>
      keyElement.addEventListener(eventType, event => {
        event.preventDefault();
        this.triggerNoteOff(midiNote);
      })
    );


    keyElement.addEventListener('keydown', event => {
      if (['Enter', 'Space'].includes(event.code)) {
        this.triggerNoteOn(midiNote, 127);
      }
    });

    keyElement.addEventListener('keyup', event => {
      event.preventDefault();

      if (['Enter', 'Space'].includes(event.code)) {
        this.triggerNoteOff(midiNote);
      }
    });

    keyElement.addEventListener('pointerenter', event => {
      if (this.isKeyOn) {
        this.triggerNoteOn(midiNote, this.getVelocityFromPosition(event, keyElement));
      }
    });


    keyElement.addEventListener('pointerleave', () => {
      if (this.isKeyOn) {
        this.triggerNoteOff(midiNote);
      }
    });
  }

  getVelocityFromPosition(event: PointerEvent, keyElement: HTMLElement) {
    return Math.round(PianoKeyboardElement.getMouseVerticalPositionFromTarget(event, keyElement) * 127);
  }


  disable() {
    this.dataset.disabled = '';
  }

  enable() {
    delete this.dataset.disabled;
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
      this.querySelectorAll('.-on').forEach(noteElement => {
        noteElement.classList.add('-pedal');
      })
    } else {
      this.querySelectorAll('.-pedal').forEach(noteElement => {
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
      if (PianoKeyboardElement.isWhiteKey(midiNote)) {
        whiteKeyCount++;
      }
    }

    return whiteKeyCount;
  }


  getBlackKeyCount(from = this.noteStart, to = this.noteEnd): number {
    let blackKeyCount = 0;

    for (let midiNote = from; midiNote <= to; midiNote++) {
      if (PianoKeyboardElement.isBlackKey(midiNote)) {
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
    this.dispatchEvent(new CustomEvent(PianoKeyboardElement.ON_NOTE_ON, event));
  }

  private triggerNoteOff(note: number) {
    const event: CustomEventInit<NoteOffEvent> = {
      detail: {
        note: note
      }
    }
    this.dispatchEvent(new CustomEvent(PianoKeyboardElement.ON_NOTE_OFF, event));
  }

  private onKeyboardKeyDown = () => {
    this.isKeyOn = true;
  }

  private onKeyboardKeyUp = () => {
    this.isKeyOn = false;
  }

  releaseExternalListeners() {
    document.removeEventListener('pointerup', this.onKeyboardKeyUp);
  }

  destroy() {
    this.innerHTML = '';
    this.releaseExternalListeners();
  }

}

customElements.define('app-piano-keyboard', PianoKeyboardElement);
