import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import { AppDataContext } from '@/contexts/AppDataProvider';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import PrebuiltUiUrlItem from './PrebuiltUiUrlItem';
import styles from './index.module.scss';

const prebuiltRoutes = [
  { path: '/account/email', tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.email' },
  { path: '/account/phone', tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.phone' },
  {
    path: '/account/username',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.username',
  },
  {
    path: '/account/password',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.password',
  },
  {
    path: '/account/passkey/add',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.passkey_add',
  },
  {
    path: '/account/passkey/manage',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.passkey_manage',
  },
  {
    path: '/account/authenticator-app',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.authenticator_app',
  },
  {
    path: '/account/backup-codes/generate',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.backup_codes_generate',
  },
  {
    path: '/account/backup-codes/manage',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.backup_codes_manage',
  },
] as const;

function IntegratePrebuiltUi() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tenantEndpoint } = useContext(AppDataContext);
  const { getDocumentationUrl } = useDocumentationUrl();

  return (
    <FormCard
      title="sign_in_exp.account_center.prebuilt_ui.title"
      description="sign_in_exp.account_center.prebuilt_ui.description"
      learnMoreLink={{ href: 'end-user-flows/account-settings/by-account-center-ui' }}
    >
      <div className={styles.cardContent}>
        <FormField
          title="sign_in_exp.account_center.prebuilt_ui.flows_title"
          headlineSpacing="large"
        >
          <div className={styles.description}>
            <DynamicT forKey="sign_in_exp.account_center.prebuilt_ui.flows_description" />
          </div>
          <div className={styles.urlGrid}>
            {prebuiltRoutes.map(({ path, tooltipKey }) => (
              <PrebuiltUiUrlItem
                key={path}
                path={path}
                tooltip={t(tooltipKey)}
                tenantEndpoint={tenantEndpoint}
              />
            ))}
          </div>
        </FormField>
        <div className={styles.customizeNote}>
          <DynamicT forKey="sign_in_exp.account_center.prebuilt_ui.customize_note" />
          <TextLink
            href={getDocumentationUrl('end-user-flows/account-settings/by-account-api')}
            targetBlank="noopener"
          >
            <DynamicT forKey="sign_in_exp.account_center.prebuilt_ui.customize_link" />
          </TextLink>
        </div>
      </div>
    </FormCard>
  );
}

export default IntegratePrebuiltUi;
