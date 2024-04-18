import { type OrganizationScope } from '@logto/schemas';

import MultiSelect, { type Option } from '@/ds-components/Select/MultiSelect';
import useSearchValues from '@/hooks/use-search-values';

import Breakable from '../Breakable';

type Props = {
  readonly value: Array<Option<string>>;
  readonly onChange: (value: Array<Option<string>>) => void;
  readonly keyword: string;
  readonly setKeyword: (keyword: string) => void;
};

function OrganizationScopesSelect({ value, onChange, keyword, setKeyword }: Props) {
  const { data: scopes, isLoading } = useSearchValues<OrganizationScope>(
    'api/organization-scopes',
    keyword
  );

  return (
    <MultiSelect
      value={value}
      options={scopes.map(({ id, name }) => ({ value: id, title: name }))}
      placeholder="organizations.search_permission_placeholder"
      isOptionsLoading={isLoading}
      renderOption={({ title, value }) => <Breakable>{title ?? value}</Breakable>}
      onChange={onChange}
      onSearch={setKeyword}
    />
  );
}

export default OrganizationScopesSelect;
