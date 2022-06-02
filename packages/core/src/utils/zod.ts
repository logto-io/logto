import { arbitraryObjectGuard } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { OpenAPIV3 } from 'openapi-types';
import {
  ZodArray,
  ZodBoolean,
  ZodNativeEnum,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodString,
  ZodUnknown,
} from 'zod';

import RequestError from '@/errors/RequestError';

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

  if (config instanceof ZodUnknown) {
    return {};
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
