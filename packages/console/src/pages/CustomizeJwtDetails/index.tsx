import { withAppInsights } from '@logto/app-insights/react/AppInsightsReact';
import { type LogtoJwtTokenPath } from '@logto/schemas';
import { useMemo, useState } from 'react';

import CardTitle from '@/ds-components/CardTitle';

import { CodeEditorLoadingContext } from './CodeEditorLoadingContext';
import Main from './Main';
import PageLoadingSkeleton from './PageLoadingSkeleton';
import * as styles from './index.module.scss';
import useJwtCustomizer from './use-jwt-customizer';

type Props = {
  tokenType: LogtoJwtTokenPath;
  action: 'create' | 'edit';
};

function CustomizeJwtDetails({ tokenType }: Props) {
  const { isLoading, ...rest } = useJwtCustomizer();
  const [isMonacoLoaded, setIsMonacoLoaded] = useState(false);

  const codeEditorContextValue = useMemo(
    () => ({ isMonacoLoaded, setIsMonacoLoaded }),
    [isMonacoLoaded]
  );

  return (
    <div className={styles.container}>
      <CardTitle
        title="jwt_claims.title"
        subtitle="jwt_claims.description"
        className={styles.header}
      />
      {(isLoading || !isMonacoLoaded) && <PageLoadingSkeleton tokenType={tokenType} />}

      {!isLoading && (
        <CodeEditorLoadingContext.Provider value={codeEditorContextValue}>
          <Main tab={tokenType} {...rest} className={isMonacoLoaded ? undefined : styles.hidden} />
        </CodeEditorLoadingContext.Provider>
      )}
    </div>
  );
}

// eslint-disable-next-line import/no-unused-modules -- will update this later
export default withAppInsights(CustomizeJwtDetails);
