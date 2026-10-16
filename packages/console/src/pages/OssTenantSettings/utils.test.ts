import { shouldShowOssTenantSettingsTab } from './utils';

describe('shouldShowOssTenantSettingsTab', () => {
  it('shows the tab on a self-hosted deployment without a license', () => {
    expect(shouldShowOssTenantSettingsTab({ isCloud: false })).toBe(true);
  });

  it('hides the tab on cloud', () => {
    expect(shouldShowOssTenantSettingsTab({ isCloud: true })).toBe(false);
  });
});
