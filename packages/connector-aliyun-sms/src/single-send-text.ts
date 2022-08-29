import { endpoint, staticConfigs } from './constant';
import { PublicParameters, SendSms } from './types';
import { request } from './utils';

/**
 * @doc https://help.aliyun.com/document_detail/101414.html
 */
export const sendSms = async (parameters: PublicParameters & SendSms, accessKeySecret: string) => {
  return request(endpoint, { Action: 'SendSms', ...staticConfigs, ...parameters }, accessKeySecret);
};
