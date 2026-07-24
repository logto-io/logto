/* TE:BEGIN qr-push-factor */
/**
 * Whether the TripleEnable push factor is available for this tenant.
 *
 * It is a connector, so the admin console is what turns it on and off: it shows up in
 * `sign-in-exp` like any other, and disappearing from there is enough to hide it.
 */

import { useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';

import { TeWalletMode, getTeWalletMode } from './config';

const useTePushEnabled = () => {
  const { experienceSettings } = useContext(PageContext);

  return (experienceSettings?.socialConnectors ?? []).some(
    ({ target }) => getTeWalletMode(target) === TeWalletMode.Push
  );
};

export default useTePushEnabled;
/* TE:END qr-push-factor */
