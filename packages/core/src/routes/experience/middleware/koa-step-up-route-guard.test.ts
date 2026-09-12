import { AuthenticationContextMode, InteractionEvent, LogtoAcr } from '@logto/schemas';
import { type ParameterizedContext } from 'koa';
import { type RequestMethod } from 'node-mocks-http';

import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { experienceRoutes } from '../const.js';
import { type ExperienceInteractionRouterContext } from '../types.js';

import koaStepUpRouteGuard from './koa-step-up-route-guard.js';

const { jest } = import.meta;

type GuardContext = ParameterizedContext<unknown, ExperienceInteractionRouterContext>;

/** Where the stored interaction record carries the pure step-up mode. */
type StepUpSource = 'none' | 'prompt' | 'result' | 'invalid-result';

const stepUpContext = {
  requestedAcrValues: [LogtoAcr.FirstFactor],
  selectedAcr: LogtoAcr.FirstFactor,
  mode: AuthenticationContextMode.StepUp,
};

/** A stored context this build cannot read: an ACR value a newer node wrote. */
const unreadableStepUpContext = { requestedAcrValues: ['urn:logto:acr:unknown'] };

/** The stored result each {@link StepUpSource} restores from, when it has one. */
const storedResults: Partial<Record<StepUpSource, Record<string, unknown>>> = {
  result: { interactionEvent: InteractionEvent.SignIn, authenticationContext: stepUpContext },
  'invalid-result': {
    interactionEvent: InteractionEvent.SignIn,
    authenticationContext: unreadableStepUpContext,
  },
};

const createMockContext = ({
  method,
  path,
  isStepUp,
  storedStepUp = 'none',
}: {
  method: string;
  path: string;
  isStepUp?: boolean;
  storedStepUp?: StepUpSource;
}) =>
  ({
    ...createContextWithRouteParameters({ url: path, method: method as RequestMethod }),
    // The Koa context delegates `method` to the prototype, so the spread drops it.
    method: method as RequestMethod,
    // Missing when the interaction middleware whitelists the route.
    ...(isStepUp === undefined
      ? {}
      : {
          experienceInteraction: { isStepUp },
        }),
    // The stored interaction record, as `koaInteractionDetails` provides it: the login prompt
    // details a step-up interaction carries from creation, and the saved result it restores from.
    interactionDetails: {
      prompt: {
        name: 'login',
        details: storedStepUp === 'prompt' ? { authenticationContext: stepUpContext } : {},
      },
      // Only the stored result an interaction is restored from, without the prompt details.
      ...(storedResults[storedStepUp] ? { result: storedResults[storedStepUp] } : {}),
    },
  }) as unknown as GuardContext;

