## 登录

### Setup your login

The Logto React SDK provides you tools and hooks to quickly implement your own authorization flow.  First, let’s enter your redirect URI

```redirectUris
Redirect URI
```

Add the following code to your web app

```tsx
import React from "react";
import { useLogto } from '@logto/react';

const SignInButton = () => {
  const { signIn } = useLogto();
  const redirectUrl = window.location.origin + '/callback';

  return <button onClick={() => signIn(redirectUrl)}>Sign In</button>;
};

export default SignInButton;
```

### Retrieve Auth Status

```tsx
import React from "react";
import { useLogto } from '@logto/react';

const App = () => {
	const { isAuthenticated, signIn } = useLogto();

  if !(isAuthenticated) {
		return <SignInButton />
  }

	return <>
		<AppContent />
		<SignOutButton />
	</>
};
```
