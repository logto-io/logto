import type { FormEventHandler, KeyboardEventHandler } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import SearchIcon from '@/assets/images/search.svg';

import Button from '../Button';
import TextInput from '../TextInput';
import * as styles from './index.module.scss';

type Props = {
  defaultValue?: string;
  isClearable?: boolean;
  placeholder?: string;
  onSearch?: (value: string) => void;
  onClearSearch?: () => void;
};

const Search = ({
  defaultValue = '',
  isClearable = false,
  placeholder,
  onSearch,
  onClearSearch,
}: Props) => {
  const [inputValue, setInputValue] = useState<string>(defaultValue);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const handleSearchKeyPress: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter' && inputValue) {
      onSearch?.(inputValue);
    }
  };

  const handleSearchChange: FormEventHandler<HTMLInputElement> = (event) => {
    setInputValue(event.currentTarget.value);
  };

  const handleClick = () => {
    onSearch?.(inputValue);
  };

  return (
    <div className={styles.search}>
      <div className={styles.searchInput}>
        <TextInput
          value={inputValue}
          icon={<SearchIcon className={styles.searchIcon} />}
          placeholder={placeholder ?? t('general.search_placeholder')}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
        />
      </div>
      <Button title="general.search" onClick={handleClick} />
      {isClearable && (
        <Button size="small" type="text" title="general.clear_result" onClick={onClearSearch} />
      )}
    </div>
  );
};

export default Search;
