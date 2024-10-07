import classNames from 'classnames';
import { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import useSWRMutation from 'swr/mutation';

import InvitationIcon from '@/assets/icons/invitation.svg?react';
import MembersIcon from '@/assets/icons/members.svg?react';
import PlusIcon from '@/assets/icons/plus.svg?react';
import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { TenantSettingsTabs } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import Spacer from '@/ds-components/Spacer';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import InviteMemberModal from './InviteMemberModal';
import styles from './index.module.scss';

function TenantMembers() {
  const { navigate, match } = useTenantPathname();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const {
    access: { canInviteMember },
  } = useCurrentTenantScopes();

  const isInvitationTab = match(`/tenant-settings/${TenantSettingsTabs.Members}/invitations`);

  const { currentTenantId } = useContext(TenantsContext);
  const cloudApi = useAuthedCloudApi();
  const { trigger: mutateInvitations } = useSWRMutation(
    `api/tenants/${currentTenantId}/invitations`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/invitations', { params: { tenantId: currentTenantId } })
  );

  return (
    <div className={styles.container}>
      {canInviteMember && (
        <div className={styles.tabButtons}>
          <Button
            className={classNames(styles.button, !isInvitationTab && styles.active)}
            icon={<MembersIcon />}
            title="tenant_members.members"
            onClick={() => {
              navigate('.');
            }}
          />
          <Button
            className={classNames(styles.button, isInvitationTab && styles.active)}
            icon={<InvitationIcon />}
            title="tenant_members.invitations"
            onClick={() => {
              navigate('invitations');
            }}
          />
          <Spacer />
          <Button
            type="primary"
            size="large"
            icon={<PlusIcon />}
            title="tenant_members.invite_members"
            onClick={() => {
              setShowInviteModal(true);
            }}
          />
        </div>
      )}
      <Outlet />
      {canInviteMember && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={(isSuccessful) => {
            setShowInviteModal(false);
            if (isSuccessful) {
              if (isInvitationTab) {
                void mutateInvitations();
              } else {
                navigate('invitations');
              }
            }
          }}
        />
      )}
    </div>
  );
}

export default TenantMembers;
