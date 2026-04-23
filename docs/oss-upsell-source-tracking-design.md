# OSS Upsell 跳转来源追踪设计（Console -> Cloud）

## 1. 背景

当前 OSS console 内有多处 upsell 入口会跳转到 `https://cloud.logto.io`（例如 Bring your UI、成员管理、Get started banner 等）。  
现状问题是：Cloud 侧无法稳定判断“用户是从哪个 OSS 入口跳转而来”。

目标是在不引入可见中间页、不增加明显跳转成本的前提下，记录来源并尽量降低数据污染风险。

## 2. 目标与非目标

### 2.1 目标

1. 能识别来源入口（`entry`），如 `bring_your_ui`、`tenant_settings_members_oss_upsell`。
2. 能区分一次具体点击（`click_id`），用于链路串联和去重。
3. 在 Cloud 侧“首次到达”稳定记录，并在记录后清理 URL 参数。
4. 以最小代价加入防刷：
   - `entry` 白名单校验；
   - 上报服务端可追加限流 + 去重。

### 2.2 非目标

1. 不在本期引入人机校验（CAPTCHA/Turnstile）。
2. 不做复杂风险评分系统。
3. 不改动现有核心业务流程（注册、购买逻辑不变）。

## 3. 核心术语

### 3.1 `entry`

`entry` 是“入口枚举值”，表示跳转来源位置。  
示例：`sign_in_exp_bring_your_ui_oss_card`、`oss_sidebar_cloud_card`。

### 3.2 `click_id`

`click_id` 是“一次点击动作”的唯一 ID。  
当前实现直接使用浏览器内置 `crypto.randomUUID()` 生成。  
它不是用户 ID，不用于身份识别，只用于标识一次跳转链路。

### 3.3 `upsell_click`

`upsell_click` 是 OSS 侧在用户点击 CTA 时记录的事件（可选但推荐）。  
用途：衡量“点击意图”，并与落地事件串联。

### 3.4 `upsell_landing`

`upsell_landing` 是请求到达 `cloud.logto.io` 后，由 Cloud console 页面在初始化阶段读取 URL 参数并上报的事件（必做）。  
用途：确认“真实到达 Cloud”。

### 3.5 `sendBeacon`

`sendBeacon` 是浏览器提供的异步上报接口，适合“页面即将跳转/关闭”场景。  
相较普通 `fetch`，在跳转瞬间更不容易丢请求。  
注意：它提升可靠性，但不是安全机制。

## 4. 总体方案

采用“参数传递 + Cloud 接收页首屏上报”的方案：

1. OSS 点击 upsell CTA 时生成 `click_id`。
2. 跳转 URL 携带 `entry`、`click_id`、`ts`。
3. OSS 可选发送 `upsell_click`（优先 `sendBeacon`）。
4. Cloud console 在页面初始化阶段读取参数并写入 `upsell_landing`。
5. Cloud console 完成上报后以 replace navigation 清理 URL 参数。
6. 上报服务端执行最小防刷（白名单 + 限流去重，后续补齐）。
7. 页面继续正常渲染。

这避免了可见中间页，同时不打断 Cloud 页面原本的加载流程。

## 5. URL 契约

### 5.1 参数定义

- `entry`（必填）：入口枚举值。
- `click_id`（必填）：本次点击唯一 ID。
- `ts`（可选）：点击时间戳（毫秒），便于排查时钟偏差与重放分析。

### 5.2 示例

```text
https://cloud.logto.io/to/applications?entry=get_started_oss_cloud_banner&click_id=01968a0d-5e94-7e6a-944a-12cc7ef3c3cf&ts=1776902215123
```

### 5.3 枚举约束

`entry` 只允许预定义列表，OSS 跳转侧与 Cloud 接收侧使用同一份枚举定义。

## 6. Console 侧实现

### 6.1 统一工具

console 内统一由 `packages/console/src/utils/oss-upsell.ts` 负责：

