import { type TenantInfo, TenantTag } from '@logto/schemas/models';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import KeyboardArrowDown from '@/assets/images/keyboard-arrow-down.svg';
import PlusSign from '@/assets/images/plus.svg';
import Tick from '@/assets/images/tick.svg';
import CreateTenantModal from '@/cloud/pages/Main/CreateTenantModal';
import AppError from '@/components/AppError';
import Divider from '@/components/Divider';
import Dropdown, { DropdownItem } from '@/components/Dropdown';
import useTenants from '@/hooks/use-tenants';
import { onKeyDownHandler } from '@/utils/a11y';

import TenantEnvTag from './TenantEnvTag';
import * as styles from './index.module.scss';

function TenantSelector() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    tenants,
    currentTenant: currentTenantInfo,
    currentTenantId,
    error,
    mutate,
  } = useTenants();

  const anchorRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);

  if (error) {
    return <AppError errorMessage={error.message} callStack={error.stack} />;
  }

  if (!tenants?.length) {
    return null;
  }

  return (
    <>
      <div
        ref={anchorRef}
        tabIndex={0}
        className={styles.currentTenantCard}
        role="button"
        onKeyDown={onKeyDownHandler(() => {
          setShowDropdown(true);
        })}
        onClick={() => {
          setShowDropdown(true);
        }}
      >
        <div className={styles.name}>{currentTenantInfo?.name ?? 'My project'}</div>
        <TenantEnvTag
          className={styles.tag}
          tag={currentTenantInfo?.tag ?? TenantTag.Development}
        />
        <KeyboardArrowDown className={styles.arrowIcon} />
      </div>
      <Dropdown
        hasOverflowContent
        className={styles.dropdown}
        anchorRef={anchorRef}
        isOpen={showDropdown}
        horizontalAlign="start"
        onClose={() => {
          setShowDropdown(false);
        }}
      >
        {tenants.map(({ id, name, tag }) => (
          <DropdownItem
            key={id}
            className={styles.dropdownItem}
            onClick={() => {
              window.open(new URL(`/${id}`, window.location.origin).toString(), '_self');
            }}
          >
            <div className={styles.dropdownName}>{name}</div>
            <TenantEnvTag className={styles.dropdownTag} tag={tag} />
            <Tick
              className={classNames(styles.checkIcon, id === currentTenantId && styles.visible)}
            />
          </DropdownItem>
        ))}
        <Divider />
        <div
          role="button"
          tabIndex={0}
          className={styles.createTenantButton}
          onClick={() => {
            setShowCreateTenantModal(true);
          }}
          onKeyDown={onKeyDownHandler(() => {
            setShowCreateTenantModal(true);
          })}
        >
          <div>{t('cloud.tenant.create_tenant')}</div>
          <PlusSign className={styles.icon} />
        </div>
      </Dropdown>
      <CreateTenantModal
        isOpen={showCreateTenantModal}
        onClose={async (tenant?: TenantInfo) => {
          if (tenant) {
            toast.success(t('tenants.tenant_created', { name: tenant.name }));
            void mutate();
          }
          setShowCreateTenantModal(false);
        }}
      />
    </>
  );
}

export default TenantSelector;
