/**
 * @file The `x-logto-dev-feature` marker and the pruning of the document parts it marks. Everything
 * marked is hidden when dev features are disabled, so in-development API surfaces stay out of the
 * public OpenAPI output; the marker itself never reaches a served document.
 */
import { isObject } from '@silverhand/essentials';

import { EnvSet } from '#src/env-set/index.js';

/**
 * The OpenAPI schema extension that hides a schema property, query parameter, or response header
 * when dev features are disabled.
 */
export const devFeatureSchemaExtension = 'x-logto-dev-feature';

const isRecord = (value: unknown): value is Record<string, unknown> => isObject(value);

/**
 * **CAUTION**: This function mutates the input value.
 *
 * Recursively prune query parameters marked with `x-logto-dev-feature`: when dev features are
 * disabled, the parameters are removed; when enabled, only the internal marker is removed.
 *
 * Run this before {@link removeDevFeatureSchemaProperties}, which strips the marker from every
 * record unconditionally.
 */
export const removeDevFeatureParameters = (value: unknown) => {
  if (!isRecord(value)) {
    return;
  }

  const { parameters } = value;

  if (Array.isArray(parameters)) {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Pruning the supplement document is intentionally in-place.
    value.parameters = parameters.filter((parameter) => {
      if (!isRecord(parameter) || !isRecord(parameter.schema)) {
        return true;
      }

      const isDevFeature = parameter.schema[devFeatureSchemaExtension] === true;

      if (isDevFeature && EnvSet.values.isDevFeaturesEnabled) {
        Reflect.deleteProperty(parameter.schema, devFeatureSchemaExtension);
      }

      return EnvSet.values.isDevFeaturesEnabled || !isDevFeature;
    });
  }

  for (const item of Object.values(value).flat()) {
    removeDevFeatureParameters(item);
  }
};

const removeRequiredProperty = (
  schema: Record<string, unknown>,
  required: unknown,
  propertyName: string
) => {
  if (!Array.isArray(required)) {
    return;
  }

  const nextRequired = required.filter((item) => item !== propertyName);

  if (nextRequired.length === 0) {
    Reflect.deleteProperty(schema, 'required');

    return;
  }

  // eslint-disable-next-line @silverhand/fp/no-mutation -- Pruning the supplement document is intentionally in-place.
  schema.required = nextRequired;
};

const removeDevFeatureSchemaProperty = (
  schema: Record<string, unknown>,
  properties: Record<string, unknown>,
  propertyName: string,
  propertySchema: unknown
) => {
  const isMarked = isRecord(propertySchema) && propertySchema[devFeatureSchemaExtension] === true;

  if (!isMarked) {
    return false;
  }

  if (!EnvSet.values.isDevFeaturesEnabled) {
    Reflect.deleteProperty(properties, propertyName);
    removeRequiredProperty(schema, schema.required, propertyName);

    return true;
  }

  if (isRecord(propertySchema)) {
    Reflect.deleteProperty(propertySchema, devFeatureSchemaExtension);
  }

  return false;
};

/**
 * **CAUTION**: This function mutates the input value.
 *
 * Recursively prune dev-feature schema properties: when dev features are disabled, properties
 * marked with `x-logto-dev-feature` are removed (including their `required` entries); when
 * enabled, only the internal marker is removed.
 *
 * Run this on the assembled document — the base schema properties generated from the env-free
 * zod guards carry no markers, so pruning supplements alone cannot remove them.
 */
export const removeDevFeatureSchemaProperties = (value: unknown) => {
  if (Array.isArray(value)) {
    for (const item of value) {
      removeDevFeatureSchemaProperties(item);
    }

    return;
  }

  if (!isRecord(value)) {
    return;
  }

  const schema = value;
  const { properties } = schema;

  if (isRecord(properties)) {
    for (const [propertyName, propertySchema] of Object.entries(properties)) {
      if (removeDevFeatureSchemaProperty(schema, properties, propertyName, propertySchema)) {
        continue;
      }
    }
  }

  Reflect.deleteProperty(schema, devFeatureSchemaExtension);

  for (const item of Object.values(schema)) {
    removeDevFeatureSchemaProperties(item);
  }
};

/**
 * **CAUTION**: This function mutates the input value.
 *
 * Recursively prune response headers marked with `x-logto-dev-feature`: when dev features are
 * disabled, the headers are removed; when enabled, only the internal marker is removed.
 *
 * Run this before {@link removeDevFeatureSchemaProperties}, which strips the marker from every
 * record unconditionally.
 */
export const removeDevFeatureResponseHeaders = (value: unknown) => {
  if (!isRecord(value)) {
    return;
  }

  const { responses } = value;

  if (isRecord(responses)) {
    for (const response of Object.values(responses)) {
      if (!isRecord(response) || !isRecord(response.headers)) {
        continue;
      }

      const { headers } = response;

      for (const [name, header] of Object.entries(headers)) {
        if (!isRecord(header) || header[devFeatureSchemaExtension] !== true) {
          continue;
        }

        if (EnvSet.values.isDevFeaturesEnabled) {
          Reflect.deleteProperty(header, devFeatureSchemaExtension);
        } else {
          Reflect.deleteProperty(headers, name);
        }
      }
    }
  }

  for (const item of Object.values(value).flat()) {
    removeDevFeatureResponseHeaders(item);
  }
};
