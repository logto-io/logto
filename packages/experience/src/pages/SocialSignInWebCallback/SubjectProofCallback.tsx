import LoadingLayer from '@/shared/components/LoadingLayer';

import useSubjectProofCallback from './use-subject-proof-callback';

type Props = {
  readonly connectorId: string;
  readonly type: 'social' | 'sso';
};

const SubjectProofCallback = ({ connectorId, type }: Props) => {
  const { loading } = useSubjectProofCallback(connectorId, type);

  return loading ? <LoadingLayer /> : null;
};

export default SubjectProofCallback;
