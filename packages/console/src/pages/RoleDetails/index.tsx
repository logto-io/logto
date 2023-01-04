import type { Role } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import Back from '@/assets/images/back.svg';
import Delete from '@/assets/images/delete.svg';
import More from '@/assets/images/more.svg';
import ActionMenu, { ActionMenuItem } from '@/components/ActionMenu';
import Card from '@/components/Card';
import CopyToClipboard from '@/components/CopyToClipboard';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import TabNav, { TabNavItem } from '@/components/TabNav';
import TextLink from '@/components/TextLink';
import type { RequestError } from '@/hooks/use-api';
import * as detailsStyles from '@/scss/details.module.scss';

import RoleSettings from './RoleSettings';
import * as styles from './index.module.scss';

const RoleDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<Role, RequestError>(id && `/api/roles/${id}`);
  const isLoading = !data && !error;

  return (
    <div className={classNames(detailsStyles.container, styles.container)}>
      <TextLink to="/roles" icon={<Back />} className={styles.backLink}>
        {t('role_details.back_to_roles')}
      </TextLink>
      {isLoading && <DetailsSkeleton />}
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {data && (
        <>
          <Card className={styles.header}>
            <div className={styles.info}>
              <div className={styles.name}>{data.name}</div>
              <div className={styles.meta}>
                <div className={styles.idText}>{t('role_details.identifier')}</div>
                <CopyToClipboard value={data.id} size="small" />
              </div>
            </div>
            <ActionMenu
              buttonProps={{ icon: <More className={styles.moreIcon} />, size: 'large' }}
              title={t('general.more_options')}
            >
              <ActionMenuItem
                icon={<Delete />}
                type="danger"
                onClick={() => {
                  // Todo:@xiaoyijun handle delete
                }}
              >
                {t('general.delete')}
              </ActionMenuItem>
            </ActionMenu>
          </Card>
          <TabNav>
            <TabNavItem href={`/roles/${data.id}`}>{t('role_details.settings_tab')}</TabNavItem>
          </TabNav>
          <RoleSettings
            data={data}
            onRoleUpdated={(data) => {
              void mutate(data);
            }}
          />
        </>
      )}
    </div>
  );
};

export default RoleDetails;
