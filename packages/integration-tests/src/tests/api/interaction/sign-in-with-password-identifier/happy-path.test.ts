import { ConnectorType, SignInIdentifier, UsersPasswordEncryptionMethod } from '@logto/schemas';

import { deleteUser } from '#src/api/index.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import {
  signInWithPassword,
  signInWithUsernamePasswordAndUpdateEmailOrPhone,
} from '#src/helpers/interactions.js';
import {
  enableAllPasswordSignInMethods,
  enableAllVerificationCodeSignInMethods,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser, generateNewUserProfile } from '#src/helpers/user.js';
import { generateUsername } from '#src/utils.js';

describe('Sign-in flow using password identifiers', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await clearConnectorsByTypes([ConnectorType.Sms, ConnectorType.Email]);
    await setSmsConnector();
    await setEmailConnector();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Sms, ConnectorType.Email]);
  });

  it('sign-in with username and password', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });

    await signInWithPassword({ username: userProfile.username, password: userProfile.password });

    await deleteUser(user.id);
  });

  it('sign-in with username and password twice to test algorithm transition', async () => {
    const username = generateUsername();
    const password = 'password';

    const user = await createUserByAdmin({
      username,
      passwordDigest: '5f4dcc3b5aa765d61d8327deb882cf99',
      passwordAlgorithm: UsersPasswordEncryptionMethod.MD5,
    });

    await signInWithPassword({ username, password });

    await signInWithPassword({ username, password });

    await deleteUser(user.id);
  });

  it('sign-in with email and password', async () => {
    const { userProfile, user } = await generateNewUser({ primaryEmail: true, password: true });

    await signInWithPassword({ email: userProfile.primaryEmail, password: userProfile.password });

    await deleteUser(user.id);
  });

  it('sign-in with phone and password', async () => {
    const { userProfile, user } = await generateNewUser({ primaryPhone: true, password: true });
    await signInWithPassword({ phone: userProfile.primaryPhone, password: userProfile.password });
    await deleteUser(user.id);
  });

  // Fulfill the email address
  it('sign-in with username and password and fulfill the email', async () => {
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: true,
      verify: true,
    });

    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const { primaryEmail } = generateNewUserProfile({ primaryEmail: true });

    await signInWithUsernamePasswordAndUpdateEmailOrPhone(
      userProfile.username,
      userProfile.password,
      {
        email: primaryEmail,
      }
    );

    await signInWithPassword({ email: primaryEmail, password: userProfile.password });

    await deleteUser(user.id);
  });

  // Fulfill the phone number
  it('sign-in with username and password and fulfill the phone number', async () => {
    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Phone, SignInIdentifier.Email],
      password: true,
      verify: true,
    });

    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const { primaryPhone } = generateNewUserProfile({ primaryPhone: true });

    await signInWithUsernamePasswordAndUpdateEmailOrPhone(
      userProfile.username,
      userProfile.password,
      {
        phone: primaryPhone,
      }
    );

    await deleteUser(user.id);
  });
});
