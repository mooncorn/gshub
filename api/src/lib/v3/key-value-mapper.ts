export class KeyValueMapper<K extends string | number, V> {
  constructor(public separator: string) {}

  mapArrayToObject(arr: string[]): Record<K, V> {
    const map = new Map<K, V>();

    for (const item of arr) {
      const kv = item.split(this.separator);
      const k = kv[0] as K;
      const v = kv[1] as V;

      if (k !== undefined && v !== undefined) {
        map.set(k, v);
      }
    }

    return Object.fromEntries(map) as Record<K, V>;
  }

  mapObjectToArray(obj: Record<K, V>): string[] {
    const arr = [];
    for (const [key, value] of Object.entries(obj)) {
      arr.push(`${key}${this.separator}${value}`);
    }
    return arr;
  }
}
