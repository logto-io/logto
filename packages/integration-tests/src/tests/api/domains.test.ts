import { HTTPError } from 'ky';

import { createDomain, deleteDomain, getDomain, getDomains } from '#src/api/domain.js';
import { generateDomain } from '#src/utils.js';

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

  it('should fail when already has a domain', async () => {
    await createDomain();

    const response = await createDomain().catch((error: unknown) => error);
    expect(response instanceof HTTPError && response.response.status).toBe(422);
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
});
