import { InteractionEvent, InteractionHookEvent, type DataHookEvent } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

type DataHookContext = {
  event: DataHookEvent;
  data?: Record<string, unknown>;
};

type DataHookMetadata = {
  userAgent?: string;
  ip: string;
};

export class DataHookContextManager {
  contextArray: DataHookContext[] = [];

  constructor(public metadata: DataHookMetadata) {}

  appendContext({ event, data }: DataHookContext) {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    this.contextArray.push({ event, data });
  }
}

/**
 * The context for triggering interaction hooks by `triggerInteractionHooks`.
 * In the `koaInteractionHooks` middleware,
 * we will store the context before processing the interaction and consume it after the interaction is processed if needed.
 */
type InteractionHookMetadata = {
  interactionEvent: InteractionEvent;
  userAgent?: string;
  userIp?: string;
  applicationId?: string;
  sessionId?: string;
};

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
