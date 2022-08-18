import {
  ConnectorError,
  ConnectorErrorCodes,
  SendMessageFunction,
  LogtoConnector,
  GetConnectorConfig,
  ValidateConfig,
} from '@logto/connector-schemas';
import { assert } from '@silverhand/essentials';
import got, { HTTPError } from 'got';

import { defaultMetadata, endpoint } from './constant';
import { twilioSmsConfigGuard, TwilioSmsConfig, PublicParameters } from './types';

export { defaultMetadata } from './constant';

export default class TwilioSmsConnector extends LogtoConnector<TwilioSmsConfig> {
  constructor(getConnectorConfig: GetConnectorConfig) {
    super(getConnectorConfig);
    this.metadata = defaultMetadata;
  }

  public validateConfig: ValidateConfig<TwilioSmsConfig> = (config: unknown) => {
    const result = twilioSmsConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error);
    }
  };

  public sendMessage: SendMessageFunction = async ({ to, type, payload }) => {
    const config = await this.getConfig(this.metadata.id);
    this.validateConfig(config);

    assert(this.sendMessageBy, new ConnectorError(ConnectorErrorCodes.NotImplemented));

    return this.sendMessageBy({ to, type, payload }, config);
  };

  public sendTestMessage: SendMessageFunction = async ({ to, type, payload }, config) => {
    this.validateConfig(config);

    assert(this.sendMessageBy, new ConnectorError(ConnectorErrorCodes.NotImplemented));

    return this.sendMessageBy({ to, type, payload }, config);
  };

  protected readonly sendMessageBy: SendMessageFunction<TwilioSmsConfig> = async (
    { to, type, payload },
    config
  ) => {
    assert(config, new ConnectorError(ConnectorErrorCodes.InvalidConfig));
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
      To: to,
      MessagingServiceSid: fromMessagingServiceSID,
      Body:
        typeof payload.code === 'string'
          ? template.content.replace(/{{code}}/g, payload.code)
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
