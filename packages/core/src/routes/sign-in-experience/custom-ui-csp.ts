import {
  CustomUiCspSourceValidationErrorCode,
  normalizeCustomUiCsp as normalizeCustomUiCspConfig,
  type CustomUiCsp,
  type CustomUiCspSourceValidationError,
} from '@logto/core-kit';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

const customUiCspSourceValidationErrorCodeDescriptions = Object.freeze({
  [CustomUiCspSourceValidationErrorCode.EmptySource]: 'Empty source',
  [CustomUiCspSourceValidationErrorCode.SemicolonNotAllowed]: 'Semicolons are not allowed',
  [CustomUiCspSourceValidationErrorCode.CspKeywordNotSupported]: 'CSP keywords are not supported',
  [CustomUiCspSourceValidationErrorCode.MalformedUrl]: 'Malformed URL',
  [CustomUiCspSourceValidationErrorCode.DisallowedUrlParts]:
    'Credentials, query strings, and fragments are not allowed',
  [CustomUiCspSourceValidationErrorCode.UnsupportedScheme]: 'Unsupported scheme',
  [CustomUiCspSourceValidationErrorCode.MalformedWildcardHost]: 'Malformed wildcard host',
  [CustomUiCspSourceValidationErrorCode.MalformedHost]: 'Malformed host',
} satisfies Record<CustomUiCspSourceValidationErrorCode, string>);

const createInvalidSourceError = ({
  directive,
  source,
  code: validationErrorCode,
}: CustomUiCspSourceValidationError) =>
  new RequestError(
    {
      code: 'request.invalid_input',
      details: `Invalid customUiCsp.${directive} source "${source}": ${customUiCspSourceValidationErrorCodeDescriptions[validationErrorCode]}`,
    },
    { directive, source, validationErrorCode }
  );

export const normalizeCustomUiCsp = (customUiCsp: CustomUiCsp): CustomUiCsp => {
  const { customUiCsp: normalizedCustomUiCsp, errors } = normalizeCustomUiCspConfig(customUiCsp, {
    isProduction: EnvSet.values.isProduction,
  });

  const [firstError] = errors;

  if (firstError) {
    throw createInvalidSourceError(firstError);
  }

  return normalizedCustomUiCsp;
};

export { hasCustomUiCspSources } from '@logto/core-kit';
