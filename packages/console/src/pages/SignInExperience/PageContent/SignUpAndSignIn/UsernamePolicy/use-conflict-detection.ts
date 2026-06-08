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
 * switching the policy to case-insensitive). Surfacing them lets the modal block the save before
 * the server rejects the PATCH with a 409.
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

  const { data, error, isLoading } = useSWR<CaseConflicts, RequestError>(
    debouncedEnabled && conflictsEndpoint
  );

  return {
    conflicts: debouncedEnabled ? data : undefined,
    // Block from the moment the operator switches to case-insensitive until a settled answer
    // arrives — including the pre-debounce window, so Save can't be clicked before the probe runs.
    // On error we stop blocking and fall back to the server-side 409 guard instead of leaving Save
    // stuck disabled forever.
    isChecking: enabled && !error && (!debouncedEnabled || isLoading || !data),
  };
};

export default useConflictDetection;
