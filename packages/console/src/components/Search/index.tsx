import React, { FormEventHandler, KeyboardEventHandler, useState } from 'react';

import SearchIcon from '@/icons/Search';

import Button from '../Button';
import TextInput from '../TextInput';
import * as styles from './index.module.scss';

type Props = {
  defaultValue?: string;
  isClearable?: boolean;
  onSearch?: (value: string) => void;
  onClearSearch?: () => void;
};

const Search = ({ defaultValue = '', isClearable = false, onSearch, onClearSearch }: Props) => {
  const [inputValue, setInputValue] = useState<string>(defaultValue);

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
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
        />
      </div>
      <Button title="admin_console.general.search" onClick={handleClick} />
      {isClearable && (
        <Button
          size="small"
          type="plain"
          title="admin_console.general.clear_result"
          onClick={onClearSearch}
        />
      )}
    </div>
  );
};

export default Search;
