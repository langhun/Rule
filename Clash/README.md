# Clash / Sub-Store 说明

> 当前主脚本：`Clash/Sub-Store.js`
> 
> 当前版本：`V9.14.58`
> 
> 适用内核：`Mihomo / Clash.Meta / OpenClash`

## 这是什么

这是一个面向 **Sub-Store** 的单文件增强脚本，用来把原始订阅二次加工成更完整的 Mihomo / Clash 配置。

脚本目前仍然坚持 **单文件维护**：

- 不拆成多文件模块
- 但内部已经按 helper / definitions / pipeline 做了模块化整理
- 方便继续维护，又不影响直接丢进 Sub-Store 使用

## 现在这份脚本主要能做什么

### 1. 自动整理节点与策略组

- 自动规范节点名称、处理重复名
- 自动隔离“剩余流量 / 到期 / 官网 / 客服 / 电报群”等信息节点，单独收口到 `ℹ️ 订阅信息`
- 国家识别与国家分组
- 区域分组与区域别名
- `AI / GitHub / Dev / Discord / WhatsApp / LINE / Instagram / Facebook / PayPal / Steam / Crypto / Games / Media` 等业务组
- `select / url-test / fallback / load-balance` 多种组类型
- 新增 `🪄 稳定优选` 组：沿用 `url-test`，但提高切换容差，减少频繁抖动
- `🪄 稳定优选` 继续开放专属参数：`betterFallbackTolerance / betterFallbackHidden`
- 支持组顺序布局预设与显式排序

### 2. 规则与规则源增强

- 内置常用 rule-provider
- 支持社区规则源切换，如 `blackmatrix7`
- 支持 `steam-fix`
- 支持 `Dev.list / AIExtra.list` 这类本地补丁规则层
- 支持规则入口目标改写、锚点插入与顺序调整

### 3. 现有 provider 接管

#### rule-provider

支持对已有和内置 `rule-providers` 做统一接管：

- `path-dir`
- `interval`
- `proxy`
- `size-limit`
- `user-agent`
- `authorization`
- `header`
- `payload`（仅 inline provider）

#### proxy-provider

支持对已有 `proxy-providers` 做统一接管：

- `path-dir`
- `interval / proxy / size-limit`
- `user-agent / authorization / header`
- `payload`
- `filter / exclude-filter / exclude-type`
- `override.*`
- `health-check.*`

### 4. 运行时诊断与调试

- `full` 构建摘要
- `responseHeaders=true` 调试响应头
- 参数来源追踪
- 参数生效来源追踪
- 未消费参数提示
- 规则顺序 / 候选链 / 业务链路摘要
- provider 命中统计、改动统计、预览摘要

### 5. 最近这一轮整理过的内容

最近除了功能继续堆叠，也顺手把脚本内部做了一轮维护整理：

- 主流程改成更清晰的阶段化装配
- 单文件内继续模块化，减少大段重复模板
- 统一了 warning 输出入口
- 收敛了初始化、空输入、空策略组、国家识别等噪声告警
- 相同 warning 在单次运行里会自动去重
- 只保留更有价值的用户配置错误提示
- 参考 GitHub 社区常见规则仓库，继续补入 `Discord / WhatsApp / LINE / Instagram / Facebook / PayPal` 细分业务组
- 顺序上明确保留 `GitHub / OneDrive / Bing -> Microsoft` 与 `WhatsApp / Instagram -> Facebook` 这类“先细后宽”的规则关系，避免被大规则提前吞掉

## 和 `Rule.ini` 的关系

`Sub-Store.js` 和固定模板类 `Rule.ini` 不是一回事：

- `Sub-Store.js` 是 **动态生成脚本**
- `Rule.ini` 更像 **固定模板**

所以：

- 你更新了 `Sub-Store.js`
- 不代表 `Rule.ini` 会自动继承同样的动态分组能力

两条线是并行维护的。

## 快速使用

### Sub-Store 脚本路径

把 `Clash/Sub-Store.js` 作为脚本放进 Sub-Store 即可。

### 常见链接参数示例

#### 基础用法

```text
...?target=ClashMeta
```

#### 打开完整摘要与响应头调试

```text
...?target=ClashMeta&full&responseHeaders=true
```

#### 开启区域组并调整布局

```text
...?target=ClashMeta&full&responseHeaders=true&regionGroups=hk,tw,jp,sg&groupOrderPreset=dashboard
```

#### 调整业务组优先国家

```text
...?target=ClashMeta&full&responseHeaders=true&githubPreferCountries=classic-6&steamPreferCountries=nafta-core&devPreferCountries=workspace-core
```

#### 接管现有 rule-provider / proxy-provider

```text
...?target=ClashMeta&full&responseHeaders=true&ruleProviderPathDir=providers/rules&proxyProviderPathDir=providers/proxies&proxyProviderHealthCheckEnable=true
```

## 常用参数速查

### 分组与布局

- `regionGroups`：启用区域组
- `groupOrderPreset / groupOrder`：策略组布局
- `countryGroupSort / regionGroupSort`：国家组 / 区域组排序
- `countryExtraAliases`：补充国家别名

### 独立业务组

- `githubMode / githubType / githubPreferCountries / githubPreferGroups / githubPreferNodes`
- `steamMode / steamType / steamPreferCountries / steamPreferGroups / steamPreferNodes`
- `devMode / devType / devPreferCountries / devPreferGroups / devPreferNodes`

### 规则顺序与目标

