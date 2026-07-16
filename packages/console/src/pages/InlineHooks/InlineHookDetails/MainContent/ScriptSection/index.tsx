/* Code Editor for the inline hook script. */
import classNames from 'classnames';
import { useCallback, useContext, useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import RunIcon from '@/assets/icons/start.svg?react';
import MonacoCodeEditor, {
  type DashboardProps,
  type ModelSettings,
} from '@/components/MonacoCodeEditor';
import Button from '@/ds-components/Button';

import { CodeEditorLoadingContext } from '../../CodeEditorLoadingContext';
import { type InlineHookForm } from '../../type';
import { getInlineHookModel } from '../../utils/config';
import { buildEnvironmentVariablesTypeDefinition } from '../../utils/type-definitions';

import ErrorContent from './ErrorContent';
import styles from './index.module.scss';
import useTestHandler from './use-test-handler';

function ScriptSection() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { watch, control } = useFormContext<InlineHookForm>();
  const hookType = watch('hookType');

  const envVariables = useWatch({
    control,
    name: 'environmentVariables',
  });

  const environmentVariablesTypeDefinition = useMemo(
    () => buildEnvironmentVariablesTypeDefinition(envVariables),
    [envVariables]
  );

  const activeModel = useMemo<ModelSettings>(() => getInlineHookModel(hookType), [hookType]);

  const { setIsMonacoLoaded } = useContext(CodeEditorLoadingContext);

  const onMountHandler = useCallback(() => {
    setIsMonacoLoaded(true);
  }, [setIsMonacoLoaded]);

  const { onTestHandler, setTestResult, isLoading, testResult } = useTestHandler();

  const dashBoardProps = useMemo<DashboardProps | undefined>(() => {
    if (!testResult) {
      return;
    }

    return {
      title: t('inline_hooks.tester.result_title'),
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
              restoreActionTip={t('inline_hooks.script.restore')}
              restoreActionSuccessTip={t('inline_hooks.script.restored')}
              actionButtons={
                <Button
                  icon={<RunIcon />}
                  size="small"
                  title="inline_hooks.tester.run_button"
                  type="primary"
                  isLoading={isLoading}
                  onClick={onTestHandler}
                />
              }
              dashboard={dashBoardProps}
              onChange={(newValue) => {
                if (newValue === activeModel.defaultValue && !defaultValues?.script) {
                  onChange('');
                  return;
                }

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
