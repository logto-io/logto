/**
 * Share the Monaco loading state between the detail page shell and script editor.
 */

import { noop } from '@silverhand/essentials';
import { createContext } from 'react';

type CodeEditorLoadingContextType = {
  isMonacoLoaded: boolean;
  setIsMonacoLoaded: (isLoading: boolean) => void;
};

export const CodeEditorLoadingContext = createContext<CodeEditorLoadingContextType>({
  isMonacoLoaded: false,
  setIsMonacoLoaded: noop,
});
