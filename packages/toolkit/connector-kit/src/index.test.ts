import { z } from 'zod';

import { parseJson, parseJsonObject, validateConfig } from './index.js';

describe('connector-kit', () => {
  describe('validateConfig', () => {
    it('valid config', () => {
      const testingTypeGuard = z.unknown();
      type TestingType = z.infer<typeof testingTypeGuard>;
      const testingConfig = { foo: 'foo', bar: 1, baz: true };
      expect(() => {
        validateConfig(testingConfig, testingTypeGuard);
      }).not.toThrow();
    });

    it('invalid config', () => {
      const testingTypeGuard = z.record(z.string());
      type TestingType = z.infer<typeof testingTypeGuard>;
      const testingConfig = { foo: 'foo', bar: 1 };
      expect(() => {
        validateConfig(testingConfig, testingTypeGuard);
      }).toThrow();
    });
  });

  describe('parseJson', () => {
    it('should return parsed result', () => {
      const literalContent = 'foo';
      expect(parseJson(JSON.stringify(literalContent))).toEqual(literalContent);

      const objectContent = { foo: 'foo', bar: 1, baz: true, qux: [1, '2', null] };
      expect(parseJson(JSON.stringify(objectContent))).toEqual(objectContent);
    });

    it('throw error when parsing invalid Json string', () => {
      expect(() => parseJson('[1,2,3,"4",]')).toThrow();
    });
  });

  describe('parseJsonObject', () => {
    it('should return parsed object', () => {
      const objectContent = { foo: 'foo', bar: 1, baz: true, qux: [1, '2', null] };
      expect(parseJsonObject(JSON.stringify(objectContent))).toEqual(objectContent);
    });

    it('throw error when parsing non-object result', () => {
      expect(() => parseJsonObject(JSON.stringify('foo'))).toThrow();
    });
  });
});
