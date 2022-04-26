import { Response } from 'got';

import { SingleSendMail, Endpoint, staticConfigs } from './constant';
import { PublicParameters, request, SendEmailResponse } from './utils';

/**
 * @doc https://help.aliyun.com/document_detail/29444.html
 *
 */
export const singleSendMail = async (
  parameters: PublicParameters & SingleSendMail,
  accessKeySecret: string
): Promise<Response<SendEmailResponse>> => {
  return request<SendEmailResponse>(
    Endpoint,
    { Action: 'SingleSendMail', ...staticConfigs, ...parameters },
    accessKeySecret
  );
};
