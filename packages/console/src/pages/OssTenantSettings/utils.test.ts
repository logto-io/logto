import type { TFuncKey } from 'i18next';

import { getOssTenantMembersUpsellCopyKeys, shouldShowOssTenantMembersTab } from './utils';

describe('shouldShowOssTenantMembersTab', () => {
  it('returns true for OSS', () => {
    expect(shouldShowOssTenantMembersTab({ isCloud: false })).toBe(true);
  });

  it('returns false for cloud', () => {
    expect(shouldShowOssTenantMembersTab({ isCloud: true })).toBe(false);
  });
});

describe('getOssTenantMembersUpsellCopyKeys', () => {
  it('uses dedicated i18n keys for the OSS members upsell card copy', () => {
    const copyKeys = getOssTenantMembersUpsellCopyKeys({ isDevFeaturesEnabled: false });
    const titleKey: TFuncKey<'translation', 'admin_console'> = copyKeys.title;
    const descriptionKey: TFuncKey<'translation', 'admin_console'> = copyKeys.description;
    const actionKey: TFuncKey<'translation', 'admin_console'> = copyKeys.action;

    expect({ title: titleKey, description: descriptionKey, action: actionKey }).toEqual({
      title: 'tenants.members.card_title',
      description: 'tenants.members.card_description',
      action: 'tenants.members.card_action',
    });
  });

  it('uses self-hosted plans copy when the self-hosted plans feature is enabled', () => {
    const copyKeys = getOssTenantMembersUpsellCopyKeys({ isDevFeaturesEnabled: true });
    const titleKey: TFuncKey<'translation', 'admin_console'> = copyKeys.title;
    const descriptionKey: TFuncKey<'translation', 'admin_console'> = copyKeys.description;
    const actionKey: TFuncKey<'translation', 'admin_console'> = copyKeys.action;

    expect({ title: titleKey, description: descriptionKey, action: actionKey }).toEqual({
      title: 'tenants.members.self_hosted_card_title',
      description: 'tenants.members.self_hosted_card_description',
      action: 'tenants.members.self_hosted_card_action',
    });
  });
});
