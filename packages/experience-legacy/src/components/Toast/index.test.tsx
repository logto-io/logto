import { fireEvent, render, act } from '@testing-library/react';

import Toast from '.';

jest.useFakeTimers();

describe('Toast Component', () => {
  it('showToast', () => {
    const message = 'mock toast message';
    const { queryByText } = render(<Toast message={message} />);
    expect(queryByText(message)).not.toBeNull();
  });

  it('should not render empty toast', () => {
    const message = 'mock toast message';
    const { queryByText } = render(<Toast message="" />);
    expect(queryByText(message)).toBeNull();
  });

  it('should run callback method when transition end', () => {
    const callback = jest.fn();
    const message = 'mock toast message';
    const { container } = render(<Toast message={message} callback={callback} />);
    const toast = container.querySelector('[data-visible=true]');

    act(() => {
      jest.runAllTimers();
    });

    if (toast) {
      fireEvent.transitionEnd(toast);
      expect(callback).toBeCalled();
    }
  });
});
