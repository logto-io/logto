type ProtectedAppForm = {
  subDomain: string;
  origin: string;
};

type ProtectedAppsDomainConfig = {
  protectedApps: {
    defaultDomain: string;
  };
};
