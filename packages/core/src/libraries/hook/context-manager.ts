import {
  InteractionEvent,
  InteractionHookEvent,
  type InteractionHookEventPayload,
  type User,
  managementApiHooksRegistration,
  type DataHookEvent,
  type InteractionApiMetadata,
  type ManagementApiContext,
  userInfoSelectFields,
  type ExceptionHookEvent,
} from '@logto/schemas';
import { pick } from '@silverhand/essentials';
import { type Context } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import {
  buildManagementApiContext,
  buildManagementApiDataHookRegistrationKey,
  hasRegisteredDataHookEvent,
} from './utils.js';

export type HookMetadata = {
  userAgent?: string;
  ip: string;
} & Partial<InteractionApiMetadata>;

export type HookContext = {
  /** Data details */
  data?: unknown;
} & Partial<ManagementApiContext> &
  Record<string, unknown>;

type UserContext = {
  /**
   * This user will be picked with {@link userInfoSelectFields} and set to the `data` field. The
   * original user object will be discarded.
   *
   * @example
   * const context = { user: { ... } };
   *
   * // The actual context to send will be:
   * { data: pick(user, ...userInfoSelectFields) }
   */
  user: User;
};

/**
 * A map of data hook event to its context type for better type hinting.
 */
type DataHookContextMap = {
  'Organization.Membership.Updated': { organizationId: string };
  'User.Created': UserContext;
  'User.Data.Updated': UserContext;
  'User.Deleted': UserContext;
};

export class HookContextManager {
  /**
   * Data hooks are triggered when certain data mutations occur. E.g. user creation, user update, etc.
   * Note that these hooks are only triggered for successful requests.
   */
  dataHookContextArray: Array<HookContext & { event: DataHookEvent }> = [];
  /**
   * Exception hooks are triggered when exceptions occur during request processing.
   */
  exceptionHookContextArray: Array<HookContext & { event: ExceptionHookEvent }> = [];

  constructor(public metadata: HookMetadata) {}

  getRegisteredHookEventContext(
    ctx: IRouterParamContext & Context
  ): Readonly<[DataHookEvent, HookContext]> | undefined {
    const { method, _matchedRoute: matchedRoute } = ctx;

    const key = buildManagementApiDataHookRegistrationKey(method, matchedRoute);

    if (!hasRegisteredDataHookEvent(key)) {
      return;
    }

    return Object.freeze([
      managementApiHooksRegistration[key],
      {
        ...buildManagementApiContext(ctx),
        data: ctx.response.body,
      },
    ]);
  }

  appendDataHookContext<Event extends DataHookEvent>(
    event: Event,
    context: Event extends keyof DataHookContextMap
      ? DataHookContextMap[Event] & Partial<ManagementApiContext> & Record<string, unknown>
      : HookContext
  ) {
    const { user, ...rest } = context;
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    this.dataHookContextArray.push({
      event,
      // eslint-disable-next-line no-restricted-syntax -- trust the input
      ...(user ? { data: pick(user as User, ...userInfoSelectFields) } : {}),
      ...rest,
    });
  }

  appendExceptionHookContext<Event extends ExceptionHookEvent>(event: Event, context: HookContext) {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    this.exceptionHookContextArray.push({
      event,
      ...context,
    });
  }
}

type InteractionHookMetadata = {
  userAgent?: string;
  userIp?: string;
} & InteractionApiMetadata;

/**
 * A success-only interaction hook result.
 *
 * @remarks
 * Results of this type are released only after the current request completes successfully. This
 * remains the default interaction-hook path so existing call sites can keep using
 * {@link assignInteractionHookResult} without opting into a custom release policy.
 */
type ReleaseOnSuccessInteractionHookResult = {
  userId: string;
  event?: Exclude<InteractionHookEvent, InteractionHookEvent.PostSignInAdaptiveMfaTriggered>;
};

