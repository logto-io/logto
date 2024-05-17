import { type AdminConsoleKey } from '@logto/phrases';
import { DomainStatus } from '@logto/schemas';

import DynamicT from '@/ds-components/DynamicT';
import type { Props as TagProps } from '@/ds-components/Tag';
import Tag from '@/ds-components/Tag';

const domainStatusToTag: Record<
  DomainStatus,
  { title: AdminConsoleKey; status: TagProps['status'] }
> = {
  [DomainStatus.PendingVerification]: { title: 'domain.status.connecting', status: 'alert' },
  [DomainStatus.PendingSsl]: { title: 'domain.status.connecting', status: 'alert' },
  [DomainStatus.Active]: { title: 'domain.status.in_use', status: 'success' },
  [DomainStatus.Error]: { title: 'domain.status.failed_to_connect', status: 'error' },
};

type Props = {
  readonly status: DomainStatus;
};

function DomainStatusTag({ status }: Props) {
  const tag = domainStatusToTag[status];

  return (
    <Tag status={tag.status} type="state" variant="plain">
      <DynamicT forKey={tag.title} />
    </Tag>
  );
}

export default DomainStatusTag;
