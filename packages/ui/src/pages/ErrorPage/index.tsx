import { Theme } from '@logto/schemas';
import { useContext } from 'react';
import type { TFuncKey } from 'react-i18next';
import { useTranslation } from 'react-i18next';

import StaticPageLayout from '@/Layout/StaticPageLayout';
import EmptyStateDark from '@/assets/icons/empty-state-dark.svg';
import EmptyState from '@/assets/icons/empty-state.svg';
import NavBar from '@/components/NavBar';
import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';

type Props = {
  title?: TFuncKey;
  message?: TFuncKey;
  rawMessage?: string;
};

const ErrorPage = ({ title = 'description.not_found', message, rawMessage }: Props) => {
  const { t } = useTranslation();

  const { theme } = useContext(PageContext);

  const errorMessage = rawMessage ?? (message && t(message));

  console.log(history.length);

  return (
    <StaticPageLayout>
      {history.length > 1 && <NavBar />}
      <div className={styles.container}>
        {theme === Theme.Light ? <EmptyState /> : <EmptyStateDark />}
        <div className={styles.title}>{t(title)}</div>
        {errorMessage && <div className={styles.message}>{String(errorMessage)}</div>}
      </div>
    </StaticPageLayout>
  );
};

export default ErrorPage;
