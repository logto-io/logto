import { PublicParameters, request } from '../utilities/aliyun';

/**
 * @doc https://help.aliyun.com/document_detail/29444.html
 *
 */
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

/**
 * @doc https://help.aliyun.com/document_detail/29444.html
 *
 */
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
