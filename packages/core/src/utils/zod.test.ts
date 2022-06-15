import { ApplicationType, arbitraryObjectGuard } from '@logto/schemas';
import { string, boolean, number, object, nativeEnum, unknown, literal, union } from 'zod';

import RequestError from '@/errors/RequestError';

import { zodTypeToSwagger } from './zod';

describe('zodTypeToSwagger', () => {
  it('arbitrary object guard', () => {
    expect(zodTypeToSwagger(arbitraryObjectGuard)).toEqual({
      type: 'object',
      description: 'arbitrary',
    });
  });

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

  it('nullable type', () => {
    expect(zodTypeToSwagger(string().nullable())).toEqual({ type: 'string', nullable: true });
  });

  describe('literal type', () => {
    it('boolean', () => {
      expect(zodTypeToSwagger(literal(true))).toEqual({
        type: 'boolean',
        format: 'true',
      });
      expect(zodTypeToSwagger(literal(false))).toEqual({
        type: 'boolean',
        format: 'false',
      });
    });

    it('number', () => {
      expect(zodTypeToSwagger(literal(-1.25))).toEqual({
        type: 'number',
        format: '-1.25',
      });
      expect(zodTypeToSwagger(literal(999))).toEqual({
        type: 'number',
        format: '999',
      });
      expect(zodTypeToSwagger(literal(BigInt(1_000_000_000)))).toEqual({
        type: 'number',
        format: '1000000000',
      });
    });

    it('string', () => {
      expect(zodTypeToSwagger(literal(''))).toEqual({
        type: 'string',
        format: '""',
      });
      expect(zodTypeToSwagger(literal('nonempty'))).toEqual({
        type: 'string',
        format: '"nonempty"',
      });
    });

    it('unexpected', () => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      const undefinedLiteral = literal(undefined);
      expect(() => zodTypeToSwagger(undefinedLiteral)).toMatchError(
        new RequestError('swagger.invalid_zod_type', undefinedLiteral)
      );
      const nullLiteral = literal(null);
      expect(() => zodTypeToSwagger(nullLiteral)).toMatchError(
        new RequestError('swagger.invalid_zod_type', nullLiteral)
      );
    });
  });

  it('unknown type', () => {
    expect(zodTypeToSwagger(unknown())).toEqual({ example: {} });
  });

  it('union type', () => {
    expect(zodTypeToSwagger(number().or(boolean()))).toEqual({
      oneOf: [{ type: 'number' }, { type: 'boolean' }],
    });
    expect(zodTypeToSwagger(union([literal('Logto'), literal(true)]))).toEqual({
      oneOf: [
        { type: 'string', format: '"Logto"' },
        { type: 'boolean', format: 'true' },
      ],
    });
  });

  it('native enum type', () => {
    expect(zodTypeToSwagger(nativeEnum(ApplicationType))).toEqual({
      type: 'string',
      enum: Object.values(ApplicationType),
    });
  });

  it('unexpected type', () => {
    expect(() => zodTypeToSwagger('test')).toMatchError(
      new RequestError('swagger.invalid_zod_type', 'test')
    );
  });
});
