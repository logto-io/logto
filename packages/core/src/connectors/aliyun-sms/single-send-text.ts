import { PublicParameters, request } from '../utilities/aliyun';

/**
 * @doc https://help.aliyun.com/document_detail/101414.html
 *
 */
interface SendSms {
  OutId?: string;
  PhoneNumbers: string; // 11 digits w/o prefix (can be multiple phone numbers with separator `,`)
  SignName: string; // Name of SMS signature
  SmsUpExtendCode?: string;
  TemplateCode: string; // Text message template ID
  TemplateParam?: string; // Stringified JSON (used to fill in text template)
}

const Endpoint = 'https://dysmsapi.aliyuncs.com/';

const commonParameters = {
  Format: 'json',
  RegionId: 'cn-hangzhou',
  SignatureMethod: 'HMAC-SHA1',
  SignatureVersion: '1.0',
  Version: '2017-05-25',
};

/**
 * @doc https://help.aliyun.com/document_detail/101414.html
 *
 */
export const singleSendText = async (
  parameters: PublicParameters & SendSms,
  accessKeySecret: string
) => {
  return request<{ BizId: string; Code: string; Message: string; RequestId: string }>(
    Endpoint,
    { Action: 'SendSms', ...commonParameters, ...parameters },
    accessKeySecret
  );
};
