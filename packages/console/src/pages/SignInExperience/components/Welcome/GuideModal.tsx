import type { SignInExperience } from '@logto/schemas';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import useSWR from 'swr';

import Close from '@/assets/images/close.svg';
import Alert from '@/components/Alert';
import Button from '@/components/Button';
import CardTitle from '@/components/CardTitle';
import IconButton from '@/components/IconButton';
import Spacer from '@/components/Spacer';
import useApi from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';
import useUserPreferences from '@/hooks/use-user-preferences';
import * as modalStyles from '@/scss/modal.module.scss';

import usePreviewConfigs from '../../hooks/use-preview-configs';
import BrandingForm from '../../tabs/Branding/BrandingForm';
import ColorForm from '../../tabs/Branding/ColorForm';
import LanguagesForm from '../../tabs/Others/LanguagesForm';
import TermsForm from '../../tabs/Others/TermsForm';
import type { SignInExperienceForm } from '../../types';
import { signInExperienceParser } from '../../utils/form';
import Preview from '../Preview';
import * as styles from './GuideModal.module.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const GuideModal = ({ isOpen, onClose }: Props) => {
  const { data } = useSWR<SignInExperience>('api/sign-in-exp');
  const { data: preferences, update: updatePreferences } = useUserPreferences();
  const { updateConfigs } = useConfigs();
  const methods = useForm<SignInExperienceForm>();
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    watch,
  } = methods;
  const api = useApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const formData = watch();
  const [isLoading, setIsLoading] = useState(false);

  const previewConfigs = usePreviewConfigs(formData, isDirty, data);

  useEffect(() => {
    if (data && !isDirty) {
      reset(signInExperienceParser.toLocalForm(data));
    }
  }, [data, reset, isDirty]);

  const onGotIt = async () => {
    await updatePreferences({ experienceNoticeConfirmed: true });
  };

  const onSubmit = handleSubmit(async (formData) => {
    if (!data || isSubmitting) {
      return;
    }

    await Promise.all([
      api.patch('api/sign-in-exp', {
        json: signInExperienceParser.toRemoteModel(formData),
      }),
      updateConfigs({ signInExperienceCustomized: true }),
    ]);

    onClose();
  });

  const onSkip = async () => {
    setIsLoading(true);
    await updateConfigs({ signInExperienceCustomized: true });
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.fullScreen}
      onRequestClose={onSkip}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <IconButton size="large" disabled={isLoading} onClick={onSkip}>
            <Close className={styles.closeIcon} />
          </IconButton>
          <div className={styles.separator} />
          <CardTitle size="small" title="sign_in_exp.title" subtitle="sign_in_exp.description" />
          <Spacer />
          <Button
            type="text"
            size="small"
            title="general.skip"
            isLoading={isLoading}
            onClick={onSkip}
          />
        </div>
        <div className={styles.content}>
          <FormProvider {...methods}>
            <form className={styles.form} onSubmit={onSubmit}>
              {!preferences.experienceNoticeConfirmed && (
                <div className={styles.reminder}>
                  <Alert action="general.got_it" variant="shadow" onClick={onGotIt}>
                    {t('sign_in_exp.welcome.apply_remind')}
                  </Alert>
                </div>
              )}
              <div className={styles.main}>
                <div className={styles.form}>
                  <ColorForm />
                  <BrandingForm />
                  <TermsForm />
                  <LanguagesForm />
                </div>
                {formData.id && (
                  <Preview signInExperience={previewConfigs} className={styles.preview} />
                )}
              </div>
              <div className={styles.footer}>
                <div className={styles.footerContent}>
                  <Button
                    isLoading={isSubmitting}
                    type="primary"
                    htmlType="submit"
                    title="general.done"
                  />
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </Modal>
  );
};

export default GuideModal;
