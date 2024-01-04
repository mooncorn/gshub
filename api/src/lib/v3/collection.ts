export interface Identifiable<T> {
  id: T;
}

export interface ICollection<K, V extends Identifiable<K>> {
  add(item: V): void;
  remove(key: K): V | undefined;
  get(key: K): V | undefined;
  has(key: K): boolean;
  values(): V[];
}

export class Collection<K, V extends Identifiable<K>>
  implements ICollection<K, V>
{
  private map = new Map<K, V>();

  constructor(items: V[]) {
    for (const item of items) {
      this.add(item);
    }
  }

  add(item: V): void {
    this.map.set(item.id, item);
  }

  remove(key: K): V | undefined {
    const item = this.map.get(key);

    if (!item) return;

    this.map.delete(item.id);
    return item;
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  values(): V[] {
    return Array.from(this.map.values());
  }
}
