import { I18nKey } from '@logto/phrases';
import classNames from 'classnames';
import React, { HTMLProps, ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Ring as Spinner } from '@/components/Spinner';

import DangerousRaw from '../DangerousRaw';
import * as styles from './index.module.scss';

type BaseProps = Omit<HTMLProps<HTMLButtonElement>, 'type' | 'size' | 'title'> & {
  htmlType?: 'button' | 'submit' | 'reset';
  type?: 'primary' | 'danger' | 'outline' | 'plain' | 'default';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  loadingDelay?: number;
};

type TitleButtonProps = BaseProps & {
  title: I18nKey | ReactElement<typeof DangerousRaw>;
  icon?: ReactNode;
};

type IconButtonProps = BaseProps & {
  title?: I18nKey | ReactElement<typeof DangerousRaw>;
  icon: ReactNode;
};

export type Props = TitleButtonProps | IconButtonProps;

const Button = ({
  htmlType = 'button',
  type = 'default',
  size = 'medium',
  title,
  icon,
  className,
  isLoading = false,
  loadingDelay = 500,
  onClick,
  ...rest
}: Props) => {
  const { t } = useTranslation();
  const [showSpinner, setShowSpinner] = useState(false);
  const timerRef = useRef<number>();

  useEffect(() => {
    // Delay showing the spinner after 'loadingDelay' milliseconds
    if (isLoading) {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      timerRef.current = setTimeout(() => {
        setShowSpinner(true);
      }, loadingDelay);
    }

    return () => {
      clearTimeout(timerRef.current);
      setShowSpinner(false);
    };
  }, [isLoading, loadingDelay]);

  return (
    <button
      className={classNames(
        styles.button,
        styles[type],
        styles[size],
        icon && styles.withIcon,
        isLoading && styles.loading,
        className
      )}
      type={htmlType}
      onClick={(event) => {
        if (isLoading) {
          return false;
        }
        onClick?.(event);
      }}
      {...rest}
    >
      {showSpinner && <Spinner className={styles.spinner} />}
      {icon && <span className={styles.icon}>{icon}</span>}
      {title && (typeof title === 'string' ? <span>{t(title)}</span> : title)}
    </button>
  );
};

export default Button;
