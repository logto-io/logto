import { Theme } from '@logto/schemas';
import { Editor } from '@monaco-editor/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/ds-components/Card';
import FormField from '@/ds-components/FormField';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import Switch from '@/ds-components/Switch';
import useTheme from '@/hooks/use-theme';

import { type InlineHookForm, onExecutionErrorOptions } from '../../type';
import { environmentVariablesCodeExample, sampleCodeEditorOptions } from '../../utils/config';

import EnvironmentVariablesField from './EnvironmentVariablesField';
import styles from './index.module.scss';

function SettingsSection() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const theme = useTheme();
  const editorTheme = theme === Theme.Light ? 'vs' : 'logto-dark';
  const { control } = useFormContext<InlineHookForm>();

  return (
    <div className={styles.settingsSection}>
      <Card className={styles.card}>
        <div className={styles.cardTitle}>{t('inline_hooks.settings.title')}</div>
        <div className={styles.fieldGroup}>
          <FormField title="inline_hooks.settings.enabled.title">
            <Controller
              control={control}
              name="enabled"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  description="inline_hooks.settings.enabled.description"
                  onChange={(event) => {
                    field.onChange(event.currentTarget.checked);
                  }}
                />
              )}
            />
          </FormField>
          <FormField
            title="inline_hooks.settings.on_execution_error.title"
            description="inline_hooks.settings.on_execution_error.description"
          >
            <Controller
              control={control}
              name="onExecutionError"
              render={({ field }) => (
                <RadioGroup name="onExecutionError" value={field.value} onChange={field.onChange}>
                  {onExecutionErrorOptions.map((option) => (
                    <Radio
                      key={option}
                      value={option}
                      title={`inline_hooks.settings.on_execution_error.${option}`}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormField>
        </div>
      </Card>

      <Card className={styles.card}>
        <div className={styles.cardTitle}>
          {t('inline_hooks.settings.environment_variables.title')}
        </div>
        <div className={styles.cardDescription}>
          {t('inline_hooks.settings.environment_variables.subtitle')}
        </div>
        <EnvironmentVariablesField className={styles.envVariablesField} />
        <div className={styles.cardDescription}>
          {t('inline_hooks.settings.environment_variables.sample_code')}
        </div>
        <Editor
          language="typescript"
          className={styles.sampleCode}
          value={environmentVariablesCodeExample}
          path="file:///inline-hook-env-variables-sample.js"
          height="280px"
          theme={editorTheme}
          options={sampleCodeEditorOptions}
        />
      </Card>

      <Card className={styles.card}>
        <div className={styles.cardTitle}>{t('inline_hooks.settings.context_sample.title')}</div>
        <div className={styles.cardDescription}>
          {t('inline_hooks.settings.context_sample.subtitle')}
        </div>
        <FormField title="inline_hooks.settings.context_sample.input_field_title">
          <Controller
            control={control}
            name="contextSample"
            rules={{
              validate: (value) => {
                if (!value) {
                  return true;
                }

                try {
                  JSON.parse(value);
                  return true;
                } catch {
                  return t('inline_hooks.form_error.invalid_json');
                }
              },
            }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <>
                <div className={styles.contextSampleEditor}>
                  <Editor
                    language="json"
                    height="240px"
                    theme={editorTheme}
                    value={value}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      tabSize: 2,
                      scrollBeyondLastLine: false,
                      wordWrap: 'on',
                    }}
                    onChange={(newValue) => {
                      onChange(newValue ?? '');
                    }}
                  />
                </div>
                {error?.message && <div className={styles.error}>{error.message}</div>}
              </>
            )}
          />
        </FormField>
      </Card>
    </div>
  );
}

export default SettingsSection;
