import type { ExperienceSocialConnector } from '@logto/schemas';

export const getLocalizedConnectorName = (
  connector: ExperienceSocialConnector,
  language: string
): string => {
  const localizedName = Object.entries(connector.name).find(([locale]) => locale === language)?.[1];

  return localizedName ?? connector.name.en;
};
