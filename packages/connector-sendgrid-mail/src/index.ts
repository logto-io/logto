import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  Connector,
  EmailSendMessageFunction,
  EmailSendTestMessageFunction,
  EmailConnectorInstance,
  GetConnectorConfig,
  EmailMessageTypes,
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

export default class SendGridMailConnector implements EmailConnectorInstance<SendGridMailConfig> {
  public metadata: ConnectorMetadata = defaultMetadata;
  private _connector?: Connector;

  public get connector() {
    if (!this._connector) {
      throw new ConnectorError(ConnectorErrorCodes.General);
    }

    return this._connector;
  }

  public set connector(input: Connector) {
    this._connector = input;
  }

  constructor(public readonly getConfig: GetConnectorConfig) {}

  public validateConfig(config: unknown): asserts config is SendGridMailConfig {
    const result = sendGridMailConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  }

  public sendMessage: EmailSendMessageFunction = async (address, type, data) => {
    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);

    return this.sendMessageBy(config, address, type, data);
  };

  public sendTestMessage: EmailSendTestMessageFunction = async (config, address, type, data) => {
    this.validateConfig(config);

    return this.sendMessageBy(config, address, type, data);
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
