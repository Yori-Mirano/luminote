import { Strip } from "./Strip";
import { Note } from "./Note.model";
import { StripBehavior } from "./stripBehaviors/abstracts/StripBehavior";

export interface AppConfig {
  remoteStrip: RemoteStripConfig;
  pianoKeyboard: PianoKeyboardConfig;
  stripBehavior: StripBehaviorConfig;
  framePerSecond: number;
  domMapping: DomMappingConfig;
}

export interface RemoteStripConfig {
  host: string;
  startNote: number;
}

export interface PianoKeyboardConfig {
  noteRange: NoteRangeConfig;
}

export interface NoteRangeConfig {
  start: number;
  end: number;
}

export interface FormsConfig {
  remoteStrip: RemoteStripFormConfig;
}

export interface RemoteStripFormConfig {
  formElementId: string,
  hostInputElementId: string,
  connexionIndicatorElementId: string,
}

export interface StripBehaviorConfig {
  list: StripBehaviorList,
  current: StripBehaviorConstructor,
}

export interface StripBehaviorList {
  [key: string]: StripBehaviorConstructor;
}

//type ConstructorParameters<T> = T extends new (...args: infer U) => any ? U : never;
//export type StripBehaviourConstructor = new (...args: ConstructorParameters<typeof StripBehavior>) => StripBehavior;
export type StripBehaviorConstructor = new (strip: Strip, notes: Note[]) => StripBehavior;

export interface DomMappingConfig {
  forms: FormsConfig;
  stripElementId: string,
  viewportElementId: string,
  midiPortsElementId: string,
  stripBehaviorSelectElementId: string,
}
