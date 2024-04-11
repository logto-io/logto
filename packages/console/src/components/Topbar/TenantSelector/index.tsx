import { OrganizationInvitationStatus } from '@logto/schemas';
import { useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import KeyboardArrowDown from '@/assets/icons/keyboard-arrow-down.svg';
import PlusSign from '@/assets/icons/plus.svg';
import { type TenantResponse } from '@/cloud/types/router';
import CreateTenantModal from '@/components/CreateTenantModal';
import TenantEnvTag from '@/components/TenantEnvTag';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Divider from '@/ds-components/Divider';
import Dropdown from '@/ds-components/Dropdown';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useUserDefaultTenantId from '@/hooks/use-user-default-tenant-id';
import useUserInvitations from '@/hooks/use-user-invitations';
import { onKeyDownHandler } from '@/utils/a11y';

import TenantDropdownItem from './TenantDropdownItem';
import TenantInvitationDropdownItem from './TenantInvitationDropdownItem';
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
  const { data: pendingInvitations } = useUserInvitations(OrganizationInvitationStatus.Pending);

  const anchorRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);
  const { updateDefaultTenantId } = useUserDefaultTenantId();

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
        <TenantEnvTag tag={currentTenantInfo.tag} />
        {Boolean(pendingInvitations?.length) && <div className={styles.redDot} />}
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
          {tenants.map((tenantData) => (
            <TenantDropdownItem
              key={tenantData.id}
              tenantData={tenantData}
              isSelected={tenantData.id === currentTenantId}
              onClick={() => {
                navigateTenant(tenantData.id);
                void updateDefaultTenantId(tenantData.id);
                setShowDropdown(false);
              }}
            />
          ))}
          {pendingInvitations?.map((invitation) => (
            <TenantInvitationDropdownItem key={invitation.id} data={invitation} />
          ))}
        </OverlayScrollbar>
        <Divider />
        <button
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
          <PlusSign />
        </button>
      </Dropdown>
      <CreateTenantModal
        isOpen={showCreateTenantModal}
        onClose={async (tenant?: TenantResponse) => {
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
