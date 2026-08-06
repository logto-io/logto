import type { LogKey } from '@logto/schemas';
import type { PromptDetail } from 'oidc-provider';

import { mockEnvSet } from '#src/test-utils/env-set.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { createInteractionEndedListener, createInteractionStartedListener } from './interaction.js';

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
  listener:
    | ReturnType<typeof createInteractionStartedListener>
    | ReturnType<typeof createInteractionEndedListener>,
  parameters: { grant_type: string } & Record<string, unknown>,
  expectLogKey: LogKey,
  expectPrompt?: PromptDetail
) => {
  const ctx = {
    ...createContextWithRouteParameters(),
    createLog: log.createLog,
    prependAllLogEntries: log.prependAllLogEntries,
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
      createInteractionStartedListener(mockEnvSet),
      { grant_type: 'authorization_code', code: 'codeValue' },
      'Interaction.Create',
      prompt
    );
  });

  it('should log proper interaction ended info', async () => {
    testInteractionListener(
      createInteractionEndedListener(mockEnvSet),
      { grant_type: 'authorization_code', code: 'codeValue' },
      'Interaction.End'
    );
  });
});
