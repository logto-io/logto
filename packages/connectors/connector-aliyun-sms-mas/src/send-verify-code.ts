import { messageAuthEndpoint, staticConfigs } from './constant.js';
import type { PublicParameters, SendSmsVerifyCode } from './types.js';
import { request } from './utils.js';

/**
 * Send SMS verification code using Aliyun Message Authentication Service (MAS)
 *
 * API Documentation: https://help.aliyun.com/zh/pnvs/developer-reference/api-dypnsapi-2017-05-25-sendsmsverifycode
 *
 * Key differences from standard SMS service:
 * - Uses PhoneNumber (singular) instead of PhoneNumbers (plural)
 * - Requires system-provided signatures and templates
 * - Endpoint: dypnsapi.aliyuncs.com (instead of dysmsapi.aliyuncs.com)
 * - Built-in anti-fraud and rate limiting
 */

export const sendSmsVerifyCode = async (
  parameters: PublicParameters & SendSmsVerifyCode,
  accessKeySecret: string
) => {
  return request(
    messageAuthEndpoint,
    { Action: 'SendSmsVerifyCode', ...staticConfigs, ...parameters },
    accessKeySecret
  );
};
