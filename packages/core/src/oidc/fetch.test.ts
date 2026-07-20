import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';

import providerFetch from './fetch.js';

const dispatcher = Symbol('dispatcher');
const requestInit: RequestInit & { dispatcher?: unknown } = {
  method: 'POST',
  dispatcher,
};

describe('providerFetch', () => {
  afterEach(() => {
    Sinon.restore();
  });

  it('should drop the SSRF-protecting dispatcher for self-hosted deployments', async () => {
    Sinon.stub(EnvSet, 'values').value({ ...EnvSet.values, isCloud: false });
    const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response());

    await providerFetch('https://rp.example.com/backchannel-logout', requestInit);

    expect(fetchStub.calledOnce).toBe(true);
    const [, init] = fetchStub.firstCall.args;
    expect(init).toMatchObject({ method: 'POST' });
    expect(init).not.toHaveProperty('dispatcher');
  });

  it('should keep the SSRF-protecting dispatcher in cloud', async () => {
    Sinon.stub(EnvSet, 'values').value({ ...EnvSet.values, isCloud: true });
    const fetchStub = Sinon.stub(globalThis, 'fetch').resolves(new Response());

    await providerFetch('https://rp.example.com/backchannel-logout', requestInit);

    expect(fetchStub.calledOnce).toBe(true);
    const [, init] = fetchStub.firstCall.args;
    expect(init).toHaveProperty('dispatcher', dispatcher);
  });
});
