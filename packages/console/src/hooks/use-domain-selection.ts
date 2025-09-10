import { useCallback, useEffect, useState } from 'react';

import useAvailableDomains from '@/hooks/use-available-domains';

/**
 * Domain selection hook that prefers custom domains.
 *
 * Behavior:
 * - Auto-selects the first available domain (customs come first) when mounting.
 * - If custom domains load later, it auto-switches to the first custom domain
 *   as long as the user has not manually selected a domain.
 * - Once the user selects a domain, the hook will not auto-change it anymore.
 */
const useDomainSelection = () => {
  const availableDomains = useAvailableDomains();

  const [selectedDomain, setSelectedDomain] = useState<string | undefined>();
  const [isUserSelected, setIsUserSelected] = useState(false);

  // Auto-select preferred domain (custom domain first) before any user interaction.
  useEffect(() => {
    if (isUserSelected) {
      return;
    }

    const preferred = availableDomains[0];
    if (preferred && preferred !== selectedDomain) {
      setSelectedDomain(preferred);
    }
  }, [availableDomains, isUserSelected, selectedDomain]);

  const updateSelectedDomain = useCallback((value?: string) => {
    setIsUserSelected(true);
    setSelectedDomain(value);
  }, []);

  return [selectedDomain, updateSelectedDomain] as const;
};

export default useDomainSelection;
