import { type AdminConsoleKey } from '@logto/phrases';
import { type CaptchaType } from '@logto/schemas';

type FormField = 'siteKey' | 'secretKey' | 'projectId' | 'domain' | 'mode';

export type CaptchaProviderMetadata = {
  name: AdminConsoleKey;
  type: CaptchaType;
  logo: SvgComponent;
  logoDark: SvgComponent;
  description: AdminConsoleKey;
  readme: string;
  requiredFields: Array<{
    field: FormField;
    label: AdminConsoleKey;
    placeholder: AdminConsoleKey;
    isOptional?: boolean;
  }>;
};
