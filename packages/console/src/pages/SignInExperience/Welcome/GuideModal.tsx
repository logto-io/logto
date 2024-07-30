import type { SignInExperience } from '@logto/schemas';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import useSWR from 'swr';

import Close from '@/assets/icons/close.svg?react';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import IconButton from '@/ds-components/IconButton';
import InlineNotification from '@/ds-components/InlineNotification';
import Spacer from '@/ds-components/Spacer';
import useApi from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';
import useUserPreferences from '@/hooks/use-user-preferences';
import modalStyles from '@/scss/modal.module.scss';
import { trySubmitSafe } from '@/utils/form';

import BrandingForm from '../PageContent/Branding/BrandingForm';
import LanguagesForm from '../PageContent/Content/LanguagesForm';
import TermsForm from '../PageContent/Content/TermsForm';
import { sieFormDataParser } from '../PageContent/utils/parser';
import Preview from '../components/Preview';
import usePreviewConfigs from '../hooks/use-preview-configs';
import type { SignInExperienceForm } from '../types';

import styles from './GuideModal.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
};

function GuideModal({ isOpen, onClose }: Props) {
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
      reset(sieFormDataParser.fromSignInExperience(data));
    }
  }, [data, reset, isDirty]);

  const onGotIt = async () => {
    await updatePreferences({ experienceNoticeConfirmed: true });
  };

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (!data || isSubmitting) {
        return;
      }

      await Promise.all([
        api.patch('api/sign-in-exp', {
          json: sieFormDataParser.toSignInExperience(formData),
        }),
        updateConfigs({ signInExperienceCustomized: true }),
      ]);

      onClose();
    })
  );

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
                <InlineNotification
                  action="general.got_it"
                  variant="shadow"
                  className={styles.reminder}
                  onClick={onGotIt}
                >
                  {t('sign_in_exp.welcome.apply_remind')}
                </InlineNotification>
              )}
              <div className={styles.main}>
                <div className={styles.form}>
                  <BrandingForm />
                  <TermsForm />
                  <LanguagesForm />
                </div>
                {formData.id && (
                  <Preview
                    isLivePreviewEntryInvisible
                    signInExperience={previewConfigs}
                    className={styles.preview}
                  />
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
}

export default GuideModal;
