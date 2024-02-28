/**
 * @group Observable
 * @module PersistedObservable
 */
import { Observable } from "./observable";

export class PersistedObservable<T> extends Observable<T> {

  constructor(public localStorageKeyName: string, value?: T) {
      super(value);

      if (this.localStorageKeyName in localStorage) {
        this.loadFromLocalStorage();
      }

      this.onChange(() => this.saveToLocalStorage());
  }

  private loadFromLocalStorage() {
    this.value = JSON.parse(localStorage.getItem(this.localStorageKeyName));
  }

  private saveToLocalStorage() {
    localStorage.setItem(this.localStorageKeyName, JSON.stringify(this.value));
  }

}
