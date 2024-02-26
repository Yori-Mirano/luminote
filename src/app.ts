import './app.scss';
import "./app/shared/custom-elements";
import { PianoKeyboardElement } from "./app/shared/custom-elements/piano-keyboard/piano-keyboard.element";
import { RemoteStrip } from "./app/shared/strip/remote-strip";
import { MidiAccess, NoteOffEvent, NoteOnEvent, PortEvent, SustainEvent } from "./app/shared/midi/midi-access";
import { Strip } from "./app/shared/strip/strip";
import { Note } from "./app/shared/strip/note.model";
import { StripBehavior } from "./app/shared/strip/stripBehaviors/abstracts/strip-behavior";
import { appConfig } from "./app.config";
import { StripRendererElement } from "./app/shared/custom-elements/stripRenderers/abstracts/strip-renderer.element";
import { CustomElement } from "./app/shared/custom-elements/custom-element";
import { ElementRef } from "./app/shared/template-helpers/element-ref";
import { callback } from "./app/shared/template-helpers/callback.function";
import { forEach } from "./app/shared/template-helpers/forEach.function";
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
    remoteStripHostInput: new ElementRef<HTMLInputElement>(),
    remoteStripConnexionIndicator: new ElementRef(),
    midiPortsList: new ElementRef(),
  }

  viewportRendererElement: StripRendererElement;


  connectedCallback() {
    this.viewInit();
    this.init();
  }

  viewInit() {
    this.innerHTML = `
      <app-auto-hide data-delay="1000" class="app_overlay">
        <section class="app_section">
          <h2>Strip behavior</h2>
          <select class="input" onchange="${ callback(e => this.selectStripBehavior(e)) }">
            ${ forEach(Object.keys(appConfig.stripBehavior.list), key => `
              <option value="${ key }" ${ key === appStateStore.currentStripBehavior.value ? 'selected' : '' }>
                ${ key }
              </option>
            `)}
          </select>
        </section>
        
        <section class="app_section">
          <h2>Viewport</h2>
          <select class="input" onchange="${ callback(e => this.selectViewportRenderer(e)) }">
            ${ forEach(Object.keys(appConfig.viewportRenderer.list), key => `
              <option value="${ key }" ${ key === appStateStore.currentViewportRenderer.value ? 'selected' : '' }>
                ${ key }
              </option>
            `)}
          </select>
        </section>
      
        <section class="app_section">
          <h2>Remote strip</h2>
          <form class="app_remoteStripForm comboInput mb-1" onsubmit="${ callback(e => this.onConnectToRemoteStrip(e)) }">
            <div ${ this.elementRefs.remoteStripConnexionIndicator } class="app_remoteStripForm_connexionIndicator input"></div>
            <input
              ${ this.elementRefs.remoteStripHostInput }
              type="text"
              class="input"
              size="1"
              placeholder="Type the IP of the remote strip"
              value="${ appStateStore.remoteStripHost.value }"
            />
            <input type="submit" value="Connect" class="button"/>
          </form>
        
          <details>
            <summary>How this works ?</summary>
            <h3>Purpose</h3>
            <p>
              Allows <strong>Luminote</strong> to control a <strong>LED strip (WS2812)</strong>, connected to an <strong>ESP32</strong>, via the <strong>Wi-Fi network</strong>.
            </p>
            
            <h3>How to use it</h3>
            <h4>LED strip</h4>
            <ol>
              <li class="mb-1">
                <strong>Install the <a href="https://github.com/Yori-Mirano/websocket-esp32-remote-led-strip">websocket-esp32-remote-led-strip</a> program</strong>
                to an <strong>ESP32</strong> (follow the README instructions)
              </li>
              
              <li class="mb-1">
                <strong>Plug</strong> a <strong>LED strip (WS2812)</strong> to the <strong>ESP32</strong>
              </li>
              
              <li class="mb-1">
                <strong>Turn it on</strong>
              </li>
            </ol>
              
            <h4>Luminote</h4>
            <ol>
              <li class="mb-1">
                <a class="button" href="${ window.location.href }" download>Download Luminote</a>
              </li>
              
              <li class="mb-1">
                Open it <strong>locally</strong>
              </li>
              
              <li class="mb-1">
                <strong>Type the IP</strong> of the LED strip, and <strong>connect</strong>
              </li>
              
              <li class="mb-1">
                <strong>Play piano to see the LED strip react</strong><br/>
                (with your MIDI device, or by clicking any key on the virtual piano keyboard)
              </li>
            </ol>
            
            <h3>Why locally ?</h3>
            <p>
              Luminote connects to the LED strip via the <code>ws://</code> protocol because the ESP32 does not have the capacity to
              support the encrypted one (<code>wss://</code>).
            </p>
            <p>
              However, browsers, for security reasons, prevents the use of such a
              connection from a site hosted on a server.
            </p>
          </details>
        </section>
        
        <details class="app_section">
          <summary>Connected MIDI devices</summary>
          <ul ${ this.elementRefs.midiPortsList }></ul>
        </details>
        
        <section class="app_section text-center">
          <p>
            by Yori Mirano | <a href="https://github.com/Yori-Mirano/luminote">Github</a>
          </p>
        </section>
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
      this.elementRefs.remoteStripConnexionIndicator.element.classList.add('-online');
    });

    this.remoteStripConnexion.addEventListener(RemoteStrip.ON_DISCONNECTED, () => {
      this.elementRefs.remoteStripConnexionIndicator.element.classList.remove('-online');
    });
  }


  onConnectToRemoteStrip(event: Event) {
    event.preventDefault();
    appStateStore.remoteStripHost.value = this.elementRefs.remoteStripHostInput.element.value;
    this.connectToRemoteStrip();
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
    const stripBehaviorClass = appConfig.stripBehavior.list[appStateStore.currentStripBehavior.value];
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
    const rendererTagname = appConfig.viewportRenderer.list[appStateStore.currentViewportRenderer.value];
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
    const midiPorts = this.elementRefs.midiPortsList.element;
    const midiAccess = new MidiAccess();

    midiAccess.addEventListener(MidiAccess.ON_PORT_CONNECTED, (event: CustomEvent<PortEvent>) => {
      this.elementRefs.pianoKeyboard.element.enable();

      const portItem = document.createElement('li');
      portItem.innerText = `[${event.detail.port.type}] ${event.detail.port.name}`;
      midiPorts.appendChild(portItem);
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

  selectStripBehavior(event: Event) {
    appStateStore.currentStripBehavior.value = (event.target as HTMLSelectElement).value;
    this.initStripBehavior();
  }

  selectViewportRenderer(event: Event) {
    appStateStore.currentViewportRenderer.value = (event.target as HTMLSelectElement).value;
    this.initViewportRenderer();
  }
}

customElements.define('app-root', AppElement);
