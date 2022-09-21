import { TFuncKey, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import ErrorImage from '@/assets/icons/error.svg';
import Button from '@/components/Button';
import NavBar from '@/components/NavBar';

import * as styles from './index.module.scss';

type Props = {
  title?: TFuncKey;
  message?: TFuncKey;
  rawMessage?: string;
};

const ErrorPage = ({ title = 'description.not_found', message, rawMessage }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const errorMessage = rawMessage || (message && t(message));

  return (
    <div className={styles.wrapper}>
      <NavBar />
      <div className={styles.container}>
        <ErrorImage />
        <div className={styles.title}>{t(title)}</div>
        {errorMessage && <div className={styles.message}>{String(errorMessage)}</div>}
      </div>
      <Button
        className={styles.backButton}
        title="action.back"
        onClick={() => {
          navigate(-1);
        }}
      />
    </div>
  );
};

export default ErrorPage;
