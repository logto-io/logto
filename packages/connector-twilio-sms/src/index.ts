import {
  ConnectorError,
  ConnectorErrorCodes,
  ConnectorMetadata,
  EmailSendMessageFunction,
  ValidateConfig,
  SmsConnector,
  GetConnectorConfig,
} from '@logto/connector-types';
import { assert } from '@silverhand/essentials';
import got, { HTTPError } from 'got';

import { defaultMetadata, endpoint } from './constant';
import {
  twilioSmsConfigGuard,
  sendSmsErrorResponseGuard,
  SendSmsResponse,
  TwilioSmsConfig,
  PublicParameters,
} from './types';

export default class TwilioSmsConnector implements SmsConnector {
  public metadata: ConnectorMetadata = defaultMetadata;

  constructor(public readonly getConfig: GetConnectorConfig<TwilioSmsConfig>) {}

  public validateConfig: ValidateConfig = async (config: unknown) => {
    const result = twilioSmsConfigGuard.safeParse(config);

    if (!result.success) {
      throw new ConnectorError(ConnectorErrorCodes.InvalidConfig, result.error.message);
    }
  };

  public sendMessage: EmailSendMessageFunction = async (address, type, data) => {
    const config = await this.getConfig(this.metadata.id);
    await this.validateConfig(config);
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
      To: address,
      MessagingServiceSid: fromMessagingServiceSID,
      Body:
        typeof data.code === 'string'
          ? template.content.replace(/{{code}}/g, data.code)
          : template.content,
    };

    try {
      const httpResponse = await got.post<SendSmsResponse>(
        endpoint.replace(/{{accountSID}}/g, accountSID),
        {
          headers: {
            Authorization:
              'Basic ' + Buffer.from([accountSID, authToken].join(':')).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(parameters).toString(),
        }
      );
      const { body, statusCode: httpCode } = httpResponse;

      return { body, httpCode };
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const {
          response: { body: rawBody, statusCode: httpCode },
        } = error;
        assert(
          typeof rawBody === 'string',
          new ConnectorError(ConnectorErrorCodes.InvalidResponse)
        );
        const body = sendSmsErrorResponseGuard.parse(JSON.parse(rawBody));

        return { body, httpCode };
      }

      throw error;
    }
  };
}
