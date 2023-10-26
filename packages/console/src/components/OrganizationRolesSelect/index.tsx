import { type OrganizationScope } from '@logto/schemas';

import MultiSelect, { type Option } from '@/ds-components/Select/MultiSelect';
import useSearchValues from '@/hooks/use-search-values';

type Props = {
  value: Array<Option<string>>;
  onChange: (value: Array<Option<string>>) => void;
  keyword: string;
  setKeyword: (keyword: string) => void;
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
      placeholder="organizations.search_permission_placeholder"
      isOptionsLoading={isLoading}
      onChange={onChange}
      onSearch={setKeyword}
    />
  );
}

export default OrganizationRolesSelect;