- `buildCloudUpsellUrl(entry, { path, extraQuery, trackingData })`
- `createUpsellClickId()`
- `reportUpsellClick(payload)`（内部优先 `navigator.sendBeacon`）
- `reportUpsellLanding(payload)`
- `getUpsellTrackingDataFromSearch(search)`
- `stripUpsellTrackingSearchParameters(search)`
- `openCloudUpsell({ entry, path, target })`

关键点：

1. 不再在业务组件里直接拼 `https://cloud.logto.io`。
2. 所有入口必须显式传入 `entry`。
3. `openCloudUpsell()` 内部统一：
   - 使用 `crypto.randomUUID()` 生成 `click_id`；
   - 构造带参数 URL；
   - 尝试通过 `LOGTO_OSS_SURVEY_ENDPOINT/api/upsell-events` 发送 `upsell_click`；
   - 执行 `window.open(...)` 或 `<a href=...>` 跳转。
4. Cloud console 在顶层路由初始化时检测 `entry/click_id/ts`：
   - 若参数合法，则上报 `upsell_landing`；
   - 上报后移除这些 tracking query；
   - 页面继续执行原本逻辑。

### 6.2 入口接入范围

下表是当前已落地的 OSS -> Cloud 入口清单：

| `entry` | 入口说明 | 当前代码位置 | 当前跳转目标 |
| --- | --- | --- | --- |
| `sign_in_exp_bring_your_ui_oss_card` | Sign-in Experience -> Bring your UI（OSS 卡片） | `packages/console/src/pages/SignInExperience/PageContent/Branding/CustomUiForm/index.tsx` | `logtoCloudConsoleLink` |
| `sign_in_exp_hide_logto_branding_oss_note` | Sign-in Experience -> Hide Logto Branding（OSS 提示链接） | `packages/console/src/pages/SignInExperience/PageContent/Branding/BrandingForm/HideLogtoBrandingField.tsx` | `logtoCloudConsoleLink` |
| `get_started_oss_cloud_banner` | Get Started 页面 OSS Cloud Banner CTA | `packages/console/src/pages/GetStarted/OssCloudUpsell.tsx` | `logtoCloudConsoleLink` |
| `oss_sidebar_cloud_card` | Sidebar OSS Cloud 卡片 CTA | `packages/console/src/containers/ConsoleContent/Sidebar/OssCloudCard.tsx` | `logtoCloudConsoleLink` |
| `tenant_settings_members_oss_upsell` | Settings -> Members（OSS upsell 卡片） | `packages/console/src/pages/OssTenantSettings/Members/index.tsx` | `logtoCloudConsoleUrl` |

补充说明：

1. 当前仍然跳 `pricingLink` 的入口（例如 SAML app limit banner、email connector upsell）不纳入本次 OSS -> Cloud tracking 范围。
2. 所有入口都应保证“一处入口一个唯一 `entry`”，不要复用。
3. 如果后续某个 pricing CTA 改为直跳 `cloud.logto.io`，应再为它补一个新的 `entry`，不要复用现有值。

### 6.3 上报细节

实现建议：

1. 复用现有 `LOGTO_OSS_SURVEY_ENDPOINT`，不再新增独立 env var。
2. 统一上报到 `new URL('api/upsell-events', baseUrl)`。
3. `upsell_click` 优先使用 `sendBeacon(Blob(JSON))`。
4. 若 `sendBeacon` 不可用，则降级 `fetch(..., { keepalive: true })`。
5. 上报失败不阻塞跳转或页面继续加载。

说明：`upsell_click` 是可选增强项；即便丢失，也不影响 Cloud 侧 `upsell_landing` 主链路。

## 7. Cloud 接收页实现

### 7.1 记录时机

在 Cloud console 顶层路由初始化阶段处理，在页面继续执行原逻辑前完成 `upsell_landing` 的 best-effort 上报。

### 7.2 参数处理流程

