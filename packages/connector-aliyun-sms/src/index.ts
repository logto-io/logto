import path from 'path';

import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  SmsSendMessageFunction,
  SendSmsResponse,
  ValidateConfig,
  SmsConnector,
  GetConnectorConfig,
} from '@logto/connector-types';
import { getMarkdownContents } from '@logto/connector-utils';
import { ConnectorType } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { z } from 'zod';

import { sendSms } from './single-send-text';

// eslint-disable-next-line unicorn/prefer-module
const currentPath = __dirname;
const pathToReadmeFile = path.join(currentPath, 'README.md');
const pathToConfigTemplate = path.join(currentPath, 'config-template.md');
const readmeContentFallback = 'Please check README.md file directory.';
const configTemplateFallback = 'Please check config-template.md file directory.';

/**
 * Details of SmsTemplateType can be found at:
 * https://next.api.aliyun.com/document/Dysmsapi/2017-05-25/QuerySmsTemplateList.
 *
 * For our use case is to send passcode sms for passwordless sign-in/up as well as
 * reset password, the default value of type code is set to be 2.
 *
 */
enum SmsTemplateType {
  Notification = 0,
  Promotion = 1,
  Passcode = 2,
  InternationalMessage = 6,
  PureNumber = 7,
}

/**
 * UsageType here is used to specify the use case of the template, can be either
 * 'Register', 'SignIn', 'ForgotPassword' or 'Test'.
 *
 * Type here in the template is used to specify the purpose of sending the sms,
 * can be either item in SmsTemplateType.
 * As the SMS is applied for sending passcode, the value should always be 2 in our case.
 *
 */
const templateGuard = z.object({
  type: z.nativeEnum(SmsTemplateType).default(2),
  usageType: z.string(),
  code: z.string(),
  name: z.string().min(1).max(30),
  content: z.string().min(1).max(500),
  remark: z.string(),
});

const configGuard = z.object({
  accessKeyId: z.string(),
  accessKeySecret: z.string(),
  signName: z.string(),
  templates: z.array(templateGuard),
});

export type AliyunSmsConfig = z.infer<typeof configGuard>;

export class AliyunSmsConnector implements SmsConnector {
  public metadata: ConnectorMetadata = {
    id: 'aliyun-sms',
    type: ConnectorType.SMS,
    name: {
      en: 'Aliyun Short Message Service',
      'zh-CN': '阿里云短信服务',
    },
    // TODO: add the real logo URL (LOG-1823)
    logo: './logo.png',
    description: {
      en: 'Short Message Service (SMS) has a batch sending feature and various API operations to send one-time password (OTP) messages, notification messages, and promotional messages to customers.',
      'zh-CN':
        '短信服务（Short Message Service）是指通过调用短信发送API，将指定短信内容发送给指定手机用户。',
    },
    readme: getMarkdownContents(pathToReadmeFile, readmeContentFallback),
    configTemplate: getMarkdownContents(pathToConfigTemplate, configTemplateFallback),
  };

  public readonly getConfig: GetConnectorConfig<AliyunSmsConfig>;

  constructor(getConnectorConfig: GetConnectorConfig<AliyunSmsConfig>) {
    this.getConfig = getConnectorConfig;
  }

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = configGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public sendMessage: SmsSendMessageFunction<SendSmsResponse> = async (phone, type, { code }) => {
    const config = await this.getConfig(this.metadata.id);
    await this.validateConfig(config);
    const { accessKeyId, accessKeySecret, signName, templates } = config;
    const template = templates.find(({ usageType }) => usageType === type);

    assert(
      template,
      new ConnectorError(ConnectorErrorCodes.TemplateNotFound, `Cannot find template!`)
    );

    return sendSms(
      {
        AccessKeyId: accessKeyId,
        PhoneNumbers: phone,
        SignName: signName,
        TemplateCode: template.code,
        TemplateParam: JSON.stringify({ code }),
      },
      accessKeySecret
    );
  };
}
