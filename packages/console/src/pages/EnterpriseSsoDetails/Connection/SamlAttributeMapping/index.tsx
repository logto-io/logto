import { socialUserInfoGuard } from '@logto/connector-kit';
import { type SsoConnectorWithProviderConfig } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import DynamicT from '@/ds-components/DynamicT';
import TextInput from '@/ds-components/TextInput';

import { attributeKeys, type SamlGuideFormType } from '../../../EnterpriseSso/types.js';

import * as styles from './index.module.scss';

type Props = Pick<SsoConnectorWithProviderConfig, 'providerConfig'>;

/**
 * TODO: Should align this with the guard `samlAttributeMappingGuard` defined in {@link logto/core/src/sso/types/saml.ts}.
 * This only applies to SAML-protocol-based SSO connectors.
 */
const providerPropertiesGuard = z.object({
  defaultAttributeMapping: socialUserInfoGuard
    .pick({
      id: true,
      email: true,
      name: true,
    })
    .required(),
});

const primaryKey = 'attributeMapping';

function SamlAttributeMapping({ providerConfig }: Props) {
  const { register } = useFormContext<SamlGuideFormType>();

  const result = providerPropertiesGuard.safeParse(providerConfig);

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
        {attributeKeys.map((key) => {
          return (
            <tr key={key} className={styles.row}>
              <td>
                <CopyToClipboard className={styles.copyToClipboard} variant="border" value={key} />
              </td>
              <td>
                <TextInput
                  {...register(`${primaryKey}.${key}`)}
                  placeholder={conditional(
                    result.success && result.data.defaultAttributeMapping[key]
                  )}
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
