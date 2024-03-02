/**
 * @group Observable
 * @module Observable
 */

export type ObservableCallback<T> = (value: T) => void;

export class Observable<T> {

  private _value?: T;
  private _callbacks: ObservableCallback<T>[] = [];
  private _applyInProgress = false;

  constructor(value?: T) {
    this.value = value;
  }

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    if (typeof value === 'object') {
      value = this._getProxy(value);
    }

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

  private _getProxy(value: T) {
    const handler = {
      get: (target: any, key: any, receiver: any) => {
        if (key == 'isProxy') {
          return true;
        }

        const prop = target[key];

        // return if property not found
        if (typeof prop == 'undefined') {
          return;
        }

        // set value as proxy if object or function
        if (!prop.isProxy && ['object', 'function'].includes(typeof prop)) {
          target[key] = new Proxy(prop, handler);
        }

        //return target[key];
        return Reflect.get(target, key, receiver);
      },

      set: (target: any, key: any, value: any, receiver: any) => {
        //target[key] = value;
        Reflect.set(target, key, value, receiver);

        // Check prevents duplicate callbacks from operations like `push` on an array, which update both the array and its `length`.
        if (Array.isArray(target)) {
          if (key === 'length' || !this._applyInProgress) {
            this.notifyChange();
          }
        } else {
          this.notifyChange();
        }

        return true;
      },

      apply: (target: any, thisArg: any, argumentsList: any) => {
        this._applyInProgress = true;
        //const result = target.apply(thisArg, argumentsList);
        const result = Reflect.apply(target, thisArg, argumentsList);
        this._applyInProgress = false;

        return result;
      }
    };

    return new Proxy(value, handler);
  }

}
