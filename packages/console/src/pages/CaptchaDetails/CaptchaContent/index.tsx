import type { CaptchaProvider } from '@logto/schemas';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import { trySubmitSafe } from '@/utils/form';

type Props = {
  readonly isDeleted: boolean;
  readonly captchaProvider: CaptchaProvider;
  readonly onUpdate: (captchaProvider?: CaptchaProvider) => void;
};

type CaptchaFormType = {
  siteKey: string;
  secretKey: string;
};

function CaptchaContent({ isDeleted, captchaProvider, onUpdate }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const {
    formState: { isSubmitting, isDirty, errors },
    handleSubmit,
    reset,
    register,
  } = useForm<CaptchaFormType>({
    reValidateMode: 'onBlur',
    defaultValues: {
      siteKey: captchaProvider.config.siteKey,
      secretKey: captchaProvider.config.secretKey,
    },
  });

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
      reset({
        siteKey: updatedCaptchaProvider.config.siteKey,
        secretKey: updatedCaptchaProvider.config.secretKey,
      });
      onUpdate(updatedCaptchaProvider);
      toast.success(t('general.saved'));
    })
  );

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
          description="security.captcha_details.description"
          learnMoreLink={{ href: '/security/captcha' }}
        >
          <FormField title="security.captcha_details.site_key">
            <TextInput
              error={Boolean(errors.siteKey)}
              {...register('siteKey', { required: true })}
            />
          </FormField>
          <FormField title="security.captcha_details.secret_key">
            <TextInput
              error={Boolean(errors.secretKey)}
              {...register('secretKey', { required: true })}
            />
          </FormField>
        </FormCard>
      </DetailsForm>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </>
  );
}

export default CaptchaContent;
