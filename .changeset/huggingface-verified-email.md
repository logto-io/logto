---
"@logto/connector-huggingface": patch
---

sync the Hugging Face email address only when Hugging Face reports it as verified

The connector now reads `email_verified` from the Hugging Face user info and leaves an unverified address in `rawData` only.
