import { Application, SnakeCaseOidcConfig } from '@logto/schemas';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import CopyToClipboard from '@/components/CopyToClipboard';
import FormField from '@/components/FormField';
import UnsavedChangesAlertModal from '@/components/UnsavedChangesAlertModal';

import * as styles from '../index.module.scss';

type Props = {
  oidcConfig: SnakeCaseOidcConfig;
  defaultData: Application;
  isDeleted: boolean;
};

const AdvancedSettings = ({ oidcConfig, defaultData, isDeleted }: Props) => {
  const {
    reset,
    formState: { isDirty },
  } = useFormContext<Application>();

  useEffect(() => {
    reset(defaultData);

    return () => {
      reset(defaultData);
    };
  }, [reset, defaultData]);

  return (
    <>
      <FormField title="application_details.token_endpoint">
        <CopyToClipboard
          className={styles.textField}
          value={oidcConfig.token_endpoint}
          variant="border"
        />
      </FormField>
      <UnsavedChangesAlertModal hasUnsavedChanges={!isDeleted && isDirty} />
    </>
  );
};

export default AdvancedSettings;
