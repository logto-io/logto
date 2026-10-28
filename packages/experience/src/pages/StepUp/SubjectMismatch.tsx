import { stepUpRoutes } from '@/constants/step-up';
import ErrorPage from '@/pages/ErrorPage';

/**
 * The recoverable exit of a subject proof that resolved to another account or to none. The
 * interaction still pins the subject and offers the linked connector, so the page returns to the
 * landing instead of the invalid-session page.
 */
const SubjectMismatch = () => (
  <ErrorPage
    isNavbarHidden
    title="step_up.subject_mismatch"
    message="step_up.subject_mismatch_description"
    primaryAction={{
      title: 'action.use_another_account',
      to: stepUpRoutes.landing,
      replace: true,
    }}
  />
);

export default SubjectMismatch;
