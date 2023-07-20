import { ApplicationType } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import { isProduction } from '@/consts/env';
import Button from '@/ds-components/Button';
import { applicationTypeI18nKey } from '@/types/applications';

import TypeDescription from '../TypeDescription';

import * as styles from './index.module.scss';

type Props = {
  onSelect: (type: ApplicationType) => void;
};

function ApplicationsPlaceholder({ onSelect }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.placeholder}>
      <div className={styles.title}>{t('applications.placeholder_title')}</div>
      <div className={styles.description}>{t('applications.placeholder_description')}</div>
      <div className={styles.options}>
        {Object.values(ApplicationType).map((type) => (
          <div key={type} className={styles.option}>
            <TypeDescription
              size="small"
              type={type}
              title={t(`${applicationTypeI18nKey[type]}.title`)}
              subtitle={t(`${applicationTypeI18nKey[type]}.subtitle`)}
              description={t(`${applicationTypeI18nKey[type]}.description`)}
              /**
               * Todo: @xiaoyijun remove this condition on subscription features ready.
               */
              hasProTag={!isProduction && type === ApplicationType.MachineToMachine}
            />
            <Button
              className={styles.createButton}
              title="general.create"
              onClick={() => {
                onSelect(type);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApplicationsPlaceholder;
