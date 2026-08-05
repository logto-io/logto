import { noop } from '@silverhand/essentials';
import { type PostHog } from 'posthog-js/react';

// When no public PostHog key is configured, `PostHogProvider` is rendered with this no-op client so
// that every `usePostHog()` consumer (identify, group, reset, resetGroups, capture, ...) becomes a
// harmless no-op instead of erroring on the uninitialized global instance. The Proxy returns a no-op
// for any property, so the client never goes stale as new PostHog methods get used.
// eslint-disable-next-line no-restricted-syntax -- the proxy intentionally implements the full `PostHog` surface with no-ops
export const noopPostHogClient = new Proxy(
  {
    isIdentified: () => false,
    hasOptedIn: () => false,
  },
  { get: () => noop }
) as unknown as PostHog;
