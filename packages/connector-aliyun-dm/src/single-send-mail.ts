import { Response } from 'got';

import { endpoint, staticConfigs } from './constant';
import { PublicParameters, SendEmailResponse, SingleSendMail } from './types';
import { request } from './utils';

/**
 * @doc https://help.aliyun.com/document_detail/29444.html
 */
export const singleSendMail = async (
  parameters: PublicParameters & SingleSendMail,
  accessKeySecret: string
): Promise<Response<SendEmailResponse>> => {
  return request<SendEmailResponse>(
    endpoint,
    { Action: 'SingleSendMail', ...staticConfigs, ...parameters },
    accessKeySecret
  );
};
