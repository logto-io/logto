import { numberAndAlphabetRegEx } from '@logto/core-kit';
import {
  builtInCustomProfileFieldKeys,
  type CustomProfileField,
  reservedCustomDataKeys,
} from '@logto/schemas';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import ModalLayout from '@/ds-components/ModalLayout';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import useApi from '@/hooks/use-api';
import modalStyles from '@/scss/modal.module.scss';

import CustomDataProfileNameField from '../../components/CustomDataProfileNameField';
import { useDataParser } from '../hooks';

import styles from './index.module.scss';

type Props = {
  readonly existingFieldNames: string[];
  readonly onClose?: (field?: CustomProfileField) => void;
};

const reservedCustomDataKeySet = new Set<string>(reservedCustomDataKeys);

function CreateProfileFieldModal({ existingFieldNames, onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { t: errorT } = useTranslation('errors');
  const api = useApi();

  const { getInitialRequestPayloadByFieldName } = useDataParser();

  const [selectedField, setSelectedField] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [customDataFieldName, setCustomDataFieldName] = useState<string>('');
  const [fieldNameInputError, setFieldNameInputError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedField) {
      setErrorMessage(undefined);
    }
  }, [selectedField]);

  const validateCustomDataFieldNameInput = useCallback((): boolean => {
    if (!customDataFieldName) {
      return true;
    }

    if (!numberAndAlphabetRegEx.test(customDataFieldName)) {
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

  const onSubmit = async () => {
    if (!selectedField) {
      setErrorMessage(t('sign_in_exp.custom_profile_fields.modal.type_required'));
      return;
    }
    if (!validateCustomDataFieldNameInput()) {
      return;
    }
    if (selectedField === 'custom' && !customDataFieldName) {
      setFieldNameInputError(errorT('custom_profile_fields.name_required'));
      return;
    }
    const fieldName = selectedField === 'custom' ? customDataFieldName : selectedField;

    setIsSubmitting(true);
    try {
      const field = await api
        .post('api/custom-profile-fields', {
          json: getInitialRequestPayloadByFieldName(fieldName),
        })
        .json<CustomProfileField>();

      onClose?.(field);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <CustomDataProfileNameField
              value={customDataFieldName}
              error={fieldNameInputError}
              placeholder={t(
                'sign_in_exp.custom_profile_fields.modal.custom_data_field_input_placeholder'
              )}
              onBlur={() => {
                validateCustomDataFieldNameInput();
              }}
              onChange={(event) => {
                setCustomDataFieldName(event.currentTarget.value);
                setFieldNameInputError(undefined);
              }}
            />
          </FormField>
        )}
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
        <div className={styles.buttonWrapper}>
          <Button
            size="large"
            type="primary"
            title="sign_in_exp.custom_profile_fields.modal.create_button"
            isLoading={isSubmitting}
            onClick={onSubmit}
          />
        </div>
      </ModalLayout>
    </Modal>
  );
}

export default CreateProfileFieldModal;
