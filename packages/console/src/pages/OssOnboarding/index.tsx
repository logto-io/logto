import { emailRegEx } from '@logto/core-kit';
import { CompanySize, Project, Theme } from '@logto/schemas';
import { useContext, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

import BriefcaseIcon from '@/assets/icons/briefcase.svg?react';
import BuildingIcon from '@/assets/icons/building.svg?react';
import PizzaIcon from '@/assets/icons/pizza.svg?react';
import Logo from '@/assets/images/logo.svg?react';
import ActionBar from '@/components/ActionBar';
import PageMeta from '@/components/PageMeta';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import Button from '@/ds-components/Button';
import Checkbox from '@/ds-components/Checkbox';
import FormField from '@/ds-components/FormField';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';
import useOssOnboardingData from '@/hooks/use-oss-onboarding-data';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { trySubmitSafe } from '@/utils/form';

import styles from './index.module.scss';
import {
  getOssOnboardingDefaultValues,
  getOssOnboardingSubmitPayload,
  shouldRequireCompanyFields,
  type OssOnboardingFormData,
} from './utils';

function OssOnboarding() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { setThemeOverride } = useContext(AppThemeContext);
  const { getTo, navigate } = useTenantPathname();
  const { data, isLoading, isOnboardingDone, update } = useOssOnboardingData();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<OssOnboardingFormData>({
    defaultValues: getOssOnboardingDefaultValues(),
  });
  const project = watch('project');
  const isCompanyProject = shouldRequireCompanyFields(project);

  useEffect(() => {
    setThemeOverride(Theme.Light);

    return () => {
      setThemeOverride(undefined);
    };
  }, [setThemeOverride]);

  useEffect(() => {
    if (!isLoading) {
      reset({
        ...getOssOnboardingDefaultValues(),
        ...data.questionnaire,
      });
    }
  }, [data.questionnaire, isLoading, reset]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      await update({
        questionnaire: getOssOnboardingSubmitPayload(formData),
        isOnboardingDone: true,
      });
      navigate('/get-started', { replace: true });
    })
  );

  if (isLoading) {
    return null;
  }

  if (isOnboardingDone) {
    return <Navigate replace to={getTo('/get-started')} />;
  }

  return (
    <div className={styles.page}>
      <PageMeta titleKey="oss_onboarding.page_title" />
      <div className={styles.topbar}>
        <Logo className={styles.logo} />
      </div>
      <OverlayScrollbar className={styles.contentContainer}>
        <div className={styles.content}>
          <BriefcaseIcon className={styles.heroIcon} />
          <div className={styles.title}>{t('oss_onboarding.title')}</div>
          <div className={styles.description}>{t('oss_onboarding.description')}</div>
          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.emailSection}>
              <FormField
                title="oss_onboarding.email.label"
                description="oss_onboarding.email.description"
                descriptionPosition="top"
              >
                <TextInput
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  type="email"
                  placeholder={t('oss_onboarding.email.placeholder')}
                  disabled={isSubmitting}
                  error={errors.emailAddress?.message}
                  {...register('emailAddress', {
                    required: t('oss_onboarding.errors.email_required'),
                    validate: (value) =>
                      emailRegEx.test(value) || t('oss_onboarding.errors.email_invalid'),
                  })}
                />
              </FormField>
              <Controller
                name="newsletter"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    className={styles.checkbox}
                    checked={value}
                    label={t('oss_onboarding.newsletter')}
                    onChange={onChange}
                  />
                )}
              />
            </div>
            <FormField title="oss_onboarding.project.label">
              <Controller
                name="project"
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value, name } }) => (
                  <RadioGroup
                    className={styles.projectGroup}
                    type="compact"
                    name={name}
                    value={value}
                    onChange={onChange}
                  >
                    <Radio
                      className={styles.projectRadio}
                      title="oss_onboarding.project.personal"
                      value={Project.Personal}
                      icon={<PizzaIcon className={styles.projectOptionIcon} />}
                    />
                    <Radio
                      className={styles.projectRadio}
                      title="oss_onboarding.project.company"
                      value={Project.Company}
                      icon={<BuildingIcon className={styles.projectOptionIcon} />}
                    />
                  </RadioGroup>
                )}
              />
            </FormField>
            {isCompanyProject && (
              <>
                <FormField isRequired title="oss_onboarding.company_name.label">
                  <TextInput
                    placeholder={t('oss_onboarding.company_name.placeholder')}
                    disabled={isSubmitting}
                    error={errors.companyName?.message}
                    {...register('companyName', {
                      validate: (value) =>
                        Boolean(value.trim()) || t('oss_onboarding.errors.company_name_required'),
                    })}
                  />
                </FormField>
                <FormField isRequired title="oss_onboarding.company_size.label">
                  <Controller
                    name="companySize"
                    control={control}
                    rules={{
                      validate: (value) =>
                        Boolean(value) || t('oss_onboarding.errors.company_size_required'),
                    }}
                    render={({ field: { onChange, value, name } }) => (
                      <>
                        <RadioGroup
                          className={styles.radioGroup}
                          type="small"
                          name={name}
                          value={value}
                          onChange={onChange}
                        >
                          <Radio value={CompanySize.Scale1}>1</Radio>
                          <Radio value={CompanySize.Scale2}>2-49</Radio>
                          <Radio value={CompanySize.Scale3}>50-199</Radio>
                          <Radio value={CompanySize.Scale4}>200-999</Radio>
                          <Radio value={CompanySize.Scale5}>1000+</Radio>
                        </RadioGroup>
                        {errors.companySize?.message && (
                          <div className={styles.error}>{errors.companySize.message}</div>
                        )}
                      </>
                    )}
                  />
                </FormField>
              </>
            )}
          </form>
        </div>
      </OverlayScrollbar>
      <div className={styles.actionBar}>
        <ActionBar>
          <Button title="general.next" type="primary" disabled={isSubmitting} onClick={onSubmit} />
        </ActionBar>
      </div>
    </div>
  );
}

export default OssOnboarding;
