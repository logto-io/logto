import { type User } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import type { Provider } from 'oidc-provider';

import { mockUser } from '#src/__mocks__/user.js';
import type Queries from '#src/tenants/Queries.js';
import { GrantMock, createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { consent } from './session.js';

const { jest } = import.meta;

class Grant extends GrantMock {
  id: string;

  constructor() {
    super();
    this.id = generateStandardId();
  }
}

const oidcSessionExtensionsInsert = jest.fn(async () => ({ ok: true }));
const userQueries = {
  findUserById: jest.fn(async (): Promise<User> => mockUser),
  updateUserById: jest.fn(async (..._args: unknown[]) => ({ id: 'id' })),
};

const queries = {
  users: userQueries,
  oidcSessionExtensions: { insert: oidcSessionExtensionsInsert },
} as unknown as Queries;
const context = createContextWithRouteParameters();

type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;

describe('saveInteractionLastSubmissionToSession', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should merge sessionContext into lastSubmission before persisting', async () => {
    const sessionContext = {
      injectedHeaders: { country: 'US' },
      adaptiveMfa: { requiresMfa: true, triggeredRules: [] },
    };
    const interactionDetails = {
      session: { accountId: mockUser.id, uid: 'sessionUid' },
      params: { client_id: 'clientId' },
      prompt: { details: {} },
      lastSubmission: { foo: 'bar' },
      result: { sessionContext },
    } as unknown as Interaction;

    const provider = createMockProvider(jest.fn().mockResolvedValue(interactionDetails), Grant);

    await consent({ ctx: context, provider, queries, interactionDetails });

    expect(oidcSessionExtensionsInsert).toHaveBeenCalledWith({
      sessionUid: 'sessionUid',
      accountId: mockUser.id,
      lastSubmission: { foo: 'bar', sessionContext },
    });
  });
});
