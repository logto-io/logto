import { withAppInsights } from '@logto/app-insights/react/AppInsightsReact';
import { LogtoJwtTokenPath } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import CardTitle from '@/ds-components/CardTitle';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';

import Main from './Main';
import * as styles from './index.module.scss';
import useJwtCustomizer from './use-jwt-customizer';

const tabPhrases = Object.freeze({
  [LogtoJwtTokenPath.AccessToken]: 'user_jwt_tab',
  [LogtoJwtTokenPath.ClientCredentials]: 'machine_to_machine_jwt_tab',
});

const getPagePath = (tokenType: LogtoJwtTokenPath) => `/jwt-customizer/${tokenType}`;

type Props = {
  tab: LogtoJwtTokenPath;
};

function JwtClaims({ tab }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { isLoading, ...rest } = useJwtCustomizer();

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
      {/* TODO: Loading skelton */}
      {!isLoading && <Main tab={tab} {...rest} />}
    </div>
  );
}

export default withAppInsights(JwtClaims);
