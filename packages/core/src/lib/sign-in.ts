import { PasscodeType, UserLogType } from '@logto/schemas';
import { Context } from 'koa';
import { Provider } from 'oidc-provider';

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
} from '@/queries/user';
import assertThat from '@/utils/assert-that';
import { emailRegEx, phoneRegEx } from '@/utils/regex';

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

export const signInWithPhoneAndPasscode = async (
  ctx: WithUserLogContext<Context>,
  provider: Provider,
  { jti, phone, code }: { jti: string; phone: string; code: string }
) => {
  ctx.userLog.phone = phone;
  ctx.userLog.type = UserLogType.SignInSms;

  await verifyPasscode(jti, PasscodeType.SignIn, code, { phone });
  const { id } = await findUserByPhone(phone);

  await assignSignInResult(ctx, provider, id);
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

const getConnector = async (connectorId: string) => {
  try {
    return await getSocialConnectorInstanceById(connectorId);
  } catch (error: unknown) {
    // Throw a new error with status 422 when connector not found.
    if (error instanceof RequestError && error.code === 'entity.not_found') {
      throw new RequestError({
        code: 'session.invalid_connector_id',
        status: 422,
        data: { connectorId },
      });
    }
    throw error;
  }
};

export const signInWithSocial = async (
  ctx: WithUserLogContext<Context>,
  provider: Provider,
  { connectorId, code }: { connectorId: string; code: string }
) => {
  ctx.userLog.connectorId = connectorId;
  ctx.userLog.type = UserLogType.SignInSocial;

  const connector = await getConnector(connectorId);
  const accessToken = await connector.getAccessToken(code);

  const userInfo = await connector.getUserInfo(accessToken);

  assertThat(
    await hasUserWithIdentity(connectorId, userInfo.id),
    new RequestError({
      code: 'user.identity_not_exists',
      status: 422,
    })
  );

  const { id } = await findUserByIdentity(connectorId, userInfo.id);
  ctx.userLog.userId = id;
  await assignSignInResult(ctx, provider, id);
};
