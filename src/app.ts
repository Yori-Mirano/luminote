import './app.scss';
import "./app/core/custom-elements.index";
import { PianoKeyboardElement } from "./app/shared/custom-elements/piano-keyboard/piano-keyboard.element";
import { RemoteStrip } from "./app/shared/strip/remote-strip";
import { MidiAccess, NoteOffEvent, NoteOnEvent, PortEvent, SustainEvent } from "./app/shared/midi/midi-access";
import { Strip } from "./app/shared/strip/strip";
import { Note } from "./app/shared/strip/note.model";
import { StripBehavior } from "./app/shared/strip/stripBehaviors/abstracts/strip-behavior";
import { appConfig } from "./app.config";
import { StripRendererElement } from "./app/shared/custom-elements/stripRenderers/abstracts/strip-renderer.element";
import { CustomElement } from "./app/shared/custom-element";
import { ElementRef } from "./app/shared/template-helpers/element-ref";
import { appStateStore } from "./app.state-store";

class AppElement extends HTMLElement implements CustomElement {

  framePerSecond = 60;
  frameInterval = 1000 / this.framePerSecond;

  strip: Strip;
  stripBehavior: StripBehavior;

  remoteStripConnexion: RemoteStrip;
  remoteStrip: Strip;
  remoteStripOffset: number;
  syncRemoteStrip: () => void;

  notes: Note[] = [];

  elementRefs = {
    lineStripRenderer: new ElementRef<StripRendererElement>(),
    viewportStripRenderer: new ElementRef<StripRendererElement>(),
    pianoKeyboard: new ElementRef<PianoKeyboardElement>(),
  };

  viewportRendererElement: StripRendererElement;


  connectedCallback() {
    this.viewInit();
    this.init();
  }

  viewInit() {
    this.innerHTML = `
      <app-auto-hide data-delay="1000" class="app_overlay">
        <app-config-panel></app-config-panel>
      </app-auto-hide>
      
      <div ${ this.elementRefs.viewportStripRenderer } class="grow relative"></div>
      <app-line-strip-renderer ${ this.elementRefs.lineStripRenderer } class="app_strip"></app-line-strip-renderer>
      
      <app-piano-keyboard 
          ${ this.elementRefs.pianoKeyboard }
          class="shrink-0"
          data-lowest-key="${ appConfig.pianoKeyboard.lowestKey }"
          data-highest-key="${ appConfig.pianoKeyboard.highestKey }">
      </app-piano-keyboard>
    `;
  }

  init() {
    this.initStrip()
    this.initNoteState();
    this.initStripBehavior();
    this.initRemoteStrip();
    this.initStripElement();
    this.initViewportRenderer();
    this.initMidiAccess();

    appStateStore.strip.remoteHost.onChange(() => this.connectToRemoteStrip());
    appStateStore.strip.behavior.onChange(() => this.initStripBehavior());
    appStateStore.viewportRenderer.onChange(() => this.initViewportRenderer());

    this.startMainLoop();
  }

  onTick() {
    this.stripBehavior.tick()

    if (this.remoteStrip && this.syncRemoteStrip) {
      this.strip.copyTo(this.remoteStrip, this.remoteStripOffset);
      this.syncRemoteStrip();
    }

    this.elementRefs.lineStripRenderer.element.render();
    this.viewportRendererElement.render();
  }


  initStrip() {
    this.strip = new Strip(appConfig.pianoKeyboard.highestKey - appConfig.pianoKeyboard.lowestKey + 1);
  }

  initRemoteStrip() {
    this.remoteStripOffset = appConfig.remoteStrip.startPointNote - appConfig.pianoKeyboard.lowestKey;
    this.connectToRemoteStrip();
  }

  connectToRemoteStrip() {
    if (appConfig.remoteStrip.host) {
      if (this.remoteStripConnexion) {
        this.remoteStripConnexion.disconnect();
      }

      this.remoteStripConnexion = new RemoteStrip(appConfig.remoteStrip.host, (strip, syncRemoteStrip) => {
        this.remoteStrip = strip;
        this.syncRemoteStrip = syncRemoteStrip;
      });

      this.initRemoteStripEventListener()
    }
  }

