import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { GuideContext } from '@/components/Guide';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import useApi from '@/hooks/use-api';

export default function AlwaysIssueRefreshToken() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { app } = useContext(GuideContext);
  const { alwaysIssueRefreshToken = false } = app?.customClientMetadata ?? {};
  const [value, setValue] = useState(alwaysIssueRefreshToken);
  const api = useApi();

  const onSubmit = async (value: boolean) => {
    if (!app?.id) {
      return;
    }
    setValue(value);
    try {
      await api.patch(`api/applications/${app.id}`, {
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
