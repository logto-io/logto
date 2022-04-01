---
title: 登出
subtitle: 1 steps
---
Execute signOut() methods will redirect users to the Logto sign out page. After a success sign out, all use session data and auth status will be cleared. 

```multitextinput
Post sign out redirect URI
```

Add the following code to your web app

```typescript
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