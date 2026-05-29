import { createContext, useContext } from 'react';

export type AccountLayoutContextValue = {
  readonly showsMultiPageNav: boolean;
  readonly showsMobileTabNav: boolean;
};

const AccountLayoutContext = createContext<AccountLayoutContextValue>({
  showsMultiPageNav: false,
  showsMobileTabNav: false,
});

export const AccountLayoutProvider = AccountLayoutContext.Provider;

export const useAccountLayout = (): AccountLayoutContextValue => useContext(AccountLayoutContext);

export default AccountLayoutContext;
