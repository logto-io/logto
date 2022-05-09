# LogtoWebViewAuthClient


class LogtoWebViewAuthClient(hostActivity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), injectScript: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)) : [WebViewClient](https://developer.android.com/reference/kotlin/android/webkit/WebViewClient.html)

## Constructors

| 名称 | 概要 |
|---|---|
| LogtoWebViewAuthClient | fun LogtoWebViewAuthClient(hostActivity: [Activity](https://developer.android.com/reference/kotlin/android/app/Activity.html), injectScript: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)) |

## Functions

| 名称 | 概要 |
|---|---|
| onPageStarted | open override fun onPageStarted(view: [WebView](https://developer.android.com/reference/kotlin/android/webkit/WebView.html)?, url: [String](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-string/index.html)?, favicon: [Bitmap](https://developer.android.com/reference/kotlin/android/graphics/Bitmap.html)?) |
| shouldOverrideUrlLoading | open override fun shouldOverrideUrlLoading(view: [WebView](https://developer.android.com/reference/kotlin/android/webkit/WebView.html)?, request: [WebResourceRequest](https://developer.android.com/reference/kotlin/android/webkit/WebResourceRequest.html)?): [Boolean](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin/-boolean/index.html) |
