import { InteractionEvent, InteractionHookEvent, type ManagementHookEvent } from '@logto/schemas';

type ManagementHookContext = {
  event: ManagementHookEvent;
  data: unknown;
};

type ManagementHookMetadata = {
  userAgent?: string;
  ip: string;
};

/**
 * The class for managing Management API hook contexts.
 */
export class ManagementHookContextManager {
  contextArray: ManagementHookContext[] = [];

  constructor(public metadata: ManagementHookMetadata) {}

  appendContext(context: ManagementHookContext) {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    this.contextArray.push(context);
  }
}

/**
 * The context for triggering interaction hooks by `triggerInteractionHooks`.
 * In the `koaInteractionHooks` middleware,
 * we will store the context before processing the interaction and consume it after the interaction is processed if needed.
 */
export type InteractionHookContext = {
  event: InteractionEvent;
  sessionId?: string;
  applicationId?: string;
  userIp?: string;
};

/**
 * The interaction hook result for triggering interaction hooks by `triggerInteractionHooks`.
 * In the `koaInteractionHooks` middleware,
 * if we get an interaction hook result after the interaction is processed, related hooks will be triggered.
 */
export type InteractionHookResult = {
  userId: string;
};

export const eventToHook: Record<InteractionEvent, InteractionHookEvent> = {
  [InteractionEvent.Register]: InteractionHookEvent.PostRegister,
  [InteractionEvent.SignIn]: InteractionHookEvent.PostSignIn,
  [InteractionEvent.ForgotPassword]: InteractionHookEvent.PostResetPassword,
};
