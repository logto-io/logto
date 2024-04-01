import { type LogtoJwtTokenPath } from '@logto/schemas';

import PlusIcon from '@/assets/icons/plus.svg';
import Button from '@/ds-components/Button';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { getPagePath } from '@/pages/CustomizeJwt/utils/path';

import * as styles from './index.module.scss';

type Props = {
  tokenType: LogtoJwtTokenPath;
};

function CreateButton({ tokenType }: Props) {
  const link = getPagePath(tokenType, 'create');
  const { navigate } = useTenantPathname();

  return (
    <Button
      icon={<PlusIcon className={styles.icon} />}
      type="primary"
      title="jwt_claims.custom_jwt_create_button"
      onClick={() => {
        navigate(link);
      }}
    />
  );
}

export default CreateButton;
