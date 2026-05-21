import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import { isDevFeaturesEnabled } from '@/consts/env';
import { AppDataContext } from '@/contexts/AppDataProvider';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useUserPreferences from '@/hooks/use-user-preferences';

import PrebuiltUiUrlItem from './PrebuiltUiUrlItem';
import styles from './index.module.scss';

type PrebuiltRoute = {
  path: string;
  tooltipKey: string;
  isPreviewHidden?: boolean;
};

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
    path: '/account/authenticator-app/replace',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.authenticator_app_replace',
  },
  {
    path: '/account/backup-codes/generate',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.backup_codes_generate',
  },
  {
    path: '/account/backup-codes/manage',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.backup_codes_manage',
  },
  {
    path: '/account/social/:connectorId',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.social',
    isPreviewHidden: true,
  },
  {
    path: '/account/social/:connectorId/change',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.social_change',
    isPreviewHidden: true,
  },
  {
    path: '/account/social/:connectorId/remove',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.social_remove',
    isPreviewHidden: true,
  },
] as const satisfies readonly PrebuiltRoute[];

const accountCenterRoutes = [
  {
    path: '/account/security',
    tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.account_center',
  },
  ...(isDevFeaturesEnabled
    ? ([
        {
          path: '/account/profile',
          tooltipKey: 'sign_in_exp.account_center.prebuilt_ui.tooltips.profile',
        },
      ] as const)
    : []),
] as const satisfies ReadonlyArray<{ path: string; tooltipKey: string }>;

function IntegratePrebuiltUi() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tenantEndpoint } = useContext(AppDataContext);
  const { getDocumentationUrl } = useDocumentationUrl();
  const {
    data: { prebuiltUiPermissionNoticeAcknowledged },
    update,
  } = useUserPreferences();

  return (
    <FormCard
      title="sign_in_exp.account_center.prebuilt_ui.title"
      description="sign_in_exp.account_center.prebuilt_ui.description"
      learnMoreLink={{ href: 'end-user-flows/account-settings/by-account-center-ui' }}
    >
      <div className={styles.cardContent}>
        {!prebuiltUiPermissionNoticeAcknowledged && (
          <InlineNotification
            className={styles.notice}
            action="general.got_it"
            onClick={() => {
              void update({ prebuiltUiPermissionNoticeAcknowledged: true });
            }}
          >
            <Trans
              components={{
                strong: <strong />,
              }}
            >
              {t('sign_in_exp.account_center.prebuilt_ui.permission_notice')}
            </Trans>
          </InlineNotification>
        )}
        <FormField
          className={styles.firstFormField}
          title="sign_in_exp.account_center.prebuilt_ui.account_center_title"
          headlineSpacing="large"
        >
          <div className={styles.description}>
            <DynamicT forKey="sign_in_exp.account_center.prebuilt_ui.account_center_description" />
          </div>
          <div className={styles.urlGrid}>
            {accountCenterRoutes.map((route) => (
              <PrebuiltUiUrlItem
                key={route.path}
                path={route.path}
                tooltip={t(route.tooltipKey)}
                tenantEndpoint={tenantEndpoint}
              />
            ))}
          </div>
        </FormField>
        <FormField
          className={styles.secondFormField}
          title="sign_in_exp.account_center.prebuilt_ui.single_task_flows_title"
          headlineSpacing="large"
        >
          <div className={styles.description}>
            <DynamicT forKey="sign_in_exp.account_center.prebuilt_ui.single_task_flows_description" />
          </div>
          <div className={styles.urlGrid}>
            {prebuiltRoutes.map((route) => (
              <PrebuiltUiUrlItem
                key={route.path}
                isPreviewHidden={'isPreviewHidden' in route ? route.isPreviewHidden : false}
                path={route.path}
                tooltip={t(route.tooltipKey)}
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
