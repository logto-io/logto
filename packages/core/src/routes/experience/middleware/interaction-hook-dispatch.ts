import { InteractionHookEvent } from '@logto/schemas';

import { InteractionHookContextManager } from '#src/libraries/hook/context-manager.js';

export const createInteractionHookContext = (
  metadata: ConstructorParameters<typeof InteractionHookContextManager>[0],
  interactionHookResults: ReadonlyArray<
    Parameters<InteractionHookContextManager['assignInteractionHookResult']>[0]
  >
) => {
  const filteredInteractionHookContext = new InteractionHookContextManager(metadata);

  for (const interactionHookResult of interactionHookResults) {
    filteredInteractionHookContext.assignInteractionHookResult(interactionHookResult);
  }

  return filteredInteractionHookContext;
};

export const shouldReleaseInteractionHookAnyway = (
  interactionHookResult: Parameters<InteractionHookContextManager['assignInteractionHookResult']>[0]
) => interactionHookResult.event === InteractionHookEvent.PostSignInAdaptiveMfaTriggered;
