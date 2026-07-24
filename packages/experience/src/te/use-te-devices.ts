/* TE:BEGIN qr-push-factor */
/**
 * Asks the IdP whether the identity being signed in is a TripleEnable account.
 *
 * The verification-methods list uses this so the TripleEnable option only shows for
 * accounts that actually have a device enrolled — offering it to anyone else would
 * be a dead end.
 */

import { useContext, useEffect, useRef, useState } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';

import { hasTeDevices } from './api';
import useTePushEnabled from './use-te-push-enabled';

const useTeAccount = () => {
  const { identifierInputValue } = useContext(UserInteractionContext);
  const isPushEnabled = useTePushEnabled();
  const identifier = identifierInputValue?.value;

  const [isTeAccount, setIsTeAccount] = useState(false);
  const isCurrent = useRef(true);

  useEffect(() => {
    if (!isPushEnabled || !identifier) {
      return;
    }

    // eslint-disable-next-line @silverhand/fp/no-mutation
    isCurrent.current = true;

    const check = async () => {
      const result = await hasTeDevices(identifier);

      if (isCurrent.current) {
        setIsTeAccount(result);
      }
    };

    void check();

    return () => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      isCurrent.current = false;
    };
  }, [identifier, isPushEnabled]);

  return isTeAccount;
};

export default useTeAccount;
/* TE:END qr-push-factor */
