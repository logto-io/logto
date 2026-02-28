import { type AdminConsoleKey } from '@logto/phrases';
import { generateStandardShortId } from '@logto/shared/universal';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import MultiOptionInput from '@/components/MultiOptionInput';

import { domainRegExp, invalidDomainFormatErrorCode } from './consts';
import styles from './index.module.scss';
import { domainOptionsParser, type Option } from './utils';

export type DomainsFormType = {
  domains: Option[];
};

type Props = {
  readonly className?: string;
  readonly values: Option[];
  readonly onChange: (values: Option[]) => void;
  readonly error?: string | boolean;
  readonly placeholder?: AdminConsoleKey;
};

function DomainsInput({ className, values, onChange: rawOnChange, error, placeholder }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { t: tErrors } = useTranslation('errors');
  const { setError, clearErrors } = useFormContext<DomainsFormType>();

  const onChange = (values: Option[]) => {
    const { values: parsedValues, errorMessage } = domainOptionsParser(values);
    if (errorMessage) {
      setError('domains', { type: 'custom', message: errorMessage });
    } else {
      clearErrors('domains');
    }
    rawOnChange(parsedValues);
  };

  return (
    <MultiOptionInput
      className={`${styles.input} ${className ?? ''}`}
      values={values}
      error={error}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      placeholder={placeholder ? t(placeholder) : undefined}
      valueClassName={(option) =>
        `${styles.tag} ${option.status && styles[option.status] ? styles[option.status] : ''}`
      }
      renderValue={(option) => option.value}
      validateInput={(text) => {
        if (!domainRegExp.test(text)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return tErrors(invalidDomainFormatErrorCode);
        }

        return {
          value: {
            value: text,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            id: generateStandardShortId(),
          },
        };
      }}
      onChange={onChange}
    />
  );
}

export default DomainsInput;
