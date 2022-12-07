import { featuredConnectorTargets } from './constants';

export const getConnectorOrder = (target: string, isStandard?: boolean): number => {
  const order = featuredConnectorTargets.indexOf(target);

  if (order === -1) {
    // Standard connectors come last.
    return isStandard ? featuredConnectorTargets.length + 1 : featuredConnectorTargets.length;
  }

  return order;
};
