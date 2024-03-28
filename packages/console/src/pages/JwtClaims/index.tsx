import { withAppInsights } from '@logto/app-insights/react/AppInsightsReact';
import { LogtoJwtTokenPath } from '@logto/schemas';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CardTitle from '@/ds-components/CardTitle';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';

import { CodeEditorLoadingContext } from './CodeEditorLoadingContext';
import Main from './Main';
import PageLoadingSkeleton from './PageLoadingSkeleton';
import * as styles from './index.module.scss';
import useJwtCustomizer from './use-jwt-customizer';

const tabPhrases = Object.freeze({
  [LogtoJwtTokenPath.AccessToken]: 'user_jwt.card_field',
  [LogtoJwtTokenPath.ClientCredentials]: 'machine_to_machine_jwt.card_field',
});

const getPagePath = (tokenType: LogtoJwtTokenPath) => `/jwt-customizer/${tokenType}`;

type Props = {
  tab: LogtoJwtTokenPath;
};

function JwtClaims({ tab }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

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
      <TabNav className={styles.tabNav}>
        {Object.values(LogtoJwtTokenPath).map((tokenType) => (
          <TabNavItem key={tokenType} href={getPagePath(tokenType)} isActive={tokenType === tab}>
            {t(`jwt_claims.${tabPhrases[tokenType]}`)}
          </TabNavItem>
        ))}
      </TabNav>
      {(isLoading || !isMonacoLoaded) && <PageLoadingSkeleton tokenType={tab} />}

      {!isLoading && (
        <CodeEditorLoadingContext.Provider value={codeEditorContextValue}>
          <Main tab={tab} {...rest} className={isMonacoLoaded ? undefined : styles.hidden} />
        </CodeEditorLoadingContext.Provider>
      )}
    </div>
  );
}

// eslint-disable-next-line import/no-unused-modules -- will update this later
export default withAppInsights(JwtClaims);
