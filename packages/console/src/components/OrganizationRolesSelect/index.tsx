import { type OrganizationScope } from '@logto/schemas';
import classNames from 'classnames';

import RoleIcon from '@/assets/icons/role-feature.svg';
import MultiSelect, { type Option } from '@/ds-components/Select/MultiSelect';
import useSearchValues from '@/hooks/use-search-values';

import Breakable from '../Breakable';
import ThemedIcon from '../ThemedIcon';

import * as styles from './index.module.scss';

type RoleOptionProps = {
  readonly title?: string;
  readonly value: string;
  readonly size?: 'small' | 'large';
};

export function RoleOption({ title, value, size = 'small' }: RoleOptionProps) {
  return (
    <div className={classNames(styles.roleOption, size === 'large' && styles.large)}>
      <ThemedIcon for={RoleIcon} size={size === 'small' ? 16 : 40} />
      <Breakable>{title ?? value}</Breakable>
    </div>
  );
}

type Props = {
  readonly value: Array<Option<string>>;
  readonly onChange: (value: Array<Option<string>>) => void;
  readonly keyword: string;
  readonly setKeyword: (keyword: string) => void;
};

function OrganizationRolesSelect({ value, onChange, keyword, setKeyword }: Props) {
  const { data: scopes, isLoading } = useSearchValues<OrganizationScope>(
    'api/organization-roles',
    keyword
  );

  return (
    <MultiSelect
      value={value}
      options={scopes.map(({ id, name }) => ({ value: id, title: name }))}
      placeholder="organizations.search_role_placeholder"
      isOptionsLoading={isLoading}
      renderOption={RoleOption}
      onChange={onChange}
      onSearch={setKeyword}
    />
  );
}

export default OrganizationRolesSelect;
