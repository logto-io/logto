import { type Organization } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import { type Option } from '@/ds-components/Select/MultiSelect';
import { removeFalsyValues } from '@/utils/object';

export type FormData = Partial<Omit<Organization, 'customData'> & { customData: string }> & {
  jitEmailDomains: string[];
  jitRoles: Array<Option<string>>;
  jitSsoConnectorIds: string[];
};

export const isJsonObject = (value: string) => {
  const parsed = trySafe<unknown>(() => JSON.parse(value));
  return Boolean(parsed && typeof parsed === 'object');
};

export const normalizeData = (
  data: Organization,
  jit: { emailDomains: string[]; roles: Array<Option<string>>; ssoConnectorIds: string[] }
): FormData => ({
  ...data,
  jitEmailDomains: jit.emailDomains,
  jitRoles: jit.roles,
  jitSsoConnectorIds: jit.ssoConnectorIds,
  customData: JSON.stringify(data.customData, undefined, 2),
});

export const assembleData = ({
  jitEmailDomains,
  jitRoles,
  jitSsoConnectorIds,
  customData,
  branding,
  ...data
}: FormData): Partial<Organization> => ({
  ...data,
  branding: branding && removeFalsyValues(branding),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  customData: JSON.parse(customData ?? '{}'),
});
