import { assert } from '@silverhand/essentials';

import { ConnectorErrorCodes, TemplateType } from '@logto/connector-kit';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPConnection from 'nodemailer/lib/smtp-connection';

import createConnector from './index.js';
import {
  mockedConfig,
  mockedOauth2AuthWithKey,
  mockedOauth2AuthWithToken,
  mockedTlsOptionsWithTls,
} from './mock.js';

// Transports are built by the real nodemailer. Stubbing the send step keeps them from connecting
// or spawning anything.
const sendMail = vi.spyOn(Mail.prototype, 'sendMail').mockResolvedValue();
const createTransport = vi.spyOn(nodemailer, 'createTransport');

const message = { to: 'foo', type: TemplateType.Generic, payload: { code: '123456' } };

const buildTransport = async (config: Record<string, unknown>, inputConfig?: unknown) => {
  const connector = await createConnector({ getConfig: vi.fn().mockResolvedValue(config) });
  await connector.sendMessage(message, inputConfig);

  const result = createTransport.mock.results.at(-1);
  assert(result?.type === 'return', new Error('Expected a transport to be created'));

  return result.value;
};

const usesImplicitTls = ({ options }: { options: SMTPConnection.Options }) =>
  new SMTPConnection(options).secureConnection;

describe('SMTP transport options', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('undeclared options', () => {
    it.each([
      { sendmail: true },
      { sendmail: true, path: '/bin/echo', args: ['-x'] },
      { pool: true },
      { jsonTransport: true },
      { url: 'smtp://other.test:2525' },
      { proxy: 'http://proxy.test:3128' },
    ])('do not affect the transport: %j', async (undeclaredOptions) => {
      const expected = await buildTransport(mockedConfig);
      const mail = await buildTransport({ ...mockedConfig, ...undeclaredOptions });

      expect(mail.transporter).toMatchObject({
        name: 'SMTP',
        options: { host: mockedConfig.host, port: mockedConfig.port },
      });
      expect(mail.options).toEqual(expected.options);
      expect(mail).not.toHaveProperty('getSocket');
    });

    it('do not affect the transport when passed to sendMessage', async () => {
      const expected = await buildTransport(mockedConfig);
      const mail = await buildTransport(mockedConfig, {
        ...mockedConfig,
        sendmail: true,
        path: '/bin/echo',
        args: ['-x'],
      });

      expect(mail.transporter).toMatchObject({ name: 'SMTP' });
      expect(mail.options).toEqual(expected.options);
    });
  });

  describe('declared options', () => {
    it('keeps login auth', async () => {
      const auth = { type: 'login', user: '<username>', pass: '<password>' };
      const mail = await buildTransport({ ...mockedConfig, auth });

      expect(mail.transporter).toMatchObject({
        options: { auth },
        auth: {
          type: 'LOGIN',
          user: auth.user,
          credentials: { user: auth.user, pass: auth.pass },
        },
      });
    });

    it('keeps the password when login auth has other keys', async () => {
      const auth = { user: '<username>', pass: '<password>', method: 'PLAIN' };
      const mail = await buildTransport({ ...mockedConfig, auth });

      expect(mail.transporter).toMatchObject({
        auth: { type: 'LOGIN', credentials: { user: auth.user, pass: auth.pass } },
      });
    });

    it.each([{}, { type: 'login' }])('keeps relay auth without credentials: %j', async (auth) => {
      const mail = await buildTransport({ ...mockedConfig, auth });

      expect(mail.transporter).toMatchObject({ options: { auth } });
    });

    it.each([mockedOauth2AuthWithToken, { ...mockedOauth2AuthWithKey, type: 'oauth2' }])(
      'keeps oauth2 auth: %j',
      async (auth) => {
        const mail = await buildTransport({ ...mockedConfig, auth });

        expect(mail.transporter).toMatchObject({
          options: { auth },
          auth: { type: 'OAUTH2', method: 'XOAUTH2', user: auth.user },
        });
      }
    );

    it.each([
      { options: { port: 465 }, implicitTls: true },
      { options: { port: 465, secure: false }, implicitTls: false },
      { options: { port: 587 }, implicitTls: false },
      { options: { port: 587, secure: true }, implicitTls: true },
    ])('resolves TLS mode: %j', async ({ options, implicitTls }) => {
      const mail = await buildTransport({ ...mockedConfig, ...options });

      expect(usesImplicitTls(mail)).toBe(implicitTls);
    });

    it('keeps TLS options', async () => {
      const mail = await buildTransport({ ...mockedConfig, ...mockedTlsOptionsWithTls });

      expect(mail.transporter).toMatchObject({ options: mockedTlsOptionsWithTls });
    });

    it('drops only `path` from TLS options', async () => {
      const mail = await buildTransport({
        ...mockedConfig,
        tls: { path: '/tmp/smtp.sock', rejectUnauthorized: true, servername: '<servername>' },
      });

      expect(mail.transporter).toMatchObject({ name: 'SMTP' });
      expect(mail.options.tls).toEqual({ rejectUnauthorized: true, servername: '<servername>' });
    });

    it('keeps only the declared DKIM fields', async () => {
      const dkim = {
        domainName: 'test.smtp',
        keySelector: '<selector>',
        privateKey: '<private-key>',
      };
      const mail = await buildTransport({
        ...mockedConfig,
        dkim: { ...dkim, cacheDir: '/tmp/dkim-cache', hashAlgo: 'sha1' },
      });

      expect(mail.options.dkim).toEqual(dkim);
      expect(mail.dkim).toMatchObject({ keys: [dkim] });
    });

    it('keeps custom headers', async () => {
      const customHeaders = { 'X-Test': 'test', 'X-Test-Another': ['test1', 'test2'] };
      const mail = await buildTransport({ ...mockedConfig, customHeaders });

      expect(mail.transporter).toMatchObject({ name: 'SMTP' });
      expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ headers: customHeaders }));
    });
  });

  it('rejects an invalid config before creating a transport', async () => {
    const connector = await createConnector({
      getConfig: vi.fn().mockResolvedValue({ ...mockedConfig, port: 'not-a-number' }),
    });

    await expect(connector.sendMessage(message)).rejects.toMatchObject({
      code: ConnectorErrorCodes.InvalidConfig,
    });
    expect(createTransport).not.toHaveBeenCalled();
  });
});
