import classNames from 'classnames';

import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import ConnectorLogo from '@/components/ConnectorLogo';
import UnnamedTrans from '@/components/UnnamedTrans';
import ActionMenu from '@/ds-components/ActionMenu';
import type { Props as ButtonProps } from '@/ds-components/Button';
import { DropdownItem } from '@/ds-components/Dropdown';
import ConnectorPlatformIcon from '@/icons/ConnectorPlatformIcon';
import type { ConnectorGroup } from '@/types/connector';

import styles from './index.module.scss';

type Props = {
  readonly options: ConnectorGroup[];
  readonly onSelected: (signInIdentifier: string) => void;
  readonly hasSelectedConnectors: boolean;
};

function AddButton({ options, onSelected, hasSelectedConnectors }: Props) {
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
    >
      {options.map(({ target, logo, logoDark, name, connectors }) => (
        <DropdownItem
          key={target}
          onClick={() => {
            onSelected(target);
          }}
        >
          <div className={styles.title}>
            <ConnectorLogo data={{ logo, logoDark }} size="small" />
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
}

export default AddButton;
