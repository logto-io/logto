import type { SignInIdentifier, SignUpIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import ActionMenu from '@/ds-components/ActionMenu';
import type { Props as ButtonProps } from '@/ds-components/Button';
import { DropdownItem } from '@/ds-components/Dropdown';

import styles from './index.module.scss';

type MethodsType = 'sign-in' | 'sign-up';

type Options<T> = Array<{
  value: T;
  label: string;
  disabled?: boolean;
}>;

type Props<T> = {
  readonly type: MethodsType;
  readonly options: Options<T>;
  readonly onSelected: (identifier: T) => void;
  readonly hasSelectedIdentifiers: boolean;
};

function IdentifiersAddButton<T extends SignInIdentifier | SignUpIdentifier>({
  type,
  options,
  onSelected,
  hasSelectedIdentifiers,
}: Props<T>) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  if (options.length === 0) {
    return null;
  }
  const addSignInMethodButtonProps: ButtonProps = {
    type: 'default',
    size: 'medium',
    title: `sign_in_exp.sign_up_and_sign_in.sign_in.${
      type === 'sign-in' ? 'add_sign_in_method' : 'add_sign_up_method'
    }`,
    icon: <Plus className={styles.plusIcon} />,
  };

  const addAnotherButtonProps: ButtonProps = {
    type: 'text',
    size: 'small',
    title: 'general.add_another',
    icon: <CirclePlus />,
  };

  return (
    <ActionMenu
      buttonProps={hasSelectedIdentifiers ? addAnotherButtonProps : addSignInMethodButtonProps}
      dropdownHorizontalAlign="start"
      dropdownClassName={classNames(
        hasSelectedIdentifiers ? styles.addAnotherIdentifierDropdown : styles.addIdentifierDropDown
      )}
      isDropdownFullWidth={!hasSelectedIdentifiers}
    >
      {options.map(({ value, label, disabled }) => (
        <DropdownItem
          key={value}
          className={disabled ? styles.disabledDropdownItem : undefined}
          onClick={() => {
            if (disabled) {
              return;
            }
            onSelected(value);
          }}
        >
          {label}
        </DropdownItem>
      ))}
    </ActionMenu>
  );
}

export default IdentifiersAddButton;
