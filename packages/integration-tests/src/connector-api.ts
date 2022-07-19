import { ConnectorDto } from '@logto/schemas';

import { authedAdminApi } from '@/api';

export const listConnectors = async () => authedAdminApi.get('connectors').json<ConnectorDto[]>();
