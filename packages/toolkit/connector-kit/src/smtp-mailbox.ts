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

export const parseSendFrom = (
  renderedSendFrom: string,
  fallbackEmail: string,
  fallbackName?: string
): { email: string; name?: string } => {
  const value = stripHeaderControlChars(renderedSendFrom).trim();
  const match = /^(.*?)<\s*([^>]+)\s*>$/.exec(value);

  if (match) {
    const name = match[1]?.trim();
    const email = match[2]?.trim();

    if (email) {
      return {
        email: sanitizeMailboxAddress(email),
        name: name?.length ? sanitizeMailboxDisplayName(name) : undefined,
      };
    }
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
