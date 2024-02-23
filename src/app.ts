/*
 * Config
 */
import './app.scss';
import { PianoKeyboard } from "./app/PianoKeyboard/PianoKeyboard";
import { RemoteStrip } from "./app/RemoteStrip";
import { LineStripRenderer } from "./app/stripRenderers/LineStripRenderer";
import { SlideUpStripRenderer } from "./app/stripRenderers/SlideUpStripRenderer";
import { MidiAccess, NoteOffEvent, NoteOnEvent, PortEvent, SustainEvent } from "./app/MidiAccess";
import { Strip } from "./app/Strip";
import { Note } from "./app/Note.model";
import { AutoHiddenLayer } from "./app/AutoHiddenLayer/AutoHiddenLayer";
import { StripBehavior } from "./app/stripBehaviors/abstracts/StripBehavior";
import { AppConfig } from "./app/AppConfig.model";
import { appConfig } from "./app.config";
import { StripRenderer } from "./app/stripRenderers/abstracts/StripRenderer";



class App {

  strip: Strip;
  stripBehavior: StripBehavior;

  remoteStripConnexion: RemoteStrip;
  remoteStrip: Strip;
  remoteStripOffset: number;
  syncRemoteStrip: () => void;

  lineStripRenderer: StripRenderer;
  slideUpStripRenderer: StripRenderer;

  notes: Note[] = [];
  pianoKeyboard: PianoKeyboard;
  frameInterval: number;

  constructor(public config: AppConfig) {}

  start() {
    this.onStart();
  }

  onStart() {
    this.remoteStripOffset = this.config.remoteStrip.startNote - this.config.pianoKeyboard.noteRange.start;
    this.frameInterval = 1000 / this.config.framePerSecond;

    this.initOverlay();
    this.initForms();

    this.initStrip()
    this.initNoteState();
    this.initPianoKeyboard();
    this.initStripBehavior();
    this.connectToRemoteStrip();

    this.initStripElement();
    this.initViewportElement();
    this.initStripBehaviorSelectElement();

    this.initMidiAccess();

    this.startMainLoop();
  }

  onTick() {
    this.stripBehavior.tick()

    if (this.remoteStrip && this.syncRemoteStrip) {
      this.strip.copyTo(this.remoteStrip, this.remoteStripOffset);
      this.syncRemoteStrip();
    }

    this.lineStripRenderer.render();
    this.slideUpStripRenderer.render();
  }


  initStrip() {
    this.strip = new Strip(this.config.pianoKeyboard.noteRange.end - this.config.pianoKeyboard.noteRange.start + 1);
  }

  connectToRemoteStrip() {
    if (this.config.remoteStrip.host) {
      this.remoteStripConnexion = new RemoteStrip(this.config.remoteStrip.host, (strip, syncRemoteStrip) => {
        this.remoteStrip = strip;
        this.syncRemoteStrip = syncRemoteStrip;
      });

      this.initRemoteStripEventListener()
    }
  }

  initRemoteStripEventListener() {
    const connexionIndicatorElement = document.getElementById(this.config.domMapping.forms.remoteStrip.connexionIndicatorElementId);

    this.remoteStripConnexion.addEventListener(RemoteStrip.ON_CONNECTED, () => {
      connexionIndicatorElement.classList.add('stream-online-indicator--online');
    });

    this.remoteStripConnexion.addEventListener(RemoteStrip.ON_DISCONNECTED, () => {
      connexionIndicatorElement.classList.remove('stream-online-indicator--online');
    });
  }

  initOverlay() {
    // TODO: refactor en web component autonome
    const overlay = document.getElementById('overlay');
    new AutoHiddenLayer(overlay);
  }

  initForms() {
    this.initRemoteStripForm();
  }

  initRemoteStripForm() {
    const formElement = <HTMLFormElement>document.getElementById(this.config.domMapping.forms.remoteStrip.formElementId);
    const inputElement = <HTMLInputElement>document.getElementById(this.config.domMapping.forms.remoteStrip.hostInputElementId);

    inputElement.value = this.config.remoteStrip.host;

    formElement.addEventListener('submit', event => {
      event.preventDefault();

      this.config.remoteStrip.host = inputElement.value;
      localStorage.remoteStripHost = this.config.remoteStrip.host;

      if (this.config.remoteStrip.host) {
        this.remoteStripConnexion.disconnect();
        this.connectToRemoteStrip();
      }

      return false;
    });
  }

  initNoteState() {
    this.strip.forEach(i => {
      this.notes[i] = {
        pressed: false,
        pedal: false,
        velocity: 0,
      }
    });
  }

