import { appConfig } from "./app.config";
import { PersistedObservable } from "./app/shared/persisted-observable";

export const appStateStore = {
  remoteStripHost: new PersistedObservable('remoteStripHost', appConfig.remoteStrip.host),
  currentStripBehavior: new PersistedObservable('currentStripBehavior', appConfig.stripBehavior.current),
  currentViewportRenderer: new PersistedObservable('currentViewportRenderer', appConfig.viewportRenderer.current),
};
