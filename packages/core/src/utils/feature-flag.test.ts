import { isFeatureEnabledForEntity } from './feature-flag.js';
import { randomString } from './test-utils.js';

describe('feature flag detection', () => {
  it('should return same result for same session ID', () => {
    const entityId = randomString();
    const result = isFeatureEnabledForEntity({ entityId, rollOutPercentage: 0.5 });

    for (const _ of Array.from({ length: 20 })) {
      expect(isFeatureEnabledForEntity({ entityId, rollOutPercentage: 0.5 })).toBe(result);
    }
  });

  it.each([0, 0.2, 0.5, 0.8, 1])(
    'should return the result based on the roll out percentage %f',
    (rollOutPercentage) => {
      const results: boolean[] = [];

      for (const _ of Array.from({ length: 200 })) {
        const entityId = randomString();
        // eslint-disable-next-line @silverhand/fp/no-mutating-methods
        results.push(isFeatureEnabledForEntity({ entityId, rollOutPercentage }));
      }

      const count = results.filter(Boolean).length;

      if (rollOutPercentage === 0) {
        expect(count).toBe(0); // Expect no requests in the test group
      } else if (rollOutPercentage === 1) {
        expect(count).toBe(200); // Expect all requests in the test group
      } else {
        // Expect the count to be within 10% of the expected value, as we don't have a large sample size
        expect(count).toBeGreaterThan((rollOutPercentage - 0.1) * 200);
        expect(count).toBeLessThan((rollOutPercentage + 0.1) * 200);
      }
    }
  );
});
