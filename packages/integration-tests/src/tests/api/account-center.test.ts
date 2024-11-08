import { AccountCenterControlValue } from '@logto/schemas';

import { getAccountCenter, updateAccountCenter } from '#src/api/account-center.js';
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('account center', () => {
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
    };

    const updatedAccountCenter = await updateAccountCenter(accountCenter);
    expect(updatedAccountCenter).toMatchObject(accountCenter);
  });
});
