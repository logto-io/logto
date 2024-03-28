/* Code Editor for the custom JWT claims script. */
import { LogtoJwtTokenPath } from '@logto/schemas';
import { useMemo, useContext, useCallback } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';

import { CodeEditorLoadingContext } from './CodeEditorLoadingContext';
import MonacoCodeEditor, { type ModelSettings } from './MonacoCodeEditor';
import * as styles from './index.module.scss';
import { type JwtClaimsFormType } from './type';
import { accessTokenJwtCustomizerModel, clientCredentialsModel } from './utils/config';
import { buildEnvironmentVariablesTypeDefinition } from './utils/type-definitions';

const titlePhrases = Object.freeze({
  [LogtoJwtTokenPath.AccessToken]: 'user_jwt',
  [LogtoJwtTokenPath.ClientCredentials]: 'machine_to_machine_jwt',
});

function ScriptSection() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { watch, control } = useFormContext<JwtClaimsFormType>();

  const tokenType = watch('tokenType');

  // Need to use useWatch hook to subscribe the mutation of the environmentVariables field
  // Otherwise, the default watch function's return value won't mutate when the environmentVariables field changes
  const envVariables = useWatch({
    control,
    name: 'environmentVariables',
  });

  const environmentVariablesTypeDefinition = useMemo(
    () => buildEnvironmentVariablesTypeDefinition(envVariables),
    [envVariables]
  );

  const { setIsMonacoLoaded } = useContext(CodeEditorLoadingContext);

  const activeModel = useMemo<ModelSettings>(
    () =>
      tokenType === LogtoJwtTokenPath.AccessToken
        ? accessTokenJwtCustomizerModel
        : clientCredentialsModel,
    [tokenType]
  );

  const onMountHandler = useCallback(() => {
    setIsMonacoLoaded(true);
  }, [setIsMonacoLoaded]);

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
        control={control}
        name="script"
        render={({ field: { onChange, value }, formState: { defaultValues } }) => (
          <MonacoCodeEditor
            className={styles.flexGrow}
            enabledActions={['clear', 'copy']}
            models={[activeModel]}
            activeModelName={activeModel.name}
            value={value}
            environmentVariablesDefinition={environmentVariablesTypeDefinition}
            onChange={(newValue) => {
              // If the value is the same as the default code and the original form script value is undefined, reset the value to undefined as well
              if (newValue === activeModel.defaultValue && !defaultValues?.script) {
                onChange('');
                return;
              }

              // Input value should not be undefined for react-hook-form @see https://react-hook-form.com/docs/usecontroller/controller
              onChange(newValue ?? '');
            }}
            onMountHandler={onMountHandler}
          />
        )}
      />
    </Card>
  );
}

export default ScriptSection;
