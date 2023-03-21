import type { Application } from '@logto/schemas';
import { ApplicationType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import useApi from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';
import { applicationTypeI18nKey } from '@/types/applications';

import TypeDescription from '../TypeDescription';
import * as styles from './index.module.scss';

const defaultAppName = 'My App';

type Props = {
  onCreate: (createdApp: Application) => void;
};

function ApplicationsPlaceholder({ onCreate }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isCreating, setIsCreating] = useState(false);
  const api = useApi();
  const { updateConfigs } = useConfigs();

  const handleCreate = async (type: ApplicationType) => {
    if (isCreating) {
      return;
    }

    setIsCreating(true);
    const payload = {
      type,
      name: defaultAppName,
    };

    try {
      const createdApp = await api.post('api/applications', { json: payload }).json<Application>();

      void updateConfigs({
        applicationCreated: true,
        ...conditional(
          createdApp.type === ApplicationType.MachineToMachine && { m2mApplicationCreated: true }
        ),
      });
      onCreate(createdApp);
    } finally {
      setIsCreating(false);
    }
  };

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
            />
            <Button
              className={styles.createButton}
              disabled={isCreating}
              title="general.create"
              onClick={() => {
                void handleCreate(type);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApplicationsPlaceholder;
