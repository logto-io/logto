import TextInput, { type Props } from '@/ds-components/TextInput';

import styles from './index.module.scss';

function CustomDataProfileNameField(props: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.prefix}>customData.</div>
      <TextInput
        className={styles.input}
        inputContainerClassName={styles.inputContainer}
        {...props}
      />
    </div>
  );
}

export default CustomDataProfileNameField;