  initRemoteStripEventListener() {
    this.remoteStripConnexion.addEventListener(RemoteStrip.ON_CONNECTED, () => {
      appStateStore.strip.isRemoteConnected.value = true;
    });

    this.remoteStripConnexion.addEventListener(RemoteStrip.ON_DISCONNECTED, () => {
      appStateStore.strip.isRemoteConnected.value = false;
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
    const stripBehaviorClass = appConfig.stripBehavior.list[appStateStore.strip.behavior.value];
    this.stripBehavior = new stripBehaviorClass(this.strip, this.notes);
  }

  initStripElement() {
    const element = this.elementRefs.lineStripRenderer.element;

    element.style.marginLeft = this.elementRefs.pianoKeyboard.element.leftMargin + '%';
    element.style.marginRight = this.elementRefs.pianoKeyboard.element.rightMargin + '%';
    element.factor = 8;
    element.strip = this.strip;
  }

  initViewportRenderer() {
    const rendererTagname = appConfig.viewportRenderer.list[appStateStore.viewportRenderer.value];
    const element = <StripRendererElement>document.createElement(rendererTagname);
    this.viewportRendererElement = element;
    element.style.position = 'absolute';
    element.style.inset = '0';
    element.style.marginLeft = this.elementRefs.pianoKeyboard.element.leftMargin + '%';
    element.style.marginRight = this.elementRefs.pianoKeyboard.element.rightMargin + '%';
    this.elementRefs.viewportStripRenderer.element.appendChild(element);

    element.factor = 4;
    element.strip = this.strip;
  }


  initMidiAccess() {
    const midiAccess = new MidiAccess();

    midiAccess.addEventListener(MidiAccess.ON_PORT_CONNECTED, (event: CustomEvent<PortEvent>) => {
      this.elementRefs.pianoKeyboard.element.enable();

      const portType = event.detail.port.type;

      appStateStore.midi.ports[portType].value = [
        ...appStateStore.midi.ports[portType].value,
        event.detail.port.name
      ];
    });

    midiAccess.addEventListener(MidiAccess.ON_PORT_DISCONNECTED, (event: CustomEvent<PortEvent>) => {
      this.elementRefs.pianoKeyboard.element.disable();
    });

    midiAccess.addEventListener(MidiAccess.ON_NOTE_ON, (event: CustomEvent<NoteOnEvent>) => {
      this.elementRefs.pianoKeyboard.element.pressKey(event.detail.note);
      this.notes[event.detail.note - appConfig.pianoKeyboard.lowestKey].pressed   = true;
      this.notes[event.detail.note - appConfig.pianoKeyboard.lowestKey].pedal     = this.elementRefs.pianoKeyboard.element.isPedalDown();
      this.notes[event.detail.note - appConfig.pianoKeyboard.lowestKey].velocity  = event.detail.velocity / 128;
    })

    midiAccess.addEventListener(MidiAccess.ON_NOTE_OFF, (event: CustomEvent<NoteOffEvent>) => {
      this.elementRefs.pianoKeyboard.element.releaseKey(event.detail.note);
      this.notes[event.detail.note - appConfig.pianoKeyboard.lowestKey].pressed = false;
    });

    midiAccess.addEventListener(MidiAccess.ON_SUSTAIN, (event: CustomEvent<SustainEvent>) => {
      this.elementRefs.pianoKeyboard.element.setPedal(event.detail.level);

      if (this.elementRefs.pianoKeyboard.element.isPedalDown()) {
        this.notes.forEach(note => note.pedal = !!(note.pressed || note.pedal));
      } else {
        this.notes.forEach(note => note.pedal = false);
      }
    });

    midiAccess.requestMidiAccess();

    this.elementRefs.pianoKeyboard.element.addEventListener(PianoKeyboardElement.ON_NOTE_ON, (event: CustomEvent<NoteOnEvent>) => {
      midiAccess.triggerNoteOn(event.detail.note, event.detail.velocity);
      midiAccess.sendNoteOn(event.detail.note, event.detail.velocity);
    });

    this.elementRefs.pianoKeyboard.element.addEventListener(PianoKeyboardElement.ON_NOTE_OFF, (event: CustomEvent<NoteOffEvent>) => {
      midiAccess.triggerNoteOff(event.detail.note);
      midiAccess.sendNoteOff(event.detail.note);
    });
  }

  startMainLoop() {
    this.onTick();

    setTimeout(() => this.startMainLoop(), this.frameInterval);
  }
}

customElements.define('app-root', AppElement);
