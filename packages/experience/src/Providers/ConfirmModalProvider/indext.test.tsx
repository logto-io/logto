import { render, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import { useConfirmModal, usePromiseConfirmModal } from '@/hooks/use-confirm-modal';

import ConfirmModalProvider from '.';

const confirmHandler = jest.fn();
const cancelHandler = jest.fn();

const PromiseConfirmModalTestComponent = () => {
  const { show } = usePromiseConfirmModal();

  const onClick = async () => {
    const [result] = await show({ ModalContent: 'confirm modal content' });

    if (result) {
      confirmHandler();

      return;
    }

    cancelHandler();
  };

  return <button onClick={onClick}>show modal</button>;
};

const CallbackConfirmModalTestComponent = () => {
  const { show } = useConfirmModal();

  const onClick = () => {
    show({
      ModalContent: 'confirm modal content',
      onConfirm: confirmHandler,
      onCancel: cancelHandler,
    });
  };

  return <button onClick={onClick}>show modal</button>;
};

describe('confirm modal provider', () => {
  describe('promise confirm modal', () => {
    it('render confirm modal', async () => {
      const { queryByText, getByText } = render(
        <ConfirmModalProvider>
          <PromiseConfirmModalTestComponent />
        </ConfirmModalProvider>
      );

      const trigger = getByText('show modal');

      act(() => {
        fireEvent.click(trigger);
      });

      await waitFor(() => {
        expect(queryByText('confirm modal content')).not.toBeNull();
        expect(queryByText('action.confirm')).not.toBeNull();
        expect(queryByText('action.cancel')).not.toBeNull();
      });
    });

    it('confirm callback of confirm modal', async () => {
      const { queryByText, getByText } = render(
        <ConfirmModalProvider>
          <PromiseConfirmModalTestComponent />
        </ConfirmModalProvider>
      );

      const trigger = getByText('show modal');

      act(() => {
        fireEvent.click(trigger);
      });

      await waitFor(() => {
        expect(queryByText('confirm modal content')).not.toBeNull();
        expect(queryByText('action.confirm')).not.toBeNull();
      });

      const confirm = getByText('action.confirm');

      act(() => {
        fireEvent.click(confirm);
      });

      await waitFor(() => {
        expect(confirmHandler).toBeCalled();
      });
    });

    it('cancel callback of confirm modal', async () => {
      const { queryByText, getByText } = render(
        <ConfirmModalProvider>
          <PromiseConfirmModalTestComponent />
        </ConfirmModalProvider>
      );

      const trigger = getByText('show modal');

      act(() => {
        fireEvent.click(trigger);
      });

      await waitFor(() => {
        expect(queryByText('confirm modal content')).not.toBeNull();
        expect(queryByText('action.cancel')).not.toBeNull();
      });

      const cancel = getByText('action.cancel');

      act(() => {
        fireEvent.click(cancel);
      });

      await waitFor(() => {
        expect(cancelHandler).toBeCalled();
      });
    });
  });

  describe('callback confirm modal', () => {
    it('render confirm modal', async () => {
      const { queryByText, getByText } = render(
        <ConfirmModalProvider>
          <CallbackConfirmModalTestComponent />
        </ConfirmModalProvider>
      );

      const trigger = getByText('show modal');

      act(() => {
        fireEvent.click(trigger);
      });

      await waitFor(() => {
        expect(queryByText('confirm modal content')).not.toBeNull();
        expect(queryByText('action.confirm')).not.toBeNull();
        expect(queryByText('action.cancel')).not.toBeNull();
      });
    });

    it('confirm callback of confirm modal', async () => {
      const { queryByText, getByText } = render(
        <ConfirmModalProvider>
          <CallbackConfirmModalTestComponent />
        </ConfirmModalProvider>
      );

      const trigger = getByText('show modal');

      act(() => {
        fireEvent.click(trigger);
      });

      await waitFor(() => {
        expect(queryByText('confirm modal content')).not.toBeNull();
        expect(queryByText('action.confirm')).not.toBeNull();
      });

      const confirm = getByText('action.confirm');

      act(() => {
        fireEvent.click(confirm);
      });

      await waitFor(() => {
        expect(confirmHandler).toBeCalled();
      });
    });

    it('cancel callback of confirm modal', async () => {
      const { queryByText, getByText } = render(
        <ConfirmModalProvider>
          <CallbackConfirmModalTestComponent />
        </ConfirmModalProvider>
      );

      const trigger = getByText('show modal');

      act(() => {
        fireEvent.click(trigger);
      });

      await waitFor(() => {
        expect(queryByText('confirm modal content')).not.toBeNull();
        expect(queryByText('action.cancel')).not.toBeNull();
      });

      const cancel = getByText('action.cancel');

      act(() => {
        fireEvent.click(cancel);
      });

      await waitFor(() => {
        expect(cancelHandler).toBeCalled();
      });
    });
  });
});
