import { withAppInsights } from '@logto/app-insights/react/AppInsightsReact';
import { useTranslation } from 'react-i18next';

import CardTitle from '@/ds-components/CardTitle';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';

import * as styles from './index.module.scss';
import { JwtTokenType } from './type';

export * from './type';

type Props = {
  tab: JwtTokenType;
};

const getPath = (tab: JwtTokenType) => `/jwt-claims/${tab}`;

function JwtClaims({ tab }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <CardTitle
        title="jwt_claims.title"
        subtitle="jwt_claims.description"
        className={styles.cardTitle}
      />
      <TabNav>
        <TabNavItem
          href={getPath(JwtTokenType.UserAccessToken)}
          isActive={tab === JwtTokenType.UserAccessToken}
        >
          {t('jwt_claims.user_jwt_tab')}
        </TabNavItem>
        <TabNavItem
          href={getPath(JwtTokenType.MachineToMachineAccessToken)}
          isActive={tab === JwtTokenType.MachineToMachineAccessToken}
        >
          {t('jwt_claims.machine_to_machine_jwt_tab')}
        </TabNavItem>
      </TabNav>
    </div>
  );
}

export default withAppInsights(JwtClaims);
