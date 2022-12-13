/**
 * There's an issue for `"moduleResolution": "nodenext"`, thus we need to copy type definitions to here.
 * See: https://github.com/microsoft/TypeScript/issues/47848 https://github.com/microsoft/TypeScript/issues/49189
 */

declare module 'openapi-schema-validator' {
  import type { ErrorObject } from 'ajv';
  import type { IJsonSchema, OpenAPI } from 'openapi-types';

  export interface IOpenAPISchemaValidator {
    /**
     * Validate the provided OpenAPI doc against this validator's schema version and
     * return the results.
     */
    validate(document: OpenAPI.Document): OpenAPISchemaValidatorResult;
  }
  export interface OpenAPISchemaValidatorArgs {
    version: number | string;
    extensions?: IJsonSchema;
  }
  export interface OpenAPISchemaValidatorResult {
    errors: ErrorObject[];
  }
  class OpenAPISchemaValidator implements IOpenAPISchemaValidator {
    private readonly validator;
    constructor(args: OpenAPISchemaValidatorArgs);
    validate(openapiDocument: OpenAPI.Document): OpenAPISchemaValidatorResult;
  }

  // eslint-disable-next-line import/no-anonymous-default-export
  export default { default: OpenAPISchemaValidator };
}
