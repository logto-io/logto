---
'@logto/core': patch
---

honor Accept-Language quality values written with whitespace before `q=`

RFC 7231 allows optional whitespace around the quality parameter, so `Accept-Language: en; q=0.7, pl; q=0.9` is a valid way to ask for Polish ahead of English. Logto discarded the weight whenever that whitespace was present and fell back to header order, serving the sign-in experience and the emails it sends in the wrong language. A non-numeric quality value such as `q=high` now falls back to the default weight instead of producing `NaN`.
