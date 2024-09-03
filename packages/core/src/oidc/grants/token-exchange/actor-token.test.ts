import { errors, type KoaContextWithOIDC } from 'oidc-provider';
import Sinon from 'sinon';

import { createOidcContext } from '#src/test-utils/oidc-provider.js';

import { handleActorToken } from './actor-token.js';
import { TokenExchangeTokenType } from './types.js';

const { InvalidGrant } = errors;

const actorId = 'some_account_id';

const validOidcContext: Partial<KoaContextWithOIDC['oidc']> = {
  params: {
    actor_token: 'some_actor_token',
    actor_token_type: TokenExchangeTokenType.AccessToken,
  },
};

beforeAll(() => {
  // `oidc-provider` will warn for dev interactions
  Sinon.stub(console, 'warn');
});

afterAll(() => {
  Sinon.restore();
});

describe('handleActorToken', () => {
  it('should return actorId', async () => {
    const ctx = createOidcContext(validOidcContext);
    Sinon.stub(ctx.oidc.provider.AccessToken, 'find').resolves({
      accountId: actorId,
      scope: 'openid',
    });

    await expect(handleActorToken(ctx)).resolves.toStrictEqual({
      actorId,
    });
  });

  it('should return empty actorId when params are not present', async () => {
    const ctx = createOidcContext({ params: {} });

    await expect(handleActorToken(ctx)).resolves.toStrictEqual({
      actorId: undefined,
    });
  });

  it('should throw if actor_token_type is invalid', async () => {
    const ctx = createOidcContext({
      params: {
        actor_token: 'some_actor_token',
        actor_token_type: 'invalid',
      },
    });

    await expect(handleActorToken(ctx)).rejects.toThrow(
      new InvalidGrant('unsupported actor token type')
    );
  });

  it('should throw if actor_token is invalid', async () => {
    const ctx = createOidcContext(validOidcContext);
    Sinon.stub(ctx.oidc.provider.AccessToken, 'find').rejects();

    await expect(handleActorToken(ctx)).rejects.toThrow(new InvalidGrant('invalid actor token'));
  });
});
