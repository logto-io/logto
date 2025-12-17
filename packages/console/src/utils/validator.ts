export const uriValidator = (value: string) => {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
  } catch {
    return false;
  }

  return true;
};

export const redirectUriValidator = (value: string) => {
  if (!value.includes('*')) {
    return uriValidator(value);
  }

  const schemeSeparatorIndex = value.indexOf('://');
  if (schemeSeparatorIndex <= 0) {
    return false;
  }

  const scheme = value.slice(0, schemeSeparatorIndex).toLowerCase();
  if (scheme !== 'http' && scheme !== 'https') {
    return false;
  }

  // Disallow wildcards in scheme.
  if (value.slice(0, schemeSeparatorIndex).includes('*')) {
    return false;
  }

  // Disallow wildcards in query/hash to keep matching deterministic and safer.
  const queryIndex = value.indexOf('?');
  if (queryIndex >= 0 && value.slice(queryIndex).includes('*')) {
    return false;
  }

  const hashIndex = value.indexOf('#');
  if (hashIndex >= 0 && value.slice(hashIndex).includes('*')) {
    return false;
  }

  const authority = value.slice(schemeSeparatorIndex + 3).split(/[/?#]/)[0] ?? '';

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

  try {
    // eslint-disable-next-line no-new
    new URL(value.replaceAll('*', 'wildcard'));
  } catch {
    return false;
  }

  return true;
};

export const jsonValidator = (value: string) => {
  try {
    JSON.parse(value);
  } catch {
    return false;
  }

  return true;
};
