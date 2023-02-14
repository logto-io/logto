import { useContext } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Congrats from '@/assets/images/congrats.svg';
import FormField from '@/components/FormField';
import OverlayScrollbar from '@/components/OverlayScrollbar';

import { CardSelector } from '../../components/CardSelector';
import { CloudPreviewPageContext } from '../../containers/CloudPreviewPageProvider';
import * as styles from './index.module.scss';
import { deploymentTypeOptions, projectOptions } from './options';

const Welcome = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    questionForm: { getControl },
  } = useContext(CloudPreviewPageContext);

  const control = getControl();

  return (
    <OverlayScrollbar className={styles.welcome}>
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
  );
};

export default Welcome;
