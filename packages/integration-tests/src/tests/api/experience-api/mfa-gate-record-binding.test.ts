import { InteractionEvent, MfaFactor, SignInIdentifier } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import { createUserMfaVerification } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { initExperienceClient } from '#src/helpers/client.js';
import {
  successfullyCreateEnterpriseSsoVerification,
  successfullyVerifyEnterpriseSsoAuthorization,
} from '#src/helpers/experience/enterprise-sso-verification.js';
import {
  identifyUserWithUsernamePassword,
  signInWithEnterpriseSso,
} from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import {
  enableAllPasswordSignInMethods,
  enableMandatoryMfaWithTotp,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { generateEmail } from '#src/utils.js';

const domain = 'mfa-gate-record-binding.com';

describe('the MFA exemption of a first-factor record is bound to the account it identified', () => {
  const ssoConnectorApi = new SsoConnectorApi();
  const userApi = new UserApiTest();

  /** The SSO identity of an account of its own, not of the account being signed in. */
  const ssoAccountSub = generateStandardId();
  const ssoAccountEmail = generateEmail(domain);

  const connectorId = () => {
    const id = ssoConnectorApi.firstConnectorId;

    if (!id) {
      throw new Error('SSO connector is not created');
    }

    return id;
  };

  /** Verify an SSO assertion into the interaction without identifying anyone with it. */
  const verifySsoAuthorization = async (
    client: Awaited<ReturnType<typeof initExperienceClient>>
  ) => {
    const { verificationId } = await successfullyCreateEnterpriseSsoVerification(
      client,
      connectorId(),
      { redirectUri: 'http://foo.dev/callback', state: 'foo_state' }
    );

    await successfullyVerifyEnterpriseSsoAuthorization(client, connectorId(), {
      verificationId,
      connectorData: { sub: ssoAccountSub, email: ssoAccountEmail, email_verified: true },
    });

    return verificationId;
  };

  const createUserWithTotp = async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const { id } = await userApi.create({ username, password });
    await createUserMfaVerification(id, MfaFactor.TOTP);

    return { username, password };
  };

  beforeAll(async () => {
    await ssoConnectorApi.createMockOidcConnector([domain]);
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });
    await updateSignInExperience({ singleSignOnEnabled: true });
    // Provision the SSO account, so that the assertion identifies an account that does exist.
    await signInWithEnterpriseSso(
      connectorId(),
      { sub: ssoAccountSub, email: ssoAccountEmail, email_verified: true },
      true
    );
    await enableMandatoryMfaWithTotp();
  });

  afterAll(async () => {
    await Promise.all([ssoConnectorApi.cleanUp(), userApi.cleanUp()]);
    await resetMfaSettings();
  });

  it('should require MFA verification when the record identified nobody', async () => {
    const { username, password } = await createUserWithTotp();

    const client = await initExperienceClient();
    await verifySsoAuthorization(client);
    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(client.submitInteraction(), {
      code: 'session.mfa.require_mfa_verification',
      status: 403,
    });
  });

  it('should require MFA verification when the record outlived an interaction event change', async () => {
    const { username, password } = await createUserWithTotp();

    const client = await initExperienceClient();
    const verificationId = await verifySsoAuthorization(client);
    await client.identifyUser({ verificationId });

    // The switch discards the identified user and keeps the verification records.
    await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });
    await client.updateInteractionEvent({ interactionEvent: InteractionEvent.SignIn });

    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(client.submitInteraction(), {
      code: 'session.mfa.require_mfa_verification',
      status: 403,
    });
  });

  it('should require MFA verification when the identification with the record was refused', async () => {
    const { username, password } = await createUserWithTotp();

    const client = await initExperienceClient();
    const verificationId = await verifySsoAuthorization(client);
    await identifyUserWithUsernamePassword(client, username, password);

    // The record resolves to another account, so it cannot identify this one.
    await expectRejects(client.identifyUser({ verificationId }), {
      code: 'session.identity_conflict',
      status: 409,
    });

    await expectRejects(client.submitInteraction(), {
      code: 'session.mfa.require_mfa_verification',
      status: 403,
    });
  });

  it('should require an enrolled MFA factor when the record identified nobody', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    await userApi.create({ username, password });

    const client = await initExperienceClient();
    await verifySsoAuthorization(client);
    await identifyUserWithUsernamePassword(client, username, password);

    await expectRejects(client.submitInteraction(), {
      code: 'user.missing_mfa',
      status: 422,
    });
  });
});
