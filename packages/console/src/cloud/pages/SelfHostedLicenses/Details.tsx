import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import CardIcon from '@/assets/icons/card.svg?react';
import Delete from '@/assets/icons/delete.svg?react';
import { useSelfHostedLicense } from '@/cloud/hooks/use-self-hosted-licenses';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import SkuName from '@/components/SkuName';
import { isDevFeaturesEnabled } from '@/consts/env';
import { selfHostedLicenseGuideLink } from '@/consts/external-links';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import ConfirmModal from '@/ds-components/ConfirmModal';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';

import Keys from './Keys';
import Status, { getLicenseStatus, isPaymentRequired } from './Status';
import Usage from './Usage';
import styles from './index.module.scss';
import { isCancelable, useCancelSubscription } from './use-cancel-subscription';

type Props = { readonly id: string };

function Details({ id }: Props) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, isLoading, mutate, userId } = useSelfHostedLicense(id);
  const navigate = useNavigate();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const {
    cancel,
    isCanceling,
    error: cancelError,
  } = useCancelSubscription(id, async () => mutate());
  // Self-hosted license self-serve purchase is still in development.
  const canManageSubscription = isDevFeaturesEnabled && data?.subscriptionStatus;
  const keysUnavailableKey = data
    ? getLicenseStatus(data) === 'pending'
      ? 'cloud.self_hosted_licenses.keys_pending'
      : canManageSubscription && isPaymentRequired(data)
        ? 'cloud.self_hosted_licenses.keys_payment_required'
        : 'cloud.self_hosted_licenses.keys_unavailable'
    : 'cloud.self_hosted_licenses.keys_unavailable';

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
          <DetailsPageHeader
            title={<SkuName skuId={data.plan} />}
            primaryTag={<Status license={data} />}
            subtitle={
              <>
                {t('cloud.self_hosted_licenses.period_end')}:{' '}
                {data.currentPeriodEnd
                  ? new Date(data.currentPeriodEnd).toLocaleDateString(i18n.language, {
                      dateStyle: 'medium',
                    })
                  : '—'}
              </>
            }
            identifier={{ name: 'ID', value: data.id }}
            additionalActionButton={
              canManageSubscription
                ? {
                    title: 'cloud.self_hosted_licenses.manage_payment',
                    icon: <CardIcon />,
                    onClick: () => {
                      // Each personal subscription opens its own billing portal there.
                      navigate(GlobalRoute.EnterpriseSubscription);
                    },
                  }
                : undefined
            }
            actionMenuItems={
              canManageSubscription && isCancelable(data)
                ? [
                    {
                      type: 'danger',
                      title: 'cloud.self_hosted_licenses.cancel.action',
                      icon: <Delete />,
                      onClick: () => {
                        setIsCancelConfirmOpen(true);
                      },
                    },
                  ]
                : undefined
            }
          />
          {cancelError === 'payment_required' && (
            <InlineNotification severity="alert">
              <DynamicT forKey="cloud.self_hosted_licenses.cancel.payment_required" />
            </InlineNotification>
          )}
          {cancelError === 'failed' && (
            <InlineNotification
              severity="error"
              action="general.retry"
              onClick={() => {
                void cancel();
              }}
            >
              <DynamicT forKey="cloud.self_hosted_licenses.cancel.failed" />
            </InlineNotification>
          )}
          {/* Self-hosted license usage reporting is still in development. */}
          {isDevFeaturesEnabled && <Usage license={data} />}
          <FormCard
            title="cloud.self_hosted_licenses.keys_title"
            description="cloud.self_hosted_licenses.keys_description"
          >
            {data.status === 'active' && !data.keyUnavailableReason && userId ? (
              // Keep issued keys local to this account and license, including in-flight responses.
              <Keys key={`${userId}:${id}`} id={id} />
            ) : (
              <InlineNotification severity="alert">
                <DynamicT forKey={keysUnavailableKey} />
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
          <ConfirmModal
            isOpen={isCancelConfirmOpen}
            isLoading={isCanceling}
            title="cloud.self_hosted_licenses.cancel.confirm_title"
            confirmButtonText="cloud.self_hosted_licenses.cancel.action"
            cancelButtonText="cloud.self_hosted_licenses.cancel.keep"
            onCancel={() => {
              setIsCancelConfirmOpen(false);
            }}
            onConfirm={async () => {
              await cancel();
              setIsCancelConfirmOpen(false);
            }}
          >
            <DynamicT forKey="cloud.self_hosted_licenses.cancel.confirm_content" />
          </ConfirmModal>
        </>
      )}
    </DetailsPage>
  );
}

export default Details;
