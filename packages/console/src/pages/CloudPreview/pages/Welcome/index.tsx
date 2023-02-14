import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Congrats from '@/assets/images/congrats.svg';
import Button from '@/components/Button';
import FormField from '@/components/FormField';
import OverlayScrollbar from '@/components/OverlayScrollbar';
import * as pageLayout from '@/pages/CloudPreview/index.module.scss';

import ActionBar from '../../components/ActionBar';
import { CardSelector } from '../../components/CardSelector';
import type { Questionnaire } from '../../types';
import * as styles from './index.module.scss';
import { deploymentTypeOptions, projectOptions } from './options';

const Welcome = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = useForm<Questionnaire>({ mode: 'onChange' });

  const onSubmit = handleSubmit(async (formData) => {
    // TODO @xiaoyijun send data to the backend
    console.log(formData);

    // TODO @xiaoyijun navigate to the about users page
  });

  return (
    <div className={pageLayout.page}>
      <OverlayScrollbar className={pageLayout.contentContainer}>
        <div className={styles.content}>
          <Congrats className={styles.congrats} />
          <div className={styles.title}>{t('cloud_preview.welcome.title')}</div>
          <div className={styles.description}>{t('cloud_preview.welcome.description')}</div>
          <form className={styles.form}>
            <FormField
              title="cloud_preview.welcome.project_field"
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
              title="cloud_preview.welcome.deployment_type_field"
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
      <ActionBar>
        <Button
          title="general.next"
          type="primary"
          disabled={isSubmitting || !isValid}
          onClick={onSubmit}
        />
      </ActionBar>
    </div>
  );
};

export default Welcome;
