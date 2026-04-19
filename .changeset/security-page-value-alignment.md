---
"@logto/account": patch
---

fix(account): restore security page desktop value alignment

The mobile layout refactor split each row's icon into a dedicated grid column, which pushed the title column — and therefore every value cell — further right. Icon and title now share a single grid cell (with padding-left on the title) so the name slot stays within the original 200px budget and values align with the pre-refactor layout.
