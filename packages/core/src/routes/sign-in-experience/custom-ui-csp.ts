import {
  normalizeCustomUiCsp as normalizeCustomUiCspConfig,
  type CustomUiCsp,
  type CustomUiCspSourceValidationError,
} from '@logto/core-kit';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

const createInvalidSourceError = ({
  directive,
  source,
  code: validationErrorCode,
}: CustomUiCspSourceValidationError) =>
  new RequestError(
    {
      code: 'request.invalid_input',
      details: `Invalid customUiCsp.${directive} source "${source}": ${validationErrorCode}`,
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
