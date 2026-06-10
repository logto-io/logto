import { type AdminConsoleKey } from '@logto/phrases';

import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import ActionMenu from '@/ds-components/ActionMenu';
import { type Props as ButtonProps } from '@/ds-components/Button';
import { DropdownItem } from '@/ds-components/Dropdown';
import DynamicT from '@/ds-components/DynamicT';

import styles from './index.module.scss';
import { RuleType } from './types';

const ruleTypeOptions = Object.freeze([
  {
    type: RuleType.Users,
    title: 'application_details.access_control.rule_users',
  },
  {
    type: RuleType.UserRoles,
    title: 'application_details.access_control.rule_user_roles',
  },
  {
    type: RuleType.Organizations,
    title: 'application_details.access_control.rule_organizations',
  },
  {
    type: RuleType.OrganizationRoles,
    title: 'application_details.access_control.rule_organization_roles',
  },
] satisfies Array<{
  type: RuleType;
  title: AdminConsoleKey;
}>);

type Props = {
  readonly hasRules: boolean;
  readonly onSelect: (type: RuleType) => void;
};

function AddRuleMenu({ hasRules, onSelect }: Props) {
  const buttonProps: ButtonProps = hasRules
    ? {
        type: 'text',
        size: 'small',
        title: 'general.add_another',
        icon: <CirclePlus />,
      }
    : {
        type: 'default',
        size: 'medium',
        title: 'application_details.access_control.add_rules',
        icon: <Plus className={styles.plusIcon} />,
      };

  return (
    <ActionMenu
      buttonProps={buttonProps}
      dropdownHorizontalAlign="start"
      dropdownClassName={styles.dropdown}
    >
      {ruleTypeOptions.map(({ type, title }) => (
        <DropdownItem
          key={type}
          onClick={() => {
            onSelect(type);
          }}
        >
          <DynamicT forKey={title} />
        </DropdownItem>
      ))}
    </ActionMenu>
  );
}

export default AddRuleMenu;
