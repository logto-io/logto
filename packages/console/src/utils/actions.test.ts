import { isActionsEnabled, normalizeActionsQuota } from './actions';

describe('normalizeActionsQuota', () => {
  it('uses the Actions quota key when both names are present', () => {
    expect(
      normalizeActionsQuota({
        actionsEnabled: false,
        inlineHooksEnabled: true,
        applicationsLimit: 3,
      })
    ).toEqual({
      actionsEnabled: false,
      applicationsLimit: 3,
    });
  });

  it('rejects a Cloud response without the Actions quota key', () => {
    expect(() => normalizeActionsQuota({ inlineHooksEnabled: true })).toThrow(
      'Cloud response is missing the Actions quota.'
    );
  });

  it('uses the fallback when the Actions quota key is absent', () => {
    expect(
      normalizeActionsQuota({ inlineHooksEnabled: true, applicationsLimit: 3 }, { fallback: false })
    ).toEqual({
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
