import { LogtoJwtTokenKeyType } from '@logto/schemas';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import CardTitle from '@/ds-components/CardTitle';
import FormField from '@/ds-components/FormField';

import CreateButton from './CreateButton';
import CustomizerItem from './CustomizerItem';
import DeleteConfirmModal from './DeleteConfirmModal';
import * as styles from './index.module.scss';
import useJwtCustomizer from './use-jwt-customizer';

function CustomizeJwt() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [deleteModalTokenType, setDeleteModalTokenType] = useState<LogtoJwtTokenKeyType>();

  const onDeleteHandler = useCallback((tokenType: LogtoJwtTokenKeyType) => {
    setDeleteModalTokenType(tokenType);
  }, []);

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
                  <CustomizerItem
                    tokenType={LogtoJwtTokenKeyType.AccessToken}
                    onDelete={onDeleteHandler}
                  />
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
                  <CustomizerItem
                    tokenType={LogtoJwtTokenKeyType.ClientCredentials}
                    onDelete={onDeleteHandler}
                  />
                ) : (
                  <CreateButton tokenType={LogtoJwtTokenKeyType.ClientCredentials} />
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
