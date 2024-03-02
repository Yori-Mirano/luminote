import { AppConfig } from "./app/core/app-config.model";
import { SimpleStripBehavior } from "./app/shared/strip/stripBehaviors/simple.strip-behavior";
import { RipplesStripBehavior } from "./app/shared/strip/stripBehaviors/ripples.strip-behavior";
import { OctavesStripBehavior } from "./app/shared/strip/stripBehaviors/octaves-strip.behavior";
import { MidiNoteTools } from "./app/shared/midi/midi-note-tools";


export const appConfig: AppConfig = {
  pianoKeyboard: {
    lowestKey:  MidiNoteTools.getMidiNote('A1'),
    highestKey: MidiNoteTools.getMidiNote('C9'),
  },

  remoteStrip: {
    host: '',
    startPointNote: MidiNoteTools.getMidiNote('A1'),
  },

  stripBehavior: {
    list: {
      Simple: SimpleStripBehavior,
      Ripples: RipplesStripBehavior,
      Octaves: OctavesStripBehavior,
    },
    current: localStorage.stripBehavior || 'Ripples',
  },

  viewportRenderer: {
    list: {
      'Skylines': 'app-line-strip-renderer',
      'Slide up': 'app-slide-up-strip-renderer',
    },
    current: localStorage.viewportRenderer || 'Skylines',
  }
}
