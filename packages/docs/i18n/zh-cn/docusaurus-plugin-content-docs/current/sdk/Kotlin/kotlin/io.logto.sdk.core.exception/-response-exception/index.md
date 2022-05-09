# ResponseException


class ResponseException(type: [ResponseException.Type](-type/index.md), cause: [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html)? = null) : [RuntimeException](https://docs.oracle.com/javase/8/docs/api/java/lang/RuntimeException.html)

## Constructors

| | |
|---|---|
| ResponseException | fun ResponseException(type: [ResponseException.Type](-type/index.md), cause: [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html)? = null) |

## Types

| 名称 | 概要 |
|---|---|
| [Type](-type/index.md) | enum [Type](-type/index.md) : [Enum](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-enum/index.html)&lt;[ResponseException.Type](-type/index.md)&gt; |

## Properties

| 名称 | 概要 |
|---|---|
| responseContent | var responseContent: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)? = null |
| responseMessage | var responseMessage: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)? = null |
