import { withAppInsights } from '@logto/app-insights/react';
import classNames from 'classnames';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import WelcomeImage from '@/assets/images/sign-in-experience-welcome.svg';
import PageMeta from '@/components/PageMeta';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import ActionBar from '@/onboarding/components/ActionBar';
import { CardSelector } from '@/onboarding/components/CardSelector';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';
import * as pageLayout from '@/onboarding/scss/layout.module.scss';
import { trySubmitSafe } from '@/utils/form';

import type { Questionnaire } from '../../types';
import { OnboardingPage } from '../../types';
import { getOnboardingPage } from '../../utils';

import * as styles from './index.module.scss';
import { deploymentTypeOptions, projectOptions } from './options';

function Welcome() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();

  const {
    data: { questionnaire },
    update,
  } = useUserOnboardingData();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
    reset,
  } = useForm<Questionnaire>({ defaultValues: questionnaire, mode: 'onChange' });

  useEffect(() => {
    reset(questionnaire);
  }, [questionnaire, reset]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      await update({ questionnaire: formData });
    })
  );

  const onNext = async () => {
    await onSubmit();
    navigate(getOnboardingPage(OnboardingPage.AboutUser));
  };

  return (
    <div className={pageLayout.page}>
      <PageMeta titleKey={['cloud.welcome.page_title', 'cloud.general.onboarding']} />
      <OverlayScrollbar className={pageLayout.contentContainer}>
        <div className={classNames(pageLayout.content, styles.content)}>
          <WelcomeImage className={styles.congrats} />
          <div className={styles.title}>{t('cloud.welcome.title')}</div>
          <div className={styles.description}>{t('cloud.welcome.description')}</div>
          <form className={styles.form}>
            <FormField
              title="cloud.welcome.project_field"
              headlineClassName={styles.cardFieldHeadline}
            >
              <Controller
                control={control}
                name="project"
                rules={{ required: true }}
                render={({ field: { onChange, value, name } }) => (
                  <CardSelector
                    name={name}
                    value={value}
                    options={projectOptions}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
            <FormField
              title="cloud.welcome.deployment_type_field"
              headlineClassName={styles.cardFieldHeadline}
            >
              <Controller
                control={control}
                name="deploymentType"
                rules={{ required: true }}
                render={({ field: { onChange, value, name } }) => (
                  <CardSelector
                    name={name}
                    value={value}
                    options={deploymentTypeOptions}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
          </form>
        </div>
      </OverlayScrollbar>
      <ActionBar step={1}>
        <Button
          title="general.next"
          type="primary"
          disabled={isSubmitting || !isValid}
          onClick={onNext}
        />
      </ActionBar>
    </div>
  );
}

export default withAppInsights(Welcome);
