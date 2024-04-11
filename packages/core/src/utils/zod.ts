import { languages, languageTagGuard } from '@logto/language-kit';
import { jsonObjectGuard, translationGuard } from '@logto/schemas';
import type { ValuesOf } from '@silverhand/essentials';
import { conditional } from '@silverhand/essentials';
import type { OpenAPIV3 } from 'openapi-types';
import {
  ZodDiscriminatedUnion,
  type ZodStringDef,
  ZodRecord,
  ZodArray,
  ZodBoolean,
  ZodEffects,
  ZodEnum,
  ZodLiteral,
  ZodNativeEnum,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodString,
  ZodUnion,
  ZodUnknown,
  ZodDefault,
  ZodIntersection,
} from 'zod';

import RequestError from '#src/errors/RequestError/index.js';

export const translationSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  TranslationObject: {
    type: 'object',
    properties: {
      '[translationKey]': {
        $ref: '#/components/schemas/Translation',
      },
    },
    example: {
      input: {
        username: 'Username',
        password: 'Password',
      },
      action: {
        sign_in: 'Sign In',
        continue: 'Continue',
      },
    },
  },
  Translation: {
    oneOf: [
      {
        type: 'string',
      },
      // {
      //   // This self-reference is OK, but it's not supported by Swagger UI
      //   // See https://github.com/swagger-api/swagger-ui/issues/3325
      //   $ref: '#/components/schemas/TranslationObject',
      // },
    ],
  },
};

export type ZodStringCheck = ValuesOf<ZodStringDef['checks']>;

const zodStringCheckToSwaggerFormat = (zodStringCheck: ZodStringCheck) => {
  const { kind } = zodStringCheck;

  switch (kind) {
    case 'email':
    case 'url':
    case 'uuid':
    case 'cuid':
    case 'regex': {
      return kind;
    }

    case 'min':
    case 'max': {
      // Do nothing here
      return;
    }

    default: {
      throw new RequestError('swagger.invalid_zod_type', zodStringCheck);
    }
  }
};

// https://github.com/colinhacks/zod#strings
const zodStringToSwagger = (zodString: ZodString): OpenAPIV3.SchemaObject => {
  const { checks } = zodString._def;

  const formats = checks
    .map((zodStringCheck) => zodStringCheckToSwaggerFormat(zodStringCheck))
    .filter(Boolean);
  const minLength = checks.find(
    (check): check is { kind: 'min'; value: number } => check.kind === 'min'
  )?.value;
  const maxLength = checks.find(
    (check): check is { kind: 'max'; value: number } => check.kind === 'max'
  )?.value;
  const pattern = checks
    .find((check): check is { kind: 'regex'; regex: RegExp } => check.kind === 'regex')
    ?.regex.toString();

  return {
    type: 'string',
    format: formats.length > 0 ? formats.join(' | ') : undefined,
    minLength,
    maxLength,
    pattern,
  };
};

// https://github.com/colinhacks/zod#literals
const zodLiteralToSwagger = (zodLiteral: ZodLiteral<unknown>): OpenAPIV3.SchemaObject => {
  const { value } = zodLiteral;

  switch (typeof value) {
    case 'boolean': {
      return {
        type: 'boolean',
        format: String(value),
      };
    }

    case 'number': {
      return {
        type: 'number',
        format: String(value),
      };
    }

    case 'string': {
      return {
        type: 'string',
        format: value === '' ? 'empty' : `"${value}"`,
      };
    }

    default: {
      throw new RequestError('swagger.invalid_zod_type', zodLiteral);
    }
  }
};

// Too many zod types :-)
// eslint-disable-next-line complexity
export const zodTypeToSwagger = (
  config: unknown
): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject => {
  if (config === jsonObjectGuard) {
    return {
      type: 'object',
      description: 'arbitrary',
    };
  }

  if (config === translationGuard) {
    return {
      $ref: '#/components/schemas/TranslationObject',
    };
  }

  if (config === languageTagGuard) {
    return {
      type: 'string',
      enum: Object.keys(languages),
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

  if (config instanceof ZodNativeEnum || config instanceof ZodEnum) {
    return {
      type: 'string',
      // Type from Zod is any
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      enum: Object.values(config.enum),
    };
  }

  if (config instanceof ZodLiteral) {
    return zodLiteralToSwagger(config);
  }

  if (config instanceof ZodUnknown) {
    return { example: {} }; // Any data type
  }

  if (config instanceof ZodUnion || config instanceof ZodDiscriminatedUnion) {
    return {
      // ZodUnion.options type is any
      // eslint-disable-next-line no-restricted-syntax
      oneOf: (config.options as unknown[]).map((option) => zodTypeToSwagger(option)),
    };
  }

  if (config instanceof ZodObject) {
    // Type from Zod is any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const entries = Object.entries(config.shape)
      // `tenantId` is not editable for all routes
      .filter(([key]) => key !== 'tenantId');
    const required = entries
      .filter(([, value]) => !(value instanceof ZodOptional))
      .map(([key]) => key);

    return {
      type: 'object',
      required: conditional(required.length > 0 && required),
      properties: Object.fromEntries(entries.map(([key, value]) => [key, zodTypeToSwagger(value)])),
    };
  }

  if (config instanceof ZodRecord) {
    return {
      type: 'object',
      additionalProperties: zodTypeToSwagger(config.valueSchema),
    };
  }

  if (config instanceof ZodArray) {
    return {
      type: 'array',
      items: zodTypeToSwagger(config._def.type),
    };
  }

  if (config instanceof ZodString) {
    return zodStringToSwagger(config);
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

  if (config instanceof ZodRecord) {
    return {
      type: 'object',
      additionalProperties: zodTypeToSwagger(config.valueSchema),
    };
  }

  if (config instanceof ZodEffects) {
    if (config._def.effect.type === 'transform') {
      return zodTypeToSwagger(config._def.schema);
    }

    // TO-DO: Improve swagger output for zod schema with refinement (validate through JS functions)
    if (config._def.effect.type === 'refinement') {
      return {
        type: 'object',
        description: 'Validator function',
      };
    }
  }

  if (config instanceof ZodDefault) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      default: config._def.defaultValue(),
      ...zodTypeToSwagger(config._def.innerType),
    };
  }

  if (config instanceof ZodIntersection) {
    return {
      allOf: [zodTypeToSwagger(config._def.left), zodTypeToSwagger(config._def.right)],
    };
  }

  throw new RequestError('swagger.invalid_zod_type', config);
};
