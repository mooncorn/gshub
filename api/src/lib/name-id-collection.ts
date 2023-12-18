export interface Identifiable {
  id: string;
}

export interface Nameable {
  name: string;
}

export interface IdentifiableNameable extends Identifiable, Nameable {}

export class NameIdCollection<T extends IdentifiableNameable> {
  private map: Map<string, T>;
  private nameIdMap: Map<string, string>;

  constructor() {
    this.map = new Map();
    this.nameIdMap = new Map();
  }

  add(item: T): void {
    this.map.set(item.id, item);
    this.nameIdMap.set(item.name, item.id);
  }

  remove(id: string): T | undefined {
    const item = this.map.get(id);

    if (!item) return;

    this.map.delete(item.id);
    this.nameIdMap.delete(item.name);
    return item;
  }

  getById(id: string): T | undefined {
    return this.map.get(id);
  }

  getByName(name: string): T | undefined {
    const id = this.nameIdMap.get(name);
    if (!id) return;
    return this.map.get(id);
  }

  has(id: string): boolean {
    return this.map.has(id);
  }

  values(): T[] {
    return Array.from(this.map.values());
  }

  forEach(callback: (item: T) => void): void {
    this.map.forEach(callback);
  }
}
