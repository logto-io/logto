import { OrganizationInvitationStatus, getTenantIdFromOrganizationId } from '@logto/schemas';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import OrganizationIcon from '@/assets/icons/organization-preview.svg';
import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type InvitationListResponse } from '@/cloud/types/router';
import TenantEnvTag from '@/components/TenantEnvTag';
import ThemedIcon from '@/components/ThemedIcon';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import Spacer from '@/ds-components/Spacer';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import useUserOnboardingData from '@/onboarding/hooks/use-user-onboarding-data';

import * as styles from './index.module.scss';

type Props = {
  invitations: InvitationListResponse;
};

function InvitationList({ invitations }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const cloudApi = useCloudApi();
  const { navigateTenant, resetTenants } = useContext(TenantsContext);
  const { navigate } = useTenantPathname();
  const [isJoining, setIsJoining] = useState(false);
  const [isUpdatingOnboardingStatus, setIsUpdatingOnboardingStatus] = useState(false);
  const { update } = useUserOnboardingData();

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.title}>{t('invitation.find_your_tenants')}</div>
        <div className={styles.description}>{t('invitation.find_tenants_description')}</div>
        {invitations.map(({ id, organizationId, tenantName, tenantTag }) => (
          <div key={id} className={styles.tenant}>
            <ThemedIcon for={OrganizationIcon} size={40} />
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
                  const data = await cloudApi.get('/api/tenants');
                  resetTenants(data);
                  navigateTenant(getTenantIdFromOrganizationId(organizationId));
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
          isLoading={isUpdatingOnboardingStatus}
          title="invitation.create_new_tenant"
          onClick={async () => {
            setIsUpdatingOnboardingStatus(true);
            try {
              await update({ isOnboardingDone: false });
              navigate('/');
            } finally {
              setIsUpdatingOnboardingStatus(false);
            }
          }}
        />
      </div>
    </div>
  );
}

export default InvitationList;
