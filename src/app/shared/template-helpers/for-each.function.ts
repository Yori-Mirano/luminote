/**
 * @module forEach
 */
export function forEach(collection: any[], callback: (item: any, index: number) => string): string {
  return collection.reduce((template, item, index) => template += callback(item, index), '');
}
