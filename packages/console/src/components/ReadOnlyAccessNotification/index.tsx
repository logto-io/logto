import { useState } from 'react';

import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';

import styles from './index.module.scss';

function ReadOnlyAccessNotification() {
  const {
    access: { isReadOnly },
  } = useCurrentTenantScopes();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isReadOnly || isDismissed) {
    return null;
  }

  return (
    <div className={styles.container}>
      <InlineNotification
        action="general.got_it"
        onClick={() => {
          setIsDismissed(true);
        }}
      >
        <DynamicT forKey="tenants.view_only.notification" />
      </InlineNotification>
    </div>
  );
}

export default ReadOnlyAccessNotification;
