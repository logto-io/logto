import { Theme } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useContext, useMemo } from 'react';

import StaticPageLayout from '@/Layout/StaticPageLayout';
import PageContext from '@/Providers/PageContextProvider/PageContext';
import EmptyStateDark from '@/assets/icons/empty-state-dark.svg?react';
import EmptyState from '@/assets/icons/empty-state.svg?react';
import DynamicT from '@/components/DynamicT';
import NavBar from '@/components/NavBar';
import PageMeta from '@/components/PageMeta';

import SupportInfo from './SupportInfo';
import styles from './index.module.scss';

type Props = {
  readonly title?: TFuncKey;
  readonly message?: TFuncKey;
  readonly rawMessage?: string;
};

const determineErrorKeysBySearchParams = ():
  | { titleKey: TFuncKey; messageKey: TFuncKey }
  | undefined => {
  const searchParams = new URLSearchParams(window.location.search);

  if (searchParams.get('code')?.startsWith('one_time_token.')) {
    return { titleKey: 'error.invalid_link', messageKey: 'error.invalid_link_description' };
  }

  return undefined;
};

/**
 * Error page that accepts data from other pages or directly from the URL params.
 */
const ErrorPage = ({ title = 'description.not_found', message, rawMessage }: Props) => {
  const { theme } = useContext(PageContext);
  const { titleKey = title, messageKey = message } = determineErrorKeysBySearchParams() ?? {};

  const errorMessage = useMemo(
    () => rawMessage ?? <DynamicT forKey={messageKey} />,
    [rawMessage, messageKey]
  );

  return (
    <StaticPageLayout>
      <PageMeta titleKey={titleKey} />
      {history.length > 1 && <NavBar />}
      <div className={styles.container}>
        {theme === Theme.Light ? <EmptyState /> : <EmptyStateDark />}
        <div className={styles.title}>
          <DynamicT forKey={titleKey} />
        </div>
        {errorMessage && <div className={styles.message}>{errorMessage}</div>}
        <SupportInfo />
      </div>
    </StaticPageLayout>
  );
};

export default ErrorPage;
