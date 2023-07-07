import type { Queries, queries, RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import PageContextProvider from '@/Providers/PageContextProvider';

const renderWithPageContext = <
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
>(
  ui: ReactElement,
  memoryRouterProps: Parameters<typeof MemoryRouter>[0] = {},
  options: RenderOptions<Q, Container> = {}
) => {
  return render<Q, Container>(
    <MemoryRouter {...memoryRouterProps}>
      <PageContextProvider>{ui}</PageContextProvider>
    </MemoryRouter>,
    options
  );
};

export default renderWithPageContext;
