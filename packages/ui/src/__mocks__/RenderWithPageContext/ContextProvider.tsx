import usePageContext from '@/hooks/use-page-context';

const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { context, Provider } = usePageContext();

  return <Provider value={context}>{children}</Provider>;
};

export default ContextProvider;
