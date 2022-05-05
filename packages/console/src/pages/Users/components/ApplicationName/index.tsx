import { Application } from '@logto/schemas';
import React from 'react';
import useSWR from 'swr';

type Props = {
  applicationId: string;
};

const ApplicationName = ({ applicationId }: Props) => {
  const { data } = useSWR<Application>(`/api/applications/${applicationId}`);

  return <span>{data?.name ?? '-'}</span>;
};

export default ApplicationName;
