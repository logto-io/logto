import React, { FormEventHandler, KeyboardEventHandler, useState } from 'react';

import SearchIcon from '@/icons/Search';

import Button from '../Button';
import TextInput from '../TextInput';
import * as styles from './index.module.scss';

type Props = {
  defaultValue?: string;
  onSearch?: (value: string) => void;
};

const Search = ({ defaultValue = '', onSearch }: Props) => {
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
    if (inputValue) {
      onSearch?.(inputValue);
    }
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
      <Button title="general.search" onClick={handleClick} />
    </div>
  );
};

export default Search;
