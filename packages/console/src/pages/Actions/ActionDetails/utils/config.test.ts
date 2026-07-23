import { runInNewContext } from 'node:vm';

import { LogtoActionKey } from '@logto/schemas';

import { getDefaultContextSample, getDefaultScript } from './config';

describe('action editor config', () => {
  it('keeps the untouched post-first-factor-verification starter fail closed', async () => {
    const script = getDefaultScript(LogtoActionKey.PostFirstFactorVerification);
    const runAction = runInNewContext(`${script}\nrunAction;`) as (payload: {
      event: ReturnType<typeof getDefaultContextSample>;
      environmentVariables: Record<string, string>;
    }) => Promise<unknown>;

    await expect(
      runAction({
        event: getDefaultContextSample(LogtoActionKey.PostFirstFactorVerification),
        environmentVariables: {},
      })
    ).resolves.toBeUndefined();
  });
});
