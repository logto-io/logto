import { type AdminConsoleKey } from '@logto/phrases';
import { type CaptchaType } from '@logto/schemas';

export type CaptchaProviderMetadata = {
  name: AdminConsoleKey;
  type: CaptchaType;
  logo: SvgComponent;
  logoDark: SvgComponent;
  description: AdminConsoleKey;
  readme: string;
  requiredFields: Array<'siteKey' | 'secretKey' | 'projectId'>;
};
