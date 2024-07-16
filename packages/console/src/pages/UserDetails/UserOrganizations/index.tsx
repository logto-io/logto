import { useOutletContext } from 'react-router-dom';

import OrganizationList from '@/components/OrganizationList';

import { type UserDetailsOutletContext } from '../types';

function UserOrganizations() {
  const { user } = useOutletContext<UserDetailsOutletContext>();
  return <OrganizationList type="user" data={user} />;
}

export default UserOrganizations;
