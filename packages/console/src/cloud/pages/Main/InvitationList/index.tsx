import { OrganizationInvitationStatus } from '@logto/schemas';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Icon from '@/assets/icons/organization-preview.svg';
import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantResponse, type InvitationListResponse } from '@/cloud/types/router';
import CreateTenantModal from '@/components/CreateTenantModal';
import TenantEnvTag from '@/components/TenantEnvTag';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import Spacer from '@/ds-components/Spacer';

import * as styles from './index.module.scss';

type Props = {
  invitations: InvitationListResponse;
};

function InvitationList({ invitations }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const cloudApi = useCloudApi();
  const { prependTenant, navigateTenant } = useContext(TenantsContext);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.title}>{t('invitation.find_your_tenants')}</div>
          <div className={styles.description}>{t('invitation.find_tenants_description')}</div>
          {invitations.map(({ id, organizationId, tenantName, tenantTag }) => (
            <div key={id} className={styles.tenant}>
              <Icon className={styles.icon} />
              <span className={styles.name}>{tenantName}</span>
              <TenantEnvTag isAbbreviated className={styles.tag} tag={tenantTag} />
              <Spacer />
              <Button
                size="small"
                type="primary"
                title="general.join"
                isLoading={isJoining}
                onClick={async () => {
                  setIsJoining(true);
                  try {
                    await cloudApi.patch(`/api/invitations/:invitationId/status`, {
                      params: { invitationId: id },
                      body: { status: OrganizationInvitationStatus.Accepted },
                    });
                    navigateTenant(organizationId.slice(2));
                  } finally {
                    setIsJoining(false);
                  }
                }}
              />
            </div>
          ))}
          <div className={styles.separator}>
            <hr />
            <span>{t('general.or')}</span>
            <hr />
          </div>
          <Button
            size="large"
            type="outline"
            className={styles.createTenantButton}
            title="invitation.create_new_tenant"
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
          />
        </div>
      </div>
      <CreateTenantModal
        isOpen={isCreateModalOpen}
        onClose={async (tenant?: TenantResponse) => {
          if (tenant) {
            prependTenant(tenant);
            navigateTenant(tenant.id);
          }
          setIsCreateModalOpen(false);
        }}
      />
    </>
  );
}

export default InvitationList;
