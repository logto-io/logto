import { useTranslation } from 'react-i18next';

import DetailsPage from '@/components/DetailsPage';
import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import SkuName from '@/components/SkuName';
import { selfHostedLicenseGuideLink } from '@/consts/external-links';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';

import Status from './Status';
import styles from './index.module.scss';
import { useSelfHostedLicense } from './use-self-hosted-licenses';

type Props = { readonly id: string };

function Details({ id }: Props) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, isLoading, isValidating, mutate } = useSelfHostedLicense(id);

  return (
    <DetailsPage
      backLink={GlobalRoute.SelfHostedLicenses}
      backLinkTitle="cloud.self_hosted_licenses.title"
    >
      {isLoading && <FormCardSkeleton />}
      {error && (
        <InlineNotification
          severity="error"
          action="general.retry"
          onClick={() => {
            void mutate();
          }}
        >
          <DynamicT forKey="cloud.self_hosted_licenses.load_error" />
        </InlineNotification>
      )}
      {!error && data && (
        <>
          <div className={styles.summary}>
            <h2>
              <SkuName skuId={data.plan} />
            </h2>
            <Status license={data} />
            <span className={styles.identifier}>{data.id}</span>
            <span>
              {t('cloud.self_hosted_licenses.period_end')}:{' '}
              {data.currentPeriodEnd
                ? new Date(data.currentPeriodEnd).toLocaleDateString(i18n.language, {
                    dateStyle: 'medium',
                  })
                : '—'}
            </span>
          </div>
          <FormCard
            title="cloud.self_hosted_licenses.keys_title"
            description="cloud.self_hosted_licenses.keys_description"
          >
            {isValidating ? (
              <FormCardSkeleton />
            ) : data.productionKey && data.nonProductionKey ? (
              <div className={styles.keys}>
                <FormField title="cloud.self_hosted_licenses.production_key">
                  <CopyToClipboard
                    hasVisibilityToggle
                    displayType="block"
                    value={data.productionKey}
                  />
                </FormField>
                <FormField title="cloud.self_hosted_licenses.non_production_key">
                  <CopyToClipboard
                    hasVisibilityToggle
                    displayType="block"
                    value={data.nonProductionKey}
                  />
                </FormField>
              </div>
            ) : (
              <InlineNotification severity="alert">
                <DynamicT forKey="cloud.self_hosted_licenses.keys_unavailable" />
              </InlineNotification>
            )}
          </FormCard>
          <FormCard
            title="cloud.self_hosted_licenses.install_title"
            description="cloud.self_hosted_licenses.install_description"
            learnMoreLink={{ href: selfHostedLicenseGuideLink }}
          >
            <ol className={styles.steps}>
              <li>
                <DynamicT forKey="cloud.self_hosted_licenses.install_copy" />
              </li>
              <li>
                <DynamicT forKey="cloud.self_hosted_licenses.install_paste" />
              </li>
            </ol>
          </FormCard>
        </>
      )}
    </DetailsPage>
  );
}

export default Details;
