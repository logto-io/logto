import { render } from '@testing-library/react';

import Drawer from '.';

describe('Drawer', () => {
  it('render children', () => {
    const { queryByText } = render(
      <Drawer isOpen onClose={jest.fn()}>
        children
      </Drawer>
    );

    expect(queryByText('children')).not.toBeNull();
  });
});
