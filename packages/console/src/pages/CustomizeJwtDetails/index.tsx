import { type LogtoJwtTokenKeyType } from '@logto/schemas';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import DetailsPage from '@/components/DetailsPage';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';

import { CodeEditorLoadingContext } from './CodeEditorLoadingContext';
import MainContent from './MainContent';
import PageLoadingSkeleton from './PageLoadingSkeleton';
import * as styles from './index.module.scss';
import { pageParamsGuard, type Action } from './type';
import useDataFetch from './use-data-fetch';

type Props = {
  readonly tokenType: LogtoJwtTokenKeyType;
  readonly action: Action;
};

function Content({ tokenType, action }: Props) {
  const { isLoading, error, ...rest } = useDataFetch(tokenType, action);

  const [isMonacoLoaded, setIsMonacoLoaded] = useState(false);

  const codeEditorContextValue = useMemo(
    () => ({ isMonacoLoaded, setIsMonacoLoaded }),
    [isMonacoLoaded]
  );

  return (
    <DetailsPage
      backLink="/customize-jwt"
      backLinkTitle="jwt_claims.title"
      className={styles.container}
    >
      {(isLoading || !isMonacoLoaded) && <PageLoadingSkeleton tokenType={tokenType} />}

      {!isLoading && (
        <CodeEditorLoadingContext.Provider value={codeEditorContextValue}>
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
