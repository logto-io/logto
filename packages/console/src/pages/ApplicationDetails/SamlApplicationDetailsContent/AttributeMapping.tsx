import { type UserClaim, userClaimsList } from '@logto/core-kit';
import { type SamlApplicationResponse, samlAttributeMappingKeys } from '@logto/schemas';
import { conditionalArray } from '@silverhand/essentials';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import CircleMinus from '@/assets/icons/circle-minus.svg?react';
import CirclePlus from '@/assets/icons/circle-plus.svg?react';
import DetailsForm from '@/components/DetailsForm';
import FormCard from '@/components/FormCard';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import Select from '@/ds-components/Select';
import TextInput from '@/ds-components/TextInput';
import useApi from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import { trySubmitSafe } from '@/utils/form';

import styles from './AttributeMapping.module.scss';
import { camelCaseToSentenceCase } from './utils';

const defaultFormValue: Array<[UserClaim | 'sub' | '', string]> = [['sub', '']];

type Props = {
  readonly data: SamlApplicationResponse;
  readonly mutateApplication: (data?: SamlApplicationResponse) => void;
};

/**
 * Type for the attribute mapping form data.
 * Array of tuples containing key (UserClaim or 'sub' or empty string) and value pairs
 */
type FormData = {
  attributeMapping: Array<[key: UserClaim | 'sub' | '', value: string]>;
};

const keyPrefix = 'attributeMapping';

const getOrderedAttributeMapping = (
  attributeMapping: SamlApplicationResponse['attributeMapping'] & Partial<Record<'', string>>
) => {
  return (
    samlAttributeMappingKeys
      .filter((key) => key in attributeMapping)
      // eslint-disable-next-line no-restricted-syntax
      .map((key) => [key, attributeMapping[key]] as [UserClaim | 'sub', string])
  );
};

function AttributeMapping({ data, mutateApplication }: Props) {
  const { id, attributeMapping } = data;
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const api = useApi();

  const {
    watch,
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, isDirty },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      attributeMapping:
        Object.keys(attributeMapping).length > 0
          ? getOrderedAttributeMapping(attributeMapping)
          : defaultFormValue,
    },
  });

  const formValues = watch('attributeMapping');

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      if (isSubmitting) {
        return;
      }

      const updatedData = await api
        .patch(`api/saml-applications/${id}`, {
          json: {
            attributeMapping: Object.fromEntries(
              formData.attributeMapping.filter(([key, value]) => Boolean(key) && Boolean(value))
            ),
          },
        })
        .json<SamlApplicationResponse>();

      mutateApplication(updatedData);
      toast.success(t('general.saved'));
      reset({
        attributeMapping:
          Object.keys(updatedData.attributeMapping).length > 0
            ? getOrderedAttributeMapping(updatedData.attributeMapping)
            : defaultFormValue,
      });
    })
  );

  // Not using `useMemo` to avoid the reappearance of the available keys when the form values change.
  const existingKeys = new Set(formValues.map(([key]) => key).filter(Boolean));
  const availableKeys = userClaimsList.filter((claim) => !existingKeys.has(claim));

  return (
    <DetailsForm
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      onSubmit={onSubmit}
      onDiscard={reset}
    >
      <FormCard
        title="application_details.saml_app_attribute_mapping.title"
        description="application_details.saml_app_attribute_mapping.description"
        learnMoreLink={{
          href: getDocumentationUrl('/integrate-logto/saml-app/attribute-mapping'),
          targetBlank: 'noopener',
        }}
      >
        <table className={styles.table}>
          <thead className={styles.header}>
            <tr className={styles.row}>
              <th>
                <DynamicT forKey="application_details.saml_app_attribute_mapping.col_logto_claims" />
              </th>
              <th>
                <DynamicT forKey="application_details.saml_app_attribute_mapping.col_sp_claims" />
              </th>
              <th />
            </tr>
          </thead>
          <tbody className={styles.body}>
            {formValues.map(([key, _], index) => {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={index} className={styles.row}>
                  <td>
                    <Controller
                      control={control}
                      name={`${keyPrefix}.${index}.0` as const}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          isSearchEnabled
                          value={value}
                          options={conditionalArray(
                            availableKeys.map((claim) => ({
                              title: camelCaseToSentenceCase(claim),
                              value: claim,
                            })),
                            // If this is not specified, the component will fail to render the current value. The current value has been excluded in `availableKeys`. But we should not show if the current value is empty.
                            value.trim() && [{ title: camelCaseToSentenceCase(value), value }]
                          )}
                          onChange={(value) => {
                            onChange(value);
                          }}
                        />
                      )}
                    />
                  </td>
                  <td>
                    <TextInput {...register(`${keyPrefix}.${index}.1`)} />
                  </td>
                  <td>
                    <IconButton
                      onClick={() => {
                        const currentValues = [
                          ...formValues.slice(0, index),
                          ...formValues.slice(index + 1),
                        ];
                        setValue('attributeMapping', currentValues, {
                          shouldDirty: true,
                        });
                      }}
                    >
                      <CircleMinus />
                    </IconButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Button
          size="small"
          type="text"
          disabled={availableKeys.length === 0}
          icon={<CirclePlus />}
          title="application_details.saml_app_attribute_mapping.add_button"
          onClick={() => {
            const currentValues = [...formValues];
            // eslint-disable-next-line @silverhand/fp/no-mutating-methods
            currentValues.push(['', '']);
            setValue('attributeMapping', currentValues, {
              shouldDirty: true,
            });
          }}
        />
      </FormCard>
    </DetailsForm>
  );
}

export default AttributeMapping;
