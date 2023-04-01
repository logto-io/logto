import { createHmac } from 'crypto';

import { got } from 'got';

import type { PublicParameters } from './types.js';

// Aliyun has special escape rules.
// https://help.aliyun.com/document_detail/29442.html
const escaper = (string_: string) =>
  encodeURIComponent(string_)
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/!/g, '%21')
    .replace(/"/g, '%22')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\+/g, '%2B');

export const getSignature = (
  parameters: Record<string, string>,
  secret: string,
  method: string
) => {
  const canonicalizedQuery = Object.keys(parameters)
    .map((key) => {
      const value = parameters[key];

      return value === undefined ? '' : `${escaper(key)}=${escaper(value)}`;
    })
    .filter(Boolean)
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
  const finalParameters: Record<string, string> = {
    ...parameters,
    SignatureNonce: String(Math.random()),
    Timestamp: new Date().toISOString(),
  };
  const signature = getSignature(finalParameters, accessKeySecret, 'POST');

  return got.post({
    url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    form: { ...finalParameters, Signature: signature },
  });
};