- `githubRuleTarget / steamRuleTarget / steamCnRuleTarget / devRuleTarget`
- `githubRuleAnchor / steamRuleAnchor / steamCnRuleAnchor / devRuleAnchor`
- `githubRulePosition / steamRulePosition / steamCnRulePosition / devRulePosition`
- `customRuleAnchor / customRulePosition`

### 规则源

- `ruleSourcePreset`
- `steamFix / steamFixUrl`
- `directListUrl / cryptoListUrl / chatGptListUrl / aiExtraListUrl / devListUrl`
- `extraDirectDomains`：额外直连域名，自动同时写入 rules 与 `fake-ip-filter`
- `betterFallbackTolerance / betterFallbackHidden`：控制 `🪄 稳定优选` 的容差与显隐

### rule-provider

- `ruleProviderPathDir`
- `ruleProviderInterval`
- `ruleProviderProxy`
- `ruleProviderSizeLimit`
- `ruleProviderUserAgent`
- `ruleProviderAuthorization`
- `ruleProviderHeader`
- `ruleProviderPayload`

### proxy-provider

- `proxyProviderPathDir`
- `proxyProviderInterval / proxyProviderProxy / proxyProviderSizeLimit`
- `proxyProviderUserAgent / proxyProviderAuthorization / proxyProviderHeader`
- `proxyProviderPayload`
- `proxyProviderFilter / proxyProviderExcludeFilter / proxyProviderExcludeType`
- `proxyProviderOverride*`
- `proxyProviderHealthCheck*`

### 调试

- `full`
- `responseHeaders=true`
- `logLevel`

## 告警行为说明

现在脚本的 warning 行为做过一轮收口，原则是：

- **真实用户配置错误保留**
- **内部生成过程的噪声尽量静默**
- **同一轮重复 warning 去重**
- diagnostics 预览明细仍保留

所以你现在看到的 warning，通常更接近“真的需要你处理”的问题，而不是内部流程噪声。

## 维护说明

当前维护方向：

1. 继续保持 `Sub-Store.js` 单文件
2. 内部继续模块化整理
3. 优先补 README、注释、warning 质量与参数语义
4. 功能新增尽量和现有 diagnostics / response headers 保持同步

## 近期版本说明

### V9.14.58

这一版继续把 `🪄 稳定优选` 做成可调预设：

- 新增 `betterFallbackTolerance`：单独调整稳定优选组的 tolerance，默认 `1000`
- 新增 `betterFallbackHidden`：单独控制稳定优选组是否隐藏
- 保持和全局 `group-tolerance / hidden` 分离，避免为了一个组改全局行为

### V9.14.57

这一版补了 3 个偏实用的小增强：

- 新增 `🪄 稳定优选` 组：本质仍是 `url-test`，但使用更高 tolerance，减少自动切换抖动
- 新增 `ℹ️ 订阅信息` 组：把“剩余流量 / 到期 / 官网 / 客服 / 电报群”等说明型节点从自动测速、国家分组里隔离出来
- 新增 `extraDirectDomains` 参数：手工补充的直连域名会同时进入最终 rules 与 DNS `fake-ip-filter`

### V9.12.9

这一轮重点是在不拆文件的前提下，继续参考 GitHub 社区规则仓库把常见细分服务组补厚，并把顺序风险收紧：

- 新增 `Discord / WhatsApp / LINE / Instagram / Facebook / PayPal` 独立策略组
- 接入对应社区规则提供器，统一仍放在单文件 `Sub-Store.js` 里维护
- 面板布局预设同步补齐这些新组，避免生成了但排位不顺手
- 新增 `WhatsApp / Instagram -> Facebook` 的规则优先级风险提示
- 业务规则窗口与业务链路摘要同步纳入新组，方便继续观察命中顺序
- README 按当前脚本状态同步更新

### V9.12.2

本轮重点不是再堆一堆新功能，而是继续做“可维护性整理”：

- 单文件内部模块化继续推进
- provider / diagnostics / summary / response headers 多处装配逻辑继续 definitions 化
- warning 输出统一收口
- README 按当前脚本状态重写

## 官方参考

- Sub-Store Wiki：<https://github.com/sub-store-org/Sub-Store/wiki/%E9%93%BE%E6%8E%A5%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E>
- Sub-Store demo.js：<https://github.com/sub-store-org/Sub-Store/blob/master/scripts/demo.js>
- Mihomo Proxy Groups：<https://wiki.metacubex.one/en/config/proxy-groups/>
- Mihomo Rules：<https://wiki.metacubex.one/en/config/rules/>
- Mihomo Proxy Providers：<https://wiki.metacubex.one/en/config/proxy-providers/>
- Mihomo DNS：<https://wiki.metacubex.one/en/config/dns/>
- Mihomo Sniffer：<https://wiki.metacubex.one/en/config/sniff/>

## 社区参考

- blackmatrix7 / ios_rule_script：<https://github.com/blackmatrix7/ios_rule_script>
- Accademia / Additional_Rule_For_Clash：<https://github.com/Accademia/Additional_Rule_For_Clash>
- powerfullz / override-rules：<https://github.com/powerfullz/override-rules>
- mihomo-party-org / override-hub：<https://github.com/mihomo-party-org/override-hub>
- DustinWin / ruleset_geodata：<https://github.com/DustinWin/ruleset_geodata>

---

如果你后面继续改 `Sub-Store.js`，README 也建议同步维护这几块：

- 当前版本号
- 新增参数
- 行为变更
- warning / diagnostics 变更
- 示例链接
