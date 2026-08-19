import { LogtoActionKey } from '@logto/schemas';

import { getDefaultContextSample, getDefaultScript } from './config';

describe('action editor config', () => {
  it('keeps the untouched post-first-factor-verification starter fail closed', async () => {
    const script = getDefaultScript(LogtoActionKey.PostFirstFactorVerification);
    // eslint-disable-next-line no-new-func -- the test needs to evaluate the starter script it ships; the input is a local constant, not user data.
    const runAction = new Function(`${script}\nreturn runAction;`)() as (payload: {
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
