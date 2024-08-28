import type { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import CirclePlus from '@/assets/icons/circle-plus.svg';
import Plus from '@/assets/icons/plus.svg';
import ActionMenu from '@/ds-components/ActionMenu';
import type { Props as ButtonProps } from '@/ds-components/Button';
import { DropdownItem } from '@/ds-components/Dropdown';

import { signInIdentifierPhrase } from '../../../constants';

import * as styles from './index.module.scss';

type Props = {
  readonly options: SignInIdentifier[];
  readonly onSelected: (signInIdentifier: SignInIdentifier) => void;
  readonly hasSelectedIdentifiers: boolean;
};

function AddButton({ options, onSelected, hasSelectedIdentifiers }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  if (options.length === 0) {
    return null;
  }
  const addSignInMethodButtonProps: ButtonProps = {
    type: 'default',
    size: 'medium',
    title: 'sign_in_exp.sign_up_and_sign_in.sign_in.add_sign_in_method',
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
        hasSelectedIdentifiers
          ? styles.addAnotherSignInMethodDropdown
          : styles.addSignInMethodDropDown
      )}
      isDropdownFullWidth={!hasSelectedIdentifiers}
    >
      {options.map((identifier) => (
        <DropdownItem
          key={identifier}
          onClick={() => {
            onSelected(identifier);
          }}
        >
          {t(signInIdentifierPhrase[identifier])}
        </DropdownItem>
      ))}
    </ActionMenu>
  );
}

export default AddButton;
