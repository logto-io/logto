import { PasscodeType, UserLogType } from '@logto/schemas';
import { Context } from 'koa';
import { Provider } from 'oidc-provider';

import RequestError from '@/errors/RequestError';
import { WithUserLogContext } from '@/middleware/koa-user-log';
import { findUserByEmail } from '@/queries/user';
import assertThat from '@/utils/assert-that';
import { emailReg } from '@/utils/regex';

import { createPasscode, sendPasscode, verifyPasscode } from './passcode';
import { findUserByUsernameAndPassword } from './user';

const assignSignInResult = async (ctx: Context, provider: Provider, userId: string) => {
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

export const sendSignInWithEmailPasscode = async (ctx: Context, jti: string, email: string) => {
  assertThat(!email || emailReg.test(email), new RequestError('user.invalid_email'));

  const passcode = await createPasscode(jti, PasscodeType.SignIn, { email });
  await sendPasscode(passcode);
  ctx.state = 204;
};

export const signInWithUsernameAndPassword = async (
  ctx: WithUserLogContext<Context>,
  provider: Provider,
  username: string,
  password: string
) => {
  assertThat(username && password, 'session.insufficient_info');

  ctx.userLog.username = username;
  ctx.userLog.type = UserLogType.SignInUsernameAndPassword;

  const { id } = await findUserByUsernameAndPassword(username, password);
  await assignSignInResult(ctx, provider, id);
};

export const signInWithEmailAndPasscode = async (
  ctx: WithUserLogContext<Context>,
  provider: Provider,
  { jti, email, code }: { jti: string; email: string; code: string }
) => {
  ctx.userLog.email = email;
  ctx.userLog.type = UserLogType.SignInEmail;

  await verifyPasscode(jti, PasscodeType.SignIn, code, { email });
  const { id } = await findUserByEmail(email);

  await assignSignInResult(ctx, provider, id);
};
