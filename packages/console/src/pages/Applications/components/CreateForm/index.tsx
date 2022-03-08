import { ApplicationType } from '@logto/schemas';
import React from 'react';
import { useController, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Card from '@/components/Card';
import CardTitle from '@/components/CardTitle';
import FormField from '@/components/FormField';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import Close from '@/icons/Close';
import { applicationTypeI18nKey } from '@/types/applications';

import TypeDescription from '../TypeDescription';
import * as styles from './index.module.scss';

type FormData = {
  type: ApplicationType;
  name: string;
  description?: string;
};

type Props = {
  onClose?: () => void;
};

const CreateForm = ({ onClose }: Props) => {
  const { handleSubmit, control } = useForm<FormData>();
  const {
    field: { onChange, value },
  } = useController({ name: 'type', control });
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  return (
    <Card className={styles.card}>
      <div className={styles.headline}>
        <CardTitle title="applications.create" subtitle="applications.subtitle" />
        <Close onClick={onClose} />
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <FormField title="admin_console.applications.select_application_type">
          <RadioGroup name="application_type" value={value} onChange={onChange}>
            {Object.values(ApplicationType).map((value) => (
              <Radio key={value} title={t(`${applicationTypeI18nKey[value]}.title`)} value={value}>
                <TypeDescription
                  subtitle={t(`${applicationTypeI18nKey[value]}.subtitle`)}
                  description={t(`${applicationTypeI18nKey[value]}.description`)}
                />
              </Radio>
            ))}
          </RadioGroup>
        </FormField>
        <button type="submit">Submit</button>
      </form>
    </Card>
  );
};

export default CreateForm;
