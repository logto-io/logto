# PersistStorage


class PersistStorage(context: [Context](https://developer.android.com/reference/kotlin/android/content/Context.html), storageName: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html))

## Constructors

| 名称 | 概要 |
|---|---|
| PersistStorage | fun PersistStorage(context: [Context](https://developer.android.com/reference/kotlin/android/content/Context.html), storageName: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)) |

## Functions

| 名称 | 概要 |
|---|---|
| getItem | fun getItem(key: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)): [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)? |
| setItem | fun setItem(key: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html), value: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)?): [SharedPreferences.Editor](https://developer.android.com/reference/kotlin/android/content/SharedPreferences.Editor.html) |
