import { InteractionEvent, InteractionHookEvent } from '@logto/schemas';

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

export const interactionEventToHookEvent: Record<InteractionEvent, InteractionHookEvent> = {
  [InteractionEvent.Register]: InteractionHookEvent.PostRegister,
  [InteractionEvent.SignIn]: InteractionHookEvent.PostSignIn,
  [InteractionEvent.ForgotPassword]: InteractionHookEvent.PostResetPassword,
};
