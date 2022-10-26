import type { SignInIdentifier } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { snakeCase } from 'snake-case';

import ActionMenu from '@/components/ActionMenu';
import { DropdownItem } from '@/components/Dropdown';

import * as styles from './index.module.scss';

type Props = {
  options: SignInIdentifier[];
  onSelected: (signInIdentifier: SignInIdentifier) => void;
};

const AddSignInMethodButton = ({ options, onSelected }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  if (options.length === 0) {
    return null;
  }

  const candidates = options.map((identifier) => ({
    value: identifier,
    title: t('sign_in_exp.sign_up_and_sign_in.identifiers', { context: snakeCase(identifier) }),
  }));

  return (
    <ActionMenu
      buttonProps={{
        type: 'text',
        size: 'small',
        title: 'general.add_another',
      }}
      dropdownHorizontalAlign="start"
      dropDownClassName={styles.addSignInMethodDropdown}
    >
      {candidates.map(({ value, title }) => (
        <DropdownItem
          key={value}
          onClick={() => {
            onSelected(value);
          }}
        >
          {title}
        </DropdownItem>
      ))}
    </ActionMenu>
  );
};

export default AddSignInMethodButton;
