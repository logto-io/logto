import { type PersonalAccessToken, type PersonalAccessToken as Token } from '@logto/schemas';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';

import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import Plus from '@/assets/icons/plus.svg?react';
import ActionsButton from '@/components/ActionsButton';
import Breakable from '@/components/Breakable';
import Button from '@/ds-components/Button';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import Table from '@/ds-components/Table';
import { type Column } from '@/ds-components/Table/types';
import TextLink from '@/ds-components/TextLink';
import useApi, { type RequestError } from '@/hooks/use-api';

import CreateTokenModal from './CreateTokenModal';
import EditTokenModal from './EditTokenModal';
import styles from './index.module.scss';

type Props = {
  readonly userId: string;
};

function PersonalAccessTokens({ userId }: Props) {
  const [showCreateTokenModal, setShowCreateTokenModal] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, mutate, error, isLoading } = useSWR<Token[], RequestError>(
    `api/users/${userId}/personal-access-tokens`
  );
  const api = useApi();
  const [editToken, setEditToken] = useState<PersonalAccessToken>();

  const tableColumns: Array<Column<Token>> = useMemo(
    () => [
      {
        title: t('general.name'),
        dataIndex: 'name',
        colSpan: 3,
        render: ({ name }) => <Breakable>{name}</Breakable>,
      },
      {
        title: t('user_details.personal_access_tokens.value'),
        dataIndex: 'value',
        colSpan: 6,
        render: ({ value }) => (
          <CopyToClipboard hasVisibilityToggle displayType="block" value={value} variant="text" />
        ),
      },
      {
        title: t('user_details.personal_access_tokens.expires_at'),
        dataIndex: 'expiresAt',
        colSpan: 3,
        render: ({ expiresAt }) => (
          <Breakable>
            {expiresAt
              ? new Date(expiresAt).toLocaleString()
              : t('user_details.personal_access_tokens.never')}
          </Breakable>
        ),
      },
      {
        title: '',
        dataIndex: 'actions',
        render: (token) => (
          <ActionsButton
            fieldName="user_details.personal_access_tokens.title_short"
            deleteConfirmation="user_details.personal_access_tokens.delete_confirmation"
            onDelete={async () => {
              await api.delete(
                `api/users/${userId}/personal-access-tokens/${encodeURIComponent(token.name)}`
              );
              void mutate();
            }}
            onEdit={() => {
              setEditToken(token);
            }}
          />
        ),
      },
    ],
    [api, userId, mutate, t]
  );

  return (
    <FormField
      title="user_details.personal_access_tokens.title_other"
      tip={(closeTipHandler) => (
        <Trans
          components={{
            a: (
              <TextLink
                targetBlank
                href="https://docs.logto.io/docs/recipes/manage-users/management-api/personal-access-token/"
                onClick={closeTipHandler}
              />
            ),
          }}
        >
          {t('user_details.personal_access_tokens.tip')}
        </Trans>
      )}
    >
      {data?.length === 0 && !error ? (
        <>
          <div className={styles.empty}>{t('user_details.personal_access_tokens.empty')}</div>
          <Button
            icon={<Plus />}
            title="user_details.personal_access_tokens.create"
            onClick={() => {
              setShowCreateTokenModal(true);
            }}
          />
        </>
      ) : (
        <>
          <Table
            hasBorder
            isRowHoverEffectDisabled
            rowIndexKey="name"
            isLoading={isLoading}
            errorMessage={error?.body?.message ?? error?.message}
            rowGroups={[{ key: 'personal_access_tokens', data: data ?? [] }]}
            columns={tableColumns}
            className={styles.table}
          />
          <Button
            size="small"
            type="text"
            className={styles.add}
            title="user_details.personal_access_tokens.create_new_token"
            icon={<CirclePlus />}
            onClick={() => {
              setShowCreateTokenModal(true);
            }}
          />
        </>
      )}
      <CreateTokenModal
        userId={userId}
        isOpen={showCreateTokenModal}
        onClose={() => {
          setShowCreateTokenModal(false);
          void mutate();
        }}
      />
      {editToken && (
        <EditTokenModal
          userId={userId}
          token={editToken}
          onClose={(updated) => {
            if (updated) {
              void mutate();
            }
            setEditToken(undefined);
          }}
        />
      )}
    </FormField>
  );
}

export default PersonalAccessTokens;