1. 读取 query：`entry`、`click_id`、`ts`。
2. 校验 `entry` 是否在白名单内；无效参数直接忽略，不阻塞页面。
3. 将 `entry/click_id/ts + 当前 URL + document.referrer` 作为 `upsell_landing` payload 上报到 `/api/upsell-events`。
4. 使用 replace navigation 去掉 `entry/click_id/ts`，避免这些参数被复制传播。
5. 页面继续正常渲染，执行原本的 Cloud 路由逻辑。

### 7.3 最小代价防护

#### A. `entry` 白名单校验

1. Console 跳转侧和 Cloud 接收侧都使用同一份 `entry` 白名单。
2. 未命中白名单：直接不发送 landing 上报。

#### B. 限流 + 去重

建议在 `/api/upsell-events` 对应服务端落地层实现两级策略：

1. 高频限流（防瞬时刷）  
   - 维度：`ip_prefix + ua_family + entry`（做哈希存储）。  
   - 规则示例：同维度 `60s` 内超过 `N=30` 次，标记 `is_suspicious=true`；超阈值事件不计入核心统计。

2. 日级去重（防重复点击放大）  
   - 维度同上。  
   - 规则示例：同维度同 `entry` 在 `24h` 仅计一次 `is_unique=true`，其余 `is_unique=false`。

说明：这两条不能 100% 防攻击，但可用极低成本显著降低污染。

### 7.4 事件结构（示例）

可用单表承载，避免过度设计：

```sql
upsell_events (
  id text primary key,
  event_name text not null,                -- upsell_click / upsell_landing
  entry text not null,
  click_id text,
  occurred_at timestamptz not null,
  request_path text,
  referer text,
  ip_hash text,
  ua_hash text,
  invalid_entry boolean default false,
  is_suspicious boolean default false,
  is_unique boolean default false,
  metadata jsonb
)
```

其中：

1. `upsell_landing` 必记；`upsell_click` 可选。
2. `is_unique`、`is_suspicious` 在写入时计算并落字段，便于查询。

## 8. 统计口径建议（简化版）

本期只定义最小口径，避免复杂化：

1. 来源访问量：`event_name='upsell_landing' AND invalid_entry=false AND is_suspicious=false`
2. 来源独立访问量：在上式基础上再加 `is_unique=true`

不在本期引入更复杂漏斗指标定义（后续再扩展）。

## 9. 兼容与回滚

1. 向后兼容：旧链接无参数时，不触发 upsell landing 上报。
2. 灰度发布：
   - 先发接收页 / 上报服务端（兼容新旧链接）；
   - 再发 OSS console 新链接。
3. 回滚：如需回滚 console，仅恢复旧链接；Cloud 接收逻辑可保留。

## 10. 实施清单

### 10.1 Console

1. 新增 upsell tracking helper（URL 构造 + click_id + 事件上报）。
2. 将所有实际 OSS -> Cloud upsell 入口切到 helper。
3. 建立 `entry` 枚举表并分配到每个实际直跳 Cloud 的入口。
4. 在 Cloud console 顶层接收页补 landing 上报与 URL 参数清理。

### 10.2 上报服务端

1. 接收 `upsell_click` / `upsell_landing` 事件。
2. 基于共享 `entry` 白名单做校验。
3. 加入限流 + 去重。

## 11. 验收标准

1. 任一已接入入口跳转后，Cloud 能查到对应 `entry` 的 `upsell_landing`。
2. 跳转落地后，地址栏中的 `entry/click_id/ts` 会被自动移除。
3. 同一入口 24h 内重复点击不会无限放大“独立访问量”。
4. 无可见中间页，用户体验不受影响。

## 12. 未来可选增强（不在本期）

1. 将 landing 记录前移到更靠近入口请求的服务端层。
2. 对参数增加签名（防伪造 `entry`/`click_id`）。
3. 将 `click_id` 与注册/升级事件串联，做完整转化归因。
4. 对异常流量做更精细的风险分层。
