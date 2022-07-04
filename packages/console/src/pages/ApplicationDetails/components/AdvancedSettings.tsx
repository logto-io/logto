import { SnakeCaseOidcConfig } from '@logto/schemas';
import React from 'react';

import CopyToClipboard from '@/components/CopyToClipboard';
import FormField from '@/components/FormField';

import * as styles from '../index.module.scss';

type Props = {
  oidcConfig: SnakeCaseOidcConfig;
};

const AdvancedSettings = ({ oidcConfig }: Props) => {
  return (
    <FormField title="admin_console.application_details.token_endpoint">
      <CopyToClipboard
        className={styles.textField}
        value={oidcConfig.token_endpoint}
        variant="border"
      />
    </FormField>
  );
};

export default AdvancedSettings;
