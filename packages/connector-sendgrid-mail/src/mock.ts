import {
  Content,
  ContextType,
  EmailData,
  Personalization,
  PublicParameters,
  SendGridMailConfig,
} from './types';

const toEmailData: EmailData = { email: 'foo@logto.io' };
const fromEmailData: EmailData = { email: 'noreply@logto.test.io', name: 'Logto Test' };
export const mockedParameters: PublicParameters = {
  personalizations: [{ to: toEmailData }] as Personalization[],
  from: fromEmailData,
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
      type: ContextType.TEXT,
      subject: 'Logto Test Template',
      content: 'This is for testing purposes only. Your passcode is {{code}}.',
    },
  ],
};
