import type { ConnectorFactoryResponse } from '@logto/schemas';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CaretDown from '@/assets/images/caret-down.svg';
import CaretUp from '@/assets/images/caret-up.svg';
import Button from '@/components/Button';
import CodeEditor from '@/components/CodeEditor';
import FormField from '@/components/FormField';
import Select from '@/components/Select';
import TextInput from '@/components/TextInput';

import type { ConnectorFormType } from '../../types';
import { SyncProfileMode } from '../../types';
import * as styles from './index.module.scss';

type Props = {
  connector: ConnectorFactoryResponse;
  isAllowEditTarget?: boolean;
};

const ConnectorForm = ({ connector, isAllowEditTarget }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { configTemplate, isStandard } = connector;
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ConnectorFormType>();
  const [darkVisible, setDarkVisible] = useState(false);

  const toggleDarkVisible = () => {
    setDarkVisible((previous) => !previous);
  };

  const syncProfileOptions = [
    {
      value: SyncProfileMode.OnlyAtRegister,
      title: t('connectors.guide.sync_profile_only_at_register'),
    },
    {
      value: SyncProfileMode.EachSignIn,
      title: t('connectors.guide.sync_profile_each_sign_in'),
    },
  ];

  return (
    <div>
      {isStandard && (
        <>
          <FormField isRequired title="connectors.guide.name">
            <TextInput
              placeholder={t('connectors.guide.name')}
              hasError={Boolean(errors.name)}
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
          {darkVisible && (
            <FormField title="connectors.guide.logo_dark">
              <TextInput
                placeholder={t('connectors.guide.logo_dark_placelholder')}
                {...register('logoDark')}
              />
              <div className={styles.tip}>{t('connectors.guide.logo_dark_tip')}</div>
            </FormField>
          )}
          <Button
            size="small"
            type="text"
            title={
              darkVisible
                ? 'connectors.guide.logo_dark_collapse'
                : 'connectors.guide.logo_dark_show'
            }
            trailingIcon={darkVisible ? <CaretUp /> : <CaretDown />}
            onClick={toggleDarkVisible}
          />
          <FormField isRequired title="connectors.guide.target">
            <TextInput
              hasError={Boolean(errors.target)}
              disabled={!isAllowEditTarget}
              {...register('target', { required: true })}
            />
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
      <FormField isRequired title="connectors.guide.sync_profile">
        <Controller
          name="syncProfile"
          control={control}
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Select options={syncProfileOptions} value={value} onChange={onChange} />
          )}
        />
      </FormField>
    </div>
  );
};

export default ConnectorForm;
