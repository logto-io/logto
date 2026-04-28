import { AccountCenterControlValue } from '@logto/schemas';

import {
  disableAccountCenter,
  getAccountCenter,
  updateAccountCenter,
} from '#src/api/account-center.js';

describe('account center', () => {
  beforeAll(async () => {
    await disableAccountCenter();
  });

  it('should get account center successfully', async () => {
    const accountCenter = await getAccountCenter();

    expect(accountCenter).toBeTruthy();
  });

  it('should update account center successfully', async () => {
    const accountCenter = {
      enabled: true,
      fields: {
        username: AccountCenterControlValue.Edit,
      },
      webauthnRelatedOrigins: ['https://example.com'],
    };

    const updatedAccountCenter = await updateAccountCenter(accountCenter);
    expect(updatedAccountCenter).toMatchObject(accountCenter);
  });

  it('should clear delete account url with empty string', async () => {
    const updatedAccountCenter = await updateAccountCenter({
      deleteAccountUrl: 'https://example.com/delete-account',
    });

    expect(updatedAccountCenter.deleteAccountUrl).toBe('https://example.com/delete-account');

    const clearedAccountCenter = await updateAccountCenter({
      deleteAccountUrl: '',
    });

    expect(clearedAccountCenter.deleteAccountUrl).toBeNull();
  });
});
