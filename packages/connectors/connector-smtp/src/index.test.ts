import { VerificationCodeType } from '@logto/connector-kit';
import type { Transporter } from 'nodemailer';
import nodemailer from 'nodemailer';

import createConnector from './index.js';
import {
  mockedConfig,
  mockedOauth2AuthWithKey,
  mockedOauth2AuthWithToken,
  mockedTlsOptionsWithTls,
  mockedTlsOptionsWithoutTls,
  mockedConnectionOptionsValid,
  mockedConnectionOptionsInvalid,
  mockedDebuggingOptions,
  mockedSecurityOptions,
} from './mock.js';
import { smtpConfigGuard } from './types.js';

const { jest } = import.meta;

const getConfig = jest.fn().mockResolvedValue(mockedConfig);

const sendMail = jest.fn();

// @ts-expect-error for testing
jest.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail } as Transporter);

describe('SMTP connector', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('init without throwing errors', async () => {
    await expect(createConnector({ getConfig })).resolves.not.toThrow();
  });

  it('should send mail with proper options', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: 'foo',
      type: VerificationCodeType.Register,
      payload: { code: '123456' },
    });

    expect(sendMail).toHaveBeenCalledWith({
      from: '<notice@test.smtp>',
      subject: 'Logto Register with SMTP',
      text: 'This is for register purposes only. Your verification code is 123456.',
      to: 'foo',
    });
  });

  it('should send mail with proper subject', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: 'bar',
      type: VerificationCodeType.SignIn,
      payload: { code: '234567' },
    });

    expect(sendMail).toHaveBeenCalledWith({
      from: '<notice@test.smtp>',
      subject: 'Logto Sign-In with SMTP 234567',
      text: 'This is for sign-in purposes only. Your verification code is 234567.',
      to: 'bar',
    });
  });
});

describe('Test config guard', () => {
  it('basic config', () => {
    const result = smtpConfigGuard.safeParse(mockedConfig);
    expect(result.success && result.data).toMatchObject(expect.objectContaining(mockedConfig));
  });

  it('config with oauth2 auth (private key needed)', () => {
    const testConfig = { ...mockedConfig, auth: mockedOauth2AuthWithKey };
    const result = smtpConfigGuard.safeParse(testConfig);
    expect(result.success && result.data).toMatchObject(expect.objectContaining(testConfig));
  });

  it('config with oauth2 auth (token needed)', () => {
    const testConfig = { ...mockedConfig, auth: mockedOauth2AuthWithToken };
    const result = smtpConfigGuard.safeParse(testConfig);
    expect(result.success && result.data).toMatchObject(expect.objectContaining(testConfig));
  });

  it('config with tls options (with additional `tls` configuration)', () => {
    const testConfig = { ...mockedConfig, ...mockedTlsOptionsWithTls };
    const result = smtpConfigGuard.safeParse(testConfig);
    expect(result.success && result.data).toMatchObject(
      expect.objectContaining(mockedTlsOptionsWithTls)
    );
  });

  it('config with tls options (without additional `tls` configuration)', () => {
    const testConfig = { ...mockedConfig, ...mockedTlsOptionsWithoutTls };
    const result = smtpConfigGuard.safeParse(testConfig);
    expect(result.success && result.data).toMatchObject(expect.objectContaining(mockedConfig));
  });

  it('config with VALID connection options', () => {
    const testConfig = { ...mockedConfig, ...mockedConnectionOptionsValid };
    const result = smtpConfigGuard.safeParse(testConfig);
    expect(result.success && result.data).toMatchObject(expect.objectContaining(testConfig));
  });

  it('config with INVALID connection options', () => {
    const testConfig = { ...mockedConfig, ...mockedConnectionOptionsInvalid };
    const result = smtpConfigGuard.safeParse(testConfig);
    expect(result.success && result.data).toMatchObject(expect.objectContaining(mockedConfig));
  });

  it('config with debugging and security options', () => {
    const testConfig = {
      ...mockedConfig,
      ...mockedDebuggingOptions,
      ...mockedSecurityOptions,
    };
    const result = smtpConfigGuard.safeParse(testConfig);
    expect(result.success && result.data).toMatchObject(expect.objectContaining(testConfig));
  });
});
