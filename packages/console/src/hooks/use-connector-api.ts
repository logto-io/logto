import { type ConnectorResponse } from '@logto/schemas';

import useApi, { type StaticApiProps } from './use-api';
import useConfigs from './use-configs';

const useConnectorApi = (props: Omit<StaticApiProps, 'prefixUrl'> = {}) => {
  const api = useApi(props);
  const { updateConfigs } = useConfigs();

  const createConnector = async (payload: unknown) => {
    const connector = await api
      .post('api/connectors', {
        json: payload,
      })
      .json<ConnectorResponse>();
    await updateConfigs({ passwordlessConfigured: true });
    return connector;
  };

  return {
    createConnector,
  };
};

export default useConnectorApi;
