import { type TenantTag } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo, useRef, useState } from 'react';

import CaretDown from '@/assets/icons/caret-down.svg?react';
import Tick from '@/assets/icons/tick.svg?react';
import { RegionFlag } from '@/components/Region';
import Dropdown, { DropdownItem } from '@/ds-components/Dropdown';

import styles from './index.module.scss';

type InstanceOption = {
  id: string;
  name: string;
  country: string;
  tags: TenantTag[];
};

type Props = {
  readonly instances: InstanceOption[];
  readonly value: string;
  readonly onChange: (instanceId: string) => void;
  readonly isDisabled?: boolean;
  readonly className?: string;
  readonly setTenantTagInForm: (tag: TenantTag) => void;
};

function InstanceSelector({
  instances,
  value,
  onChange,
  isDisabled = false,
  className,
  setTenantTagInForm,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedInstance = useMemo(
    () => instances.find((instance) => instance.id === value),
    [instances, value]
  );

  if (!selectedInstance) {
    return null;
  }

  return (
    <div className={classNames(styles.container, className)}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.triggerButton}
        disabled={isDisabled}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <div className={styles.selectedContent}>
          <RegionFlag regionName={selectedInstance.country} width={20} />
          <span className={styles.instanceName}>{selectedInstance.name}</span>
        </div>
        <CaretDown className={styles.icon} />
      </button>
      <Dropdown
        isFullWidth
        anchorRef={buttonRef}
        isOpen={isOpen}
        className={styles.dropdownContent}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        {instances.map((instance) => (
          <DropdownItem
            key={instance.id}
            onClick={() => {
              onChange(instance.id);
              setIsOpen(false);
              if (instance.tags[0]) {
                setTenantTagInForm(instance.tags[0]);
              }
            }}
          >
            <div className={styles.instanceOption}>
              <Tick
                className={classNames(styles.checkIcon, instance.id === value && styles.visible)}
              />
              <RegionFlag regionName={instance.country} width={20} />
              <span className={classNames(instance.id === value && styles.selectedName)}>
                {instance.name}
              </span>
            </div>
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}

export default InstanceSelector;
