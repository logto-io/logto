import type { Translation as UiTranslation } from '@logto/phrases-ui';
import { FieldPath, useFormContext } from 'react-hook-form';

import TextInput from '@/components/TextInput';

import * as style from './EditSection.module.scss';

type EditSectionProps = {
  dataKey: string;
  data: Record<string, unknown>;
};

const EditSection = ({ dataKey, data }: EditSectionProps) => {
  const { register } = useFormContext<UiTranslation>();

  return (
    <>
      <tr>
        <td colSpan={3} className={style.sectionTitle}>
          {dataKey}
        </td>
      </tr>
      {Object.entries(data).map(([field, value]) => {
        if (typeof value !== 'string') {
          return null;
        }

        const fieldKey = `${dataKey}.${field}`;

        return (
          <tr key={fieldKey}>
            <td className={style.sectionDataKey}>{field}</td>
            <td>
              <TextInput readOnly value={value} className={style.sectionBuiltInText} />
            </td>
            <td>
              {
                // eslint-disable-next-line no-restricted-syntax
                <TextInput {...register(fieldKey as FieldPath<UiTranslation>)} />
              }
            </td>
          </tr>
        );
      })}
    </>
  );
};

export default EditSection;
