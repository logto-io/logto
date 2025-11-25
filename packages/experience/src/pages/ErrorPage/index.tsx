import { Theme } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useContext } from 'react';

import StaticPageLayout from '@/Layout/StaticPageLayout';
import PageContext from '@/Providers/PageContextProvider/PageContext';
import EmptyStateDark from '@/assets/icons/empty-state-dark.svg?react';
import EmptyState from '@/assets/icons/empty-state.svg?react';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import DynamicT from '@/shared/components/DynamicT';
import NavBar from '@/shared/components/NavBar';
import PageMeta from '@/shared/components/PageMeta';

import SupportInfo from './SupportInfo';
import styles from './index.module.scss';

type Props = {
  readonly title?: TFuncKey;
  readonly message?: TFuncKey;
  readonly rawMessage?: string;
  readonly isNavbarHidden?: boolean;
};

const ErrorPage = ({
  title = 'description.not_found',
  message,
  rawMessage,
  isNavbarHidden,
}: Props) => {
  const { theme } = useContext(PageContext);
  const navigate = useNavigateWithPreservedSearchParams();
  const errorMessage = Boolean(rawMessage ?? message);

  return (
    <StaticPageLayout>
      <PageMeta titleKey={title} />
      {history.length > 1 && (
        <NavBar
          isHidden={isNavbarHidden}
          onBack={() => {
            navigate(-1);
          }}
        />
      )}
      <div className={styles.container}>
        {theme === Theme.Light ? <EmptyState /> : <EmptyStateDark />}
        <div className={styles.title}>
          <DynamicT forKey={title} />
        </div>
        {errorMessage && (
          <div className={styles.message}>{rawMessage ?? <DynamicT forKey={message} />}</div>
        )}
        <SupportInfo />
      </div>
    </StaticPageLayout>
  );
};

export default ErrorPage;
