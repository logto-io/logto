import { Theme } from '@logto/schemas';
import { useContext } from 'react';
import type { TFuncKey } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import StaticPageLayout from '@/Layout/StaticPageLayout';
import EmptyStateDark from '@/assets/icons/empty-state-dark.svg';
import EmptyState from '@/assets/icons/empty-state.svg';
import Button from '@/components/Button';
import NavBar from '@/components/NavBar';
import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';

type Props = {
  title?: TFuncKey;
  message?: TFuncKey;
  rawMessage?: string;
  isRootPath?: boolean;
};

const ErrorPage = ({ title = 'description.not_found', message, rawMessage, isRootPath }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useContext(PageContext);

  const errorMessage = rawMessage ?? (message && t(message));

  return (
    <StaticPageLayout>
      {!isRootPath && <NavBar />}
      <div className={styles.container}>
        {theme === Theme.Light ? <EmptyState /> : <EmptyStateDark />}
        <div className={styles.title}>{t(title)}</div>
        {errorMessage && <div className={styles.message}>{String(errorMessage)}</div>}
      </div>
      {!isRootPath && (
        <Button
          className={styles.backButton}
          title="action.back"
          onClick={() => {
            navigate(-1);
          }}
        />
      )}
    </StaticPageLayout>
  );
};

export default ErrorPage;
