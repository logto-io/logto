import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Calendar from '@/assets/images/calendar.svg';
import Email from '@/assets/images/email.svg';
import ModalLayout from '@/components/ModalLayout';
import { emailUsLink, reservationLink } from '@/onboarding/constants';
import * as modalStyles from '@/scss/modal.module.scss';

import ReachLogto from '../../ReachLogto';

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
        <ReachLogto
          title="cloud.gift.reserve_title"
          icon={<Calendar />}
          description="cloud.gift.reserve_description"
          buttonTitle="cloud.gift.book_button"
          link={reservationLink}
        />
        <ReachLogto
          title="cloud.gift.email_us_title"
          icon={<Email />}
          description="cloud.gift.email_us_description"
          buttonTitle="cloud.gift.email_us_button"
          link={emailUsLink}
        />
      </ModalLayout>
    </ReactModal>
  );
}

export default GiftModal;
