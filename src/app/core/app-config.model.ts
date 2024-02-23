import { Strip } from "../shared/strip/strip";
import { Note } from "../shared/strip/note.model";
import { StripBehavior } from "../shared/strip/stripBehaviors/abstracts/strip-behavior";

export interface AppConfig {
  remoteStrip: RemoteStripConfig;
  pianoKeyboard: PianoKeyboardConfig;
  stripBehavior: StripBehaviorConfig;
  viewportRenderer: ViewportRendererConfig;
}

export interface RemoteStripConfig {
  host: string;
  startPointNote: number;
}

export interface PianoKeyboardConfig {
  lowestKey: number;
  highestKey: number;
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
  current: string,
}

export interface StripBehaviorList {
  [key: string]: StripBehaviorConstructor;
}

export interface ViewportRendererConfig {
  list: ViewportRendererList,
  current: string,
}

export interface ViewportRendererList {
  [key: string]: string;
}

//type ConstructorParameters<T> = T extends new (...args: infer U) => any ? U : never;
//export type StripBehaviourConstructor = new (...args: ConstructorParameters<typeof StripBehavior>) => StripBehavior;
export type StripBehaviorConstructor = new (strip: Strip, notes: Note[]) => StripBehavior;

