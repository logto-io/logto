import { type EditorProps } from '@monaco-editor/react';

import type { IStandaloneThemeData } from './type';

// Logto dark theme extends vs-dark theme
export const logtoDarkTheme: IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#181133', // :token/code/code-bg
  },
};

// @see {@link https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IStandaloneEditorConstructionOptions.html}
export const defaultOptions: EditorProps['options'] = {
  minimap: {
    enabled: false,
  },
  wordWrap: 'on',
  renderLineHighlight: 'none',
  fontFamily: 'Roboto Mono, monospace',
  fontSize: 14,
};
