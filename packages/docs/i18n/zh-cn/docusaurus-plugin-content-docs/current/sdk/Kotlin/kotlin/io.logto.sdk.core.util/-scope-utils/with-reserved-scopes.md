# withReservedScopes


fun withReservedScopes(scopes: [List](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html)&lt;[String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)&gt;?): [List](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-list/index.html)&lt;[String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)&gt;

使得传入的 Scope 列表包含 `open_id` 和 `offline_access`

#### Return

添加 `open_id` 和 `offline_access` 后的 Scope 列表

## Parameters


| 参数名 | 说明 |
|---|---|
| scopes | 初始值 Scope 列表 |
