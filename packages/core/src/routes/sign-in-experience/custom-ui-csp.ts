import { type CustomUiCsp } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';

const customUiCspDirectives = Object.freeze(['scriptSrc', 'connectSrc'] as const);

type CustomUiCspDirective = (typeof customUiCspDirectives)[number];

const validHostLabelRegEx = /^[\da-z](?:[\da-z-]{0,61}[\da-z])?$/;

const createInvalidSourceError = (
  directive: CustomUiCspDirective,
  source: string,
  reason: string
) =>
  new RequestError(
    {
      code: 'request.invalid_input',
      details: `Invalid customUiCsp.${directive} source "${source}": ${reason}`,
    },
    { directive, source, reason }
  );

const isValidHostLabel = (label: string) => validHostLabelRegEx.test(label);

const validateHostname = (directive: CustomUiCspDirective, source: string, hostname: string) => {
  if (hostname === 'localhost') {
    return;
  }

  const labels = hostname.split('.');
  const wildcardCount = labels.filter((label) => label === '*').length;

  if (wildcardCount > 0) {
    if (labels[0] !== '*' || wildcardCount !== 1 || labels.length < 3) {
      throw createInvalidSourceError(directive, source, 'Malformed wildcard host');
    }

    for (const label of labels.slice(1)) {
      if (!isValidHostLabel(label)) {
        throw createInvalidSourceError(directive, source, 'Malformed wildcard host');
      }
    }

    return;
  }

  if (labels.length < 2 || labels.some((label) => !isValidHostLabel(label))) {
    throw createInvalidSourceError(directive, source, 'Malformed host');
  }
};

const validateScheme = (directive: CustomUiCspDirective, source: string, url: URL) => {
  const isLocalhostHttpSource =
    !EnvSet.values.isProduction &&
    url.protocol === 'http:' &&
    url.hostname === 'localhost' &&
    url.port;

  if (isLocalhostHttpSource) {
    return;
  }

  const allowedSchemes = directive === 'connectSrc' ? ['https:', 'wss:'] : ['https:'];

  if (!allowedSchemes.includes(url.protocol)) {
    throw createInvalidSourceError(directive, source, 'Unsupported scheme');
  }
};

const normalizeSourceExpression = (directive: CustomUiCspDirective, rawSource: string) => {
  const source = rawSource.trim();

  if (!source) {
    throw createInvalidSourceError(directive, rawSource, 'Empty source');
  }

  if (source.includes(';')) {
    throw createInvalidSourceError(directive, rawSource, 'Semicolons are not allowed');
  }

  if (source.includes("'")) {
    throw createInvalidSourceError(directive, rawSource, 'CSP keywords are not supported');
  }

  try {
    const url = new URL(source);

    if (url.username || url.password || url.search || url.hash) {
      throw createInvalidSourceError(
        directive,
        rawSource,
        'Credentials, query strings, and fragments are not allowed'
      );
    }

    validateScheme(directive, rawSource, url);
    validateHostname(directive, rawSource, url.hostname);

    return `${url.protocol}//${url.host}${url.pathname === '/' ? '' : url.pathname}`;
  } catch (error: unknown) {
    if (error instanceof RequestError) {
      throw error;
    }

    throw createInvalidSourceError(directive, rawSource, 'Malformed URL');
  }
};

export const normalizeCustomUiCsp = (customUiCsp: CustomUiCsp): CustomUiCsp =>
  customUiCspDirectives.reduce<CustomUiCsp>((normalizedCustomUiCsp, directive) => {
    const sources = customUiCsp[directive];

    if (!sources?.length) {
      return normalizedCustomUiCsp;
    }

    const normalizedSources = [
      ...new Set(sources.map((source) => normalizeSourceExpression(directive, source))),
    ];

    return {
      ...normalizedCustomUiCsp,
      [directive]: normalizedSources,
    };
  }, {});

export const hasCustomUiCspSources = (customUiCsp?: CustomUiCsp): boolean =>
  Boolean(customUiCsp && customUiCspDirectives.some((directive) => customUiCsp[directive]?.length));
