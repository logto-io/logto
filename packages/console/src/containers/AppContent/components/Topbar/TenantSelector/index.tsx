import { type TenantInfo } from '@logto/schemas/models';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import KeyboardArrowDown from '@/assets/icons/keyboard-arrow-down.svg';
import PlusSign from '@/assets/icons/plus.svg';
import Tick from '@/assets/icons/tick.svg';
import CreateTenantModal from '@/cloud/pages/Main/TenantLandingPage/TenantLandingPageContent/CreateTenantModal';
import AppError from '@/components/AppError';
import Divider from '@/ds-components/Divider';
import Dropdown, { DropdownItem } from '@/ds-components/Dropdown';
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

  if (!tenants?.length || !currentTenantInfo) {
    return null;
  }

  const isCreateButtonDisabled = tenants.length >= 3;

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
        <div className={styles.name}>{currentTenantInfo.name}</div>
        <TenantEnvTag className={styles.tag} tag={currentTenantInfo.tag} />
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
          className={classNames(
            isCreateButtonDisabled && styles.disabled,
            styles.createTenantButton
          )}
          onClick={() => {
            if (isCreateButtonDisabled) {
              return;
            }
            setShowCreateTenantModal(true);
          }}
          onKeyDown={onKeyDownHandler(() => {
            if (isCreateButtonDisabled) {
              return;
            }
            setShowCreateTenantModal(true);
          })}
        >
          <div>{t('cloud.tenant.create_tenant')}</div>
          <PlusSign />
        </div>
      </Dropdown>
      <CreateTenantModal
        isOpen={showCreateTenantModal}
        onClose={async (tenant?: TenantInfo) => {
          if (tenant) {
            toast.success(t('tenants.tenant_created', { name: tenant.name }));
            void mutate();
            window.location.assign(new URL(`/${tenant.id}`, window.location.origin).toString());
          }
          setShowCreateTenantModal(false);
        }}
      />
    </>
  );
}

export default TenantSelector;
