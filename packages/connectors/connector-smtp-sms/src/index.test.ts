import { TemplateType } from '@logto/connector-kit';
import type { Transporter } from 'nodemailer';
import nodemailer from 'nodemailer';

import createConnector from './index.js';
import { mockedConfig } from './mock.js';
import { smtpSmsConfigGuard } from './types.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);
const sendMail = vi.fn();

// @ts-expect-error for testing
vi.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail } as Transporter);

describe('SMTP SMS connector', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should init without throwing errors', async () => {
    await expect(createConnector({ getConfig })).resolves.not.toThrow();
  });

  it('should send mail to the gateway address derived from phone number', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: '+12025551234',
      type: TemplateType.SignIn,
      payload: { code: '123456' },
    });

    expect(sendMail).toHaveBeenCalledWith({
      from: 'notifications@example.com',
      to: '12025551234@txt.att.net',
      subject: 'Verification Code',
      text: 'Your Logto sign-in verification code is 123456. Expires in 10 minutes.',
    });
  });

  it('should support {{phone}} placeholder (raw number with +)', async () => {
    const connector = await createConnector({
      getConfig: vi.fn().mockResolvedValue({
        ...mockedConfig,
        toEmailTemplate: '{{phone}}@sms.example.com',
      }),
    });
    await connector.sendMessage({
      to: '+12025551234',
      type: TemplateType.Generic,
      payload: { code: '654321' },
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: '+12025551234@sms.example.com' })
    );
  });

  it('should omit subject when not configured', async () => {
    const connector = await createConnector({
      getConfig: vi.fn().mockResolvedValue({
        ...mockedConfig,
        subject: undefined,
      }),
    });
    await connector.sendMessage({
      to: '+12025551234',
      type: TemplateType.SignIn,
      payload: { code: '111222' },
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.not.objectContaining({ subject: expect.anything() })
    );
  });

  it('should fall back to Generic template when the specific type is not found', async () => {
    // MfaVerification is not in mockedConfig.templates; Generic should be used instead.
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: '+12025551234',
      type: TemplateType.MfaVerification,
      payload: { code: '000000' },
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        text: 'Your Logto verification code is 000000. Expires in 10 minutes.',
      })
    );
  });

  it('should wrap nodemailer errors in a ConnectorError', async () => {
    sendMail.mockRejectedValueOnce(new Error('Connection refused'));
    const connector = await createConnector({ getConfig });

    await expect(
      connector.sendMessage({
        to: '+12025551234',
        type: TemplateType.Register,
        payload: { code: '999999' },
      })
    ).rejects.toThrow('Connection refused');
  });
});

describe('SMTP SMS config guard', () => {
  it('should accept a valid config', () => {
    const result = smtpSmsConfigGuard.safeParse(mockedConfig);
    expect(result.success).toBe(true);
  });

  it('should reject a config missing required template usageTypes', () => {
    const result = smtpSmsConfigGuard.safeParse({
      ...mockedConfig,
      templates: [{ usageType: 'Generic', content: 'code: {{code}}' }],
    });
    expect(result.success).toBe(false);
  });

  it('should reject a config missing toEmailTemplate', () => {
    const { toEmailTemplate: _, ...rest } = mockedConfig;
    const result = smtpSmsConfigGuard.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
