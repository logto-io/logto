import { render } from '@testing-library/react';

import TextLink from '.';

describe('TextLink', () => {
  it('render with children', () => {
    const { queryByText } = render(<TextLink href="#">foo</TextLink>);
    expect(queryByText('foo')).not.toBeNull();
  });

  it('render with i18nKey', () => {
    const { queryByText } = render(<TextLink href="#" text="description.terms_of_use" />);
    expect(queryByText('description.terms_of_use')).not.toBeNull();
  });
});
