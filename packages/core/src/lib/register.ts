import { PasscodeType, UserLogType } from '@logto/schemas';
import { Context } from 'koa';
import { Provider } from 'oidc-provider';

import RequestError from '@/errors/RequestError';
import { WithUserLogContext } from '@/middleware/koa-user-log';
import { hasUserWithEmail, hasUserWithPhone, insertUser } from '@/queries/user';
import assertThat from '@/utils/assert-that';
import { emailRegEx, phoneRegEx } from '@/utils/regex';

import { createPasscode, sendPasscode, verifyPasscode } from './passcode';
import { generateUserId } from './user';

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
    await availabilityChecker(emailOrPhone),
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
    await availabilityChecker(emailOrPhone),
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
  const redirectTo = await provider.interactionResult(
    ctx.req,
    ctx.res,
    { login: { accountId: id } },
    {
      mergeWithLastSubmission: false,
    }
  );
  ctx.body = { redirectTo };
  const userLogUpdate = registerWithEmail
    ? { primaryEmail: emailOrPhone, type: UserLogType.RegisterEmail }
    : { primaryPhone: emailOrPhone, type: UserLogType.RegisterPhone };
  ctx.userLog = { ...ctx.userLog, ...userLogUpdate, userId: id };
};
