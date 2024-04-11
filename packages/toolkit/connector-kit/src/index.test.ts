import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import {
  parseJson,
  parseJsonObject,
  replaceSendMessageHandlebars,
  validateConfig,
} from './index.js';

describe('validateConfig', () => {
  it('valid config', () => {
    const testingTypeGuard = z.unknown();
    const testingConfig = { foo: 'foo', bar: 1, baz: true };
    expect(() => {
      validateConfig(testingConfig, testingTypeGuard);
    }).not.toThrow();
  });

  it('invalid config', () => {
    const testingTypeGuard = z.record(z.string());
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

describe('replaceSendMessageHandlebars', () => {
  it('should replace handlebars with payload', () => {
    const template = 'Your verification code is {{code}}';
    const payload = { code: '123456' };
    expect(replaceSendMessageHandlebars(template, payload)).toEqual(
      'Your verification code is 123456'
    );
  });

  it('should not replace handlebars if payload does not contain the key', () => {
    const template = 'Your verification code is {{code}}';
    const payload = {};
    expect(replaceSendMessageHandlebars(template, payload)).toEqual(
      'Your verification code is {{code}}'
    );
  });

  it('should replace all handlebars even they are not in the predefined list for payload', () => {
    const template = 'Your verification code is {{code}} and {{foo}}';
    const payload = { code: '123456', foo: 'bar' };
    expect(replaceSendMessageHandlebars(template, payload)).toEqual(
      'Your verification code is 123456 and bar'
    );
  });

  it('should ignore handlebars that are not in the payload', () => {
    const template = 'Your verification code is {{code}} and {{foo}}';
    const payload = { code: '123456' };
    expect(replaceSendMessageHandlebars(template, payload)).toEqual(
      'Your verification code is 123456 and {{foo}}'
    );
  });

  it('should replace handlebars that have extra spaces with payload', () => {
    const template = 'Your verification code is {{     code }}';
    const payload = { code: '123456' };
    expect(replaceSendMessageHandlebars(template, payload)).toEqual(
      'Your verification code is 123456'
    );
  });
});
