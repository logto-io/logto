import type { Profile } from '@logto/schemas';
import { MissingProfile, SignUpIdentifier } from '@logto/schemas';
import type { Context } from 'koa';

import RequestError from '#src/errors/RequestError/index.js';
import { findUserById } from '#src/queries/user.js';
import assertThat from '#src/utils/assert-that.js';

import type { WithSignInExperienceContext } from '../middleware/koa-session-sign-in-experience-guard.js';
import type { Identifier, AccountIdIdentifier } from '../types/index.js';
import { isUserPasswordSet } from '../utils/index.js';

const findUserByIdentifiers = async (identifiers: Identifier[]) => {
  const accountIdentifier = identifiers.find(
    (identifier): identifier is AccountIdIdentifier => identifier.key === 'accountId'
  );

  if (!accountIdentifier) {
    return null;
  }

  return findUserById(accountIdentifier.value);
};

// eslint-disable-next-line complexity
export default async function mandatoryUserProfileValidation(
  ctx: WithSignInExperienceContext<Context>,
  identifiers: Identifier[] = [],
  profile?: Profile
) {
  const {
    signInExperience: { signUp },
  } = ctx;
  const user = await findUserByIdentifiers(identifiers);
  const missingProfile = new Set<MissingProfile>();

  if (signUp.password && !((user && isUserPasswordSet(user)) ?? profile?.password)) {
    missingProfile.add(MissingProfile.password);
  }

  switch (signUp.identifier) {
    case SignUpIdentifier.Username: {
      if (!user?.username && !profile?.username) {
        missingProfile.add(MissingProfile.username);
      }
      break;
    }

    case SignUpIdentifier.Email: {
      if (!user?.primaryEmail && !profile?.email) {
        missingProfile.add(MissingProfile.email);
      }
      break;
    }

    case SignUpIdentifier.Sms: {
      if (!user?.primaryPhone && !profile?.phone) {
        missingProfile.add(MissingProfile.phone);
      }
      break;
    }

    case SignUpIdentifier.EmailOrSms: {
      if (!user?.primaryPhone && !user?.primaryEmail && !profile?.phone && !profile?.email) {
        missingProfile.add(MissingProfile.emailOrPhone);
      }
      break;
    }

    default:
      break;
  }

  assertThat(
    missingProfile.size === 0,
    new RequestError(
      { code: 'user.missing_profile', status: 422 },
      { missingProfile: Array.from(missingProfile) }
    )
  );
}
