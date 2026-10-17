import { z } from 'zod';

/**
 * What an upstream's encrypted credential holds. A bearer token is stored as-is (the original format);
 * an OAuth connection is stored as this record, encrypted as a whole, so the client secret-free client
 * ID, the endpoints and the tokens never sit in plain text.
 */
export const oauthRecord = z.object({
  kind: z.literal('oauth'),
  clientId: z.string().min(1),
  authorizationEndpoint: z.string().url(),
  tokenEndpoint: z.string().url(),
  resource: z.string().url(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  /** Epoch milliseconds after which the access token must be refreshed. */
  expiresAt: z.number().optional(),
});

export type OAuthRecord = z.infer<typeof oauthRecord>;

export type ParsedCredential = { kind: 'bearer'; token: string } | OAuthRecord;

/** Reads a decrypted credential: a JSON OAuth record, or a bearer token from before OAuth existed. */
export const parseCredential = (plaintext: string): ParsedCredential => {
  if (!plaintext.startsWith('{')) {
    return { kind: 'bearer', token: plaintext };
  }

  const record = oauthRecord.parse(JSON.parse(plaintext));
  return { ...record, kind: 'oauth' };
};

/** Serialises an OAuth record for encryption. Fields the record does not carry are left out. */
export const serializeOAuthRecord = (record: OAuthRecord) => JSON.stringify(oauthRecord.parse(record));

/** Whether the access token is usable now, with a minute of margin. */
export const isAccessTokenFresh = (record: OAuthRecord, now = Date.now()) =>
  Boolean(record.accessToken) && (record.expiresAt === undefined || now < record.expiresAt - 60_000);
