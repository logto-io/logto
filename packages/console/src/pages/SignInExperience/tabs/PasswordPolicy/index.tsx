import { PasswordPolicyChecker } from '@logto/core-kit';
import { cond } from '@silverhand/essentials';
import { type ChangeEvent, type ReactNode } from 'react';
import { Controller, type FieldPath, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import PageMeta from '@/components/PageMeta';
import Card from '@/ds-components/Card';
import Checkbox from '@/ds-components/Checkbox/Checkbox';
import FormField from '@/ds-components/FormField';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TabWrapper from '@/ds-components/TabWrapper';
import TextInput from '@/ds-components/TextInput';
import Textarea from '@/ds-components/Textarea';

import { type SignInExperienceForm } from '../../types';
import * as commonStyles from '../index.module.scss';

import * as styles from './index.module.scss';

type PasswordOptionProps = {
  name: FieldPath<SignInExperienceForm>;
  title: string;
  description: string;
  children?: ReactNode;
};

/** A display component for password policy options with a title and description. */
function PasswordOption({ name, title, description, children }: PasswordOptionProps) {
  const { control } = useFormContext<SignInExperienceForm>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <Checkbox
          className={styles.passwordOption}
          label={
            <div className={styles.label}>
              <div className={styles.title}>{title}</div>
              <div className={styles.description}>{description}</div>
              {children}
            </div>
          }
          checked={Boolean(value)}
          onChange={onChange}
        />
      )}
    />
  );
}

type Props = {
  isActive: boolean;
};

function PasswordPolicy({ isActive }: Props) {
  const {
    control,
    register,
    getValues,
    formState: { errors },
  } = useFormContext<SignInExperienceForm>();
  const maxPasswordLength = getValues('passwordPolicy.length.max');
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.sign_in_exp.password_policy',
  });

  return (
    <TabWrapper isActive={isActive} className={commonStyles.tabContent}>
      {isActive && (
        <PageMeta titleKey={['sign_in_exp.tabs.password_policy', 'sign_in_exp.page_title']} />
      )}
      <Card>
        <div className={commonStyles.title}>{t('password_requirements')}</div>
        <FormField title="sign_in_exp.password_policy.minimum_length">
          <div className={commonStyles.formFieldDescription}>
            {t('minimum_length_description', { max: maxPasswordLength })}
          </div>
          <Controller
            name="passwordPolicy.length.min"
            control={control}
            rules={{
              min: 1,
              max: maxPasswordLength,
            }}
            render={({ field: { onChange, value, name } }) => (
              <TextInput
                name={name}
                type="number"
                value={String(value)}
                error={
                  errors.passwordPolicy?.length?.min &&
                  t('minimum_length_error', { min: 1, max: maxPasswordLength })
                }
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  onChange(Number(event.target.value));
                }}
              />
            )}
          />
        </FormField>
        <FormField title="sign_in_exp.password_policy.minimum_required_char_types">
          <div className={commonStyles.formFieldDescription}>
            {t('minimum_required_char_types_description', {
              symbols: PasswordPolicyChecker.symbols,
            })}
          </div>
          <Controller
            name="passwordPolicy.characterTypes.min"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <RadioGroup
                name={name}
                className={styles.characterTypes}
                value={cond(value && String(value))}
                onChange={(value) => {
                  onChange(Number(value));
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <Radio key={i} title={<span>{i}</span>} value={String(i)} />
                ))}
              </RadioGroup>
            )}
          />
        </FormField>
      </Card>
      <Card>
        <div className={commonStyles.title}>{t('password_rejection')}</div>
        <FormField title="sign_in_exp.password_policy.forbidden_passwords">
          <PasswordOption
            name="passwordPolicy.rejects.pwned"
            title={t('breached_passwords')}
            description={t('breached_passwords_description')}
          />
        </FormField>
        <FormField title="sign_in_exp.password_policy.restricted_phrases_in_passwords">
          <PasswordOption
            name="passwordPolicy.rejects.repetitionAndSequence"
            title={t('repetitive_or_sequential_characters')}
            description={t('repetitive_or_sequential_characters_description')}
          />
          <PasswordOption
            name="passwordPolicy.rejects.personalInfo"
            title={t('personal_information')}
            description={t('personal_information_description')}
          />
          <PasswordOption
            name="passwordPolicy.isCustomWordsEnabled"
            title={t('custom_words')}
            description={t('custom_words_description')}
          >
            {getValues('passwordPolicy.isCustomWordsEnabled') && (
              <Textarea
                className={styles.textarea}
                rows={5}
                placeholder={t('custom_words_placeholder')}
                onClick={(event) => {
                  event.stopPropagation();
                }}
                onKeyDown={(event) => {
                  event.stopPropagation();
                }}
                {...register('passwordPolicy.customWords')}
              />
            )}
          </PasswordOption>
        </FormField>
      </Card>
    </TabWrapper>
  );
}

export default PasswordPolicy;
