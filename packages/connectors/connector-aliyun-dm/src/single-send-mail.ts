import { endpoint, staticConfigs } from './constant.js';
import type { PublicParameters, SingleSendMail } from './types.js';
import { request } from './utils.js';

/**
 * @doc https://help.aliyun.com/document_detail/29444.html
 */
export const singleSendMail = async (
  parameters: PublicParameters & SingleSendMail,
  accessKeySecret: string
) => {
  return request(
    endpoint,
    { Action: 'SingleSendMail', ...staticConfigs, ...parameters },
    accessKeySecret
  );
};
