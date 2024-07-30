import { type AdminConsoleKey } from '@logto/phrases';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import type { ChangeEvent, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Search from '@/assets/icons/search.svg?react';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import { defaultPageSize } from '@/consts';
import DynamicT from '@/ds-components/DynamicT';
import Pagination from '@/ds-components/Pagination';
import TextInput from '@/ds-components/TextInput';
import type { RequestError } from '@/hooks/use-api';
import useDebounce from '@/hooks/use-debounce';
import transferLayout from '@/scss/transfer.module.scss';
import { type Identifiable } from '@/types/general';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import SourceEntityItem from '../SourceEntityItem';

import styles from './index.module.scss';

type SearchProps = {
  pathname: string;
  parameters?: Record<string, string>;
};

export type Props<T> = {
  readonly searchProps: SearchProps;
  readonly onChange: (value: T[]) => void;
  readonly selectedEntities: T[];
  readonly emptyPlaceholder: AdminConsoleKey;
  readonly renderEntity: (entity: T) => ReactNode;
};

const pageSize = defaultPageSize;

function SourceEntitiesBox<T extends Identifiable>({
  searchProps: { pathname, parameters },
  selectedEntities,
  onChange,
  emptyPlaceholder,
  renderEntity,
}: Props<T>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const debounce = useDebounce();

  const commonSearchParams = {
    page: String(page),
    page_size: String(pageSize),
    ...conditional(keyword && { search: formatSearchKeyword(keyword) }),
  };

  const { data, error } = useSWR<[T[], number], RequestError>(
    buildUrl(pathname, { ...parameters, ...commonSearchParams })
  );

  const isLoading = !data && !error;

  const [dataSource = [], totalCount] = data ?? [];

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    debounce(() => {
      setPage(1);
      setKeyword(event.target.value);
    });
  };

  const isEntityAdded = (entity: T) =>
    selectedEntities.findIndex(({ id }) => id === entity.id) >= 0;

  const isEmpty = !isLoading && !error && dataSource.length === 0;

  return (
    <div className={transferLayout.box}>
      <div className={transferLayout.boxTopBar}>
        <TextInput
          className={styles.search}
          icon={<Search className={styles.icon} />}
          placeholder={t('general.search_placeholder')}
          onChange={handleSearchInput}
        />
      </div>
      <div
        className={classNames(transferLayout.boxContent, isEmpty && transferLayout.emptyBoxContent)}
      >
        {isEmpty ? (
          <EmptyDataPlaceholder size="small" title={<DynamicT forKey={emptyPlaceholder} />} />
        ) : (
          dataSource.map((entity) => {
            const isSelected = isEntityAdded(entity);

            return (
              <SourceEntityItem
                key={entity.id}
                entity={entity}
                isSelected={isSelected}
                render={renderEntity}
                onSelect={() => {
                  onChange(
                    isSelected
                      ? selectedEntities.filter(({ id }) => entity.id !== id)
                      : [entity, ...selectedEntities]
                  );
                }}
              />
            );
          })
        )}
      </div>
      <Pagination
        mode="pico"
        page={page}
        totalCount={totalCount}
        pageSize={pageSize}
        className={transferLayout.boxPagination}
        onChange={(page) => {
          setPage(page);
        }}
      />
    </div>
  );
}
export default SourceEntitiesBox;
