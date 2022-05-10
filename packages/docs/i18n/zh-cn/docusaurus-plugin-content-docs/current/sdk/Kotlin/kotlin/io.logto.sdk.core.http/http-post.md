# httpPost


inline fun &lt;T : [Any](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/index.html)&gt; httpPost(uri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), body: RequestBody, headers: [Map](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/index.html)&lt;[String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)&gt;?, completion: [HttpCompletion](-http-completion/index.md)&lt;T&gt;)

inline fun &lt;T : [Any](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-any/index.html)&gt; httpPost(uri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), body: RequestBody, completion: [HttpCompletion](-http-completion/index.md)&lt;T&gt;)

fun httpPost(uri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), body: RequestBody, completion: [HttpEmptyCompletion](-http-empty-completion/index.md))

@[JvmName](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-name/index.html)(name = &quot;httpRawPost&quot;)

fun httpPost(uri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), body: RequestBody, headers: [Map](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-map/index.html)&lt;[String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)&gt;?, completion: [HttpRawStringCompletion](index.md#1273102375%2FClasslikes%2F-470698881))

@[JvmName](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.jvm/-jvm-name/index.html)(name = &quot;httpRawPost&quot;)

fun httpPost(uri: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), body: RequestBody, completion: [HttpRawStringCompletion](index.md#1273102375%2FClasslikes%2F-470698881))
