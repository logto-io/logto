import nock from 'nock';

import { ConnectorError, ConnectorErrorCodes, TemplateType } from '@logto/connector-kit';

import { endpoint } from './constant.js';
import createConnector, { normalizeMobile } from './index.js';
import { mockedConfig } from './mock.js';
import { kwtSmsConfigGuard } from './types.js';

const getConfig = vi.fn();
const url = new URL(endpoint);
const okBody = { result: 'OK', 'msg-id': 'abc123', numbers: 1, 'points-charged': 1 };

const createSendMessage = async () => {
  const connector = await createConnector({ getConfig });

  return connector.sendMessage;
};

describe('normalizeMobile()', () => {
  it.each([
    ['+965 5000 0000', '96550000000'],
    ['00965-5000-0000', '96550000000'],
    ['(965) 5000.0000', '96550000000'],
    ['٩٦٥٥٠٠٠٠٠٠٠', '96550000000'],
    ['۹۶۵۵۰۰۰۰۰۰۰', '96550000000'],
    ['96550000000', '96550000000'],
  ])('%s -> %s', (input, expected) => {
    expect(normalizeMobile(input)).toBe(expected);
  });
});

describe('kwtSMS connector', () => {
  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    getConfig.mockReset();
    getConfig.mockResolvedValue(mockedConfig);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('init without throwing errors', async () => {
    await expect(createConnector({ getConfig })).resolves.not.toThrow();
  });

  it('config guard defaults senderId and testMode', () => {
    const { templates } = mockedConfig;
    const parsed = kwtSmsConfigGuard.parse({ username: 'u', password: 'p', templates });
    expect(parsed.senderId).toBe('KWT-SMS');
    expect(parsed.testMode).toBe(false);
  });

  it('config guard requires the four basic templates', () => {
    expect(() =>
      kwtSmsConfigGuard.parse({ username: 'u', password: 'p', templates: [] })
    ).toThrow();
  });

  it('config guard rejects an empty senderId', () => {
    const { templates } = mockedConfig;
    expect(() =>
      kwtSmsConfigGuard.parse({ username: 'u', password: 'p', senderId: '', templates })
    ).toThrow();
  });

  it('config guard rejects an empty username', () => {
    const { templates } = mockedConfig;
    expect(() => kwtSmsConfigGuard.parse({ username: '', password: 'p', templates })).toThrow();
  });

  it('config guard rejects an unknown usageType', () => {
    expect(() =>
      kwtSmsConfigGuard.parse({
        username: 'u',
        password: 'p',
        templates: [...mockedConfig.templates, { usageType: 'Bogus', content: 'x {{code}}' }],
      })
    ).toThrow();
  });

  describe('sendMessage()', () => {
    it('should send the documented JSON body with test=1 when testMode is on', async () => {
      const sendMessage = await createSendMessage();
      const scope = nock(url.origin)
        .post(url.pathname, {
          username: mockedConfig.username,
          password: mockedConfig.password,
          sender: 'KWT-SMS',
          mobile: '96550000000',
          message: 'This is for testing purposes only. Your verification code is 1234.',
          test: '1',
        })
        .reply(200, okBody);

      await expect(
        sendMessage({ to: '+965 5000 0000', type: TemplateType.Generic, payload: { code: '1234' } })
      ).resolves.toMatchObject({ result: 'OK', 'msg-id': 'abc123' });
      expect(scope.isDone()).toBe(true);
    });

    it('should send test=0 and a custom sender when configured', async () => {
      const sendMessage = await createSendMessage();
      const scope = nock(url.origin)
        .post(url.pathname, (body: Record<string, string>) => {
          expect(body).toMatchObject({ sender: 'MYAPP', test: '0' });
          return true;
        })
        .reply(200, okBody);

      await sendMessage(
        { to: '96550000000', type: TemplateType.SignIn, payload: { code: '1234' } },
        { ...mockedConfig, senderId: 'MYAPP', testMode: false }
      );
      expect(scope.isDone()).toBe(true);
    });

    it('should send real messages when testMode is not set', async () => {
      const sendMessage = await createSendMessage();
      const scope = nock(url.origin)
        .post(url.pathname, (body: Record<string, string>) => {
          expect(body).toMatchObject({ test: '0' });
          return true;
        })
        .reply(200, okBody);

      const { username, password, templates } = mockedConfig;
      await sendMessage(
        { to: '96550000000', type: TemplateType.SignIn, payload: { code: '1234' } },
        { username, password, templates }
      );
      expect(scope.isDone()).toBe(true);
    });

    it.each([
      ['a flag', 'Kuwait \u{1F1F0}\u{1F1FC} code {{code}}', 'Kuwait  code 1234'],
      ['a keycap', 'Step 1\uFE0F\u20E3 code {{code}}', 'Step  code 1234'],
      ['a keycap without U+FE0F', 'Step #\u20E3 code {{code}}', 'Step  code 1234'],
      [
        'a skin tone and ZWJ sequence',
        'Hi \u{1F44B}\u{1F3FD} \u{1F468}\u200D\u{1F4BB} {{code}}',
        'Hi   1234',
      ],
      [
        'a tag sequence flag',
        'UK \u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F} {{code}}',
        'UK  1234',
      ],
    ])('should strip %s completely', async (_, content, expected) => {
      const sendMessage = await createSendMessage();
      const scope = nock(url.origin)
        .post(url.pathname, (body: Record<string, string>) => {
          expect(body.message).toBe(expected);
          return true;
        })
        .reply(200, okBody);

      await sendMessage(
        { to: '96550000000', type: TemplateType.Generic, payload: { code: '1234' } },
        {
          ...mockedConfig,
          templates: [
            ...mockedConfig.templates.filter(({ usageType }) => usageType !== 'Generic'),
            { usageType: 'Generic', content },
          ],
        }
      );
      expect(scope.isDone()).toBe(true);
    });

    it('should convert Arabic-Indic digits in the number and strip emoji', async () => {
      const sendMessage = await createSendMessage();
      const scope = nock(url.origin)
        .post(url.pathname, (body: Record<string, string>) => {
          expect(body.mobile).toBe('96550000000');
          expect(body.message).toBe('Code 1234 ');
          return true;
        })
        .reply(200, okBody);

      await sendMessage(
        { to: '٠٠٩٦٥٥٠٠٠٠٠٠٠', type: TemplateType.Generic, payload: { code: '1234' } },
        {
          ...mockedConfig,
          templates: [
            ...mockedConfig.templates.filter(({ usageType }) => usageType !== 'Generic'),
            { usageType: 'Generic', content: 'Code {{code}} \u{1F600}' },
          ],
        }
      );
      expect(scope.isDone()).toBe(true);
    });

    it('should throw a ConnectorError with code and description on HTTP 4XX', async () => {
      const sendMessage = await createSendMessage();
      nock(url.origin)
        .post(url.pathname)
        .reply(403, { result: 'ERROR', code: 'ERR003', description: 'Authentication error' });

      const error = await sendMessage({
        to: '96550000000',
        type: TemplateType.Generic,
        payload: { code: '1234' },
      }).catch((error: unknown) => error);

      expect(error).toBeInstanceOf(ConnectorError);
      expect(error).toMatchObject({
        code: ConnectorErrorCodes.General,
        data: { message: 'ERR003: Authentication error' },
      });
    });

    it('should throw InvalidResponse on a non-JSON error body', async () => {
      const sendMessage = await createSendMessage();
      nock(url.origin).post(url.pathname).reply(406, 'nope');

      await expect(
        sendMessage({ to: '96550000000', type: TemplateType.Generic, payload: { code: '1234' } })
      ).rejects.toMatchObject({ code: ConnectorErrorCodes.InvalidResponse });
    });

    it('should throw InvalidConfig when credentials are missing', async () => {
      const sendMessage = await createSendMessage();

      await expect(
        sendMessage(
          { to: '96550000000', type: TemplateType.Generic, payload: { code: '1234' } },
          { templates: mockedConfig.templates }
        )
      ).rejects.toMatchObject({ code: ConnectorErrorCodes.InvalidConfig });
    });
  });
});
