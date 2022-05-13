import { Response } from 'got';

import { endpoint, staticConfigs } from './constant';
import { PublicParameters, SendSms, SendSmsResponse } from './types';
import { request } from './utils';

/**
 * @doc https://help.aliyun.com/document_detail/101414.html
 */
export const sendSms = async (
  parameters: PublicParameters & SendSms,
  accessKeySecret: string
): Promise<Response<SendSmsResponse>> => {
  return request<SendSmsResponse>(
    endpoint,
    { Action: 'SendSms', ...staticConfigs, ...parameters },
    accessKeySecret
  );
};
