import { TemplateType } from '@logto/connector-kit';

import { mockedConfig } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConfig);
const sendEmailWithTemplate = vi.fn();
vi.mock('postmark', () => ({
  ServerClient: vi.fn(() => ({
    sendEmailWithTemplate,
  })),
}));

const { default: createConnector } = await import('./index.js');

describe('Postmark connector', () => {
  it('init without throwing errors', async () => {
    await expect(createConnector({ getConfig })).resolves.not.toThrow();
  });

  describe('sendMessage()', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should call sendEmailWithTemplate() with correct template and content', async () => {
      const connector = await createConnector({ getConfig });
      await connector.sendMessage({
        to: 'to@email.com',
        type: TemplateType.SignIn,
        payload: { code: '1234' },
      });
      expect(sendEmailWithTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          From: mockedConfig.fromEmail,
          TemplateAlias: 'logto-sign-in',
          To: 'to@email.com',
          TemplateModel: { code: '1234' },
        })
      );
    });
  });
});
