import { type LogtoJwtTokenKeyType } from '@logto/schemas';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import DetailsPage from '@/components/DetailsPage';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import { isCloud } from '@/consts/env';
import InlineNotification from '@/ds-components/InlineNotification';
import { type Action } from '@/pages/CustomizeJwt/utils/type';

import { CodeEditorLoadingContext } from './CodeEditorLoadingContext';
import MainContent from './MainContent';
import PageLoadingSkeleton from './PageLoadingSkeleton';
import styles from './index.module.scss';
import { pageParamsGuard } from './type';
import useDataFetch from './use-data-fetch';

type Props = {
  readonly tokenType: LogtoJwtTokenKeyType;
  readonly action: Action;
};

function Content({ tokenType, action }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isLoading, error, ...rest } = useDataFetch(tokenType, action);

  const [isMonacoLoaded, setIsMonacoLoaded] = useState(false);

  const codeEditorContextValue = useMemo(
    () => ({ isMonacoLoaded, setIsMonacoLoaded }),
    [isMonacoLoaded]
  );

  // Self-hosted scripts are not sandboxed; hide on Cloud (Dynamic Workers).
  const shouldShowSandboxWarning = !isCloud;

  return (
    <DetailsPage
      backLink="/customize-jwt"
      backLinkTitle="jwt_claims.title"
      className={styles.container}
    >
      {(isLoading || !isMonacoLoaded) && <PageLoadingSkeleton tokenType={tokenType} />}

      {!isLoading && (
        <CodeEditorLoadingContext.Provider value={codeEditorContextValue}>
          {shouldShowSandboxWarning && (
            <InlineNotification
              hasIcon
              severity="alert"
              className={isMonacoLoaded ? undefined : styles.hidden}
            >
              <div className={styles.warningTitle}>{t('jwt_claims.sandbox_warning.title')}</div>
              <div>{t('jwt_claims.sandbox_warning.description')}</div>
            </InlineNotification>
          )}
          <MainContent
            action={action}
            token={tokenType}
            {...rest}
            className={isMonacoLoaded ? undefined : styles.hidden}
          />
        </CodeEditorLoadingContext.Provider>
      )}
    </DetailsPage>
  );
}

// Guard the parameters to ensure they are valid
function CustomizeJwtDetails() {
  const { tokenType, action } = useParams();

  const params = pageParamsGuard.safeParse({ tokenType, action });

  if (!params.success) {
    return <EmptyDataPlaceholder />;
  }

  return <Content tokenType={params.data.tokenType} action={params.data.action} />;
}

export default CustomizeJwtDetails;
