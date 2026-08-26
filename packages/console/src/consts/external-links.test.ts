import {
  buildOfficialWebsiteContactPageUrl,
  logtoCloudConsoleUrl,
  selfHostedPlansLink,
} from './external-links';

describe('external links', () => {
  it('uses the cloud console URL for OSS members upsell entry', () => {
    expect(logtoCloudConsoleUrl).toBe('https://cloud.logto.io');
  });

  it('points self-hosted plans upsell at the public landing page', () => {
    expect(selfHostedPlansLink).toBe('https://logto.io/self-hosted-plans');
  });

  it('attributes official website contact links', () => {
    const url = new URL(buildOfficialWebsiteContactPageUrl('private-cloud'));

    expect(url.origin).toBe('https://logto.io');
    expect(url.pathname).toBe('/contact');
    expect(url.searchParams.get('src')).toBe('private-cloud');
  });
});
