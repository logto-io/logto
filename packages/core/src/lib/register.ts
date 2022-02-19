import { PasscodeType, UserLogType } from '@logto/schemas';
import { Context } from 'koa';
import { Provider } from 'oidc-provider';

import RequestError from '@/errors/RequestError';
import { WithUserLogContext } from '@/middleware/koa-user-log';
import {
  hasUser,
  hasUserWithEmail,
  hasUserWithPhone,
  hasUserWithIdentity,
  insertUser,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';
import { assignInteractionResults } from '@/utils/interaction';
import { emailRegEx, phoneRegEx } from '@/utils/regex';

import { createPasscode, sendPasscode, verifyPasscode } from './passcode';
import { getUserInfoByConnectorCode, SocialUserInfoSession } from './social';
import { encryptUserPassword, generateUserId } from './user';

const assignRegistrationResult = async (ctx: Context, provider: Provider, userId: string) => {
  await assignInteractionResults(ctx, provider, { login: { accountId: userId } });
};

const saveUserInfoToSession = async (
  ctx: Context,
  provider: Provider,
  socialUserInfo: SocialUserInfoSession
) => {
  await assignInteractionResults(ctx, provider, { socialUserInfo }, true);
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
      code: 'user.username_exists_register',
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
  ctx.userLog.userId = id;
  ctx.userLog.username = username;
  ctx.userLog.type = UserLogType.RegisterUsernameAndPassword;
};

export const sendPasscodeForRegistration = async (
  ctx: Context,
  jti: string,
  emailOrPhone: string
) => {
  assertThat(
    emailRegEx.test(emailOrPhone) || phoneRegEx.test(emailOrPhone),
    new RequestError({ code: 'guard.invalid_input', status: 422 })
  );

  const sendWithEmail = emailRegEx.test(emailOrPhone);

  const formatErrorCode = sendWithEmail ? 'user.invalid_email' : 'user.invalid_phone';
  const existenceErrorCode = sendWithEmail
    ? 'user.email_exists_register'
    : 'user.phone_exists_register';

  const formatChecker = sendWithEmail ? emailRegEx : phoneRegEx;

  const availabilityChecker = async (toAddress: string): Promise<boolean> => {
    return sendWithEmail
      ? !(await hasUserWithEmail(toAddress))
      : !(await hasUserWithPhone(toAddress));
  };

  assertThat(formatChecker.test(emailOrPhone), formatErrorCode);
  assertThat(
    availabilityChecker(emailOrPhone),
    new RequestError({ code: existenceErrorCode, status: 422 })
  );

  const payload = sendWithEmail ? { email: emailOrPhone } : { phone: emailOrPhone };
  const passcode = await createPasscode(jti, PasscodeType.Register, payload);
  await sendPasscode(passcode);
  ctx.state = 204;
};

export const registerWithPasswordlessFlow = async (
  ctx: WithUserLogContext<Context>,
  provider: Provider,
  { jti, emailOrPhone, code }: { jti: string; emailOrPhone: string; code: string }
) => {
  assertThat(
    emailRegEx.test(emailOrPhone) || phoneRegEx.test(emailOrPhone),
    new RequestError({ code: 'guard.invalid_input', status: 422 })
  );

  const registerWithEmail = emailRegEx.test(emailOrPhone);

  const availabilityChecker = async (toAddress: string): Promise<boolean> => {
    return registerWithEmail
      ? !(await hasUserWithEmail(toAddress))
      : !(await hasUserWithPhone(toAddress));
  };
  const errorCodeDesciption = registerWithEmail
    ? 'user.email_exists_register'
    : 'user.phone_exists_register';

  assertThat(
    availabilityChecker(emailOrPhone),
    new RequestError({ code: errorCodeDesciption, status: 422 })
  );
  await verifyPasscode(
    jti,
    PasscodeType.Register,
    code,
    registerWithEmail ? { email: emailOrPhone } : { phone: emailOrPhone }
  );
  const id = await generateUserId();
  const userInfo = registerWithEmail
    ? { id, primaryEmail: emailOrPhone }
    : { id, primaryPhone: emailOrPhone };
  await insertUser(userInfo);
  await assignRegistrationResult(ctx, provider, id);
  const userLogUpdate = registerWithEmail
    ? { primaryEmail: emailOrPhone, type: UserLogType.RegisterEmail }
    : { primaryPhone: emailOrPhone, type: UserLogType.RegisterPhone };
  ctx.userLog = { ...ctx.userLog, ...userLogUpdate, userId: id };
};

export const registerWithSocial = async (
  ctx: WithUserLogContext<Context>,
  provider: Provider,
  { connectorId, code }: { connectorId: string; code: string }
) => {
  const userInfo = await getUserInfoByConnectorCode(connectorId, code);

  if (await hasUserWithIdentity(connectorId, userInfo.id)) {
    await saveUserInfoToSession(ctx, provider, { connectorId, userInfo });
    throw new RequestError({
      code: 'user.identity_exists',
      status: 422,
    });
  }

  const id = await generateUserId();
  await insertUser({
    id,
    name: userInfo.name ?? null,
    avatar: userInfo.avatar ?? null,
    identities: {
      [connectorId]: {
        userId: userInfo.id,
        details: userInfo,
      },
    },
  });

  await assignRegistrationResult(ctx, provider, id);
};
