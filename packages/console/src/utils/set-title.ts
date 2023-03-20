import { isCloud } from '../consts/cloud';

const setTitle = () => {
  const title = isCloud ? 'Logto Cloud' : 'Logto Console';
  // eslint-disable-next-line @silverhand/fp/no-mutation
  document.title = title;
};

export default setTitle;
