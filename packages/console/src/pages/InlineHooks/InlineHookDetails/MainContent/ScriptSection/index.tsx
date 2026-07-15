import classNames from 'classnames';
import { useCallback, useContext, useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import MonacoCodeEditor, { type ModelSettings } from '@/components/MonacoCodeEditor';

import { CodeEditorLoadingContext } from '../../CodeEditorLoadingContext';
import { type InlineHookForm } from '../../type';
import { getInlineHookModel } from '../../utils/config';
import { buildEnvironmentVariablesTypeDefinition } from '../../utils/type-definitions';

import styles from './index.module.scss';

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
