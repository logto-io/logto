import type { Application } from '@logto/schemas';
import { ApplicationType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import useApi from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';
import * as modalStyles from '@/scss/modal.module.scss';
import { applicationTypeI18nKey } from '@/types/applications';

import Guide from '../Guide';
import TypeDescription from '../TypeDescription';
import * as styles from './index.module.scss';

const defaultAppName = 'My App';

const ApplicationsPlaceholder = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [isGetStartedModalOpen, setIsGetStartedModalOpen] = useState(false);
  const [createdApplication, setCreatedApplication] = useState<Application>();
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

      setCreatedApplication(createdApp);
      setIsGetStartedModalOpen(true);

      void updateConfigs({
        applicationCreated: true,
        ...conditional(
          createdApp.type === ApplicationType.MachineToMachine && { applicationM2mCreated: true }
        ),
      });
    } finally {
      setIsCreating(false);
    }
  };

  const closeGuideModal = () => {
    if (!createdApplication) {
      return;
    }

    setIsGetStartedModalOpen(false);
    toast.success(t('applications.application_created', { name: createdApplication.name }));
    navigate(`/applications/${createdApplication.id}`);
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
              title="general.select"
              onClick={async () => {
                await handleCreate(type);
              }}
            />
          </div>
        ))}
      </div>
      {createdApplication && (
        <Modal
          shouldCloseOnEsc
          isOpen={isGetStartedModalOpen}
          className={modalStyles.fullScreen}
          onRequestClose={closeGuideModal}
        >
          <Guide app={createdApplication} onClose={closeGuideModal} />
        </Modal>
      )}
    </div>
  );
};

export default ApplicationsPlaceholder;
