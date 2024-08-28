import { type IdTokenClaims, useLogto } from '@logto/react';
import { TenantRole, getTenantIdFromOrganizationId } from '@logto/schemas';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import AppLoading from '@/components/AppLoading';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import ModalLayout from '@/ds-components/ModalLayout';

import * as styles from '../../index.module.scss';
import FinalConfirmationModal from '../FinalConfirmationModal';
import TenantsList from '../TenantsList';

type RoleMap = { [key in string]?: string[] };

/**
 * Given a list of organization roles from the user's claims, returns a tenant ID - role names map.
 * A user may have multiple roles in the same tenant.
 */
const getRoleMap = (organizationRoles: string[]) =>
  organizationRoles.reduce<RoleMap>((accumulator, value) => {
    const [organizationId, roleName] = value.split(':');

    if (!organizationId || !roleName) {
      return accumulator;
    }

    const tenantId = getTenantIdFromOrganizationId(organizationId);

    if (!tenantId) {
      return accumulator;
    }

    return {
      ...accumulator,
      [tenantId]: [...(accumulator[tenantId] ?? []), roleName],
    };
  }, {});

type Props = {
  readonly onClose: () => void;
};

/** A display component for the account deletion confirmation. */
export default function DeletionConfirmationModal({ onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.profile.delete_account' });
  const [isFinalConfirmationOpen, setIsFinalConfirmationOpen] = useState(false);
  const [claims, setClaims] = useState<IdTokenClaims>();
  const { getIdTokenClaims } = useLogto();
  const { tenants } = useContext(TenantsContext);

  useEffect(() => {
    const fetchRoleMap = async () => {
      setClaims(undefined);
      const claims = await getIdTokenClaims();

      if (!claims) {
        toast.error(t('error_occurred'));
        onClose();
        return;
      }

      setClaims(claims);
    };

    void fetchRoleMap();
  }, [getIdTokenClaims, onClose, t]);

  const roleMap = claims && getRoleMap(claims.organization_roles ?? []);
  const tenantsToDelete = tenants.filter(({ id }) => roleMap?.[id]?.includes(TenantRole.Admin));
  const tenantsToQuit = tenants.filter(({ id }) =>
    tenantsToDelete.every(({ id: tenantId }) => tenantId !== id)
  );

  if (!claims) {
    return <AppLoading />;
  }

  return (
    <ModalLayout
      title="profile.delete_account.label"
      footer={
        <>
          <Button size="large" title="general.cancel" onClick={onClose} />
          <Button
            size="large"
            type="danger"
            title="general.delete"
            onClick={() => {
              setIsFinalConfirmationOpen(true);
            }}
          />
        </>
      }
    >
      {isFinalConfirmationOpen && (
        <FinalConfirmationModal
          userId={claims.sub}
          tenantsToDelete={tenantsToDelete}
          tenantsToQuit={tenantsToQuit}
          onClose={() => {
            setIsFinalConfirmationOpen(false);
          }}
        />
      )}
      <div className={styles.container}>
        <p>{t('p.check_information')}</p>
        {tenantsToDelete.length > 0 && (
          <TenantsList
            description={t('p.has_admin_role', { count: tenantsToDelete.length })}
            tenants={tenantsToDelete}
          />
        )}
        {tenantsToQuit.length > 0 && (
          <TenantsList
            description={t('p.quit_tenant', { count: tenantsToQuit.length })}
            tenants={tenantsToQuit}
          />
        )}
        <p>{t('p.remove_all_data')}</p>
        <p>{t('p.confirm_information')}</p>
      </div>
    </ModalLayout>
  );
}
