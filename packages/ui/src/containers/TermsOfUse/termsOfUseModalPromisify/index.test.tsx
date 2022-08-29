import { fireEvent } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';

import { modalPromisify } from '.';
import TermsOfUseConfirmModal from '../TermsOfUseConfirmModal';

describe('modalPromisify', () => {
  const onResolve = jest.fn();
  const onReject = jest.fn();

  it('render properly', () => {
    const PromisifyModal = modalPromisify(TermsOfUseConfirmModal);

    const { getByText } = renderWithPageContext(
      <PromisifyModal isOpen instanceId="foo" onResolve={onResolve} onReject={onReject} />
    );

    const confirmButton = getByText('action.agree');
    fireEvent.click(confirmButton);

    expect(onResolve).toBeCalled();
  });

  it('reject with message', () => {
    const PromisifyModal = modalPromisify(TermsOfUseConfirmModal);

    const { getByText } = renderWithPageContext(
      <PromisifyModal isOpen instanceId="foo" onResolve={onResolve} onReject={onReject} />
    );

    const cancelButton = getByText('action.cancel');
    fireEvent.click(cancelButton);

    expect(onReject).toBeCalled();
  });
});
