import { type EditorProps } from '@monaco-editor/react';

import type { IStandaloneThemeData } from './type';

// Logto dark theme extends vs-dark theme
export const logtoDarkTheme: IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#090613', // :token/code/code-bg
  },
};

export const logtoLightTheme: IStandaloneThemeData = {
  ...logtoDarkTheme,
  colors: {
    'editor.background': '#181133', // :token/code/code-bg
  },
};

// @see {@link https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IStandaloneEditorConstructionOptions.html}
export const defaultOptions: EditorProps['options'] = {
  minimap: {
    enabled: false,
  },
  renderLineHighlight: 'none',
  fontFamily: 'Roboto Mono, monospace',
  fontSize: 14,
  automaticLayout: true,
  tabSize: 2,
  scrollBeyondLastLine: false,
};
