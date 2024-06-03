import { type TenantResponse } from '@/cloud/types/router';

import * as styles from './index.module.scss';

type Props = {
  readonly description: string;
  readonly tenants: readonly TenantResponse[];
};

/** A component that displays a list of tenants with their summary information. */
export default function TenantsList({ description, tenants }: Props) {
  return (
    <section className={styles.tenantList}>
      <h3>{description}</h3>
      <ul>
        {tenants.map(({ id, name }) => (
          <li key={id}>
            {name} ({id})
          </li>
        ))}
      </ul>
    </section>
  );
}
