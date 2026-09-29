import { useContext } from 'react';

import { isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import TenantMembers from '@/pages/TenantSettings/TenantMembers';

import { shouldShowOssTenantMembersPage } from '../utils';

import MembersUpsell from './MembersUpsell';

/**
 * The members and invitations of a self-hosted deployment, the same pages Cloud tenants use, when
 * the license grants Console collaboration; the self-hosted plans upsell otherwise.
 */
function Members() {
  const { license } = useContext(SubscriptionDataContext);

  if (
    !shouldShowOssTenantMembersPage({
      isCloud: false,
      isDevFeaturesEnabled,
      isConsoleCollaborationEntitled: Boolean(license?.quota.consoleCollaboration),
    })
  ) {
    return <MembersUpsell />;
  }

  return <TenantMembers />;
}

export default Members;
