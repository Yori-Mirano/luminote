/**
 * @module callback
 */
let count = 0;

const GLOBAL_REGISTRY_NAME = 'templateCallbacks';

(window as any)[GLOBAL_REGISTRY_NAME] = [];

/**
 * Formats a callback function to be used in a template.
 *
 * @param callback - The callback function to be formatted.
 * @returns The formatted callback.
 */
export function callback(callback: (event: Event) => void): string {
  count++;

  (window as any)[GLOBAL_REGISTRY_NAME][count] = callback;

  return `${ GLOBAL_REGISTRY_NAME }[${ count }](event)`;
}
