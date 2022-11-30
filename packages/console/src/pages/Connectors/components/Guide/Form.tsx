import type { ConnectorFactoryResponse } from '@logto/schemas';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import CodeEditor from '@/components/CodeEditor';
import FormField from '@/components/FormField';
import TextInput from '@/components/TextInput';

import * as styles from './index.module.scss';
import type { CreateConnectorForm } from './types';

type Props = {
  connector: ConnectorFactoryResponse;
};

const Form = ({ connector }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { configTemplate, isStandard } = connector;
  const { control, register } = useFormContext<CreateConnectorForm>();
  const [darkVisible, setDarkVisible] = useState(false);

  const toggleDarkVisible = () => {
    setDarkVisible((previous) => !previous);
  };

  return (
    <div>
      {isStandard && (
        <>
          <FormField isRequired title="connectors.guide.name">
            <TextInput
              placeholder={t('connectors.guide.name')}
              {...register('name', { required: true })}
            />
            <div className={styles.tip}>{t('connectors.guide.name_tip')}</div>
          </FormField>
          <FormField title="connectors.guide.logo">
            <TextInput
              placeholder={t('connectors.guide.logo_placelholder')}
              {...register('logo')}
            />
            <div className={styles.tip}>{t('connectors.guide.logo_tip')}</div>
          </FormField>
          {!darkVisible && (
            <Button
              size="small"
              type="text"
              title="connectors.guide.logo_dark_show"
              onClick={toggleDarkVisible}
            />
          )}
          {darkVisible && (
            <FormField title="connectors.guide.logo_dark">
              <TextInput
                placeholder={t('connectors.guide.logo_dark_placelholder')}
                {...register('logoDark')}
              />
              <div className={styles.tip}>{t('connectors.guide.logo_dark_tip')}</div>
            </FormField>
          )}
          {darkVisible && (
            <Button
              size="small"
              type="text"
              title="connectors.guide.logo_dark_collapse"
              onClick={toggleDarkVisible}
            />
          )}
          <FormField isRequired title="connectors.guide.target">
            <TextInput {...register('target', { required: true })} />
            <div className={styles.tip}>{t('connectors.guide.target_tip')}</div>
          </FormField>
        </>
      )}
      <FormField isRequired title="connectors.guide.config">
        <Controller
          name="config"
          control={control}
          defaultValue={configTemplate}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <CodeEditor language="json" value={value} onChange={onChange} />
          )}
        />
      </FormField>
    </div>
  );
};

export default Form;
