import { type LogtoJwtTokenPath } from '@logto/schemas';
import { useNavigate } from 'react-router-dom';

import PlusIcon from '@/assets/icons/plus.svg';
import Button from '@/ds-components/Button';
import { getPagePath } from '@/pages/CustomizeJwt/utils/path';

import * as styles from './index.module.scss';

type Props = {
  tokenType: LogtoJwtTokenPath;
};

function CreateButton({ tokenType }: Props) {
  const link = getPagePath(tokenType, 'create');
  const navigate = useNavigate();

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
