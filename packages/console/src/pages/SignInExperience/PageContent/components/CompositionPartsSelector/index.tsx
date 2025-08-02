import { CustomProfileFieldType } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Tip from '@/assets/icons/tip.svg?react';
import { CheckboxGroup } from '@/ds-components/Checkbox';
import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import IconButton from '@/ds-components/IconButton';
import Select from '@/ds-components/Select';
import { ToggleTip } from '@/ds-components/Tip';

import { type ProfileFieldForm } from '../../CollectUserProfile/types';
import useI18nFieldLabel from '../../CollectUserProfile/use-i18n-field-label';

import styles from './index.module.scss';

const addressFormatOptions = Object.freeze([
  {
    value: 'singleLine',
    i18nKey: 'sign_in_exp.custom_profile_fields.details.single_line_address' as const,
  },
  {
    value: 'multiLine',
    i18nKey: 'sign_in_exp.custom_profile_fields.details.multi_line_address' as const,
  },
]);

function CompositionPartsSelector() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control, watch } = useFormContext<ProfileFieldForm>();

  const getI18nLabel = useI18nFieldLabel();
  const type = watch('type');

  return (
    <Controller
      name="parts"
      control={control}
      render={({ field: { value: parts, onChange } }) => {
        const enabledParts = parts?.filter(({ enabled }) => enabled);
        const selectValue =
          enabledParts?.length === 1 && enabledParts[0]?.name === 'formatted'
            ? 'singleLine'
            : 'multiLine';
        return (
          <>
            {type === CustomProfileFieldType.Address && (
              <FormField title="sign_in_exp.custom_profile_fields.details.address_format">
                <Select
                  options={addressFormatOptions.map(({ value, i18nKey }) => ({
                    value,
                    title: t(i18nKey),
                  }))}
                  value={selectValue}
                  onChange={(value) => {
                    onChange(
                      parts?.map((part) => ({
                        ...part,
                        enabled:
                          value === 'singleLine'
                            ? part.name === 'formatted'
                            : part.name !== 'formatted',
                      }))
                    );
                  }}
                />
              </FormField>
            )}
            {(type !== CustomProfileFieldType.Address || selectValue === 'multiLine') && (
              <FormField
                title={
                  <DangerousRaw>
                    <div className={styles.titleWithTip}>
                      {t('sign_in_exp.custom_profile_fields.details.components')}
                      <ToggleTip
                        content={t('sign_in_exp.custom_profile_fields.details.components_tip')}
                        horizontalAlign="start"
                      >
                        <IconButton size="small">
                          <Tip />
                        </IconButton>
                      </ToggleTip>
                    </div>
                  </DangerousRaw>
                }
              >
                <CheckboxGroup
                  className={styles.checkboxGroup}
                  options={
                    parts
                      ?.filter(({ name }) => name !== 'formatted')
                      .map(({ name, label }) => ({
                        value: name,
                        title: <DangerousRaw>{label || getI18nLabel(name)}</DangerousRaw>,
                      })) ?? []
                  }
                  value={enabledParts?.map(({ name }) => name) ?? []}
                  onChange={(values) => {
                    onChange(
                      parts?.map((part) => ({
                        ...part,
                        enabled: values.includes(part.name),
                      })) ?? []
                    );
                  }}
                />
              </FormField>
            )}
          </>
        );
      }}
    />
  );
}

export default CompositionPartsSelector;