/**
 * A release-anyway interaction hook result.
 *
 * @remarks
 * Results of this type are dispatched from the middleware `finally` path because the interaction is
 * considered to have happened even if the current request later throws. Adaptive MFA uses this path
 * so the webhook is still sent when the request ends with `session.mfa.require_mfa_verification`.
 */
type ReleaseAnywayInteractionHookResult = {
  userId: string;
  event: InteractionHookEvent.PostSignInAdaptiveMfaTriggered;
  payload: Pick<InteractionHookEventPayload, 'adaptiveMfaResult'>;
};

type InteractionHookResultUnion =
  | ReleaseOnSuccessInteractionHookResult
  | ReleaseAnywayInteractionHookResult;

export type InteractionHookDispatchContext = {
  metadata: InteractionHookMetadata;
  hookEvent: InteractionHookEvent;
  interactionHookResults: readonly InteractionHookResultUnion[];
};

const interactionEventToHookEvent: Record<InteractionEvent, InteractionHookEvent> = {
  [InteractionEvent.Register]: InteractionHookEvent.PostRegister,
  [InteractionEvent.SignIn]: InteractionHookEvent.PostSignIn,
  [InteractionEvent.ForgotPassword]: InteractionHookEvent.PostResetPassword,
};

export class InteractionHookContextManager {
  public releaseOnSuccessInteractionHookResultArray: ReleaseOnSuccessInteractionHookResult[] = [];
  public releaseAnywayInteractionHookResultArray: ReleaseAnywayInteractionHookResult[] = [];

  constructor(public metadata: InteractionHookMetadata) {}

  get hookEvent() {
    return interactionEventToHookEvent[this.metadata.interactionEvent];
  }

  get interactionHookResults(): readonly InteractionHookResultUnion[] {
    return [
      ...this.releaseOnSuccessInteractionHookResults,
      ...this.releaseAnywayInteractionHookResults,
    ];
  }

  get releaseOnSuccessInteractionHookResults(): readonly ReleaseOnSuccessInteractionHookResult[] {
    return this.releaseOnSuccessInteractionHookResultArray;
  }

  get releaseAnywayInteractionHookResults(): readonly ReleaseAnywayInteractionHookResult[] {
    return this.releaseAnywayInteractionHookResultArray;
  }

  getReleaseOnSuccessDispatchContext(): InteractionHookDispatchContext {
    return {
      metadata: this.metadata,
      hookEvent: this.hookEvent,
      interactionHookResults: this.releaseOnSuccessInteractionHookResults,
    };
  }

  getReleaseAnywayDispatchContext(): InteractionHookDispatchContext {
    return {
      metadata: this.metadata,
      hookEvent: this.hookEvent,
      interactionHookResults: this.releaseAnywayInteractionHookResults,
    };
  }

  /**
   * Assign a success-only interaction hook result to trigger webhook.
   *
   * @remarks
   * This method is kept as the default entry point for backward compatibility with the existing
   * success-only callers. It is intentionally implemented as an alias of
   * {@link assignReleaseOnSuccessInteractionHookResult} so callers that do not need an explicit
   * release policy can keep using the historical API, while release-anyway callers opt in via
   * {@link assignReleaseAnywayInteractionHookResult}.
   *
   * Calling it multiple times will queue multiple webhook triggers.
   * @param result The result to assign.
   */
  assignInteractionHookResult(result: ReleaseOnSuccessInteractionHookResult) {
    this.assignReleaseOnSuccessInteractionHookResult(result);
  }

  /**
   * Assign an interaction hook result that should only be released after the request completes
   * successfully.
   */
  assignReleaseOnSuccessInteractionHookResult(result: ReleaseOnSuccessInteractionHookResult) {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    this.releaseOnSuccessInteractionHookResultArray.push(result);
  }

  /**
   * Assign an interaction hook result that should still be released even if the current request
   * later throws.
   */
  assignReleaseAnywayInteractionHookResult(result: ReleaseAnywayInteractionHookResult) {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    this.releaseAnywayInteractionHookResultArray.push(result);
  }
}
