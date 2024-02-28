import { CustomElement } from "../../../shared/custom-element";
import { callback } from "../../../shared/template-helpers/callback.function";
import { forEach } from "../../../shared/template-helpers/for-each.function";
import { appConfig } from "../../../../app.config";
import { appStateStore } from "../../../../app.state-store";
import { ElementRef } from "../../../shared/template-helpers/element-ref";
import MIDIPortType = WebMidi.MIDIPortType;

export class ConfigPanelElement extends HTMLElement implements CustomElement {

  elementRefs = {
    remoteStripConnexionIndicator: new ElementRef(),
    remoteStripHostInput: new ElementRef<HTMLInputElement>(),
    midi: {
      count: new ElementRef(),
      ports: {
        input: new ElementRef(),
        output: new ElementRef(),
      }
    }
  };

  connectedCallback() {
    this.initView();

    appStateStore.strip.isRemoteConnected.onChange(isConnected => {
      if (isConnected) {
        this.elementRefs.remoteStripConnexionIndicator.element.classList.add('-online');
      } else {
        this.elementRefs.remoteStripConnexionIndicator.element.classList.remove('-online');
      }
    });

    (['input', 'output'] as MIDIPortType[]).forEach(portType => {
      appStateStore.midi.ports[portType].onChange(list => {
        const midiPorts = this.elementRefs.midi.ports[portType].element;
        midiPorts.innerHTML = '';

        list.forEach(port => {
          const portItem = document.createElement('li');
          portItem.innerText = port;
          midiPorts.appendChild(portItem);
        });

        const inputCount = appStateStore.midi.ports.input.value.length;
        const outputCount = appStateStore.midi.ports.output.value.length;
        this.elementRefs.midi.count.element.innerHTML = `
          <span class="tag ${ inputCount ? '-success' : '' }">inputs: <strong>${ inputCount }</strong></span>
          <span class="tag ${ outputCount ? '-success' : '' }">outputs: <strong>${ outputCount }</strong></span>
        `;
      });
    });
  }

  initView() {
    this.innerHTML = `
      <style>
        ${ this.tagName } {
          display: flex;
          flex-direction: column;
          gap: .2rem;
        }
      </style>
      
      <section class="app_section">
        <h2>Strip behavior</h2>
        <select class="input" onchange="${ callback(e => this.selectStripBehavior(e)) }">
          ${ forEach(Object.keys(appConfig.stripBehavior.list), key => `
            <option value="${ key }" ${ key === appStateStore.strip.behavior.value ? 'selected' : '' }>
              ${ key }
            </option>
          `)}
        </select>
      </section>
      
      <section class="app_section">
        <h2>Viewport</h2>
        <select class="input" onchange="${ callback(e => this.selectViewportRenderer(e)) }">
          ${ forEach(Object.keys(appConfig.viewportRenderer.list), key => `
            <option value="${ key }" ${ key === appStateStore.viewportRenderer.value ? 'selected' : '' }>
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
            value="${ appStateStore.strip.remoteHost.value }"
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
        <summary>
          Connected MIDI devices
          <span ${ this.elementRefs.midi.count }></span>
        </summary>
        
        <h3>Inputs</h3>
        <ul ${ this.elementRefs.midi.ports.input }></ul>
        
        <h3>Outputs</h3>
        <ul ${ this.elementRefs.midi.ports.output }></ul>
      </details>
      
      <section class="app_section text-center">
        <p>
          by Yori Mirano | <a href="https://github.com/Yori-Mirano/luminote">Github</a>
        </p>
      </section>
    `;
  }

  onConnectToRemoteStrip(event: Event) {
    event.preventDefault();
    appStateStore.strip.remoteHost.value = this.elementRefs.remoteStripHostInput.element.value;
  }

  selectStripBehavior(event: Event) {
    appStateStore.strip.behavior.value = (event.target as HTMLSelectElement).value;
  }

  selectViewportRenderer(event: Event) {
    appStateStore.viewportRenderer.value = (event.target as HTMLSelectElement).value;
  }

}

customElements.define('app-config-panel', ConfigPanelElement);
