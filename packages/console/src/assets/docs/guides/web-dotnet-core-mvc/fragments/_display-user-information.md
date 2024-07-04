To know if the user is authenticated, you can check the `User.Identity?.IsAuthenticated` property.

To get the user profile claims, you can use the `User.Claims` property:

```csharp title="Controllers/HomeController.cs"
var claims = User.Claims;

// Get the user ID
var userId = claims.FirstOrDefault(c => c.Type == LogtoParameters.Claims.Subject)?.Value;
```

See [`LogtoParameters.Claims`](https://github.com/logto-io/csharp/blob/master/src/Logto.AspNetCore.Authentication/LogtoParameters.cs) for the list of claim names and their meanings.
