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
  disableConnector,
  signInWithUsernameAndPassword,
} from '@/api';
import MockClient from '@/client';
import {
  registerNewUser,
  signIn,
  setUpConnector,
  readPasscode,
  createUserByAdmin,
} from '@/helpers';
import { generateUsername, generatePassword, generateEmail, generatePhone } from '@/utils';

describe('username and password flow', () => {
  const username = generateUsername();
  const password = generatePassword();

  it('register with username & password', async () => {
    await expect(registerNewUser(username, password)).resolves.not.toThrow();
  });

  it('sign-in with username & password', async () => {
    await expect(signIn(username, password)).resolves.not.toThrow();
  });
});

describe('email passwordless flow', () => {
  beforeAll(async () => {
    await setUpConnector(mockEmailConnectorId, mockEmailConnectorConfig);
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

    expect(client.isAuthenticated).toBeTruthy();
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

    expect(client.isAuthenticated).toBeTruthy();
  });

  afterAll(async () => {
    void disableConnector(mockEmailConnectorId);
  });
});

describe('sms passwordless flow', () => {
  beforeAll(async () => {
    await setUpConnector(mockSmsConnectorId, mockSmsConnectorConfig);
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

    expect(client.isAuthenticated).toBeTruthy();
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

    expect(client.isAuthenticated).toBeTruthy();
  });

  afterAll(async () => {
    void disableConnector(mockSmsConnectorId);
  });
});

describe('sign-in and sign-out', () => {
  const username = generateUsername();
  const password = generatePassword();

  beforeAll(async () => {
    await createUserByAdmin(username, password);
  });

  it('verify sign-in and then sign-out', async () => {
    const client = new MockClient();
    await client.initSession();

    assert(client.interactionCookie, new Error('Session not found'));

    const { redirectTo } = await signInWithUsernameAndPassword(
      username,
      password,
      client.interactionCookie
    );

    await client.processSession(redirectTo);

    expect(client.isAuthenticated).toBe(true);

    await client.signOut();

    expect(client.isAuthenticated).toBe(false);
  });
});
