import { fireEvent, render } from '@testing-library/react';

import NavBar from '.';

describe('<NavBar />', () => {
  it('names the icon-only close button', () => {
    const onClose = jest.fn();
    const { getByRole } = render(<NavBar type="close" onClose={onClose} />);

    fireEvent.click(getByRole('button', { name: 'action.close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('names the back button', () => {
    const onBack = jest.fn();
    const { getByRole } = render(<NavBar onBack={onBack} />);

    fireEvent.click(getByRole('button', { name: 'action.nav_back' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
