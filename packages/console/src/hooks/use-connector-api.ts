import { type ConnectorResponse } from '@logto/schemas';

import useApi, { type StaticApiProps } from './use-api';

const useConnectorApi = (props: Omit<StaticApiProps, 'prefixUrl' | 'resourceIndicator'> = {}) => {
  const api = useApi(props);

  const createConnector = async (payload: unknown) =>
    api
      .post('api/connectors', {
        json: payload,
      })
      .json<ConnectorResponse>();

  return {
    createConnector,
  };
};

export default useConnectorApi;
