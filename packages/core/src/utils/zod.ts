import { arbitraryObjectGuard } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { OpenAPIV3 } from 'openapi-types';
import {
  ZodArray,
  ZodBoolean,
  ZodLiteral,
  ZodNativeEnum,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodString,
  ZodType,
  ZodUnion,
  ZodUnknown,
} from 'zod';

import RequestError from '@/errors/RequestError';

const zodLiteralToSwagger = (zodLiteral: ZodLiteral<unknown>): OpenAPIV3.SchemaObject => {
  const { value } = zodLiteral;

  switch (typeof value) {
    case 'boolean':
      return {
        type: 'boolean',
        format: String(value),
      };
    case 'bigint':
    case 'number':
      return {
        type: 'number',
        format: String(value),
      };
    case 'string':
      return {
        type: 'string',
        format: `"${value}"`,
      };
    default:
      throw new RequestError('swagger.invalid_zod_type', zodLiteral);
  }
};

export const zodTypeToSwagger = (config: unknown): OpenAPIV3.SchemaObject => {
  if (config === arbitraryObjectGuard) {
    return {
      type: 'object',
      description: 'arbitrary',
    };
  }

  if (config instanceof ZodOptional) {
    return zodTypeToSwagger(config._def.innerType);
  }

  if (config instanceof ZodNullable) {
    return {
      nullable: true,
      ...zodTypeToSwagger(config._def.innerType),
    };
  }

  if (config instanceof ZodNativeEnum) {
    return {
      type: 'string',
      enum: Object.values(config.enum),
    };
  }

  if (config instanceof ZodLiteral) {
    return zodLiteralToSwagger(config);
  }

  if (config instanceof ZodUnknown) {
    return { example: {} }; // Any data type
  }

  if (config instanceof ZodUnion) {
    return {
      oneOf: (config.options as ZodType[]).map((option) => zodTypeToSwagger(option)),
    };
  }

  if (config instanceof ZodObject) {
    const entries = Object.entries(config.shape);
    const required = entries
      .filter(([, value]) => !(value instanceof ZodOptional))
      .map(([key]) => key);

    return {
      type: 'object',
      required: conditional(required.length > 0 && required),
      properties: Object.fromEntries(entries.map(([key, value]) => [key, zodTypeToSwagger(value)])),
    };
  }

  if (config instanceof ZodArray) {
    return {
      type: 'array',
      items: zodTypeToSwagger(config._def.type),
    };
  }

  if (config instanceof ZodString) {
    return {
      type: 'string',
    };
  }

  if (config instanceof ZodNumber) {
    return {
      type: 'number',
    };
  }

  if (config instanceof ZodBoolean) {
    return {
      type: 'boolean',
    };
  }

  throw new RequestError('swagger.invalid_zod_type', config);
};
