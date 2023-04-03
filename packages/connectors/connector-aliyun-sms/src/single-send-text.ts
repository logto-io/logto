import { endpoint, staticConfigs } from './constant.js';
import type { PublicParameters, SendSms } from './types.js';
import { request } from './utils.js';

/**
 * @doc https://help.aliyun.com/document_detail/101414.html
 */
export const sendSms = async (parameters: PublicParameters & SendSms, accessKeySecret: string) => {
  return request(endpoint, { Action: 'SendSms', ...staticConfigs, ...parameters }, accessKeySecret);
};
