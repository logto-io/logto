import type { CaptchaProvider } from '@logto/schemas';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import useApi from '@/hooks/use-api';
import CaptchaFormFields from '@/pages/Security/Captcha/CaptchaFormFields';
import { captchaProviders } from '@/pages/Security/Captcha/CreateCaptchaForm/constants';
import { type CaptchaFormType } from '@/pages/Security/Captcha/types';
import { trySubmitSafe } from '@/utils/form';

type Props = {
  readonly isDeleted: boolean;
  readonly captchaProvider: CaptchaProvider;
  readonly onUpdate: (captchaProvider?: CaptchaProvider) => void;
};

function CaptchaContent({ isDeleted, captchaProvider, onUpdate }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const metadata = captchaProviders.find(
    (provider) => provider.type === captchaProvider.config.type
  );
  const api = useApi();
  const {
    formState: { isSubmitting, isDirty, errors },
    handleSubmit,
    reset,
    register,
    control,
  } = useForm<CaptchaFormType>({
    reValidateMode: 'onBlur',
    defaultValues: captchaProvider.config,
  });

  useEffect(() => {
    reset(captchaProvider.config);
  }, [captchaProvider.config, reset]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (data) => {
      const updatedCaptchaProvider = await api
        .put('api/captcha-provider', {
          json: {
            config: {
              ...data,
              type: captchaProvider.config.type,
            },
          },
        })
        .json<CaptchaProvider>();
      reset(updatedCaptchaProvider.config);
      onUpdate(updatedCaptchaProvider);
      toast.success(t('general.saved'));
    })
  );

  if (!metadata) {
    return null;
  }

  return (
    <>
      <DetailsForm
        autoComplete="off"
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        onDiscard={() => {
          reset();
        }}
        onSubmit={onSubmit}
      >
        <FormCard
          title="security.captcha_details.setup_captcha"
          description={metadata.description}
          learnMoreLink={{ href: '/security/captcha' }}
        >
          <CaptchaFormFields
            metadata={metadata}
            errors={errors}
            register={register}
            control={control}
          />
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </>
  );
}

export default CaptchaContent;
