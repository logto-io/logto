describe('toRecentRegionOrCountry', () => {
  it('maps country data to region or country output', async () => {
    const utils = (await import('./utils.js')) as Record<string, unknown>;
    const toRecentRegionOrCountry = utils.toRecentRegionOrCountry as
      | ((input: { country: string; lastSignInAt: number }) => {
          regionOrCountry: string;
          lastSignInAt: number;
        })
      | undefined;

    expect(typeof toRecentRegionOrCountry).toBe('function');
    const result = toRecentRegionOrCountry?.({ country: 'US', lastSignInAt: 123 });
    expect(result).toEqual({ regionOrCountry: 'US', lastSignInAt: 123 });
  });
});
