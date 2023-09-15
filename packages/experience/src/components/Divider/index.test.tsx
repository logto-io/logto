import { render } from '@testing-library/react';

import Divider from '.';

describe('Divider', () => {
  it('render with content', () => {
    const { queryByText } = render(<Divider label="description.or" />);
    expect(queryByText('description.or')).not.toBeNull();
  });
});
