import Plus from '@/assets/images/plus.svg';
import ActionMenu from '@/components/ActionMenu';
import type { Props as ButtonProps } from '@/components/Button';
import { DropdownItem } from '@/components/Dropdown';
import UnnamedTrans from '@/components/UnnamedTrans';
import ConnectorPlatformIcon from '@/icons/ConnectorPlatformIcon';
import type { ConnectorGroup } from '@/types/connector';

import * as styles from './AddButton.module.scss';

type Props = {
  options: ConnectorGroup[];
  onSelected: (signInIdentifier: string) => void;
  hasSelectedConnectors: boolean;
};

const AddButton = ({ options, onSelected, hasSelectedConnectors }: Props) => {
  if (options.length === 0) {
    return null;
  }

  const addSocialConnectorButtonProps: ButtonProps = {
    type: 'default',
    size: 'medium',
    title: 'sign_in_exp.sign_up_and_sign_in.social_sign_in.add_social_connector',
    icon: <Plus className={styles.plusIcon} />,
  };

  const addAnotherButtonProps: ButtonProps = {
    type: 'text',
    size: 'small',
    title: 'general.add_another',
  };

  return (
    <ActionMenu
      buttonProps={hasSelectedConnectors ? addAnotherButtonProps : addSocialConnectorButtonProps}
      dropdownHorizontalAlign="start"
      dropdownClassName={styles.dropdown}
    >
      {options.map(({ target, logo, name, connectors }) => (
        <DropdownItem
          key={target}
          onClick={() => {
            onSelected(target);
          }}
        >
          <div className={styles.title}>
            <img src={logo} alt={target} className={styles.logo} />
            <UnnamedTrans resource={name} className={styles.name} />
            {connectors.length > 1 &&
              connectors
                .filter(({ enabled }) => enabled)
                .map(({ platform }) => (
                  <div key={platform} className={styles.icon}>
                    {platform && <ConnectorPlatformIcon platform={platform} />}
                  </div>
                ))}
          </div>
        </DropdownItem>
      ))}
    </ActionMenu>
  );
};

export default AddButton;
