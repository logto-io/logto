import classNames from 'classnames';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import MonacoCodeEditor, { type ModelSettings } from '@/components/MonacoCodeEditor';

import { type ActionForm } from '../../../type';
import { getDefaultContextSample } from '../../../utils/config';
import tabContentStyles from '../index.module.scss';

import styles from './index.module.scss';

type Props = {
  readonly isActive: boolean;
};

function TestTab({ isActive }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { watch, control, formState } = useFormContext<ActionForm>();
  const actionType = watch('actionType');

  const contextSampleModel: ModelSettings = {
    name: 'event-sample.json',
    title: t('actions.test_context.input_field_title'),
    language: 'json',
    defaultValue: JSON.stringify(getDefaultContextSample(actionType), null, 2),
  };

  return (
    <div className={classNames(tabContentStyles.tabContent, isActive && tabContentStyles.active)}>
      <div className={tabContentStyles.description}>{t('actions.test_context.subtitle')}</div>
      <div className={classNames(tabContentStyles.flexColumn, tabContentStyles.flexGrow)}>
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
                return t('actions.form_error.invalid_json');
              }
            },
          }}
          render={({ field: { value, onChange } }) => (
            <MonacoCodeEditor
              className={styles.codeEditor}
              enabledActions={['restore', 'copy']}
              models={[contextSampleModel]}
              activeModelName={contextSampleModel.name}
              value={value}
              restoreActionTip={t('actions.script.restore')}
              restoreActionSuccessTip={t('actions.script.restored')}
              onChange={(newValue) => {
                onChange(newValue ?? '');
              }}
            />
          )}
        />
        {formState.errors.contextSample && (
          <div className={styles.error}>{formState.errors.contextSample.message}</div>
        )}
      </div>
    </div>
  );
}

export default TestTab;
