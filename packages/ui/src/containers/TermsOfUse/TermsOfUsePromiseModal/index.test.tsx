import { fireEvent } from '@testing-library/react';
import React from 'react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';

import TermsOfUsePromiseModal from '.';

describe('TermsOfUsePromiseModal', () => {
  it('render properly', () => {
    const onResolve = jest.fn();
    const onReject = jest.fn();

    const { getByText } = renderWithPageContext(
      <SettingsProvider>
        <TermsOfUsePromiseModal
          isOpen
          open
          instanceId="1"
          close={jest.fn()}
          onReject={onReject}
          onResolve={onResolve}
        />
      </SettingsProvider>
    );

    const confirmButton = getByText('action.agree');
    const cancelButton = getByText('action.cancel');

    fireEvent.click(confirmButton);
    expect(onResolve).toBeCalledWith(true);

    fireEvent.click(cancelButton);
    expect(onReject).toBeCalledWith(false);
  });
});
