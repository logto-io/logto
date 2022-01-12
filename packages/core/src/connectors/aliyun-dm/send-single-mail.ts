import { PublicParameters, request } from './request';

interface SingleSendMail {
  AccountName: string;
  AddressType: '0' | '1';
  ReplyToAddress: 'true' | 'false';
  Subject: string;
  ToAddress: string;
  ClickTrace?: '0' | '1';
  FromAlias?: string;
  HtmlBody?: string;
  TagName?: string;
  TextBody?: string;
}

export const sendSingleMail = async (
  parameters: PublicParameters & SingleSendMail,
  accessKeySecret: string
) => {
  return request<{ RequestId: string; EnvId: string }>(
    'https://dm.aliyuncs.com/',
    { Action: 'SingleSendMail', ...parameters },
    accessKeySecret
  );
};
