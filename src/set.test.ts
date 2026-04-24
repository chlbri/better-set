import { describe, expect, test } from 'vitest';

import { createBetterSet, createSet } from './index';

describe('BetterSet', () => {
  test('#01 => creates a set and handles default equality with primitives', () => {
    const set = createBetterSet<number>();

    expect(set.isEmpty).toBe(true);
    expect(set.size).toBe(0);

    set.add(1, 2, 2, 3);

    expect(set.size).toBe(3);
    expect(set.isEmpty).toBe(false);
    expect(set.has(1)).toBe(true);
    expect(set.has(4)).toBe(false);
    expect(set.toArray).toEqual([1, 2, 3]);
    expect(Array.from(set.values)).toEqual([1, 2, 3]);
    expect(Array.from(set.keys)).toEqual([1, 2, 3]);
    expect(Array.from(set.entries)).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
  });

  test('#02 => supports custom equality for duplicate object values', () => {
    const byId = (a: { id: number }, b: { id: number }) => a.id === b.id;
    const set = createBetterSet(byId);
    const first = { id: 1 };

    set.add(first, { id: 1 }, { id: 2 });

    expect(set.size).toBe(2);
    expect(set.has(first)).toBe(true);
    expect(set.toArray.map(item => item.id)).toEqual([1, 2]);
  });

  test('#03 => uses __provideItems to inherit items from another BetterSet instance', () => {
    const source = createBetterSet<number>();
    source.add(1, 2);

    const target = createBetterSet<number>();
    target.__provideItems(source);

    expect([...target]).toEqual([1, 2]);
    expect(target.toArray).toEqual([1, 2]);

    source.add(3);
    expect([...target]).toEqual([1, 2, 3]);
  });

  test('#04 => delete, clear, and forEach work correctly', () => {
    const set = createSet();

    set.add('a', 'b', 'c');

    const values: string[] = [];
    set.forEach((item, key, self) => {
      values.push(item);
      expect(self).toBeInstanceOf(Set);
      expect(item).toBe(key);
    });

    expect(values).toEqual(['a', 'b', 'c']);

    expect(set.delete('b')).toBe(true);
    expect(set.has('b')).toBe(false);

    set.clear();
    expect(set.size).toBe(0);
    expect(set.isEmpty).toBe(true);
  });

  test('#05 => iterates as an iterable and exposes string tags', () => {
    const set = createBetterSet<number>();
    set.add(10, 20);

    expect([...set]).toEqual([10, 20]);
    expect(set[Symbol.toStringTag]).toBe('BetterSet');
    expect(Object.prototype.toString.call(set)).toBe('[object BetterSet]');
    expect(set.toString).toContain('BetterSet [');
    expect(set.toLocaleString).toBe(set.toString);
  });

  test('#06 => performs union, intersection, difference, and symmetricDifference', () => {
    const a = createBetterSet<number>();
    const b = createBetterSet<number>();

    a.add(1, 2, 3);
    b.add(3, 4, 5);

    const equals = (a: number, b: number) => a === b;

    const union = a.union(b, equals);
    const intersection = a.intersection(b, equals);
    const difference = a.difference(b, equals);
    const symmetric = a.symmetricDifference(b, equals);

    expect(union.toArray).toEqual([1, 2, 3, 4, 5]);
    expect(intersection.toArray).toEqual([3]);
    expect(difference.toArray).toEqual([1, 2]);
    expect(symmetric.toArray).toEqual([1, 2, 4, 5]);
  });

  test('#07 => evaluates subset, superset, and disjoint relationships', () => {
    const parent = createBetterSet<number>();
    const subset = createBetterSet<number>();
    const disjoint = createBetterSet<number>();

    parent.add(1, 2, 3);
    subset.add(1, 2);
    disjoint.add(4, 5);

    expect(subset.isSubsetOf(parent)).toBe(true);
    expect(parent.isSupersetOf(subset)).toBe(true);
    expect(parent.isDisjointFrom(disjoint)).toBe(true);
    expect(subset.isDisjointFrom(disjoint)).toBe(true);
    expect(parent.isSubsetOf(subset)).toBe(false);
  });
});
