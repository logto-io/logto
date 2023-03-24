import type { FormEventHandler, KeyboardEventHandler } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import SearchIcon from '@/assets/images/search.svg';

import * as styles from './index.module.scss';
import Button from '../Button';
import TextInput from '../TextInput';

type Props = {
  defaultValue?: string;
  isClearable?: boolean;
  placeholder?: string;
  inputClassName?: string;
  onSearch?: (value: string) => void;
  onClearSearch?: () => void;
};

function Search({
  defaultValue = '',
  isClearable = false,
  placeholder,
  inputClassName,
  onSearch,
  onClearSearch,
}: Props) {
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
      <TextInput
        className={inputClassName}
        value={inputValue}
        icon={<SearchIcon className={styles.searchIcon} />}
        placeholder={placeholder}
        onChange={handleSearchChange}
        onKeyPress={handleSearchKeyPress}
      />
      <Button title="general.search" onClick={handleClick} />
      {isClearable && (
        <Button size="small" type="text" title="general.clear_result" onClick={onClearSearch} />
      )}
    </div>
  );
}

export default Search;
