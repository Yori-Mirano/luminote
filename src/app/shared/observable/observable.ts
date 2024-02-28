/**
 * @group Observable
 * @module Observable
 */

export type ObservableCallback<T> = (value: T) => void;

export class Observable<T> {

  private _callbacks: ObservableCallback<T>[] = [];

  constructor(private _value?: T) { }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
    this._callbacks.forEach(callback => callback(value));
  }

  onChange(callback: ObservableCallback<T>) {
    this._callbacks.push(callback);
  }

}