// The full experience route catalog, with the pure step-up enforcement expected on each. Routes
// outside the allow-list must fail with 403 `session.step_up.forbidden_route`.
const routeCases: Array<{ method: string; path: string; allowed: boolean; name: string }> = [
  {
    method: 'PUT',
    path: experienceRoutes.prefix,
    allowed: true,
    name: 'interaction creation and re-mount',
  },
  { method: 'GET', path: experienceRoutes.interaction, allowed: true, name: 'read interaction' },
  { method: 'POST', path: `${experienceRoutes.prefix}/submit`, allowed: true, name: 'submit' },
  { method: 'POST', path: experienceRoutes.identification, allowed: true, name: 'identification' },
  {
    method: 'PUT',
    path: `${experienceRoutes.prefix}/interaction-event`,
    allowed: false,
    name: 'interaction-event switching',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/password`,
    allowed: true,
    name: 'pinned-user password',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/verification-code`,
    allowed: true,
    name: 'pinned-user code send',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/verification-code/verify`,
    allowed: true,
    name: 'pinned-user code verify',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/mfa-verification-code`,
    allowed: true,
    name: 'MFA code send',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/mfa-verification-code/verify`,
    allowed: true,
    name: 'MFA code verify',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/social/connector-id/authorization-uri`,
    allowed: false,
    name: 'social authorization uri',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/social/connector-id/verify`,
    allowed: false,
    name: 'social verify',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/sso/connector-id/authorization-uri`,
    allowed: false,
    name: 'SSO authorization uri',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/sso/connector-id/verify`,
    allowed: false,
    name: 'SSO verify',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/totp/secret`,
    allowed: false,
    name: 'TOTP enrollment',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/totp/verify`,
    allowed: true,
    name: 'TOTP verify',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/web-authn/registration`,
    allowed: false,
    name: 'WebAuthn enrollment',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/web-authn/registration/verify`,
    allowed: false,
    name: 'WebAuthn enrollment verify',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/web-authn/authentication`,
    allowed: true,
    name: 'WebAuthn authentication',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/web-authn/authentication/verify`,
    allowed: true,
    name: 'WebAuthn authentication verify',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/sign-in-passkey/authentication`,
    allowed: false,
    name: 'sign-in passkey authentication',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/sign-in-passkey/authentication/verify`,
    allowed: false,
    name: 'sign-in passkey authentication verify',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/backup-code/generate`,
    allowed: false,
    name: 'backup code enrollment',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/backup-code/verify`,
    allowed: true,
    name: 'backup code verify',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/new-password-identity`,
    allowed: false,
    name: 'new-password identity',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.verification}/one-time-token/verify`,
    allowed: false,
    name: 'one-time token',
  },
  { method: 'POST', path: experienceRoutes.profile, allowed: false, name: 'profile update' },
  {
    method: 'POST',
    path: `${experienceRoutes.prefix}/user-assets/avatar`,
    allowed: false,
    name: 'user assets',
  },
  {
    method: 'PUT',
    path: `${experienceRoutes.profile}/password`,
    allowed: false,
    name: 'forgot-password reset',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.mfa}/mfa-enabled`,
    allowed: false,
    name: 'MFA enabled',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.mfa}/mfa-skipped`,
    allowed: false,
    name: 'MFA skipped',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.profile}/trusted-device`,
    allowed: false,
    name: 'trusted device',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.mfa}/mfa-suggestion-skipped`,
    allowed: false,
    name: 'MFA suggestion skipped',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.mfa}/passkey-skipped`,
    allowed: false,
    name: 'passkey skipped',
  },
  {
    method: 'POST',
    path: `${experienceRoutes.mfa}/passkey`,
    allowed: false,
    name: 'sign-in passkey binding',
  },
  { method: 'POST', path: experienceRoutes.mfa, allowed: false, name: 'MFA binding' },
];

