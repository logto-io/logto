import useSWR from 'swr';

import CardIcon from '@/assets/icons/card.svg?react';
import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type LogtoEnterpriseResponse } from '@/cloud/types/router';
import DynamicT from '@/ds-components/DynamicT';
import TextLink from '@/ds-components/TextLink';

import styles from '../index.module.scss';

type Props = {
  readonly className?: string;
};

function EnterpriseSubscriptions({ className }: Props) {
  const cloudApi = useCloudApi();

  const { data } = useSWR<{ logtoEnterprises: LogtoEnterpriseResponse[] }, Error>(
    '/api/me/logto-enterprises',
    async () => cloudApi.get('/api/me/logto-enterprises')
  );

  if (!data || data.logtoEnterprises.length === 0) {
    return null;
  }

  // Currently only support one enterprise subscription per user
  // If there are multiple, consider adding a dropdown selector in the future
  const defaultEnterpriseSubscription = data.logtoEnterprises[0];

  if (!defaultEnterpriseSubscription) {
    return null;
  }

  return (
    <TextLink
      to={`enterprise-subscriptions/${defaultEnterpriseSubscription.id}`}
      className={styles.button}
      icon={<CardIcon className={styles.icon} />}
    >
      <DynamicT forKey="topbar.subscription" />
    </TextLink>
  );
}

export default EnterpriseSubscriptions;
