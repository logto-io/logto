import { SignInIdentifier, SignUpIdentifier } from '@logto/schemas';
import { adminConsoleApplicationId } from '@logto/schemas/lib/seeds';
import { assert } from '@silverhand/essentials';

import {
  mockEmailConnectorId,
  mockEmailConnectorConfig,
  mockSmsConnectorId,
  mockSmsConnectorConfig,
} from '@/__mocks__/connectors-mock';
import {
  sendRegisterUserWithEmailPasscode,
  verifyRegisterUserWithEmailPasscode,
  sendSignInUserWithEmailPasscode,
  verifySignInUserWithEmailPasscode,
  sendRegisterUserWithSmsPasscode,
  verifyRegisterUserWithSmsPasscode,
  sendSignInUserWithSmsPasscode,
  verifySignInUserWithSmsPasscode,
  signInWithPassword,
  createUser,
  listConnectors,
  deleteConnectorById,
  postConnector,
  updateConnectorConfig,
} from '@/api';
import MockClient from '@/client';
import {
  registerNewUser,
  signIn,
  readPasscode,
  createUserByAdmin,
  setSignUpIdentifier,
  setSignInMethod,
} from '@/helpers';
import { generateUsername, generatePassword, generateEmail, generatePhone } from '@/utils';

const connectorIdMap = new Map();

describe('username and password flow', () => {
  const username = generateUsername();
  const password = generatePassword();

  beforeAll(async () => {
    await setSignUpIdentifier(SignUpIdentifier.Username, true);
    await setSignInMethod([
      {
        identifier: SignInIdentifier.Username,
        password: true,
        verificationCode: false,
        isPasswordPrimary: false,
      },
    ]);
  });

  it('register and sign in with username & password', async () => {
    await expect(registerNewUser(username, password)).resolves.not.toThrow();
    await expect(signIn({ username, password })).resolves.not.toThrow();
  });
});

describe('email and password flow', () => {
  const email = generateEmail();
  const [localPart, domain] = email.split('@');
  const password = generatePassword();

  assert(localPart && domain, new Error('Email address local part or domain is empty'));

  beforeAll(async () => {
    const { id } = await postConnector(mockEmailConnectorId);
    await updateConnectorConfig(id, mockEmailConnectorConfig);
    connectorIdMap.set(mockEmailConnectorId, id);

    await setSignUpIdentifier(SignUpIdentifier.Email, true);
    await setSignInMethod([
      {
        identifier: SignInIdentifier.Email,
        password: true,
        verificationCode: false,
        isPasswordPrimary: false,
      },
    ]);
  });

  it('can sign in with email & password', async () => {
    await createUser({ password, primaryEmail: email, username: generateUsername(), name: 'John' });
    await expect(
      Promise.all([
        signIn({ email, password }),
        signIn({ email: localPart.toUpperCase() + '@' + domain, password }),
        signIn({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          email: localPart[0]! + localPart.toUpperCase().slice(1) + '@' + domain,
          password,
        }),
      ])
    ).resolves.not.toThrow();
  });
});

describe('email passwordless flow', () => {
  beforeAll(async () => {
    const connectors = await listConnectors();
    await Promise.all(
      connectors.map(async ({ id }) => {
        await deleteConnectorById(id);
      })
    );
    connectorIdMap.clear();

    const { id } = await postConnector(mockEmailConnectorId);
    await updateConnectorConfig(id, mockEmailConnectorConfig);
    connectorIdMap.set(mockEmailConnectorId, id);

    await setSignUpIdentifier(SignUpIdentifier.Email, false);
    await setSignInMethod([
      {
        identifier: SignInIdentifier.Username,
        password: true,
        verificationCode: false,
        isPasswordPrimary: true,
      },
      {
        identifier: SignInIdentifier.Email,
        password: false,
        verificationCode: true,
        isPasswordPrimary: false,
      },
    ]);
  });

  // Since we can not create a email register user throw admin. Have to run the register then sign-in concurrently.
  const email = generateEmail();

  it('register with email', async () => {
    const client = new MockClient();

    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendRegisterUserWithEmailPasscode(email, client.interactionCookie)
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      address: email,
      type: 'Register',
    });

    const { code } = passcodeRecord;

    const { redirectTo } = await verifyRegisterUserWithEmailPasscode(
      email,
      code,
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    await expect(client.isAuthenticated()).resolves.toBe(true);
  });

  it('sign-in with email', async () => {
    const client = new MockClient();

    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendSignInUserWithEmailPasscode(email, client.interactionCookie)
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      address: email,
      type: 'SignIn',
    });

    const { code } = passcodeRecord;

    const { redirectTo } = await verifySignInUserWithEmailPasscode(
      email,
      code,
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    await expect(client.isAuthenticated()).resolves.toBe(true);
  });

  afterAll(async () => {
    await deleteConnectorById(connectorIdMap.get(mockEmailConnectorId));
  });
});

