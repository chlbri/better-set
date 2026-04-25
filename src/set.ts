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

  get replaceItems() {
    return this.__provideItems;
  }

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

  #getEquals = (other?: BetterSet<T>, equals?: Fn<[T, T], boolean>) => {
    return equals ?? this.equals ?? other?.equals;
  };

  #hasItem = (items: Set<T>, item: T, equals?: Fn<[T, T], boolean>) => {
    if (!equals) return items.has(item);

    for (const entry of items) {
      if (equals(entry, item)) return true;
    }

    return false;
  };

  // #region With others
  union = (other: BetterSet<T>, equals?: Fn<[T, T], boolean>) => {
    const comparator = this.#getEquals(other, equals);
    const rest = new BetterSet(comparator);
    rest.add(...this.#items);
    rest.add(...other.#items);
    return rest;
  };

  intersection = (other: BetterSet<T>, equals?: Fn<[T, T], boolean>) => {
    const comparator = this.#getEquals(other, equals);
    const rest = new BetterSet(comparator);

    this.#items.forEach(item => {
      const check = this.#hasItem(other.#items, item, comparator);
      if (check) rest.add(item);
    });

    return rest;
  };

  difference = (other: BetterSet<T>, equals?: Fn<[T, T], boolean>) => {
    const comparator = this.#getEquals(other, equals);
    const rest = new BetterSet(comparator);

    this.#items.forEach(item => {
      const check = !this.#hasItem(other.#items, item, comparator);
      if (check) rest.add(item);
    });

    return rest;
  };

  symmetricDifference = (
    other: BetterSet<T>,
    equals?: Fn<[T, T], boolean>,
  ) => {
    const comparator = this.#getEquals(other, equals);
    const rest = new BetterSet(comparator);

    this.#items.forEach(item => {
      const check = !this.#hasItem(other.#items, item, comparator);
      if (check) rest.add(item);
    });

    other.#items.forEach(item => {
      const check = !this.#hasItem(this.#items, item, comparator);
      if (check) rest.add(item);
    });

    return rest;
  };

  isSubsetOf = (other: BetterSet<T>) => {
    const comparator = this.#getEquals(other);
    if (!comparator) return this.#items.isSubsetOf(other.#items);

    for (const item of this.#items) {
      const check = !this.#hasItem(other.#items, item, comparator);
      if (check) return false;
    }

    return true;
  };

  isSupersetOf = (other: BetterSet<T>) => {
    const comparator = this.#getEquals(other as BetterSet<T>);

    if (!comparator) return this.#items.isSupersetOf(other.#items);

    for (const item of other.#items) {
      const check = !this.#hasItem(this.#items, item, comparator);
      if (check) return false;
    }

    return true;
  };

  isDisjointFrom = (other: BetterSet<T>) => {
    const comparator = this.#getEquals(other);

    if (!comparator) return this.#items.isDisjointFrom(other.#items);

    for (const item of this.#items) {
      const check = this.#hasItem(other.#items, item, comparator);
      if (check) return false;
    }

    return true;
  };

  // #endregion

  [Symbol.toStringTag] = 'BetterSet';
}

export const createBetterSet = <T = any>(equals?: Fn<[T, T], boolean>) => {
  return new BetterSet<T>(equals);
};

export const createSet = createBetterSet;

export { type BetterSet };
