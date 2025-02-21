import type {
  Content,
  EmailData,
  Personalization,
  PublicParameters,
  SendGridMailConfig,
} from './types.js';
import { ContextType } from './types.js';

export const toEmail = 'foo@logto.io';
export const fromEmail = 'noreply@logto.test.io';
export const fromName = 'Logto Test';

const receivers: EmailData[] = [{ email: toEmail }];
const sender: EmailData = { email: fromEmail, name: fromName };
const personalizations: Personalization[] = [{ to: receivers }];
const content: Content[] = [
  {
    type: ContextType.Text,
    value: 'Your Logto verification code is 123456. The code will remain active for 10 minutes.',
  },
];

export const mockedGenericEmailParameters: PublicParameters = {
  personalizations,
  from: sender,
  subject: 'Logto Generic Template',
  content,
};

export const mockedApiKey = 'apikey';

export const mockedConfig: SendGridMailConfig = {
  apiKey: mockedApiKey,
  fromEmail,
  fromName,
  templates: [
    {
      usageType: 'SignIn',
      type: ContextType.Text,
      subject: 'Logto SignIn Template',
      content:
        'Your Logto sign-in verification code is {{code}}. The code will remain active for 10 minutes.',
    },
    {
      usageType: 'Register',
      type: ContextType.Text,
      subject: 'Logto Register Template',
      content:
        'Your Logto sign-up verification code is {{code}}. The code will remain active for 10 minutes.',
    },
    {
      usageType: 'ForgotPassword',
      type: ContextType.Text,
      subject: 'Logto ForgotPassword Template',
      content:
        'Your Logto password change verification code is {{code}}. The code will remain active for 10 minutes.',
    },
    {
      usageType: 'Generic',
      type: ContextType.Text,
      subject: 'Logto Generic Template',
      content:
        'Your Logto verification code is {{code}}. The code will remain active for 10 minutes.',
    },
  ],
};
