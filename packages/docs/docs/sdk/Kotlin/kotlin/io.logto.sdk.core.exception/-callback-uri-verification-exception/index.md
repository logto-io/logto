# CallbackUriVerificationException


class [CallbackUriVerificationException](index.md)(message: [Enum](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-enum/index.html)&lt;[CallbackUriVerificationException.Message](-message/index.md)&gt;, cause: [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html)? = null) : [RuntimeException](https://docs.oracle.com/javase/8/docs/api/java/lang/RuntimeException.html)

## Constructors

| | |
|---|---|
| [CallbackUriVerificationException](-callback-uri-verification-exception-constructor) | fun [CallbackUriVerificationException](-callback-uri-verification-exception-constructor)(message: [Enum](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-enum/index.html)&lt;[CallbackUriVerificationException.Message](-message/index.md)&gt;, cause: [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html)? = null) |

## Types

| Name | Summary |
|---|---|
| [Message](-message/index.md) | enum [Message](-message/index.md) : [Enum](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-enum/index.html)&lt;[CallbackUriVerificationException.Message](-message/index.md)&gt; |

## Functions

| Name | Summary |
|---|---|
| [addSuppressed](../-uri-construction-exception/index.md#282858770%2FFunctions%2F-470698881) | fun [addSuppressed](../-uri-construction-exception/index.md#282858770%2FFunctions%2F-470698881)(p0: [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html)) |
| [fillInStackTrace](../-uri-construction-exception/index.md#-1102069925%2FFunctions%2F-470698881) | open fun [fillInStackTrace](../-uri-construction-exception/index.md#-1102069925%2FFunctions%2F-470698881)(): [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html) |
| [getLocalizedMessage](../-uri-construction-exception/index.md#1043865560%2FFunctions%2F-470698881) | open fun [getLocalizedMessage](../-uri-construction-exception/index.md#1043865560%2FFunctions%2F-470698881)(): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html) |
| [getStackTrace](../-uri-construction-exception/index.md#2050903719%2FFunctions%2F-470698881) | open fun [getStackTrace](../-uri-construction-exception/index.md#2050903719%2FFunctions%2F-470698881)(): [Array](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/index.html)&lt;[StackTraceElement](https://docs.oracle.com/javase/8/docs/api/java/lang/StackTraceElement.html)&gt; |
| [getSuppressed](../-uri-construction-exception/index.md#672492560%2FFunctions%2F-470698881) | fun [getSuppressed](../-uri-construction-exception/index.md#672492560%2FFunctions%2F-470698881)(): [Array](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/index.html)&lt;[Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html)&gt; |
| [initCause](../-uri-construction-exception/index.md#-418225042%2FFunctions%2F-470698881) | open fun [initCause](../-uri-construction-exception/index.md#-418225042%2FFunctions%2F-470698881)(p0: [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html)): [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html) |
| [printStackTrace](../-uri-construction-exception/index.md#-1769529168%2FFunctions%2F-470698881) | open fun [printStackTrace](../-uri-construction-exception/index.md#-1769529168%2FFunctions%2F-470698881)()<br/>open fun [printStackTrace](../-uri-construction-exception/index.md#1841853697%2FFunctions%2F-470698881)(p0: [PrintStream](https://docs.oracle.com/javase/8/docs/api/java/io/PrintStream.html))<br/>open fun [printStackTrace](../-uri-construction-exception/index.md#1175535278%2FFunctions%2F-470698881)(p0: [PrintWriter](https://docs.oracle.com/javase/8/docs/api/java/io/PrintWriter.html)) |
| [setStackTrace](../-uri-construction-exception/index.md#2135801318%2FFunctions%2F-470698881) | open fun [setStackTrace](../-uri-construction-exception/index.md#2135801318%2FFunctions%2F-470698881)(p0: [Array](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-array/index.html)&lt;[StackTraceElement](https://docs.oracle.com/javase/8/docs/api/java/lang/StackTraceElement.html)&gt;) |

## Properties

| Name | Summary |
|---|---|
| [cause](../-uri-construction-exception/index.md#-654012527%2FProperties%2F-470698881) | open val [cause](../-uri-construction-exception/index.md#-654012527%2FProperties%2F-470698881): [Throwable](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-throwable/index.html)? |
| [error](error.md) | var [error](error.md): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)? = null |
| [errorDesc](error-desc.md) | var [errorDesc](error-desc.md): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)? = null |
| [message](../-uri-construction-exception/index.md#1824300659%2FProperties%2F-470698881) | open val [message](../-uri-construction-exception/index.md#1824300659%2FProperties%2F-470698881): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)? |
