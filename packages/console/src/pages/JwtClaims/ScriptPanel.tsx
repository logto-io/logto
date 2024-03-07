/* Code Editor for the custom JWT claims script. */
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
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

function ScriptPanel() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { watch } = useFormContext<JwtClaimsFormType>();
  const tokenType = watch('tokenType');

  // TODO: API integration, read/write the custom claims code value
  const activeModel = useMemo<Model>(() => {
    return tokenType === JwtTokenType.UserAccessToken ? userJwtFile : machineToMachineJwtFile;
  }, [tokenType]);

  return (
    <Card className={styles.codePanel}>
      <div className={styles.cardTitle}>
        {t('jwt_claims.code_editor_title', {
          token: t(`jwt_claims.${titlePhrases[tokenType]}`),
        })}
      </div>
      <MonacoCodeEditor className={styles.flexGrow} models={[activeModel]} />
    </Card>
  );
}

export default ScriptPanel;
