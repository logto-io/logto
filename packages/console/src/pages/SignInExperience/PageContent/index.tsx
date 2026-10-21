import {
  ConnectorType,
  ForgotPasswordMethod,
  type AccountCenter as AccountCenterConfig,
  type SignInExperience,
} from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import ReadOnlyFieldScope from '@/contexts/ReadOnlyFieldScope/ReadOnlyFieldScope';
import ConfirmModal from '@/ds-components/ConfirmModal';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { trySubmitSafe } from '@/utils/form';

import Preview from '../components/Preview';
import { SignInExperienceContext } from '../contexts/SignInExperienceContextProvider';
import useBrandingEntitlements from '../hooks/use-branding-entitlements';
import usePreviewConfigs from '../hooks/use-preview-configs';
import {
  SignInExperienceTab,
  convertAccountCenterToForm,
  type SignInExperiencePageManagedData,
  type SignInExperienceForm,
  type SignInExperiencePageForm,
} from '../types';

import AccountCenter from './AccountCenter';
import Branding from './Branding';
import UpsellNotice from './Branding/UpsellNotice';
import CollectUserProfile from './CollectUserProfile';
import Content from './Content';
import SignUpAndSignIn from './SignUpAndSignIn';
import SignUpAndSignInChangePreview from './SignUpAndSignInChangePreview';
import { useSaveSignInExperiencePage } from './hooks/use-save-sign-in-experience-page';
import styles from './index.module.scss';
import {
  getBrandingErrorCount,
  getSignUpAndSignInErrorCount,
  getContentErrorCount,
  getAccountCenterErrorCount,
  hasSignUpAndSignInConfigChanged,
} from './utils/form';
import { sieFormDataParser, signInExperienceToUpdatedDataParser } from './utils/parser';

const PageTab = TabNavItem<`../${SignInExperienceTab}`>;

type Props = {
  readonly data: SignInExperience & { accountCenter: AccountCenterConfig };
  readonly onSignInExperienceUpdated: (data: SignInExperience) => void;
  readonly onAccountCenterUpdated: (data: AccountCenterConfig) => void;
};

