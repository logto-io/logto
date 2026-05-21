import { z } from 'zod';

export const customUiCspDirectives = Object.freeze(['scriptSrc', 'connectSrc'] as const);

export type CustomUiCspDirective = (typeof customUiCspDirectives)[number];

export type CustomUiCsp = {
  scriptSrc?: string[];
  connectSrc?: string[];
};

export const customUiCspGuard = z
  .object({
    scriptSrc: z.string().array().optional(),
    connectSrc: z.string().array().optional(),
  })
  .strict() satisfies z.ZodType<CustomUiCsp>;

export enum CustomUiCspSourceValidationErrorCode {
  EmptySource = 'empty_source',
  SemicolonNotAllowed = 'semicolon_not_allowed',
  CspKeywordNotSupported = 'csp_keyword_not_supported',
  MalformedUrl = 'malformed_url',
  DisallowedUrlParts = 'disallowed_url_parts',
  UnsupportedScheme = 'unsupported_scheme',
  MalformedWildcardHost = 'malformed_wildcard_host',
  MalformedHost = 'malformed_host',
}

export type CustomUiCspSourceValidationError = {
  readonly directive: CustomUiCspDirective;
  readonly source: string;
  readonly code: CustomUiCspSourceValidationErrorCode;
};

export type CustomUiCspSourceValidationResult =
  | {
      readonly isValid: true;
      readonly value: string;
    }
  | {
      readonly isValid: false;
      readonly code: CustomUiCspSourceValidationErrorCode;
    };

type CustomUiCspValidationOptions = {
  readonly isProduction?: boolean;
};

type NormalizedDirectiveSources = {
  readonly sources: string[];
  readonly errors: CustomUiCspSourceValidationError[];
};

type SourceNormalizationResult = {
  readonly source: string;
  readonly result: CustomUiCspSourceValidationResult;
};

export type NormalizeCustomUiCspResult = {
  readonly customUiCsp: CustomUiCsp;
  readonly errors: CustomUiCspSourceValidationError[];
};

const validHostLabelRegEx = /^[\da-z](?:[\da-z-]{0,61}[\da-z])?$/;

const isValidHostLabel = (label: string) => validHostLabelRegEx.test(label);

const validateHostname = (hostname: string): CustomUiCspSourceValidationErrorCode | undefined => {
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
      : CustomUiCspSourceValidationErrorCode.MalformedWildcardHost;
  }

  return labels.length >= 2 && labels.every((label) => isValidHostLabel(label))
    ? undefined
    : CustomUiCspSourceValidationErrorCode.MalformedHost;
};

const validateScheme = (
  directive: CustomUiCspDirective,
  url: URL,
  { isProduction = false }: CustomUiCspValidationOptions
): CustomUiCspSourceValidationErrorCode | undefined => {
  const isLocalhostHttpSource =
    !isProduction && url.protocol === 'http:' && url.hostname === 'localhost' && url.port;

  if (isLocalhostHttpSource) {
    return;
  }

  const allowedSchemes = directive === 'connectSrc' ? ['https:', 'wss:'] : ['https:'];

  return allowedSchemes.includes(url.protocol)
    ? undefined
    : CustomUiCspSourceValidationErrorCode.UnsupportedScheme;
};

const getInvalidPlainSourceCode = (
  source: string
): CustomUiCspSourceValidationErrorCode | undefined => {
  if (!source) {
    return CustomUiCspSourceValidationErrorCode.EmptySource;
  }

  if (source.includes(';')) {
    return CustomUiCspSourceValidationErrorCode.SemicolonNotAllowed;
  }

  return source.includes("'")
    ? CustomUiCspSourceValidationErrorCode.CspKeywordNotSupported
    : undefined;
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
      code: CustomUiCspSourceValidationErrorCode.DisallowedUrlParts,
    };
  }

  const invalidSchemeCode = validateScheme(directive, url, options ?? {});

  if (invalidSchemeCode) {
    return { isValid: false, code: invalidSchemeCode };
  }

  const invalidHostCode = validateHostname(url.hostname);

  if (invalidHostCode) {
    return { isValid: false, code: invalidHostCode };
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
  const invalidSourceCode = getInvalidPlainSourceCode(source);

  if (invalidSourceCode) {
    return { isValid: false, code: invalidSourceCode };
  }

  try {
    return normalizeParsedSourceExpression(directive, new URL(source), options);
  } catch {
    return { isValid: false, code: CustomUiCspSourceValidationErrorCode.MalformedUrl };
  }
};

const normalizeDirectiveSources = (
  directive: CustomUiCspDirective,
  sources: string[],
  options?: CustomUiCspValidationOptions
): NormalizedDirectiveSources => {
  const results = sources.map<SourceNormalizationResult>((source) => ({
    source,
    result: normalizeCustomUiCspSourceExpression(directive, source, options),
  }));

  return {
    sources: [...new Set(results.flatMap(({ result }) => (result.isValid ? [result.value] : [])))],
    errors: results.flatMap(({ source, result }) =>
      result.isValid ? [] : [{ directive, source, code: result.code }]
    ),
  };
};

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
