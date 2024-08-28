import { type Questionnaire, Project } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Case from '@/assets/icons/case.svg';
import ActionBar from '@/components/ActionBar';
import PageMeta from '@/components/PageMeta';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextInput from '@/ds-components/TextInput';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';
import * as pageLayout from '@/onboarding/scss/layout.module.scss';
import { trySubmitSafe } from '@/utils/form';

import { CardSelector, MultiCardSelector } from '../../components/CardSelector';
import { OnboardingPage } from '../../types';
import { getOnboardingPage } from '../../utils';

import * as styles from './index.module.scss';
import { stageOptions, additionalFeaturesOptions, projectOptions } from './options';

function Welcome() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();

  const {
    data: { questionnaire },
    update,
  } = useUserOnboardingData();

  const { control, register, handleSubmit, reset, watch } = useForm<Questionnaire>({
    mode: 'onChange',
  });

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
    navigate(getOnboardingPage(OnboardingPage.CreateTenant));
  };

  return (
    <div className={pageLayout.page}>
      <PageMeta titleKey={['cloud.welcome.page_title', 'cloud.general.onboarding']} />
      <OverlayScrollbar className={pageLayout.contentContainer}>
        <div className={pageLayout.content}>
          <Case />
          <div className={pageLayout.title}>{t('cloud.welcome.title')}</div>
          <div className={pageLayout.description}>{t('cloud.welcome.description')}</div>
          <form className={styles.form}>
            <FormField title="cloud.welcome.project_field" headlineSpacing="large">
              <Controller
                control={control}
                name="project"
                render={({ field: { onChange, value, name } }) => (
                  <CardSelector
                    name={name}
                    value={value ?? ''}
                    options={projectOptions}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
            {/* Check whether it is a business use case */}
            {watch('project') === Project.Company && (
              <FormField title="cloud.welcome.company_name_field">
                <TextInput
                  placeholder={t('cloud.welcome.company_name_placeholder')}
                  {...register('companyName')}
                />
              </FormField>
            )}
            <FormField title="cloud.welcome.stage_field" headlineSpacing="large">
              <Controller
                control={control}
                name="stage"
                render={({ field: { name, onChange, value } }) => (
                  <CardSelector
                    name={name}
                    value={value ?? ''}
                    options={stageOptions}
                    onChange={(value) => {
                      onChange(conditional(value && value));
                    }}
                  />
                )}
              />
            </FormField>
            <FormField
              isMultiple
              title="cloud.welcome.additional_features_field"
              headlineSpacing="large"
            >
              <Controller
                control={control}
                name="additionalFeatures"
                render={({ field: { onChange, value } }) => (
                  <MultiCardSelector
                    optionClassName={styles.option}
                    value={value ?? []}
                    options={additionalFeaturesOptions}
                    onChange={(value) => {
                      onChange(value.length === 0 ? undefined : value);
                    }}
                  />
                )}
              />
            </FormField>
          </form>
        </div>
      </OverlayScrollbar>
      <ActionBar step={1} totalSteps={3}>
        <Button title="general.next" type="primary" onClick={onNext} />
      </ActionBar>
    </div>
  );
}

export default Welcome;
