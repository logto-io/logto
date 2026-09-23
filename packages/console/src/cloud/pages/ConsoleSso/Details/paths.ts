import { GlobalRoute } from '@/contexts/TenantsProvider';

export enum ConsoleSsoDetailsTab {
  Connection = 'connection',
  Experience = 'experience',
}

export const getConsoleSsoDetailsPath = (
  connectorId: string,
  tab = ConsoleSsoDetailsTab.Connection
) => `${GlobalRoute.ConsoleSso}/${encodeURIComponent(connectorId)}/${tab}`;
