export type Fn<Args extends any[] = any[], R = any> = (...args: Args) => R;

class BetterSet<T = any> implements Iterable<T> {
  get [Symbol.iterator]() {
    return this.#items[Symbol.iterator].bind(this.#items);
  }

  #items: Set<T>;

  constructor(private equals?: (a: T, b: T) => boolean) {
    this.#items = new Set<T>();
  }

  __provideItems = (items: Set<T> | BetterSet<T>) => {
    if (items instanceof BetterSet) {
      this.#items = items.#items;
    } else {
      this.#items = items;
    }
  };

  #add = (item: T) => {
    const equals = this.equals;

    for (const item2 of this.#items) {
      if (!equals) break;
      if (equals(item, item2)) return;
    }

    this.#items.add(item);
    return item;
  };

  add = (...items: T[]) => {
    items.forEach(this.#add);
  };

  get has() {
    return this.#items.has.bind(this.#items);
  }

  get values() {
    return this.#items.values.bind(this.#items)();
  }

  get size() {
    return this.#items.size;
  }

  get clear() {
    return this.#items.clear.bind(this.#items);
  }

  get forEach() {
    return this.#items.forEach.bind(this.#items);
  }

  get isEmpty() {
    return this.size === 0;
  }

  get delete() {
    return this.#items.delete.bind(this.#items);
  }

  get entries() {
    return this.#items.entries();
  }

  get keys() {
    return this.#items.keys();
  }

  get toString() {
    const lines = [`BetterSet [`];

    for (const item of this.#items) {
      lines.push(`  ${JSON.stringify(item, null, 2)},`);
    }

    lines.push(`]`);
    return lines.join('\n');
  }

  get toLocaleString() {
    return this.toString;
  }

  get toArray() {
    return Array.from(this.#items);
  }

  // #region With others
  union = <U>(
    other: BetterSet<U>,
    equals: Fn<[U | T, U | T], boolean>,
  ) => {
    const rest = new BetterSet<U | T>(equals);
    const items = this.#items.union(other.#items);
    rest.__provideItems(items);
    return rest;
  };

  intersection = <U>(
    other: BetterSet<U>,
    equals: Fn<[U | T, U | T], boolean>,
  ) => {
    const rest = new BetterSet<U | T>(equals);
    const items = this.#items.intersection(other.#items);
    rest.__provideItems(items);
    return rest;
  };

  difference = <U>(
    other: BetterSet<U>,
    equals: Fn<[U | T, U | T], boolean>,
  ) => {
    const rest = new BetterSet<U | T>(equals);
    const items = this.#items.difference(other.#items);
    rest.__provideItems(items);
    return rest;
  };

  symmetricDifference = <U>(
    other: BetterSet<U>,
    equals: Fn<[U | T, U | T], boolean>,
  ) => {
    const rest = new BetterSet<U | T>(equals);
    const items = this.#items.symmetricDifference(other.#items);
    rest.__provideItems(items);
    return rest;
  };

  isSubsetOf = (other: BetterSet) => {
    return this.#items.isSubsetOf(other.#items);
  };

  isSupersetOf = (other: BetterSet) => {
    return this.#items.isSupersetOf(other.#items);
  };

  isDisjointFrom = (other: BetterSet) => {
    return this.#items.isDisjointFrom(other.#items);
  };

  // #endregion

  [Symbol.toStringTag] = 'BetterSet';
}

export const createBetterSet = <T = any>(equals?: Fn<[T, T], boolean>) =>
  new BetterSet<T>(equals);
export const createSet = createBetterSet;

export { type BetterSet };
