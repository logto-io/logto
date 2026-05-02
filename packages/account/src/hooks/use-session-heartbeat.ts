import { useLogto } from '@logto/react';
import { useEffect } from 'react';

import { sendHeartbeat } from '../apis/heartbeat';

const HEARTBEAT_INTERVAL_MS = 30_000;

/**
 * Fires a session heartbeat at mount and every 30 s while the document is visible.
 * Also fires immediately when the document becomes visible again after being hidden.
 * Silently swallows errors — a missed heartbeat is not user-facing.
 *
 * Only active when `enabled` is true (i.e. the user is authenticated).
 */
export const useSessionHeartbeat = (enabled: boolean): void => {
  const { getAccessToken } = useLogto();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const ping = async () => {
      if (document.visibilityState !== 'visible') {
        return;
      }
      try {
        const token = await getAccessToken();
        if (token) {
          await sendHeartbeat(token);
        }
      } catch {
        // Deliberately swallow — heartbeat is best-effort
      }
    };

    // Fire immediately on mount
    void ping();

    const intervalId = setInterval(() => {
      void ping();
    }, HEARTBEAT_INTERVAL_MS);

    // Also fire when the user returns to the tab
    document.addEventListener('visibilitychange', ping);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', ping);
    };
  }, [enabled, getAccessToken]);
};
