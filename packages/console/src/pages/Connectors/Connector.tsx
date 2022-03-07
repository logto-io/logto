import { ConnectorDTO } from '@logto/schemas';
import React from 'react';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import Card from '@/components/Card';
import { RequestError } from '@/swr';

const Connector = () => {
  const { connectorId } = useParams();
  const { data, error } = useSWR<ConnectorDTO, RequestError>(
    connectorId && `/api/connectors/${connectorId}`
  );
  const isLoading = !data && !error;

  return (
    <Card>
      {isLoading && 'loading'}
      {error && error}
    </Card>
  );
};

export default Connector;
