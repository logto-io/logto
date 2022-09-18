import { I18nKey } from '@logto/phrases-ui';
import classNames from 'classnames';
import { HTMLProps, ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DangerousRaw from '../../../../console/src/components/DangerousRaw';
import { Ring as Spinner } from '../../../../console/src/components/Spinner';
import * as styles from './index.module.scss';

export type ButtonType =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'outline'
  | 'plain'
  | 'default'
  | 'branding';

type BaseProps = Omit<HTMLProps<HTMLButtonElement>, 'type' | 'size' | 'title'> & {
  htmlType?: 'button' | 'submit' | 'reset';
  type?: ButtonType;
  size?: 'small' | 'medium' | 'large';
  isDisabled?: boolean;
  isLoading?: boolean;
  loadingDelay?: number;
};

type TitleButtonProps = BaseProps & {
  title: I18nKey | ReactElement<typeof DangerousRaw>;
  icon?: ReactNode;
  properties?: Record<string, string>;
};

type IconButtonProps = BaseProps & {
  title?: I18nKey | ReactElement<typeof DangerousRaw>;
  icon: ReactNode;
  properties?: Record<string, string>;
};

export type Props = TitleButtonProps | IconButtonProps;

const Button = ({
  htmlType = 'button',
  type = 'default',
  size = 'medium',
  title,
  properties,
  icon,
  className,
  isDisabled = false,
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
      // To avoid typescript error
      // eslint-disable-next-line @silverhand/fp/no-mutation
      timerRef.current = window.setTimeout(() => {
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
      disabled={isDisabled}
      className={classNames(
        styles.button,
        styles[type],
        styles[size],
        icon && styles.withIcon,
        isDisabled && styles.isDisabled,
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
      {title && (typeof title === 'string' ? <span>{t(title, { ...properties })}</span> : title)}
    </button>
  );
};

export default Button;
