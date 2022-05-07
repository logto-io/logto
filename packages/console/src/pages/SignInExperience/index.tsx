import { Setting, SignInExperience as SignInExperienceType } from '@logto/schemas';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import Button from '@/components/Button';
import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import TabNav, { TabNavLink } from '@/components/TabNav';
import useApi, { RequestError } from '@/hooks/use-api';
import * as detailsStyles from '@/scss/details.module.scss';

import BrandingForm from './components/BrandingForm';
import LanguagesForm from './components/LanguagesForm';
import SignInMethodsForm from './components/SignInMethodsForm';
import TermsForm from './components/TermsForm';
import Welcome from './components/Welcome';
import * as styles from './index.module.scss';
import { SignInExperienceForm } from './types';
import { signInExperienceParser } from './utilities';

const SignInExperience = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tab } = useParams();
  const { data, error, mutate } = useSWR<SignInExperienceType, RequestError>('/api/sign-in-exp');
  const { data: settings, error: settingsError } = useSWR<Setting, RequestError>('/api/settings');
  const methods = useForm<SignInExperienceForm>();
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const api = useApi();

  useEffect(() => {
    if (data) {
      reset(signInExperienceParser.toLocalForm(data));
    }
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    if (!data || isSubmitting) {
      return;
    }

    const updatedData = await api
      .patch('/api/sign-in-exp', {
        json: signInExperienceParser.toRemoteModel(formData),
      })
      .json<SignInExperienceType>();
    void mutate(updatedData);
    toast.success(t('application_details.save_success'));
  });

  if (!settings && !settingsError) {
    return <div>loading</div>;
  }

  if (settingsError) {
    return <div>{settingsError.body.message}</div>;
  }

  if (!settings?.adminConsole.experienceGuideDone) {
    return <Welcome />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={classNames(styles.setup, detailsStyles.container)}>
        <Card className={styles.card}>
          <CardTitle title="sign_in_exp.title" subtitle="sign_in_exp.description" />
          <TabNav className={styles.tabs}>
            <TabNavLink href="/sign-in-experience/experience">
              {t('sign_in_exp.tabs.experience')}
            </TabNavLink>
            <TabNavLink href="/sign-in-experience/methods">
              {t('sign_in_exp.tabs.methods')}
            </TabNavLink>
            <TabNavLink href="/sign-in-experience/others">
              {t('sign_in_exp.tabs.others')}
            </TabNavLink>
          </TabNav>
          {!data && !error && <div>loading</div>}
          {error && <div>{`error occurred: ${error.body.message}`}</div>}
          {data && (
            <FormProvider {...methods}>
              <form className={classNames(detailsStyles.body, styles.form)} onSubmit={onSubmit}>
                {tab === 'experience' && (
                  <>
                    <BrandingForm />
                    <TermsForm />
                  </>
                )}
                {tab === 'methods' && <SignInMethodsForm />}
                {tab === 'others' && <LanguagesForm />}
              </form>
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
            </FormProvider>
          )}
        </Card>
      </div>
      <Card className={styles.preview}>TODO</Card>
    </div>
  );
};

export default SignInExperience;
