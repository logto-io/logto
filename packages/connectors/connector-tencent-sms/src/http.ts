import { got } from 'got';
import type { BinaryToTextEncoding } from 'node:crypto';
import crypto from 'node:crypto';

import { tencentErrorResponse } from './schema.js';
import type { TencentErrorResponse, TencentSuccessResponse } from './schema.js';

const endpoint = 'sms.tencentcloudapi.com';

function sha256Hmac(message: string, secret: string): string;
// eslint-disable-next-line @typescript-eslint/ban-types
function sha256Hmac(message: string, secret: string, encoding: BinaryToTextEncoding): Buffer;
function sha256Hmac(message: string, secret: string, encoding?: BinaryToTextEncoding) {
  const hmac = crypto.createHmac('sha256', secret);

  return encoding ? hmac.update(message).digest(encoding) : hmac.update(message).digest();
}

function getHash(message: string, encoding: BinaryToTextEncoding = 'hex') {
  const hash = crypto.createHash('sha256');

  return hash.update(message).digest(encoding);
}

function getDate(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isSmsErrorResponse(response: unknown): response is TencentErrorResponse {
  const result = tencentErrorResponse.safeParse(response);

  return result.success;
}

export async function sendSmsRequest(
  templateId: string,
  templateParameters: string[],
  phoneNumber: string,
  config: {
    secretId: string;
    secretKey: string;
    region: string;
    sdkAppId: string;
    signName: string;
  }
) {
  const { secretId, secretKey, region, sdkAppId, signName } = config;
  const timestamp = Math.floor(Date.now() / 1000);
  const date = getDate(timestamp);
  const service = 'sms';

  const firstPayload = {
    SmsSdkAppId: sdkAppId,
    SignName: signName,
    TemplateId: templateId,
    TemplateParamSet: templateParameters,
    PhoneNumberSet: [phoneNumber],
  };

  const payload = JSON.stringify(firstPayload);

  const hashedRequestPayload = getHash(payload);
  const signedHeaders = 'content-type;host';
  const httpRequestMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQueryString = '';
  const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${endpoint}\n`;

  const canonicalRequest = [
    httpRequestMethod,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    hashedRequestPayload,
  ].join('\n');

  const algorithm = 'TC3-HMAC-SHA256';
  const hashedCanonicalRequest = getHash(canonicalRequest);
  const credentialScope = `${date}/${service}/tc3_request`;
  const stringToSign = [algorithm, timestamp, credentialScope, hashedCanonicalRequest].join('\n');

  const secretDate = sha256Hmac(date, `TC3${secretKey}`);
  const secretService = sha256Hmac(service, secretDate);
  const secretSigning = sha256Hmac('tc3_request', secretService);
  const signature = sha256Hmac(stringToSign, secretSigning, 'hex').toString();

  const authorization = `${algorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return got.post<TencentErrorResponse | TencentSuccessResponse>(`https://${endpoint}`, {
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json; charset=utf-8',
      Host: endpoint,
      'X-TC-Action': 'SendSms',
      'X-TC-Timestamp': String(timestamp),
      'X-TC-Version': '2021-01-11',
      'X-TC-Region': region,
    },
    body: payload,
    responseType: 'json',
  });
}
