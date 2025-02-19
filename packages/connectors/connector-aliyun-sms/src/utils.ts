import { type Optional } from '@silverhand/essentials';
import { got } from 'got';
import { createHmac, randomUUID } from 'node:crypto';

import type { PublicParameters } from './types.js';
// Aliyun has special escape rules.
// https://help.aliyun.com/document_detail/29442.html
const escaper = (string_: string) =>
  encodeURIComponent(string_)
    .replaceAll('!', '%21')
    .replaceAll('"', '%22')
    .replaceAll("'", '%27')
    .replaceAll('(', '%28')
    .replaceAll(')', '%29')
    .replaceAll('*', '%2A')
    .replaceAll('+', '%2B');

// Format date string to 'YYYY-MM-DDThh:mm:ssZ' format.
const formatDateString = (date: Date) => {
  const rawString = date.toISOString();
  return rawString.replace(/\.\d{3}Z$/, 'Z'); // Trim milliseconds.
};

export const getSignature = (
  parameters: Record<string, string>,
  secret: string,
  method: string
) => {
  const canonicalizedQuery = Object.entries(parameters)
    .map(([key, value]) => {
      return `${escaper(key)}=${escaper(value)}`;
    })
    .slice()
    .sort()
    .join('&');

  const stringToSign = `${method.toUpperCase()}&${escaper('/')}&${escaper(canonicalizedQuery)}`;

  return createHmac('sha1', `${secret}&`).update(stringToSign).digest('base64');
};

export const request = async (
  url: string,
  parameters: PublicParameters & Record<string, string>,
  accessKeySecret: string
) => {
  const finalParameters = Object.entries<Optional<string>>({
    ...parameters,
    SignatureNonce: randomUUID(),
    Timestamp: formatDateString(new Date()),
  }).reduce<Record<string, string>>(
    (result, [key, value]) => (value === undefined ? result : { ...result, [key]: value }),
    {}
  );
  const signature = getSignature(finalParameters, accessKeySecret, 'POST');

  return got.post({
    url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    form: { ...finalParameters, Signature: signature },
  });
};

// When `isStrictOnRegionNumber` is true, it means the mobile phone number area code needs to be strictly matched; the default is false, for backward compatibility, as some old phone numbers do not have region codes, which would cause the method to make mistakes on validation.
export const isChinaNumber = (to: string, isStrictOnRegionNumber?: boolean) => {
  if (isStrictOnRegionNumber) {
    return /^(\+86|0086|86)\d{11}$/.test(to);
  }

  return /^(\+86|0086|86)?\d{11}$/.test(to);
};
