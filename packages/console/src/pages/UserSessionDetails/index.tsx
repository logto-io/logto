import { Theme, type GetUserSessionResponse, type UserProfileResponse } from '@logto/schemas';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';

import Delete from '@/assets/icons/delete.svg?react';
import SessionDarkIcon from '@/assets/icons/session-dark.svg?react';
import SessionIcon from '@/assets/icons/session.svg?react';
import DetailsPage from '@/components/DetailsPage';
import DetailsPageHeader from '@/components/DetailsPage/DetailsPageHeader';
import Card from '@/ds-components/Card';
import CodeEditor from '@/ds-components/CodeEditor';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import TabNav, { TabNavItem } from '@/ds-components/TabNav';
import { type RequestError } from '@/hooks/use-api';
import useTheme from '@/hooks/use-theme';
import { getUserTitle } from '@/utils/user';

import { getSessionDisplayInfo } from '../UserDetails/UserSettings/UserSessions/utils';

import RevokeSessionConfirmModal from './RevokeSessionConfirmModal';
import styles from './index.module.scss';

type PageTitleProps = {
  readonly user: UserProfileResponse;
  readonly session: GetUserSessionResponse;
};

function PageTitle({ user, session }: PageTitleProps) {
  const userName = getUserTitle(user);
  const sessionInfo = getSessionDisplayInfo(session);
  const sessionName = sessionInfo.name || session.payload.uid;

  return (
    <span>
      {userName} {'>'} {sessionName}
    </span>
  );
}

const getDetailsTabNavLink = (userId: string, sessionId: string) =>
  `/users/${userId}/sessions/${sessionId}`;

function UserSessionDetails() {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });
  const theme = useTheme();
  const navigate = useNavigate();
  const { mutate: mutateGlobal } = useSWRConfig();

  const { userId, sessionId } = useParams();

  const {
    data: userData,
    error: userError,
    isLoading: isUserLoading,
    mutate: mutateUser,
  } = useSWR<UserProfileResponse, RequestError>(userId && `api/users/${userId}`);

  const {
    data: sessionData,
    error: sessionError,
    isLoading: isSessionLoading,
    mutate: mutateSession,
  } = useSWR<GetUserSessionResponse, RequestError>(
    userId && sessionId && `api/users/${userId}/sessions/${sessionId}`
  );

  const isLoading = isUserLoading || isSessionLoading;
  const error = userError ?? sessionError;
  const sessionLocation = sessionData ? getSessionDisplayInfo(sessionData).location : '';
  const [showRevokeConfirmModal, setShowRevokeConfirmModal] = useState(false);
  const headerSubtitle = sessionData && (
    <span>
      {t('user_details.sessions.session_id_column')}{' '}
      <CopyToClipboard size="small" value={sessionData.payload.uid} />
    </span>
  );

  return (
    <DetailsPage
      backLink={`/users/${userId}`}
      backLinkTitle="user_details.page_title"
      isLoading={isLoading}
      error={error}
      onRetry={async () => {
        await Promise.all([mutateUser(), mutateSession()]);
      }}
    >
      {userData && sessionData && (
        <>
          <DetailsPageHeader
            icon={theme === Theme.Dark ? <SessionDarkIcon /> : <SessionIcon />}
            title={<PageTitle user={userData} session={sessionData} />}
            subtitle={headerSubtitle}
            identifier={{
              name: t('user_details.sessions.location_column'),
              value: sessionLocation || '-',
              copyToClipboard: false,
            }}
            actionMenuItems={[
              {
                title: 'user_details.sessions.revoke_session',
                icon: <Delete />,
                onClick: () => {
                  setShowRevokeConfirmModal(true);
                },
                type: 'danger',
              },
            ]}
          />
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
