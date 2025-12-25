export const uriValidator = (value: string) => {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
  } catch {
    return false;
  }

  return true;
};

/**
 * Checks if the path contains dot segments (.., ., %2e, %2e%2e) that could be used
 * for path traversal attacks.
 */
const hasDotSegmentsInPath = (url: string, schemeSeparatorIndex: number): boolean => {
  const authority = url.slice(schemeSeparatorIndex + 3).split(/[#/?]/)[0] ?? '';
  const afterAuthorityIndex = schemeSeparatorIndex + 3 + authority.length;
  const rest = url.slice(afterAuthorityIndex);
  const path = rest.split(/[?#]/)[0] ?? '';

  if (!path) {
    return false;
  }

  const segments = path.split('/');
  return segments.some((segment) => {
    const normalized = segment.toLowerCase();
    return (
      segment === '.' ||
      segment === '..' ||
      normalized === '%2e' ||
      normalized === '%2e%2e'
    );
  });
};

const hasWildcardInQueryOrHash = (url: string): boolean => {
  const queryIndex = url.indexOf('?');
  if (queryIndex >= 0 && url.slice(queryIndex).includes('*')) {
    return true;
  }

  const hashIndex = url.indexOf('#');
  return hashIndex >= 0 && url.slice(hashIndex).includes('*');
};

const isValidWildcardAuthority = (authority: string): boolean => {
  // Disallow credentials and IPv6 literals for simplicity.
  if (!authority || authority.includes('@') || authority.startsWith('[')) {
    return false;
  }

  // Disallow wildcards in port segment.
  const lastColonIndex = authority.lastIndexOf(':');
  const hasPort = lastColonIndex > -1 && authority.indexOf(':') === lastColonIndex;
  const hostname = hasPort ? authority.slice(0, lastColonIndex) : authority;

  // When wildcard is used in hostname, require at least one dot to avoid overly broad patterns.
  if (hostname.includes('*') && !hostname.includes('.')) {
    return false;
  }

  if (hasPort && authority.slice(lastColonIndex + 1).includes('*')) {
    return false;
  }

  return true;
};

const isValidWildcardUrl = (value: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(value.replaceAll('*', 'wildcard'));
    return true;
  } catch {
    return false;
  }
};

export const redirectUriValidator = (value: string) => {
  if (!value.includes('*')) {
    return uriValidator(value);
  }

  const schemeSeparatorIndex = value.indexOf('://');
  if (schemeSeparatorIndex <= 0) {
    return false;
  }

  // Disallow wildcards in scheme (check before scheme validation).
  if (value.slice(0, schemeSeparatorIndex).includes('*')) {
    return false;
  }

  const scheme = value.slice(0, schemeSeparatorIndex).toLowerCase();
  if (scheme !== 'http' && scheme !== 'https') {
    return false;
  }

  if (hasWildcardInQueryOrHash(value)) {
    return false;
  }

  const authority = value.slice(schemeSeparatorIndex + 3).split(/[/?#]/)[0] ?? '';
  if (!isValidWildcardAuthority(authority)) {
    return false;
  }

  if (hasDotSegmentsInPath(value, schemeSeparatorIndex)) {
    return false;
  }

  return isValidWildcardUrl(value);
};

export const jsonValidator = (value: string) => {
  try {
    JSON.parse(value);
  } catch {
    return false;
  }

  return true;
};
