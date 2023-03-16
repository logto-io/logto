import classNames from 'classnames';
import type { ReactNode } from 'react';

import Close from '@/assets/images/close.svg';

import Card from '../Card';
import type { Props as CardTitleProps } from '../CardTitle';
import CardTitle from '../CardTitle';
import IconButton from '../IconButton';
import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  className?: string;
  size?: 'medium' | 'large' | 'xlarge';
} & Pick<CardTitleProps, 'learnMoreLink' | 'title' | 'subtitle' | 'isWordWrapEnabled'>;

const ModalLayout = ({
  children,
  footer,
  onClose,
  className,
  size = 'medium',
  ...cardTitleProps
}: Props) => {
  return (
    <Card className={classNames(styles.container, styles[size])}>
      <div className={styles.header}>
        <CardTitle {...cardTitleProps} />
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
};

export default ModalLayout;
