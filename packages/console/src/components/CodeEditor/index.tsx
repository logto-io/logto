import React, { ChangeEventHandler } from 'react';

import * as styles from './index.module.scss';

// Will be implemented in LOG-1708, defined 2 basic props for now.
type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

const CodeEditor = ({ value, onChange }: Props) => {
  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    onChange?.(event.target.value);
  };

  return (
    <div className={styles.editor}>
      <textarea rows={10} value={value} onChange={handleChange} />
    </div>
  );
};

export default CodeEditor;
