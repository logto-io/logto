import type { AdminConsoleKey } from '@logto/phrases';
import { Theme, isBuiltInApplicationId, type GetUserSessionResponse } from '@logto/schemas';
import { Fragment, type ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import More from '@/assets/icons/more.svg?react';
import SessionDarkIcon from '@/assets/icons/session-dark.svg?react';
import SessionIcon from '@/assets/icons/session.svg?react';
import ApplicationName from '@/components/ApplicationName';
import DetailsPage from '@/components/DetailsPage';
import UserName from '@/components/UserName';
import ActionMenu, { ActionMenuItem } from '@/ds-components/ActionMenu';
import Card from '@/ds-components/Card';
import CodeEditor from '@/ds-components/CodeEditor';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import { type RequestError } from '@/hooks/use-api';
import useTheme from '@/hooks/use-theme';

import { getSessionDisplayInfo } from '../UserDetails/UserSettings/UserSessions/utils';

import RevokeSessionConfirmModal from './RevokeSessionConfirmModal';
import styles from './index.module.scss';

const getDetailsTabNavLink = (userId: string, sessionId: string) =>
  `/users/${userId}/sessions/${sessionId}`;

/**
 * Format the timestamp to a human-readable string.
 * If the value is less than 1 trillion, it is considered to be in seconds and will be converted to milliseconds.
 * Otherwise, it is considered to be in milliseconds.
 * If the value is undefined, a dash will be returned.
 */
const formatTimestamp = (value?: number) => {
  if (!value) {
    return '-';
  }

  const timestamp = value < 1_000_000_000_000 ? value * 1000 : value;

  return new Date(timestamp).toLocaleString();
};

function UserSessionDetails() {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });
  const theme = useTheme();
  const navigate = useNavigate();
  const { mutate: mutateGlobal } = useSWRConfig();
  const { userId, sessionId } = useParams();

  const [showRevokeConfirmModal, setShowRevokeConfirmModal] = useState(false);

  const {
    data: sessionData,
    error: sessionError,
    isLoading: isSessionLoading,
    mutate: mutateSession,
  } = useSWR<GetUserSessionResponse, RequestError>(
    userId && sessionId && `api/users/${userId}/sessions/${sessionId}`
  );

  const isLoading = isSessionLoading;
  const error = sessionError;

  const sessionInfo = useMemo(
    () => (sessionData ? getSessionDisplayInfo(sessionData) : undefined),
    [sessionData]
  );

  const sessionLocation = sessionInfo?.location ?? '-';

  const headerTitle = useMemo<ReactNode>(() => {
    if (sessionInfo?.browserName && sessionInfo.osName) {
      return (
        <DynamicT
          forKey="user_details.sessions.browser_on_os"
          interpolation={{
            browser: sessionInfo.browserName,
            os: sessionInfo.osName,
          }}
        />
      );
    }

    return sessionInfo?.browserName ?? sessionInfo?.osName ?? sessionInfo?.name ?? '-';
  }, [sessionInfo]);

  const signedInAt = useMemo(() => formatTimestamp(sessionData?.payload.loginTs), [sessionData]);

  const applications = useMemo<ReactNode>(() => {
    // `authorizations` is a clientId-keyed record map that stores all apps authorized by this session.
    // We use the keys of this record to get the authorized application IDs.
    const authorizedApplicationIds = sessionData
      ? Object.keys(sessionData.payload.authorizations)
      : [];

    if (authorizedApplicationIds.length === 0) {
      return '-';
    }

    return authorizedApplicationIds.map((applicationId, index) => (
      <Fragment key={applicationId}>
        {index > 0 ? ', ' : null}
        <ApplicationName
          applicationId={applicationId}
          isLink={!isBuiltInApplicationId(applicationId)}
        />
      </Fragment>
    ));
  }, [sessionData]);

  const infoFields = useMemo<
    Array<{ key: string; labelKey: AdminConsoleKey; value: ReactNode }>
  >(() => {
    if (!sessionData) {
      return [];
    }

    return [
      {
        key: 'session-id',
        labelKey: 'user_details.sessions.session_id_column',
        value: sessionData.payload.uid,
      },
      {
        key: 'user',
        labelKey: 'user_details.sessions.user',
        value: userId ? <UserName isLink userId={userId} /> : '-',
      },
      {
        key: 'applications',
        labelKey: 'user_details.sessions.applications',
        value: applications,
      },
      {
        key: 'signed-in-at',
        labelKey: 'user_details.sessions.signed_in_at',
        value: signedInAt,
      },
      {
        key: 'ip',
        labelKey: 'user_details.sessions.ip',
        value: sessionInfo?.ip ?? '-',
      },
      {
        key: 'location',
        labelKey: 'user_details.sessions.location_column',
        value: sessionLocation,
      },
      {
        key: 'browser-name',
        labelKey: 'user_details.sessions.browser_name',
        value: sessionInfo?.browserName ?? '-',
      },
      {
        key: 'os-name',
        labelKey: 'user_details.sessions.os_name',
        value: sessionInfo?.osName ?? '-',
      },
      {
        key: 'device-model',
        labelKey: 'user_details.sessions.device_model',
        value: sessionInfo?.deviceModel ?? '-',
      },
    ];
  }, [applications, sessionData, sessionInfo, sessionLocation, signedInAt, userId]);

  return (
    <DetailsPage
      backLink={`/users/${userId}`}
      backLinkTitle="user_details.page_title"
      isLoading={isLoading}
      error={error}
      onRetry={mutateSession}
    >
      {sessionData && (
        <>
          <Card className={styles.header}>
            {theme === Theme.Dark ? <SessionDarkIcon /> : <SessionIcon />}
            <div className={styles.content}>
              <div className={styles.eventName}>
                <span>{headerTitle}</span>
                <ActionMenu
                  buttonProps={{ icon: <More />, size: 'large' }}
                  title={<DynamicT forKey="general.more_options" />}
                >
                  <ActionMenuItem
                    icon={<Delete />}
                    type="danger"
                    onClick={() => {
                      setShowRevokeConfirmModal(true);
                    }}
                  >
                    <DynamicT forKey="user_details.sessions.revoke_session" />
                  </ActionMenuItem>
                </ActionMenu>
              </div>
              <div className={styles.basicInfo}>
                {infoFields.map(({ key, labelKey, value }) => (
                  <div key={key} className={styles.infoItem}>
                    <div className={styles.label}>
                      <DynamicT forKey={labelKey} />
                    </div>
                    <div>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <TabNav>
            <TabNavItem href={getDetailsTabNavLink(userId ?? '', sessionId ?? '')}>
              {t('log_details.tab_details')}
            </TabNavItem>
          </TabNav>
          <Card className={styles.body}>
            <div className={styles.main}>
              <FormField title="log_details.raw_data">
                <CodeEditor language="json" value={JSON.stringify(sessionData, null, 2)} />
              </FormField>
            </div>
          </Card>
        </>
      )}
      {userId && sessionId && (
        <RevokeSessionConfirmModal
          userId={userId}
          sessionId={sessionId}
          isOpen={showRevokeConfirmModal}
          onCancel={() => {
            setShowRevokeConfirmModal(false);
          }}
          onRevokeCallback={() => {
            setShowRevokeConfirmModal(false);
            void mutateGlobal(`api/users/${userId}/sessions`);
            navigate(-1);
          }}
        />
      )}
    </DetailsPage>
  );
}

export default UserSessionDetails;
