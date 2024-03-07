import { type Monaco, type OnMount } from '@monaco-editor/react';

export type IStandaloneThemeData = Parameters<Monaco['editor']['defineTheme']>[1];

export type IStandaloneCodeEditor = Parameters<OnMount>[0];

export type Model = {
  /** Used as the unique key for the monaco editor model @see {@link https://github.com/suren-atoyan/monaco-react?tab=readme-ov-file#multi-model-editor} */
  name: string;
  /** The icon of the model, will be displayed on the tab */
  icon?: React.ReactNode;
  /** The title of the model */
  title: string;
  defaultValue: string;
  language: string;
  globalDeclarations?: string;
};
