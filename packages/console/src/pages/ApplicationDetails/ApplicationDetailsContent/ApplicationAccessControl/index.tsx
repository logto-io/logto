import {
  type ApplicationAccessControl as ApplicationAccessControlRules,
  type ApplicationResponse,
} from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import FormCard from '@/components/FormCard';
import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { appLevelAccessControl } from '@/consts';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import { Ring } from '@/ds-components/Spinner';
import Switch from '@/ds-components/Switch';
import useApi, { type RequestError } from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';

import AddRuleMenu from './AddRuleMenu';
import RuleSelectorModals from './RuleSelectorModals';
import RulesTable from './RulesTable';
import styles from './index.module.scss';
import { type RuleType } from './types';
import useRuleEntities from './use-rule-entities';
import { areApplicationAccessControlsEqual, hasApplicationAccessControlRules } from './utils';

type Props = {
  readonly application: ApplicationResponse;
  readonly isActive: boolean;
  readonly onApplicationUpdated: (application?: ApplicationResponse) => void | Promise<void>;
};

type ApplicationAccessControlForm = {
  appLevelAccessControlEnabled: boolean;
  accessControl?: ApplicationAccessControlRules;
};

function ApplicationAccessControl({ application, isActive, onApplicationUpdated }: Props) {
  const { id, appLevelAccessControlEnabled } = application;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const [activeRuleType, setActiveRuleType] = useState<RuleType>();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty, isSubmitting },
  } = useForm<ApplicationAccessControlForm>({
    defaultValues: {
      appLevelAccessControlEnabled,
    },
  });

  const {
    data: accessControl,
    error,
    isLoading,
    mutate,
  } = useSWR<ApplicationAccessControlRules, RequestError>(
    isActive && `api/applications/${id}/access-control`
  );

  const draftEnabled = useWatch({ control, name: 'appLevelAccessControlEnabled' });
  const draftAccessControl = useWatch({ control, name: 'accessControl' });
  const ruleEntities = useRuleEntities(draftAccessControl);

  useEffect(() => {
    if (accessControl && !isDirty) {
      reset({
        appLevelAccessControlEnabled,
        accessControl,
      });
    }
  }, [accessControl, appLevelAccessControlEnabled, isDirty, reset]);

  const isRuleEntitiesLoading = Object.values(ruleEntities.isLoading).some(Boolean);

  const updateDraftAccessControl = useCallback(
    (nextAccessControl: ApplicationAccessControlRules) => {
      if (draftEnabled && !hasApplicationAccessControlRules(nextAccessControl)) {
        toast.error(t('application_details.access_control.enable_without_rules_notice'));
        return false;
      }

      setValue('accessControl', nextAccessControl, { shouldDirty: true });
      setActiveRuleType(undefined);
      return true;
    },
    [draftEnabled, setValue, t]
  );

  const discardChanges = useCallback(() => {
    reset({
      appLevelAccessControlEnabled,
      accessControl,
    });
    setActiveRuleType(undefined);
  }, [accessControl, appLevelAccessControlEnabled, reset]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async ({ appLevelAccessControlEnabled, accessControl: draftAccessControl }) => {
      if (!draftAccessControl) {
        return;
      }

      if (appLevelAccessControlEnabled && !hasApplicationAccessControlRules(draftAccessControl)) {
        toast.error(t('application_details.access_control.enable_without_rules_notice'));
        return;
      }

      const shouldUpdateRules = Boolean(
        accessControl && !areApplicationAccessControlsEqual(accessControl, draftAccessControl)
      );
      const shouldUpdateEnabled =
        appLevelAccessControlEnabled !== application.appLevelAccessControlEnabled;

      const savedAccessControl = shouldUpdateRules
        ? await api
            .put(`api/applications/${id}/access-control`, {
              json: draftAccessControl,
            })
            .json<ApplicationAccessControlRules>()
        : draftAccessControl;

      if (shouldUpdateRules) {
        await mutate(savedAccessControl, { revalidate: false });
      }

      if (shouldUpdateEnabled) {
        const updatedApplication = await api
          .patch(`api/applications/${id}`, {
            json: { appLevelAccessControlEnabled },
          })
          .json<ApplicationResponse>();
        await onApplicationUpdated(updatedApplication);
      }

      reset({
        appLevelAccessControlEnabled,
        accessControl: savedAccessControl,
      });
      toast.success(t('general.saved'));
    })
  );

  return (
    <div className={classNames(styles.container, isDirty && styles.withSubmitActionBar)}>
      <div className={styles.fields}>
        <FormCard
          title="application_details.access_control.title"
          description="application_details.access_control.description"
          learnMoreLink={{ href: appLevelAccessControl }}
        >
          <Controller
            control={control}
            name="appLevelAccessControlEnabled"
            render={({ field: { onChange, value } }) => (
              <FormField title="application_details.access_control.enable">
                <Switch
                  checked={value}
                  disabled={!draftAccessControl || isSubmitting}
                  label={t('application_details.access_control.enable_description')}
                  onChange={({ currentTarget: { checked } }) => {
                    onChange(checked);
                  }}
                />
              </FormField>
            )}
          />
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
          {draftAccessControl && (
            <div className={styles.rulesSection}>
              <div className={styles.rulesHeader}>
                <div className={styles.rulesTitle}>
                  {t('application_details.access_control.custom_allow_rules')}
                </div>
                <div className={styles.rulesDescription}>
                  {t('application_details.access_control.custom_allow_rules_description')}
                </div>
              </div>
              {isRuleEntitiesLoading && (
                <div className={styles.loading}>
                  <Ring />
                </div>
              )}
              {!isRuleEntitiesLoading && ruleEntities.hasError && (
                <InlineNotification className={styles.notification} severity="error">
                  {t('application_details.access_control.load_error')}
                </InlineNotification>
              )}
              {!isRuleEntitiesLoading &&
                !ruleEntities.hasError &&
                hasApplicationAccessControlRules(draftAccessControl) && (
                  <>
                    <RulesTable
                      accessControl={draftAccessControl}
                      ruleEntities={ruleEntities}
                      onChange={async (nextAccessControl) =>
                        updateDraftAccessControl(nextAccessControl)
                      }
                    />
                    <div className={styles.addAnother}>
                      <AddRuleMenu
                        hasRules
                        onSelect={(type) => {
                          setActiveRuleType(type);
                        }}
                      />
                    </div>
                  </>
                )}
              {!isRuleEntitiesLoading &&
                !ruleEntities.hasError &&
                !hasApplicationAccessControlRules(draftAccessControl) && (
                  <div className={styles.emptyRules}>
                    <AddRuleMenu
                      hasRules={false}
                      onSelect={(type) => {
                        setActiveRuleType(type);
                      }}
                    />
                  </div>
                )}
            </div>
          )}
        </FormCard>
      </div>
      <SubmitFormChangesActionBar
        isOpen={isDirty}
        isSubmitting={isSubmitting}
        isSubmitDisabled={!draftAccessControl}
        onSubmit={onSubmit}
        onDiscard={discardChanges}
      />
      {isActive && (
        <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} onConfirm={discardChanges} />
      )}
      {draftAccessControl && (
        <RuleSelectorModals
          activeRuleType={activeRuleType}
          accessControl={draftAccessControl}
          ruleEntities={ruleEntities}
          isSubmitting={isSubmitting}
          onClose={() => {
            setActiveRuleType(undefined);
          }}
          onUpdate={updateDraftAccessControl}
        />
      )}
    </div>
  );
}

export default ApplicationAccessControl;
