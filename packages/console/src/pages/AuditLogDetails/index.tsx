import { LogDTO, User } from '@logto/schemas';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

import ApplicationName from '@/components/ApplicationName';
import Card from '@/components/Card';
import CodeEditor from '@/components/CodeEditor';
import DangerousRaw from '@/components/DangerousRaw';
import DetailsSkeleton from '@/components/DetailsSkeleton';
import LinkButton from '@/components/LinkButton';
import TabNav, { TabNavItem } from '@/components/TabNav';
import UserName from '@/components/UserName';
import { logEventTitle } from '@/consts/logs';
import { RequestError } from '@/hooks/use-api';
import Back from '@/icons/Back';
import * as detailsStyles from '@/scss/details.module.scss';

import EventIcon from './components/EventIcon';
import * as styles from './index.module.scss';

const AuditLogDetails = () => {
  const { id: userId, logId } = useParams();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error } = useSWR<LogDTO, RequestError>(logId && `/api/logs/${logId}`);
  const { data: userData } = useSWR<User, RequestError>(userId && `/api/users/${userId}`);

  const isLoading = !data && !error;

  const backLink = userId ? `/users/${userId}/logs` : '/audit-logs';
  const backLinkTitle = userId ? (
    <DangerousRaw>{t('log_details.back_to_user', { name: userData?.name ?? '-' })}</DangerousRaw>
  ) : (
    'admin_console.log_details.back_to_logs'
  );

  return (
    <div className={detailsStyles.container}>
      <LinkButton to={backLink} icon={<Back />} title={backLinkTitle} className={styles.backLink} />
      {isLoading && <DetailsSkeleton />}
      {!data && error && <div>{`error occurred: ${error.body?.message ?? error.message}`}</div>}
      {data && (
        <>
          <Card className={styles.header}>
            <EventIcon isSuccess={data.payload.result === 'Success'} />
            <div className={styles.content}>
              <div className={styles.eventName}>{logEventTitle[data.type]}</div>
              <div className={styles.basicInfo}>
                <div className={styles.infoItem}>
                  <div className={styles.label}>{t('log_details.event_type')}</div>
                  <div>{data.type}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.label}>{t('log_details.application')}</div>
                  <div>
                    {data.payload.applicationId ? (
                      <ApplicationName isLink applicationId={data.payload.applicationId} />
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.label}>{t('log_details.ip_address')}</div>
                  <div>{data.payload.ip ?? '-'}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.label}>{t('log_details.user')}</div>
                  <div>
                    {data.payload.userId ? <UserName isLink userId={data.payload.userId} /> : '-'}
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.label}>{t('log_details.log_id')}</div>
                  <div>{data.id}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.label}>{t('log_details.time')}</div>
                  <div>{dayjs(data.createdAt).toDate().toLocaleString()}</div>
                </div>
              </div>
              <div>
                <div className={styles.infoItem}>
                  <div className={styles.label}>{t('log_details.user_agent')}</div>
                  <div>{data.payload.userAgent}</div>
                </div>
              </div>
            </div>
          </Card>
          <Card className={classNames(styles.body, detailsStyles.body)}>
            <TabNav>
              <TabNavItem href={`/audit-logs/${logId ?? ''}`}>
                {t('log_details.tab_details')}
              </TabNavItem>
            </TabNav>
            <div className={styles.main}>
              <CodeEditor language="json" value={JSON.stringify(data.payload, null, 2)} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AuditLogDetails;
