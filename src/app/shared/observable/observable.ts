/**
 * @group Observable
 * @module Observable
 */

export type ObservableCallback<T> = (value: T) => void;

export class Observable<T> {

  private _callbacks: ObservableCallback<T>[] = [];

  constructor(private _value?: T) { }

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    this._value = value;
    this.notifyChange();
  }

  /**
   * Notifies the registered callbacks that a change has occurred.
   * This method should be explicitly called after any changes in an object or array.
   */
  notifyChange():void {
    this._callbacks.forEach(callback => callback(this.value));
  }

  onChange(callback: ObservableCallback<T>, invokeImmediately: boolean = true):void {
    this._callbacks.push(callback);

    if (invokeImmediately && typeof this.value !== 'undefined') {
      callback(this.value);
    }
  }

}
