import { useContext } from 'react';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import { GuideContext } from '@/pages/Applications/components/Guide';

import * as styles from './index.module.scss';

export default function ClientBasics() {
  const {
    app: { id, secret },
  } = useContext(GuideContext);

  return (
    <div className={styles.basic}>
      <FormField title="application_details.application_id" className={styles.item}>
        <CopyToClipboard value={id} variant="border" />
      </FormField>
      <FormField title="application_details.application_secret" className={styles.item}>
        <CopyToClipboard hasVisibilityToggle value={secret} variant="border" />
      </FormField>
    </div>
  );
}
