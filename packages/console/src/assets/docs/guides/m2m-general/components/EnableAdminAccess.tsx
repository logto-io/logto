import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { GuideContext } from '@/components/Guide';
import FormField from '@/ds-components/FormField';
import Switch from '@/ds-components/Switch';
import useApi from '@/hooks/use-api';

export default function EnableAdminAccess() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { app } = useContext(GuideContext);
  const { id: appId, isAdmin = false } = app ?? {};
  const [value, setValue] = useState(isAdmin);
  const api = useApi();

  const onSubmit = async (value: boolean) => {
    if (!appId) {
      return;
    }
    setValue(value);
    try {
      await api.patch(`api/applications/${appId}`, {
        json: {
          isAdmin: value,
        },
      });
      toast.success(t('general.saved'));
    } catch {
      setValue(!value);
    }
  };

  return (
    <FormField title="application_details.enable_admin_access">
      <Switch
        label={t('application_details.enable_admin_access_label')}
        checked={value}
        onChange={async ({ currentTarget: { checked } }) => onSubmit(checked)}
      />
    </FormField>
  );
}
