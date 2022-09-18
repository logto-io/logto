import { render, fireEvent } from '@testing-library/react';

import { mockSocialConnectorData } from '@/__mocks__/logto';

import SocialLinkButton from './SocialLinkButton';

describe('Button Component', () => {
  const onClick = jest.fn();

  beforeEach(() => {
    onClick.mockClear();
  });

  it('render SocialLinkButton', () => {
    const connector = mockSocialConnectorData;
    const { queryByText, container } = render(
      <SocialLinkButton
        logo={connector.logo}
        name={connector.name}
        target={connector.target}
        onClick={onClick}
      />
    );

    expect(queryByText('action.sign_in_with')).not.toBeNull();

    const button = container.querySelector('button');
    const icon = container.querySelector('img');

    if (icon) {
      expect(icon.src).toEqual(connector.logo);
    }

    if (button) {
      fireEvent.click(button);
      expect(onClick).toBeCalled();
    }
  });
});
