import type {
  Content,
  EmailData,
  Personalization,
  PublicParameters,
  SendGridMailConfig,
} from './types.js';
import { ContextType } from './types.js';

const receivers: EmailData[] = [{ email: 'foo@logto.io' }];
const sender: EmailData = { email: 'noreply@logto.test.io', name: 'Logto Test' };
const personalizations: Personalization[] = [{ to: receivers }];
const content: Content[] = [{ type: ContextType.Text, value: 'This is a test template.' }];

export const mockedParameters: PublicParameters = {
  personalizations,
  from: sender,
  subject: 'Test SendGrid Mail',
  content,
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
      content: 'This is for testing purposes only. Your verification code is {{code}}.',
    },
  ],
};
