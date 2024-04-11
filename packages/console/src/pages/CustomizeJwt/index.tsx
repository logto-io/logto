import { withAppInsights } from '@logto/app-insights/react/AppInsightsReact';
import { LogtoJwtTokenKeyType } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import CardTitle from '@/ds-components/CardTitle';
import FormField from '@/ds-components/FormField';

import CreateButton from './CreateButton';
import CustomizerItem from './CustomizerItem';
import * as styles from './index.module.scss';
import useJwtCustomizer from './use-jwt-customizer';

function CustomizeJwt() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { isLoading, accessTokenJwtCustomizer, clientCredentialsJwtCustomizer } =
    useJwtCustomizer();

  return (
    <main className={styles.mainContent}>
      <CardTitle
        title="jwt_claims.title"
        subtitle="jwt_claims.description"
        className={styles.header}
      />
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
                  <CustomizerItem tokenType={LogtoJwtTokenKeyType.AccessToken} />
                ) : (
                  <CreateButton tokenType={LogtoJwtTokenKeyType.AccessToken} />
                )}
              </FormField>
            </FormCard>
            <FormCard title="jwt_claims.machine_to_machine_jwt.card_title">
              <FormField title="jwt_claims.machine_to_machine_jwt.card_field">
                <div className={styles.description}>
                  {t('jwt_claims.machine_to_machine_jwt.card_description')}
                </div>
                {clientCredentialsJwtCustomizer ? (
                  <CustomizerItem tokenType={LogtoJwtTokenKeyType.ClientCredentials} />
                ) : (
                  <CreateButton tokenType={LogtoJwtTokenKeyType.ClientCredentials} />
                )}
              </FormField>
            </FormCard>
          </>
        )}
      </div>
    </main>
  );
}

export default withAppInsights(CustomizeJwt);
