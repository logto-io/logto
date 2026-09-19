import classNames from 'classnames';
import useSWR from 'swr';

import CardIcon from '@/assets/icons/card.svg?react';
import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type LogtoEnterpriseResponse } from '@/cloud/types/router';
import { isDevFeaturesEnabled } from '@/consts/env';
import { GlobalRoute } from '@/contexts/TenantsProvider';
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

  // Console SSO exposes global subscriptions independently of tenant plans.
  if (!isDevFeaturesEnabled && (!data || data.logtoEnterprises.length === 0)) {
    return null;
  }

  // Currently only support one enterprise subscription per user
  // If there are multiple, consider adding a dropdown selector in the future
  const defaultEnterpriseSubscription = data?.logtoEnterprises[0];

  if (!isDevFeaturesEnabled && !defaultEnterpriseSubscription) {
    return null;
  }

  return (
    <TextLink
      className={classNames(styles.button, className)}
      icon={<CardIcon className={styles.icon} />}
      onClick={() => {
        window.open(
          isDevFeaturesEnabled
            ? GlobalRoute.EnterpriseSubscription
            : `${GlobalRoute.EnterpriseSubscription}/${defaultEnterpriseSubscription?.id}`
        );
      }}
    >
      <DynamicT forKey="topbar.subscription" />
    </TextLink>
  );
}

export default EnterpriseSubscriptions;
