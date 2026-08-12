import { LogtoActionKey } from '@logto/schemas';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import DetailsPage from '@/components/DetailsPage';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import PageMeta from '@/components/PageMeta';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import InlineNotification from '@/ds-components/InlineNotification';

import { actionCatalog } from '../constants';
import { ActionPageMode } from '../types';
import { actionsPath } from '../utils';

import { CodeEditorLoadingContext } from './CodeEditorLoadingContext';
import MainContent from './MainContent';
import PageLoadingSkeleton from './PageLoadingSkeleton';
import styles from './index.module.scss';
import { pageParamsGuard } from './type';
import useDataFetch from './use-data-fetch';

type ContentProps = {
  readonly actionType: LogtoActionKey;
  readonly mode: ActionPageMode;
};

function Content({ actionType, mode }: ContentProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isLoading, error, data, mutate } = useDataFetch(actionType, mode);
  const [isMonacoLoaded, setIsMonacoLoaded] = useState(false);

  const catalogItem = actionCatalog.find((item) => item.actionType === actionType);
  const titleKey = catalogItem?.name ?? 'actions.title';

  const codeEditorContextValue = useMemo(
    () => ({ isMonacoLoaded, setIsMonacoLoaded }),
    [isMonacoLoaded]
  );

  const shouldShowNotFound =
    mode === ActionPageMode.Edit && !isLoading && (error?.status === 404 || !data);

  const shouldShowSecurityWarning = actionType === LogtoActionKey.PostFirstFactorVerification;
  // Script runtime consolidation (Custom JWT & Actions): OSS sandbox warning.
  // Self-hosted scripts are not sandboxed; hide on Cloud (Dynamic Workers).
  const shouldShowSandboxWarning = isDevFeaturesEnabled && !isCloud;
  // Avoid stacking two alerts: merge sandbox + action-specific security copy into one notice.
  const warningPhraseKey =
    shouldShowSandboxWarning && shouldShowSecurityWarning
      ? 'actions.sandbox_and_security_warning'
      : shouldShowSandboxWarning
        ? 'actions.sandbox_warning'
        : shouldShowSecurityWarning
          ? 'actions.security_warning'
          : undefined;

  return (
    <DetailsPage
      backLink={actionsPath}
      backLinkTitle="actions.title"
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
          {warningPhraseKey && (
            <InlineNotification
              hasIcon
              severity="alert"
              className={isMonacoLoaded ? undefined : styles.hidden}
            >
              <div className={styles.warningTitle}>{t(`${warningPhraseKey}.title`)}</div>
              <div>{t(`${warningPhraseKey}.description`)}</div>
            </InlineNotification>
          )}
          <MainContent
            mode={mode}
            actionType={actionType}
            data={data}
            mutate={mutate}
            className={isMonacoLoaded ? undefined : styles.hidden}
          />
        </CodeEditorLoadingContext.Provider>
      )}
    </DetailsPage>
  );
}

function ActionDetails() {
  const { actionType, mode } = useParams();
  const params = pageParamsGuard.safeParse({ actionType, mode });

  if (!params.success) {
    return <EmptyDataPlaceholder />;
  }

  return <Content actionType={params.data.actionType} mode={params.data.mode} />;
}

export default ActionDetails;
