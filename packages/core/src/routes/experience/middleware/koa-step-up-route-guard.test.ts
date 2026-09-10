import RequestError from '#src/errors/RequestError/index.js';

import { experienceRoutes } from '../const.js';

import koaStepUpRouteGuard from './koa-step-up-route-guard.js';

const { jest } = import.meta;

const createMockContext = ({
  method = 'GET',
  path = experienceRoutes.interaction,
  isStepUp = true,
}: {
  method?: string;
  path?: string;
  isStepUp?: boolean;
} = {}) => ({
  method,
  path,
  experienceInteraction: {
    isStepUp,
  },
});

describe('koaStepUpRouteGuard', () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when not in step-up mode', () => {
    it('allows any route when experienceInteraction is undefined', async () => {
      const guard = koaStepUpRouteGuard();
      const ctx = {
        method: 'POST',
        path: `${experienceRoutes.prefix}/profile`,
        experienceInteraction: undefined,
      };
      await guard(ctx as never, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('allows any route when isStepUp is false', async () => {
      const guard = koaStepUpRouteGuard();
      const ctx = createMockContext({
        method: 'POST',
        path: `${experienceRoutes.prefix}/profile`,
        isStepUp: false,
      });
      await guard(ctx as never, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('allowed routes in step-up mode', () => {
    const allowedCases: Array<[method: string, path: string]> = [
      ['GET', experienceRoutes.interaction],
      ['POST', `${experienceRoutes.prefix}/submit`],
      ['POST', experienceRoutes.identification],
      ['POST', `${experienceRoutes.verification}/password`],
      ['POST', `${experienceRoutes.verification}/verification-code`],
      ['POST', `${experienceRoutes.verification}/verification-code/verify`],
      ['POST', `${experienceRoutes.verification}/mfa-verification-code`],
      ['POST', `${experienceRoutes.verification}/mfa-verification-code/verify`],
      ['POST', `${experienceRoutes.verification}/totp/verify`],
      ['POST', `${experienceRoutes.verification}/backup-code/verify`],
      ['POST', `${experienceRoutes.verification}/web-authn/authentication`],
      ['POST', `${experienceRoutes.verification}/web-authn/authentication/verify`],
      ['PUT', experienceRoutes.prefix],
    ];

    it.each(allowedCases)('allows %s %s in step-up mode', async (method, path) => {
      const guard = koaStepUpRouteGuard();
      const ctx = createMockContext({ method, path, isStepUp: true });
      await guard(ctx as never, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('method and path boundaries', () => {
    it('denies HEAD requests on allowed paths', async () => {
      const guard = koaStepUpRouteGuard();
      const ctx = createMockContext({
        method: 'HEAD',
        path: experienceRoutes.interaction,
        isStepUp: true,
      });
      await expect(guard(ctx as never, next)).rejects.toMatchError(
        new RequestError({ code: 'session.step_up.forbidden_route', status: 403 })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it.each([
      ['GET', '/EXPERIENCE/INTERACTION'],
      ['POST', '/EXPERIENCE/SUBMIT'],
      ['POST', '/EXPERIENCE/VERIFICATION/MFA-VERIFICATION-CODE'],
      ['PUT', '/EXPERIENCE'],
    ])('accepts uppercase path: %s %s', async (method, path) => {
      const guard = koaStepUpRouteGuard();
      const ctx = createMockContext({ method, path, isStepUp: true });
      await guard(ctx as never, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['GET', `${experienceRoutes.interaction}/`],
      ['POST', `${experienceRoutes.prefix}/submit/`],
      ['POST', `${experienceRoutes.verification}/password/`],
      ['PUT', `${experienceRoutes.prefix}/`],
    ])('accepts trailing slash: %s %s', async (method, path) => {
      const guard = koaStepUpRouteGuard();
      const ctx = createMockContext({ method, path, isStepUp: true });
      await guard(ctx as never, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('handles requests where path is evaluated independently of query parameters', async () => {
      const guard = koaStepUpRouteGuard();
      const ctx = {
        ...createMockContext({
          method: 'GET',
          path: experienceRoutes.interaction,
          isStepUp: true,
        }),
        querystring: 'foo=bar&baz=1',
      };
      await guard(ctx as never, next);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['DELETE', experienceRoutes.interaction],
      ['GET', `${experienceRoutes.prefix}/submit`],
      ['GET', experienceRoutes.identification],
      ['GET', `${experienceRoutes.verification}/password`],
      ['DELETE', experienceRoutes.prefix],
      ['PATCH', `${experienceRoutes.prefix}/submit`],
    ])('denies disallowed HTTP method on allowed path: %s %s', async (method, path) => {
      const guard = koaStepUpRouteGuard();
      const ctx = createMockContext({ method, path, isStepUp: true });
      await expect(guard(ctx as never, next)).rejects.toMatchError(
        new RequestError({ code: 'session.step_up.forbidden_route', status: 403 })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it.each([
      ['POST', `${experienceRoutes.prefix}/profile`],
      ['PUT', `${experienceRoutes.profile}/password`],
      ['POST', `${experienceRoutes.prefix}/profile/mfa`],
      ['PUT', `${experienceRoutes.prefix}/interaction-event`],
      ['GET', `${experienceRoutes.prefix}/sso-connectors`],
      ['POST', `${experienceRoutes.prefix}/preflight/sign-in-passkey/authentication`],
      ['POST', `${experienceRoutes.verification}/social/github/verify`],
      ['POST', `${experienceRoutes.verification}/sso/saml/verify`],
      ['POST', `${experienceRoutes.verification}/totp/secret`],
      ['POST', `${experienceRoutes.verification}/backup-code/generate`],
      ['POST', `${experienceRoutes.verification}/web-authn/registration`],
    ])('denies forbidden path: %s %s', async (method, path) => {
      const guard = koaStepUpRouteGuard();
      const ctx = createMockContext({ method, path, isStepUp: true });
      await expect(guard(ctx as never, next)).rejects.toMatchError(
        new RequestError({ code: 'session.step_up.forbidden_route', status: 403 })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
