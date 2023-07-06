import { adminTenantId, maxFreeTenantLimit } from '@logto/schemas';
import { type TenantInfo } from '@logto/schemas/models';
import classNames from 'classnames';
import { useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import KeyboardArrowDown from '@/assets/icons/keyboard-arrow-down.svg';
import PlusSign from '@/assets/icons/plus.svg';
import Tick from '@/assets/icons/tick.svg';
import CreateTenantModal from '@/cloud/pages/Main/TenantLandingPage/TenantLandingPageContent/CreateTenantModal';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Divider from '@/ds-components/Divider';
import Dropdown, { DropdownItem } from '@/ds-components/Dropdown';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import { onKeyDownHandler } from '@/utils/a11y';

import TenantEnvTag from './TenantEnvTag';
import * as styles from './index.module.scss';

export default function TenantSelector() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    tenants,
    prependTenant,
    currentTenant: currentTenantInfo,
    currentTenantId,
    navigateTenant,
  } = useContext(TenantsContext);

  const isCreateButtonDisabled = useMemo(
    () =>
      /** Should not block admin tenant owners from creating more than three tenants */
      !tenants.some(({ id }) => id === adminTenantId) && tenants.length >= maxFreeTenantLimit,
    [tenants]
  );
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);

  if (tenants.length === 0 || !currentTenantInfo) {
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
        <OverlayScrollbar className={styles.scrollableContent}>
          {tenants.map(({ id, name, tag }) => (
            <DropdownItem
              key={id}
              className={styles.dropdownItem}
              onClick={() => {
                navigateTenant(id);
                setShowDropdown(false);
              }}
            >
              <div className={styles.dropdownName}>{name}</div>
              <TenantEnvTag className={styles.dropdownTag} tag={tag} />
              <Tick
                className={classNames(styles.checkIcon, id === currentTenantId && styles.visible)}
              />
            </DropdownItem>
          ))}
        </OverlayScrollbar>
        <Divider />
        <button
          tabIndex={0}
          className={classNames(
            isCreateButtonDisabled && styles.disabled,
            styles.createTenantButton
          )}
          disabled={isCreateButtonDisabled}
          onClick={() => {
            setShowCreateTenantModal(true);
          }}
          onKeyDown={onKeyDownHandler(() => {
            setShowCreateTenantModal(true);
          })}
        >
          <div>{t('cloud.tenant.create_tenant')}</div>
          <PlusSign />
        </button>
      </Dropdown>
      <CreateTenantModal
        isOpen={showCreateTenantModal}
        onClose={async (tenant?: TenantInfo) => {
          if (tenant) {
            prependTenant(tenant);
            navigateTenant(tenant.id);
          }
          setShowCreateTenantModal(false);
        }}
      />
    </>
  );
}
