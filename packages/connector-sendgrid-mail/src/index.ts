import { EmailConnector } from '@logto/connector-base-classes';
import {
  ConnectorError,
  ConnectorErrorCodes,
  EmailSendMessageByFunction,
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

export default class SendGridMailConnector extends EmailConnector<SendGridMailConfig> {
  constructor(getConnectorConfig: GetConnectorConfig) {
    super(getConnectorConfig);
    this.metadata = defaultMetadata;
    // eslint-disable-next-line unicorn/prefer-module
    this.metadataParser(__dirname);
  }

  public validateConfig(config: unknown): asserts config is SendGridMailConfig {
    const result = sendGridMailConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  }

  protected readonly sendMessageBy: EmailSendMessageByFunction<SendGridMailConfig> = async (
    config,
    address,
    type,
    data
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
