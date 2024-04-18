import { type Resource } from '@logto/schemas';
import useSWR from 'swr';

import ResourceIcon from '@/assets/icons/resource.svg';

import * as styles from './index.module.scss';

type Props = {
  readonly resourceId: string;
};

function ResourceName({ resourceId }: Props) {
  const { data, isLoading } = useSWR<Resource>(`api/resources/${resourceId}`);

  if (isLoading || !data) {
    return null;
  }

  return (
    <span className={styles.container}>
      <ResourceIcon className={styles.icon} />
      {data.name}
    </span>
  );
}

export default ResourceName;
