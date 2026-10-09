import classNames from 'classnames';
import { startTransition, useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import useSWRMutation from 'swr/mutation';

import InvitationIcon from '@/assets/icons/invitation.svg?react';
import MembersIcon from '@/assets/icons/members.svg?react';
import PlusIcon from '@/assets/icons/plus.svg?react';
import { TenantSettingsTabs } from '@/consts';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import Spacer from '@/ds-components/Spacer';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { buildSelfHostedPlansUrl, ossUpsellEntries } from '@/utils/oss-upsell';

import InviteMemberModal from './InviteMemberModal';
import styles from './index.module.scss';
import useTenantMembersApi from './use-tenant-members-api';

function TenantMembers() {
  const { navigate, match } = useTenantPathname();
  const { licenseQuota } = useContext(SubscriptionDataContext);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const {
    access: { canInviteMember, canRemoveMember },
  } = useCurrentTenantScopes();

  const isInvitationTab = match(`/tenant-settings/${TenantSettingsTabs.Members}/invitations`);

  const { invitationsKey, getInvitations } = useTenantMembersApi();
  const { trigger: mutateInvitations } = useSWRMutation(invitationsKey, getInvitations);

  return (
    <div className={styles.container}>
      {!isCloud && !licenseQuota.consoleCollaboration && (
        <InlineNotification
          action="tenants.members.self_hosted_card_action"
          href={buildSelfHostedPlansUrl(ossUpsellEntries.tenantSettingsMembersOssUpsell)}
        >
          <DynamicT forKey="tenants.members.self_hosted_card_description" />
        </InlineNotification>
      )}
      {(canInviteMember || (!isCloud && canRemoveMember)) && (
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
          {canInviteMember && (
            <Button
              type="primary"
              size="large"
              icon={<PlusIcon />}
              title="tenant_members.invite_members"
              onClick={() => {
                setShowInviteModal(true);
              }}
            />
          )}
        </div>
      )}
      <Outlet />
      {canInviteMember && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={(isSuccessful) => {
            setShowInviteModal(false);

            if (!isSuccessful) {
              return;
            }

            if (isInvitationTab) {
              void mutateInvitations();
              return;
            }

            // Defer navigation to avoid modal closing render being interrupted
            startTransition(() => {
              navigate('invitations');
            });
          }}
        />
      )}
    </div>
  );
}

export default TenantMembers;
