import type { LogKey } from '@logto/schemas';
import type { PromptDetail } from 'oidc-provider';

import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { interactionEndedListener, interactionStartedListener } from './interaction.js';

const { jest } = import.meta;

const userId = 'userIdValue';
const sessionId = 'sessionIdValue';
const applicationId = 'applicationIdValue';

const log = createMockLogContext();

const entities = {
  Account: { accountId: userId },
  Session: { jti: sessionId },
  Client: { clientId: applicationId },
};

const prompt: PromptDetail = {
  name: 'login',
  reasons: ['foo', 'bar'],
  details: {
    foo: 'bar',
  },
};

const baseCallArgs = { applicationId, sessionId, userId };

const testInteractionListener = (
  listener: typeof interactionStartedListener | typeof interactionEndedListener,
  parameters: { grant_type: string } & Record<string, unknown>,
  expectLogKey: LogKey,
  expectPrompt?: PromptDetail
) => {
  const ctx = {
    ...createContextWithRouteParameters(),
    createLog: log.createLog,
    oidc: { entities, params: parameters },
  };

  // @ts-expect-error pass complex type check to mock ctx directly
  listener(ctx, expectPrompt);
  expect(log.createLog).toHaveBeenCalledWith(expectLogKey);
  expect(log.mockAppend).toHaveBeenCalledWith({
    ...baseCallArgs,
    params: parameters,
    prompt: expectPrompt,
  });
};

describe('interactionStartedListener', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log proper interaction started info', async () => {
    testInteractionListener(
      interactionStartedListener,
      { grant_type: 'authorization_code', code: 'codeValue' },
      'Interaction.Create',
      prompt
    );
  });

  it('should log proper interaction ended info', async () => {
    testInteractionListener(
      interactionEndedListener,
      { grant_type: 'authorization_code', code: 'codeValue' },
      'Interaction.End'
    );
  });
});
