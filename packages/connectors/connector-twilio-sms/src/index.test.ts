import nock from 'nock';

import { ConnectorErrorCodes, TemplateType } from '@logto/connector-kit';

import createConnector from './index.js';
import { mockedConfig } from './mock.js';
import { twilioSmsConfigGuard } from './types.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);

describe('Twilio SMS connector', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  beforeEach(() => {
    getConfig.mockReset().mockResolvedValue(mockedConfig);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  it('init without throwing errors', async () => {
    await expect(createConnector({ getConfig })).resolves.not.toThrow();
  });

  it('should send `To` number in E.164 format', async () => {
    const url = new URL('https://api.twilio.com/2010-04-01/Accounts/account-sid/Messages.json');
    const mockedPost = nock(url.origin)
      .post(url.pathname, (body) => {
        expect(body).toMatchObject({ To: '+4512345678' });
        return true;
      })
      .reply(200, { sid: 'SMxxxx' });

    const connector = await createConnector({ getConfig });
    await connector.sendMessage(
      {
        to: '4512345678',
        type: TemplateType.Generic,
        payload: { code: '123456' },
      },
      {
        ...mockedConfig,
        templates: [
          { usageType: 'Register', content: 'code {{code}}' },
          { usageType: 'SignIn', content: 'code {{code}}' },
          { usageType: 'ForgotPassword', content: 'code {{code}}' },
          { usageType: 'Generic', content: 'code {{code}}' },
        ],
      }
    );

    expect(mockedPost.isDone()).toBe(true);
  });

  const message = {
    to: '353861234567',
    type: TemplateType.Generic,
    payload: { code: '123456' },
  };

  it.each([
    { host: undefined, disableRiskCheck: undefined, riskCheck: 'enable' },
    { host: 'api.twilio.com', disableRiskCheck: false, riskCheck: 'enable' },
    { host: 'api.twilio.com', disableRiskCheck: true, riskCheck: 'disable' },
    { host: 'api.custom.twilio.com', disableRiskCheck: undefined, riskCheck: 'enable' },
    { host: 'api.custom.twilio.com', disableRiskCheck: false, riskCheck: 'enable' },
    { host: 'API.CUSTOM.TWILIO.COM', disableRiskCheck: true, riskCheck: 'disable' },
  ])('sends with saved config %j', async ({ host, disableRiskCheck, riskCheck }) => {
    getConfig.mockResolvedValue({ ...mockedConfig, host, disableRiskCheck });
    const scope = nock(`https://${host?.toLowerCase() ?? 'api.twilio.com'}`)
      .post('/2010-04-01/Accounts/account-sid/Messages.json', (body) => {
        expect(body).toEqual({
          To: '+353861234567',
          MessagingServiceSid: mockedConfig.fromMessagingServiceSID,
          Body: 'This is for testing purposes only. Your verification code is 123456.',
          RiskCheck: riskCheck,
        });
        return true;
      })
      .basicAuth({ user: mockedConfig.accountSID, pass: mockedConfig.authToken })
      .reply(201, { sid: 'SMxxxx' });

    const connector = await createConnector({ getConfig });
    await connector.sendMessage(message);

    expect(scope.isDone()).toBe(true);
  });

  it('uses the supplied host and credentials before saving', async () => {
    const scope = nock('https://api.custom.twilio.com')
      .post('/2010-04-01/Accounts/custom-account-sid/Messages.json', {
        To: '+353861234567',
        MessagingServiceSid: 'custom-messaging-service-sid',
        Body: 'custom code 123456',
        RiskCheck: 'enable',
      })
      .basicAuth({ user: 'custom-account-sid', pass: 'custom-auth-token' })
      .reply(201, { sid: 'SMxxxx' });

    const connector = await createConnector({ getConfig });
    await connector.sendMessage(message, {
      ...mockedConfig,
      host: 'api.custom.twilio.com',
      accountSID: 'custom-account-sid',
      authToken: 'custom-auth-token',
      fromMessagingServiceSID: 'custom-messaging-service-sid',
      templates: mockedConfig.templates.map((template) => ({
        ...template,
        content: 'custom code {{code}}',
      })),
    });

    expect(scope.isDone()).toBe(true);
    expect(getConfig).not.toHaveBeenCalled();
  });

  it.each([302, 307, 401, 500])(
    'does not fall back to the default host on HTTP %s',
    async (status) => {
      const defaultScope = nock('https://api.twilio.com')
        .post('/2010-04-01/Accounts/account-sid/Messages.json')
        .reply(201, { sid: 'SMxxxx' });
      const customScope = nock('https://api.custom.twilio.com')
        .post('/2010-04-01/Accounts/account-sid/Messages.json')
        .reply(status, 'Request failed', {
          Location: 'https://api.twilio.com/2010-04-01/Accounts/account-sid/Messages.json',
        });

      const connector = await createConnector({ getConfig });
      await expect(
        connector.sendMessage(message, { ...mockedConfig, host: 'api.custom.twilio.com' })
      ).rejects.toMatchObject({ code: ConnectorErrorCodes.General });

      expect(customScope.isDone()).toBe(true);
      expect(defaultScope.isDone()).toBe(false);
    }
  );

  it.each([
    '',
    ' ',
    'https://api.custom.twilio.com',
    'api.custom.twilio.com:443',
    'api.custom.twilio.com/path',
    'api.custom.twilio.com?query=1',
    'api.custom.twilio.com#fragment',
    'user@api.custom.twilio.com',
    'api.twilio.com.example.com',
    'api.example.com',
    '127.0.0.1',
    'api..twilio.com',
    'api.-custom.twilio.com',
    'api.custom-.twilio.com',
    'api.cus_tom.twilio.com',
    'api.twilio.com\n',
    `api.${'a'.repeat(64)}.twilio.com`,
    null,
    123,
  ])('rejects invalid host %j before sending', async (host) => {
    const config = { ...mockedConfig, host };
    expect(twilioSmsConfigGuard.safeParse(config).success).toBe(false);

    const connector = await createConnector({ getConfig });
    await expect(connector.sendMessage(message, config)).rejects.toMatchObject({
      code: ConnectorErrorCodes.InvalidConfig,
    });
  });
});
