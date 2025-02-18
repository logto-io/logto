import { TemplateType } from '@logto/connector-kit';

import { mockedConfigWithAllRequiredTemplates, mockGenericI18nEmailTemplate } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfigWithAllRequiredTemplates);

const singleSendMail = vi.fn(() => ({
  body: JSON.stringify({ EnvId: 'env-id', RequestId: 'request-id' }),
  statusCode: 200,
}));

const getI18nEmailTemplate = vi.fn().mockResolvedValue(mockGenericI18nEmailTemplate);

vi.mock('./single-send-mail.js', () => ({
  singleSendMail,
}));

const { default: createConnector } = await import('./index.js');

describe('sendMessage()', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call singleSendMail() with correct template and content', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: 'to@email.com',
      type: TemplateType.SignIn,
      payload: { code: '1234' },
    });
    expect(singleSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        HtmlBody: 'Your sign-in code is 1234, 1234 is your code',
        Subject: 'Sign-in code 1234',
      }),
      expect.anything()
    );
  });

  it('should call singleSendMail() with correct template and content (2)', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: 'to@email.com',
      type: TemplateType.OrganizationInvitation,
      payload: { code: '1234', link: 'https://example.com' },
    });
    expect(singleSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        HtmlBody: 'Your link is https://example.com',
        Subject: 'Organization invitation',
      }),
      expect.anything()
    );
  });

  it('should call singleSendMail() with custom template', async () => {
    const toEmail = 'to@email.com';
    const connector = await createConnector({ getConfig, getI18nEmailTemplate });
    await connector.sendMessage({
      to: toEmail,
      type: TemplateType.Generic,
      payload: { code: '1234', applicationName: 'bar' },
    });
    expect(singleSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        HtmlBody: 'Verification code is 1234',
        Subject: 'Generic email',
        FromAlias: 'Foo bar',
      }),
      expect.anything()
    );
  });
});
