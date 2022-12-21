import classNames from 'classnames';

import CirclePlus from '@/assets/images/circle-plus.svg';
import Plus from '@/assets/images/plus.svg';
import ActionMenu from '@/components/ActionMenu';
import type { Props as ButtonProps } from '@/components/Button';
import ConnectorLogo from '@/components/ConnectorLogo';
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
    icon: <CirclePlus />,
  };

  return (
    <ActionMenu
      buttonProps={hasSelectedConnectors ? addAnotherButtonProps : addSocialConnectorButtonProps}
      dropdownHorizontalAlign="start"
      dropdownClassName={classNames(
        hasSelectedConnectors ? styles.addAnotherDropdown : styles.dropdown
      )}
      isDropdownFullWidth={!hasSelectedConnectors}
    >
      {options.map(({ target, logo, logoDark, name, connectors }) => (
        <DropdownItem
          key={target}
          onClick={() => {
            onSelected(target);
          }}
        >
          <div className={styles.title}>
            <ConnectorLogo data={{ logo, logoDark }} className={styles.logo} />
            <UnnamedTrans resource={name} className={styles.name} />
            {connectors.length > 1 &&
              connectors.map(({ platform }) => (
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
