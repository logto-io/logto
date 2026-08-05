import { noopPostHogClient } from './posthog';

const client = noopPostHogClient as unknown as Record<string, () => void>;

describe('noopPostHogClient', () => {
  const consumerMethods = ['identify', 'group', 'resetGroups', 'reset', 'capture'];

  it.each(consumerMethods)('provides a no-op %s()', (method) => {
    const call = client[method]!;
    expect(typeof call).toBe('function');
    expect(() => {
      call();
    }).not.toThrow();
  });

  it('returns a no-op for any other PostHog method', () => {
    const call = client.getFeatureFlags!;
    expect(typeof call).toBe('function');
    expect(() => {
      call();
    }).not.toThrow();
  });
});
