import { type IdTokenConfig } from '@logto/schemas';

import { getIdTokenConfig, upsertIdTokenConfig } from '#src/api/index.js';
import { devFeatureTest } from '#src/utils.js';

const defaultIdTokenConfig: IdTokenConfig = {
  enabledExtendedClaims: ['roles', 'organizations', 'organization_roles'],
};

devFeatureTest.describe('id token config', () => {
  devFeatureTest.it('should get id token config successfully', async () => {
    const config = await getIdTokenConfig();
    expect(config).toMatchObject(defaultIdTokenConfig);
  });

  devFeatureTest.it('should update id token config successfully', async () => {
    const newConfig: IdTokenConfig = {
      enabledExtendedClaims: ['custom_data', 'identities', 'roles'],
    };

    const updatedConfig = await upsertIdTokenConfig(newConfig);
    expect(updatedConfig).toMatchObject(newConfig);

    // Verify the update persisted
    const fetchedConfig = await getIdTokenConfig();
    expect(fetchedConfig).toMatchObject(newConfig);

    // Restore default config
    await upsertIdTokenConfig(defaultIdTokenConfig);
  });
});
