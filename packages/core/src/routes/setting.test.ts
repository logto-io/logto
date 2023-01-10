import type { Setting, CreateSetting } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockSetting } from '#src/__mocks__/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const settings = {
  getSetting: async (): Promise<Setting> => mockSetting,
  updateSetting: async (data: Partial<CreateSetting>): Promise<Setting> => ({
    ...mockSetting,
    ...data,
  }),
};

const settingRoutes = await pickDefault(import('./setting.js'));

describe('settings routes', () => {
  const roleRequester = createRequester({
    authedRoutes: settingRoutes,
    tenantContext: new MockTenant(undefined, { settings }),
  });

  it('GET /settings', async () => {
    const response = await roleRequester.get('/settings');
    expect(response.status).toEqual(200);
    const { id, ...rest } = mockSetting;
    expect(response.body).toEqual(rest);
  });

  it('PATCH /settings', async () => {
    const { adminConsole } = mockSetting;

    const response = await roleRequester.patch('/settings').send({
      adminConsole,
    });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      adminConsole,
    });
  });
});
