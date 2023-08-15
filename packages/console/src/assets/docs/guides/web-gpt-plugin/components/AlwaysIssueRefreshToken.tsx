import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import useApi from '@/hooks/use-api';
import { GuideContext } from '@/pages/Applications/components/GuideV2';

// Used in the guide
// eslint-disable-next-line import/no-unused-modules
export default function AlwaysIssueRefreshToken() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    app: {
      id: appId,
      customClientMetadata: { alwaysIssueRefreshToken },
    },
  } = useContext(GuideContext);
  const [value, setValue] = useState(alwaysIssueRefreshToken ?? false);
  const api = useApi();
  const onSubmit = async (value: boolean) => {
    setValue(value);
    try {
      await api.patch(`api/applications/${appId}`, {
        json: {
          customClientMetadata: {
            alwaysIssueRefreshToken: value,
          },
        },
      });
      toast.success(t('general.saved'));
    } catch {
      setValue(!value);
    }
  };

  return (
    <FormField title="application_details.always_issue_refresh_token">
      <Switch
        label={t('application_details.always_issue_refresh_token_label')}
        checked={value}
        onChange={async ({ currentTarget: { checked } }) => onSubmit(checked)}
      />
    </FormField>
  );
}
