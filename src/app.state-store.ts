import { appConfig } from "./app.config";
import { PersistedObservable } from "./app/shared/observable/persisted-observable";
import { Observable } from "./app/shared/observable/observable";

export const appStateStore = {
  strip: {
    remoteHost: new PersistedObservable('remoteStripHost', appConfig.remoteStrip.host),
    isRemoteConnected: new Observable(false),
    behavior: new PersistedObservable('stripBehavior', appConfig.stripBehavior.current),
  },
  viewportRenderer: new PersistedObservable('viewportRenderer', appConfig.viewportRenderer.current),
  midi: {
    ports: {
      input: new Observable<string[]>([]),
      output: new Observable<string[]>([]),
    }
  }
};
