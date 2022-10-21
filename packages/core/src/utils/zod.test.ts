import { languages, languageTagGuard } from '@logto/language-kit';
import { ApplicationType, arbitraryObjectGuard, translationGuard } from '@logto/schemas';
import { string, boolean, number, object, nativeEnum, unknown, literal, union } from 'zod';

import RequestError from '@/errors/RequestError';

import type { ZodStringCheck } from './zod';
import { zodTypeToSwagger } from './zod';

describe('zodTypeToSwagger', () => {
  it('arbitrary object guard', () => {
    expect(zodTypeToSwagger(arbitraryObjectGuard)).toEqual({
      type: 'object',
      description: 'arbitrary',
    });
  });

  it('translation object guard', () => {
    expect(zodTypeToSwagger(translationGuard)).toEqual({
      $ref: '#/components/schemas/TranslationObject',
    });
  });

  it('language tag guard', () => {
    expect(zodTypeToSwagger(languageTagGuard)).toEqual({
      type: 'string',
      enum: Object.keys(languages),
    });
  });

  describe('string type', () => {
    const notStartingWithDigitRegex = /^\D/;

    it('nonempty check', () => {
      expect(zodTypeToSwagger(string().min(1))).toEqual({
        type: 'string',
        minLength: 1,
      });
    });

    it('min check', () => {
      expect(zodTypeToSwagger(string().min(1))).toEqual({
        type: 'string',
        minLength: 1,
      });
    });

    it('max check', () => {
      expect(zodTypeToSwagger(string().max(6))).toEqual({
        type: 'string',
        maxLength: 6,
      });
    });

    it('regex check', () => {
      expect(zodTypeToSwagger(string().regex(notStartingWithDigitRegex))).toEqual({
        type: 'string',
        format: 'regex',
        pattern: notStartingWithDigitRegex.toString(),
      });
    });

    it('other kinds check', () => {
      expect(zodTypeToSwagger(string().email())).toEqual({
        type: 'string',
        format: 'email',
      });
      expect(zodTypeToSwagger(string().url())).toEqual({
        type: 'string',
        format: 'url',
      });
      expect(zodTypeToSwagger(string().uuid())).toEqual({
        type: 'string',
        format: 'uuid',
      });
      expect(zodTypeToSwagger(string().cuid())).toEqual({
        type: 'string',
        format: 'cuid',
      });
    });

    it('combination check', () => {
      expect(
        zodTypeToSwagger(string().min(1).max(128).email().uuid().regex(notStartingWithDigitRegex))
      ).toEqual({
        type: 'string',
        format: 'email | uuid | regex',
        minLength: 1,
        maxLength: 128,
        pattern: notStartingWithDigitRegex.toString(),
      });
    });

    it('unexpected check', () => {
      const unexpectedCheck = { kind: 'unexpected' };
      expect(() =>
        zodTypeToSwagger(string()._addCheck(unexpectedCheck as ZodStringCheck))
      ).toMatchError(new RequestError('swagger.invalid_zod_type', unexpectedCheck));
    });
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
    });

    it('string', () => {
      expect(zodTypeToSwagger(literal(''))).toEqual({
        type: 'string',
        format: 'empty',
      });
      expect(zodTypeToSwagger(literal('nonempty'))).toEqual({
        type: 'string',
        format: '"nonempty"',
      });
    });

    it('unexpected', () => {
      const bigIntLiteral = literal(BigInt(1_000_000_000));
      expect(() => zodTypeToSwagger(bigIntLiteral)).toMatchError(
        new RequestError('swagger.invalid_zod_type', bigIntLiteral)
      );

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
