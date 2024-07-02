import { MDXProvider } from '@mdx-js/react';
import type React from 'react';

import Anchor from '../Anchor';
import Code from '../Code';
import DetailsSummary from '../DetailsSummary';

type Props = {
  readonly children: React.ReactNode;
};

export default function MdxProvider({ children }: Props) {
  return (
    <MDXProvider
      components={{
        code: Code,
        // Explicitly set a `Code` component since `<code />` cannot be swapped out with a
        // custom component now.
        // See: https://github.com/orgs/mdx-js/discussions/2231#discussioncomment-4729474
        Code,
        a: Anchor,
        Anchor,
        details: DetailsSummary,
        Details: DetailsSummary,
      }}
    >
      {children}
    </MDXProvider>
  );
}
