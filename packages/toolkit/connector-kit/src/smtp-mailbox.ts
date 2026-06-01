/** Strip ASCII control characters that must not appear in SMTP header fields (RFC 5322). */
export const stripHeaderControlChars = (value: string): string =>
  [...value]
    .filter((character) => {
      const code = character.codePointAt(0);
      return code !== undefined && code > 31 && code !== 127;
    })
    .join('');

/**
 * Sanitize a display name for `From: Name <addr>` so CR/LF cannot inject extra headers and
 * angle brackets cannot break the mailbox token.
 */
export const sanitizeMailboxDisplayName = (name: string): string =>
  stripHeaderControlChars(name).replaceAll('<', '').replaceAll('>', '').trim();

/** Local-part angle brackets from malformed `Name <…>` input must not break the outer mailbox token. */
export const sanitizeMailboxAddress = (address: string): string =>
  stripHeaderControlChars(address).replaceAll('<', '').replaceAll('>', '').trim();

export const formatMailbox = (email: string, name?: string): string => {
  const sanitizedEmail = sanitizeMailboxAddress(email);
  if (!name) {
    return sanitizedEmail;
  }

  const safeName = sanitizeMailboxDisplayName(name);
  return safeName.length > 0 ? `${safeName} <${sanitizedEmail}>` : sanitizedEmail;
};

/** Parse `Name <email@domain>` without regex to avoid polynomial backtracking on untrusted input. */
const parseMailboxFormat = (value: string): { name?: string; email: string } | undefined => {
  if (!value.endsWith('>')) {
    return undefined;
  }

  const closeBracket = value.length - 1;
  const prefix = value.slice(0, closeBracket);
  const lastGtBeforeEnd = prefix.lastIndexOf('>');
  const searchFrom = lastGtBeforeEnd === -1 ? 0 : lastGtBeforeEnd + 1;
  const openBracket = value.indexOf('<', searchFrom);

  if (openBracket === -1 || closeBracket <= openBracket) {
    return undefined;
  }

  const email = value.slice(openBracket + 1, closeBracket).trim();
  if (!email) {
    return undefined;
  }

  const name = value.slice(0, openBracket).trim();
  return { name: name.length > 0 ? name : undefined, email };
};

export const parseSendFrom = (
  renderedSendFrom: string,
  fallbackEmail: string,
  fallbackName?: string
): { email: string; name?: string } => {
  const value = stripHeaderControlChars(renderedSendFrom).trim();
  const parsed = parseMailboxFormat(value);

  if (parsed) {
    return {
      email: sanitizeMailboxAddress(parsed.email),
      name: parsed.name ? sanitizeMailboxDisplayName(parsed.name) : undefined,
    };
  }

  if (value.includes('@') && !value.includes(' ')) {
    return { email: sanitizeMailboxAddress(value), name: undefined };
  }

  const rawDisplay = value.length > 0 ? value : fallbackName;
  if (!rawDisplay) {
    return { email: sanitizeMailboxAddress(fallbackEmail), name: undefined };
  }

  const safeName = sanitizeMailboxDisplayName(rawDisplay);
  return {
    email: sanitizeMailboxAddress(fallbackEmail),
    name: safeName.length > 0 ? safeName : undefined,
  };
};
