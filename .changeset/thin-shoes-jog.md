---
"@logto/core": patch
---

Fix SSO connector new user authentication internal server error.

## Description

Thanks to the [issue](https://github.com/logto-io/logto/issues/5502) report, we found that the SSO connector new user authentication was causing an internal server error. Should return an 422 status code instead of 500. Frontend sign-in page can not handle the 500 error and complete the new user registration process.

### Root cause

When the SSO connector returns a new user that does not exist in the Logto database, the backend with throw a 422 error. Frontend relies the 422 error to redirect and complete the new user registration process.

However, the backend was throwing a 500 error instead. That is because we applied a strict API response status code guard at the koaGuard middleware level. The status code 422 was not listed. Therefore, the middleware threw a 500 error.

### Solution

We added the 422 status code to the koaGuard middleware. Now, the backend will return a 422 status code when the SSO connector returns a new user that does not exist in the Logto database. The frontend sign-in page can handle the 422 error and complete the new user registration process.
