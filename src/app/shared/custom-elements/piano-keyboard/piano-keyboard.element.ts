/**
 * @module PianoKeyboardElement
 */
import './piano-keyboard.element.scss';
import { CustomElement } from "../../custom-element";
import { MidiNoteTools } from "../../midi/midi-note-tools";

export interface KeyPressedEvent {
  /** Midi note id from 0 to 127 */
  note: number;

  /** Velocity from 0 to 127 */
  velocity: number;
}

export interface KeyReleasedEvent {
  /** Midi note id from 0 to 127 */
  note: number;
}

/**
 * <app-piano-keyboard data-lowest-key="A1" data-highest-key="C9" class="-no-strip"></app-piano-keyboard>
 *
 * @external MidiNoteTools
 */
export class PianoKeyboardElement extends HTMLElement implements CustomElement {

  /**
   * @eventProperty
   */
  static readonly ON_KEY_PRESSED= "key_pressed";

  /**
   * @eventProperty
   */
  static readonly ON_KEY_RELEASED= "key_released";

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

  lowestNote: number;
  highestNote: number;
  sustainThreshold = 43;
  sustainLevel = 0;
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
    this.lowestNote = this.getMidiNote(this.dataset.lowestKey);
    this.highestNote = this.getMidiNote(this.dataset.highestKey);
  }

  private getMidiNote(noteData: string): number {
    if (/^\d+$/.test(noteData)) {
      return parseInt(noteData);
    } else {
      return MidiNoteTools.getMidiNote(noteData);
    }
  }

  get totalKeys(): number {
    return this.highestNote - this.lowestNote + 1;
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

    for (let midiNote = this.lowestNote; midiNote <= this.highestNote; midiNote++) {
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
      this.triggerKeyPress(midiNote, this.getVelocityFromPosition(event, keyElement));
    });

    ['pointerup', 'blur'].forEach(eventType =>
      keyElement.addEventListener(eventType, event => {
        event.preventDefault();
        this.triggerKeyRelease(midiNote);
      })
    );


    keyElement.addEventListener('keydown', event => {
      if (['Enter', 'Space'].includes(event.code)) {
        this.triggerKeyPress(midiNote, 127);
      }
    });

    keyElement.addEventListener('keyup', event => {
      event.preventDefault();

      if (['Enter', 'Space'].includes(event.code)) {
        this.triggerKeyRelease(midiNote);
      }
    });

    keyElement.addEventListener('pointerenter', event => {
      if (this.isKeyOn) {
        this.triggerKeyPress(midiNote, this.getVelocityFromPosition(event, keyElement));
      }
    });


    keyElement.addEventListener('pointerleave', () => {
      if (this.isKeyOn) {
        this.triggerKeyRelease(midiNote);
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
    const previousCNote = MidiNoteTools.getPreviousMidiNoteByName('C', this.lowestNote);
    return (this.lowestNote - previousCNote) * this.blackKeyWidthPercent
           - this.getWhiteKeyCount(previousCNote, this.lowestNote -1) * this.whiteKeyWidthPercent;
  }

  get rightMargin () {
    const nextCNote = MidiNoteTools.getNextMidiNoteByName('B', this.highestNote);
    return (nextCNote - this.highestNote) * this.blackKeyWidthPercent
           - this.getWhiteKeyCount(this.highestNote +1 , nextCNote) * this.whiteKeyWidthPercent;
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
      this.keys[midiNote].classList.add('-pressed');

      if (this.isSustained()) {
        this.keys[midiNote].classList.add('-sustained');
      }
    }
  }


  /**
   *
   * @param midiNote
   */
  releaseKey(midiNote: number) {
    if (this.keys[midiNote]) {
      this.keys[midiNote].classList.remove('-pressed');
    }
  }

  /**
   *
   * @param level
   */
  setSustain(level: number) {
    this.sustainLevel = level;

    if (this.isSustained()) {
      this.querySelectorAll('.-pressed').forEach(noteElement => {
        noteElement.classList.add('-sustained');
      })
    } else {
      this.querySelectorAll('.-sustained').forEach(noteElement => {
        noteElement.classList.remove('-sustained');
      })
    }
  }

  isSustained() {
    return this.sustainLevel > this.sustainThreshold;
  }


  getWhiteKeyCount(from = this.lowestNote, to = this.highestNote): number {
    let whiteKeyCount = 0;

    for (let midiNote = from; midiNote <= to; midiNote++) {
      if (PianoKeyboardElement.isWhiteKey(midiNote)) {
        whiteKeyCount++;
      }
    }

    return whiteKeyCount;
  }


  getBlackKeyCount(from = this.lowestNote, to = this.highestNote): number {
    let blackKeyCount = 0;

    for (let midiNote = from; midiNote <= to; midiNote++) {
      if (PianoKeyboardElement.isBlackKey(midiNote)) {
        blackKeyCount++;
      }
    }

    return blackKeyCount;
  }


  getKeyCount(): number {
    return this.highestNote - this.lowestNote + 1;
  }

  private triggerKeyPress(note: number, velocity: number) {
    const event: CustomEventInit<KeyPressedEvent> = {
      detail: {
        note: note,
        velocity: velocity
      }
    };
    this.dispatchEvent(new CustomEvent(PianoKeyboardElement.ON_KEY_PRESSED, event));
  }

  private triggerKeyRelease(note: number) {
    const event: CustomEventInit<KeyReleasedEvent> = {
      detail: {
        note: note
      }
    }
    this.dispatchEvent(new CustomEvent(PianoKeyboardElement.ON_KEY_RELEASED, event));
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
