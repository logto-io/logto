import { LogtoInlineHookKey } from '@logto/schemas';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import PageMeta from '@/components/PageMeta';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import { inlineHookCatalog } from '../constants';
import { InlineHookAction } from '../types';
import { getInlineHookApiPath, invalidateInlineHookCache, inlineHooksPath } from '../utils';

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
  const { navigate } = useTenantPathname();
  const { show } = useConfirmModal();
  const api = useApi();
  const { mutate: globalMutate } = useSWRConfig();
  const { isLoading, error, data, mutate } = useDataFetch(hookType, action);
  const [isMonacoLoaded, setIsMonacoLoaded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const catalogItem = inlineHookCatalog.find((item) => item.hookType === hookType);
  const titleKey = catalogItem?.name ?? 'inline_hooks.title';
  const subtitleKey = catalogItem?.description;

  const codeEditorContextValue = useMemo(
    () => ({ isMonacoLoaded, setIsMonacoLoaded }),
    [isMonacoLoaded]
  );

  const shouldShowNotFound =
    action === InlineHookAction.Edit && !isLoading && (error?.status === 404 || !data);

  const shouldShowSecurityWarning = hookType === LogtoInlineHookKey.PostFirstFactorVerification;

  const handleDelete = async () => {
    if (action !== InlineHookAction.Edit || isDeleting) {
      return;
    }

    const [result] = await show({
      ModalContent: t('inline_hooks.delete_modal_content'),
      title: 'inline_hooks.delete_modal_title',
      confirmButtonText: 'general.delete',
    });

    if (!result) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(getInlineHookApiPath(hookType));
      await invalidateInlineHookCache(globalMutate, hookType);
      toast.success(t('inline_hooks.deleted'));
      navigate(inlineHooksPath);
    } finally {
      setIsDeleting(false);
    }
  };

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
            <DetailsPageHeader
              title={<DynamicT forKey={titleKey} />}
              subtitle={subtitleKey ? <DynamicT forKey={subtitleKey} /> : undefined}
              statusTag={
                data
                  ? {
                      status: data.enabled ? 'success' : 'info',
                      text: data.enabled
                        ? 'inline_hooks.status.enabled'
                        : 'inline_hooks.status.disabled',
                    }
                  : {
                      status: 'info',
                      text: 'inline_hooks.status.not_configured',
                    }
              }
              actionMenuItems={
                action === InlineHookAction.Edit
                  ? [
                      {
                        type: 'danger',
                        title: 'general.delete',
                        icon: <Delete />,
                        onClick: () => {
                          void handleDelete();
                        },
                      },
                    ]
                  : undefined
              }
            />
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
