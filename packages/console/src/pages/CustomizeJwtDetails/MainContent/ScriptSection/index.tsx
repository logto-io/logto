/* Code Editor for the custom JWT claims script. */
import { LogtoJwtTokenKeyType } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import RunIcon from '@/assets/icons/start.svg?react';
import Button from '@/ds-components/Button';
import { CodeEditorLoadingContext } from '@/pages/CustomizeJwtDetails/CodeEditorLoadingContext';
import MonacoCodeEditor, {
  type DashboardProps,
  type ModelSettings,
} from '@/pages/CustomizeJwtDetails/MainContent/MonacoCodeEditor';
import { type JwtCustomizerForm } from '@/pages/CustomizeJwtDetails/type';
import {
  accessTokenJwtCustomizerModel,
  clientCredentialsModel,
} from '@/pages/CustomizeJwtDetails/utils/config';
import { buildEnvironmentVariablesTypeDefinition } from '@/pages/CustomizeJwtDetails/utils/type-definitions';

import ErrorContent from './ErrorContent';
import styles from './index.module.scss';
import useTestHandler from './use-test-handler';

function ScriptSection() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
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
      tokenType === LogtoJwtTokenKeyType.AccessToken
        ? accessTokenJwtCustomizerModel
        : clientCredentialsModel,
    [tokenType]
  );

  // Set the Monaco editor loaded state to true when the editor is mounted
  const { setIsMonacoLoaded } = useContext(CodeEditorLoadingContext);

  const onMountHandler = useCallback(() => {
    setIsMonacoLoaded(true);
  }, [setIsMonacoLoaded]);

  // Test handler
  const { onTestHandler, setTestResult, isLoading, testResult } = useTestHandler();

  const dashBoardProps = useMemo<DashboardProps | undefined>(() => {
    if (!testResult) {
      return;
    }

    return {
      title: t('jwt_claims.tester.result_title'),
      content: <ErrorContent testResult={testResult} />,
      onClose: () => {
        setTestResult(undefined);
      },
    };
  }, [setTestResult, t, testResult]);

  return (
    <div className={styles.scriptSection}>
      <div className={styles.fixHeightWrapper}>
        <Controller
          control={control}
          name="script"
          render={({ field: { onChange, value }, formState: { defaultValues } }) => (
            <MonacoCodeEditor
              className={classNames(styles.codeEditor)}
              enabledActions={['restore', 'copy']}
              models={[activeModel]}
              activeModelName={activeModel.name}
              value={value}
              environmentVariablesDefinition={environmentVariablesTypeDefinition}
              actionButtons={
                <Button
                  icon={<RunIcon />}
                  size="small"
                  title="jwt_claims.tester.run_button"
                  type="primary"
                  isLoading={isLoading}
                  onClick={onTestHandler}
                />
              }
              dashboard={dashBoardProps}
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
      </div>
    </div>
  );
}

export default ScriptSection;
