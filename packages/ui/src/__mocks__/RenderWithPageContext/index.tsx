import { render, Queries, queries, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

import ContextProvider from './ContextProvider';

const renderWithPageContext = <
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement
>(
  ui: ReactElement,
  options: RenderOptions<Q, Container> = {}
) => render<Q, Container>(<ContextProvider>{ui}</ContextProvider>, options);

export default renderWithPageContext;
