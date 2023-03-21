import type { ConnectorConfigFormItem } from '@logto/connector-kit';
import { ConnectorConfigFormItemType } from '@logto/connector-kit';
import { useMemo } from 'react';
import type { RegisterOptions } from 'react-hook-form';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CodeEditor from '@/components/CodeEditor';
import DangerousRaw from '@/components/DangerousRaw';
import FormField from '@/components/FormField';
import Select from '@/components/Select';
import Switch from '@/components/Switch';
import TextInput from '@/components/TextInput';
import Textarea from '@/components/Textarea';
import { jsonValidator } from '@/utils/validator';

import type { ConnectorFormType } from '../../types';
import * as styles from './ConfigForm.module.scss';

type Props = {
  formItems: ConnectorConfigFormItem[];
};

const ConfigForm = ({ formItems }: Props) => {
  const {
    watch,
    register,
    control,
    formState: { errors },
  } = useFormContext<ConnectorFormType>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const values = watch();

  const filteredFormItems = useMemo(() => {
    return formItems.filter((item) => {
      if (!item.showConditions) {
        return true;
      }

      return item.showConditions.every(({ expectValue, targetKey }) => {
        const targetValue = values[targetKey];

        return targetValue === expectValue;
      });
    });
  }, [formItems, values]);

  const renderFormItem = (item: ConnectorConfigFormItem) => {
    const hasError = Boolean(errors[item.key]);
    const errorMessage = errors[item.key]?.message;

    const buildCommonProperties = (registerOptions?: RegisterOptions) => ({
      ...register(item.key, { required: item.required, ...registerOptions }),
      placeholder: item.placeholder,
      hasError,
    });

    if (item.type === ConnectorConfigFormItemType.Text) {
      return <TextInput {...buildCommonProperties()} />;
    }

    if (item.type === ConnectorConfigFormItemType.MultilineText) {
      return <Textarea rows={5} {...buildCommonProperties()} />;
    }

    if (item.type === ConnectorConfigFormItemType.Number) {
      return <TextInput {...buildCommonProperties({ valueAsNumber: true })} />;
    }

    return (
      <Controller
        name={item.key}
        control={control}
        rules={{
          required: item.required,
          validate:
            item.type === ConnectorConfigFormItemType.Json
              ? (value) =>
                  (typeof value === 'string' && jsonValidator(value)) ||
                  t('errors.invalid_json_format')
              : undefined,
        }}
        render={({ field: { onChange, value } }) => {
          if (item.type === ConnectorConfigFormItemType.Switch) {
            return (
              <Switch
                label={item.label}
                checked={typeof value === 'boolean' ? value : false}
                onChange={({ currentTarget: { checked } }) => {
                  onChange(checked);
                }}
              />
            );
          }

          if (item.type === ConnectorConfigFormItemType.Select) {
            return (
              <Select
                options={item.selectItems}
                value={typeof value === 'string' ? value : undefined}
                hasError={hasError}
                onChange={onChange}
              />
            );
          }

          if (item.type === ConnectorConfigFormItemType.Json) {
            return (
              <CodeEditor
                language="json"
                hasError={hasError}
                errorMessage={errorMessage}
                value={typeof value === 'string' ? value : '{}'}
                onChange={onChange}
              />
            );
          }

          // Default (unknown) type is "Text"
          // This will happen when connector's version is ahead of AC
          return (
            <TextInput
              hasError={hasError}
              value={typeof value === 'string' ? value : ''}
              onChange={onChange}
            />
          );
        }}
      />
    );
  };

  return (
    <>
      {filteredFormItems.map((item) => (
        <FormField
          key={item.key}
          isRequired={item.required}
          title={
            <DangerousRaw>
              {item.type !== ConnectorConfigFormItemType.Switch && item.label}
            </DangerousRaw>
          }
        >
          {renderFormItem(item)}
          {Boolean(item.description) && (
            <div className={styles.description}>{item.description}</div>
          )}
        </FormField>
      ))}
    </>
  );
};

export default ConfigForm;
