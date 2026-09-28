import { assert } from '@silverhand/essentials';
import { got, HTTPError } from 'got';

import type {
  GetConnectorConfig,
  SendMessageFunction,
  CreateConnector,
  SmsConnector,
} from '@logto/connector-kit';
import {
  ConnectorError,
  ConnectorErrorCodes,
  validateConfig,
  ConnectorType,
  replaceSendMessageHandlebars,
  getConfigTemplateByType,
} from '@logto/connector-kit';

import { defaultHost, defaultMetadata, endpoint } from './constant.js';
import type { PublicParameters } from './types.js';
import { twilioSmsConfigGuard } from './types.js';

// Phone number validity is checked upstream; only normalize a missing "+" for Twilio E.164 input.
const toE164PhoneNumber = (phoneNumber: string) =>
  phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

const sendMessage =
  (getConfig: GetConnectorConfig): SendMessageFunction =>
  async (data, inputConfig) => {
    const { to, type, payload } = data;
    const config = inputConfig ?? (await getConfig(defaultMetadata.id));
    validateConfig(config, twilioSmsConfigGuard);
    const { accountSID, authToken, fromMessagingServiceSID, disableRiskCheck } = config;
    const host = config.host?.toLowerCase() ?? defaultHost;
    const template = getConfigTemplateByType(type, config);

    assert(
      template,
      new ConnectorError(
        ConnectorErrorCodes.TemplateNotFound,
        `Cannot find template for type: ${type}`
      )
    );

    const parameters: PublicParameters = {
      To: toE164PhoneNumber(to),
      MessagingServiceSid: fromMessagingServiceSID,
      Body: replaceSendMessageHandlebars(template.content, payload),
      RiskCheck: disableRiskCheck ? 'disable' : 'enable',
    };

    try {
      const response = await got.post(
        endpoint.replaceAll('{{host}}', host).replaceAll('{{accountSID}}', accountSID),
        {
          // Keep requests on the configured host, including on redirect responses.
          ...(config.host && { followRedirect: false }),
          headers: {
            Authorization:
              'Basic ' + Buffer.from([accountSID, authToken].join(':')).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(parameters).toString(),
        }
      );

      // Got accepts 3xx responses when redirects are disabled, but no SMS was sent.
      assert(
        !config.host || response.statusCode < 300,
        new ConnectorError(ConnectorErrorCodes.General, response.body)
      );

      return response;
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        const {
          response: { body: rawBody },
        } = error;
        assert(
          typeof rawBody === 'string',
          new ConnectorError(
            ConnectorErrorCodes.InvalidResponse,
            `Invalid response raw body type: ${typeof rawBody}`
          )
        );

        throw new ConnectorError(ConnectorErrorCodes.General, rawBody);
      }

      throw error;
    }
  };

const createTwilioSmsConnector: CreateConnector<SmsConnector> = async ({ getConfig }) => {
  return {
    metadata: defaultMetadata,
    type: ConnectorType.Sms,
    configGuard: twilioSmsConfigGuard,
    sendMessage: sendMessage(getConfig),
  };
};

export default createTwilioSmsConnector;
