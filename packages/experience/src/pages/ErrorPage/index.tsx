import { Theme } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useContext } from 'react';

import StaticPageLayout from '@/Layout/StaticPageLayout';
import PageContext from '@/Providers/PageContextProvider/PageContext';
import EmptyStateDark from '@/assets/icons/empty-state-dark.svg?react';
import EmptyState from '@/assets/icons/empty-state.svg?react';
import DynamicT from '@/components/DynamicT';
import NavBar from '@/components/NavBar';
import PageMeta from '@/components/PageMeta';

import styles from './index.module.scss';

type Props = {
  readonly title?: TFuncKey;
  readonly message?: TFuncKey;
  readonly rawMessage?: string;
};

const ErrorPage = ({ title = 'description.not_found', message, rawMessage }: Props) => {
  const { theme } = useContext(PageContext);
  const errorMessage = Boolean(rawMessage ?? message);

  return (
    <StaticPageLayout>
      <PageMeta titleKey={title} />
      {history.length > 1 && <NavBar />}
      <div className={styles.container}>
        {theme === Theme.Light ? <EmptyState /> : <EmptyStateDark />}
        <div className={styles.title}>
          <DynamicT forKey={title} />
        </div>
        {errorMessage && (
          <div className={styles.message}>{rawMessage ?? <DynamicT forKey={message} />}</div>
        )}
      </div>
    </StaticPageLayout>
  );
};

export default ErrorPage;
