import { logtoCloudConsoleUrl } from './external-links';

describe('external links', () => {
  it('uses the cloud console URL for OSS members upsell entry', () => {
    expect(logtoCloudConsoleUrl).toBe('https://cloud.logto.io');
  });
});
