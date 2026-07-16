import { LogtoInlineHookKey } from '@logto/schemas';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import DetailsPage from '@/components/DetailsPage';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import PageMeta from '@/components/PageMeta';
import InlineNotification from '@/ds-components/InlineNotification';

import { inlineHookCatalog } from '../constants';
import { InlineHookAction } from '../types';
import { inlineHooksPath } from '../utils';

import { CodeEditorLoadingContext } from './CodeEditorLoadingContext';
import MainContent from './MainContent';
import PageLoadingSkeleton from './PageLoadingSkeleton';
import styles from './index.module.scss';
import { pageParamsGuard } from './type';
import useDataFetch from './use-data-fetch';

type ContentProps = {
  readonly hookType: LogtoInlineHookKey;
  readonly action: InlineHookAction;
};

function Content({ hookType, action }: ContentProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isLoading, error, data, mutate } = useDataFetch(hookType, action);
  const [isMonacoLoaded, setIsMonacoLoaded] = useState(false);

  const catalogItem = inlineHookCatalog.find((item) => item.hookType === hookType);
  const titleKey = catalogItem?.name ?? 'inline_hooks.title';

  const codeEditorContextValue = useMemo(
    () => ({ isMonacoLoaded, setIsMonacoLoaded }),
    [isMonacoLoaded]
  );

  const shouldShowNotFound =
    action === InlineHookAction.Edit && !isLoading && (error?.status === 404 || !data);

  const shouldShowSecurityWarning = hookType === LogtoInlineHookKey.PostFirstFactorVerification;

  return (
    <DetailsPage
      backLink={inlineHooksPath}
      backLinkTitle="inline_hooks.title"
      isLoading={isLoading}
      error={error && error.status !== 404 ? error : undefined}
      className={styles.container}
      onRetry={() => {
        void mutate();
      }}
    >
      <PageMeta titleKey={titleKey} />
      {(isLoading || (!shouldShowNotFound && !isMonacoLoaded)) && <PageLoadingSkeleton />}
      {shouldShowNotFound && <EmptyDataPlaceholder />}
      {!isLoading && !shouldShowNotFound && (
        <CodeEditorLoadingContext.Provider value={codeEditorContextValue}>
          <div className={isMonacoLoaded ? undefined : styles.hidden}>
            {shouldShowSecurityWarning && (
              <InlineNotification hasIcon severity="alert" className={styles.warning}>
                <div className={styles.warningTitle}>
                  {t('inline_hooks.security_warning.title')}
                </div>
                <div>{t('inline_hooks.security_warning.description')}</div>
              </InlineNotification>
            )}
            <MainContent action={action} hookType={hookType} data={data} mutate={mutate} />
          </div>
        </CodeEditorLoadingContext.Provider>
      )}
    </DetailsPage>
  );
}

function InlineHookDetails() {
  const { hookType, action } = useParams();
  const params = pageParamsGuard.safeParse({ hookType, action });

  if (!params.success) {
    return <EmptyDataPlaceholder />;
  }

  return <Content hookType={params.data.hookType} action={params.data.action} />;
}

export default InlineHookDetails;
