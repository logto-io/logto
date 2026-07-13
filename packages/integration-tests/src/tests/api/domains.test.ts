import { DomainVerificationFileContentType } from '@logto/schemas';
import { HTTPError } from 'ky';

import {
  createDomain,
  deleteDomain,
  getDomain,
  getDomains,
  getDomainVerificationFiles,
  updateDomainVerificationFiles,
} from '#src/api/domain.js';
import { devFeatureTest, generateDomain } from '#src/utils.js';

describe('domains', () => {
  afterEach(async () => {
    const domains = await getDomains();
    await Promise.all(domains.map(async (domain) => deleteDomain(domain.id)));
  });

  it('should get domains list successfully', async () => {
    await createDomain();
    const domains = await getDomains();

    expect(domains.length > 0).toBeTruthy();
  });

  it('should create domain successfully', async () => {
    const domainName = generateDomain();
    const domain = await createDomain(domainName);

    expect(domain.domain).toBe(domainName);
  });

  it('should create multiple domains', async () => {
    const firstDomain = generateDomain();
    const secondDomain = generateDomain();

    const createdFirstDomain = await createDomain(firstDomain);
    expect(createdFirstDomain.domain).toBe(firstDomain);

    const createdSecondDomain = await createDomain(secondDomain);
    expect(createdSecondDomain.domain).toBe(secondDomain);

    const domains = await getDomains();
    expect(domains.length).toBe(2);
    expect(domains.some((domain) => domain.domain === firstDomain)).toBeTruthy();
    expect(domains.some((domain) => domain.domain === secondDomain)).toBeTruthy();
  });

  it('should get domain detail successfully', async () => {
    const createdDomain = await createDomain();
    const domain = await getDomain(createdDomain.id);

    expect(domain.domain).toBe(createdDomain.domain);
  });

  it('should return 404 if domain does not exist', async () => {
    const response = await getDomain('non_existent_domain').catch((error: unknown) => error);

    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  it('should delete domain successfully', async () => {
    const domain = await createDomain();

    await deleteDomain(domain.id);

    const response = await getDomain(domain.id).catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(404);
  });

  devFeatureTest.describe('domain verification files', () => {
    it('should get and update domain verification files', async () => {
      const domain = await createDomain();
      const verificationFiles = [
        {
          path: '/MP_verify_example.txt',
          content: 'verification-content',
          contentType: DomainVerificationFileContentType.Text,
        },
        {
          path: '/.well-known/example.json',
          content: '{"verified":true}',
          contentType: DomainVerificationFileContentType.Json,
        },
      ];

      await expect(getDomainVerificationFiles(domain.id)).resolves.toEqual([]);
      await expect(updateDomainVerificationFiles(domain.id, verificationFiles)).resolves.toEqual(
        verificationFiles
      );
      await expect(getDomainVerificationFiles(domain.id)).resolves.toEqual(verificationFiles);
    });

    it('should reject invalid verification file paths', async () => {
      const domain = await createDomain();
      const response = await updateDomainVerificationFiles(domain.id, [
        {
          path: '/nested/verify.txt',
          content: 'verification-content',
          contentType: DomainVerificationFileContentType.Text,
        },
      ]).catch((error: unknown) => error);

      expect(response instanceof HTTPError && response.response.status).toBe(400);
    });
  });
});
