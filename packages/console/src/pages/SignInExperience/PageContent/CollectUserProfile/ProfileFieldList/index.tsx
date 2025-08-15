import { type CustomProfileField } from '@logto/schemas';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Draggable from '@/assets/icons/draggable.svg?react';
import { DragDropProvider, DraggableItem } from '@/ds-components/DragDrop';
import Tag from '@/ds-components/Tag';
import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { onKeyDownHandler } from '@/utils/a11y';
import { trySubmitSafe } from '@/utils/form';

import { collectUserProfilePathname } from '../consts';
import useI18nFieldLabel from '../use-i18n-field-label';
import { getFieldTags } from '../utils';

import styles from './index.module.scss';

type Props = {
  readonly data: CustomProfileField[];
};

type Form = {
  readonly fields: CustomProfileField[];
};

const collectUserProfileDetailsPathname = `${collectUserProfilePathname}/fields/:fieldName`;

function ProfileFieldList({ data }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const { navigate } = useTenantPathname();
  const getI18nLabel = useI18nFieldLabel();

  const { control, handleSubmit, reset } = useForm<Form>({
    defaultValues: { fields: data },
  });
  const { fields, swap } = useFieldArray({ control, name: 'fields' });

  const updateSortingOrders = handleSubmit(
    trySubmitSafe(async ({ fields }) => {
      const result = await api
        .post('api/custom-profile-fields/properties/sie-order', {
          json: { order: fields.map(({ name }, index) => ({ name, sieOrder: index + 1 })) },
        })
        .json<CustomProfileField[]>();

      reset({ fields: result });
      toast.success(t('general.saved'));
    })
  );

  return (
    <DragDropProvider>
      {fields.map(({ id, name, label, type, config }, index) => (
        <DraggableItem
          key={id}
          id={id}
          sortIndex={index}
          moveItem={swap}
          dropItem={async () => updateSortingOrders()}
          className={styles.draggleItemContainer}
        >
          <div
            className={styles.row}
            role="button"
            tabIndex={0}
            onClick={() => {
              navigate(collectUserProfileDetailsPathname.replace(':fieldName', name));
            }}
            onKeyDown={onKeyDownHandler(() => {
              navigate(collectUserProfileDetailsPathname.replace(':fieldName', name));
            })}
          >
            <div className={styles.cell}>
              <Draggable className={styles.draggableIcon} />
              <span className={styles.fieldName}>{label || getI18nLabel(name)}</span>
            </div>
            <div className={styles.cell}>{t(`sign_in_exp.custom_profile_fields.type.${type}`)}</div>
            <div className={styles.cell}>
              <div className={styles.tags}>
                {getFieldTags(name, config.parts).map((key) => (
                  <Tag key={key} variant="cell">
                    {key}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </DraggableItem>
      ))}
    </DragDropProvider>
  );
}

export default ProfileFieldList;
