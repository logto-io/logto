import type { ConnectorConfigFormItem } from '@logto/connector-kit';
import type { ConnectorFactoryResponse } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CodeEditor from '@/components/CodeEditor';
import FormField from '@/components/FormField';
import { jsonValidator } from '@/utils/validator';

import type { ConnectorFormType } from '../../types';
import ConfigFormItems from '../ConfigForm';

type Props = {
  configTemplate?: ConnectorFactoryResponse['configTemplate'];
  formItems?: ConnectorConfigFormItem[];
  className?: string;
};

const ConfigForm = ({ configTemplate, formItems, className }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    formState: { errors },
  } = useFormContext<ConnectorFormType>();

  return (
    <div className={className}>
      {formItems ? (
        <ConfigFormItems formItems={formItems} />
      ) : (
        <FormField title="connectors.guide.config">
          <Controller
            name="config"
            control={control}
            defaultValue={configTemplate}
            rules={{
              validate: (value) => jsonValidator(value) || t('errors.invalid_json_format'),
            }}
            render={({ field: { onChange, value } }) => (
              <CodeEditor
                hasError={Boolean(errors.config)}
                errorMessage={errors.config?.message}
                language="json"
                value={value}
                onChange={onChange}
              />
            )}
          />
        </FormField>
      )}
    </div>
  );
};

export default ConfigForm;
