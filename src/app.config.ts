import { AppConfig } from "./AppConfig.model";
import { SimpleStripBehavior } from "./app/stripBehaviors/SimpleStripBehavior";
import { RipplesStripBehavior } from "./app/stripBehaviors/RipplesStripBehavior";
import { AssistantStripBehavior } from "./app/stripBehaviors/AssistantStripBehavior";
import { MidiNoteTools } from "./app/MidiNoteTools";


export const appConfig: AppConfig = {
  remoteStrip: {
    host: localStorage.remoteStripHost || '',
    startNote: MidiNoteTools.getMidiNote('A1'),
  },

  pianoKeyboard: {
    noteRange: {
      start:  MidiNoteTools.getMidiNote('A1'),
      end:    MidiNoteTools.getMidiNote('C9'),
    }
  },

  framePerSecond: 60,

  stripBehavior: {
    list: {
      simple: SimpleStripBehavior,
      ripples: RipplesStripBehavior,
      assistant: AssistantStripBehavior,
    },
    current: RipplesStripBehavior,
  },

  domMapping: {
    forms: {
      remoteStrip: {
        formElementId: 'remoteStripForm',
        hostInputElementId: 'remoteStripForm_host',
        connexionIndicatorElementId: 'remoteStripForm_connexionIndicator',
      }
    },

    stripElementId: 'strip',
    viewportElementId: 'viewport',
    midiPortsElementId: 'midiPorts',
  },
}
