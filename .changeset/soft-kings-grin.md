---
"@logto/experience": patch
---

remove the image element's cross-origin="anonymous" attribute.

Some public image resources may not have the proper cross-origin headers configured, those images may fail to load when the cross-origin="anonymous" attribute is present.
Since those image elements are only used for display purposes, Logto does not need to access the image data, so the cross-origin="anonymous" attribute is not necessary.
To make the image elements more compatible with public image resources, remove the cross-origin="anonymous" attribute from the image elements.
