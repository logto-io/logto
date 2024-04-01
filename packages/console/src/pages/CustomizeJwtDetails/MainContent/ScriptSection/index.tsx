/* Code Editor for the custom JWT claims script. */
import { LogtoJwtTokenPath } from '@logto/schemas';
import { useCallback, useContext, useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { CodeEditorLoadingContext } from '@/pages/CustomizeJwtDetails/CodeEditorLoadingContext';
import MonacoCodeEditor, { type ModelSettings } from '@/pages/CustomizeJwtDetails/MonacoCodeEditor';
import { type JwtCustomizerForm } from '@/pages/CustomizeJwtDetails/type';
import {
  accessTokenJwtCustomizerModel,
  clientCredentialsModel,
} from '@/pages/CustomizeJwtDetails/utils/config';
import { buildEnvironmentVariablesTypeDefinition } from '@/pages/CustomizeJwtDetails/utils/type-definitions';

import * as styles from './index.module.scss';

function ScriptSection() {
  const { watch, control } = useFormContext<JwtCustomizerForm>();
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

  // Get the active model based on the token type
  const activeModel = useMemo<ModelSettings>(
    () =>
      tokenType === LogtoJwtTokenPath.AccessToken
        ? accessTokenJwtCustomizerModel
        : clientCredentialsModel,
    [tokenType]
  );

  // Set the Monaco editor loaded state to true when the editor is mounted
  const { setIsMonacoLoaded } = useContext(CodeEditorLoadingContext);

  const onMountHandler = useCallback(() => {
    setIsMonacoLoaded(true);
  }, [setIsMonacoLoaded]);

  return (
    <Controller
      // Force rerender the controller when the token type changes
      // Otherwise the input field will not be updated
      key={tokenType}
      control={control}
      name="script"
      render={({ field: { onChange, value }, formState: { defaultValues } }) => (
        <MonacoCodeEditor
          className={styles.flexGrow}
          enabledActions={['restore', 'copy']}
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
  );
}

export default ScriptSection;
