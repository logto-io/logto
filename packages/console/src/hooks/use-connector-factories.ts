import { type ConnectorFactoryResponse } from '@logto/schemas';
import useSWRImmutable from 'swr/immutable';

import { type RequestError } from './use-api';

const useConnectorFactories = () =>
  useSWRImmutable<ConnectorFactoryResponse[], RequestError>('api/connector-factories');

export default useConnectorFactories;
