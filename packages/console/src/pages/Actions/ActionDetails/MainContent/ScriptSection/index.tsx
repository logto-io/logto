/* Code Editor for the action script. */
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

import { actionCatalog } from '../../../constants';
import { CodeEditorLoadingContext } from '../../CodeEditorLoadingContext';
import { type ActionForm } from '../../type';
import { getActionModel } from '../../utils/config';
import { buildEnvironmentVariablesTypeDefinition } from '../../utils/type-definitions';

import ErrorContent from './ErrorContent';
import styles from './index.module.scss';
import useTestHandler from './use-test-handler';

function ScriptSection() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { watch, control } = useFormContext<ActionForm>();
  const actionType = watch('actionType');

  const envVariables = useWatch({
    control,
    name: 'environmentVariables',
  });

  const environmentVariablesTypeDefinition = useMemo(
    () => buildEnvironmentVariablesTypeDefinition(envVariables),
    [envVariables]
  );

  const activeModel = useMemo<ModelSettings>(() => {
    const model = getActionModel(actionType);
    const catalogItem = actionCatalog.find((item) => item.actionType === actionType);

    return {
      ...model,
      // Prefer the localized catalog name for the editor tab title.
      title: catalogItem ? String(t(catalogItem.name)) : model.title,
    };
  }, [actionType, t]);

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
      title: t('actions.tester.result_title'),
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
              restoreActionTip={t('actions.script.restore')}
              restoreActionSuccessTip={t('actions.script.restored')}
              actionButtons={
                <Button
                  icon={<RunIcon />}
                  size="small"
                  title="actions.tester.run_button"
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
