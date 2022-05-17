import { SignInExperience } from '@logto/schemas';
import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import useSWR from 'swr';

import Alert from '@/components/Alert';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import IconButton from '@/components/IconButton';
import Spacer from '@/components/Spacer';
import useApi from '@/hooks/use-api';
import useAdminConsoleConfigs from '@/hooks/use-configs';
import Close from '@/icons/Close';
import * as modalStyles from '@/scss/modal.module.scss';

import { SignInExperienceForm } from '../types';
import { signInExperienceParser } from '../utilities';
import BrandingForm from './BrandingForm';
import * as styles from './GuideModal.module.scss';
import LanguagesForm from './LanguagesForm';
import SignInMethodsForm from './SignInMethodsForm';
import TermsForm from './TermsForm';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const GuideModal = ({ isOpen, onClose }: Props) => {
  const { data } = useSWR<SignInExperience>('/api/sign-in-exp');
  const { configs, updateConfigs } = useAdminConsoleConfigs();
  const methods = useForm<SignInExperienceForm>();
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  useEffect(() => {
    if (data) {
      reset(signInExperienceParser.toLocalForm(data));
    }
  }, [data, reset]);

  const onGotIt = async () => {
    if (!configs) {
      return;
    }

    await updateConfigs({ experienceNoticeConfirmed: true });
  };

  const onSubmit = handleSubmit(async (formData) => {
    if (!data || isSubmitting || !configs) {
      return;
    }

    await Promise.all([
      api.patch('/api/sign-in-exp', {
        json: signInExperienceParser.toRemoteModel(formData),
      }),
      updateConfigs({ customizeSignInExperience: true }),
    ]);

    location.reload();
  });

  return (
    <Modal isOpen={isOpen} className={modalStyles.fullScreen}>
      <div className={styles.container}>
        <div className={styles.header}>
          <IconButton size="large" onClick={onClose}>
            <Close />
          </IconButton>
          <div className={styles.separator} />
          <CardTitle size="small" title="sign_in_exp.title" subtitle="sign_in_exp.description" />
          <Spacer />
          <Button type="plain" size="small" title="general.skip" onClick={onClose} />
        </div>
        <div className={styles.content}>
          {configs && !configs.experienceNoticeConfirmed && (
            <div className={styles.reminder}>
              <Alert
                action="admin_console.sign_in_exp.welcome.got_it"
                variant="shadow"
                onClick={onGotIt}
              >
                {t('sign_in_exp.welcome.apply_remind')}
              </Alert>
            </div>
          )}
          <FormProvider {...methods}>
            <form onSubmit={onSubmit}>
              <div className={styles.main}>
                <div className={styles.form}>
                  <div className={styles.card}>
                    <BrandingForm />
                  </div>
                  <div className={styles.card}>
                    <TermsForm />
                  </div>
                  <div className={styles.card}>
                    <SignInMethodsForm />
                  </div>
                  <div className={styles.card}>
                    <LanguagesForm />
                  </div>
                </div>
                <div className={styles.preview}>TODO</div>
              </div>
              <div className={styles.footer}>
                <Button
                  isLoading={isSubmitting}
                  type="primary"
                  htmlType="submit"
                  title="general.done"
                />
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </Modal>
  );
};

export default GuideModal;
