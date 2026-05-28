import { defaultRegionId, getEndpoint, staticConfigs } from './constant.js';
import type { PublicParameters, SingleSendMail } from './types.js';
import { request } from './utils.js';

/**
 * @doc https://help.aliyun.com/document_detail/29444.html
 */
export const singleSendMail = async (
  parameters: PublicParameters & SingleSendMail,
  accessKeySecret: string
) => {
  const { RegionId = defaultRegionId, ...restParameters } = parameters;

  return request(
    getEndpoint(RegionId),
    { Action: 'SingleSendMail', ...staticConfigs, ...restParameters, RegionId },
    accessKeySecret
  );
};
