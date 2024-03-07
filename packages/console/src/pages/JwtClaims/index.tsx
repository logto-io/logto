import { withAppInsights } from '@logto/app-insights/react/AppInsightsReact';
import classNames from 'classnames';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CardTitle from '@/ds-components/CardTitle';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';

import ScriptPanel from './ScriptPanel';
import SettingsPanel from './SettingsPanel';
import { JwtTokenType } from './config';
import * as styles from './index.module.scss';
import { type JwtClaimsFormType } from './type';

export { JwtTokenType } from './config';

const tabPhrases = Object.freeze({
  [JwtTokenType.UserAccessToken]: 'user_jwt_tab',
  [JwtTokenType.MachineToMachineAccessToken]: 'machine_to_machine_jwt_tab',
});

const getPath = (tab: JwtTokenType) => `/jwt-claims/${tab}`;

type Props = {
  tab: JwtTokenType;
};

function JwtClaims({ tab }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const userJwtClaimsForm = useForm<JwtClaimsFormType>({
    defaultValues: {
      tokenType: JwtTokenType.UserAccessToken,
      environmentVariables: [{ key: '', value: '' }],
    },
  });

  const machineToMachineJwtClaimsForm = useForm<JwtClaimsFormType>({
    defaultValues: {
      tokenType: JwtTokenType.MachineToMachineAccessToken,
      environmentVariables: [{ key: '', value: '' }],
    },
  });

  return (
    <div className={styles.container}>
      <CardTitle
        title="jwt_claims.title"
        subtitle="jwt_claims.description"
        className={styles.header}
      />
      <TabNav className={styles.tabNav}>
        {Object.values(JwtTokenType).map((tokenType) => (
          <TabNavItem key={tokenType} href={getPath(tokenType)} isActive={tokenType === tab}>
            {t(`jwt_claims.${tabPhrases[tokenType]}`)}
          </TabNavItem>
        ))}
      </TabNav>
      <FormProvider
        {...(tab === JwtTokenType.UserAccessToken
          ? userJwtClaimsForm
          : machineToMachineJwtClaimsForm)}
      >
        <form className={classNames(styles.tabContent)}>
          <ScriptPanel />
          <SettingsPanel />
        </form>
      </FormProvider>
    </div>
  );
}

export default withAppInsights(JwtClaims);
