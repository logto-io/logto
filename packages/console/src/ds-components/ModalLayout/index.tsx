import classNames from 'classnames';
import { type ReactElement, type ReactNode } from 'react';

import Close from '@/assets/icons/close.svg';

import Card from '../Card';
import type { Props as CardTitleProps } from '../CardTitle';
import CardTitle from '../CardTitle';
import IconButton from '../IconButton';

import * as styles from './index.module.scss';

export type Props = {
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly onClose?: () => void;
  readonly className?: string;
  readonly size?: 'medium' | 'large' | 'xlarge';
  readonly headerIcon?: ReactElement;
} & Pick<CardTitleProps, 'learnMoreLink' | 'title' | 'subtitle' | 'isWordWrapEnabled'>;

function ModalLayout({
  children,
  footer,
  onClose,
  className,
  size = 'medium',
  headerIcon,
  ...cardTitleProps
}: Props) {
  return (
    <Card className={classNames(styles.container, styles[size])}>
      <div className={styles.header}>
        <div className={styles.iconAndTitle}>
          {headerIcon}
          <CardTitle isWordWrapEnabled {...cardTitleProps} />
        </div>
        {onClose && (
          <IconButton
            onClick={() => {
              onClose();
            }}
          >
            <Close className={styles.closeIcon} />
          </IconButton>
        )}
      </div>
      <div className={className}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </Card>
  );
}

export default ModalLayout;
