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
import { Response } from 'got';

import { defaultMetadata } from './constant';
import {
  sendGridMailConfigGuard,
  SendEmailResponse,
  SendGridMailConfig,
  EmailData,
  Personalization,
  Content,
  PublicParameters,
} from './types';
import { request } from './utils';

export class SendGridMailConnector implements EmailConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  public readonly getConfig: GetConnectorConfig<SendGridMailConfig>;

  constructor(getConnectorConfig: GetConnectorConfig<SendGridMailConfig>) {
    this.getConfig = getConnectorConfig;
  }

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = sendGridMailConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public sendMessage: EmailSendMessageFunction<Response<Nullable<SendEmailResponse>>> = async (
    address,
    type,
    data
  ) => {
    const config = await this.getConfig(this.metadata.target, this.metadata.platform);
    await this.validateConfig(config);
    const { apiKey, fromEmail, fromName, templates } = config;
    const template = templates.find((template) => template.usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Cannot find template for type: ${type}`
      )
    );

    const toEmailData: EmailData = { email: address };
    const fromEmailData: EmailData = { email: fromEmail, name: fromName };
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
      send_at: Date.now(),
    };

    return request(parameters, apiKey);
  };
}
