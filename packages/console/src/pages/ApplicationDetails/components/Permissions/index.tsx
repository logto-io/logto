import { type ApplicationApiResponse } from '@logto/schemas';

import OidcPermissionsCard from './OidcPermissionsCard';
import PermissionsCard from './PermissionsCard';
import { ScopeLevel } from './PermissionsCard/ApplicationScopesAssignmentModal/type';
import styles from './index.module.scss';

type Props = {
  readonly application: ApplicationApiResponse;
};

function Permissions({ application }: Props) {
  return (
    <div className={styles.container}>
      {[ScopeLevel.User, ScopeLevel.Organization].map((scopeLevel) => (
        <PermissionsCard key={scopeLevel} applicationId={application.id} scopeLevel={scopeLevel} />
      ))}
      <OidcPermissionsCard />
    </div>
  );
}

export default Permissions;
