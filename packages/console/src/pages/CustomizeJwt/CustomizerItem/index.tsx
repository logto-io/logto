import { LogtoJwtTokenKeyType } from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import DeleteIcon from '@/assets/icons/delete.svg';
import EditIcon from '@/assets/icons/edit.svg';
import Button from '@/ds-components/Button';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { getApiPath, getPagePath } from '@/pages/CustomizeJwt/utils/path';

import useJwtCustomizer from '../use-jwt-customizer';

import * as styles from './index.module.scss';

type Props = {
  tokenType: LogtoJwtTokenKeyType;
};

function CustomizerItem({ tokenType }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const apiLink = getApiPath(tokenType);
  const editLink = getPagePath(tokenType, 'edit');
  const { navigate } = useTenantPathname();
  const { show } = useConfirmModal();
  const { mutate } = useJwtCustomizer();

  const api = useApi();

  const onDelete = useCallback(async () => {
    const [confirm] = await show({
      title: 'jwt_claims.delete_modal_title',
      ModalContent: t('jwt_claims.delete_modal_content'),
      confirmButtonText: 'general.delete',
    });

    if (confirm) {
      await api.delete(apiLink);
      await mutate();
    }
  }, [api, apiLink, mutate, show, t]);

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
          onClick={onDelete}
        />
      </div>
    </div>
  );
}

export default CustomizerItem;
