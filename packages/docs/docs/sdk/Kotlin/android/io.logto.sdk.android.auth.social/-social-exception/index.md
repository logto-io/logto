# SocialException


class SocialException(type: [SocialException.Type](-type/index.md)) : [RuntimeException](https://developer.android.com/reference/kotlin/java/lang/RuntimeException.html)

## Constructors

| Name  | Summary |
|---|---|
| SocialException | fun SocialException(type: [SocialException.Type](-type/index.md)) |

## Types

| Name | Summary |
|---|---|
| [Type](-type/index.md) | enum [Type](-type/index.md) : [Enum](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-enum/index.html)&lt;[SocialException.Type](-type/index.md)&gt; |

## Properties

| Name | Summary |
|---|---|
| code | val code: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html) |
| socialCode | var socialCode: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)? = null |
| socialMessage | var socialMessage: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)? = null |
