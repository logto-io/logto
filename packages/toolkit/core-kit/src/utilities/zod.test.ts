import { number, ZodError } from 'zod';

import { fallback } from './zod.js';

describe('fallback', () => {
  it('should fallback to default value', () => {
    const schema = number();
    const tolerant = schema.or(fallback(-1));

    expect(() => schema.parse('foo')).toThrow(ZodError);
    expect(tolerant.parse('foo')).toBe(-1);
  });
});
