import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useNavigate } from 'react-router-dom';

import Arrow from '@/assets/images/arrow-left.svg';
import TextLink from '@/components/TextLink';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from './index.module.scss';

type Props = PropsWithChildren<{
  title: AdminConsoleKey;
  subtitle?: AdminConsoleKey;
  onClose: () => void;
}>;

const MainFlowLikeModal = ({ title, subtitle, children, onClose }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();

  return (
    <ReactModal shouldCloseOnEsc isOpen className={modalStyles.fullScreen} onRequestClose={onClose}>
      <div className={classNames(modalStyles.content, styles.container)}>
        <div className={styles.wrapper}>
          <TextLink
            className={styles.backButton}
            icon={<Arrow />}
            onClick={() => {
              navigate(-1);
            }}
          >
            {t('general.back')}
          </TextLink>
          <span className={styles.title}>{t(title)}</span>
          {subtitle && <span className={styles.subtitle}>{t(subtitle)}</span>}
          {children}
        </div>
      </div>
    </ReactModal>
  );
};

export default MainFlowLikeModal;
