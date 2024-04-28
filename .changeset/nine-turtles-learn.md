---
"@logto/experience": patch
"@logto/core": patch
---

fix the new user from SSO register hook event not triggering bug

### Issue

When a new user registers via SSO, the `PostRegister` interaction hook event is not triggered. `PostSignIn` event is mistakenly triggered instead.

### Root Cause

In the SSO `post /api/interaction/sso/:connectionId/registration` API, we update the interaction event to `Register`.
However, the hook middleware reads the event from interaction session ahead of the API logic, and the event is not updated resulting in the wrong event being triggered.

In the current interaction API design, we should mutate the interaction event by calling the `PUT /api/interaction/event` API, instead of updating the event directly in the submit interaction APIs. (Just like the no direct mutation rule for a react state). So we can ensure the correct side effect like logs and hooks are triggered properly.

All the other sign-in methods are using the `PUT /api/interaction/event` API to update the event. But when implementing the SSO registration API, we were trying to reduce the API requests and directly updated the event in the registration API which will submit the interaction directly.

### Solution

Remove the event update logic in the SSO registration API and call the `PUT /api/interaction/event` API to update the event.
This will ensure the correct event is triggered in the hook middleware.

### Action Items

Align the current interaction API design for now.
Need to improve the session/interaction API logic to simplify the whole process.
