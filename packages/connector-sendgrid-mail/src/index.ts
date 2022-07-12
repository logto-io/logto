import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  EmailMessageTypes,
  EmailSendMessageFunction,
  EmailSendTestMessageFunction,
  ValidateConfig,
  EmailConnector,
  GetConnectorConfig,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';
import got, { HTTPError } from 'got';

import { defaultMetadata, endpoint } from './constant';
import {
  sendGridMailConfigGuard,
  SendGridMailConfig,
  EmailData,
  Personalization,
  Content,
  PublicParameters,
} from './types';

export default class SendGridMailConnector implements EmailConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  constructor(public readonly getConfig: GetConnectorConfig<SendGridMailConfig>) {}

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = sendGridMailConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  };

  public sendMessage: EmailSendMessageFunction = async (address, type, data) => {
    const emailConfig = await this.getConfig(this.metadata.id);
    await this.validateConfig(emailConfig);

    return this.sendMessageBy(emailConfig, address, type, data);
  };

  public sendTestMessage: EmailSendTestMessageFunction = async (address, type, data, config) => {
    await this.validateConfig(config);

    return this.sendMessageBy(config as SendGridMailConfig, address, type, data);
  };

  private readonly sendMessageBy = async (
    config: SendGridMailConfig,
    address: string,
    type: keyof EmailMessageTypes,
    data: EmailMessageTypes[typeof type]
  ) => {
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

    try {
      return await got.post(endpoint, {
        headers: {
          Authorization: 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        json: parameters,
      });
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const {
          response: { body: rawBody },
        } = error;
        assert(
          typeof rawBody === 'string',
          new ConnectorError(ConnectorErrorCodes.InvalidResponse)
        );

        throw new ConnectorError(ConnectorErrorCodes.General, rawBody);
      }

      throw error;
    }
  };
}
