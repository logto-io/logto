import { shouldShowOssTenantSettingsTab } from './utils';

describe('shouldShowOssTenantSettingsTab', () => {
  const options = {
    isCloud: false,
    isMandatoryMfaEntitled: true,
    isMfaRequired: false,
  };

  it('shows the tab when the license grants mandatory MFA', () => {
    expect(shouldShowOssTenantSettingsTab(options)).toBe(true);
  });

  it('hides the tab without the entitlement', () => {
    expect(shouldShowOssTenantSettingsTab({ ...options, isMandatoryMfaEntitled: false })).toBe(
      false
    );
  });

  it('keeps the tab while MFA is required, so it can be turned off after the license lapses', () => {
    expect(
      shouldShowOssTenantSettingsTab({
        ...options,
        isMandatoryMfaEntitled: false,
        isMfaRequired: true,
      })
    ).toBe(true);
  });

  it('hides the tab on cloud', () => {
    expect(shouldShowOssTenantSettingsTab({ ...options, isCloud: true })).toBe(false);
  });
});