function PageContent({ data, onSignInExperienceUpdated, onAccountCenterUpdated }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    access: { isReadOnly, isWriteAccessConfirmed },
  } = useCurrentTenantScopes();
  const { tab } = useParams();
  const [isForgotPasswordMigrationNoticeVisible, setIsForgotPasswordMigrationNoticeVisible] =
    useState(false);

  const { getPathname } = useTenantPathname();
  const { isUploading, cancelUpload } = useContext(SignInExperienceContext);
  const { isConnectorTypeEnabled, ready: isConnectorsReady } = useEnabledConnectorTypes();
  const { isHideLogtoBrandingAvailable, isCustomUiCspEnabled } = useBrandingEntitlements();

  const [dataToCompare, setDataToCompare] = useState<SignInExperiencePageManagedData>();

  const methods = useForm<SignInExperiencePageForm>({
    defaultValues: {
      ...sieFormDataParser.fromSignInExperience(data),
      accountCenter: convertAccountCenterToForm(data.accountCenter),
    },
  });

  const handleSaved = useCallback(() => {
    setDataToCompare(undefined);
  }, []);

  const { isSaving, saveData } = useSaveSignInExperiencePage({
    data,
    methods,
    isHideLogtoBrandingAvailable,
    isCustomUiCspEnabled,
    onSignInExperienceUpdated,
    onAccountCenterUpdated,
    onSaved: handleSaved,
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { isDirty, errors },
    setValue,
  } = methods;
  const formData = watch();
  const hasPasswordMethod = formData.signIn.methods.some((method) => method.password);

  const previewConfigs = usePreviewConfigs(formData, isDirty, data);

  const onSubmit = useCallback(
    async (formData: SignInExperienceForm) => {
      const handler = trySubmitSafe(async (formData: SignInExperienceForm) => {
        if (isSaving) {
          return;
        }

        const formatted = sieFormDataParser.toSignInExperience(formData, {
          isHideLogtoBrandingAvailable,
          isCustomUiCspEnabled,
        });
        const original = signInExperienceToUpdatedDataParser(data, {
          isHideLogtoBrandingAvailable,
          isCustomUiCspEnabled,
        });

        // Sign-in methods changed, need to show confirm modal first.
        if (!hasSignUpAndSignInConfigChanged(original, formatted)) {
          setDataToCompare(formatted);

          return;
        }

        await saveData();
      });
      return handler(formData);
    },
    [data, isCustomUiCspEnabled, isHideLogtoBrandingAvailable, isSaving, saveData]
  );

  const onDiscard = useCallback(() => {
    reset();
    if (isUploading && cancelUpload) {
      cancelUpload();
    }
  }, [isUploading, cancelUpload, reset]);

  // Forgot password migration from null to normal array
  useEffect(() => {
    // Wait for connectors list loading to be ready, and for the member's access to be known
    if (!isConnectorsReady || (!isReadOnly && !isWriteAccessConfirmed)) {
      return;
    }

    // If there is no password method, we should clear the forgot password methods.
    if (!hasPasswordMethod && formData.forgotPasswordMethods?.length) {
      setValue('forgotPasswordMethods', []);
    } else if (!formData.forgotPasswordMethods) {
      // If this is null, we should initialize it based on current connector setup
      // if has email connector, then add email verification code method, also for sms connector
      const initialMethods = [
        ...(isConnectorTypeEnabled(ConnectorType.Email)
          ? [ForgotPasswordMethod.EmailVerificationCode]
          : []),
        ...(isConnectorTypeEnabled(ConnectorType.Sms)
          ? [ForgotPasswordMethod.PhoneVerificationCode]
          : []),
      ];

      // A read-only member cannot save the migration, so they only see the methods sign-in derives
      // from the connectors.
      if (isReadOnly || initialMethods.length === 0) {
        setValue('forgotPasswordMethods', initialMethods);
        return;
      }

      setValue('forgotPasswordMethods', initialMethods, { shouldDirty: true });
      setIsForgotPasswordMigrationNoticeVisible(true);
      void onSubmit({
        ...formData,
        forgotPasswordMethods: initialMethods,
      });
    }
  }, [
    hasPasswordMethod,
    setValue,
    isConnectorTypeEnabled,
    isConnectorsReady,
    isReadOnly,
    isWriteAccessConfirmed,
    onSubmit,
    formData,
  ]);

  return (
    <>
      <TabNav className={styles.tabs}>
        <PageTab href="../branding" errorCount={getBrandingErrorCount(errors)}>
          {t('sign_in_exp.tabs.branding')}
        </PageTab>
        <PageTab
          href="../sign-up-and-sign-in"
          errorCount={getSignUpAndSignInErrorCount(errors, formData)}
        >
          {t('sign_in_exp.tabs.sign_up_and_sign_in')}
        </PageTab>
        <PageTab href="../collect-user-profile">
          {t('sign_in_exp.tabs.collect_user_profile')}
        </PageTab>
        <PageTab href="../account-center" errorCount={getAccountCenterErrorCount(errors)}>
          {t('sign_in_exp.tabs.account_center')}
        </PageTab>
        <PageTab href="../content" errorCount={getContentErrorCount(errors)}>
          {t('sign_in_exp.tabs.content')}
        </PageTab>
      </TabNav>
      <div className={styles.content}>
        {tab === SignInExperienceTab.Branding && <UpsellNotice />}
        <div className={classNames(styles.contentTop, isDirty && styles.withSubmitActionBar)}>
          <FormProvider {...methods}>
            <form>
              <ReadOnlyFieldScope>
                <Branding isActive={tab === SignInExperienceTab.Branding} />
                <SignUpAndSignIn
                  isActive={tab === SignInExperienceTab.SignUpAndSignIn}
                  data={data}
                />
                <CollectUserProfile isActive={tab === SignInExperienceTab.CollectUserProfile} />
                <AccountCenter isActive={tab === SignInExperienceTab.AccountCenter} data={data} />
                <Content isActive={tab === SignInExperienceTab.Content} />
              </ReadOnlyFieldScope>
            </form>
          </FormProvider>
          {formData.id &&
            tab !== SignInExperienceTab.CollectUserProfile &&
            tab !== SignInExperienceTab.AccountCenter && (
              <Preview
                isLivePreviewDisabled={isDirty}
                signInExperience={previewConfigs}
                isPreviewIframeDisabled={Boolean(data.customUiAssets)}
                className={styles.preview}
              />
            )}
        </div>
        <SubmitFormChangesActionBar
          isOpen={isDirty || isUploading}
          isSubmitDisabled={isUploading}
          isSubmitting={isSaving}
          onDiscard={onDiscard}
          onSubmit={handleSubmit(onSubmit)}
        />
      </div>
      <ConfirmModal
        isOpen={Boolean(dataToCompare)}
        isLoading={isSaving}
        onCancel={() => {
          setDataToCompare(undefined);
        }}
        onConfirm={async () => {
          await saveData();
        }}
      >
        {dataToCompare && (
          <SignUpAndSignInChangePreview
            before={data}
            after={dataToCompare}
            isForgotPasswordMigrationNoticeVisible={isForgotPasswordMigrationNoticeVisible}
          />
        )}
      </ConfirmModal>
      <UnsavedChangesAlertModal
        hasUnsavedChanges={isDirty || isUploading}
        parentPath={getPathname('/sign-in-experience')}
        onConfirm={onDiscard}
      />
    </>
  );
}

export default PageContent;
