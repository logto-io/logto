/**
 * This context is used to share the loading state of the code editor with the root page.
 *
 * 1. First code editor won't be rendered until the fetch API is returned.
 * 2. After the code editor is mounted, multiple async operations will be triggered to load the monaco editor.
 * 3. We need to mount the code editor component will keep the loading state until the monaco editor is ready.
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
