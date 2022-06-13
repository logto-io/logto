import { Application } from '@logto/schemas';
import { adminConsoleApplicationId } from '@logto/schemas/lib/seeds';
import React from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import * as styles from './index.module.scss';

type Props = {
  applicationId: string;
  isLink?: boolean;
};

const ApplicationName = ({ applicationId, isLink = false }: Props) => {
  const isAdminConsole = applicationId === adminConsoleApplicationId;

  const { data } = useSWR<Application>(!isAdminConsole && `/api/applications/${applicationId}`);

  const name = (isAdminConsole ? 'Admin Console' : data?.name) || '-';

  if (isLink && !isAdminConsole) {
    return (
      <Link className={styles.link} to={`/applications/${applicationId}`} target="_blank">
        {name}
      </Link>
    );
  }

  return <span>{name}</span>;
};

export default ApplicationName;
