import { Translation } from '@logto/schemas';
import { useFormContext } from 'react-hook-form';

import Textarea from '@/components/Textarea';

import * as style from './EditSection.module.scss';

type EditSectionProps = {
  dataKey: string;
  data: Record<string, string>;
};

const EditSection = ({ dataKey, data }: EditSectionProps) => {
  const { register } = useFormContext<Translation>();

  return (
    <>
      <tr>
        <td colSpan={3} className={style.sectionTitle}>
          {dataKey}
        </td>
      </tr>
      {Object.entries(data).map(([field, value]) => {
        const fieldKey = `${dataKey}.${field}`;

        return (
          <tr key={fieldKey}>
            <td className={style.sectionDataKey}>{field}</td>
            <td>
              <div className={style.sectionBuiltInText}>{value}</div>
            </td>
            <td className={style.inputCell}>
              <Textarea className={style.sectionInputArea} {...register(fieldKey)} />
            </td>
          </tr>
        );
      })}
    </>
  );
};

export default EditSection;
