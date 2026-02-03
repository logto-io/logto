import { type IdTokenConfig, LogtoJwtTokenKeyType, ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useCallback, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';

import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import { isDevFeaturesEnabled } from '@/consts/env';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import CardTitle from '@/ds-components/CardTitle';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import TextLink from '@/ds-components/TextLink';
import useApi, { type RequestError } from '@/hooks/use-api';
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
  const api = useApi();

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

  // DEV: custom data in ID token
  const {
    data: idTokenConfig,
    mutate: mutateIdTokenConfig,
    isLoading: isIdTokenConfigLoading,
  } = useSWR<IdTokenConfig, RequestError>(isDevFeaturesEnabled ? 'api/configs/id-token' : null);
  const [isUpdatingCustomData, setIsUpdatingCustomData] = useState(false);

  const handleCustomDataToggleChange = useCallback(
    async (checked: boolean) => {
      if (isUpdatingCustomData) {
        return;
      }

      setIsUpdatingCustomData(true);
      try {
        await api.patch('api/configs/id-token', {
          json: { includeUserCustomData: checked },
        });
        await mutateIdTokenConfig();
        toast.success(t('general.saved'));
      } finally {
        setIsUpdatingCustomData(false);
      }
    },
    [api, mutateIdTokenConfig, t]
  );

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
              {/* DEV: custom data in ID token */}
              {isDevFeaturesEnabled && (
                <FormField
                  title="jwt_claims.user_jwt.custom_data_in_id_token.title"
                  tip={t('jwt_claims.user_jwt.custom_data_in_id_token.tip')}
                >
                  <Switch
                    description={
                      <Trans
                        components={{
                          a: (
                            <TextLink
                              targetBlank="noopener"
                              href={getDocumentationUrl('/docs/references/users/custom-data')}
                            />
                          ),
                        }}
                      >
                        {t('jwt_claims.user_jwt.custom_data_in_id_token.description')}
                      </Trans>
                    }
                    checked={idTokenConfig?.includeUserCustomData ?? false}
                    disabled={isIdTokenConfigLoading}
                    onChange={async ({ currentTarget: { checked } }) =>
                      handleCustomDataToggleChange(checked)
                    }
                  />
                </FormField>
              )}
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
