import { isDevFeaturesEnabled } from '@/consts/env';
import TenantMembers from '@/pages/TenantSettings/TenantMembers';

import { shouldShowOssTenantMembersPage } from '../utils';

import MembersUpsell from './MembersUpsell';

/**
 * Keep existing members and invitations manageable after a license lapses. Only adding members
 * requires the Console collaboration entitlement.
 */
function Members() {
  if (
    !shouldShowOssTenantMembersPage({
      isCloud: false,
      isDevFeaturesEnabled,
    })
  ) {
    return <MembersUpsell />;
  }

  return <TenantMembers />;
}

export default Members;
