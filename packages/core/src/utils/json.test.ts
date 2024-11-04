import { safeParseUnknownJson } from './json.js';

describe('json utils test', () => {
  it('should parse unknown json object properly', () => {
    const unknownJson: Record<string, unknown> = {
      text: 'hello',
      null: null,
      number: 123,
      boolean: true,
      empty: undefined,
      array: [1, 2, 3],
      object: {
        key: 'value',
        number: 123,
        array: [1, 2, 3],
        empty: undefined,
      },
    };

    const result = safeParseUnknownJson(unknownJson);

    expect(result).toEqual({
      text: 'hello',
      number: 123,
      boolean: true,
      null: null,
      array: [1, 2, 3],
      object: {
        key: 'value',
        number: 123,
        array: [1, 2, 3],
      },
    });
  });
});
