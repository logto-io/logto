import classNames from 'classnames';
import { useContext, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import useSWRMutation from 'swr/mutation';

import InvitationIcon from '@/assets/icons/invitation.svg';
import MembersIcon from '@/assets/icons/members.svg';
import PlusIcon from '@/assets/icons/plus.svg';
import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import ChargeNotification from '@/components/ChargeNotification';
import { TenantSettingsTabs } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import Spacer from '@/ds-components/Spacer';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import NotFound from '@/pages/NotFound';

import Invitations from './Invitations';
import InviteMemberModal from './InviteMemberModal';
import Members from './Members';
import useTenantMembersUsage from './hooks';
import * as styles from './index.module.scss';

const invitationsRoute = 'invitations';

function TenantMembers() {
  const { hasTenantMembersSurpassedLimit } = useTenantMembersUsage();
  const { navigate, match } = useTenantPathname();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { canInviteMember } = useCurrentTenantScopes();

  const isInvitationTab = match(
    `/tenant-settings/${TenantSettingsTabs.Members}/${invitationsRoute}`
  );

  const { currentTenantId } = useContext(TenantsContext);
  const cloudApi = useAuthedCloudApi();
  const { trigger: mutateInvitations } = useSWRMutation(
    'api/tenants/:tenantId/invitations',
    async () =>
      cloudApi.get('/api/tenants/:tenantId/invitations', { params: { tenantId: currentTenantId } })
  );

  return (
    <div className={styles.container}>
      <ChargeNotification
        hasSurpassedLimit={hasTenantMembersSurpassedLimit}
        quotaItemPhraseKey="tenant_member"
        className={styles.chargeNotification}
        checkedFlagKey="tenantMember"
      />
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
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route index element={<Members />} />
        {canInviteMember && <Route path={invitationsRoute} element={<Invitations />} />}
      </Routes>
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
