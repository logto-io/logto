/* eslint-disable complexity */
import type { Application, Hook, Log, User } from '@logto/schemas';
import { demoAppApplicationId } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import useSWR from 'swr';

import ApplicationName from '@/components/ApplicationName';
import { isImpersonationLog } from '@/components/AuditLogTable/components/EventName/utils';
import DetailsPage from '@/components/DetailsPage';
import PageMeta from '@/components/PageMeta';
import UserName from '@/components/UserName';
import { logEventTitle } from '@/consts/logs';
import Card from '@/ds-components/Card';
import CodeEditor from '@/ds-components/CodeEditor';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import Tag from '@/ds-components/Tag';
import type { RequestError } from '@/hooks/use-api';
import { isWebhookEventLogKey } from '@/pages/WebhookDetails/utils';
import { getUserTitle } from '@/utils/user';

import EventIcon from './components/EventIcon';
import styles from './index.module.scss';

const getAuditLogDetailsRelatedResourceLink = (pathname: string) =>
  `${pathname.slice(0, pathname.lastIndexOf('/'))}`;

const getDetailsTabNavLink = (logId: string, userId?: string) =>
  userId ? `/users/${userId}/logs/${logId}` : `/audit-logs/${logId}`;

function AuditLogDetails() {
  const { appId, userId, hookId, logId } = useParams();
  const { pathname } = useLocation();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, mutate } = useSWR<Log, RequestError>(logId && `api/logs/${logId}`);
  const { data: appData } = useSWR<Application, RequestError>(appId && `api/applications/${appId}`);
  const { data: userData } = useSWR<User, RequestError>(userId && `api/users/${userId}`);
  const { data: hookData } = useSWR<Hook, RequestError>(hookId && `api/hooks/${hookId}`);

  const isLoading = !data && !error;

  const backLink = getAuditLogDetailsRelatedResourceLink(pathname);
  const backLinkTitle =
    conditional(
      userId &&
        t('log_details.back_to', {
          name: getUserTitle(userData),
        })
    ) ??
    conditional(
      hookId &&
        t('log_details.back_to', {
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          name: hookData?.name || t('general.unnamed'),
        })
    ) ??
    conditional(
      appId &&
        t('log_details.back_to', {
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          name: appData?.name || t('general.unnamed'),
        })
    ) ??
    t('log_details.back_to_logs');

  if (!logId) {
    return null;
  }

  const isWebHookEvent = isWebhookEventLogKey(data?.key ?? '');

  return (
    <DetailsPage
      backLink={backLink}
      backLinkTitle={<DangerousRaw>{backLinkTitle}</DangerousRaw>}
      isLoading={isLoading}
      error={error}
      onRetry={mutate}
    >
      <PageMeta titleKey="log_details.page_title" />
      {data && (
        <>
          <Card className={styles.header}>
            <EventIcon isSuccess={data.payload.result === 'Success'} />
            <div className={styles.content}>
              <div className={styles.eventName}>
                {logEventTitle[data.key]}
                {isImpersonationLog(data) && <Tag status="alert">Impersonation</Tag>}
              </div>
              <div className={styles.basicInfo}>
                <div className={styles.infoItem}>
                  <div className={styles.label}>{t('log_details.event_key')}</div>
                  <div>{data.key}</div>
                </div>
                {!isWebHookEvent && (
                  <>
                    <div className={styles.infoItem}>
                      <div className={styles.label}>{t('log_details.application')}</div>
                      <div>
                        {data.payload.applicationId ? (
                          <ApplicationName
                            isLink={data.payload.applicationId !== demoAppApplicationId}
                            applicationId={data.payload.applicationId}
                          />
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
                        {data.payload.userId ? (
                          <UserName isLink userId={data.payload.userId} />
                        ) : (
                          '-'
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div className={styles.infoItem}>
                  <div className={styles.label}>{t('log_details.log_id')}</div>
                  <div>{data.id}</div>
                </div>
                <div className={styles.infoItem}>
                  <div className={styles.label}>{t('log_details.time')}</div>
                  <div>{new Date(data.createdAt).toLocaleString()}</div>
                </div>
              </div>
              {!isWebHookEvent && (
                <div>
                  <div className={styles.infoItem}>
                    <div className={styles.label}>{t('log_details.user_agent')}</div>
                    <div>{data.payload.userAgent}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
          <TabNav>
            <TabNavItem href={getDetailsTabNavLink(logId, userId)}>
              {t('log_details.tab_details')}
            </TabNavItem>
          </TabNav>
          <Card className={styles.body}>
            <div className={styles.main}>
              <FormField title="log_details.raw_data">
                <CodeEditor language="json" value={JSON.stringify(data.payload, null, 2)} />
              </FormField>
            </div>
          </Card>
        </>
      )}
    </DetailsPage>
  );
}

export default AuditLogDetails;
/* eslint-enable complexity */
