import { type IdTokenClaims, useLogto } from '@logto/react';
import { TenantRole, getTenantIdFromOrganizationId } from '@logto/schemas';
import { useContext, useEffect, useState } from 'react';

import AppLoading from '@/components/AppLoading';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import ModalLayout from '@/ds-components/ModalLayout';

import * as styles from '../../index.module.scss';
import FinalConfirmationModal from '../FinalConfirmationModal';
import TenantsList from '../TenantsList';

type RoleMap = { [key in string]?: string[] };

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

export default function DeletionConfirmationModal() {
  const [isFinalConfirmationOpen, setIsFinalConfirmationOpen] = useState(false);
  const [claims, setClaims] = useState<IdTokenClaims>();
  const { getIdTokenClaims } = useLogto();
  const { tenants } = useContext(TenantsContext);

  useEffect(() => {
    const fetchRoleMap = async () => {
      setClaims(undefined);
      const claims = await getIdTokenClaims();
      setClaims(claims);
    };

    void fetchRoleMap();
  }, [getIdTokenClaims]);

  const roleMap = claims && getRoleMap(claims.organization_roles ?? []);
  const tenantsToDelete = tenants.filter(({ id }) => roleMap?.[id]?.includes(TenantRole.Admin));
  const tenantsToQuit = tenants.filter(({ id }) =>
    tenantsToDelete.every(({ id: tenantId }) => tenantId !== id)
  );

  // TODO: consider the claims is undefined even after the useEffect
  if (!claims) {
    return <AppLoading />;
  }

  return (
    <ModalLayout
      title="profile.delete_account.label"
      footer={
        <>
          <Button size="large" title="general.cancel" />
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
        <p>
          We&apos;re sorry to hear that you want to delete your account. Please check the following
          information carefully before you proceed.
        </p>
        {tenantsToDelete.length > 0 && (
          <TenantsList
            description="Since you have the admin role in the following tenants, they will be deleted along with your account:"
            tenants={tenantsToDelete}
          />
        )}
        {tenantsToQuit.length > 0 && (
          <TenantsList
            description="You are about to quit the following tenants:"
            tenants={tenantsToQuit}
          />
        )}
        <p>
          Deleting your account will permanently remove all data about you in Logto Cloud. So please
          make sure to backup any important data before proceeding.
        </p>
        <p>
          Please confirm that the information above is what you expected. Once you delete your
          account, we will not be able to recover it.
        </p>
      </div>
    </ModalLayout>
  );
}
