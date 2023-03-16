import { TtlCache } from './ttl-cache.js';

const { jest } = import.meta;

describe('TtlCache', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return cached value after a long time if ttl is not set', () => {
    jest.setSystemTime(0);

    const cache = new TtlCache();
    const someObject = Object.freeze({ foo: 'bar', baz: 123 });

    cache.set('foo', someObject);

    jest.setSystemTime(100_000_000);
    expect(cache.get('foo')).toBe(someObject);
    expect(cache.has('foo')).toBe(true);
  });

  it('should return cached value and honor ttl', () => {
    jest.setSystemTime(0);

    const cache = new TtlCache(100);
    const someObject = Object.freeze({ foo: 'bar', baz: 123 });

    cache.set(123, someObject);
    cache.set('foo', someObject, 99);

    jest.setSystemTime(100);
    expect(cache.get(123)).toBe(someObject);
    expect(cache.has(123)).toBe(true);
    expect(cache.get('123')).toBe(undefined);
    expect(cache.has('123')).toBe(false);
    expect(cache.get('foo')).toBe(undefined);
    expect(cache.has('foo')).toBe(false);

    jest.setSystemTime(101);
    expect(cache.get(123)).toBe(undefined);
    expect(cache.has(123)).toBe(false);
  });

  it('should be able to delete value before ttl', () => {
    const cache = new TtlCache(100);
    const someObject = Object.freeze({ foo: 'bar', baz: 123 });

    cache.set('foo', someObject);
    cache.delete('foo');
    cache.delete('bar');

    expect(cache.get('foo')).toBe(undefined);
    expect(cache.has('foo')).toBe(false);
  });

  it('should be able to clear all values', () => {
    const cache = new TtlCache(100);
    const someObject = Object.freeze({ foo: 'bar', baz: 123 });

    cache.set('foo', someObject);
    cache.set('bar', someObject);
    cache.set(123, 456);
    cache.clear();

    expect(cache.get('foo')).toBe(undefined);
    expect(cache.has('foo')).toBe(false);
    expect(cache.get('bar')).toBe(undefined);
    expect(cache.has('bar')).toBe(false);
    expect(cache.get(123)).toBe(undefined);
    expect(cache.has(123)).toBe(false);
  });

  it('should throw undefined when value is undefined', () => {
    const cache = new TtlCache();
    expect(() => {
      cache.set(1, undefined);
    }).toThrow(TypeError);
  });
});
