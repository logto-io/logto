import { type SignInIdentifier } from '@logto/schemas';
import { type KyInstance } from 'ky';

import { updateIdentities } from '#src/api/my-account.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import {
  createSocialVerificationRecord,
  createVerificationRecordByPassword,
  verifySocialAuthorization,
} from '#src/api/verification-record.js';

export const socialVerificationState = 'fake_state';
export const socialVerificationRedirectUri = 'http://localhost:3000/redirect';
export const socialVerificationAuthorizationCode = 'fake_code';

export const linkSocialIdentity = async (
  api: KyInstance,
  password: string,
  socialConnectorId: string
) => {
  const verificationRecordId = await createVerificationRecordByPassword(api, password);

  const { verificationRecordId: newVerificationRecordId } = await createSocialVerificationRecord(
    api,
    socialConnectorId,
    socialVerificationState,
    socialVerificationRedirectUri
  );

  await verifySocialAuthorization(api, newVerificationRecordId, {
    code: socialVerificationAuthorizationCode,
  });
  await updateIdentities(api, verificationRecordId, newVerificationRecordId);

  return { verificationRecordId, newVerificationRecordId };
};

export const updateOnlyAvailableIdentifierSignInMethod = async ({
  identifier,
  password,
  verificationCode,
  isPasswordPrimary,
  socialConnectorTarget,
}: {
  identifier: SignInIdentifier;
  password: boolean;
  verificationCode: boolean;
  isPasswordPrimary: boolean;
  socialConnectorTarget: string;
}) =>
  updateSignInExperience({
    signIn: {
      methods: [{ identifier, password, verificationCode, isPasswordPrimary }],
    },
    socialSignInConnectorTargets: [socialConnectorTarget],
  });
