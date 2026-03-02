/**
 * @fileoverview Integration tests for collecting user profile fields during the
 * sign-up experience flow. Covers scenarios including:
 * - Required and optional custom profile fields collection during registration
 * - Extra profile field validation (conflicts with sign-in identifiers, reserved keys, built-in props)
 * - Fullname composite field handling
 * - Profile data correctly split into name, avatar, profile (OIDC), and customData
 * - Missing profile fields triggering 422 errors
 * - Sign-in flow should not require extra profile fields
 */
/* eslint max-lines: 0 */

import { InteractionEvent, SignInIdentifier, userOnboardingDataKey } from '@logto/schemas';
import { noop } from '@silverhand/essentials';

import { deleteUser, getUser } from '#src/api/admin-user.js';
import {
  batchCreateCustomProfileFields,
  deleteCustomProfileFieldByName,
  findAllCustomProfileFields,
} from '#src/api/custom-profile-fields.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { generateUsername, generatePassword } from '#src/utils.js';

describe('collect user profile', () => {
  const userApi = new UserApiTest();
  const createdFieldNames: string[] = [];

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  afterEach(async () => {
    await userApi.cleanUp();

    // Clean up custom profile fields created during tests
    for (const name of createdFieldNames) {
      // eslint-disable-next-line no-await-in-loop
      await deleteCustomProfileFieldByName(name).catch(noop);
    }
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    createdFieldNames.splice(0, createdFieldNames.length);
  });

  const createCustomFields = async (
    fields: Array<{
      name: string;
      type: string;
      label: string;
      required: boolean;
      config?: Record<string, unknown>;
    }>
  ) => {
    const result = await batchCreateCustomProfileFields(
      // @ts-expect-error -- simplified field types for test
      fields
    );
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    createdFieldNames.push(...fields.map(({ name }) => name));
    return result;
  };

  describe('register with required custom profile fields', () => {
    it('should return 422 missing_profile with extraProfile when required fields are not filled', async () => {
      await createCustomFields([
        { name: 'company', type: 'Text', label: 'Company', required: true },
      ]);

      const username = generateUsername();
      const password = generatePassword();

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      // Should get 422 because required custom profile fields are missing
      await expectRejects(client.identifyUser(), {
        status: 422,
        code: 'user.missing_profile',
      });
    });

    it('should register successfully after filling required custom profile fields', async () => {
      await createCustomFields([
        { name: 'company', type: 'Text', label: 'Company', required: true },
        { name: 'jobTitle', type: 'Text', label: 'Job Title', required: true },
      ]);

      const username = generateUsername();
      const password = generatePassword();

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      // First attempt should fail due to missing fields
      await expectRejects(client.identifyUser(), {
        status: 422,
        code: 'user.missing_profile',
      });

      // Fill the required extra profile fields
      await client.updateProfile({
        type: 'extraProfile',
        values: {
          company: 'Logto Inc.',
          jobTitle: 'Engineer',
        },
      });

      // Now identify and submit should succeed
      await client.identifyUser();
      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);

      // Verify the user has the correct custom data
      const user = await getUser(userId);
      expect(user.customData).toMatchObject({
        company: 'Logto Inc.',
        jobTitle: 'Engineer',
      });

      await logoutClient(client);
      await deleteUser(userId);
    });
  });

  describe('register with optional custom profile fields', () => {
    it('should return 422 missing_profile with extraProfile when optional fields are not filled', async () => {
      // The PR fix: optional fields should also trigger missing_profile during signup
      // to allow users to fill them
      await createCustomFields([
        { name: 'inviteCode', type: 'Text', label: 'Invite Code', required: false },
      ]);

      const username = generateUsername();
      const password = generatePassword();

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      // Should get 422 because optional custom profile fields are unfilled during signup
      await expectRejects(client.identifyUser(), {
        status: 422,
        code: 'user.missing_profile',
      });
    });

    it('should register successfully after filling optional custom profile fields', async () => {
      await createCustomFields([
        { name: 'inviteCode', type: 'Text', label: 'Invite Code', required: false },
      ]);

      const username = generateUsername();
      const password = generatePassword();

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      // First attempt fails
      await expectRejects(client.identifyUser(), {
        status: 422,
        code: 'user.missing_profile',
      });

      // Fill the optional extra profile field
      await client.updateProfile({
        type: 'extraProfile',
        values: {
          inviteCode: 'ABC123',
        },
      });

      // Now it should succeed
      await client.identifyUser();
      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);

      const user = await getUser(userId);
      expect(user.customData).toMatchObject({
        inviteCode: 'ABC123',
      });

      await logoutClient(client);
      await deleteUser(userId);
    });

    it('should allow skipping all optional fields by submitting empty extraProfile', async () => {
      await createCustomFields([
        { name: 'inviteCode', type: 'Text', label: 'Invite Code', required: false },
        { name: 'referralSource', type: 'Text', label: 'Referral Source', required: false },
      ]);

      const username = generateUsername();
      const password = generatePassword();

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      // First attempt triggers the collect profile page
      await expectRejects(client.identifyUser(), {
        status: 422,
        code: 'user.missing_profile',
      });

      // User submits the form without filling any optional fields (skip)
      await client.updateProfile({
        type: 'extraProfile',
        values: {},
      });

      // Should succeed — optional fields can be skipped
      await client.identifyUser();
      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);

      await logoutClient(client);
      await deleteUser(userId);
    });

    it('should register successfully with mixed required and optional fields', async () => {
      await createCustomFields([
        { name: 'company', type: 'Text', label: 'Company', required: true },
        { name: 'referralSource', type: 'Text', label: 'Referral Source', required: false },
      ]);

      const username = generateUsername();
      const password = generatePassword();

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      await expectRejects(client.identifyUser(), {
        status: 422,
        code: 'user.missing_profile',
      });

      // Fill both required and optional fields
      await client.updateProfile({
        type: 'extraProfile',
        values: {
          company: 'Logto Inc.',
          referralSource: 'GitHub',
        },
      });

      await client.identifyUser();
      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);

      const user = await getUser(userId);
      expect(user.customData).toMatchObject({
        company: 'Logto Inc.',
        referralSource: 'GitHub',
      });

      await logoutClient(client);
      await deleteUser(userId);
    });

    it('should allow skipping optional fields but still require mandatory fields', async () => {
      await createCustomFields([
        { name: 'company', type: 'Text', label: 'Company', required: true },
        { name: 'referralSource', type: 'Text', label: 'Referral Source', required: false },
      ]);

      const username = generateUsername();
      const password = generatePassword();

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      await expectRejects(client.identifyUser(), {
        status: 422,
        code: 'user.missing_profile',
      });

      // Submit only the optional field, skip the required field
      await client.updateProfile({
        type: 'extraProfile',
        values: {
          referralSource: 'GitHub',
        },
      });

      // Should still fail because required field 'company' is missing
      await expectRejects(client.identifyUser(), {
        status: 422,
        code: 'user.missing_profile',
      });
    });
  });

  describe('extra profile data splitting into built-in and custom fields', () => {
    it('should correctly split profile data into name, avatar, OIDC profile, and customData', async () => {
      await createCustomFields([
        { name: 'customField1', type: 'Text', label: 'Custom 1', required: true },
      ]);

      const username = generateUsername();
      const password = generatePassword();

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      await expectRejects(client.identifyUser(), {
        status: 422,
        code: 'user.missing_profile',
      });

      await client.updateProfile({
        type: 'extraProfile',
        values: {
          // Built-in top-level fields
          name: 'John Doe',
          avatar: 'https://example.com/avatar.jpg',
          // OIDC profile fields
          givenName: 'John',
          familyName: 'Doe',
          gender: 'male',
          birthdate: '1990-01-01',
          zoneinfo: 'America/New_York',
          locale: 'en-US',
          website: 'https://example.com',
          // Custom data fields
          customField1: 'customValue1',
        },
      });

      await client.identifyUser();
      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);

      const user = await getUser(userId);

      // Verify built-in top-level fields
      expect(user.name).toBe('John Doe');
      expect(user.avatar).toBe('https://example.com/avatar.jpg');

      // Verify OIDC profile fields
      expect(user.profile).toMatchObject({
        givenName: 'John',
        familyName: 'Doe',
        gender: 'male',
        birthdate: '1990-01-01',
        zoneinfo: 'America/New_York',
        locale: 'en-US',
        website: 'https://example.com',
      });

      // Verify custom data fields
      expect(user.customData).toMatchObject({
        customField1: 'customValue1',
      });

      await logoutClient(client);
      await deleteUser(userId);
    });
  });

  describe('extra profile field validation errors', () => {
    it('should reject profile values that conflict with sign-in identifiers', async () => {
      const username = generateUsername();
      const password = generatePassword();

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      // Username conflicts with sign-in identifier
      await expectRejects(
        client.updateProfile({
          type: 'extraProfile',
          values: { username: 'johndoe' },
        }),
        {
          status: 400,
          code: 'custom_profile_fields.name_conflict_sign_in_identifier',
        }
      );

      // Email conflicts with sign-in identifier
      await expectRejects(
        client.updateProfile({
          type: 'extraProfile',
          values: { email: 'test@example.com' },
        }),
        {
          status: 400,
          code: 'custom_profile_fields.name_conflict_sign_in_identifier',
        }
      );

      // Phone conflicts with sign-in identifier
      await expectRejects(
        client.updateProfile({
          type: 'extraProfile',
          values: { phone: '1234567890' },
        }),
        {
          status: 400,
          code: 'custom_profile_fields.name_conflict_sign_in_identifier',
        }
      );
    });

    it('should reject profile values that conflict with reserved custom data keys', async () => {
      const username = generateUsername();
      const password = generatePassword();

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      await expectRejects(
        client.updateProfile({
          type: 'extraProfile',
          values: { [userOnboardingDataKey]: 'some value' },
        }),
        {
          status: 400,
          code: 'custom_profile_fields.name_conflict_custom_data',
        }
      );
    });

    it('should reject profile values that conflict with reserved built-in profile props', async () => {
      const username = generateUsername();
      const password = generatePassword();

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      await expectRejects(
        client.updateProfile({
          type: 'extraProfile',
          values: { preferredUsername: 'john' },
        }),
        {
          status: 400,
          code: 'custom_profile_fields.name_conflict_built_in_prop',
        }
      );
    });
  });

  describe('sign-in should not require extra profile fields', () => {
    it('should sign in without filling custom profile fields', async () => {
      const { username, password } = generateNewUserProfile({ username: true, password: true });
      await userApi.create({ username, password });

      // Create custom fields (these should not block sign-in)
      await createCustomFields([
        { name: 'company', type: 'Text', label: 'Company', required: true },
      ]);

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.SignIn,
      });

      await identifyUserWithUsernamePassword(client, username, password);

      // Sign-in should succeed without filling extra profile fields
      const { redirectTo } = await client.submitInteraction();
      await processSession(client, redirectTo);
      await logoutClient(client);
    });
  });

  describe('register without custom profile fields defined', () => {
    it('should register successfully when no custom profile fields are defined', async () => {
      // Ensure no custom profile fields exist
      const existingFields = await findAllCustomProfileFields();
      for (const field of existingFields) {
        // eslint-disable-next-line no-await-in-loop
        await deleteCustomProfileFieldByName(field.name);
      }

      const username = generateUsername();
      const password = generatePassword();

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      // Should succeed without any extra profile fields
      await client.identifyUser();
      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);

      await logoutClient(client);
      await deleteUser(userId);
    });
  });

  describe('fullname composite field handling', () => {
    it('should correctly handle fullname composite fields during registration', async () => {
      await createCustomFields([
        {
          name: 'fullname',
          type: 'Fullname',
          label: 'Full Name',
          required: true,
          config: {
            parts: [
              {
                name: 'givenName',
                enabled: true,
                type: 'Text',
                label: 'Given Name',
                required: true,
              },
              {
                name: 'familyName',
                enabled: true,
                type: 'Text',
                label: 'Family Name',
                required: true,
              },
            ],
          },
        },
      ]);

      const username = generateUsername();
      const password = generatePassword();

      const client = await initExperienceClient({
        interactionEvent: InteractionEvent.Register,
      });

      await client.updateProfile({ type: SignInIdentifier.Username, value: username });
      await client.updateProfile({ type: 'password', value: password });

      // Should get 422 because fullname parts are missing
      await expectRejects(client.identifyUser(), {
        status: 422,
        code: 'user.missing_profile',
      });

      // Fill fullname subfields (givenName and familyName are OIDC profile fields)
      await client.updateProfile({
        type: 'extraProfile',
        values: {
          givenName: 'John',
          familyName: 'Doe',
        },
      });

      await client.identifyUser();
      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);

      const user = await getUser(userId);
      expect(user.profile).toMatchObject({
        givenName: 'John',
        familyName: 'Doe',
      });

      await logoutClient(client);
      await deleteUser(userId);
    });
  });
});
