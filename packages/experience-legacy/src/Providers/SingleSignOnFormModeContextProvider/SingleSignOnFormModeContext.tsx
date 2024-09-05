import { noop } from '@silverhand/essentials';
import { createContext } from 'react';

export type SingleSignOnFormModeContextType = {
  showSingleSignOnForm: boolean;
  setShowSingleSignOnForm: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * This context is used to share the single sign on identifier status cross the page and form components.
 * If the user has entered an identifier that is associated with a single sign on method, we will show the single sign on form.
 */
const SingleSignOnFormModeContext = createContext<SingleSignOnFormModeContextType>({
  showSingleSignOnForm: false,
  setShowSingleSignOnForm: noop,
});

export default SingleSignOnFormModeContext;
