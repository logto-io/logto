import { TemplateType } from '@logto/connector-kit';

import { isChinaNumber } from './index.js';
import { mockedConnectorConfig, phoneTest, codeTest } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConnectorConfig);

const sendSms = vi.fn().mockResolvedValue({
  body: JSON.stringify({ Code: 'OK', RequestId: 'request-id', Message: 'OK' }),
  statusCode: 200,
});

vi.mock('./single-send-text.js', () => ({
  sendSms,
}));

const { default: createConnector } = await import('./index.js');

describe('isChinaNumber()', () => {
  it('should validate China phone numbers in non-strict mode', () => {
    // Valid cases
    expect(isChinaNumber('13812345678')).toBe(true);
    expect(isChinaNumber('8613812345678')).toBe(true);
    expect(isChinaNumber('008613812345678')).toBe(true);
    expect(isChinaNumber('+8613812345678')).toBe(true);

    // Invalid cases
    expect(isChinaNumber('1381234567')).toBe(false); // Too short
    expect(isChinaNumber('138123456789')).toBe(false); // Too long
    expect(isChinaNumber('abcdefghijk')).toBe(false); // Non-numeric
    expect(isChinaNumber('8513812345678')).toBe(false); // Wrong prefix
  });

  it('should validate China phone numbers in strict mode', () => {
    // Valid cases
    expect(isChinaNumber('8613812345678', true)).toBe(true);
    expect(isChinaNumber('008613812345678', true)).toBe(true);
    expect(isChinaNumber('+8613812345678', true)).toBe(true);

    // Invalid cases
    expect(isChinaNumber('13812345678', true)).toBe(false); // Missing region code
    expect(isChinaNumber('1381234567', true)).toBe(false); // Too short
    expect(isChinaNumber('138123456789', true)).toBe(false); // Too long
    expect(isChinaNumber('abcdefghijk', true)).toBe(false); // Non-numeric
    expect(isChinaNumber('8513812345678', true)).toBe(false); // Wrong prefix
  });
});

describe('sendMessage()', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call singleSendMail() and replace code in content', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: phoneTest,
      type: TemplateType.SignIn,
      payload: { code: codeTest },
    });
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        AccessKeyId: mockedConnectorConfig.accessKeyId,
        PhoneNumbers: phoneTest,
        SignName: mockedConnectorConfig.signName,
        TemplateCode: 'TemplateCode',
        TemplateParam: `{"code":"${codeTest}"}`,
      }),
      mockedConnectorConfig.accessKeySecret
    );
  });

  it('should use template per region', async () => {
    const connector = await createConnector({ getConfig });

    for (const to of [phoneTest, `86${phoneTest}`, `0086${phoneTest}`, `+86${phoneTest}`]) {
      // eslint-disable-next-line no-await-in-loop
      await connector.sendMessage({
        to,
        type: TemplateType.Register,
        payload: { code: codeTest },
      });
      expect(sendSms).toHaveBeenCalledWith(
        expect.objectContaining({
          TemplateCode: 'TemplateCode1',
        }),
        mockedConnectorConfig.accessKeySecret
      );

      sendSms.mockClear();
    }

    await connector.sendMessage({
      to: '+1123123123',
      type: TemplateType.Register,
      payload: { code: codeTest },
    });
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        TemplateCode: 'TemplateCode2',
      }),
      mockedConnectorConfig.accessKeySecret
    );
  });
});
