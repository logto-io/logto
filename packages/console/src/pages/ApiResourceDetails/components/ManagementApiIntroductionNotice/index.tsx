import { Trans, useTranslation } from 'react-i18next';

import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useUserPreferences from '@/hooks/use-user-preferences';

import * as styles from './index.module.scss';

function ManagementApiIntroductionNotice() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const {
    data: { managementApiIntroductionNoticeConfirmed },
    update,
  } = useUserPreferences();

  if (managementApiIntroductionNoticeConfirmed) {
    return null;
  }

  return (
    <InlineNotification
      action="general.got_it"
      className={styles.notice}
      onClick={() => {
        void update({ managementApiIntroductionNoticeConfirmed: true });
      }}
    >
      <Trans
        components={{
          a: <TextLink to={getDocumentationUrl('/docs/recipes/interact-with-management-api')} />,
        }}
      >
        {t('api_resource_details.management_api_notice', {
          link: t('api_resource_details.management_api_notice_link_text'),
        })}
      </Trans>
    </InlineNotification>
  );
}

export default ManagementApiIntroductionNotice;
