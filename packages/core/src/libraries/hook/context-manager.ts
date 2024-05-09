import { InteractionEvent, InteractionHookEvent, type DataHookEvent } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

import type { InteractionApiMetadata, ManagementApiContext } from './type.js';

type DataHookMetadata = {
  userAgent?: string;
  ip: string;
} & Partial<InteractionApiMetadata>;

type DataHookContext = {
  event: DataHookEvent;
  /** Data details */
  data?: unknown;
} & Partial<ManagementApiContext>;

export class DataHookContextManager {
  contextArray: DataHookContext[] = [];

  constructor(public metadata: DataHookMetadata) {}

  appendContext(context: DataHookContext) {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    this.contextArray.push(context);
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
export type InteractionHookResult = {
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
