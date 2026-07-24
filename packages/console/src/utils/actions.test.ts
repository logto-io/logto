import { isActionsEnabled } from './actions';

describe('isActionsEnabled', () => {
  it.each([
    {
      isCloud: true,
      isDevFeaturesEnabled: true,
      inlineHooksEnabled: true,
      expected: true,
    },
    {
      isCloud: true,
      isDevFeaturesEnabled: true,
      inlineHooksEnabled: false,
      expected: false,
    },
    {
      isCloud: true,
      isDevFeaturesEnabled: false,
      inlineHooksEnabled: true,
      expected: false,
    },
    {
      isCloud: false,
      isDevFeaturesEnabled: true,
      inlineHooksEnabled: false,
      expected: true,
    },
    {
      isCloud: false,
      isDevFeaturesEnabled: false,
      inlineHooksEnabled: true,
      expected: false,
    },
  ])(
    'returns $expected when cloud=$isCloud, dev features=$isDevFeaturesEnabled, and quota=$inlineHooksEnabled',
    ({ expected, ...input }) => {
      expect(isActionsEnabled(input)).toBe(expected);
    }
  );
});
