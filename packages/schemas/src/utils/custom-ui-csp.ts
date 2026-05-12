import type { CustomUiCsp } from '../foundations/jsonb-types/sign-in-experience.js';

export const customUiCspDirectives = Object.freeze(['scriptSrc', 'connectSrc'] as const);

export type CustomUiCspDirective = (typeof customUiCspDirectives)[number];

export type CustomUiCspSourceValidationErrorReason =
  | 'Empty source'
  | 'Semicolons are not allowed'
  | 'CSP keywords are not supported'
  | 'Malformed URL'
  | 'Credentials, query strings, and fragments are not allowed'
  | 'Unsupported scheme'
  | 'Malformed wildcard host'
  | 'Malformed host';

export type CustomUiCspSourceValidationError = {
  readonly directive: CustomUiCspDirective;
  readonly source: string;
  readonly reason: CustomUiCspSourceValidationErrorReason;
};

export type CustomUiCspSourceValidationResult =
  | {
      readonly isValid: true;
      readonly value: string;
    }
  | {
      readonly isValid: false;
      readonly reason: CustomUiCspSourceValidationErrorReason;
    };

type CustomUiCspValidationOptions = {
  readonly isProduction?: boolean;
};

type NormalizedDirectiveSources = {
  readonly sources: string[];
  readonly errors: CustomUiCspSourceValidationError[];
};

export type NormalizeCustomUiCspResult = {
  readonly customUiCsp: CustomUiCsp;
  readonly errors: CustomUiCspSourceValidationError[];
};

const validHostLabelRegEx = /^[\da-z](?:[\da-z-]{0,61}[\da-z])?$/;

const isValidHostLabel = (label: string) => validHostLabelRegEx.test(label);

const validateHostname = (hostname: string): CustomUiCspSourceValidationErrorReason | undefined => {
  if (hostname === 'localhost') {
    return;
  }

  const labels = hostname.split('.');
  const wildcardCount = labels.filter((label) => label === '*').length;

  if (wildcardCount > 0) {
    return labels[0] === '*' &&
      wildcardCount === 1 &&
      labels.length >= 3 &&
      labels.slice(1).every((label) => isValidHostLabel(label))
      ? undefined
      : 'Malformed wildcard host';
  }

  return labels.length >= 2 && labels.every((label) => isValidHostLabel(label))
    ? undefined
    : 'Malformed host';
};

const validateScheme = (
  directive: CustomUiCspDirective,
  url: URL,
  { isProduction = false }: CustomUiCspValidationOptions
): CustomUiCspSourceValidationErrorReason | undefined => {
  const isLocalhostHttpSource =
    !isProduction && url.protocol === 'http:' && url.hostname === 'localhost' && url.port;

  if (isLocalhostHttpSource) {
    return;
  }

  const allowedSchemes = directive === 'connectSrc' ? ['https:', 'wss:'] : ['https:'];

  return allowedSchemes.includes(url.protocol) ? undefined : 'Unsupported scheme';
};

const getInvalidPlainSourceReason = (
  source: string
): CustomUiCspSourceValidationErrorReason | undefined => {
  if (!source) {
    return 'Empty source';
  }

  if (source.includes(';')) {
    return 'Semicolons are not allowed';
  }

  return source.includes("'") ? 'CSP keywords are not supported' : undefined;
};

const hasDisallowedUrlParts = (url: URL) =>
  Boolean(url.username || url.password || url.search || url.hash);

const normalizeParsedSourceExpression = (
  directive: CustomUiCspDirective,
  url: URL,
  options?: CustomUiCspValidationOptions
): CustomUiCspSourceValidationResult => {
  if (hasDisallowedUrlParts(url)) {
    return {
      isValid: false,
      reason: 'Credentials, query strings, and fragments are not allowed',
    };
  }

  const invalidSchemeReason = validateScheme(directive, url, options ?? {});

  if (invalidSchemeReason) {
    return { isValid: false, reason: invalidSchemeReason };
  }

  const invalidHostReason = validateHostname(url.hostname);

  if (invalidHostReason) {
    return { isValid: false, reason: invalidHostReason };
  }

  return {
    isValid: true,
    value: `${url.protocol}//${url.host}${url.pathname === '/' ? '' : url.pathname}`,
  };
};

export const normalizeCustomUiCspSourceExpression = (
  directive: CustomUiCspDirective,
  rawSource: string,
  options?: CustomUiCspValidationOptions
): CustomUiCspSourceValidationResult => {
  const source = rawSource.trim();
  const invalidSourceReason = getInvalidPlainSourceReason(source);

  if (invalidSourceReason) {
    return { isValid: false, reason: invalidSourceReason };
  }

  try {
    return normalizeParsedSourceExpression(directive, new URL(source), options);
  } catch {
    return { isValid: false, reason: 'Malformed URL' };
  }
};

const normalizeDirectiveSources = (
  directive: CustomUiCspDirective,
  sources: string[],
  options?: CustomUiCspValidationOptions
): NormalizedDirectiveSources =>
  sources.reduce<NormalizedDirectiveSources>(
    ({ sources, errors }, source) => {
      const result = normalizeCustomUiCspSourceExpression(directive, source, options);

      if (!result.isValid) {
        return {
          sources,
          errors: [
            ...errors,
            {
              directive,
              source,
              reason: result.reason,
            },
          ],
        };
      }

      return {
        sources: sources.includes(result.value) ? sources : [...sources, result.value],
        errors,
      };
    },
    { sources: [], errors: [] }
  );

export const normalizeCustomUiCsp = (
  customUiCsp: CustomUiCsp,
  options?: CustomUiCspValidationOptions
): NormalizeCustomUiCspResult =>
  customUiCspDirectives.reduce<NormalizeCustomUiCspResult>(
    ({ customUiCsp: normalizedCustomUiCsp, errors }, directive) => {
      const sources = customUiCsp[directive];

      if (!sources?.length) {
        return { customUiCsp: normalizedCustomUiCsp, errors };
      }

      const result = normalizeDirectiveSources(directive, sources, options);

      return {
        customUiCsp:
          result.sources.length > 0
            ? {
                ...normalizedCustomUiCsp,
                [directive]: result.sources,
              }
            : normalizedCustomUiCsp,
        errors: [...errors, ...result.errors],
      };
    },
    { customUiCsp: {}, errors: [] }
  );

export const hasCustomUiCspSources = (customUiCsp?: CustomUiCsp): boolean =>
  Boolean(customUiCsp && customUiCspDirectives.some((directive) => customUiCsp[directive]?.length));
