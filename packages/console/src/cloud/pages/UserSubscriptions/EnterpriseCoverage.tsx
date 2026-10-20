import { type ResponseError } from '@withtyped/client';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import {
  type LogtoEnterpriseResponse,
  type LogtoEnterpriseSubscriptionResponse,
} from '@/cloud/types/router';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useCurrentUser from '@/hooks/use-current-user';
import { formatQuotaNumber } from '@/utils/number';

import styles from './index.module.scss';

type Props = {
  readonly enterprise: Pick<LogtoEnterpriseResponse, 'id' | 'name'>;
};

function EnterpriseCoverage({ enterprise }: Props) {
  const { user, error: userError } = useCurrentUser();
  const api = useCloudApi({ hideErrorToast: true });
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, isLoading, mutate } = useSWR<
    LogtoEnterpriseSubscriptionResponse,
    ResponseError
  >(
    user && !userError && ['console-sso-enterprise-coverage', user.id, enterprise.id],
    async () =>
      api.get('/api/me/logto-enterprises/:id', {
        params: { id: enterprise.id },
        search: { includeSharedQuota: 'true', includeUsages: 'true' },
      }),
    { dedupingInterval: 30_000 }
  );
  const limit = data?.quota?.basicQuota.consoleSsoConnectorLimit;
  const used = data?.usages?.consoleSsoConnectorLimit;

  return (
    <div className={styles.coverage}>
      <TextLink href={`${GlobalRoute.EnterpriseSubscription}/${enterprise.id}`}>
        {enterprise.name?.trim() ? enterprise.name : enterprise.id}
      </TextLink>
      {error ? (
        <InlineNotification
          severity="error"
          action="general.retry"
          onClick={() => {
            void mutate();
          }}
        >
          {error.message}
        </InlineNotification>
      ) : (
        <FormField title="cloud.console_sso.title">
          {isLoading ? (
            t('general.loading')
          ) : (
            <div className={styles.coverageValues}>
              <span>
                {t('enterprise_subscription.user_subscriptions.allowance')}:{' '}
                {limit === null
                  ? t('subscription.quota_table.unlimited')
                  : limit === undefined
                    ? '—'
                    : formatQuotaNumber(limit)}
              </span>
              <span>
                {t('enterprise_subscription.subscription.basic_plan_column_title.usage')}:{' '}
                {used === undefined ? '—' : formatQuotaNumber(used)}
              </span>
            </div>
          )}
        </FormField>
      )}
    </div>
  );
}

export default EnterpriseCoverage;
