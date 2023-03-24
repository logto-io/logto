import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import ModalLayout from '@/components/ModalLayout';
import * as modalStyles from '@/scss/modal.module.scss';

import Reservation from '../../Reservation';

import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function GiftModal({ isOpen, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <ReactModal
      shouldCloseOnOverlayClick
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
      onRequestClose={onClose}
    >
      <ModalLayout
        isWordWrapEnabled
        title="cloud.gift.title"
        className={styles.content}
        onClose={onClose}
      >
        <div className={styles.description}>{t('cloud.gift.description')}</div>
        <Reservation
          title="cloud.gift.reserve_title"
          description="cloud.gift.reserve_description"
          reservationButtonTitle="cloud.gift.book_button"
        />
      </ModalLayout>
    </ReactModal>
  );
}

export default GiftModal;
