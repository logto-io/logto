import type { AttributeMapping } from '@logto/connector-kit';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import TextInput from '@/ds-components/TextInput';

import { type SamlGuideFormType, attributeKeys } from '../../types.js';

import * as styles from './index.module.scss';

type Props = {
  defaultAttributeMapping: AttributeMapping;
};

const primaryKey = 'attributeMapping';

function SamlAttributeMapping({ defaultAttributeMapping }: Props) {
  const { watch, register } = useFormContext<SamlGuideFormType>();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const attributeMapping = watch(primaryKey) ?? {};
  const attributeMappingEntries = useMemo<Array<[keyof AttributeMapping, string | undefined]>>(
    () => attributeKeys.map((key) => [key, attributeMapping[key] ?? '']),
    [attributeMapping]
  );

  return (
    <table className={styles.table}>
      <thead className={styles.header}>
        <tr className={styles.row}>
          <th>
            <DynamicT forKey="enterprise_sso.attribute_mapping.col_sp_claims" />
          </th>
          <th>
            <DynamicT forKey="enterprise_sso.attribute_mapping.col_idp_claims" />
          </th>
        </tr>
      </thead>
      <tbody className={styles.body}>
        {attributeMappingEntries.map(([key, value]) => {
          return (
            <tr key={key} className={styles.row}>
              <td>
                <CopyToClipboard className={styles.copyToClipboard} variant="border" value={key} />
              </td>
              <td>
                <TextInput
                  {...register(`${primaryKey}.${key}`)}
                  placeholder={defaultAttributeMapping[key]}
                  value={value}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default SamlAttributeMapping;
