import type { SignInExperience as SignInExperienceType } from '@logto/schemas';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import Bulb from '@/assets/images/bulb.svg';
import Tools from '@/assets/images/tools.svg';
import ActionBar from '@/cloud/components/ActionBar';
import { CardSelector, MultiCardSelector } from '@/cloud/components/CardSelector';
import { defaultOnboardingSieConfig } from '@/cloud/constants';
import * as pageLayout from '@/cloud/scss/layout.module.scss';
import type { OnboardSieConfig } from '@/cloud/types';
import { OnboardPage } from '@/cloud/types';
import { getOnboardPagePathname } from '@/cloud/utils';
import Button from '@/components/Button';
import ColorPicker from '@/components/ColorPicker';
import FormField from '@/components/FormField';
import OverlayScrollbar from '@/components/OverlayScrollbar';
import type { RequestError } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';

import Preview from './components/Preview';
import * as styles from './index.module.scss';
import { authenticationOptions, identifierOptions } from './options';
import { parser } from './utils';

const SignInExperience = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { data: signInExperience, mutate } = useSWR<SignInExperienceType, RequestError>(
    'api/sign-in-exp'
  );
  const api = useApi();

  const {
    reset,
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = useForm<OnboardSieConfig>({ defaultValues: defaultOnboardingSieConfig });

  useEffect(() => {
    if (signInExperience) {
      reset(parser.signInExperienceToOnboardSieConfig(signInExperience));
    }
  }, [reset, signInExperience]);

  const onboardingSieConfig = watch();

  const previewSieConfig = useMemo(() => {
    if (signInExperience) {
      return parser.onboardSieConfigToSignInExperience(onboardingSieConfig, signInExperience);
    }
  }, [onboardingSieConfig, signInExperience]);

  const handleInspireMe = () => {
    // TODO @xiaoyijun
    reset(defaultOnboardingSieConfig);
    console.log('on inspire me');
  };

  const onSubmit = handleSubmit(async (formData) => {
    if (!signInExperience) {
      return;
    }

    const updatedData = await api
      .patch('api/sign-in-exp', {
        json: parser.onboardSieConfigToSignInExperience(formData, signInExperience),
      })
      .json<SignInExperienceType>();

    void mutate(updatedData);
  });

  const handleBack = () => {
    navigate(getOnboardPagePathname(OnboardPage.AboutUser));
  };

  const handleSave = async () => {
    await onSubmit();
    toast.success(t('general.saved'));
  };

  const handleNext = async () => {
    await onSubmit();
    navigate(getOnboardPagePathname(OnboardPage.Congrats));
  };

  return (
    <div className={pageLayout.page}>
      <div className={styles.content}>
        <OverlayScrollbar
          options={{ scrollbars: { autoHide: 'scroll', autoHideDelay: 500 } }}
          className={styles.configWrapper}
        >
          <div className={styles.config}>
            <Tools />
            <div className={styles.title}>{t('cloud.sie.title')}</div>
            <div className={styles.inspire}>
              <div className={styles.inspireContent}>
                <div className={styles.inspireTitle}>{t('cloud.sie.inspire.title')}</div>
                <div className={styles.inspireDescription}>
                  {t('cloud.sie.inspire.description')}
                </div>
              </div>
              <Button
                icon={<Bulb />}
                title="cloud.sie.inspire.inspire_me"
                onClick={handleInspireMe}
              />
            </div>
            <FormField title="cloud.sie.logo_field">TBD</FormField>
            <FormField title="cloud.sie.color_field">
              <Controller
                name="color"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <ColorPicker value={value} onChange={onChange} />
                )}
              />
            </FormField>
            <FormField
              title="cloud.sie.identifier_field"
              headlineClassName={styles.cardFieldHeadline}
            >
              <Controller
                name="identifier"
                control={control}
                render={({ field: { name, value, onChange } }) => (
                  <CardSelector
                    name={name}
                    value={value}
                    options={identifierOptions}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
            <FormField
              isMultiple
              title="cloud.sie.authn_field"
              headlineClassName={styles.cardFieldHeadline}
            >
              <Controller
                name="authentications"
                control={control}
                defaultValue={defaultOnboardingSieConfig.authentications}
                render={({ field: { value, onChange } }) => (
                  <MultiCardSelector
                    isNotAllowEmpty
                    className={styles.authnSelector}
                    value={value}
                    options={authenticationOptions}
                    onChange={onChange}
                  />
                )}
              />
            </FormField>
            <FormField
              isMultiple
              title="cloud.sie.social_field"
              headlineClassName={styles.cardFieldHeadline}
            >
              TBD
            </FormField>
          </div>
        </OverlayScrollbar>
        <Preview
          className={styles.preview}
          signInExperience={previewSieConfig}
          isLivePreviewDisabled={isDirty}
        />
      </div>

      <ActionBar step={3}>
        <div className={styles.continueActions}>
          <Button
            type="outline"
            title="general.save"
            disabled={isSubmitting}
            onClick={handleSave}
          />
          <Button
            type="primary"
            title="cloud.sie.finish_and_done"
            disabled={isSubmitting}
            onClick={handleNext}
          />
        </div>
        <Button title="general.back" disabled={isSubmitting} onClick={handleBack} />
      </ActionBar>
    </div>
  );
};

export default SignInExperience;
