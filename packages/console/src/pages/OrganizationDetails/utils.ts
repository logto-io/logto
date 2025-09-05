import { generateDarkColor } from '@logto/core-kit';
import { defaultPrimaryColor, type Organization } from '@logto/schemas';

import { type Option } from '@/ds-components/Select/MultiSelect';
import { emptyBranding } from '@/types/sign-in-experience';
import { removeFalsyValues } from '@/utils/object';

export type FormData = Partial<Omit<Organization, 'customData'> & { customData: string }> & {
  jitEmailDomains: string[];
  jitRoles: Array<Option<string>>;
  jitSsoConnectorIds: string[];
  isBrandingEnabled: boolean;
};

export const normalizeData = (
  data: Organization,
  jit?: { emailDomains: string[]; roles: Array<Option<string>>; ssoConnectorIds: string[] }
): FormData => ({
  ...data,
  branding: {
    ...emptyBranding,
    ...data.branding,
  },
  color: {
    primaryColor: data.color.primaryColor ?? defaultPrimaryColor,
    darkPrimaryColor: data.color.darkPrimaryColor ?? generateDarkColor(defaultPrimaryColor),
  },
  jitEmailDomains: jit?.emailDomains ?? [],
  jitRoles: jit?.roles ?? [],
  jitSsoConnectorIds: jit?.ssoConnectorIds ?? [],
  customData: JSON.stringify(data.customData, undefined, 2),
  isBrandingEnabled:
    Object.keys(data.branding).length > 0 ||
    Object.keys(data.color).length > 0 ||
    Boolean(data.customCss),
});

export const assembleData = ({
  jitEmailDomains,
  jitRoles,
  jitSsoConnectorIds,
  customData,
  branding,
  color,
  customCss,
  isBrandingEnabled,
  ...data
}: Partial<FormData>): Partial<Organization> => ({
  ...data,
  ...(isBrandingEnabled
    ? { color, branding: branding && removeFalsyValues(branding), customCss }
    : { color: {}, branding: {}, customCss: '' }),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  customData: JSON.parse(customData ?? '{}'),
});
