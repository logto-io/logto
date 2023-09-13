import type { Application, User } from '@logto/schemas';
import { ApplicationType, RoleType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Search from '@/assets/icons/search.svg';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import { defaultPageSize } from '@/consts';
import Pagination from '@/ds-components/Pagination';
import TextInput from '@/ds-components/TextInput';
import type { RequestError } from '@/hooks/use-api';
import useDebounce from '@/hooks/use-debounce';
import * as transferLayout from '@/scss/transfer.module.scss';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

import SourceEntityItem from '../SourceEntityItem';

import * as styles from './index.module.scss';

type Props<T> = {
  roleId: string;
  roleType: RoleType;
  onChange: (value: T[]) => void;
  selectedEntities: T[];
};

const pageSize = defaultPageSize;

function SourceEntitiesBox<T extends User | Application>({
  roleId,
  roleType,
  selectedEntities,
  onChange,
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

  const { data, error } = useSWR<[Props<T>['selectedEntities'], number], RequestError>(
    roleType === RoleType.User
      ? buildUrl('api/users', {
          excludeRoleId: roleId,
          ...commonSearchParams,
        })
      : buildUrl(`api/applications`, {
          ...commonSearchParams,
          'search.type': ApplicationType.MachineToMachine,
          'mode.type': 'exact',
        })
  );

  const isLoading = !data && !error;

  const [dataSource = [], totalCount] = data ?? [];

  const handleSearchInput = (event: ChangeEvent<HTMLInputElement>) => {
    debounce(() => {
      setPage(1);
      setKeyword(event.target.value);
    });
  };

  const isEntityAdded = (entity: User | Application) =>
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
          <EmptyDataPlaceholder
            size="small"
            title={t(
              roleType === RoleType.User
                ? 'role_details.users.empty'
                : 'role_details.applications.empty'
            )}
          />
        ) : (
          dataSource.map((entity) => {
            const isSelected = isEntityAdded(entity);

            return (
              <SourceEntityItem
                key={entity.id}
                entity={entity}
                isSelected={isSelected}
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
