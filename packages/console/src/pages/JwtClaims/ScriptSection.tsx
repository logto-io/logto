/* Code Editor for the custom JWT claims script. */
import { LogtoJwtTokenPath } from '@logto/schemas';
import { useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';

import MonacoCodeEditor, { type ModelSettings } from './MonacoCodeEditor';
import { userJwtFile, machineToMachineJwtFile } from './config';
import * as styles from './index.module.scss';
import { type JwtClaimsFormType } from './type';

const titlePhrases = Object.freeze({
  [LogtoJwtTokenPath.AccessToken]: 'user_jwt',
  [LogtoJwtTokenPath.ClientCredentials]: 'machine_to_machine_jwt',
});

function ScriptSection() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { watch, control } = useFormContext<JwtClaimsFormType>();
  const tokenType = watch('tokenType');

  const activeModel = useMemo<ModelSettings>(
    () => (tokenType === LogtoJwtTokenPath.AccessToken ? userJwtFile : machineToMachineJwtFile),
    [tokenType]
  );
  return (
    <Card className={styles.codePanel}>
      <div className={styles.cardTitle}>
        {t('jwt_claims.code_editor_title', {
          token: t(`jwt_claims.${titlePhrases[tokenType]}`),
        })}
      </div>
      <Controller
        // Force rerender the controller when the token type changes
        // Otherwise the input field will not be updated
        key={tokenType}
        shouldUnregister
        control={control}
        name="script"
        render={({ field: { onChange, value } }) => (
          <MonacoCodeEditor
            className={styles.flexGrow}
            enabledActions={['clear', 'copy']}
            models={[activeModel]}
            activeModelName={activeModel.name}
            value={value}
            onChange={(newValue) => {
              onChange(newValue);
            }}
          />
        )}
      />
    </Card>
  );
}

export default ScriptSection;
