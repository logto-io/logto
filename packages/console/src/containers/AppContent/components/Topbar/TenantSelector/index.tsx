import { adminTenantId } from '@logto/schemas';
import { type TenantInfo } from '@logto/schemas/models';
import classNames from 'classnames';
import { useContext, useRef, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import KeyboardArrowDown from '@/assets/icons/keyboard-arrow-down.svg';
import PlusSign from '@/assets/icons/plus.svg';
import Tick from '@/assets/icons/tick.svg';
import { useCloudSwr } from '@/cloud/hooks/use-cloud-swr';
import CreateTenantModal from '@/cloud/pages/Main/TenantLandingPage/TenantLandingPageContent/CreateTenantModal';
import AppError from '@/components/AppError';
import { maxFreeTenantNumbers } from '@/consts/tenants';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Divider from '@/ds-components/Divider';
import Dropdown, { DropdownItem } from '@/ds-components/Dropdown';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import { onKeyDownHandler } from '@/utils/a11y';

import TenantEnvTag from './TenantEnvTag';
import * as styles from './index.module.scss';

function TenantSelector() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { tenants, setTenants, currentTenantId } = useContext(TenantsContext);
  const { data: availableTenants, mutate, error } = useCloudSwr('/api/tenants');

  useEffect(() => {
    if (availableTenants) {
      setTenants(availableTenants);
    }
  }, [availableTenants, setTenants]);

  const currentTenantInfo = useMemo(() => {
    return tenants?.find((tenant) => tenant.id === currentTenantId);
  }, [currentTenantId, tenants]);

  const isCreateButtonDisabled = useMemo(
    () =>
      /** Should not block admin tenant owners from creating more than three tenants */
      tenants &&
      !tenants.map(({ id }) => id).includes(adminTenantId) &&
      tenants.length >= maxFreeTenantNumbers,
    [tenants]
  );

  const anchorRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateTenantModal, setShowCreateTenantModal] = useState(false);

  if (error) {
    return <AppError errorMessage={error.message} callStack={error.stack} />;
  }

  if (!tenants?.length || !currentTenantInfo) {
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
        </OverlayScrollbar>
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
