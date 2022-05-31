import { adminConsoleApplicationId, Application } from '@logto/schemas';
import React from 'react';
import useSWR from 'swr';

import { RequestError } from '@/hooks/use-api';

type Props = {
  applicationId: string;
};

const ApplicationName = ({ applicationId }: Props) => {
  const isAdminConsole = applicationId === adminConsoleApplicationId;

  const { data } = useSWR<Application>(!isAdminConsole && `/api/applications/${applicationId}`);

  const name = isAdminConsole ? 'Admin Console' : data?.name;

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  return <span>{name || '-'}</span>;
};

export default ApplicationName;
