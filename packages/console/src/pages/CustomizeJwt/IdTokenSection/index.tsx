import { extendedIdTokenClaimsByScope } from '@logto/core-kit';
import { type ExtendedIdTokenClaim } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Checkbox from '@/ds-components/Checkbox';
import FormField from '@/ds-components/FormField';

import styles from './index.module.scss';

type Props = {
  readonly value: ExtendedIdTokenClaim[];
  readonly onChange: (value: ExtendedIdTokenClaim[]) => void;
  readonly isDisabled?: boolean;
};

function IdTokenSection({ value, onChange, isDisabled = false }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const toggleClaim = (claim: ExtendedIdTokenClaim) => {
    if (isDisabled) {
      return;
    }
    if (value.includes(claim)) {
      onChange(value.filter((item) => item !== claim));
    } else {
      onChange([...value, claim]);
    }
  };

  return (
    <FormField title="jwt_claims.id_token.card_field">
      <div className={styles.description}>{t('jwt_claims.id_token.card_field_description')}</div>
      <div className={styles.claimsContainer}>
        {Object.entries(extendedIdTokenClaimsByScope).map(([scope, claims]) => (
          <div key={scope} className={styles.scopeGroup}>
            <div className={styles.scopeTitle}>{scope}</div>
            <div className={styles.checkboxGroup}>
              {/* eslint-disable-next-line no-restricted-syntax -- safe cast */}
              {(claims as ExtendedIdTokenClaim[]).map((claim) => (
                <Checkbox
                  key={claim}
                  label={claim}
                  disabled={isDisabled}
                  checked={value.includes(claim)}
                  onChange={() => {
                    toggleClaim(claim);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </FormField>
  );
}

export default IdTokenSection;
