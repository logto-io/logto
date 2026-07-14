import { useMemo } from 'react';
import useSWR from 'swr';

import PageMeta from '@/components/PageMeta';
import RequestDataError from '@/components/RequestDataError';
import CardTitle from '@/ds-components/CardTitle';
import { type RequestError } from '@/hooks/use-api';
import pageLayout from '@/scss/page-layout.module.scss';

import InlineHookCard from './InlineHookCard';
import Skeleton from './Skeleton';
import { inlineHookCatalog } from './constants';
import styles from './index.module.scss';
import { type InlineHookConfig } from './types';
import { inlineHooksSWRKey } from './utils';

function InlineHooks() {
  const { data, error, mutate } = useSWR<InlineHookConfig[], RequestError>(inlineHooksSWRKey);
  const isLoading = !data && !error;

  const configsByHookType = useMemo(
    () => new Map(data?.map((config) => [config.key, config])),
    [data]
  );

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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InlineHooks;
