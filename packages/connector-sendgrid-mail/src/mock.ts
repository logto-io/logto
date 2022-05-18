import {
  Content,
  ContextType,
  EmailData,
  Personalization,
  PublicParameters,
  SendGridMailConfig,
} from './types';

const receivers: EmailData[] = [{ email: 'foo@logto.io' }];
const sender: EmailData = { email: 'noreply@logto.test.io', name: 'Logto Test' };
export const mockedParameters: PublicParameters = {
  personalizations: [{ to: receivers }] as Personalization[],
  from: sender,
  subject: 'Test SendGrid Mail',
  content: [{ type: 'text/plain', value: 'This is a test template.' }] as Content[],
};

export const mockedApiKey = 'apikey';

export const mockedConfig: SendGridMailConfig = {
  apiKey: mockedApiKey,
  fromEmail: 'noreply@logto.test.io',
  templates: [
    {
      usageType: 'Test',
      type: ContextType.Text,
      subject: 'Logto Test Template',
      content: 'This is for testing purposes only. Your passcode is {{code}}.',
    },
  ],
};