describe('koaStepUpRouteGuard', () => {
  // The mode comes from the interaction instance wherever `koaExperienceInteraction` built one,
  // even though the interaction record carries no context of its own; the prompt path only exists
  // on the whitelisted routes, which the cases below cover.
  it.each(
    routeCases.map((routeCase) => ({ ...routeCase, isStepUp: true, storedStepUp: 'none' as const }))
  )(
    '$name ($method $path) is $allowed in pure step-up via the instance',
    async ({ method, path, allowed, isStepUp, storedStepUp }) => {
      const ctx = createMockContext({ method, path, isStepUp, storedStepUp });
      const next = jest.fn();
      const guard = koaStepUpRouteGuard();

      if (allowed) {
        await expect(guard(ctx, next)).resolves.toBeUndefined();
        expect(next).toHaveBeenCalledTimes(1);
        return;
      }

      await expect(guard(ctx, next)).rejects.toMatchObject({
        code: 'session.step_up.forbidden_route',
        status: 403,
      });
      expect(next).not.toHaveBeenCalled();
    }
  );

  it.each(routeCases)(
    '$name ($method $path) is not restricted outside pure step-up',
    async ({ method, path }) => {
      const ctx = createMockContext({ method, path, isStepUp: false });
      const next = jest.fn();

      await expect(koaStepUpRouteGuard()(ctx, next)).resolves.toBeUndefined();
      expect(next).toHaveBeenCalledTimes(1);
    }
  );

  it('does not restrict a route that carries no interaction and no stored context', async () => {
    const ctx = createMockContext({
      method: 'POST',
      path: `${experienceRoutes.verification}/totp/secret`,
    });
    const next = jest.fn();

    await expect(koaStepUpRouteGuard()(ctx, next)).resolves.toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('does not restrict a whitelisted route whose stored interaction is not a step-up', async () => {
    const ctx = createMockContext({
      method: 'GET',
      path: `${experienceRoutes.prefix}/sso-connectors`,
    });
    const next = jest.fn();

    await expect(koaStepUpRouteGuard()(ctx, next)).resolves.toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      method: 'GET',
      path: `${experienceRoutes.prefix}/sso-connectors`,
      name: 'SSO connector discovery',
    },
    {
      method: 'POST',
      path: `${experienceRoutes.prefix}/preflight/sign-in-passkey/authentication`,
      name: 'passkey sign-in preflight',
    },
  ])(
    'denies $name without an interaction instance when the stored interaction is a step-up',
    async ({ method, path }) => {
      const ctx = createMockContext({ method, path, storedStepUp: 'prompt' });
      const next = jest.fn();

      await expect(koaStepUpRouteGuard()(ctx, next)).rejects.toMatchObject({
        code: 'session.step_up.forbidden_route',
        status: 403,
      });
      expect(next).not.toHaveBeenCalled();
    }
  );

  it('classifies a whitelisted route from the stored result when the prompt carries no context', async () => {
    const ctx = createMockContext({
      method: 'GET',
      path: `${experienceRoutes.prefix}/sso-connectors`,
      storedStepUp: 'result',
    });
    const next = jest.fn();

    await expect(koaStepUpRouteGuard()(ctx, next)).rejects.toMatchObject({
      code: 'session.step_up.forbidden_route',
      status: 403,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('allows re-creating a step-up interaction through the whitelisted PUT /experience', async () => {
    const ctx = createMockContext({
      method: 'PUT',
      path: experienceRoutes.prefix,
      storedStepUp: 'prompt',
    });
    const next = jest.fn();

    await expect(koaStepUpRouteGuard()(ctx, next)).resolves.toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('denies a whitelisted route whose stored record cannot be read', async () => {
    const ctx = createMockContext({
      method: 'GET',
      path: `${experienceRoutes.prefix}/sso-connectors`,
      storedStepUp: 'invalid-result',
    });
    const next = jest.fn();

    await expect(koaStepUpRouteGuard()(ctx, next)).rejects.toMatchObject({
      code: 'session.interaction_not_found',
      status: 404,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('denies a route that is not in the catalog in pure step-up', async () => {
    const ctx = createMockContext({
      method: 'GET',
      path: `${experienceRoutes.prefix}/unknown`,
      isStepUp: true,
      storedStepUp: 'prompt',
    });
    const next = jest.fn();

    await expect(koaStepUpRouteGuard()(ctx, next)).rejects.toMatchObject({
      code: 'session.step_up.forbidden_route',
      status: 403,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'a case variant', path: `${experienceRoutes.verification}/PASSWORD` },
    { name: 'a trailing slash', path: `${experienceRoutes.verification}/password/` },
    { name: 'both', path: `${experienceRoutes.verification}/Password/` },
  ])('normalizes $name of an allowed path like the router', async ({ path }) => {
    const ctx = createMockContext({
      method: 'POST',
      path,
      isStepUp: true,
      storedStepUp: 'prompt',
    });
    const next = jest.fn();

    await expect(koaStepUpRouteGuard()(ctx, next)).resolves.toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it.each([
    { name: 'a case variant', path: `${experienceRoutes.prefix}/INTERACTION-EVENT` },
    { name: 'a trailing slash', path: `${experienceRoutes.prefix}/interaction-event/` },
  ])('still denies $name of a forbidden path', async ({ path }) => {
    const ctx = createMockContext({
      method: 'PUT',
      path,
      isStepUp: true,
      storedStepUp: 'prompt',
    });
    const next = jest.fn();

    await expect(koaStepUpRouteGuard()(ctx, next)).rejects.toMatchObject({
      code: 'session.step_up.forbidden_route',
      status: 403,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
