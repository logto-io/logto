import { getAuditLogsResponse } from '#src/api/logs.js';

// The capped path is covered by unit tests in `koa-pagination.test.ts` and
// `routes/log.test.ts`; reproducing it at integration level would require
// seeding >10k matching rows per run.
describe('GET /logs count cap signaling', () => {
  it('emits the classic header set without enableCap', async () => {
    const response = await getAuditLogsResponse(new URLSearchParams({ page_size: '20' }));

    expect(response.status).toBe(200);
    expect(response.headers.get('total-number')).not.toBeNull();
    expect(response.headers.get('total-number-is-capped')).toBeNull();

    const linkHeader = response.headers.get('link') ?? '';
    expect(linkHeader).toContain('rel="first"');
    expect(linkHeader).toContain('rel="last"');
  });

  it('opts into the capped query when enableCap=true but stays unsaturated on small data', async () => {
    const response = await getAuditLogsResponse(
      new URLSearchParams({ page_size: '20', enableCap: 'true' })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('total-number')).not.toBeNull();
    // Integration data is small, so the cap is opted into but not hit; behaves
    // identically to the no-param path.
    expect(response.headers.get('total-number-is-capped')).toBeNull();
    expect(response.headers.get('link') ?? '').toContain('rel="last"');
  });
});
