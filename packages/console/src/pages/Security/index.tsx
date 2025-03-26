import { CaptchaType, type CaptchaPolicy, type SignInExperience } from '@logto/schemas';
import classNames from 'classnames';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import Plus from '@/assets/icons/plus.svg?react';
import DetailsForm from '@/components/DetailsForm';
import FormCard, { FormCardSkeleton } from '@/components/FormCard';
import PageMeta from '@/components/PageMeta';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';
import { captcha, security } from '@/consts/external-links';
import Button from '@/ds-components/Button';
import CardTitle from '@/ds-components/CardTitle';
import FormField from '@/ds-components/FormField';
import useApi from '@/hooks/use-api';
import pageLayout from '@/scss/page-layout.module.scss';
import { trySubmitSafe } from '@/utils/form';

import CaptchaCard from './CaptchaCard';
import CreateCaptchaForm from './CreateCaptchaForm';
import EnableCaptcha from './EnableCaptcha';
import Guide from './Guide';
import styles from './index.module.scss';
import useDataFetch from './use-data-fetch';

function Security() {
  const { guideId } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isCreateCaptchaFormOpen, setIsCreateCaptchaFormOpen] = useState(false);
  const { data, isLoading } = useDataFetch();
  const formMethods = useForm<CaptchaPolicy>({
    defaultValues: {
      enabled: false,
    },
    mode: 'onBlur',
  });
  const {
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = formMethods;
  const api = useApi();

  const onSubmit = trySubmitSafe(async (data: CaptchaPolicy) => {
    const { captchaPolicy } = await api
      .patch('api/sign-in-exp', {
        json: { captchaPolicy: data },
      })
      .json<SignInExperience>();
    reset(captchaPolicy);
    toast.success(t('general.saved'));
  });

  const guideType = z.nativeEnum(CaptchaType).safeParse(guideId);
  const navigate = useNavigate();

  if (guideType.success) {
    return (
      <Guide
        type={guideType.data}
        onClose={() => {
          navigate('/security');
        }}
      />
    );
  }

  return (
    <div className={styles.container}>
      <PageMeta titleKey="security.page_title" />
      <div className={classNames(pageLayout.headline, styles.headline)}>
        <CardTitle
          title="security.title"
          subtitle="security.subtitle"
          learnMoreLink={{ href: security }}
        />
      </div>
      {isLoading ? (
        <FormCardSkeleton formFieldCount={2} />
      ) : (
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
            >
              <FormField title="security.bot_protection.captcha.title">
                <div className={styles.description}>
                  {t('security.bot_protection.captcha.placeholder')}
                </div>
                {data ? (
                  <>
                    <CaptchaCard captchaProvider={data} />
                    <EnableCaptcha />
                  </>
                ) : (
                  <Button
                    title="security.bot_protection.captcha.add"
                    icon={<Plus />}
                    onClick={() => {
                      setIsCreateCaptchaFormOpen(true);
                    }}
                  />
                )}
              </FormField>
            </FormCard>
          </DetailsForm>
        </FormProvider>
      )}
      <CreateCaptchaForm
        isOpen={isCreateCaptchaFormOpen}
        onClose={() => {
          setIsCreateCaptchaFormOpen(false);
        }}
      />
      <UnsavedChangesAlertModal hasUnsavedChanges={isDirty} />
    </div>
  );
}

export default Security;
