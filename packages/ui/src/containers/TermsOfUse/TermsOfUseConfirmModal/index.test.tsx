import renderWithPageContext from '@/__mocks__/RenderWithPageContext';

import TermsOfUseModal from '.';

describe('TermsOfUseModal', () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();

  it('render properly', () => {
    const { queryByText } = renderWithPageContext(
      <TermsOfUseModal isOpen onConfirm={onConfirm} onClose={onCancel} />
    );

    expect(queryByText('description.agree_with_terms_modal')).not.toBeNull();
  });
});
