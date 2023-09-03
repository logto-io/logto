import { withAppInsights } from '@logto/app-insights/react';
import type { SignInExperience as SignInExperienceType } from '@logto/schemas';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import RequestDataError from '@/components/RequestDataError';
import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { isCloud } from '@/consts/env';
import CardTitle from '@/ds-components/CardTitle';
import ConfirmModal from '@/ds-components/ConfirmModal';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useUiLanguages from '@/hooks/use-ui-languages';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import { trySubmitSafe } from '@/utils/form';

import Preview from './components/Preview';
import SignUpAndSignInChangePreview from './components/SignUpAndSignInChangePreview';
import Skeleton from './components/Skeleton';
import Welcome from './components/Welcome';
import usePreviewConfigs from './hooks/use-preview-configs';
import * as styles from './index.module.scss';
import Branding from './tabs/Branding';
import Content from './tabs/Content';
import PasswordPolicy from './tabs/PasswordPolicy';
import SignUpAndSignIn from './tabs/SignUpAndSignIn';
import type { SignInExperienceForm } from './types';
import {
  hasSignUpAndSignInConfigChanged,
  getBrandingErrorCount,
  getContentErrorCount,
  getSignUpAndSignInErrorCount,
  signInExperienceParser,
} from './utils/form';

export enum SignInExperienceTab {
  Branding = 'branding',
  SignUpAndSignIn = 'sign-up-and-sign-in',
  Content = 'content',
  PasswordPolicy = 'password-policy',
}

const PageTab = TabNavItem<`../${SignInExperienceTab}`>;

type PageWrapperProps = {
  children: ReactNode;
};

function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className={styles.container}>
      <CardTitle
        title="sign_in_exp.title"
        subtitle="sign_in_exp.description"
        className={styles.cardTitle}
      />
      {children}
    </div>
  );
}

function SignInExperience() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tab } = useParams();
  const { data, error, mutate } = useSWR<SignInExperienceType, RequestError>('api/sign-in-exp');
  const isLoadingSignInExperience = !data && !error;
  const { isLoading: isUserAssetsServiceLoading } = useUserAssetsService();
  const [isSaving, setIsSaving] = useState(false);

  const {
    configs,
    error: configsError,
    updateConfigs,
    isLoading: isLoadingConfig,
    mutate: mutateConfigs,
  } = useConfigs();
  const { getPathname } = useTenantPathname();

  const shouldDisplayWelcome = !isCloud && !configs?.signInExperienceCustomized;

  const { error: languageError, isLoading: isLoadingLanguages } = useUiLanguages();
  const [dataToCompare, setDataToCompare] = useState<SignInExperienceType>();

  const requestError = error ?? configsError ?? languageError;

  const isLoading =
    isLoadingSignInExperience ||
    isLoadingConfig ||
    isLoadingLanguages ||
    isUserAssetsServiceLoading;

  const methods = useForm<SignInExperienceForm>();
  const {
    reset,
    handleSubmit,
    getValues,
    watch,
    formState: { isDirty, errors },
  } = methods;
  const api = useApi();
  const formData = watch();

  const previewConfigs = usePreviewConfigs(formData, isDirty, data);

  const defaultFormData = useMemo(() => {
    if (!data) {
      return;
    }

    return signInExperienceParser.toLocalForm(data);
  }, [data]);

  useEffect(() => {
    if (isDirty) {
      return;
    }
    if (defaultFormData) {
      reset(defaultFormData);
    }
  }, [reset, defaultFormData, isDirty]);

  const saveData = async () => {
    setIsSaving(true);

    try {
      const updatedData = await api
        .patch('api/sign-in-exp', {
          json: signInExperienceParser.toRemoteModel(getValues()),
        })
        .json<SignInExperienceType>();
      reset(signInExperienceParser.toLocalForm(updatedData));
      void mutate(updatedData);
      setDataToCompare(undefined);
      await updateConfigs({ signInExperienceCustomized: true });
      toast.success(t('general.saved'));
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData: SignInExperienceForm) => {
      if (!data || isSaving) {
        return;
      }

      const formatted = signInExperienceParser.toRemoteModel(formData);

      // Sign-in methods changed, need to show confirm modal first.
      if (!hasSignUpAndSignInConfigChanged(data, formatted)) {
        setDataToCompare(formatted);

        return;
      }

      await saveData();
    })
  );

  if (isLoading) {
    return <Skeleton />;
  }

  if (requestError) {
    return (
      <PageWrapper>
        <RequestDataError
          className={styles.error}
          error={requestError}
          onRetry={() => {
            void mutateConfigs();
            void mutate();
          }}
        />
      </PageWrapper>
    );
  }

  if (shouldDisplayWelcome) {
    return (
      <PageWrapper>
        <Welcome
          mutate={() => {
            void mutateConfigs();
            void mutate();
          }}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
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
        <PageTab href="../content" errorCount={getContentErrorCount(errors)}>
          {t('sign_in_exp.tabs.content')}
        </PageTab>
        {/* Uncomment until all the changes are merged */}
        {isCloud && (
          <PageTab href="../password-policy">{t('sign_in_exp.tabs.password_policy')}</PageTab>
        )}
      </TabNav>
      {data && defaultFormData && (
        <div className={styles.content}>
          <div className={classNames(styles.contentTop, isDirty && styles.withSubmitActionBar)}>
            <FormProvider {...methods}>
              <form className={styles.form}>
                <Branding isActive={tab === SignInExperienceTab.Branding} />
                <SignUpAndSignIn isActive={tab === SignInExperienceTab.SignUpAndSignIn} />
                <Content isActive={tab === SignInExperienceTab.Content} />
                <PasswordPolicy isActive={tab === SignInExperienceTab.PasswordPolicy} />
              </form>
            </FormProvider>
            {formData.id && (
              <Preview
                isLivePreviewDisabled={isDirty}
                signInExperience={previewConfigs}
                className={styles.preview}
              />
            )}
          </div>
          <SubmitFormChangesActionBar
            isOpen={isDirty}
            isSubmitting={isSaving}
            onDiscard={reset}
            onSubmit={onSubmit}
          />
        </div>
      )}
      {data && (
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
          {dataToCompare && <SignUpAndSignInChangePreview before={data} after={dataToCompare} />}
        </ConfirmModal>
      )}
      <UnsavedChangesAlertModal
        hasUnsavedChanges={isDirty}
        parentPath={getPathname('/sign-in-experience')}
      />
    </PageWrapper>
  );
}

export default withAppInsights(SignInExperience);
