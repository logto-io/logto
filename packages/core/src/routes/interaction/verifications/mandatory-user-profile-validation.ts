import type { Profile, SignInExperience, User } from '@logto/schemas';
import { InteractionEvent, MissingProfile, SignInIdentifier } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';
import type { Context } from 'koa';

import RequestError from '#src/errors/RequestError/index.js';
import { findUserById } from '#src/queries/user.js';
import assertThat from '#src/utils/assert-that.js';

import type { WithInteractionSieContext } from '../middleware/koa-interaction-sie.js';
import type { IdentifierVerifiedInteractionResult } from '../types/index.js';
import { isUserPasswordSet } from '../utils/index.js';

// eslint-disable-next-line complexity
const getMissingProfileBySignUpIdentifiers = ({
  signUp,
  user,
  profile,
}: {
  signUp: SignInExperience['signUp'];
  user: Nullable<User>;
  profile?: Profile;
}) => {
  const missingProfile = new Set<MissingProfile>();

  if (
    signUp.password &&
    !(user && isUserPasswordSet(user)) &&
    !profile?.password &&
    // Social identities can take place the role of password
    !profile?.connectorId
  ) {
    missingProfile.add(MissingProfile.password);
  }

  const signUpIdentifiersSet = new Set(signUp.identifiers);

  // Username
  if (
    signUpIdentifiersSet.has(SignInIdentifier.Username) &&
    !user?.username &&
    !profile?.username
  ) {
    missingProfile.add(MissingProfile.username);

    return missingProfile;
  }

  // Email or phone
  if (
    signUpIdentifiersSet.has(SignInIdentifier.Email) &&
    signUpIdentifiersSet.has(SignInIdentifier.Phone)
  ) {
    if (!user?.primaryPhone && !user?.primaryEmail && !profile?.phone && !profile?.email) {
      missingProfile.add(MissingProfile.emailOrPhone);
    }

    return missingProfile;
  }

  // Email only
  if (signUpIdentifiersSet.has(SignInIdentifier.Email) && !user?.primaryEmail && !profile?.email) {
    missingProfile.add(MissingProfile.email);

    return missingProfile;
  }

  // Phone only
  if (signUpIdentifiersSet.has(SignInIdentifier.Phone) && !user?.primaryPhone && !profile?.phone) {
    missingProfile.add(MissingProfile.phone);

    return missingProfile;
  }

  return missingProfile;
};

// This is a fallback logic make sure the user has a valid identifier for register should be guarded by the SIE already
const validateRegisterMandatoryUserProfile = (profile?: Profile) => {
  assertThat(
    profile && (profile.username ?? profile.email ?? profile.phone ?? profile.connectorId),
    new RequestError({ code: 'user.missing_profile', status: 422 })
  );
};

export default async function validateMandatoryUserProfile(
  ctx: WithInteractionSieContext<Context>,
  interaction: IdentifierVerifiedInteractionResult
) {
  const { signUp } = ctx.signInExperience;
  const { event, accountId, profile } = interaction;

  const user = event === InteractionEvent.Register ? null : await findUserById(accountId);
  const missingProfileSet = getMissingProfileBySignUpIdentifiers({ signUp, user, profile });

  assertThat(
    missingProfileSet.size === 0,
    new RequestError(
      { code: 'user.missing_profile', status: 422 },
      { missingProfile: Array.from(missingProfileSet) }
    )
  );

  if (event === InteractionEvent.Register) {
    validateRegisterMandatoryUserProfile(profile);
  }
}
