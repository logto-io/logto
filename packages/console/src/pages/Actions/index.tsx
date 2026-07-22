import { type LogtoActionKey } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import PageMeta from '@/components/PageMeta';
import RequestDataError from '@/components/RequestDataError';
import CardTitle from '@/ds-components/CardTitle';
import { type RequestError } from '@/hooks/use-api';
import pageLayout from '@/scss/page-layout.module.scss';

import ActionCard from './ActionCard';
import DeleteConfirmModal from './DeleteConfirmModal';
import Skeleton from './Skeleton';
import { actionCatalog } from './constants';
import styles from './index.module.scss';
import { type ActionConfig } from './types';
import { actionsSWRKey } from './utils';

function Actions() {
  const { data, error, mutate } = useSWR<ActionConfig[], RequestError>(actionsSWRKey);
  const isLoading = !data && !error;
  const [deleteModalActionType, setDeleteModalActionType] = useState<LogtoActionKey>();

  const configsByActionType = useMemo(
    () => new Map(data?.map((config) => [config.key, config])),
    [data]
  );

  const onDeleteHandler = useCallback((actionType: LogtoActionKey) => {
    setDeleteModalActionType(actionType);
  }, []);

  return (
    <div className={pageLayout.container}>
      <PageMeta titleKey="actions.page_title" />
      <div className={pageLayout.headline}>
        <CardTitle title="actions.title" subtitle="actions.subtitle" />
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
            {actionCatalog.map((item) => (
              <ActionCard
                key={item.actionType}
                {...item}
                config={configsByActionType.get(item.actionType)}
                onDelete={
                  configsByActionType.has(item.actionType)
                    ? () => {
                        onDeleteHandler(item.actionType);
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
      <DeleteConfirmModal
        isOpen={Boolean(deleteModalActionType)}
        actionType={deleteModalActionType}
        onCancel={() => {
          setDeleteModalActionType(undefined);
        }}
      />
    </div>
  );
}

export default Actions;
