import { isSameArray } from '@silverhand/essentials';
import type { DatabaseTransactionConnection } from 'slonik';
import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

enum DeprecatedSignUpIdentifier {
  Email = 'email',
  Sms = 'sms',
  Username = 'username',
  EmailOrSms = 'emailOrSms',
  None = 'none',
}

type DeprecatedSignUp = {
  identifier: DeprecatedSignUpIdentifier;
  password: boolean;
  verify: boolean;
};

type DeprecatedSignInExperience = {
  id: string;
  signUp: DeprecatedSignUp;
};

enum SignInExperienceIdentifier {
  Username = 'username',
  Email = 'email',
  Sms = 'sms',
}

type SignUp = {
  identifiers: SignInExperienceIdentifier[];
  password: boolean;
  verify: boolean;
};

type SignInExperience = {
  id: string;
  signUp: SignUp;
};

const signUpIdentifierMapping: {
  [key in DeprecatedSignUpIdentifier]: SignInExperienceIdentifier[];
} = {
  [DeprecatedSignUpIdentifier.Email]: [SignInExperienceIdentifier.Email],
  [DeprecatedSignUpIdentifier.Sms]: [SignInExperienceIdentifier.Sms],
  [DeprecatedSignUpIdentifier.Username]: [SignInExperienceIdentifier.Username],
  [DeprecatedSignUpIdentifier.EmailOrSms]: [
    SignInExperienceIdentifier.Email,
    SignInExperienceIdentifier.Sms,
  ],
  [DeprecatedSignUpIdentifier.None]: [],
};

const mapDeprecatedSignUpIdentifierToIdentifiers = (signUpIdentifier: DeprecatedSignUpIdentifier) =>
  signUpIdentifierMapping[signUpIdentifier];

const alterSignUp = async (
  signInExperience: DeprecatedSignInExperience,
  pool: DatabaseTransactionConnection
) => {
  const {
    id,
    signUp: { identifier, password, verify },
  } = signInExperience;

  const signUpIdentifiers = mapDeprecatedSignUpIdentifierToIdentifiers(identifier);

  const signUp: SignUp = {
    identifiers: signUpIdentifiers,
    password,
    verify,
  };

  await pool.query(
    sql`update sign_in_experiences set sign_up = ${JSON.stringify(signUp)} where id = ${id}`
  );
};

const mapIdentifiersToDeprecatedSignUpIdentifier = (
  identifiers: SignInExperienceIdentifier[]
): DeprecatedSignUpIdentifier => {
  for (const [key, mappedIdentifiers] of Object.entries(signUpIdentifierMapping)) {
    if (isSameArray(identifiers, mappedIdentifiers)) {
      // eslint-disable-next-line no-restricted-syntax
      return key as DeprecatedSignUpIdentifier;
    }
  }

  throw new Error('Invalid identifiers in the sign up settings.');
};

const rollbackSignUp = async (
  signInExperience: SignInExperience,
  pool: DatabaseTransactionConnection
) => {
  const {
    id,
    signUp: { identifiers, password, verify },
  } = signInExperience;

  const signUpIdentifier = mapIdentifiersToDeprecatedSignUpIdentifier(identifiers);

  const signUp: DeprecatedSignUp = {
    identifier: signUpIdentifier,
    password,
    verify,
  };

  await pool.query(
    sql`update sign_in_experiences set sign_up = ${JSON.stringify(signUp)} where id = ${id}`
  );
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const rows = await pool.many<DeprecatedSignInExperience>(
      sql`select * from sign_in_experiences`
    );
    await Promise.all(rows.map(async (row) => alterSignUp(row, pool)));
  },
  down: async (pool) => {
    const rows = await pool.many<SignInExperience>(sql`select * from sign_in_experiences`);
    await Promise.all(rows.map(async (row) => rollbackSignUp(row, pool)));
  },
};

export default alteration;
