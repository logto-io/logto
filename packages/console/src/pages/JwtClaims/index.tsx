import { withAppInsights } from '@logto/app-insights/react/AppInsightsReact';
import { LogtoJwtTokenPath } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import CardTitle from '@/ds-components/CardTitle';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';

import ScriptSection from './ScriptSection';
import SettingsSection from './SettingsSection';
import * as styles from './index.module.scss';
import { type JwtClaimsFormType } from './type';

const tabPhrases = Object.freeze({
  [LogtoJwtTokenPath.AccessToken]: 'user_jwt_tab',
  [LogtoJwtTokenPath.ClientCredentials]: 'machine_to_machine_jwt_tab',
});

const getPath = (tab: LogtoJwtTokenPath) => `/jwt-claims/${tab}`;

type Props = {
  tab: LogtoJwtTokenPath;
};

// TODO: API integration
function JwtClaims({ tab }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const userJwtClaimsForm = useForm<JwtClaimsFormType>({
    defaultValues: {
      tokenType: LogtoJwtTokenPath.AccessToken,
      environmentVariables: [{ key: '', value: '' }],
    },
  });

  const machineToMachineJwtClaimsForm = useForm<JwtClaimsFormType>({
    defaultValues: {
      tokenType: LogtoJwtTokenPath.ClientCredentials,
      environmentVariables: [{ key: '', value: '' }],
    },
  });

  const activeForm = useMemo(
    () =>
      tab === LogtoJwtTokenPath.AccessToken ? userJwtClaimsForm : machineToMachineJwtClaimsForm,
    [machineToMachineJwtClaimsForm, tab, userJwtClaimsForm]
  );

  const {
    formState: { isDirty, isSubmitting },
    reset,
    handleSubmit,
  } = activeForm;

  const onSubmitHandler = handleSubmit(async (data) => {
    // TODO: API integration
  });

  return (
    <div className={styles.container}>
      <CardTitle
        title="jwt_claims.title"
        subtitle="jwt_claims.description"
        className={styles.header}
      />
      <TabNav className={styles.tabNav}>
        {Object.values(LogtoJwtTokenPath).map((tokenType) => (
          <TabNavItem key={tokenType} href={getPath(tokenType)} isActive={tokenType === tab}>
            {t(`jwt_claims.${tabPhrases[tokenType]}`)}
          </TabNavItem>
        ))}
      </TabNav>
      <FormProvider {...activeForm}>
        <form className={classNames(styles.tabContent)}>
          <ScriptSection />
          <SettingsSection />
        </form>
      </FormProvider>
      <SubmitFormChangesActionBar
        isOpen={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={reset}
        onSubmit={onSubmitHandler}
      />
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty && !isSubmitting} />
    </div>
  );
}

export default withAppInsights(JwtClaims);
