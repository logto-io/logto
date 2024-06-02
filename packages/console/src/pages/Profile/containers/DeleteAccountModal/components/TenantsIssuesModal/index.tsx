import { type TenantResponse } from '@/cloud/types/router';
import Button from '@/ds-components/Button';
import ModalLayout from '@/ds-components/ModalLayout';

import * as styles from '../../index.module.scss';
import TenantsList from '../TenantsList';

type Props = {
  readonly issues: ReadonlyArray<{
    readonly description: string;
    readonly tenants: readonly TenantResponse[];
  }>;
};

export default function TenantsIssuesModal({ issues }: Props) {
  return (
    <ModalLayout
      title="profile.delete_account.label"
      footer={<Button size="large" title="general.got_it" />}
    >
      <div className={styles.container}>
        <p>
          We&apos;re sorry to hear that you want to delete your account. Before you can delete your
          account, you need to resolve the following issues.
        </p>
        {issues.map(
          ({ description, tenants }) =>
            tenants.length > 0 && (
              <TenantsList key={description} description={description} tenants={tenants} />
            )
        )}
        <p>
          Once you have resolved the issues, you can delete your account. Please do not hesitate to
          contact us if you need any assistance.
        </p>
      </div>
    </ModalLayout>
  );
}
