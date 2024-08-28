import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { PropsWithChildren } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';
import { useNavigate } from 'react-router-dom';

import Arrow from '@/assets/icons/arrow-left.svg';
import DynamicT from '@/ds-components/DynamicT';
import TextLink from '@/ds-components/TextLink';
import * as modalStyles from '@/scss/modal.module.scss';

import * as styles from './index.module.scss';

type Props = PropsWithChildren<{
  readonly title: AdminConsoleKey;
  readonly subtitle?: AdminConsoleKey;
  readonly subtitleProps?: Record<string, string>;
  readonly onClose: () => void;
  readonly onGoBack?: () => void;
}>;

function ExperienceLikeModal({
  title,
  subtitle,
  subtitleProps,
  children,
  onClose,
  onGoBack,
}: Props) {
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
              if (onGoBack) {
                onGoBack();
              } else {
                navigate(-1);
              }
            }}
          >
            {t('general.back')}
          </TextLink>
          <span className={styles.title}>
            <DynamicT forKey={title} />
          </span>
          {subtitle && (
            <span className={styles.subtitle}>
              <Trans components={{ strong: <span className={styles.strong} /> }}>
                {t(subtitle, subtitleProps ?? {})}
              </Trans>
            </span>
          )}
          {children}
        </div>
      </div>
    </ReactModal>
  );
}

export default ExperienceLikeModal;
