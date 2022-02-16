import { PasscodeType, UserLogType } from '@logto/schemas';
import { Context } from 'koa';
import { InteractionResults, Provider } from 'oidc-provider';

import { getSocialConnectorInstanceById } from '@/connectors';
import RequestError from '@/errors/RequestError';
import { WithUserLogContext } from '@/middleware/koa-user-log';
import {
  findUserByEmail,
  findUserByPhone,
  hasUserWithEmail,
  hasUserWithPhone,
  hasUserWithIdentity,
  findUserByIdentity,
  updateUserById,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';
import { emailRegEx, phoneRegEx } from '@/utils/regex';

import { createPasscode, sendPasscode, verifyPasscode } from './passcode';
import { getUserInfoByConnectorCode, getUserInfoFromInteractionResult } from './social';
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
  assertThat(emailRegEx.test(email), new RequestError('user.invalid_email'));
  assertThat(
    await hasUserWithEmail(email),
    new RequestError({
      code: 'user.email_not_exists',
      status: 422,
    })
  );
  const passcode = await createPasscode(jti, PasscodeType.SignIn, { email });
  await sendPasscode(passcode);
  ctx.state = 204;
};

export const sendSignInWithPhonePasscode = async (ctx: Context, jti: string, phone: string) => {
  assertThat(phoneRegEx.test(phone), new RequestError('user.invalid_phone'));
  assertThat(
    await hasUserWithPhone(phone),
    new RequestError({
      code: 'user.phone_not_exists',
      status: 422,
    })
  );
  const passcode = await createPasscode(jti, PasscodeType.SignIn, { phone });
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

  const { id } = await findUserByUsernameAndPassword(username, password);
  await assignSignInResult(ctx, provider, id);
  ctx.userLog.userId = id;
  ctx.userLog.username = username;
  ctx.userLog.type = UserLogType.SignInUsernameAndPassword;
};

export const signInWithEmailAndPasscode = async (
  ctx: WithUserLogContext<Context>,
  provider: Provider,
  { jti, email, code }: { jti: string; email: string; code: string }
) => {
  await verifyPasscode(jti, PasscodeType.SignIn, code, { email });
  const { id } = await findUserByEmail(email);

  await assignSignInResult(ctx, provider, id);
  ctx.userLog.userId = id;
  ctx.userLog.email = email;
  ctx.userLog.type = UserLogType.SignInEmail;
};

export const signInWithPhoneAndPasscode = async (
  ctx: WithUserLogContext<Context>,
  provider: Provider,
  { jti, phone, code }: { jti: string; phone: string; code: string }
) => {
  await verifyPasscode(jti, PasscodeType.SignIn, code, { phone });
  const { id } = await findUserByPhone(phone);

  await assignSignInResult(ctx, provider, id);
  ctx.userLog.userId = id;
  ctx.userLog.phone = phone;
  ctx.userLog.type = UserLogType.SignInPhone;
};

// TODO: change this after frontend is ready.
// Should combine baseUrl(domain) from database with a 'callback' endpoint.
const connectorRedirectUrl = 'https://logto.dev/callback';

export const assignRedirectUrlForSocial = async (
  ctx: WithUserLogContext<Context>,
  connectorId: string,
  state: string
) => {
  const connector = await getSocialConnectorInstanceById(connectorId);
  assertThat(connector.connector?.enabled, 'connector.not_enabled');
  const redirectTo = await connector.getAuthorizationUri(connectorRedirectUrl, state);
  ctx.body = { redirectTo };
};

export const signInWithSocial = async (
  ctx: WithUserLogContext<Context>,
  provider: Provider,
  { connectorId, code, result }: { connectorId: string; code: string; result?: InteractionResults }
) => {
  ctx.userLog.connectorId = connectorId;
  ctx.userLog.type = UserLogType.SignInSocial;

  const userInfo =
    (await getUserInfoFromInteractionResult(connectorId, result)) ??
    (await getUserInfoByConnectorCode(connectorId, code));

  assertThat(
    await hasUserWithIdentity(connectorId, userInfo.id),
    new RequestError({
      code: 'user.identity_not_exists',
      status: 422,
    })
  );

  const { id, identities } = await findUserByIdentity(connectorId, userInfo.id);
  // Update social connector's user info
  await updateUserById(id, {
    identities: { ...identities, [connectorId]: { userId: userInfo.id, details: userInfo } },
  });
  ctx.userLog.userId = id;
  await assignSignInResult(ctx, provider, id);
};
