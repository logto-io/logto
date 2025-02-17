import { type CreateEmailTemplate, TemplateType } from '@logto/schemas';

export type MockEmailTemplatePayload = Omit<CreateEmailTemplate, 'id'>;

export const mockEmailTemplates: MockEmailTemplatePayload[] = [
  {
    languageTag: 'en',
    templateType: TemplateType.SignIn,
    details: {
      subject: 'Sign In',
      content: 'Sign in to your account',
      contentType: 'text/html',
    },
  },
  {
    languageTag: 'en',
    templateType: TemplateType.Register,
    details: {
      subject: 'Register',
      content: 'Register for an account',
      contentType: 'text/html',
    },
  },
  {
    languageTag: 'de',
    templateType: TemplateType.SignIn,
    details: {
      subject: 'Sign In',
      content: 'Sign in to your account',
      contentType: 'text/plain',
    },
  },
];
