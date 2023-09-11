import { useContext } from 'react';

import { GuideContext } from '@/components/Guide';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';

import * as styles from './index.module.scss';

export default function ClientBasics() {
  const { app } = useContext(GuideContext);
  const { id, secret } = app ?? {};

  return (
    <div className={styles.basic}>
      {id && (
        <FormField title="application_details.application_id" className={styles.item}>
          <CopyToClipboard value={id} variant="border" />
        </FormField>
      )}
      {secret && (
        <FormField title="application_details.application_secret" className={styles.item}>
          <CopyToClipboard hasVisibilityToggle value={secret} variant="border" />
        </FormField>
      )}
    </div>
  );
}
