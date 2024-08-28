---
"@logto/experience": minor
---

migrate experience app using Experience API.

Migrate experience app API requests from legacy [Interaction API](https://openapi.logto.io/group/endpoint-interaction) to the new [Experience API](https://openapi.logto.io/group/endpoint-experience), except the following endpoints:

- `GET /api/interaction/consent`
- `POST /api/interaction/consent`

Those endpoints are used in the third-party application's consent page only. Remain unchanged.
