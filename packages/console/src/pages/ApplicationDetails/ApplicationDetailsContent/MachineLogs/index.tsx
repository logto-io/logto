import AuditLogTable from '@/components/AuditLogTable';

import * as styles from './index.module.scss';

type Props = { readonly applicationId: string };

function MachineLogs({ applicationId }: Props) {
  return <AuditLogTable applicationId={applicationId} className={styles.logs} />;
}

export default MachineLogs;
