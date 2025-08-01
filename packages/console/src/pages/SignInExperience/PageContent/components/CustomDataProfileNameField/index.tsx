import TextInput, { type Props } from '@/ds-components/TextInput';

import styles from './index.module.scss';

function CustomDataProfileNameField(props: Props) {
  const { error, ...rest } = props;
  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.prefix}>customData.</div>
        <TextInput
          className={styles.input}
          inputContainerClassName={styles.inputContainer}
          {...rest}
        />
      </div>
      {Boolean(error) && typeof error !== 'boolean' && (
        <div className={styles.errorMessage}>{error}</div>
      )}
    </>
  );
}

export default CustomDataProfileNameField;
