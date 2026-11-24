import { fireEvent, render } from '@testing-library/react';

import AcModal from './AcModal';

describe('<AcModal />', () => {
  it('closes from the named close button', () => {
    const onClose = jest.fn();
    const { getByRole } = render(
      <AcModal isOpen onClose={onClose}>
        content
      </AcModal>
    );

    // The test setup uses `document.body` as the modal app element, so react-modal marks it `aria-hidden`
    fireEvent.click(getByRole('button', { name: 'action.close', hidden: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
