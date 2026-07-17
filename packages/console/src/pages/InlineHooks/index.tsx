import { type LogtoInlineHookKey } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import PageMeta from '@/components/PageMeta';
import RequestDataError from '@/components/RequestDataError';
import CardTitle from '@/ds-components/CardTitle';
import { type RequestError } from '@/hooks/use-api';
import pageLayout from '@/scss/page-layout.module.scss';

import DeleteConfirmModal from './DeleteConfirmModal';
import InlineHookCard from './InlineHookCard';
import Skeleton from './Skeleton';
import { inlineHookCatalog } from './constants';
import styles from './index.module.scss';
import { type InlineHookConfig } from './types';
import { inlineHooksSWRKey } from './utils';

function InlineHooks() {
  const { data, error, mutate } = useSWR<InlineHookConfig[], RequestError>(inlineHooksSWRKey);
  const isLoading = !data && !error;
  const [deleteModalHookType, setDeleteModalHookType] = useState<LogtoInlineHookKey>();

  const configsByHookType = useMemo(
    () => new Map(data?.map((config) => [config.key, config])),
    [data]
  );

  const onDeleteHandler = useCallback((hookType: LogtoInlineHookKey) => {
    setDeleteModalHookType(hookType);
  }, []);

  return (
    <div className={pageLayout.container}>
      <PageMeta titleKey="inline_hooks.page_title" />
      <div className={pageLayout.headline}>
        <CardTitle title="inline_hooks.title" subtitle="inline_hooks.subtitle" />
      </div>
      <div className={styles.content}>
        {isLoading && <Skeleton />}
        {error && (
          <RequestDataError
            error={error}
            onRetry={() => {
              void mutate();
            }}
          />
        )}
        {data && (
          <div className={styles.cardList}>
            {inlineHookCatalog.map((item) => (
              <InlineHookCard
                key={item.hookType}
                {...item}
                config={configsByHookType.get(item.hookType)}
                onDelete={
                  configsByHookType.has(item.hookType)
                    ? () => {
                        onDeleteHandler(item.hookType);
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
      <DeleteConfirmModal
        isOpen={Boolean(deleteModalHookType)}
        hookType={deleteModalHookType}
        onCancel={() => {
          setDeleteModalHookType(undefined);
        }}
      />
    </div>
  );
}

export default InlineHooks;
