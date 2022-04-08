## Initiate LogtoClient

Add the following code to your main html file. You may need client ID and authorization domain.

```tsx
import { LogtoProvider, LogtoConfig } from '@logto/react';
import React from 'react';

//...

const App = () => {
  const config: LogtoConfig = { clientId: 'foo', endpoint: 'https://your-endpoint-domain.com' }

  return (
    <BrowserRouter>
      <LogtoProvider config={config}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/protected-resource"
            element={
              <RequireAuth>
                <ProtectedResource />
              </RequireAuth>
            }
          />
        </Routes>
      </LogtoProvider>
    </BrowserRouter>
  );
};
```
