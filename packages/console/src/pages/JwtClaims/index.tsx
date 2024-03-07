import { withAppInsights } from '@logto/app-insights/react/AppInsightsReact';
import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import { useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CardTitle from '@/ds-components/CardTitle';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';

import { type Model } from './MonacoCodeEditor/type';
import ScriptPanel from './ScriptPanel';
import SettingsPanel from './SettingsPanel';
import { userJwtFile, machineToMachineJwtFile, JwtTokenType } from './config';
import * as styles from './index.module.scss';
import { type JwtClaimsFormType } from './type';

export { JwtTokenType } from './config';

type Props = {
  tab: JwtTokenType;
};

const phrases = Object.freeze({
  tab: {
    [JwtTokenType.UserAccessToken]: 'user_jwt_tab',
    [JwtTokenType.MachineToMachineAccessToken]: 'machine_to_machine_jwt_tab',
  },
  token: {
    [JwtTokenType.UserAccessToken]: 'user_jwt',
    [JwtTokenType.MachineToMachineAccessToken]: 'machine_to_machine_jwt',
  },
} satisfies Record<
  string,
  Record<JwtTokenType, TFuncKey<'translation', 'admin_console.jwt_claims'>>
>);

const getPath = (tab: JwtTokenType) => `/jwt-claims/${tab}`;

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

  // TODO: API integration, read/write the custom claims code value
  const activeModel = useMemo<Model>(() => {
    return tab === JwtTokenType.UserAccessToken ? userJwtFile : machineToMachineJwtFile;
  }, [tab]);

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
            {t(`jwt_claims.${phrases.tab[tokenType]}`)}
          </TabNavItem>
        ))}
      </TabNav>
      <FormProvider
        {...(tab === JwtTokenType.UserAccessToken
          ? userJwtClaimsForm
          : machineToMachineJwtClaimsForm)}
      >
        <form className={classNames(styles.tabContent)}>
          <ScriptPanel
            title={t('jwt_claims.code_editor_title', {
              token: t(`jwt_claims.${phrases.token[tab]}`),
            })}
            activeModel={activeModel}
          />
          <SettingsPanel />
        </form>
      </FormProvider>
    </div>
  );
}

export default withAppInsights(JwtClaims);
