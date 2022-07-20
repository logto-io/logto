import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  Connector,
  SmsSendMessageFunction,
  SmsSendTestMessageFunction,
  SmsConnectorInstance,
  GetConnectorConfig,
  SmsMessageTypes,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';
import got, { HTTPError } from 'got';

import { defaultMetadata, endpoint } from './constant';
import { twilioSmsConfigGuard, TwilioSmsConfig, PublicParameters } from './types';

export default class TwilioSmsConnector implements SmsConnectorInstance<TwilioSmsConfig> {
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

  public validateConfig(config: unknown): asserts config is TwilioSmsConfig {
    const result = twilioSmsConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  }

  public sendMessage: SmsSendMessageFunction = async (phone, type, data) => {
    const config = await this.getConfig(this.metadata.id);

    this.validateConfig(config);

    return this.sendMessageBy(config, phone, type, data);
  };

  public sendTestMessage: SmsSendTestMessageFunction = async (config, phone, type, data) => {
    this.validateConfig(config);

    return this.sendMessageBy(config, phone, type, data);
  };

  private readonly sendMessageBy = async (
    config: TwilioSmsConfig,
    phone: string,
    type: keyof SmsMessageTypes,
    data: SmsMessageTypes[typeof type]
  ) => {
    const { accountSID, authToken, fromMessagingServiceSID, templates } = config;
    const template = templates.find((template) => template.usageType === type);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Cannot find template for type: ${type}`
      )
    );

    const parameters: PublicParameters = {
      To: phone,
      MessagingServiceSid: fromMessagingServiceSID,
      Body:
        typeof data.code === 'string'
          ? template.content.replace(/{{code}}/g, data.code)
          : template.content,
    };

    try {
      return await got.post(endpoint.replace(/{{accountSID}}/g, accountSID), {
        headers: {
          Authorization:
            'Basic ' + Buffer.from([accountSID, authToken].join(':')).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(parameters).toString(),
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
