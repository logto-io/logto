import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

enum SignInMethodState {
  Primary = 'primary',
  Secondary = 'secondary',
  Disabled = 'disabled',
}

enum SignInMethodKey {
  Username = 'username',
  Email = 'email',
  Sms = 'sms',
  Social = 'social',
}

type SignInExperience = {
  signInMethods: {
    [SignInMethodKey.Username]: SignInMethodState;
    [SignInMethodKey.Email]: SignInMethodState;
    [SignInMethodKey.Sms]: SignInMethodState;
    [SignInMethodKey.Social]: SignInMethodState;
  };
};

enum SignUpIdentifier {
  Email = 'email',
  Sms = 'sms',
  Username = 'username',
  EmailOrSms = 'emailOrSms',
  None = 'none',
}

enum SignInIdentifier {
  Email = 'email',
  Sms = 'Sms',
  Username = 'username',
}

type SignIn = {
  methods: Array<{
    identifier: SignInIdentifier;
    password: boolean;
    verificationCode: boolean;
    isPasswordPrimary: boolean;
  }>;
};

type SignUp = {
  identifier: SignUpIdentifier;
  password: boolean;
  verify: boolean;
};

const parseSignInMethodToSignInIdentifier = (
  method: SignInMethodKey
): SignInIdentifier | undefined => {
  if (method === SignInMethodKey.Username) {
    return SignInIdentifier.Username;
  }

  if (method === SignInMethodKey.Email) {
    return SignInIdentifier.Email;
  }

  if (method === SignInMethodKey.Sms) {
    return SignInIdentifier.Sms;
  }
};

const parseSignInMethodToSignUpIdentifier = (method?: SignInMethodKey): SignUpIdentifier => {
  if (method === SignInMethodKey.Username) {
    return SignUpIdentifier.Username;
  }

  if (method === SignInMethodKey.Email) {
    return SignUpIdentifier.Email;
  }

  if (method === SignInMethodKey.Sms) {
    return SignUpIdentifier.Sms;
  }

  return SignUpIdentifier.None;
};

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences add column sign_in jsonb
    `);
    await pool.query(sql`
      alter table sign_in_experiences add column sign_up jsonb
    `);
    await pool.query(sql`
      alter table sign_in_experiences add column forgot_password boolean not null default false
    `);

    const id = 'default';
    const data = await pool.maybeOne<SignInExperience>(
      sql`select * from sign_in_experiences where id = ${id}`
    );

    /* eslint-disable @silverhand/fp/no-mutating-methods */
    if (data) {
      const { signInMethods } = data;
      const methodKeys = Object.values(SignInMethodKey);
      const primaryMethod = methodKeys.find(
        (key) => signInMethods[key] === SignInMethodState.Primary
      );
      const secondaryMethods = methodKeys.filter(
        (key) => signInMethods[key] === SignInMethodState.Secondary
      );
      const signIn: SignIn = {
        methods: [],
      };

      const methods = [primaryMethod, ...secondaryMethods];

      for (const method of methods) {
        if (!method) {
          continue;
        }

        const identifier = parseSignInMethodToSignInIdentifier(method);

        if (identifier) {
          signIn.methods.push({
            identifier,
            password: identifier === SignInIdentifier.Username,
            verificationCode: identifier !== SignInIdentifier.Username,
            isPasswordPrimary: false,
          });
        }
      }

      const signUpIdentifier = parseSignInMethodToSignUpIdentifier(primaryMethod);
      const signUp: SignUp = {
        identifier: signUpIdentifier,
        verify: true,
        password: signUpIdentifier === SignUpIdentifier.Username,
      };

      await pool.query(sql`
        update sign_in_experiences set sign_in = ${JSON.stringify(signIn)} where id = ${id}
      `);
      await pool.query(sql`
        update sign_in_experiences set sign_up = ${JSON.stringify(signUp)} where id = ${id}
      `);
    }
    /* eslint-enable @silverhand/fp/no-mutating-methods */

    await pool.query(sql`
      alter table sign_in_experiences alter column sign_in set not null
    `);
    await pool.query(sql`
      alter table sign_in_experiences alter column sign_up set not null
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table sign_in_experiences drop column sign_in
    `);
    await pool.query(sql`
      alter table sign_in_experiences drop column sign_up
    `);
    await pool.query(sql`
      alter table sign_in_experiences drop column forgot_password
    `);
  },
};

export default alteration;
