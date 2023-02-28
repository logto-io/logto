import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Bulb from '@/assets/images/bulb.svg';
import Tools from '@/assets/images/tools.svg';
import ActionBar from '@/cloud/components/ActionBar';
import { CardSelector, MultiCardSelector } from '@/cloud/components/CardSelector';
import { defaultOnboardingSieConfig } from '@/cloud/constants';
import * as pageLayout from '@/cloud/scss/layout.module.scss';
import type { OnboardingSieConfig } from '@/cloud/types';
import { OnboardPage } from '@/cloud/types';
import { getOnboardPagePathname } from '@/cloud/utils';
import Button from '@/components/Button';
import ColorPicker from '@/components/ColorPicker';
import FormField from '@/components/FormField';
import OverlayScrollbar from '@/components/OverlayScrollbar';

import * as styles from './index.module.scss';
import { authenticationOptions, identifierOptions } from './options';

const SignInExperience = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();

  const { reset, control, handleSubmit } = useForm<OnboardingSieConfig>({
    defaultValues: defaultOnboardingSieConfig,
  });

  const handleInspireMe = () => {
    // TODO @xiaoyijun
    reset(defaultOnboardingSieConfig);
    console.log('on inspire me');
  };

  const onSubmit = handleSubmit(async (formData) => {
    // TODO @xiaoyijun convert to sign in experience config data and update
    console.log(formData);
  });

  const handleBack = () => {
    navigate(getOnboardPagePathname(OnboardPage.AboutUser));
  };

  const handleNext = async () => {
    await onSubmit();
    navigate(getOnboardPagePathname(OnboardPage.Congrats));
  };

  return (
    <div className={pageLayout.page}>
      <OverlayScrollbar className={pageLayout.contentContainer}>
        <div className={styles.content}>
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
                defaultValue={[]}
                render={({ field: { value, onChange } }) => (
                  <MultiCardSelector
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
          <div className={styles.preview}>Preview(TBD)</div>
        </div>
      </OverlayScrollbar>
      <ActionBar step={3}>
        <Button type="primary" title="cloud.sie.finish_and_done" onClick={handleNext} />
        <Button title="general.back" onClick={handleBack} />
      </ActionBar>
    </div>
  );
};

export default SignInExperience;
