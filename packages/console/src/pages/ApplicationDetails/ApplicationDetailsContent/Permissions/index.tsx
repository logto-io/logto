import { type Application } from '@logto/schemas';

import PermissionsCard from './PermissionsCard';
import { ScopeLevel } from './PermissionsCard/ApplicationScopesAssignmentModal/type';
import * as styles from './index.module.scss';

type Props = {
  readonly application: Application;
};

function Permissions({ application }: Props) {
  return (
    <div className={styles.container}>
      {[ScopeLevel.User, ScopeLevel.Organization].map((scopeLevel) => (
        <PermissionsCard key={scopeLevel} applicationId={application.id} scopeLevel={scopeLevel} />
      ))}
    </div>
  );
}

export default Permissions;
