import { isActionsEnabled, normalizeActionsQuota } from './actions';

describe('normalizeActionsQuota', () => {
  it('returns the Actions quota key when present', () => {
    expect(
      normalizeActionsQuota({
        actionsEnabled: false,
        applicationsLimit: 3,
      })
    ).toEqual({
      actionsEnabled: false,
      applicationsLimit: 3,
    });
  });

  it('rejects a Cloud response without the Actions quota key', () => {
    expect(() => normalizeActionsQuota({})).toThrow('Cloud response is missing the Actions quota.');
  });

  it('uses the fallback when the Actions quota key is absent', () => {
    const quota: { actionsEnabled?: boolean; applicationsLimit: number } = {
      applicationsLimit: 3,
    };

    expect(normalizeActionsQuota(quota, { fallback: false })).toEqual({
      actionsEnabled: false,
      applicationsLimit: 3,
    });
  });

  it('prefers the Actions quota key over the fallback', () => {
    expect(normalizeActionsQuota({ actionsEnabled: true }, { fallback: false })).toEqual({
      actionsEnabled: true,
    });
  });
});

describe('isActionsEnabled', () => {
  it.each([
    {
      isCloud: true,
      actionsEnabled: true,
      expected: true,
    },
    {
      isCloud: true,
      actionsEnabled: false,
      expected: false,
    },
    {
      isCloud: false,
      actionsEnabled: false,
      expected: true,
    },
    {
      isCloud: false,
      actionsEnabled: true,
      expected: true,
    },
  ])(
    'returns $expected when cloud=$isCloud and quota=$actionsEnabled',
    ({ expected, ...input }) => {
      expect(isActionsEnabled(input)).toBe(expected);
    }
  );
});
