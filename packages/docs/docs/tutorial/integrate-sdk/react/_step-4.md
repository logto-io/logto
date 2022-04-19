## Sign Out

Execute signOut() methods will redirect users to the Logto sign out page. After a success sign out, all use session data and auth status will be cleared. 

```postLogoutRedirectUris
Post sign out redirect URI
```

Add the following code to your web app

```tsx
import React from "react";
import { useLogto } from '@logto/react';

const SignOutButton = () => {
  const { signOut } = useLogto();

  return (
    <button onClick={() => signOut(window.location.origin)}>Sign out</button>
  );
};

export default SignOutButton;
```
