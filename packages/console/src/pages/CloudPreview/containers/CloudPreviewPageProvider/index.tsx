import { conditional } from '@silverhand/essentials';
import type { ReactNode } from 'react';
import { useMemo, createContext } from 'react';
import { useLocation } from 'react-router-dom';

import type { Questionnaire } from '../../types';
import { CloudPreviewPage } from '../../types';
import type { PageForm } from './use-page-form';
import usePageForm from './use-page-form';

// TODO @xiaoyijun update `noop` in silverhand-io/essentials
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
const noop: () => any = () => {};

type Props = {
  children: ReactNode;
};

type PageContext = {
  currentPage: CloudPreviewPage;
  questionForm: PageForm<Questionnaire>;
};

export const CloudPreviewPageContext = createContext<PageContext>({
  currentPage: CloudPreviewPage.Welcome,
  questionForm: { isSubmitting: false, isValid: false, getControl: noop, getSubmitHandler: noop },
});

const isCloudPreviewPage = (value: string): value is CloudPreviewPage =>
  Object.values<string>(CloudPreviewPage).includes(value);

const getCurrentPage = (pathname: string) => {
  const page = pathname.split('/')[-1];

  return conditional(page && isCloudPreviewPage(page) && page);
};

const CloudPreviewPageProvider = ({ children }: Props) => {
  const { pathname } = useLocation();

  const currentPage = getCurrentPage(pathname) ?? CloudPreviewPage.Welcome;

  const questionForm = usePageForm<Questionnaire>();

  const memorizedContext = useMemo<PageContext>(
    () => ({ currentPage, questionForm }),
    [currentPage, questionForm]
  );

  return (
    <CloudPreviewPageContext.Provider value={memorizedContext}>
      {children}
    </CloudPreviewPageContext.Provider>
  );
};

export default CloudPreviewPageProvider;
