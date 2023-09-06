import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import Button from '@/ds-components/Button';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import * as modalStyles from '@/scss/modal.module.scss';

import CreateForm from '../CreateForm';
import GuideHeader from '../GuideHeader';
import GuideLibrary from '../GuideLibrary';

import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function GuideLibraryModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.applications.guide' });
  const { navigate } = useTenantPathname();
  const [showCreateForm, setShowCreateForm] = useState(false);
  return (
    <Modal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={modalStyles.fullScreen}
      onRequestClose={onClose}
    >
      <div className={styles.container}>
        <GuideHeader onClose={onClose} />
        <GuideLibrary hasFilters hasCardButton className={styles.content} />
        <nav className={styles.actionBar}>
          <div className={styles.wrapper}>
            <span className={styles.text}>{t('do_not_need_tutorial')}</span>
            <Button
              size="large"
              title="applications.guide.create_without_framework"
              type="outline"
              onClick={() => {
                setShowCreateForm(true);
              }}
            />
          </div>
        </nav>
      </div>
      {showCreateForm && (
        <CreateForm
          onClose={(newApp) => {
            if (newApp) {
              navigate(`/applications/${newApp.id}`);
            }
            setShowCreateForm(false);
          }}
        />
      )}
    </Modal>
  );
}

export default GuideLibraryModal;
