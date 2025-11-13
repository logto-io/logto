import {
  InteractionEvent,
  InteractionHookEvent,
  type User,
  managementApiHooksRegistration,
  type DataHookEvent,
  type InteractionApiMetadata,
  type ManagementApiContext,
  userInfoSelectFields,
  type ExceptionHookEvent,
} from '@logto/schemas';
import { pick, type Optional } from '@silverhand/essentials';
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
 * The interaction hook result for triggering interaction hooks by `triggerInteractionHooks`.
 * In the `koaInteractionHooks` middleware,
 * if we get an interaction hook result after the interaction is processed, related hooks will be triggered.
 */
type InteractionHookResult = {
  userId: string;
};

const interactionEventToHookEvent: Record<InteractionEvent, InteractionHookEvent> = {
  [InteractionEvent.Register]: InteractionHookEvent.PostRegister,
  [InteractionEvent.SignIn]: InteractionHookEvent.PostSignIn,
  [InteractionEvent.ForgotPassword]: InteractionHookEvent.PostResetPassword,
};

export class InteractionHookContextManager {
  public interactionHookResult: Optional<InteractionHookResult>;

  constructor(public metadata: InteractionHookMetadata) {}

  get hookEvent() {
    return interactionEventToHookEvent[this.metadata.interactionEvent];
  }

  /**
   * Assign an interaction hook result to trigger webhook.
   * Calling it multiple times will overwrite the original result, but only one webhook will be triggered.
   * @param result The result to assign.
   */
  assignInteractionHookResult(result: InteractionHookResult) {
    this.interactionHookResult = result;
  }
}
