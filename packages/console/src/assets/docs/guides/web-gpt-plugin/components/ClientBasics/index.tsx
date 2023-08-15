import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import { GuideContext } from '@/pages/Applications/components/GuideV2';

import * as styles from './index.module.scss';

// eslint-disable-next-line import/no-unused-modules
export default function ClientBasics() {
  const {
    app: { id, secret },
  } = useContext(GuideContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

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
