import { LogtoJwtTokenKeyType } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import DeleteIcon from '@/assets/icons/delete.svg';
import EditIcon from '@/assets/icons/edit.svg';
import Button from '@/ds-components/Button';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { getPagePath } from '@/pages/CustomizeJwt/utils/path';

import * as styles from './index.module.scss';

type Props = {
  readonly tokenType: LogtoJwtTokenKeyType;
  readonly onDelete: (token: LogtoJwtTokenKeyType) => void;
};

function CustomizerItem({ tokenType, onDelete }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const editLink = getPagePath(tokenType, 'edit');
  const { navigate } = useTenantPathname();

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {t('jwt_claims.custom_jwt_item', {
          for:
            tokenType === LogtoJwtTokenKeyType.AccessToken
              ? t('jwt_claims.user_jwt.for')
              : t('jwt_claims.machine_to_machine_jwt.for'),
        })}
      </div>
      <div className={styles.actions}>
        <Button
          icon={<EditIcon className={styles.icon} />}
          type="text"
          size="small"
          title="general.edit"
          onClick={() => {
            navigate(editLink);
          }}
        />
        <Button
          className={styles.danger}
          icon={<DeleteIcon className={styles.icon} />}
          type="text"
          size="small"
          title="general.delete"
          onClick={() => {
            onDelete(tokenType);
          }}
        />
      </div>
    </div>
  );
}

export default CustomizerItem;
