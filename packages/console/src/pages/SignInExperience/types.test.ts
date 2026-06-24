import { AccountCenterControlValue, type AccountCenterFieldControl } from '@logto/schemas';

import { normalizeAccountCenterFieldsForSubmit, type AccountCenterFormValues } from './types';

const createAccountCenterFields = (
  overrides: Partial<AccountCenterFormValues['fields']> = {}
): AccountCenterFormValues['fields'] => ({
  email: AccountCenterControlValue.Off,
  phone: AccountCenterControlValue.Off,
  social: AccountCenterControlValue.Off,
  password: AccountCenterControlValue.Off,
  mfa: AccountCenterControlValue.Off,
  passkey: AccountCenterControlValue.Off,
  username: AccountCenterControlValue.Off,
  name: AccountCenterControlValue.Off,
  avatar: AccountCenterControlValue.Off,
  profile: AccountCenterControlValue.Off,
  customData: AccountCenterControlValue.Off,
  session: AccountCenterControlValue.Off,
  ...overrides,
});

describe('SignInExperience types utils', () => {
  it('omits default passkey field when the original account center config did not set it', () => {
    const normalizedFields = normalizeAccountCenterFieldsForSubmit(createAccountCenterFields(), {
      mfa: AccountCenterControlValue.Edit,
    });

    expect(normalizedFields).not.toHaveProperty('passkey');
  });

  it('keeps explicit passkey field from existing account center config', () => {
    const originalFields: AccountCenterFieldControl = {
      passkey: AccountCenterControlValue.Off,
    };

    expect(
      normalizeAccountCenterFieldsForSubmit(createAccountCenterFields(), originalFields)
    ).toHaveProperty('passkey', AccountCenterControlValue.Off);
  });

  it('keeps passkey field when the form enables it for the first time', () => {
    const normalizedFields = normalizeAccountCenterFieldsForSubmit(
      createAccountCenterFields({ passkey: AccountCenterControlValue.Edit }),
      {
        mfa: AccountCenterControlValue.Edit,
      }
    );

    expect(normalizedFields).toHaveProperty('passkey', AccountCenterControlValue.Edit);
  });
});
