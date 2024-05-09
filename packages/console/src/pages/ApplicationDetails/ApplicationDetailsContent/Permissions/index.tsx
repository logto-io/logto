import { type Application } from '@logto/schemas';

import { isDevFeaturesEnabled } from '@/consts/env';

import PermissionsCard from './PermissionsCard';
import { ScopeLevel } from './PermissionsCard/ApplicationScopesAssignmentModal/type';
import * as styles from './index.module.scss';

type Props = {
  readonly application: Application;
};

function Permissions({ application }: Props) {
  const displayScopeLevels = isDevFeaturesEnabled
    ? [ScopeLevel.User, ScopeLevel.Organization]
    : [ScopeLevel.All];

  return (
    <div className={styles.container}>
      {displayScopeLevels.map((scopeLevel) => (
        <PermissionsCard key={scopeLevel} applicationId={application.id} scopeLevel={scopeLevel} />
      ))}
    </div>
  );
}

export default Permissions;
