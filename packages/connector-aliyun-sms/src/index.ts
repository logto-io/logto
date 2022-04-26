import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  SmsSendMessageFunction,
  ValidateConfig,
  SmsConnector,
  GetConnectorConfig,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';
import { Response } from 'got';
import { z } from 'zod';

import { defaultMetadata } from './constant';
import { sendSms } from './single-send-text';
import { SendSmsResponse } from './utils';
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
  public metadata: ConnectorMetadata = defaultMetadata;

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

  public sendMessage: SmsSendMessageFunction<Response<SendSmsResponse>> = async (
    phone,
    type,
    { code }
  ) => {
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
