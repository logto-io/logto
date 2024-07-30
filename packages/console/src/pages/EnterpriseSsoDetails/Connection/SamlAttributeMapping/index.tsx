import { conditional, conditionalString } from '@silverhand/essentials';
import { useFormContext } from 'react-hook-form';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import TextInput from '@/ds-components/TextInput';
import {
  samlAttributeKeys,
  type SamlProviderConfig,
  type SamlConnectorConfig,
} from '@/pages/EnterpriseSsoDetails/types/saml';

import styles from './index.module.scss';

type Props = {
  readonly samlProviderConfig?: SamlProviderConfig;
};

const primaryKey = 'attributeMapping';

function SamlAttributeMapping({ samlProviderConfig }: Props) {
  const { register } = useFormContext<SamlConnectorConfig>();

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
        {samlAttributeKeys.map((key) => {
          return (
            <tr key={key} className={styles.row}>
              <td>
                <CopyToClipboard displayType="block" variant="border" value={key} />
              </td>
              <td>
                {/* Show default value of `id` field to show that Logto has handled the default value. */}
                {/* Per SAML protocol, this field is not eligible to change in most cases. */}
                {key === 'id' ? (
                  <CopyToClipboard
                    displayType="block"
                    variant="border"
                    value={conditionalString(samlProviderConfig?.defaultAttributeMapping[key])}
                  />
                ) : (
                  <TextInput
                    {...register(`${primaryKey}.${key}`)}
                    placeholder={conditional(samlProviderConfig?.defaultAttributeMapping[key])}
                  />
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default SamlAttributeMapping;