  initStripBehavior() {
    this.stripBehavior = new this.config.stripBehavior.current(this.strip, this.notes);
  }

  initStripElement() {
    const stripElement = document.getElementById(this.config.domMapping.stripElementId);
    stripElement.style.marginLeft = this.pianoKeyboard.leftMargin + '%';
    stripElement.style.marginRight = this.pianoKeyboard.rightMargin + '%';
    this.lineStripRenderer = new LineStripRenderer(stripElement, this.strip, 8);
  }

  initViewportElement() {
    const viewportElement = document.getElementById(this.config.domMapping.viewportElementId);
    viewportElement.style.marginLeft = this.pianoKeyboard.leftMargin + '%';
    viewportElement.style.marginRight = this.pianoKeyboard.rightMargin + '%';
    this.slideUpStripRenderer = new SlideUpStripRenderer(viewportElement, this.strip, 4);
  }

  initPianoKeyboard() {
    this.pianoKeyboard = new PianoKeyboard(
      document.getElementById('pianoKeyboard'),
      this.config.pianoKeyboard.noteRange.start,
      this.config.pianoKeyboard.noteRange.end
    );
  }

  initMidiAccess() {
    const midiPorts = document.getElementById(this.config.domMapping.midiPortsElementId);
    const midiAccess = new MidiAccess();

    midiAccess.addEventListener(MidiAccess.ON_PORT_CONNECTED, (event: CustomEvent<PortEvent>) => {
      this.pianoKeyboard.enable();

      const portItem = document.createElement('li');
      portItem.innerText = `[${event.detail.port.type}] ${event.detail.port.name}`;
      midiPorts.appendChild(portItem);
    });

    midiAccess.addEventListener(MidiAccess.ON_PORT_DISCONNECTED, (event: CustomEvent<PortEvent>) => {
      this.pianoKeyboard.disable();
    });

    midiAccess.addEventListener(MidiAccess.ON_NOTE_ON, (event: CustomEvent<NoteOnEvent>) => {
      this.pianoKeyboard.pressKey(event.detail.note);
      this.notes[event.detail.note - this.config.pianoKeyboard.noteRange.start].pressed   = true;
      this.notes[event.detail.note - this.config.pianoKeyboard.noteRange.start].pedal     = this.pianoKeyboard.isPedalDown();
      this.notes[event.detail.note - this.config.pianoKeyboard.noteRange.start].velocity  = event.detail.velocity / 128;
    })

    midiAccess.addEventListener(MidiAccess.ON_NOTE_OFF, (event: CustomEvent<NoteOffEvent>) => {
      this.pianoKeyboard.releaseKey(event.detail.note);
      this.notes[event.detail.note - this.config.pianoKeyboard.noteRange.start].pressed = false;
    });

    midiAccess.addEventListener(MidiAccess.ON_SUSTAIN, (event: CustomEvent<SustainEvent>) => {
      this.pianoKeyboard.setPedal(event.detail.level);

      if (this.pianoKeyboard.isPedalDown()) {
        this.notes.forEach(note => note.pedal = !!(note.pressed || note.pedal));
      } else {
        this.notes.forEach(note => note.pedal = false);
      }
    });

    midiAccess.requestMidiAccess();

    this.pianoKeyboard.addEventListener(PianoKeyboard.ON_NOTE_ON, (event: CustomEvent<NoteOnEvent>) => {
      midiAccess.triggerNoteOn(event.detail.note, event.detail.velocity);
      midiAccess.sendNoteOn(event.detail.note, event.detail.velocity);
    });

    this.pianoKeyboard.addEventListener(PianoKeyboard.ON_NOTE_OFF, (event: CustomEvent<NoteOffEvent>) => {
      midiAccess.triggerNoteOff(event.detail.note);
      midiAccess.sendNoteOff(event.detail.note);
    });
  }

  startMainLoop() {
    this.onTick();

    setTimeout(() => this.startMainLoop(), this.frameInterval);
  }

  private initStripBehaviorSelectElement() {
    const selectElement = document.getElementById(this.config.domMapping.stripBehaviorSelectElementId);

    Object.entries(this.config.stripBehavior.list).forEach(([key, value]) => {
      const optionElement = document.createElement('option');

      optionElement.value = key;
      optionElement.innerText = key;

      if (value === this.config.stripBehavior.current) {
        optionElement.selected = true;
      }

      selectElement.appendChild(optionElement);
    });

    selectElement.addEventListener('change', (event) => {
      const selectedBehavior = (event.target as HTMLSelectElement).value;
      this.config.stripBehavior.current = this.config.stripBehavior.list[selectedBehavior];
      this.initStripBehavior();
    });
  }
}



const app = new App(appConfig);
app.start();
