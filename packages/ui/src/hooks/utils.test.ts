import { ConnectorData } from '@/types';

import { filterSocialConnectors } from './utils';

const mockConnectors = [
  { platform: 'Web', target: 'facebook' },
  { platform: 'Web', target: 'google' },
  { platform: 'Universal', target: 'facebook' },
  { platform: 'Universal', target: 'WeChat' },
  { platform: 'Native', target: 'WeChat' },
  { platform: 'Native', target: 'Alipay' },
] as ConnectorData[];

describe('filterSocialConnectors', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('undefined input should return empty list', () => {
    expect(filterSocialConnectors()).toEqual([]);
  });

  it('filter web connectors', () => {
    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Web', target: 'facebook' },
      { platform: 'Web', target: 'google' },
      { platform: 'Universal', target: 'WeChat' },
    ]);
  });

  it('filter Native connectors', () => {
    /* eslint-disable @silverhand/fp/no-mutation */
    // @ts-expect-error mock global object
    globalThis.logtoNativeSdk = {
      platform: 'ios',
      supportedSocialConnectorTargets: ['Web', 'WeChat'],
    };
    /* eslint-enable @silverhand/fp/no-mutation */

    expect(filterSocialConnectors(mockConnectors)).toEqual([
      { platform: 'Universal', target: 'facebook' },
      { platform: 'Native', target: 'WeChat' },
    ]);
  });
});
