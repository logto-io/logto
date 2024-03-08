/* Code Editor for the custom JWT claims script. */
import { useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';

import MonacoCodeEditor, { type Model } from './MonacoCodeEditor';
import { userJwtFile, machineToMachineJwtFile, JwtTokenType } from './config';
import * as styles from './index.module.scss';
import { type JwtClaimsFormType } from './type';

const titlePhrases = Object.freeze({
  [JwtTokenType.UserAccessToken]: 'user_jwt',
  [JwtTokenType.MachineToMachineAccessToken]: 'machine_to_machine_jwt',
});

const userJwtModel = userJwtFile;

function ScriptSection() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { watch, control } = useFormContext<JwtClaimsFormType>();

  const tokenType = watch('tokenType');

  const activeModel = useMemo<Model>(
    () => (tokenType === JwtTokenType.UserAccessToken ? userJwtFile : machineToMachineJwtFile),
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
        shouldUnregister // Unregister the input value when the token type changes
        control={control}
        name="script"
        render={({ field: { onChange, value } }) => (
          <MonacoCodeEditor
            className={styles.flexGrow}
            enabledActions={['clear', 'copy']}
            models={[
              {
                ...activeModel,
                value: value ?? activeModel.defaultValue,
              },
            ]}
            onChange={onChange}
          />
        )}
      />
    </Card>
  );
}

export default ScriptSection;
