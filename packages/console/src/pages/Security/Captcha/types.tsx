import { type RecaptchaEnterpriseMode } from '@logto/schemas';

export type CaptchaFormType = {
  siteKey: string;
  secretKey: string;
  projectId: string;
  domain?: string;
  mode?: RecaptchaEnterpriseMode;
};
