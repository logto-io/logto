import { LogtoJwtTokenKeyType, ReservedPlanId, type ExtendedIdTokenClaim } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useCallback, useContext, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { customIdToken } from '@/consts/external-links';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import CardTitle from '@/ds-components/CardTitle';
import FormField from '@/ds-components/FormField';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import { isPaidPlan } from '@/utils/subscription';

import CreateButton from './CreateButton';
import CustomizerItem from './CustomizerItem';
import DeleteConfirmModal from './DeleteConfirmModal';
import IdTokenSection from './IdTokenSection';
import UpsellNotice from './UpsellNotice';
import styles from './index.module.scss';
import useIdTokenConfig from './use-id-token-config';
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

  const {
    isLoading: isJwtLoading,
    accessTokenJwtCustomizer,
    clientCredentialsJwtCustomizer,
  } = useJwtCustomizer();

  const {
    data: idTokenConfig,
    isLoading: isIdTokenLoading,
    updateConfig: updateIdTokenConfig,
  } = useIdTokenConfig();

  const isLoading = isJwtLoading || isIdTokenLoading;

  // Local state for ID token claims editing
  const [enabledClaims, setEnabledClaims] = useState<ExtendedIdTokenClaim[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize local state when data is loaded
  if (!isInitialized && idTokenConfig) {
    setEnabledClaims(idTokenConfig.enabledExtendedClaims ?? []);
    setIsInitialized(true);
  }

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!idTokenConfig) {
      return false;
    }
    const originalClaims = idTokenConfig.enabledExtendedClaims ?? [];
    if (originalClaims.length !== enabledClaims.length) {
      return true;
    }
    return !originalClaims.every((claim) => enabledClaims.includes(claim));
  }, [idTokenConfig, enabledClaims]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateIdTokenConfig({ enabledExtendedClaims: enabledClaims });
      toast.success(t('general.saved'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setEnabledClaims(idTokenConfig?.enabledExtendedClaims ?? []);
  };

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
            <FormCardSkeleton formFieldCount={2} />
            <FormCardSkeleton formFieldCount={1} />
          </>
        )}
        {!isLoading && (
          <>
            <FormCard
              title="jwt_claims.access_token.card_title"
              description="jwt_claims.access_token.card_description"
              learnMoreLink={{
                href: getDocumentationUrl('/docs/recipes/custom-jwt'),
                targetBlank: 'noopener',
              }}
            >
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
            <FormCard
              title="jwt_claims.id_token.card_title"
              description="jwt_claims.id_token.card_description"
              learnMoreLink={{
                href: getDocumentationUrl(customIdToken),
                targetBlank: 'noopener',
              }}
            >
              <IdTokenSection
                value={enabledClaims}
                isDisabled={showPaywall}
                onChange={setEnabledClaims}
              />
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
      <SubmitFormChangesActionBar
        isOpen={hasChanges}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onDiscard={handleDiscard}
      />
      <UnsavedChangesAlertModal hasUnsavedChanges={hasChanges} />
    </main>
  );
}

export default CustomizeJwt;
