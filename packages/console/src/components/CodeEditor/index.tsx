import MonacoEditor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import React from 'react';

import Copy from '@/icons/Copy';

import IconButton from '../IconButton';
import * as styles from './index.module.scss';

type Props = {
  language?: string;
  height?: string;
  isReadonly?: boolean;
  value?: string;
  onChange?: (value: string) => void;
};

const CodeEditor = ({ value, onChange, language, height = '300px', isReadonly = false }: Props) => {
  const handleChange = (changedValue = '') => {
    onChange?.(changedValue);
  };

  const handleCopy = async () => {
    if (!value) {
      return;
    }
    await navigator.clipboard.writeText(value);
  };

  // See https://microsoft.github.io/monaco-editor/api/enums/monaco.editor.EditorOption.html
  const options: monaco.editor.IStandaloneEditorConstructionOptions = {
    readOnly: isReadonly,
    scrollBeyondLastLine: false,
    codeLens: false,
    minimap: {
      enabled: false,
    },
    folding: false,
  };

  return (
    <div className={styles.editor}>
      <div className={styles.actions}>
        <IconButton onClick={handleCopy}>
          <Copy />
        </IconButton>
      </div>
      <MonacoEditor
        language={language}
        height={height}
        theme="vs-dark"
        value={value}
        options={options}
        onChange={handleChange}
      />
    </div>
  );
};

export default CodeEditor;
