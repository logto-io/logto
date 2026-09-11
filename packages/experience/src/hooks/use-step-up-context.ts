import { useContext } from 'react';

import StepUpContext from '@/Providers/StepUpContextProvider/StepUpContext';

/** The server-driven step-up state loaded by the `/step-up` route guard. */
const useStepUpContext = () => useContext(StepUpContext);

export default useStepUpContext;
