import { conditional } from '@silverhand/essentials';

import type { Props as FormFieldProps } from '@/components/FormField';
import FormField from '@/components/FormField';
import type { Props as MultiTextInputProps } from '@/components/MultiTextInput';

import MultiTextInput from '../MultiTextInput';
import * as styles from './index.module.scss';

type Props = MultiTextInputProps &
  Pick<FormFieldProps, 'isRequired' | 'tooltip'> & {
    formFieldClassName?: FormFieldProps['className'];
  };

const MultiTextInputField = ({
  title,
  isRequired,
  tooltip,
  formFieldClassName,
  value,
  ...rest
}: Props) => (
  <FormField
    title={title}
    isRequired={isRequired}
    tooltip={tooltip}
    className={formFieldClassName}
    headlineClassName={conditional(Boolean(value?.length) && styles.headlineWithMultiInputs)}
  >
    <MultiTextInput title={title} value={value} {...rest} />
  </FormField>
);

export default MultiTextInputField;
