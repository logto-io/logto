import {
  type ApplicationAccessControl as ApplicationAccessControlRules,
  type ApplicationResponse,
} from '@logto/schemas';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import FormCard from '@/components/FormCard';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import { Ring } from '@/ds-components/Spinner';
import Switch from '@/ds-components/Switch';
import useApi, { type RequestError } from '@/hooks/use-api';

import styles from './index.module.scss';
import { getOrganizationRoleRuleCount, hasApplicationAccessControlRules } from './utils';

type RuleRowProps = {
  readonly title: string;
  readonly description: string;
  readonly count: number;
};

function RuleRow({ title, description, count }: RuleRowProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.ruleRow}>
      <div className={styles.ruleContent}>
        <div className={styles.ruleTitle}>{title}</div>
        <div className={styles.ruleDescription}>{description}</div>
      </div>
      <div className={styles.ruleCount}>
        {t('application_details.access_control.rule_count', { count })}
      </div>
    </div>
  );
}

type Props = {
  readonly application: ApplicationResponse;
  readonly isActive: boolean;
  readonly onApplicationUpdated: () => void;
};

function ApplicationAccessControl({ application, isActive, onApplicationUpdated }: Props) {
  const { id, appLevelAccessControlEnabled } = application;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const [isEnabled, setIsEnabled] = useState(appLevelAccessControlEnabled);
  const [isUpdatingEnabled, setIsUpdatingEnabled] = useState(false);

  const {
    data: accessControl,
    error,
    isLoading,
    mutate,
  } = useSWR<ApplicationAccessControlRules, RequestError>(
    isActive && `api/applications/${id}/access-control`
  );

  useEffect(() => {
    setIsEnabled(appLevelAccessControlEnabled);
  }, [appLevelAccessControlEnabled]);

  const hasAccessControlRules = accessControl && hasApplicationAccessControlRules(accessControl);
  const isEnableBlocked = !isEnabled && !hasAccessControlRules;

  const onEnabledChange = async (enabled: boolean) => {
    if (isUpdatingEnabled) {
      return;
    }

    if (enabled && !hasAccessControlRules) {
      toast.error(t('application_details.access_control.enable_without_rules_notice'));
      return;
    }

    setIsEnabled(enabled);
    setIsUpdatingEnabled(true);

    try {
      await api
        .patch(`api/applications/${id}`, {
          json: { appLevelAccessControlEnabled: enabled },
        })
        .json<ApplicationResponse>();
      onApplicationUpdated();
      toast.success(t('general.saved'));
    } catch {
      setIsEnabled(appLevelAccessControlEnabled);
      // The global API error handler has already surfaced the error.
    } finally {
      setIsUpdatingEnabled(false);
    }
  };

  return (
    <FormCard
      title="application_details.access_control.title"
      description="application_details.access_control.description"
    >
      <FormField title="application_details.access_control.enable">
        <Switch
          checked={isEnabled}
          disabled={isUpdatingEnabled || isEnableBlocked}
          label={t('application_details.access_control.enable_description')}
          onChange={({ currentTarget: { checked } }) => {
            void onEnabledChange(checked);
          }}
        />
      </FormField>
      {!isEnabled && accessControl && !hasAccessControlRules && (
        <InlineNotification severity="alert" className={styles.notification}>
          {t('application_details.access_control.enable_without_rules_notice')}
        </InlineNotification>
      )}
      <InlineNotification severity={isEnabled ? 'info' : 'success'} className={styles.notification}>
        {t(
          isEnabled
            ? 'application_details.access_control.enabled_notice'
            : 'application_details.access_control.disabled_notice'
        )}
      </InlineNotification>
      {isLoading && (
        <div className={styles.loading}>
          <Ring />
        </div>
      )}
      {error && (
        <InlineNotification
          action="general.retry"
          className={styles.notification}
          severity="error"
          onClick={() => {
            void mutate();
          }}
        >
          {t('application_details.access_control.load_error')}
        </InlineNotification>
      )}
      {accessControl && (
        <div className={styles.ruleRows}>
          <div className={styles.ruleRowsHeader}>
            <div className={styles.ruleRowsTitle}>
              {t('application_details.access_control.rules')}
            </div>
            <div className={styles.ruleRowsDescription}>
              {t(
                hasApplicationAccessControlRules(accessControl)
                  ? 'application_details.access_control.rules_description'
                  : 'application_details.access_control.empty_rules_description'
              )}
            </div>
          </div>
          <RuleRow
            title={t('application_details.access_control.rule_users')}
            description={t('application_details.access_control.rule_users_description')}
            count={accessControl.userIds.length}
          />
          <RuleRow
            title={t('application_details.access_control.rule_user_roles')}
            description={t('application_details.access_control.rule_user_roles_description')}
            count={accessControl.userRoleIds.length}
          />
          <RuleRow
            title={t('application_details.access_control.rule_organizations')}
            description={t('application_details.access_control.rule_organizations_description')}
            count={accessControl.organizationIds.length}
          />
          <RuleRow
            title={t('application_details.access_control.rule_organization_roles')}
            description={t(
              'application_details.access_control.rule_organization_roles_description'
            )}
            count={getOrganizationRoleRuleCount(accessControl)}
          />
        </div>
      )}
    </FormCard>
  );
}

export default ApplicationAccessControl;
