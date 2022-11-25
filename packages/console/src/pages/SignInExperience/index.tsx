import type { SignInExperience as SignInExperienceType } from '@logto/schemas';
import classNames from 'classnames';
import { nanoid } from 'nanoid';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import CardTitle from '@/components/CardTitle';
import ConfirmModal from '@/components/ConfirmModal';
import SubmitFormChangesActionBar from '@/components/SubmitFormChangesActionBar';
import TabNav, { TabNavItem } from '@/components/TabNav';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useSettings from '@/hooks/use-settings';
import useUiLanguages from '@/hooks/use-ui-languages';

import Preview from './components/Preview';
import SignUpAndSignInChangePreview from './components/SignUpAndSignInChangePreview';
import Skeleton from './components/Skeleton';
import Welcome from './components/Welcome';
import usePreviewConfigs from './hooks/use-preview-configs';
import * as styles from './index.module.scss';
import Branding from './tabs/Branding';
import Others from './tabs/Others';
import SignUpAndSignIn from './tabs/SignUpAndSignIn';
import type { SignInExperienceForm } from './types';
import { compareSignUpAndSignInConfigs, signInExperienceParser } from './utilities';

const SignInExperience = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tab } = useParams();
  const { data, error, mutate } = useSWR<SignInExperienceType, RequestError>('/api/sign-in-exp');
  const { settings, error: settingsError, updateSettings, mutate: mutateSettings } = useSettings();
  const { error: languageError, isLoading: isLoadingLanguages } = useUiLanguages();
  const [dataToCompare, setDataToCompare] = useState<SignInExperienceType>();

  const { current: formId } = useRef(nanoid());
  const methods = useForm<SignInExperienceForm>();
  const {
    reset,
    handleSubmit,
    getValues,
    watch,
    formState: { isSubmitting, isDirty },
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
    if (defaultFormData) {
      reset(defaultFormData);
    }
  }, [reset, defaultFormData, tab]);

  const saveData = async () => {
    const updatedData = await api
      .patch('/api/sign-in-exp', {
        json: signInExperienceParser.toRemoteModel(getValues()),
      })
      .json<SignInExperienceType>();
    void mutate(updatedData);
    setDataToCompare(undefined);
    await updateSettings({ signInExperienceCustomized: true });
    toast.success(t('general.saved'));
  };

  const onSubmit = handleSubmit(async (formData: SignInExperienceForm) => {
    if (!data || isSubmitting) {
      return;
    }

    const formatted = signInExperienceParser.toRemoteModel(formData);

    // Sign-in methods changed, need to show confirm modal first.
    if (!compareSignUpAndSignInConfigs(data, formatted)) {
      setDataToCompare(formatted);

      return;
    }

    await saveData();
  });

  if ((!settings && !settingsError) || (!data && !error) || isLoadingLanguages) {
    return <Skeleton />;
  }

  if (!settings && settingsError) {
    return <div>{settingsError.body?.message ?? settingsError.message}</div>;
  }

  if (languageError) {
    return <div>{languageError.body?.message ?? languageError.message}</div>;
  }

  if (!settings?.signInExperienceCustomized) {
    return (
      <Welcome
        mutate={() => {
          void mutateSettings();
          void mutate();
        }}
      />
    );
  }

  return (
    <div className={styles.container}>
      <CardTitle
        title="sign_in_exp.title"
        subtitle="sign_in_exp.description"
        className={styles.cardTitle}
      />
      <TabNav className={styles.tabs}>
        <TabNavItem href="/sign-in-experience/branding">
          {t('sign_in_exp.tabs.branding')}
        </TabNavItem>
        <TabNavItem href="/sign-in-experience/sign-up-and-sign-in">
          {t('sign_in_exp.tabs.sign_up_and_sign_in')}
        </TabNavItem>
        <TabNavItem href="/sign-in-experience/others">{t('sign_in_exp.tabs.others')}</TabNavItem>
      </TabNav>
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {data && defaultFormData && (
        <div className={styles.content}>
          <div className={styles.contentTop}>
            <FormProvider {...methods}>
              <form
                id={formId}
                className={classNames(styles.form, isDirty && styles.withSubmitActionBar)}
              >
                {tab === 'branding' && <Branding />}
                {tab === 'sign-up-and-sign-in' && <SignUpAndSignIn />}
                {tab === 'others' && <Others />}
              </form>
            </FormProvider>
            {formData.id && (
              <Preview signInExperience={previewConfigs} className={styles.preview} />
            )}
          </div>
          <SubmitFormChangesActionBar
            isOpen={isDirty}
            isSubmitting={isSubmitting}
            onDiscard={reset}
            onSubmit={onSubmit}
          />
        </div>
      )}
      {data && (
        <ConfirmModal
          isOpen={Boolean(dataToCompare)}
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
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </div>
  );
};

export default SignInExperience;
