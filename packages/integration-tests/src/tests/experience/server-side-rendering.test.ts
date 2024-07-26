import { demoAppApplicationId, fullSignInExperienceGuard } from '@logto/schemas';
import { z } from 'zod';

import { demoAppUrl } from '#src/constants.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { Trace } from '#src/ui-helpers/trace.js';

const ssrDataGuard = z.object({
  signInExperience: z.object({
    appId: z.string().optional(),
    organizationId: z.string().optional(),
    data: fullSignInExperienceGuard,
  }),
  phrases: z.object({
    lng: z.string(),
    data: z.record(z.unknown()),
  }),
});

describe('server-side rendering', () => {
  const trace = new Trace();
  const expectTraceNotToHaveWellKnownEndpoints = async () => {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    const traceData: { traceEvents: unknown[] } = await trace.read();
    expect(traceData.traceEvents).not.toContainEqual(
      expect.objectContaining({
        args: expect.objectContaining({
          data: expect.objectContaining({ url: expect.stringContaining('api/.well-known/') }),
        }),
      })
    );
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
  };

  afterEach(async () => {
    await trace.cleanup();
  });

  it('should render the page with data from the server and not request the well-known endpoints', async () => {
    const experience = new ExpectExperience(await browser.newPage());

    trace.reset(experience.page);
    await trace.start();
    await experience.navigateTo(demoAppUrl.href);
    await trace.stop();

    // Check page variables
    const data = await experience.page.evaluate(() => {
      return window.logtoSsr;
    });

    const parsed = ssrDataGuard.parse(data);

    expect(parsed.signInExperience.appId).toBe(demoAppApplicationId);
    expect(parsed.signInExperience.organizationId).toBeUndefined();

    // Check network requests
    await expectTraceNotToHaveWellKnownEndpoints();
  });

  it('should render the page with data from the server with invalid organization ID', async () => {
    const experience = new ExpectExperience(await browser.newPage());

    trace.reset(experience.page);
    await trace.start();
    // Although the organization ID is invalid, the server should still render the page with the
    // ID provided which indicates the result under the given parameters.
    await experience.navigateTo(`${demoAppUrl.href}?organization_id=org-id`);
    await trace.stop();

    // Check page variables
    const data = await experience.page.evaluate(() => {
      return window.logtoSsr;
    });

    const parsed = ssrDataGuard.parse(data);

    expect(parsed.signInExperience.appId).toBe(demoAppApplicationId);
    expect(parsed.signInExperience.organizationId).toBe('org-id');

    // Check network requests
    await expectTraceNotToHaveWellKnownEndpoints();
  });

  it('should render the page with data from the server with valid organization ID', async () => {
    const logoUrl = 'mock://fake-url-for-ssr/logo.png';
    const organizationApi = new OrganizationApiTest();
    const organization = await organizationApi.create({ name: 'foo', branding: { logoUrl } });
    const experience = new ExpectExperience(await browser.newPage());

    trace.reset(experience.page);
    await trace.start();
    await experience.navigateTo(`${demoAppUrl.href}?organization_id=${organization.id}`);
    await trace.stop();

    // Check page variables
    const data = await experience.page.evaluate(() => {
      return window.logtoSsr;
    });

    const parsed = ssrDataGuard.parse(data);

    expect(parsed.signInExperience.appId).toBe(demoAppApplicationId);
    expect(parsed.signInExperience.organizationId).toBe(organization.id);
    expect(parsed.signInExperience.data.branding.logoUrl).toBe(logoUrl);

    // Check network requests
    await expectTraceNotToHaveWellKnownEndpoints();
  });
});
