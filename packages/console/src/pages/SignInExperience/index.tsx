import { SignInExperience as SignInExperienceType } from '@logto/schemas';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import TabNav, { TabNavItem } from '@/components/TabNav';
import useApi, { RequestError } from '@/hooks/use-api';
import useSettings from '@/hooks/use-settings';
import useUserPreferences from '@/hooks/use-user-preferences';
import * as detailsStyles from '@/scss/details.module.scss';
import * as modalStyles from '@/scss/modal.module.scss';

import BrandingForm from './components/BrandingForm';
import LanguagesForm from './components/LanguagesForm';
import Preview from './components/Preview';
import SaveAlert from './components/SaveAlert';
import SignInMethodsForm from './components/SignInMethodsForm';
import TermsForm from './components/TermsForm';
import Welcome from './components/Welcome';
import usePreviewConfigs from './hooks';
import * as styles from './index.module.scss';
import { SignInExperienceForm } from './types';
import { compareSignInMethods, signInExperienceParser } from './utilities';

const SignInExperience = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tab } = useParams();
  const { data, error, mutate } = useSWR<SignInExperienceType, RequestError>('/api/sign-in-exp');
  const { settings, error: settingsError, updateSettings } = useSettings();
  const {
    data: { experienceNoticeConfirmed },
  } = useUserPreferences();
  const [dataToCompare, setDataToCompare] = useState<SignInExperienceType>();

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

  useEffect(() => {
    if (data && !isDirty) {
      reset(signInExperienceParser.toLocalForm(data));
    }
  }, [data, reset, isDirty]);

  const saveData = async () => {
    const updatedData = await api
      .patch('/api/sign-in-exp', {
        json: signInExperienceParser.toRemoteModel(getValues()),
      })
      .json<SignInExperienceType>();
    void mutate(updatedData);
    await updateSettings({ customizeSignInExperience: true });
    toast.success(t('application_details.save_success'));
  };

  const onSubmit = handleSubmit(async (formData) => {
    if (!data || isSubmitting) {
      return;
    }

    const formatted = signInExperienceParser.toRemoteModel(formData);

    // Sign in methods changed, need to show confirm modal first.
    if (!compareSignInMethods(data, formatted)) {
      setDataToCompare(formatted);

      return;
    }

    await saveData();
  });

  if (!settings && !settingsError) {
    return <div>loading</div>;
  }

  if (!settings && settingsError) {
    return <div>{settingsError.body?.message ?? settingsError.message}</div>;
  }

  if (!experienceNoticeConfirmed) {
    return <Welcome />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={classNames(styles.setup, detailsStyles.container)}>
        <Card className={styles.card}>
          <CardTitle title="sign_in_exp.title" subtitle="sign_in_exp.description" />
          <TabNav className={styles.tabs}>
            <TabNavItem href="/sign-in-experience/experience">
              {t('sign_in_exp.tabs.experience')}
            </TabNavItem>
            <TabNavItem href="/sign-in-experience/methods">
              {t('sign_in_exp.tabs.methods')}
            </TabNavItem>
            <TabNavItem href="/sign-in-experience/others">
              {t('sign_in_exp.tabs.others')}
            </TabNavItem>
          </TabNav>
          {!data && !error && <div>loading</div>}
          {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
          {data && (
            <FormProvider {...methods}>
              <form onSubmit={onSubmit}>
                <div className={classNames(detailsStyles.body, styles.form)}>
                  {tab === 'experience' && (
                    <>
                      <BrandingForm />
                      <TermsForm />
                    </>
                  )}
                  {tab === 'methods' && <SignInMethodsForm />}
                  {tab === 'others' && <LanguagesForm />}
                </div>
                <div className={detailsStyles.footer}>
                  <div className={detailsStyles.footerMain}>
                    <Button
                      isLoading={isSubmitting}
                      type="primary"
                      htmlType="submit"
                      title="general.save_changes"
                    />
                  </div>
                </div>
              </form>
            </FormProvider>
          )}
        </Card>
      </div>
      {formData.id && <Preview signInExperience={previewConfigs} />}
      {data && (
        <ReactModal
          isOpen={Boolean(dataToCompare)}
          className={modalStyles.content}
          overlayClassName={modalStyles.overlay}
        >
          {dataToCompare && (
            <SaveAlert
              before={data}
              after={dataToCompare}
              onClose={() => {
                setDataToCompare(undefined);
              }}
              onConfirm={saveData}
            />
          )}
        </ReactModal>
      )}
    </div>
  );
};

export default SignInExperience;
