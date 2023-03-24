import { conditional } from '@silverhand/essentials';

import type { Props as FormFieldProps } from '@/components/FormField';
import FormField from '@/components/FormField';
import type { Props as MultiTextInputProps } from '@/components/MultiTextInput';

import MultiTextInput from '../MultiTextInput';

import * as styles from './index.module.scss';

type Props = MultiTextInputProps &
  Pick<FormFieldProps, 'isRequired' | 'tip'> & {
    formFieldClassName?: FormFieldProps['className'];
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
