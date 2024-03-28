import { LogtoJwtTokenPath } from '@logto/schemas';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSWRConfig } from 'swr';

import DeletIcon from '@/assets/icons/delete.svg';
import EditIcon from '@/assets/icons/edit.svg';
import Button from '@/ds-components/Button';
import useApi from '@/hooks/use-api';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { getApiPath, getPagePath } from '@/pages/CustomizeJwt/utils/path';

import * as styles from './index.module.scss';

type Props = {
  tokenType: LogtoJwtTokenPath;
};

function CustomizerItem({ tokenType }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const apiLink = getApiPath(tokenType);
  const editLink = getPagePath(tokenType, 'edit');
  const navigate = useNavigate();
  const { show } = useConfirmModal();
  const { mutate } = useSWRConfig();

  const api = useApi();

  const onDelete = useCallback(async () => {
    const [confirm] = await show({
      title: 'jwt_claims.delete_modal_title',
      ModalContent: t('jwt_claims.delete_modal_content'),
      confirmButtonText: 'general.delete',
    });

    if (confirm) {
      await api.delete(apiLink);
      await mutate(apiLink);
    }
  }, [api, apiLink, mutate, show, t]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        {t('jwt_claims.custom_jwt_item', {
          for:
            tokenType === LogtoJwtTokenPath.AccessToken
              ? t('jwt_claims.user_jwt.for')
              : t('jwt_claims.machine_to_machine_jwt.for'),
        })}
      </div>
      <div className={styles.actions}>
        <Button
          icon={<EditIcon />}
          type="text"
          title="general.edit"
          onClick={() => {
            navigate(editLink);
          }}
        />
        <Button
          className={styles.danger}
          icon={<DeletIcon />}
          type="text"
          title="general.delete"
          onClick={onDelete}
        />
      </div>
    </div>
  );
}

export default CustomizerItem;
