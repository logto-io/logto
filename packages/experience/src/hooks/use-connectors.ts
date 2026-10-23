import { type ExperienceSocialConnector, Theme, type SsoConnectorMetadata } from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';
import { useCallback, useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';

import { useSieMethods } from './use-sie';

export type FindConnectorByIdResult =
  | {
      connector: ExperienceSocialConnector;
      type: 'social';
    }
  | {
      connector: SsoConnectorMetadata;
      type: 'sso';
    };

export type ResolvedSubjectProofConnector = FindConnectorByIdResult;

const useConnectors = () => {
  const { socialConnectors, ssoConnectors } = useSieMethods();
  const { ssoConnectors: matchedSsoConnectors } = useContext(UserInteractionContext);
  const { theme } = useContext(PageContext);

  /**
   * Find the single sign-on or social connector by given connector id. Prefer the connectors that
   * matched the user's email domain, because the public catalog only contains provider defaults.
   */
  const findConnectorById = useCallback(
    (connectorId?: string): Optional<FindConnectorByIdResult> => {
      const ssoConnector =
        matchedSsoConnectors.find((connector) => connector.id === connectorId) ??
        ssoConnectors.find((connector) => connector.id === connectorId);

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
    [matchedSsoConnectors, socialConnectors, ssoConnectors]
  );

  const getConnectorLogo = useCallback(
    ({ connector, type }: FindConnectorByIdResult) => {
      if (type === 'sso') {
        return theme === Theme.Dark ? (connector.darkLogo ?? connector.logo) : connector.logo;
      }

      return theme === Theme.Dark ? (connector.logoDark ?? connector.logo) : connector.logo;
    },
    [theme]
  );

  return { findConnectorById, getConnectorLogo };
};

export default useConnectors;
