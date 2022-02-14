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
import { emailRegEx, phoneRegEx } from '@/utils/regex';

import { createPasscode, sendPasscode, verifyPasscode } from './passcode';
import { getUserInfoByConnectorCode } from './social';
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

export const sendPasscodeToEmail = async (ctx: Context, jti: string, email: string) => {
  assertThat(emailRegEx.test(email), new RequestError('user.invalid_email'));
  assertThat(
    !(await hasUserWithEmail(email)),
    new RequestError({
      code: 'user.email_exists_register',
      status: 422,
    })
  );

  const passcode = await createPasscode(jti, PasscodeType.Register, { email });
  await sendPasscode(passcode);
  ctx.state = 204;
};

export const sendPasscodeToPhone = async (ctx: Context, jti: string, phone: string) => {
  assertThat(phoneRegEx.test(phone), new RequestError('user.invalid_phone'));
  assertThat(
    !(await hasUserWithPhone(phone)),
    new RequestError({
      code: 'user.phone_exists_register',
      status: 422,
    })
  );

  const passcode = await createPasscode(jti, PasscodeType.Register, { phone });
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
      code: 'user.email_exists_register',
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
  ctx.userLog.userId = id;
  ctx.userLog.email = email;
  ctx.userLog.type = UserLogType.RegisterEmail;
};

export const registerWithPhoneAndPasscode = async (
  ctx: WithUserLogContext<Context>,
  provider: Provider,
  { jti, phone, code }: { jti: string; phone: string; code: string }
) => {
  assertThat(
    !(await hasUserWithPhone(phone)),
    new RequestError({
      code: 'user.phone_exists_register',
      status: 422,
    })
  );
  await verifyPasscode(jti, PasscodeType.Register, code, { phone });

  const id = await generateUserId();
  await insertUser({
    id,
    primaryPhone: phone,
  });

  await assignRegistrationResult(ctx, provider, id);
  ctx.userLog.userId = id;
  ctx.userLog.phone = phone;
  ctx.userLog.type = UserLogType.RegisterPhone;
};

export const registerWithSocial = async (
  ctx: WithUserLogContext<Context>,
  provider: Provider,
  { connectorId, code }: { connectorId: string; code: string }
) => {
  const userInfo = await getUserInfoByConnectorCode(connectorId, code);

  assertThat(
    !(await hasUserWithIdentity(connectorId, userInfo.id)),
    new RequestError({
      code: 'user.identity_exists',
      status: 422,
    })
  );

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
