import { AppearanceMode } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ErrorDark from '@/assets/images/error-dark.svg';
import Error from '@/assets/images/error.svg';
import KeyboardArrowDown from '@/assets/images/keyboard-arrow-down.svg';
import KeyboardArrowUp from '@/assets/images/keyboard-arrow-up.svg';
import { useTheme } from '@/hooks/use-theme';
import { onKeyDownHandler } from '@/utilities/a11y';

import * as styles from './index.module.scss';

type Props = {
  title?: string;
  errorCode?: string;
  errorMessage?: string;
  callStack?: string;
  children?: React.ReactNode;
};

const AppError = ({ title, errorCode, errorMessage, callStack, children }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const theme = useTheme();

  return (
    <div className={styles.container}>
      {theme === AppearanceMode.LightMode ? <Error /> : <ErrorDark />}
      <label>{title ?? t('errors.something_went_wrong')}</label>
      <div className={styles.summary}>
        <span>
          {errorCode}
          {errorCode && errorMessage && ': '}
          {errorMessage}
          {callStack && (
            <span
              role="button"
              tabIndex={0}
              className={styles.expander}
              onKeyDown={onKeyDownHandler(() => {
                setIsDetailsOpen(!isDetailsOpen);
              })}
              onClick={() => {
                setIsDetailsOpen(!isDetailsOpen);
              }}
            >
              {t('errors.more_details')}
              {isDetailsOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </span>
          )}
        </span>
      </div>
      {callStack && isDetailsOpen && <div className={styles.details}>{callStack}</div>}
      {children}
    </div>
  );
};

export default AppError;
