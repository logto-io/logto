import { useTranslation } from 'react-i18next';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import { isDynamicAppRow, type ApplicationListRow } from '@/types/applications';

import styles from './index.module.scss';

type Props = {
  readonly data: ApplicationListRow;
};

/** The app id column of the application list. Dynamic app clients bring their own client id. */
function ApplicationId({ data }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  if (isDynamicAppRow(data)) {
    return (
      <span className={styles.placeholder}>{t('applications.dynamic_app.app_id_placeholder')}</span>
    );
  }

  return <CopyToClipboard value={data.id} variant="text" />;
}

export default ApplicationId;
