import { AccountCenterControlValue } from '@logto/schemas';

import { enableAllAccountCenterFields, updateAccountCenter } from '#src/api/account-center.js';
import { updateUser as updateUserByAdmin } from '#src/api/admin-user.js';
import { updatePassword } from '#src/api/my-account.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  createDefaultTenantUserWithPassword,
  deleteDefaultTenantUser,
  initClientAndSignInForDefaultTenant,
  signInAndGetUserApi,
} from '#src/helpers/profile.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail, generatePassword } from '#src/utils.js';

const removeUserPassword = async (userId: string) => {
  await updateUserByAdmin(userId, {
    passwordEncrypted: null,
    passwordEncryptionMethod: null,
  });
};

const createSignedInUser = async ({ primaryEmail }: { primaryEmail?: string } = {}) => {
  const { user, username, password } = await createDefaultTenantUserWithPassword({ primaryEmail });
  const api = await signInAndGetUserApi(username, password);

  return { api, user, username };
};

describe('account initial password setup', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await enableAllAccountCenterFields();
  });

  it('should fail if verification record is missing for a user with an existing password', async () => {
    const { api, user } = await createSignedInUser();

    try {
      await expectRejects(updatePassword(api, undefined, generatePassword()), {
        code: 'verification_record.permission_denied',
        status: 401,
      });
    } finally {
      await deleteDefaultTenantUser(user.id);
    }
  });

  it('should be able to set initial password without verification when no security verification method is available', async () => {
    const { api, user, username } = await createSignedInUser();
    const newPassword = generatePassword();

    try {
      await removeUserPassword(user.id);
      await updatePassword(api, undefined, newPassword);

      await initClientAndSignInForDefaultTenant(username, newPassword);
    } finally {
      await deleteDefaultTenantUser(user.id);
    }
  });

  it('should reject weak initial password without verification', async () => {
    const { api, user } = await createSignedInUser();

    try {
      await removeUserPassword(user.id);

      await expectRejects(updatePassword(api, undefined, '123456'), {
        code: 'password.rejected',
        status: 422,
      });
    } finally {
      await deleteDefaultTenantUser(user.id);
    }
  });

  it('should fail initial password setup if the password field is not editable', async () => {
    const { api, user } = await createSignedInUser();

    try {
      await removeUserPassword(user.id);
      await updateAccountCenter({
        fields: {
          password: AccountCenterControlValue.ReadOnly,
        },
      });

      await expectRejects(updatePassword(api, undefined, generatePassword()), {
        code: 'account_center.field_not_editable',
        status: 400,
      });
    } finally {
      await Promise.all([enableAllAccountCenterFields(), deleteDefaultTenantUser(user.id)]);
    }
  });

  it('should require verification for a user with primary email but no password', async () => {
    const { api, user } = await createSignedInUser({ primaryEmail: generateEmail() });

    try {
      await removeUserPassword(user.id);

      await expectRejects(updatePassword(api, undefined, generatePassword()), {
        code: 'verification_record.permission_denied',
        status: 401,
      });
    } finally {
      await deleteDefaultTenantUser(user.id);
    }
  });
});
