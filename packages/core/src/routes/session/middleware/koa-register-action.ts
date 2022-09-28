import dayjs from 'dayjs';
import { Provider } from 'oidc-provider';

import RequestError from '@/errors/RequestError';
import { assignInteractionResults } from '@/lib/session';
import { generateUserId, insertUser } from '@/lib/user';
import koaLog from '@/middleware/koa-log';
import { hasUserWithPhone, hasUserWithEmail } from '@/queries/user';
import { passwordlessVerificationGuard, Via } from '@/routes/session/types';
import { getPasswordlessRelatedLogType } from '@/routes/session/utils';
import assertThat from '@/utils/assert-that';

type MiddlewareReturnType = ReturnType<typeof koaLog>;

export default function koaRegisterAction<StateT, ContextT, ResponseBodyT>(
  provider: Provider,
  via: Via
): MiddlewareReturnType {
  return async (ctx, next) => {
    const { result } = await provider.interactionDetails(ctx.req, ctx.res);

    const passwordlessVerificationResult = passwordlessVerificationGuard.safeParse(result);
    assertThat(
      passwordlessVerificationResult.success,
      new RequestError({
        code: 'session.passwordless_verification_session_not_found',
        status: 404,
      })
    );

    const {
      passwordlessVerification: { email, phone, flow, expiresAt },
    } = passwordlessVerificationResult.data;

    const type = getPasswordlessRelatedLogType('register', via);
    ctx.log(type, { email, phone, flow, expiresAt });

    assertThat(
      flow === 'register',
      new RequestError({ code: 'session.passwordless_not_verified', status: 401 })
    );

    assertThat(
      dayjs(expiresAt).isValid() && dayjs(expiresAt).isAfter(dayjs()),
      new RequestError({ code: 'session.passwordless_verification_expired', status: 401 })
    );

    if (via === 'sms') {
      assertThat(
        phone && !(await hasUserWithPhone(phone)),
        new RequestError({ code: 'user.phone_exists_register', status: 422 })
      );
    } else {
      assertThat(
        email && !(await hasUserWithEmail(email)),
        new RequestError({ code: 'user.email_exists_register', status: 422 })
      );
    }

    const id = await generateUserId();
    ctx.log(type, { userId: id });

    await (via === 'sms'
      ? insertUser({ id, primaryPhone: phone, lastSignInAt: Date.now() })
      : insertUser({ id, primaryEmail: email, lastSignInAt: Date.now() }));
    await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

    return next();
  };
}