describe('sms passwordless flow', () => {
  beforeAll(async () => {
    const connectors = await listConnectors();
    await Promise.all(
      connectors.map(async ({ id }) => {
        await deleteConnectorById(id);
      })
    );
    connectorIdMap.clear();

    const { id } = await postConnector(mockSmsConnectorId);
    await updateConnectorConfig(id, mockSmsConnectorConfig);
    connectorIdMap.set(mockSmsConnectorId, id);

    await setSignUpIdentifier(SignUpIdentifier.Sms, false);
    await setSignInMethod([
      {
        identifier: SignInIdentifier.Username,
        password: true,
        verificationCode: false,
        isPasswordPrimary: true,
      },
      {
        identifier: SignInIdentifier.Sms,
        password: false,
        verificationCode: true,
        isPasswordPrimary: false,
      },
    ]);
  });

  // Since we can not create a sms register user throw admin. Have to run the register then sign-in concurrently.
  const phone = generatePhone();

  it('register with sms', async () => {
    const client = new MockClient();

    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendRegisterUserWithSmsPasscode(phone, client.interactionCookie)
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      phone,
      type: 'Register',
    });

    const { code } = passcodeRecord;

    const { redirectTo } = await verifyRegisterUserWithSmsPasscode(
      phone,
      code,
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    await expect(client.isAuthenticated()).resolves.toBe(true);
  });

  it('sign-in with sms', async () => {
    const client = new MockClient();

    await client.initSession();
    assert(client.interactionCookie, new Error('Session not found'));

    await expect(
      sendSignInUserWithSmsPasscode(phone, client.interactionCookie)
    ).resolves.not.toThrow();

    const passcodeRecord = await readPasscode();

    expect(passcodeRecord).toMatchObject({
      phone,
      type: 'SignIn',
    });

    const { code } = passcodeRecord;

    const { redirectTo } = await verifySignInUserWithSmsPasscode(
      phone,
      code,
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    await expect(client.isAuthenticated()).resolves.toBe(true);
  });

  afterAll(async () => {
    await deleteConnectorById(connectorIdMap.get(mockSmsConnectorId));
  });
});

describe('sign-in and sign-out', () => {
  const username = generateUsername();
  const password = generatePassword();

  beforeAll(async () => {
    await createUserByAdmin(username, password);
    await setSignUpIdentifier(SignUpIdentifier.Username);
  });

  it('verify sign-in and then sign-out', async () => {
    const client = new MockClient();
    await client.initSession();

    assert(client.interactionCookie, new Error('Session not found'));

    const { redirectTo } = await signInWithPassword({
      username,
      password,
      interactionCookie: client.interactionCookie,
    });

    await client.processSession(redirectTo);

    await expect(client.isAuthenticated()).resolves.toBe(true);

    await client.signOut();

    await expect(client.isAuthenticated()).resolves.toBe(false);
  });
});

describe('sign-in to demo app and revisit Admin Console', () => {
  const username = generateUsername();
  const password = generatePassword();

  beforeAll(async () => {
    await createUserByAdmin(username, password);
  });

  it('should throw in Admin Console consent step if a logged in user does not have admin role', async () => {
    const client = new MockClient();
    await client.initSession();

    assert(client.interactionCookie, new Error('Session not found'));

    const { redirectTo } = await signInWithPassword({
      username,
      password,
      interactionCookie: client.interactionCookie,
    });

    await client.processSession(redirectTo);

    await expect(client.isAuthenticated()).resolves.toBe(true);

    const { interactionCookie } = client;
    const acClient = new MockClient({ appId: adminConsoleApplicationId });

    acClient.assignCookie(interactionCookie);

    await expect(acClient.initSession()).rejects.toThrow();
  });
});
