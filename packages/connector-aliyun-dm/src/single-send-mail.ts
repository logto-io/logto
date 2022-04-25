import { Response } from 'got';

import { PublicParameters, request, SendEmailResponse } from './utils';

/**
 * @doc https://help.aliyun.com/document_detail/29444.html
 *
 */
interface SingleSendMail {
  AccountName: string;
  AddressType: '0' | '1';
  ClickTrace?: '0' | '1';
  FromAlias?: string;
  HtmlBody?: string;
  ReplyToAddress: 'true' | 'false';
  Subject: string;
  TagName?: string;
  TextBody?: string;
  ToAddress: string;
}

const Endpoint = 'https://dm.aliyuncs.com/';

const staticConfigs = {
  Format: 'json',
  SignatureMethod: 'HMAC-SHA1',
  SignatureVersion: '1.0',
  Version: '2015-11-23',
};

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
