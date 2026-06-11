import { useEffect, useState } from 'react';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';

type CaseConflicts = {
  totalConflicts: number;
  samples: Array<{ usernameLower: string; userIds: string[] }>;
};

const conflictsEndpoint = 'api/sign-in-exp/username-policy/case-sensitivity-conflicts?limit=20';

/**
 * Reads username case-sensitivity conflicts, debounced by 300 ms, while `enabled` (the operator is
 * switching the policy to case-insensitive). Surfacing them lets the modal warn about conflicts and
 * guard the save before the server rejects the PATCH with a 409.
 */
const useConflictDetection = (enabled: boolean) => {
  const [debouncedEnabled, setDebouncedEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDebouncedEnabled(false);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedEnabled(true);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [enabled]);

  const { data, error, isValidating } = useSWR<CaseConflicts, RequestError>(
    debouncedEnabled && conflictsEndpoint
  );

  return {
    // SWR retains the last `data` when a revalidation fails; hide it on error so stale conflicts
    // can't keep Save disabled while the probe itself is broken.
    conflicts: debouncedEnabled && !error ? data : undefined,
    // True from the moment the operator switches to case-insensitive until the probe settles
    // (pre-debounce window included). `isValidating` rather than `isLoading`, so a cached entry
    // mid-revalidation still gates the save instead of letting it through on stale results. On
    // error we stop gating and fall back to the server-side 409 guard.
    isChecking: enabled && !error && (!debouncedEnabled || isValidating || !data),
  };
};

export default useConflictDetection;
