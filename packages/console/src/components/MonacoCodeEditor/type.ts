import { type EditorProps, type Monaco, type OnMount } from '@monaco-editor/react';

export type IStandaloneThemeData = Parameters<Monaco['editor']['defineTheme']>[1];

export type IStandaloneCodeEditor = Parameters<OnMount>[0];

type ExtraLibrary = {
  content: string;
  filePath: string;
};

export type ModelSettings = {
  /** Used as the unique key for the monaco editor model @see {@link https://github.com/suren-atoyan/monaco-react?tab=readme-ov-file#multi-model-editor} */
  name: string;
  /** The icon of the model, will be displayed on the tab */
  icon?: React.ReactNode;
  /** The title of the model */
  title: string;
  /** The default value of the file */
  defaultValue?: string;
  value?: string;
  language: string;
  /** ExtraLibs can be loaded to the code editor
   * @see {@link https://microsoft.github.io/monaco-editor/typedoc/interfaces/languages.typescript.LanguageServiceDefaults.html#setExtraLibs}
   * We use this to load the global type declarations for the active model
   */
  extraLibs?: ExtraLibrary[];
  options?: EditorProps['options'];
};

export type ModelControl = {
  value?: string;
  onChange?: (value: string | undefined) => void;
};
