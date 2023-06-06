import { CustomDomainProgress, type AdminConsoleData } from '@logto/schemas';

import { getAdminConsoleConfig, updateAdminConsoleConfig } from '#src/api/index.js';

const defaultAdminConsoleConfig: AdminConsoleData = {
  livePreviewChecked: false,
  applicationCreated: false,
  signInExperienceCustomized: false,
  passwordlessConfigured: false,
  furtherReadingsChecked: false,
  roleCreated: false,
  communityChecked: false,
  m2mApplicationCreated: false,
  customDomainProgress: CustomDomainProgress.NotStarted,
};

describe('admin console sign-in experience', () => {
  it('should get admin console config successfully', async () => {
    const adminConsoleConfig = await getAdminConsoleConfig();

    expect(adminConsoleConfig).toBeTruthy();
  });

  it('should update admin console config successfully', async () => {
    const newAdminConsoleConfig = {
      m2mApplicationCreated: true,
      passwordlessConfigured: true,
      signInExperienceCustomized: true,
    };

    const updatedAdminConsoleConfig = await updateAdminConsoleConfig(newAdminConsoleConfig);
    expect(updatedAdminConsoleConfig).toMatchObject({
      ...defaultAdminConsoleConfig,
      ...newAdminConsoleConfig,
    });
  });
});
