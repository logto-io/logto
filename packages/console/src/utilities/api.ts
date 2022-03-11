import { RequestErrorBody } from '@logto/schemas';
import { t } from 'i18next';
import ky from 'ky';
import { toast } from 'react-hot-toast';

const toastError = async (response: Response) => {
  try {
    const data = (await response.json()) as RequestErrorBody;
    toast.error(data.message || t('admin_console.errors.unknown_server_error'));
  } catch {
    toast.error(t('admin_console.errors.unknown_server_error'));
  }
};

const api = ky.create({
  hooks: {
    beforeError: [
      (error) => {
        const { response } = error;

        if (response.body) {
          void toastError(response);
        }

        return error;
      },
    ],
  },
});

export default api;
