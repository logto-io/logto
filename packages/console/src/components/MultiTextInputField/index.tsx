import { conditional } from '@silverhand/essentials';

import type { Props as FormFieldProps } from '@/ds-components/FormField';
import FormField from '@/ds-components/FormField';
import type { Props as MultiTextInputProps } from '@/ds-components/MultiTextInput';
import MultiTextInput from '@/ds-components/MultiTextInput';

import styles from './index.module.scss';

type Props = MultiTextInputProps &
  Pick<FormFieldProps, 'isRequired' | 'tip'> & {
    readonly formFieldClassName?: FormFieldProps['className'];
  };

function MultiTextInputField({
  title,
  isRequired,
  tip,
  formFieldClassName,
  value,
  ...rest
}: Props) {
  return (
    <FormField
      title={title}
      isRequired={isRequired}
      tip={tip}
      className={formFieldClassName}
      headlineClassName={conditional(value && value.length > 1 && styles.headlineWithMultiInputs)}
    >
      <MultiTextInput title={title} value={value} {...rest} />
    </FormField>
  );
}

export default MultiTextInputField;
