import type { AdminConsoleData } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockAdminConsoleData } from '#src/__mocks__/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const logtoConfigs = {
  getAdminConsoleConfig: async () => ({ value: mockAdminConsoleData }),
  updateAdminConsoleConfig: async (data: Partial<AdminConsoleData>) => ({
    value: {
      ...mockAdminConsoleData,
      ...data,
    },
  }),
};

const settingRoutes = await pickDefault(import('./logto-config.js'));

describe('configs routes', () => {
  const roleRequester = createRequester({
    authedRoutes: settingRoutes,
    tenantContext: new MockTenant(undefined, { logtoConfigs }),
  });

  it('GET /configs/admin-console', async () => {
    const response = await roleRequester.get('/configs/admin-console');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockAdminConsoleData);
  });

  it('PATCH /configs/admin-console', async () => {
    const livePreviewChecked = !mockAdminConsoleData.livePreviewChecked;
    const response = await roleRequester
      .patch('/configs/admin-console')
      .send({ demoChecked: livePreviewChecked });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ ...mockAdminConsoleData, demoChecked: livePreviewChecked });
  });
});
