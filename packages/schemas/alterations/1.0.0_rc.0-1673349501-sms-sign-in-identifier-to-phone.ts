import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

enum OldSignInIdentifier {
  Email = 'email',
  Sms = 'sms',
  Username = 'username',
}

type OldSignIn = {
  methods: Array<{
    password: boolean;
    identifier: OldSignInIdentifier;
    verificationCode: boolean;
    isPasswordPrimary: boolean;
  }>;
};

type OldSignUp = {
  identifiers: OldSignInIdentifier[];
  password: boolean;
  verify: boolean;
};

type OldSignInExperience = {
  [k: string]: unknown;
  id: string;
  signIn: OldSignIn;
  signUp: OldSignUp;
};

enum SignInIdentifier {
  Email = 'email',
  Phone = 'phone',
  Username = 'username',
}

type SignIn = {
  methods: Array<{
    password: boolean;
    identifier: SignInIdentifier;
    verificationCode: boolean;
    isPasswordPrimary: boolean;
  }>;
};

type SignUp = {
  identifiers: SignInIdentifier[];
  password: boolean;
  verify: boolean;
};

type SignInExperience = {
  [k: string]: unknown;
  id: string;
  signIn: SignIn;
  signUp: SignUp;
};

const alterSignUp = (signUp: OldSignUp) => {
  const { identifiers, password, verify } = signUp;

  const newIdentifiers = identifiers.map((identifier) => {
    if (identifier.toLocaleLowerCase() === OldSignInIdentifier.Sms) {
      return SignInIdentifier.Phone;
    }

    return identifier;
  });

  return {
    identifiers: newIdentifiers,
    password,
    verify,
  };
};

const alterSignIn = (signIn: OldSignIn) => {
  const { methods } = signIn;

  const newMethods = methods.map((method) => {
    const { identifier, ...rest } = method;

    if (identifier === OldSignInIdentifier.Sms) {
      return {
        identifier: SignInIdentifier.Phone,
        ...rest,
      };
    }

    return method;
  });

  return {
    methods: newMethods,
  };
};

const rollbackSignUp = (signUp: SignUp) => {
  const { identifiers, password, verify } = signUp;

  const newIdentifiers = identifiers.map((identifier) => {
    if (identifier === SignInIdentifier.Phone) {
      return OldSignInIdentifier.Sms;
    }

    return identifier;
  });

  return {
    identifiers: newIdentifiers,
    password,
    verify,
  };
};

const rollbackSignIn = (signIn: SignIn) => {
  const { methods } = signIn;

  const newMethods = methods.map((method) => {
    const { identifier, ...rest } = method;

    if (identifier === SignInIdentifier.Phone) {
      return {
        identifier: OldSignInIdentifier.Sms,
        ...rest,
      };
    }

    return method;
  });

  return {
    methods: newMethods,
  };
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const id = 'default';
    const data = await pool.maybeOne<OldSignInExperience>(
      sql`select * from sign_in_experiences where id = ${id}`
    );

    if (data) {
      const { signUp, signIn } = data;

      const newSignUp = alterSignUp(signUp);
      const newSignIn = alterSignIn(signIn);

      await pool.query(
        sql`update sign_in_experiences set sign_up = ${JSON.stringify(newSignUp)} where id = ${id}`
      );

      await pool.query(
        sql`update sign_in_experiences set sign_in = ${JSON.stringify(newSignIn)} where id = ${id}`
      );
    }
  },
  down: async (pool) => {
    const id = 'default';
    const data = await pool.maybeOne<SignInExperience>(
      sql`select * from sign_in_experiences where id = ${id}`
    );

    if (data) {
      const { signUp, signIn } = data;

      const oldSignUp = rollbackSignUp(signUp);
      const oldSignIn = rollbackSignIn(signIn);

      await pool.query(
        sql`update sign_in_experiences set sign_up = ${JSON.stringify(oldSignUp)} where id = ${id}`
      );

      await pool.query(
        sql`update sign_in_experiences set sign_in = ${JSON.stringify(oldSignIn)} where id = ${id}`
      );
    }
  },
};

export default alteration;
