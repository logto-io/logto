import { Trans, useTranslation } from 'react-i18next';

import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useUserPreferences from '@/hooks/use-user-preferences';

function ManagementApiNotice() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const { data, isLoading, update } = useUserPreferences();
  const { managementApiAcknowledged } = data;

  if (isLoading || managementApiAcknowledged) {
    return null;
  }

  const learnMoreLink = getDocumentationUrl('/docs/recipes/interact-with-management-api');

  return (
    <InlineNotification
      action="general.got_it"
      onClick={() => {
        void update({ managementApiAcknowledged: true });
      }}
    >
      <Trans
        components={{
          a: <TextLink href={learnMoreLink} targetBlank="noopener" />,
        }}
      >
        {t('api_resource_details.management_api_notice')}
      </Trans>
    </InlineNotification>
  );
}

export default ManagementApiNotice;
