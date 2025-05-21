import { type CaptchaProvider, type CaptchaPolicy, type SignInExperience } from '@logto/schemas';
import { useContext, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import Plus from '@/assets/icons/plus.svg?react';
import DetailsForm from '@/components/DetailsForm';
import { addOnLabels, CombinedAddOnAndFeatureTag } from '@/components/FeatureTag';
import FormCard from '@/components/FormCard';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { captcha } from '@/consts/external-links';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import useApi from '@/hooks/use-api';
import usePaywall from '@/hooks/use-paywall';
import { trySubmitSafe } from '@/utils/form';

import CaptchaCard from './CaptchaCard';
import styles from './CaptchaForm.module.scss';
import CreateCaptchaForm from './CreateCaptchaForm';
import EnableCaptcha from './EnableCaptcha';

type Props = {
  readonly captchaProvider?: CaptchaProvider;
  readonly formData: CaptchaPolicy;
};

function CaptchaForm({ captchaProvider, formData }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isFreeTenant } = usePaywall();
  const { mutateSubscriptionQuotaAndUsages } = useContext(SubscriptionDataContext);

  const [isCreateCaptchaFormOpen, setIsCreateCaptchaFormOpen] = useState(false);
  const formMethods = useForm<CaptchaPolicy>({
    defaultValues: formData,
    mode: 'onBlur',
  });
  const {
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = formMethods;
  const api = useApi();

  const { mutate: mutateGlobal } = useSWRConfig();

  const onSubmit = trySubmitSafe(async (data: CaptchaPolicy) => {
    const { captchaPolicy } = await api
      .patch('api/sign-in-exp', {
        json: { captchaPolicy: data },
      })
      .json<SignInExperience>();
    reset(captchaPolicy);
    mutateSubscriptionQuotaAndUsages();

    // Global mutate the SIE data
    await mutateGlobal('api/sign-in-exp');
    toast.success(t('general.saved'));
  });

  return (
    <>
      <FormProvider {...formMethods}>
        <DetailsForm
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(onSubmit)}
          onDiscard={reset}
        >
          <FormCard
            title="security.bot_protection.title"
            description="security.bot_protection.description"
            learnMoreLink={{ href: captcha }}
            tag={
              <CombinedAddOnAndFeatureTag
                hasAddOnTag
                paywall={latestProPlanId}
                addOnLabel={addOnLabels.addOnBundle}
              />
            }
          >
            <FormField title="security.bot_protection.captcha.title">
              <div className={styles.description}>
                {t('security.bot_protection.captcha.placeholder')}
              </div>
              {isFreeTenant || !captchaProvider ? (
                <Button
                  title="security.bot_protection.captcha.add"
                  icon={<Plus />}
                  disabled={isFreeTenant}
                  onClick={() => {
                    setIsCreateCaptchaFormOpen(true);
                  }}
                />
              ) : (
                <CaptchaCard captchaProvider={captchaProvider} />
              )}
              <EnableCaptcha disabled={isFreeTenant || !captchaProvider} />
            </FormField>
          </FormCard>
        </DetailsForm>
      </FormProvider>
      <CreateCaptchaForm
        isOpen={isCreateCaptchaFormOpen}
        onClose={() => {
          setIsCreateCaptchaFormOpen(false);
        }}
      />
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </>
  );
}

export default CaptchaForm;
