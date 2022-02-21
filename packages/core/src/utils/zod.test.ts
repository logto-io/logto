import { string, boolean, number, object } from 'zod';

import RequestError from '@/errors/RequestError';

import { zodTypeToSwagger } from './zod';

describe('zodTypeToSwagger', () => {
  it('string type', () => {
    expect(zodTypeToSwagger(string())).toEqual({ type: 'string' });
  });

  it('boolean type', () => {
    expect(zodTypeToSwagger(boolean())).toEqual({ type: 'boolean' });
  });

  it('number type', () => {
    expect(zodTypeToSwagger(number())).toEqual({ type: 'number' });
  });

  it('array type', () => {
    expect(zodTypeToSwagger(string().array())).toEqual({
      type: 'array',
      items: {
        type: 'string',
      },
    });
  });

  it('object type', () => {
    expect(zodTypeToSwagger(object({ x: string(), y: number().optional() }))).toEqual({
      type: 'object',
      properties: {
        x: {
          type: 'string',
        },
        y: {
          type: 'number',
        },
      },
      required: ['x'],
    });
  });

  it('optional type', () => {
    expect(zodTypeToSwagger(string().optional())).toEqual({ type: 'string' });
  });

  it('unknow type', () => {
    expect(() => zodTypeToSwagger('test')).toMatchError(
      new RequestError('swagger.invalid_zod_type', 'test')
    );
  });
});
