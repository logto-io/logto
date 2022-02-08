import { PasscodeType } from '@logto/schemas';
import { Context } from 'koa';
import { Provider } from 'oidc-provider';

import RequestError from '@/errors/RequestError';
import { WithUserLogContext } from '@/middleware/koa-user-log';
import { hasUser, hasUserWithEmail, insertUser } from '@/queries/user';
import assertThat from '@/utils/assert-that';
import { emailRegEx } from '@/utils/regex';

import { createPasscode, sendPasscode, verifyPasscode } from './passcode';
import { encryptUserPassword, generateUserId } from './user';

const assignRegistrationResult = async (ctx: Context, provider: Provider, userId: string) => {
  const redirectTo = await provider.interactionResult(
    ctx.req,
    ctx.res,
    {
      login: { accountId: userId },
    },
    { mergeWithLastSubmission: false }
  );
  ctx.body = { redirectTo };
};

export const registerWithUsernameAndPassword = async (
  ctx: WithUserLogContext<Context>,
  provider: Provider,
  username: string,
  password: string
) => {
  assertThat(
    username && password,
    new RequestError({
      code: 'session.insufficient_info',
      status: 400,
    })
  );
  assertThat(
    !(await hasUser(username)),
    new RequestError({
      code: 'user.username_exists',
      status: 422,
    })
  );

  const id = await generateUserId();

  const { passwordEncryptionSalt, passwordEncrypted, passwordEncryptionMethod } =
    encryptUserPassword(id, password);

  await insertUser({
    id,
    username,
    passwordEncrypted,
    passwordEncryptionMethod,
    passwordEncryptionSalt,
  });

  await assignRegistrationResult(ctx, provider, id);
};

export const sendPasscodeToEmail = async (ctx: Context, jti: string, email: string) => {
  assertThat(emailRegEx.test(email), new RequestError('user.invalid_email'));
  assertThat(
    !(await hasUserWithEmail(email)),
    new RequestError({
      code: 'user.email_exists',
      status: 422,
    })
  );

  const passcode = await createPasscode(jti, PasscodeType.Register, { email });
  await sendPasscode(passcode);
  ctx.state = 204;
};

export const registerWithEmailAndPasscode = async (
  ctx: WithUserLogContext<Context>,
  provider: Provider,
  { jti, email, code }: { jti: string; email: string; code: string }
) => {
  assertThat(
    !(await hasUserWithEmail(email)),
    new RequestError({
      code: 'user.email_exists',
      status: 422,
    })
  );
  await verifyPasscode(jti, PasscodeType.Register, code, { email });

  const id = await generateUserId();
  await insertUser({
    id,
    primaryEmail: email,
  });

  await assignRegistrationResult(ctx, provider, id);
};
