import { User } from '@logto/schemas';
import dayjs from 'dayjs';
import { Provider } from 'oidc-provider';

import RequestError from '@/errors/RequestError';
import { assignInteractionResults } from '@/lib/session';
import koaLog from '@/middleware/koa-log';
import {
  updateUserById,
  hasUserWithPhone,
  findUserByPhone,
  hasUserWithEmail,
  findUserByEmail,
} from '@/queries/user';
import { passwordlessVerificationGuard, Via } from '@/routes/session/types';
import { getPasswordlessRelatedLogType } from '@/routes/session/utils';
import assertThat from '@/utils/assert-that';

type MiddlewareReturnType = ReturnType<typeof koaLog>;

export default function koaSignInAction<StateT, ContextT, ResponseBodyT>(
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

    const type = getPasswordlessRelatedLogType('sign-in', via);
    ctx.log(type, { email, phone, flow, expiresAt });

    assertThat(
      flow === 'sign-in',
      new RequestError({ code: 'session.passwordless_not_verified', status: 401 })
    );

    assertThat(
      dayjs(expiresAt).isValid() && dayjs(expiresAt).isAfter(dayjs()),
      new RequestError({ code: 'session.passwordless_verification_expired', status: 401 })
    );

    // eslint-disable-next-line @silverhand/fp/no-let
    let user: User;

    if (via === 'sms') {
      assertThat(
        phone && (await hasUserWithPhone(phone)),
        new RequestError({ code: 'user.phone_not_exists', status: 422 })
      );
      // eslint-disable-next-line @silverhand/fp/no-mutation
      user = await findUserByPhone(phone);
    } else {
      assertThat(
        email && (await hasUserWithEmail(email)),
        new RequestError({ code: 'user.email_not_exists', status: 422 })
      );
      // eslint-disable-next-line @silverhand/fp/no-mutation
      user = await findUserByEmail(email);
    }

    const { id } = user;
    ctx.log(type, { userId: id });

    await updateUserById(id, { lastSignInAt: Date.now() });
    await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

    return next();
  };
}
