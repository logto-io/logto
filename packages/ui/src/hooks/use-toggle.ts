import { useState } from 'react';

const useToggle = (defaultValue = false) => {
  const [value, setValue] = useState<boolean>(defaultValue);

  const toggle = () => {
    setValue((previous) => !previous);
  };

  return [value, toggle] as const;
};

export default useToggle;
