import { type ExperienceSocialConnector, Theme, type SsoConnectorMetadata } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';
import { useCallback, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';

import { useSieMethods } from './use-sie';

type FindConnectorByIdResult =
  | {
      connector: ExperienceSocialConnector;
      type: 'social';
    }
  | {
      connector: SsoConnectorMetadata;
      type: 'sso';
    };

const useConnectors = () => {
  const { socialConnectors, ssoConnectors } = useSieMethods();
  const { theme } = useContext(PageContext);

  /**
   * Find the single sign-on or social connector by given connector id
   */
  const findConnectorById = useCallback(
    (connectorId?: string): Optional<FindConnectorByIdResult> => {
      const ssoConnector = ssoConnectors.find((connector) => connector.id === connectorId);

      if (ssoConnector) {
        return {
          connector: ssoConnector,
          type: 'sso',
        };
      }

      const socialConnector = socialConnectors.find((connector) => connector.id === connectorId);

      if (socialConnector) {
        return {
          connector: socialConnector,
          type: 'social',
        };
      }
    },
    [socialConnectors, ssoConnectors]
  );

  const getConnectorLogo = useCallback(
    ({ connector, type }: FindConnectorByIdResult) => {
      if (type === 'sso') {
        return theme === Theme.Dark ? connector.darkLogo ?? connector.logo : connector.logo;
      }

      return theme === Theme.Dark ? connector.logoDark ?? connector.logo : connector.logo;
    },
    [theme]
  );

  return { findConnectorById, getConnectorLogo };
};

export default useConnectors;
