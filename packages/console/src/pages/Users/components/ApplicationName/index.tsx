import { adminConsoleApplicationId, Application } from '@logto/schemas';
import React from 'react';
import useSWR from 'swr';

type Props = {
  applicationId: string;
};

const ApplicationName = ({ applicationId }: Props) => {
  const isAdminConsole = applicationId === adminConsoleApplicationId;

  const { data } = useSWR<Application>(!isAdminConsole && `/api/applications/${applicationId}`);

  const name = isAdminConsole ? 'Admin Console' : data?.name;

  return <span>{name ?? '-'}</span>;
};

export default ApplicationName;
