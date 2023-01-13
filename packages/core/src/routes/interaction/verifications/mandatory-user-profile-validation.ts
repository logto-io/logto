import type { Profile, SignInExperience, User } from '@logto/schemas';
import { InteractionEvent, MissingProfile, SignInIdentifier } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';
import type { Context } from 'koa';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import type { WithInteractionSieContext } from '../middleware/koa-interaction-sie.js';
import type {
  SocialIdentifier,
  VerifiedSignInInteractionResult,
  VerifiedRegisterInteractionResult,
} from '../types/index.js';
import { isUserPasswordSet } from '../utils/index.js';
import { mergeIdentifiers } from '../utils/interaction.js';

type MandatoryProfileValidationInteraction =
  | VerifiedSignInInteractionResult
  | VerifiedRegisterInteractionResult;

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

// This is a fallback logic make sure the user has a valid identifier for sign-up. Should be guarded by the SIE already
const validateRegisterMandatoryUserProfile = (profile?: Profile) => {
  assertThat(
    profile && (profile.username ?? profile.email ?? profile.phone ?? profile.connectorId),
    new RequestError({ code: 'user.missing_profile', status: 422 })
  );
};

// Fill the missing email or phone from the social identity if any
const fillMissingProfileWithSocialIdentity = (
  missingProfile: Set<MissingProfile>,
  interaction: MandatoryProfileValidationInteraction
): [Set<MissingProfile>, MandatoryProfileValidationInteraction] => {
  const { identifiers = [], profile } = interaction;

  const socialIdentifier = identifiers.find(
    (identifier): identifier is SocialIdentifier => identifier.key === 'social'
  );

  if (!socialIdentifier) {
    return [missingProfile, interaction];
  }

  const {
    userInfo: { email, phone },
  } = socialIdentifier;

  if (
    (missingProfile.has(MissingProfile.email) || missingProfile.has(MissingProfile.emailOrPhone)) &&
    email
  ) {
    missingProfile.delete(MissingProfile.email);
    missingProfile.delete(MissingProfile.emailOrPhone);

    // Assign social verified email to the interaction
    return [
      missingProfile,
      {
        ...interaction,
        identifiers: mergeIdentifiers({ key: 'emailVerified', value: email }, identifiers),
        profile: {
          ...profile,
          email,
        },
      },
    ];
  }

  if (
    (missingProfile.has(MissingProfile.phone) || missingProfile.has(MissingProfile.emailOrPhone)) &&
    phone
  ) {
    missingProfile.delete(MissingProfile.phone);
    missingProfile.delete(MissingProfile.emailOrPhone);

    // Assign social verified phone to the interaction
    return [
      missingProfile,
      {
        ...interaction,
        identifiers: mergeIdentifiers({ key: 'phoneVerified', value: phone }, identifiers),
        profile: {
          ...profile,
          phone,
        },
      },
    ];
  }

  return [missingProfile, interaction];
};

export default async function validateMandatoryUserProfile(
  userQueries: Queries['users'],
  ctx: WithInteractionSieContext<Context>,
  interaction: MandatoryProfileValidationInteraction
) {
  const { signUp } = ctx.signInExperience;
  const { event, profile } = interaction;

  const user =
    event === InteractionEvent.Register
      ? null
      : // eslint-disable-next-line unicorn/consistent-destructuring -- have to infer the accountId existence by event !== register
        await userQueries.findUserById(interaction.accountId);

  const missingProfileSet = getMissingProfileBySignUpIdentifiers({ signUp, user, profile });

  const [updatedMissingProfileSet, updatedInteraction] = fillMissingProfileWithSocialIdentity(
    missingProfileSet,
    interaction
  );

  assertThat(
    updatedMissingProfileSet.size === 0,
    new RequestError(
      { code: 'user.missing_profile', status: 422 },
      { missingProfile: Array.from(missingProfileSet) }
    )
  );

  if (event === InteractionEvent.Register) {
    validateRegisterMandatoryUserProfile(profile);
  }

  return updatedInteraction;
}
