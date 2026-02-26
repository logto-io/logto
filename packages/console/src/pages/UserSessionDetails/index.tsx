import { Theme, type GetUserSessionResponse } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useSWR from 'swr';

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

import { getSessionDisplayInfo } from '../UserDetails/UserSettings/UserSessions/utils';

import styles from './index.module.scss';

type PageTitleProps = {
  readonly userName: string;
  readonly session: GetUserSessionResponse;
};

function PageTitle({ userName, session }: PageTitleProps) {
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

  const { userId, sessionId } = useParams();

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
  const sessionLocation = sessionData ? getSessionDisplayInfo(sessionData).location : '';
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
        await mutateSession();
      }}
    >
      {sessionData && (
        <>
          <DetailsPageHeader
            icon={theme === Theme.Dark ? <SessionDarkIcon /> : <SessionIcon />}
            title={<PageTitle userName={userId ?? '-'} session={sessionData} />}
            subtitle={headerSubtitle}
            identifier={{
              name: t('user_details.sessions.location_column'),
              value: sessionLocation || '-',
              copyToClipboard: false,
            }}
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
    </DetailsPage>
  );
}

export default UserSessionDetails;
