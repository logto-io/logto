import {
  ConnectorType,
  ForgotPasswordMethod,
  type AccountCenter as AccountCenterConfig,
  type SignInExperience,
} from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import ConfirmModal from '@/ds-components/ConfirmModal';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import useApi from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';
import useEnabledConnectorTypes from '@/hooks/use-enabled-connector-types';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { trySubmitSafe } from '@/utils/form';

import Preview from '../components/Preview';
import { SignInExperienceContext } from '../contexts/SignInExperienceContextProvider';
import usePreviewConfigs from '../hooks/use-preview-configs';
import {
  SignInExperienceTab,
  convertAccountCenterToForm,
  type SignInExperiencePageManagedData,
  type SignInExperienceForm,
  type AccountCenterFormValues,
  normalizeWebauthnRelatedOrigins,
} from '../types';

import AccountCenter from './AccountCenter';
import Branding from './Branding';
import UpsellNotice from './Branding/UpsellNotice';
import CollectUserProfile from './CollectUserProfile';
import Content from './Content';
import SignUpAndSignIn from './SignUpAndSignIn';
import SignUpAndSignInChangePreview from './SignUpAndSignInChangePreview';
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
  const { tab } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isForgotPasswordMigrationNoticeVisible, setIsForgotPasswordMigrationNoticeVisible] =
    useState(false);

  const { updateConfigs } = useConfigs();
  const { getPathname } = useTenantPathname();
  const { isUploading, cancelUpload } = useContext(SignInExperienceContext);
  const { isConnectorTypeEnabled, ready: isConnectorsReady } = useEnabledConnectorTypes();

  const [dataToCompare, setDataToCompare] = useState<SignInExperiencePageManagedData>();

  const methods = useForm<SignInExperienceForm & { accountCenter: AccountCenterFormValues }>({
    defaultValues: {
      ...sieFormDataParser.fromSignInExperience(data),
      accountCenter: convertAccountCenterToForm(data.accountCenter),
    },
  });

  const {
    reset,
    handleSubmit,
    getValues,
    watch,
    formState: { isDirty, errors },
    setValue,
  } = methods;
  const api = useApi();
  const formData = watch();
  const hasPasswordMethod = formData.signIn.methods.some((method) => method.password);

  const previewConfigs = usePreviewConfigs(formData, isDirty, data);

  const saveData = useCallback(async () => {
    setIsSaving(true);

    try {
      const { accountCenter, ...formValues } = getValues();
      const webauthnRelatedOrigins = normalizeWebauthnRelatedOrigins(
        accountCenter.webauthnRelatedOrigins
      );

      const updatedData = await api
        .patch('api/sign-in-exp', {
          json: sieFormDataParser.toSignInExperience(formValues),
        })
        .json<SignInExperience>();

      const updatedAccountCenter = await api
        .patch('api/account-center', {
          json: {
            enabled: accountCenter.enabled,
            // Disable all fields when account center is disabled
            fields: accountCenter.enabled ? accountCenter.fields : {},
            webauthnRelatedOrigins,
          },
        })
        .json<AccountCenterConfig>();

      onAccountCenterUpdated(updatedAccountCenter);
      reset({
        ...sieFormDataParser.fromSignInExperience(updatedData),
        accountCenter: convertAccountCenterToForm(updatedAccountCenter),
      });

      onSignInExperienceUpdated(updatedData);
      setDataToCompare(undefined);
      await updateConfigs({ signInExperienceCustomized: true });
      toast.success(t('general.saved'));
    } finally {
      setIsSaving(false);
    }
  }, [api, getValues, onAccountCenterUpdated, onSignInExperienceUpdated, reset, t, updateConfigs]);

  const onSubmit = useCallback(
    async (formData: SignInExperienceForm) => {
      const handler = trySubmitSafe(async (formData: SignInExperienceForm) => {
        if (isSaving) {
          return;
        }

        const formatted = sieFormDataParser.toSignInExperience(formData);
        const original = signInExperienceToUpdatedDataParser(data);

        // Sign-in methods changed, need to show confirm modal first.
        if (!hasSignUpAndSignInConfigChanged(original, formatted)) {
          setDataToCompare(formatted);

          return;
        }

        await saveData();
      });
      return handler(formData);
    },
    [data, isSaving, saveData]
  );

  const onDiscard = useCallback(() => {
    reset();
    if (isUploading && cancelUpload) {
      cancelUpload();
    }
  }, [isUploading, cancelUpload, reset]);

  // Forgot password migration from null to normal array
  useEffect(() => {
    // Wait for connectors list loading to be ready
    if (!isConnectorsReady) {
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

      if (initialMethods.length === 0) {
        setValue('forgotPasswordMethods', []);
        return;
      }

      setValue('forgotPasswordMethods', initialMethods, { shouldDirty: true });
      setIsForgotPasswordMigrationNoticeVisible(true);
      void onSubmit({
        ...formData,
        forgotPasswordMethods: initialMethods,
      });
    }
  }, [hasPasswordMethod, setValue, isConnectorTypeEnabled, isConnectorsReady, onSubmit, formData]);

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
              <Branding isActive={tab === SignInExperienceTab.Branding} />
              <SignUpAndSignIn isActive={tab === SignInExperienceTab.SignUpAndSignIn} data={data} />
              <CollectUserProfile isActive={tab === SignInExperienceTab.CollectUserProfile} />
              <AccountCenter isActive={tab === SignInExperienceTab.AccountCenter} data={data} />
              <Content isActive={tab === SignInExperienceTab.Content} />
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
