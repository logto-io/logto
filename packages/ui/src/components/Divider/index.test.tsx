import { render } from '@testing-library/react';

import Divider from '.';

describe('Divider', () => {
  it('render with content', () => {
    const { queryByText } = render(<Divider label="description.continue_with" />);
    expect(queryByText('description.continue_with')).not.toBeNull();
  });
});
