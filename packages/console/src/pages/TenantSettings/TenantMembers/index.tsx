import classNames from 'classnames';
import { Route, Routes } from 'react-router-dom';

import InvitationIcon from '@/assets/icons/invitation.svg';
import MembersIcon from '@/assets/icons/members.svg';
import PlusIcon from '@/assets/icons/plus.svg';
import { TenantSettingsTabs } from '@/consts';
import Button from '@/ds-components/Button';
import Spacer from '@/ds-components/Spacer';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import NotFound from '@/pages/NotFound';

import Invitations from './Invitations';
import Members from './Members';
import * as styles from './index.module.scss';

const invitationsRoute = 'invitations';

function TenantMembers() {
  const { navigate, match } = useTenantPathname();

  const isInvitationTab = match(
    `/tenant-settings/${TenantSettingsTabs.Members}/${invitationsRoute}`
  );

  return (
    <div className={styles.container}>
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
        <Button type="primary" size="large" icon={<PlusIcon />} title="tenant_members.new_member" />
      </div>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route index element={<Members />} />
        <Route path={invitationsRoute} element={<Invitations />} />
      </Routes>
    </div>
  );
}

export default TenantMembers;
