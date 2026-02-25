import { type Optional } from '@silverhand/essentials';
import { got } from 'got';
import { createHmac, randomUUID } from 'node:crypto';

import type { PublicParameters } from './types.js';

/**
 * Aliyun has special escape rules for URL encoding
 * @see https://help.aliyun.com/document_detail/29442.html
 * Special characters that need to be encoded differently from standard encodeURIComponent
 */
const escaper = (string_: string) =>
  encodeURIComponent(string_)
    .replaceAll('!', '%21')
    .replaceAll('"', '%22')
    .replaceAll("'", '%27')
    .replaceAll('(', '%28')
    .replaceAll(')', '%29')
    .replaceAll('*', '%2A')
    .replaceAll('+', '%2B');

/**
 * Format date string to 'YYYY-MM-DDThh:mm:ssZ' format
 * Trims milliseconds from ISO string to match Aliyun's expected format
 */
const formatDateString = (date: Date) => {
  const rawString = date.toISOString();
  return rawString.replace(/\.\d{3}Z$/, 'Z'); // Trim milliseconds
};

/**
 * Generate HMAC-SHA1 signature for Aliyun API requests
 * @see https://help.aliyun.com/document_detail/29442.html
 *
 * The signature is calculated using:
 * 1. HTTP method (uppercase)
 * 2. URL-encoded path ("/")
 * 3. Canonicalized query string (sorted, URL-encoded parameters)
 *
 * Format: BASE64(HMAC-SHA1(HTTP_METHOD + "&" + encode("/") + "&" + encode(CanonicalizedQueryString)))
 */
export const getSignature = (
  parameters: Record<string, string>,
  secret: string,
  method: string
) => {
  // Sort parameters by key and construct canonicalized query string
  const canonicalizedQuery = Object.entries(parameters)
    .map(([key, value]) => {
      return `${escaper(key)}=${escaper(value)}`;
    })
    .slice()
    .sort()
    .join('&');

  // Construct string to sign
  const stringToSign = `${method.toUpperCase()}&${escaper('/')}&${escaper(canonicalizedQuery)}`;

  // Calculate HMAC-SHA1 signature
  return createHmac('sha1', `${secret}&`).update(stringToSign).digest('base64');
};

/**
 * Make signed HTTP POST request to Aliyun API
 *
 * This function:
 * 1. Adds required signature parameters (SignatureNonce, Timestamp)
 * 2. Generates HMAC-SHA1 signature
 * 3. Makes the HTTP POST request
 *
 * @param url - API endpoint URL
 * @param parameters - Request parameters including AccessKeyId and API-specific params
 * @param accessKeySecret - Aliyun Access Key Secret for signing
 */
export const request = async (
  url: string,
  parameters: PublicParameters & Record<string, string | number>,
  accessKeySecret: string
) => {
  // Prepare final parameters with signature-related fields
  // Convert all values to strings for signature calculation
  const finalParameters = Object.entries<Optional<string | number>>({
    ...parameters,
    SignatureNonce: randomUUID(),
    Timestamp: formatDateString(new Date()),
  }).reduce<Record<string, string>>(
    (result, [key, value]) => (value === undefined ? result : { ...result, [key]: String(value) }),
    {}
  );

  // Generate signature
  const signature = getSignature(finalParameters, accessKeySecret, 'POST');

  // Make the HTTP POST request
  return got.post({
    url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    form: { ...finalParameters, Signature: signature },
  });
};
