import { LogtoJwtTokenKeyType, ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import CardTitle from '@/ds-components/CardTitle';
import FormField from '@/ds-components/FormField';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import { isPaidPlan } from '@/utils/subscription';

import CreateButton from './CreateButton';
import CustomizerItem from './CustomizerItem';
import DeleteConfirmModal from './DeleteConfirmModal';
import UpsellNotice from './UpsellNotice';
import styles from './index.module.scss';
import useJwtCustomizer from './use-jwt-customizer';

function CustomizeJwt() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);

  const { getDocumentationUrl } = useDocumentationUrl();

  const showPaywall = planId === ReservedPlanId.Free;

  const [deleteModalTokenType, setDeleteModalTokenType] = useState<LogtoJwtTokenKeyType>();

  const onDeleteHandler = useCallback((tokenType: LogtoJwtTokenKeyType) => {
    setDeleteModalTokenType(tokenType);
  }, []);

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  const { isLoading, accessTokenJwtCustomizer, clientCredentialsJwtCustomizer } =
    useJwtCustomizer();

  return (
    <main className={styles.mainContent}>
      <CardTitle
        paywall={cond(!isPaidTenant && latestProPlanId)}
        title="jwt_claims.title"
        subtitle="jwt_claims.description"
        learnMoreLink={{
          href: getDocumentationUrl('/docs/recipes/custom-jwt'),
          targetBlank: 'noopener',
        }}
        className={styles.header}
      />
      <UpsellNotice isVisible={showPaywall} className={styles.inlineNotice} />
      <div className={styles.container}>
        {isLoading && (
          <>
            <FormCardSkeleton formFieldCount={1} />
            <FormCardSkeleton formFieldCount={1} />
          </>
        )}
        {!isLoading && (
          <>
            <FormCard title="jwt_claims.user_jwt.card_title">
              <FormField title="jwt_claims.user_jwt.card_field">
                <div className={styles.description}>
                  {t('jwt_claims.user_jwt.card_description')}
                </div>
                {accessTokenJwtCustomizer ? (
                  <CustomizerItem
                    tokenType={LogtoJwtTokenKeyType.AccessToken}
                    onDelete={onDeleteHandler}
                  />
                ) : (
                  <CreateButton
                    isDisabled={showPaywall}
                    tokenType={LogtoJwtTokenKeyType.AccessToken}
                  />
                )}
              </FormField>
            </FormCard>
            <FormCard title="jwt_claims.machine_to_machine_jwt.card_title">
              <FormField title="jwt_claims.machine_to_machine_jwt.card_field">
                <div className={styles.description}>
                  {t('jwt_claims.machine_to_machine_jwt.card_description')}
                </div>
                {clientCredentialsJwtCustomizer ? (
                  <CustomizerItem
                    tokenType={LogtoJwtTokenKeyType.ClientCredentials}
                    onDelete={onDeleteHandler}
                  />
                ) : (
                  <CreateButton
                    isDisabled={showPaywall}
                    tokenType={LogtoJwtTokenKeyType.ClientCredentials}
                  />
                )}
              </FormField>
            </FormCard>
          </>
        )}
      </div>
      <DeleteConfirmModal
        isOpen={!!deleteModalTokenType}
        tokenType={deleteModalTokenType}
        onCancel={() => {
          setDeleteModalTokenType(undefined);
        }}
      />
    </main>
  );
}

export default CustomizeJwt;
