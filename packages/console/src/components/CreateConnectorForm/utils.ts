import { ServiceConnector } from '@logto/connector-kit';
import { type AdminConsoleKey } from '@logto/phrases';
import { ConnectorType, type ConnectorResponse } from '@logto/schemas';

import { type ConnectorGroup } from '@/types/connector';

import { type ConnectorRadioGroupSize } from './ConnectorRadioGroup';
import { featuredConnectorTargets } from './constants';

const getConnectorOrder = (target: string, isStandard?: boolean): number => {
  const order = featuredConnectorTargets.indexOf(target);

  if (order === -1) {
    // Standard connectors come last.
    return isStandard ? featuredConnectorTargets.length + 1 : featuredConnectorTargets.length;
  }

  return order;
};

export const compareConnectors = <T extends Pick<ConnectorResponse, 'target' | 'isStandard'>>(
  connectorA: T,
  connectorB: T
) => {
  const orderA = getConnectorOrder(connectorA.target, connectorA.isStandard);
  const orderB = getConnectorOrder(connectorB.target, connectorB.isStandard);

  return orderA - orderB;
};

export const getConnectorRadioGroupSize = (
  connectorCount: number,
  connectorType?: ConnectorType
): ConnectorRadioGroupSize => {
  /**
   * Note:
   * Fix the size to large, since now we have little passwordless connectors.
   */
  if (connectorType !== ConnectorType.Social) {
    return 'large';
  }

  if (connectorCount <= 2) {
    return 'medium';
  }

  if (connectorCount === 3) {
    return 'large';
  }

  return 'xlarge';
};

export const getModalTitle = (connectorType?: ConnectorType): AdminConsoleKey => {
  if (connectorType === ConnectorType.Email) {
    return 'connectors.setup_title.email';
  }

  if (connectorType === ConnectorType.Sms) {
    return 'connectors.setup_title.sms';
  }

  return 'connectors.setup_title.social';
};

export const getEmailConnectorUpsellCopyKeys = () => ({
  title: 'connectors.create_form.email_connector_upsell.title' as const,
  description: 'connectors.create_form.email_connector_upsell.description' as const,
});

type ConnectorSelectionStateOptions = {
  readonly type?: ConnectorType;
  readonly isCloud: boolean;
  readonly isDevFeaturesEnabled: boolean;
};

export const getConnectorSelectionState = <T extends Pick<ConnectorResponse, 'id'>>(
  groups: Array<ConnectorGroup<T>>,
  options: ConnectorSelectionStateOptions
) => {
  const { type, isCloud, isDevFeaturesEnabled } = options;

  if (type !== ConnectorType.Email || isCloud || !isDevFeaturesEnabled) {
    return { bannerGroup: undefined, groups };
  }

  const bannerGroup = groups.find(({ connectors }) =>
    connectors.some(({ id }) => id === ServiceConnector.Email)
  );

  if (!bannerGroup) {
    return { bannerGroup: undefined, groups };
  }

  return {
    bannerGroup,
    groups: groups.filter(({ id }) => id !== bannerGroup.id),
  };
};
