import { Setting, CreateSetting } from '@logto/schemas';

import { mockSetting } from '@/utils/mock';
import { createRequester } from '@/utils/test-utils';

import settingRoutes from './setting';

jest.mock('@/queries/setting', () => ({
  getSetting: jest.fn(async (): Promise<Setting> => mockSetting),
  updateSetting: jest.fn(
    async (data: Partial<CreateSetting>): Promise<Setting> => ({
      ...mockSetting,
      ...data,
    })
  ),
}));

describe('settings routes', () => {
  const roleRequester = createRequester(settingRoutes);

  it('GET /settings', async () => {
    const response = await roleRequester.get('/settings');
    expect(response.status).toEqual(200);
    const { id, ...rest } = mockSetting;
    expect(response.body).toEqual(rest);
  });

  it('PATCH /settings', async () => {
    const customDomain = 'silverhand-logto.io';
    const adminConsole = {
      applicationSkipGetStarted: true,
    };

    const response = await roleRequester.patch('/settings').send({
      customDomain,
      adminConsole,
    });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockSetting,
      customDomain,
      adminConsole,
    });
  });
});
