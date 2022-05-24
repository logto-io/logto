import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  EmailSendMessageFunction,
  ValidateConfig,
  EmailConnector,
  GetConnectorConfig,
} from '@logto/connector-types';
import { assert, Nullable } from '@silverhand/essentials';
import got from 'got';

import { defaultMetadata, endpoint } from './constant';
import {
  sendGridMailConfigGuard,
  SendEmailResponse,
  SendGridMailConfig,
  EmailData,
  Personalization,
  Content,
  PublicParameters,
} from './types';

export class SendGridMailConnector implements EmailConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  constructor(public readonly getConfig: GetConnectorConfig<SendGridMailConfig>) {}

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = sendGridMailConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public sendMessage: EmailSendMessageFunction<Nullable<SendEmailResponse>> = async (
    address,
    type,
    data
  ) => {
    const config = await this.getConfig(this.metadata.id);
    await this.validateConfig(config);
    const { apiKey, fromEmail, fromName, templates } = config;
    const template = templates.find((template) => template.usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Template not found for type: ${type}`
      )
    );

    const toEmailData: EmailData[] = [{ email: address }];
    const fromEmailData: EmailData = fromName
      ? { email: fromEmail, name: fromName }
      : { email: fromEmail };
    const personalizations: Personalization = { to: toEmailData };
    const content: Content = {
      type: template.type,
      value:
        typeof data.code === 'string'
          ? template.content.replace(/{{code}}/g, data.code)
          : template.content,
    };
    const { subject } = template;

    const parameters: PublicParameters = {
      personalizations: [personalizations],
      from: fromEmailData,
      subject,
      content: [content],
    };

    return got
      .post(endpoint, {
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        json: parameters,
      })
      .json<Nullable<SendEmailResponse>>();
  };
}
