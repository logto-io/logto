import { builtInCustomProfileFieldKeys, reservedCustomDataKeys } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';
import modalStyles from '@/scss/modal.module.scss';

import styles from './index.module.scss';

type Props = {
  readonly existingFieldNames: string[];
  readonly onClose?: (fieldName?: string) => void;
};

const reservedCustomDataKeySet = new Set<string>(reservedCustomDataKeys);

function CreateProfileFieldModal({ existingFieldNames, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { t: errorT } = useTranslation('errors');

  const [selectedField, setSelectedField] = useState<string>();
  const [customDataFieldName, setCustomDataFieldName] = useState<string>('');
  const [fieldNameInputError, setFieldNameInputError] = useState<string>();

  const validateCustomDataFieldNameInput = useCallback((): boolean => {
    if (!customDataFieldName) {
      return true;
    }

    if (!/^[\dA-Za-z]+$/.test(customDataFieldName)) {
      setFieldNameInputError(errorT('custom_profile_fields.invalid_name'));
      return false;
    }

    if (existingFieldNames.includes(customDataFieldName)) {
      setFieldNameInputError(
        errorT('custom_profile_fields.name_exists', {
          name: customDataFieldName,
        })
      );
      return false;
    }

    if (reservedCustomDataKeySet.has(customDataFieldName)) {
      setFieldNameInputError(
        errorT('custom_profile_fields.name_conflict_custom_data', {
          name: customDataFieldName,
        })
      );
      return false;
    }

    return true;
  }, [customDataFieldName, errorT, existingFieldNames]);

  const builtInFields = useMemo(
    () =>
      [
        {
          name: 'fullname',
          label: t('profile.fields.fullname'),
          description: t('profile.fields.fullname_description'),
          isDisabled: existingFieldNames.includes('fullname'),
        },
        ...builtInCustomProfileFieldKeys.map((name) => ({
          name,
          label: t(`profile.fields.${name === 'address' ? 'address.formatted' : name}`),
          description: t(`profile.fields.${name}_description`),
          isDisabled: existingFieldNames.includes(name),
        })),
      ]
        .slice()
        .sort((fieldA, fieldB) => fieldA.name.localeCompare(fieldB.name)),
    [t, existingFieldNames]
  );

  return (
    <Modal
      shouldCloseOnEsc
      isOpen
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
    >
      <ModalLayout
        className={styles.content}
        title="sign_in_exp.custom_profile_fields.modal.title"
        subtitle="sign_in_exp.custom_profile_fields.modal.subtitle"
        size="xlarge"
        onClose={onClose}
      >
        <div className={styles.groupLabel}>
          {t('sign_in_exp.custom_profile_fields.modal.built_in_properties')}
        </div>
        <RadioGroup
          className={styles.group}
          type="card"
          name="fieldName"
          value={selectedField}
          onChange={setSelectedField}
        >
          {builtInFields.map(({ name, label, description, isDisabled }) => (
            <Radio key={name} value={name} isDisabled={isDisabled}>
              <div className={styles.item}>
                <div className={styles.title}>{label}</div>
                <div className={styles.description}>{description}</div>
              </div>
            </Radio>
          ))}
        </RadioGroup>
        <div className={styles.groupLabel}>
          {t('sign_in_exp.custom_profile_fields.modal.custom_properties')}
        </div>
        <RadioGroup
          className={styles.group}
          type="card"
          name="fieldName"
          value={selectedField}
          onChange={setSelectedField}
        >
          <Radio value="custom">
            <div className={styles.item}>
              <div className={styles.title}>
                {t('sign_in_exp.custom_profile_fields.modal.custom_field.title')}
              </div>
              <div className={styles.description}>
                {t('sign_in_exp.custom_profile_fields.modal.custom_field.description')}
              </div>
            </div>
          </Radio>
        </RadioGroup>
        {selectedField === 'custom' && (
          <FormField
            isRequired
            className={styles.customDataFieldNameInput}
            title="sign_in_exp.custom_profile_fields.modal.custom_data_field_name"
          >
            <div className={styles.wrapper}>
              <div className={styles.prefix}>customData.</div>
              <TextInput
                className={styles.input}
                inputContainerClassName={styles.input}
                placeholder={t(
                  'sign_in_exp.custom_profile_fields.modal.custom_data_field_input_placeholder'
                )}
                value={customDataFieldName}
                error={fieldNameInputError}
                onBlur={() => {
                  validateCustomDataFieldNameInput();
                }}
                onChange={(event) => {
                  setCustomDataFieldName(event.currentTarget.value);
                  setFieldNameInputError(undefined);
                }}
              />
            </div>
          </FormField>
        )}
        <div className={styles.buttonWrapper}>
          <Button
            size="large"
            type="primary"
            title="sign_in_exp.custom_profile_fields.modal.create_button"
            onClick={() => {
              if (!validateCustomDataFieldNameInput()) {
                return;
              }
              if (selectedField === 'custom' && !customDataFieldName) {
                setFieldNameInputError(errorT('custom_profile_fields.name_required'));
                return;
              }
              onClose?.(selectedField === 'custom' ? customDataFieldName : selectedField);
            }}
          />
        </div>
      </ModalLayout>
    </Modal>
  );
}

export default CreateProfileFieldModal;
