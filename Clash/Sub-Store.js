/**
 * ==================================================================================
 * Sub-Store 终极策略增强脚本 V8.95.0
 * ==================================================================================
 * 这版重构重点：
 * 1. 参数兼容：同时支持 Sub-Store 常见驼峰 / 小写参数写法。
 * 2. 国家识别：降低单字符误判，低倍率节点不再参与国家计数。
 * 3. 策略生成：抽离重复逻辑，统一测速组/选择组构造，避免重复与空组。
 * 4. 配置合并：保留原配置中的自定义规则、策略组、DNS 与 Sniffer 扩展项。
 * 5. 自检增强：自动规范重复节点名，并对 provider / 目标组 / 组引用做一致性校验。
 * 6. 覆盖率增强：统计国家识别覆盖率，并提示未命中国家规则的节点样本。
 * 7. 分组增强：新增 GitHub 独立策略组与 Steam 独立策略组。
 * 8. 官方高级项：加入 Mihomo 文档支持的健康检查增强、DNS 高级项、include-all-proxies、可选隐藏辅助组与 rule-provider 缓存路径。
 * 9. 内核增强：补充 Mihomo 通用内核默认项，以及 Sniffer 官方示例中的 HTTP 覆写与保底 skip-domain。
 * 10. DNS 进阶：补充 fake-ip-range6、proxy-server-nameserver-policy 与 fallback-filter.domain。
 * 11. GEO 数据增强：补充 geodata-mode、geox-url，并将 keep-alive / tcp-concurrent 默认值对齐 Mihomo 文档。
 * 12. 风险自检：对官方已弃用项和 DNS 高风险组合追加告警提示。
 * 13. 下载链路增强：补充 geo-auto-update、geo-update-interval 与 global-ua。
 * 14. 高级参数化：支持通过脚本参数控制 profile 缓存、Geo 自动更新与 global-ua，并追加 GEO 配置自检。
 * 15. 核心项参数化：继续开放 unified-delay、tcp-concurrent、find-process-mode、geodata-loader 与 profile 子项控制。
 * 16. DNS 参数化：开放 respect-rules、prefer-h3、cache-algorithm、fake-ip-filter-mode、fake-ip-ttl 等高级项，并自动适配 rule 模式语法。
 * 17. 细节继续参数化：新增测速组健康检查参数、Sniffer 开关参数，以及 DNS 监听/Fake-IP 地址池参数，并追加对应自检。
 * 18. 规则源增强：接入 ChatGPT 自定义规则文件，并开放 Direct/Crypto/ChatGPT 规则源 URL 参数化与链接自检。
 * 19. 业务优选增强：AI / Crypto 组升级为多国家优先级链，而不是只优先单一国家。
 * 20. AI 规则增强：补充 OpenAI / Anthropic / Gemini 官方规则，并开放 AI / Crypto 国家优先链参数，同时追加 AI 默认强制嗅探域名。
 * 21. AI DNS 增强：在 nameserver-policy 中显式把 OpenAI / Anthropic / Gemini 指向国际 DNS，减少 AI 域名解析误判。
 * 22. Sniffer 域名参数化：开放 force-domain / skip-domain 附加参数，便于后续持续扩展 AI 与特殊站点嗅探规则。
 * 23. Sub-Store 官方兼容增强：按官方 `$options` 说明，支持 querystring / JSON 字符串形式的脚本参数输入。
 * 24. 参数体验增强：兼容常见 `#a=1&b=2` 前缀写法，并对 AI / Crypto 优先链里未命中的国家标记追加显式告警。
 * 25. 运行环境增强：合并全局 `$options + $arguments` 参数源，并读取官方 `target` / `targetPlatform` 线索，对非 Clash/Mihomo 目标给出显式提醒。
 * 26. 官方链接增强：直接读取请求 query 中的脚本参数，并识别 `/download/xxx/ClashMeta` 这类多一级路由目标；若与 query target 冲突则显式提醒。
 * 27. 官方链接体验增强：当 `_req.query` 缺失时直接从请求 URL 解析 query，并把无值旗标参数（如 `#noCache`、`?full`）视作 `true`。
 * 28. 官方请求兼容增强：追加 `_req.path` 回退来源，并把 `query / url / path` 三路参数做智能合并，尽量还原真实下载链路。
 * 29. 官方路由兼容增强：支持从 `_req.params.target` / `_req.params.platform` 直接识别路由目标，补齐更多后端实现差异。
 * 30. 官方响应调试增强：支持借助 `_res.headers` 回写脚本版本 / 目标平台 / 参数命中摘要，便于排查真实下载链路。
 * 31. 官方链接诊断增强：补充请求路由类型/名称识别，并汇总 `url/content/mergeSources/noCache` 等官方保留参数状态。
 * 32. Provider 缓存增强：开放 rule-provider 本地缓存目录与刷新间隔参数化，减少多脚本/多配置共存时的缓存文件冲突。
 * 33. Provider 下载增强：追加 rule-provider 下载代理、大小限制与常用请求头参数化，对齐 Mihomo 官方高级项。
 * 34. 独立组优选增强：开放 GitHub / Steam 独立组国家优先链参数，让独立组不再只有固定顺序。
 * 35. 独立组模式增强：开放 GitHub / Steam 独立组模式参数，可切换直连优先 / 主选择优先 / 纯代理优先。
 * 36. 独立组类型增强：开放 GitHub / Steam 独立组类型参数，可切换 select / url-test / fallback / load-balance。
 * 37. 独立组测速增强：开放 GitHub / Steam 独立组专属测速地址与测速间隔参数，便于细调测速类独立组。
 * 38. 独立组健康检查增强：开放 GitHub / Steam 独立组专属容差、超时、lazy、失败次数与 expected-status 参数。
 * 39. 独立组节点池增强：开放 GitHub / Steam 独立组原始节点筛选、排除与协议排除参数，支持 include-all-proxies + filter / exclude-filter / exclude-type 高级玩法。
 * 40. 独立组编排增强：开放 GitHub / Steam 独立组任意前置组参数，可额外引用已生成策略组、内置策略与用户自定义组。
 * 41. 独立组点名增强：开放 GitHub / Steam 独立组指定节点优先参数，可直接把明确节点名固定插到候选链最前面。
 * 42. 规则入口增强：开放 GitHub / Steam / SteamCN 规则目标参数，可把规则入口直接改写到任意组或内置策略。
 * 43. 规则顺序增强：开放 GitHub / Steam / SteamCN 规则锚点与前后位置参数，可重排规则入口在整条 RULE-SET 链里的先后顺序。
 * 44. 独立组展示增强：开放 GitHub / Steam 独立组 hidden / icon / disable-udp 参数，对齐 Mihomo Proxy-Group 官方字段。
 * 45. 负载策略增强：开放全局与 GitHub / Steam 独立组 load-balance strategy 参数，对齐 Mihomo 官方 round-robin / consistent-hashing / sticky-sessions。
 * 46. Provider 池增强：开放 GitHub / Steam 独立组 use / include-all-providers 参数，可直接吸收原配置里的 proxy-providers。
 * 47. 全量池增强：开放 GitHub / Steam 独立组 include-all 参数，并对 provider 型健康检查盲区追加官方语义提醒。
 * 48. 健康检查语法增强：按 Mihomo 官方 expected-status 语法校验多状态/范围写法，非法值自动回退并显式告警。
 * 49. 策略组网络增强：开放全局与 GitHub / Steam 独立组 interface-name / routing-mark 参数，并对官方 deprecated 状态追加提醒。
 * 50. 节点池玩法增强：开放 GitHub / Steam 独立组 include-all-proxies 显式参数，支持无筛选条件时也能直接吸收全部原始节点。
 * 51. 代理集合增强：开放现有 proxy-providers 的下载控制与 health-check 参数化，并补充 provider 自检。
 * 52. 代理集合节点池增强：开放现有 proxy-providers 的 filter / exclude-filter / exclude-type 参数，便于批量筛选 provider 内节点。
 * 53. 代理集合 Override 增强：开放现有 proxy-providers 的 override 前后缀、传输与网络字段，便于批量改写 provider 内节点行为。
 * 54. 代理集合改名增强：开放现有 proxy-providers 的 override.proxy-name 正则改名规则，便于批量重写 provider 内节点名。
 * 55. 代理集合路径增强：开放现有 proxy-providers 的本地缓存目录参数，便于统一隔离 provider 缓存路径并补充路径冲突自检。
 * 56. 代理集合请求头增强：开放现有 proxy-providers 的通用自定义请求头参数，便于统一下发任意 HTTP 头并补充请求头自检。
 * 57. 代理集合 Payload 增强：开放现有 proxy-providers 的 payload 参数，便于统一注入 inline/后备节点池并补充节点结构自检。
 * 58. 代理集合官方语义自检增强：按 Mihomo 官方 type/url/path/payload 关系补充 provider 结构校验，并对 HomeDir/SAFE_PATHS 路径限制追加提醒。
 * 59. 规则集合官方语义自检增强：按 Mihomo 官方 rule-provider 的 type/behavior/format/path/payload 关系补充结构校验，并同步 SAFE_PATHS 提醒。
 * 60. 规则集合请求头增强：开放脚本内置 rule-providers 的通用自定义请求头参数，便于统一下发任意 HTTP Header 并补充请求头自检。
 * 61. 规则集合语义细化增强：按 Mihomo 官方限制补充 `payload` 仅对 inline 生效、`mrs` 仅支持 domain/ipcidr 的细粒度告警。
 * 62. 规则集合统一接管增强：现有与内置 http rule-providers 统一吃到 path/interval/proxy/size-limit/header 参数，并补充作用范围摘要。
 * 63. 规则集合 Payload 增强：开放现有 inline rule-providers 的 payload 参数，支持 JSON / 多行规则写法并补充作用范围摘要。
 * 64. 代理集合作用范围摘要增强：把 path/download/payload/filter/override/health-check 的实际接管范围统一写入日志与响应调试头。
 * 65. 规则源作用范围摘要增强：把 path/download/payload 的实际接管范围统一抽成 helper，并补充详细响应调试头。
 * 66. Provider 命中统计增强：为 rule-provider / proxy-provider 输出实际命中数量摘要，便于排查参数真正打到了多少条目。
 * 67. Provider 改动统计增强：继续区分新增写入与覆盖旧值，便于判断参数究竟是在补字段还是替换原配置。
 * 68. Provider 无变化统计增强：在改动统计里继续补上 noop 数量，便于判断命中后是否其实已与目标值一致。
 * 69. Provider 命中预览增强：在命中统计之外继续补上 provider 名称样本预览，便于快速定位究竟是哪些 provider 吃到了参数。
 * 70. Provider 改动预览增强：在改动统计之外继续补上 added/overrode/noop 的 provider 名称样本，便于直接定位是哪批 provider 被补全、覆盖或保持不变。
 * 71. 官方链接参数语义增强：按 Sub-Store 官方链接参数说明补充 url/mergeSources/produceType/noCache/proxy/ua/ignoreFailedRemoteSub 语义校验与调试摘要。
 * 72. 参数来源追踪增强：补充 $arguments/$options/_req.query/_req.url/_req.path/_req.params 的来源摘要，便于排查真实运行环境下参数到底从哪一路进入脚本。
 * 73. 参数生效来源增强：补充 query/$options/$arguments 的最终生效来源与覆盖关系摘要，便于定位同名参数冲突时究竟哪一路赢了优先级。
 * 74. 未消费参数增强：补充未被脚本识别/消费的参数摘要，便于快速定位拼写错误、别名写错或当前版本暂未支持的参数。
 * 75. 顺序观测增强：补充策略组排列、关键组候选优先级与规则匹配先后摘要，便于直接判断“哪些组排在前面、哪些流量先命中”。
 * 76. 规则入口映射增强：补充规则入口 -> 目标组映射与目标分布摘要，便于直接看出各业务规则最终被打到哪里。
 * 77. 规则优先级风险增强：补充宽泛规则抢先命中特定业务规则的风险提示，便于及时发现 GitHub / Steam / SteamCN 被前置大规则提前吃掉。
 * 78. 候选链风险增强：补充关键策略组的候选链顺序风险提示，便于及时发现 DIRECT / REJECT / FALLBACK / SELECT 排位异常。
 * 79. 分流链路总览增强：把请求入口、规则入口、目标组和关键组候选链串成统一摘要，便于快速观察整条流量分流路径。
 * 80. 业务链路总览增强：把 GitHub / Steam / SteamCN / AI / Crypto 的规则入口、目标组、组类型与头部候选链单独拉平输出，便于直接检查每类业务到底会怎么走。
 * 81. 规则层级总览增强：把最终 rules 按拦截层 / 本地直连层 / AI-Crypto 层 / 通用业务层 / 地区层 / 自定义层 / 兜底层拆开统计，便于更直观看“哪些流量先走”。
 * 82. 自定义规则区间增强：把 config.rules 的原始条数、有效插入条数、所在区间、主要类型和目标组单独拉平输出，便于检查外部自定义规则到底插进了哪里、真正生效了多少条。
 * 83. 关键命中窗口增强：把 Geo_Not_CN / DirectList / CN / CN_IP / GitHub / Steam / SteamCN / MATCH 的实际位置与相邻规则窗口单独拉平输出，便于直接看出“谁卡在谁前面”。
 * 84. 规则层级目标映射增强：把最终 rules 的层级与目标组交叉统计，便于直接看出每一层主要把流量送进了哪些组。
 * 85. 业务规则窗口增强：把 AI / Crypto / GitHub / Steam / SteamCN 规则的前后 2 跳窗口单独拉平输出，便于直接看出这些业务规则被谁前后夹住。
 * 86. 策略组布局增强：开放 group-order-preset / group-order，可直接重排最终 proxy-groups 展示顺序，而不只是观测顺序。
 * 87. 自定义规则顺序增强：开放 custom-rule-anchor / custom-rule-position，可把 config.rules 插到指定 RULE-SET 锚点前后，真正控制“哪些流量先走”。
 * 88. 顺序诊断增强：补充策略组编排参数与自定义规则编排参数告警，避免 group-order / custom-rule-anchor 写错后静默失效。
 * 89. 顺序摘要增强：把策略组布局模式与自定义规则编排方式同步写入 full 日志和响应调试头，便于直接核对本轮顺序配置是否真的生效。
 * 90. GitHub 规则生态增强：接入 GitHub 社区常用的 blackmatrix7 规则源预设，可切换 GitHub / Steam / SteamCN / OpenAI / Anthropic / Gemini / Copilot 内置规则来源。
 * 91. Steam 修复增强：接入 GitHub 覆写项目常见的 SteamFix 规则补丁，可选在 Steam / SteamCN 前面插入直连修复规则。
 * 92. 规则源诊断增强：补充 rule-source-preset / steam-fix 参数摘要、URL 校验与响应调试头，便于直接确认社区规则源是否已真正接管。
 * 93. 开发生态增强：新增开发服务组，并接入 GitLab / Docker / NPM / JetBrains 等常见开发流量分流。
 * 94. 开发链路观测增强：把开发服务规则纳入业务规则窗口、业务链路总览与关键候选链摘要，便于直接观察开发流量怎么走。
 * 95. 开发服务组参数化增强：开放 dev-mode / dev-type / dev-prefer-groups / dev-prefer-nodes，把开发服务组升级为可独立编排的业务组。
 * 96. 开发规则顺序增强：开放 dev-rule-target / dev-rule-anchor / dev-rule-position，可统一改写 GitLab / Docker / Npmjs / JetBrains 等开发规则入口与优先级。
 * 97. 开发服务组高级项增强：继续开放 dev-test-url / dev-group-* / dev-group-strategy / dev-hidden / dev-icon / dev-disable-udp / dev-interface-name / dev-routing-mark。
 * 98. 开发服务组节点池增强：继续开放 dev-node-filter / dev-node-exclude-filter / dev-node-exclude-type / dev-include-all-proxies。
 * 99. 开发服务组 Provider 池增强：继续开放 dev-use-providers / dev-include-all / dev-include-all-providers，对齐 GitHub / Steam 独立组玩法。
 * 100. 开发服务组国家优先链增强：继续开放 dev-prefer-countries，让开发流量也能按国家组优先，再回落 GitHub / 主选择链。
 * 101. AI 服务增强：继续接入 Copilot 社区规则，并纳入 AI 链路、业务规则窗口与业务链路观测。
 * 102. 社区规则源修正：对齐 blackmatrix7 当前目录命名，把 Anthropic 社区源校正为 Claude.yaml，避免 rule-source-preset=blackmatrix7 时取错路径。
 * 103. AI 补充规则增强：新增 AIExtra 规则源与 ai-extra-list-url，可继续吸收 GitHub 社区常见的 Perplexity / Cursor / HuggingFace 等补充域名。
 * 104. 社区 AI 规则增强：继续接入 Accademia/Additional_Rule_For_Clash 里的 Grok / AppleAI 规则，并默认纳入 AI 链路。
 * 105. AI 链路观测增强：把 AIExtra / Grok / AppleAI 继续纳入业务规则窗口、业务链路总览与 AI 风险提醒，方便直接观察新补充规则怎么走。
 * 106. 开发生态规则增强：继续接入 blackmatrix7 的 Vercel / Python / Jfrog 社区规则，并统一纳入开发服务组。
 * 107. 开发链路观测增强：把 Vercel / Python / Jfrog 一起纳入业务规则窗口、业务链路总览、规则锚点别名与整条分流链路总览。
 * 108. 开发生态规则继续增强：继续接入 blackmatrix7 的 Heroku / GitBook / SourceForge 社区规则，并统一纳入开发服务组。
 * 109. 开发链路观测继续增强：把 Heroku / GitBook / SourceForge 一起纳入业务规则窗口、业务链路总览、规则锚点别名与整条分流链路总览。
 * 110. 云平台与数据科学开发规则增强：继续接入 blackmatrix7 的 DigitalOcean / Anaconda 社区规则，并统一纳入开发服务组。
 * 111. 开发链路观测继续增强：把 DigitalOcean / Anaconda 一起纳入业务规则窗口、业务链路总览、规则锚点别名与整条分流链路总览。
 * 112. 协作平台开发规则增强：继续接入 blackmatrix7 的 Atlassian 社区规则，并统一纳入开发服务组。
 * 113. 开发链路观测继续增强：把 Atlassian 一起纳入业务规则窗口、业务链路总览、规则锚点别名与整条分流链路总览。
 * 114. 研发协作工具规则增强：继续接入 blackmatrix7 的 Notion / Figma / Slack 社区规则，并统一纳入开发服务组。
 * 115. 开发链路观测继续增强：把 Notion / Figma / Slack 一起纳入业务规则窗口、业务链路总览、规则锚点别名与整条分流链路总览。
 * 116. 协作文件规则增强：继续接入 blackmatrix7 的 Dropbox 社区规则，并统一纳入开发服务组。
 * 117. GitHub 项目检索增强：补充对额外社区仓库的在线检索结论；当前 Netlify / Supabase / Railway / Render 未发现稳定规则，而 Dropbox 规则已接入。
 * 118. OneDrive 规则源增强：继续根据 GitHub 检索结果，把 blackmatrix7 的 OneDrive 社区规则接入 rule-source-preset=blackmatrix7 的可切换范围。
 * 119. OneDrive 链路观测增强：把 OneDrive / SharePoint / SkyDrive 继续纳入业务链路总览与规则顺序锚点别名，便于观察协作文件流量如何命中。
 * 120. 国家识别增强：继续按现有命名风格扩充更多常见机场国家/地区别名，补齐澳门、荷兰、意大利、西班牙、印度、大马、泰国、越南、菲律宾、印尼、阿联酋、沙特、墨西哥等节点识别。
 * 121. 国家命名风格增强：继续保持“中文主名 + 常见英文/缩写/城市别名”的写法，并沿用狮城/枫叶/袋鼠/毛熊这类显示风格。
 * 122. 国家识别继续增强：继续补齐瑞士、瑞典、挪威、芬兰、丹麦、葡萄牙、爱尔兰、比利时、奥地利、波兰、南非、以色列、新西兰等常见节点国家。
 * 123. 国家别名安全增强：对 India / Malaysia / Italy 等容易和普通英文单词冲突的两位缩写做保守收紧，优先依赖国家名、三位缩写与城市名识别，减少误判。
 * 124. 自定义国家别名增强：新增 country-extra-aliases 参数，支持不改脚本源码直接追加你自己的节点命名别名。
 * 125. 国家优先链兼容增强：country-extra-aliases 追加的别名会同时参与节点国家识别与 prefer-countries 参数匹配，便于直接复用到 AI / GitHub / Steam / Dev 优先链。
 * 126. 国家识别继续扩充：新增捷克、匈牙利、罗马尼亚、希腊、乌克兰、冰岛、埃及、智利、哥伦比亚、秘鲁等常见机场国家识别。
 * 127. 自定义国家别名预览增强：full 日志与响应调试头会额外输出 country-extra-aliases 的简要预览，便于直接确认绑定关系。
 * 128. 国家识别继续扩充：新增卢森堡、爱沙尼亚、拉脱维亚、立陶宛、保加利亚、克罗地亚、斯洛伐克、斯洛文尼亚、卡塔尔、科威特等常见节点国家。
 * 129. 自定义国家别名冲突检测：country-extra-aliases 若把同一别名绑到多个国家，或撞到别的内置国家标记，会给出显式告警与摘要预览。
 * 130. 区域分组增强：参考 GitHub 社区常见的 HK/TW/SG/JP/US 等区域聚合玩法，新增可选 region-groups 参数，支持自动生成亚洲/欧洲/美洲/中东/大洋洲/非洲区域组。
 * 131. 区域布局增强：region-groups 生成的区域组会同步接入 group-order / group-order-preset 的布局桶、响应调试头与 full 日志，便于和国家组一起编排面板顺序。
 * 132. 国家排序增强：新增 country-group-sort / country-sort 参数，可按定义顺序、节点数量或名称重排国家组，便于同时调整面板顺序与候选链顺序。
 * 133. 区域排序增强：新增 region-group-sort / region-sort 参数，可按定义顺序、聚合节点数或名称重排区域组，便于继续微调区域面板与前置组引用顺序。
 * 134. 国家识别扩容：继续按当前中文显示名风格补充巴基斯坦、孟加拉、哈萨克斯坦、塞尔维亚、摩尔多瓦、塞浦路斯、尼日利亚、摩洛哥、肯尼亚、柬埔寨、文莱等常见国家/地区别名。
 * 135. 区域映射补强：新增国家会同步接入亚洲 / 欧洲 / 非洲等区域组，减少 region-groups 已开启但国家组未覆盖时的空洞感。
 * 136. 子区域增强：在现有 asia / europe / americas 之外，继续补充 eastasia / southeastasia / southasia / northamerica / southamerica / northeurope / centraleurope / gulf 等细分区域 token。
 * 137. 区域默认集兼容：region-groups=all/auto/default 仍只启用原有大区；新子区域仅在显式点名时生成，避免旧链接面板突然膨胀。
 * 138. 国家优先链区域化：ai/github/steam/dev/crypto 的 prefer-countries 现在也支持 asia/eastasia/gulf/northamerica 这类区域 token，会自动展开成当前已生成的国家组。
 * 139. 优先链区域化兼容：prefer-countries 的区域 token 不依赖是否启用 region-groups 面板，只要对应国家组已生成就会生效。
 * 140. 优先链命中摘要：AI / Crypto / GitHub / Steam / Dev 的 prefer-countries 最终命中结果现在会汇总成单行摘要，便于直接确认区域 token 到底展开成了哪些国家组。
 * 141. 优先链响应头增强：开启 response-headers 后，会额外输出 AI / Crypto / GitHub / Steam / Dev 的 Prefer-Countries-Resolved 头，方便下载链路调试。
 * 142. 优先链预设增强：prefer-countries 新增 ai-core / crypto-core / gaming-core / dev-core / asia-core / europe-core / americas-core / global-core 等可复用 preset，减少手写长串国家/区域 token。
 * 143. 优先链预设兼容：preset 可继续展开为国家、区域、子区域 token，并最终复用现有排序、命中摘要与告警体系。
 * 144. GitHub 社区预设吸收：参考 GitHub 上常见的 HK/TW/SG/JP/US 与 HK/TW/SG/JP/KR/US 面板组合，补充 classic-5 / classic-6 这类社区化 Prefer-Countries preset。
 * 145. 社区缩写兼容：classic-5 / classic-6 同步兼容 hktwsgjpus / hktwsgjpkrus 等连写缩写，便于直接复用常见社区命名习惯。
 * 146. 社区四地预设：继续补充 HK/SG/JP/US 与 HK/TW/SG/JP 这两组更轻量的经典四地 preset，适合低延迟和纯亚洲优先场景。
 */

// 记录当前脚本版本，便于在日志中确认用户正在运行哪一版脚本。
const SCRIPT_VERSION = "8.98.0";
// 对外 README / 变更说明使用带 V 前缀的版本标签：V8.98.0。
// 统一保存 Clash/Mihomo 内置的直连策略名称，避免魔法字符串散落全文件。
const BUILTIN_DIRECT = "DIRECT";
// 给国家分组拼接统一后缀，最终会生成诸如“🇯🇵 日本节点”的组名。
const NODE_SUFFIX = "节点";
// 统一维护国家组 / 区域组排序模式别名，避免规范化逻辑和参数校验各写一份后逐步漂移。
const GEO_GROUP_SORT_MODE_ALIAS_MAP = Object.freeze({
  default: "definition",
  script: "definition",
  builtin: "definition",
  original: "definition",
  order: "definition",
  definition: "definition",
  definitions: "definition",
  manual: "definition",
  count: "count-desc",
  hot: "count-desc",
  popular: "count-desc",
  size: "count-desc",
  countdesc: "count-desc",
  desc: "count-desc",
  descending: "count-desc",
  countasc: "count-asc",
  asc: "count-asc",
  ascending: "count-asc",
  name: "name",
  names: "name",
  alpha: "name",
  alphabetical: "name",
  namedesc: "name-desc",
  alphadesc: "name-desc",
  reversealpha: "name-desc",
  reversename: "name-desc"
});
// 单独缓存允许的原始 token，后面校验参数时直接复用。
const GEO_GROUP_SORT_MODE_TOKENS = Object.freeze(Object.keys(GEO_GROUP_SORT_MODE_ALIAS_MAP));
// 所有测速类策略组共用的探测地址。
const TEST_URL = "https://cp.cloudflare.com/generate_204";
// 规则提供器的刷新间隔，单位秒，这里按 24 小时更新一次。
const RULE_INTERVAL = 86400;
// proxy-provider 的默认刷新间隔，单位秒。
const PROXY_PROVIDER_INTERVAL = 3600;
// URL-Test / Load-Balance 这类策略组的测速间隔，单位秒。
const GROUP_INTERVAL = 600;
// 健康检查超时时间，单位毫秒。
const GROUP_TIMEOUT = 5000;
// proxy-provider health-check 的默认超时时间，单位毫秒。
const PROXY_PROVIDER_HEALTH_CHECK_TIMEOUT = 5000;
// URL-Test / Load-Balance 允许的延迟波动阈值。
const GROUP_TOLERANCE = 100;
// 健康检查最大失败次数，超过后会触发强制检查。
const GROUP_MAX_FAILED_TIMES = 5;
// 对 Cloudflare 204 检测地址采用更严格的预期状态码判断。
const GROUP_EXPECTED_STATUS = "204";
// threshold 参数的最大值，避免用户传入离谱的大数导致分组失真。
const MAX_THRESHOLD = 100;
// 如果原配置没有 mixed-port，则回落到这个默认端口。
const DEFAULT_MIXED_PORT = 7890;
// rule-provider 本地缓存目录。
const RULE_PROVIDER_PATH_DIR = "./providers/rules";
// MetaCubeX 标准 geo 规则仓库根地址。
const META_URL = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo";
// MetaCubeX geo-lite 规则仓库根地址，部分 IP 库使用更轻量的版本。
const META_GEO_LITE_URL = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo-lite";
// 当前仓库规则文件的默认 Raw 根地址，方便给自定义 classical 规则统一拼 URL。
const RULESET_REPO_BASE_URL = "https://raw.githubusercontent.com/langhun/Rule/main/Clash/Ruleset";
// blackmatrix7 社区规则仓库的 Clash 规则目录。
const BLACKMATRIX7_CLASH_RULE_BASE_URL = "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash";
// Accademia 的 Additional_Rule_For_Clash 仓库，补充 Grok / AppleAI 这类 blackmatrix7 尚未完整覆盖的 AI 规则。
const ACCADEMIA_ADDITIONAL_RULE_BASE_URL = "https://raw.githubusercontent.com/Accademia/Additional_Rule_For_Clash/main";
// powerfullz 覆写项目规则目录，这里主要复用 SteamFix 补丁。
const POWERFULLZ_RULESET_BASE_URL = "https://raw.githubusercontent.com/powerfullz/override-rules/master/ruleset";
// 默认直连规则地址。
const DIRECT_LIST_URL = `${RULESET_REPO_BASE_URL}/Direct.list`;
// 默认加密货币规则地址。
const CRYPTO_LIST_URL = `${RULESET_REPO_BASE_URL}/Crypto.list`;
// 默认 ChatGPT / OpenAI 规则地址。
const CHATGPT_LIST_URL = `${RULESET_REPO_BASE_URL}/ChatGPT.list`;
// 默认 AI 补充规则地址，用来承接社区里常见但主规则未必完整覆盖的 AI 服务域名。
const AI_EXTRA_LIST_URL = `${RULESET_REPO_BASE_URL}/AIExtra.list`;
// 默认 SteamFix 规则地址。
const STEAM_FIX_LIST_URL = `${POWERFULLZ_RULESET_BASE_URL}/SteamFix.list`;
// Mihomo 官方 General 配置文档中的推荐 GeoX 下载地址。
const GEOX_URLS = {
  geoip: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat",
  geosite: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat",
  mmdb: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb",
  asn: "https://github.com/xishang0128/geoip/releases/download/latest/GeoLite2-ASN.mmdb"
};

// 用于识别低倍率、公益、实验性等不适合参与主国家分组统计的节点。
const REGEX_LOW_COST = /0\.[0-5]|低倍率|省流|大流量|实验性|公益/i;
// 用于识别“落地 / 中转 / Relay”等需要单独隔离的节点。
const REGEX_LANDING_ISOLATE = /落地|Relay|To-user|中转/i;
// 这些名称属于策略引擎内置保留策略，不需要在 proxy-groups 中额外定义。
const BUILTIN_POLICY_NAMES = ["DIRECT", "REJECT", "REJECT-DROP", "PASS", "GLOBAL", "COMPATIBLE"];
// 规则顺序编排时，用这两个哨兵值表示“移到最前 / 移到最后（MATCH 之前）”。
const RULE_ORDER_START = "__RULE_ORDER_START__";
const RULE_ORDER_END = "__RULE_ORDER_END__";
// 策略组布局预设的默认模式。
const DEFAULT_GROUP_ORDER_PRESET = "balanced";
// 内置规则源预设的默认模式。
const DEFAULT_RULE_SOURCE_PRESET = "meta";

// 统一维护所有策略组的展示名称，后面所有规则和分组都从这里取值。
const GROUPS = {
  // 主入口，用户最终在客户端里最常选择的总开关。
  SELECT: "🚀 节点选择",
  // 手动切换组，直接列出所有节点供用户人工挑选。
  MANUAL: "🎯 手动切换",
  // 自动切换组，给自动优选、故障转移场景使用。
  FALLBACK: "⚡ 自动切换",
  // 全局直连组，给国内服务或特殊服务优先直连使用。
  DIRECT: "🎯 全球直连",
  // 落地节点隔离组，仅在 landing=true 时生成。
  LANDING: "🏳️‍🌈 落地节点",
  // 低倍率节点集合，只在检测到对应节点时生成。
  LOW_COST: "🐢 低倍率",
  // 真正的兜底分组，接住没有被国家分组吸收的剩余节点。
  OTHER: "🐟 兜底节点",

  // AI 服务专用策略组。
  AI: "🤖 AI服务",
  // 加密货币相关服务专用策略组。
  CRYPTO: "💰 加密货币",
  // Apple 服务专用策略组。
  APPLE: "🍎 Apple",
  // Microsoft 服务专用策略组。
  MICROSOFT: "Ⓜ️ 微软服务",
  // Google 服务专用策略组。
  GOOGLE: "🇬 Google",
  // GitHub 专用策略组。
  GITHUB: "🐙 GitHub",
  // 开发生态服务专用策略组。
  DEV: "🧑‍💻 开发服务",
  // Bing 专用策略组。
  BING: "🔍 Bing",
  // OneDrive 专用策略组。
  ONEDRIVE: "☁️ OneDrive",

  // Telegram 专用策略组。
  TELEGRAM: "✈️ Telegram",
  // YouTube 专用策略组。
  YOUTUBE: "📹 YouTube",
  // Netflix 专用策略组。
  NETFLIX: "🎥 Netflix",
  // Disney+ 专用策略组。
  DISNEY: "🏰 Disney+",
  // Spotify 专用策略组。
  SPOTIFY: "🎧 Spotify",
  // TikTok 专用策略组。
  TIKTOK: "🎵 TikTok",

  // Steam 专用策略组。
  STEAM: "🚂 Steam",
  // 泛游戏流量策略组。
  GAMES: "🎮 游戏加速",
  // PT 下载策略组。
  PT: "📦 PT下载",
  // 测速流量策略组。
  SPEEDTEST: "📈 网络测速",
  // 广告拦截策略组。
  ADS: "🛑 广告拦截"
};

// 开发生态规则入口集合：用于统一改写 GitLab / Docker / Npmjs / JetBrains / Vercel / Python / Jfrog / Heroku / GitBook / SourceForge / DigitalOcean / Anaconda / Atlassian / Notion / Figma / Slack / Dropbox 这类开发服务规则。
const DEV_RULE_PROVIDERS = Object.freeze(["GitLab", "Docker", "Npmjs", "Jetbrains", "Vercel", "Python", "Jfrog", "Heroku", "GitBook", "SourceForge", "DigitalOcean", "Anaconda", "Atlassian", "Notion", "Figma", "Slack", "Dropbox"]);

// 策略组布局预设：用于整体重排面板里 proxy-groups 的展示顺序。
const GROUP_ORDER_PRESET_TOKENS = {
  balanced: ["select", "manual", "fallback", "ai", "telegram", "google", "github", "microsoft", "onedrive", "games", "bing", "apple", "steam", "pt", "speedtest", "media", "crypto", "ads", "direct", "landing", "lowcost", "regions", "countries", "other", "extras"],
  core: ["select", "manual", "fallback", "direct", "ads", "ai", "github", "steam", "crypto", "google", "microsoft", "onedrive", "telegram", "apple", "bing", "games", "pt", "speedtest", "media", "landing", "lowcost", "regions", "countries", "other", "extras"],
  service: ["select", "manual", "fallback", "ai", "github", "steam", "crypto", "google", "microsoft", "onedrive", "telegram", "apple", "bing", "games", "pt", "speedtest", "media", "ads", "direct", "landing", "lowcost", "regions", "countries", "other", "extras"],
  media: ["select", "manual", "fallback", "media", "telegram", "google", "apple", "github", "steam", "games", "ai", "crypto", "microsoft", "onedrive", "bing", "pt", "speedtest", "ads", "direct", "landing", "lowcost", "regions", "countries", "other", "extras"],
  region: ["select", "manual", "fallback", "regions", "countries", "other", "ai", "github", "steam", "crypto", "google", "microsoft", "onedrive", "telegram", "apple", "bing", "games", "pt", "speedtest", "media", "ads", "direct", "landing", "lowcost", "extras"]
};

// 某些自动分组天然允许为空，不必为此输出告警。
const ALLOW_EMPTY_AUTO_GROUPS = [GROUPS.OTHER, GROUPS.LANDING];
// 允许通过参数隐藏的辅助策略组。
const HIDEABLE_GROUPS = [GROUPS.DIRECT, GROUPS.ADS, GROUPS.LANDING, GROUPS.LOW_COST];
// AI 默认优先国家链：新加坡 -> 日本 -> 美国 -> 香港。
const DEFAULT_AI_PREFERRED_COUNTRY_MARKERS = [["🇸🇬", "狮城", "新加坡"], ["🇯🇵", "日本"], ["🇺🇸", "美国"], ["🇭🇰", "香港"]];
// Crypto 默认优先国家链：日本 -> 新加坡 -> 香港。
const DEFAULT_CRYPTO_PREFERRED_COUNTRY_MARKERS = [["🇯🇵", "日本"], ["🇸🇬", "狮城", "新加坡"], ["🇭🇰", "香港"]];
// Prefer-Countries 预设包：让 AI / Crypto / GitHub / Steam / Dev 等优先链不用每次手写长串国家/区域标记。
const PREFERRED_COUNTRY_PRESET_DEFINITIONS = Object.freeze([
  {
    key: "ai-core",
    name: "🤖 AI核心链",
    aliases: ["aicore", "ai-core", "aihot", "ai-hot", "ai核心"],
    markers: ["狮城", "日本", "美国", "香港"]
  },
  {
    key: "crypto-core",
    name: "💰 加密核心链",
    aliases: ["cryptocore", "crypto-core", "cryptohot", "crypto-hot", "加密核心"],
    markers: ["日本", "狮城", "香港", "gulf"]
  },
  {
    key: "gaming-core",
    name: "🎮 游戏核心链",
    aliases: ["gamingcore", "gaming-core", "gamecore", "game-core", "游戏核心"],
    markers: ["eastasia", "southeastasia", "northamerica"]
  },
  {
    key: "dev-core",
    name: "🧑‍💻 开发核心链",
    aliases: ["devcore", "dev-core", "workcore", "work-core", "开发核心"],
    markers: ["eastasia", "northeurope", "centraleurope", "northamerica"]
  },
  {
    key: "asia-core",
    name: "🌏 亚洲核心链",
    aliases: ["asiacore", "asia-core", "亚洲核心"],
    markers: ["eastasia", "southeastasia", "southasia"]
  },
  {
    key: "europe-core",
    name: "🌍 欧洲核心链",
    aliases: ["europecore", "europe-core", "欧洲核心"],
    markers: ["northeurope", "centraleurope"]
  },
  {
    key: "americas-core",
    name: "🌎 美洲核心链",
    aliases: ["americascore", "americas-core", "americacore", "america-core", "美洲核心"],
    markers: ["northamerica", "southamerica"]
  },
  {
    key: "global-core",
    name: "🌐 全球核心链",
    aliases: ["globalcore", "global-core", "worldcore", "world-core", "全球核心"],
    markers: ["eastasia", "southeastasia", "northeurope", "centraleurope", "northamerica", "gulf"]
  },
  {
    key: "classic-4",
    name: "✨ 经典四地",
    aliases: ["classic4", "classic-4", "popular4", "popular-4", "common4", "common-4", "hksgjpus", "hk-sg-jp-us", "经典四地"],
    markers: ["香港", "狮城", "日本", "美国"]
  },
  {
    key: "asia-4",
    name: "🌸 亚洲四地",
    aliases: ["asia4", "asia-4", "east4", "east-4", "hktwsgjp", "hk-tw-sg-jp", "亚洲四地"],
    markers: ["香港", "台湾", "狮城", "日本"]
  },
  {
    key: "classic-5",
    name: "⭐ 经典五地",
    aliases: ["classic5", "classic-5", "popular5", "popular-5", "common5", "common-5", "hktwsgjpus", "hk-tw-sg-jp-us", "经典五地"],
    markers: ["香港", "台湾", "狮城", "日本", "美国"]
  },
  {
    key: "classic-6",
    name: "🌟 经典六地",
    aliases: ["classic6", "classic-6", "popular6", "popular-6", "common6", "common-6", "hktwsgjpkrus", "hk-tw-sg-jp-kr-us", "经典六地"],
    markers: ["香港", "台湾", "狮城", "日本", "韩国", "美国"]
  }
]);

// 国家/地区识别配置表。
// 这里不只放国家名，还放旗帜和别名，用于后续自动识别节点归属。
const COUNTRY_DEFINITIONS = [
  // 香港常见命名方式。
  { name: "香港", flag: "🇭🇰", aliases: ["香港", "HK", "HKG", "Hong Kong", "HongKong"] },
  // 澳门常见命名方式。
  { name: "澳门", flag: "🇲🇴", aliases: ["澳门", "MO", "MAC", "Macao", "Macau"] },
  // 台湾常见命名方式。
  { name: "台湾", flag: "🇹🇼", aliases: ["台湾", "台北", "新北", "TW", "TWN", "Taiwan"] },
  // 日本常见命名方式。
  { name: "日本", flag: "🇯🇵", aliases: ["日本", "东京", "大阪", "埼玉", "JP", "JPN", "Japan", "Tokyo", "Osaka"] },
  // 新加坡/狮城常见命名方式。
  { name: "狮城", flag: "🇸🇬", aliases: ["新加坡", "狮城", "SG", "SGP", "Singapore"] },
  // 韩国常见命名方式。
  { name: "韩国", flag: "🇰🇷", aliases: ["韩国", "首尔", "KR", "KOR", "Korea", "Seoul"] },

  // 美国常见命名方式，同时补充常见机房/城市关键词。
  { name: "美国", flag: "🇺🇸", aliases: ["美国", "美区", "US", "USA", "United States", "America", "Los Angeles", "Seattle", "San Jose", "Santa Clara", "Oregon", "Phoenix", "Dallas", "Chicago", "洛杉矶", "西雅图", "圣何塞", "圣克拉拉", "俄勒冈", "凤凰城", "达拉斯", "芝加哥", "硅谷", "费利蒙", "波特兰", "拉斯维加斯"] },
  // 阿根廷常见命名方式。
  { name: "阿根廷", flag: "🇦🇷", aliases: ["阿根廷", "AR", "ARG", "Argentina"] },
  // 巴西常见命名方式。
  { name: "巴西", flag: "🇧🇷", aliases: ["巴西", "BR", "BRA", "Brazil"] },
  // 加拿大常见命名方式，这里用“枫叶”作为显示名称。
  { name: "枫叶", flag: "🇨🇦", aliases: ["加拿大", "枫叶", "CA", "CAN", "Canada", "Toronto", "Vancouver", "多伦多", "温哥华"] },

  // 英国常见命名方式。
  { name: "英国", flag: "🇬🇧", aliases: ["英国", "英伦", "UK", "GB", "GBR", "United Kingdom", "Britain", "London", "伦敦"] },
  // 德国常见命名方式。
  { name: "德国", flag: "🇩🇪", aliases: ["德国", "战车", "DE", "DEU", "Germany", "Frankfurt", "法兰克福"] },
  // 法国常见命名方式。
  { name: "法国", flag: "🇫🇷", aliases: ["法国", "高卢", "FR", "FRA", "France", "Paris", "巴黎"] },
  // 荷兰常见命名方式。
  { name: "荷兰", flag: "🇳🇱", aliases: ["荷兰", "NL", "NLD", "Netherlands", "Amsterdam", "Rotterdam", "阿姆斯特丹", "鹿特丹"] },
  // 意大利常见命名方式；不使用容易误判的 IT 两位缩写。
  { name: "意大利", flag: "🇮🇹", aliases: ["意大利", "ITA", "Italy", "Milan", "Rome", "米兰", "罗马"] },
  // 西班牙常见命名方式。
  { name: "西班牙", flag: "🇪🇸", aliases: ["西班牙", "ES", "ESP", "Spain", "Madrid", "Barcelona", "马德里", "巴塞罗那"] },
  // 瑞士常见命名方式；不使用容易误判的 CH 两位缩写。
  { name: "瑞士", flag: "🇨🇭", aliases: ["瑞士", "CHE", "Switzerland", "Zurich", "Geneva", "苏黎世", "日内瓦"] },
  // 瑞典常见命名方式。
  { name: "瑞典", flag: "🇸🇪", aliases: ["瑞典", "SWE", "Sweden", "Stockholm", "斯德哥尔摩"] },
  // 挪威常见命名方式；不使用容易误判的 NO 两位缩写。
  { name: "挪威", flag: "🇳🇴", aliases: ["挪威", "NOR", "Norway", "Oslo", "奥斯陆"] },
  // 芬兰常见命名方式。
  { name: "芬兰", flag: "🇫🇮", aliases: ["芬兰", "FIN", "Finland", "Helsinki", "赫尔辛基"] },
  // 丹麦常见命名方式。
  { name: "丹麦", flag: "🇩🇰", aliases: ["丹麦", "DNK", "Denmark", "Copenhagen", "哥本哈根"] },
  // 葡萄牙常见命名方式；不使用容易和 PT 业务组混淆的 PT 两位缩写。
  { name: "葡萄牙", flag: "🇵🇹", aliases: ["葡萄牙", "PRT", "Portugal", "Lisbon", "里斯本"] },
  // 爱尔兰常见命名方式；不使用容易误判的 IE 两位缩写。
  { name: "爱尔兰", flag: "🇮🇪", aliases: ["爱尔兰", "IRL", "Ireland", "Dublin", "都柏林"] },
  // 比利时常见命名方式。
  { name: "比利时", flag: "🇧🇪", aliases: ["比利时", "BEL", "Belgium", "Brussels", "布鲁塞尔"] },
  // 奥地利常见命名方式。
  { name: "奥地利", flag: "🇦🇹", aliases: ["奥地利", "AUT", "Austria", "Vienna", "维也纳"] },
  // 波兰常见命名方式。
  { name: "波兰", flag: "🇵🇱", aliases: ["波兰", "POL", "Poland", "Warsaw", "华沙"] },
  // 卢森堡常见命名方式。
  { name: "卢森堡", flag: "🇱🇺", aliases: ["卢森堡", "LUX", "Luxembourg", "Luxemburg", "卢森堡市"] },
  // 爱沙尼亚常见命名方式。
  { name: "爱沙尼亚", flag: "🇪🇪", aliases: ["爱沙尼亚", "EST", "Estonia", "Tallinn", "塔林"] },
  // 拉脱维亚常见命名方式。
  { name: "拉脱维亚", flag: "🇱🇻", aliases: ["拉脱维亚", "LVA", "Latvia", "Riga", "里加"] },
  // 立陶宛常见命名方式；不使用容易误判的 LT 两位缩写。
  { name: "立陶宛", flag: "🇱🇹", aliases: ["立陶宛", "LTU", "Lithuania", "Vilnius", "维尔纽斯"] },
  // 保加利亚常见命名方式；不使用容易误判的 BG 两位缩写。
  { name: "保加利亚", flag: "🇧🇬", aliases: ["保加利亚", "BGR", "Bulgaria", "Sofia", "索菲亚"] },
  // 克罗地亚常见命名方式。
  { name: "克罗地亚", flag: "🇭🇷", aliases: ["克罗地亚", "HRV", "Croatia", "Zagreb", "萨格勒布"] },
  // 斯洛伐克常见命名方式。
  { name: "斯洛伐克", flag: "🇸🇰", aliases: ["斯洛伐克", "SVK", "Slovakia", "Bratislava", "布拉迪斯拉发"] },
  // 斯洛文尼亚常见命名方式。
  { name: "斯洛文尼亚", flag: "🇸🇮", aliases: ["斯洛文尼亚", "SVN", "Slovenia", "Ljubljana", "卢布尔雅那"] },
  // 捷克常见命名方式。
  { name: "捷克", flag: "🇨🇿", aliases: ["捷克", "CZ", "CZE", "Czech", "Czech Republic", "Czechia", "Prague", "布拉格"] },
  // 匈牙利常见命名方式。
  { name: "匈牙利", flag: "🇭🇺", aliases: ["匈牙利", "HU", "HUN", "Hungary", "Budapest", "布达佩斯"] },
  // 罗马尼亚常见命名方式；优先使用中文名、三位缩写与城市名，减少 RO 误判。
  { name: "罗马尼亚", flag: "🇷🇴", aliases: ["罗马尼亚", "ROU", "Romania", "Bucharest", "布加勒斯特"] },
  // 希腊常见命名方式。
  { name: "希腊", flag: "🇬🇷", aliases: ["希腊", "GR", "GRC", "Greece", "Athens", "雅典"] },
  // 乌克兰常见命名方式。
  { name: "乌克兰", flag: "🇺🇦", aliases: ["乌克兰", "UA", "UKR", "Ukraine", "Kyiv", "Kiev", "基辅"] },
  // 冰岛常见命名方式；不使用容易误判的 IS 两位缩写。
  { name: "冰岛", flag: "🇮🇸", aliases: ["冰岛", "ISL", "Iceland", "Reykjavik", "雷克雅未克"] },
  // 塞尔维亚常见命名方式；优先使用中文名、三位缩写与首都，减少 RS 误判。
  { name: "塞尔维亚", flag: "🇷🇸", aliases: ["塞尔维亚", "SRB", "Serbia", "Belgrade", "贝尔格莱德"] },
  // 摩尔多瓦常见命名方式；优先使用三位缩写，避免 MD 与普通文本冲突。
  { name: "摩尔多瓦", flag: "🇲🇩", aliases: ["摩尔多瓦", "MDA", "Moldova", "Chisinau", "Chișinău", "基希讷乌"] },
  // 塞浦路斯常见命名方式；优先使用三位缩写，避免 CY 误判。
  { name: "塞浦路斯", flag: "🇨🇾", aliases: ["塞浦路斯", "CYP", "Cyprus", "Nicosia", "尼科西亚"] },

  // 土耳其常见命名方式。
  { name: "土耳其", flag: "🇹🇷", aliases: ["土耳其", "TR", "TUR", "Turkey", "Istanbul", "伊斯坦布尔"] },
  // 印度常见命名方式；不使用容易误判的 IN 两位缩写。
  { name: "印度", flag: "🇮🇳", aliases: ["印度", "IND", "India", "Mumbai", "Bombay", "Delhi", "Chennai", "Bangalore", "孟买", "德里", "金奈", "班加罗尔"] },
  // 巴基斯坦常见命名方式；优先使用中文名、三位缩写与主要城市，减少 PK 误判。
  { name: "巴基斯坦", flag: "🇵🇰", aliases: ["巴基斯坦", "PAK", "Pakistan", "Karachi", "Islamabad", "Lahore", "卡拉奇", "伊斯兰堡", "拉合尔"] },
  // 孟加拉常见命名方式；显示名沿用简短中文风格。
  { name: "孟加拉", flag: "🇧🇩", aliases: ["孟加拉", "孟加拉国", "BGD", "Bangladesh", "Dhaka", "达卡"] },
  // 尼泊尔常见命名方式；优先使用中文名、三位缩写与首都，减少 NP 误判。
  { name: "尼泊尔", flag: "🇳🇵", aliases: ["尼泊尔", "NPL", "Nepal", "Kathmandu", "加德满都"] },
  // 斯里兰卡常见命名方式；优先使用中文名、三位缩写与首都/商业城市。
  { name: "斯里兰卡", flag: "🇱🇰", aliases: ["斯里兰卡", "LKA", "Sri Lanka", "Colombo", "科伦坡"] },
  // 哈萨克斯坦常见命名方式；KZ 在节点命名里较常见，这里保留两位缩写兼容。
  { name: "哈萨克", flag: "🇰🇿", aliases: ["哈萨克", "哈萨克斯坦", "KZ", "KAZ", "Kazakhstan", "Almaty", "Astana", "阿拉木图", "阿斯塔纳"] },
  // 乌兹别克斯坦常见命名方式；优先使用中文名、三位缩写与首都，减少 UZ 误判。
  { name: "乌兹别克", flag: "🇺🇿", aliases: ["乌兹别克", "乌兹别克斯坦", "UZB", "Uzbekistan", "Tashkent", "塔什干"] },
  // 吉尔吉斯斯坦常见命名方式；显示名沿用简短中文风格。
  { name: "吉尔吉斯", flag: "🇰🇬", aliases: ["吉尔吉斯", "吉尔吉斯斯坦", "KGZ", "Kyrgyzstan", "Bishkek", "比什凯克"] },
  // 马来西亚常见命名方式，这里沿用“大马”作为显示名称；不使用容易误判的 MY 两位缩写。
  { name: "大马", flag: "🇲🇾", aliases: ["马来西亚", "大马", "MYS", "Malaysia", "Kuala Lumpur", "Penang", "Johor", "吉隆坡", "槟城", "柔佛"] },
  // 泰国常见命名方式。
  { name: "泰国", flag: "🇹🇭", aliases: ["泰国", "TH", "THA", "Thailand", "Bangkok", "曼谷"] },
  // 越南常见命名方式。
  { name: "越南", flag: "🇻🇳", aliases: ["越南", "VN", "VNM", "Vietnam", "Hanoi", "Ho Chi Minh", "HCM", "河内", "胡志明"] },
  // 菲律宾常见命名方式。
  { name: "菲律宾", flag: "🇵🇭", aliases: ["菲律宾", "PH", "PHL", "Philippines", "Manila", "马尼拉"] },
  // 印度尼西亚常见命名方式，这里用“印尼”作为显示名称。
  { name: "印尼", flag: "🇮🇩", aliases: ["印尼", "印度尼西亚", "ID", "IDN", "Indonesia", "Jakarta", "Surabaya", "雅加达", "泗水"] },
  // 柬埔寨常见命名方式；优先使用中文名、三位缩写与首都别名。
  { name: "柬埔寨", flag: "🇰🇭", aliases: ["柬埔寨", "KHM", "Cambodia", "Phnom Penh", "金边"] },
  // 文莱常见命名方式；在东南亚节点里偶尔出现，这里补上。
  { name: "文莱", flag: "🇧🇳", aliases: ["文莱", "BRN", "Brunei", "Bandar Seri Begawan", "斯里巴加湾"] },
  // 阿联酋常见命名方式。
  { name: "阿联酋", flag: "🇦🇪", aliases: ["阿联酋", "UAE", "AE", "ARE", "United Arab Emirates", "Dubai", "Abu Dhabi", "迪拜", "阿布扎比"] },
  // 卡塔尔常见命名方式。
  { name: "卡塔尔", flag: "🇶🇦", aliases: ["卡塔尔", "QAT", "Qatar", "Doha", "多哈"] },
  // 科威特常见命名方式。
  { name: "科威特", flag: "🇰🇼", aliases: ["科威特", "KWT", "Kuwait", "Kuwait City", "科威特城"] },
  // 沙特常见命名方式。
  { name: "沙特", flag: "🇸🇦", aliases: ["沙特", "沙特阿拉伯", "SA", "SAU", "Saudi Arabia", "Riyadh", "Jeddah", "利雅得", "吉达"] },
  // 亚美尼亚常见命名方式；优先使用中文名、三位缩写与首都，减少 AM 误判。
  { name: "亚美尼亚", flag: "🇦🇲", aliases: ["亚美尼亚", "ARM", "Armenia", "Yerevan", "埃里温"] },
  // 格鲁吉亚常见命名方式；优先使用中文名、三位缩写与首都，减少 GE 误判。
  { name: "格鲁吉亚", flag: "🇬🇪", aliases: ["格鲁吉亚", "GEO", "Georgia", "Tbilisi", "第比利斯"] },
  // 阿塞拜疆常见命名方式；优先使用中文名、三位缩写与首都，减少 AZ 误判。
  { name: "阿塞拜疆", flag: "🇦🇿", aliases: ["阿塞拜疆", "AZE", "Azerbaijan", "Baku", "巴库"] },
  // 埃及常见命名方式；优先使用中文名、三位缩写与城市名，减少 EG 误判。
  { name: "埃及", flag: "🇪🇬", aliases: ["埃及", "EGY", "Egypt", "Cairo", "开罗"] },
  // 墨西哥常见命名方式。
  { name: "墨西哥", flag: "🇲🇽", aliases: ["墨西哥", "MX", "MEX", "Mexico", "Mexico City", "墨西哥城"] },
  // 智利常见命名方式；不使用容易误判的 CL 两位缩写。
  { name: "智利", flag: "🇨🇱", aliases: ["智利", "CHL", "Chile", "Santiago", "圣地亚哥"] },
  // 哥伦比亚常见命名方式；优先使用中文名、三位缩写与城市名，减少 CO 误判。
  { name: "哥伦比亚", flag: "🇨🇴", aliases: ["哥伦比亚", "COL", "Colombia", "Bogota", "Bogotá", "波哥大"] },
  // 秘鲁常见命名方式；优先使用中文名、三位缩写与城市名，减少 PE 误判。
  { name: "秘鲁", flag: "🇵🇪", aliases: ["秘鲁", "PER", "Peru", "Lima", "利马"] },
  // 乌拉圭常见命名方式；优先使用中文名、三位缩写与首都，减少 UY 误判。
  { name: "乌拉圭", flag: "🇺🇾", aliases: ["乌拉圭", "URY", "Uruguay", "Montevideo", "蒙得维的亚"] },
  // 南非常见命名方式。
  { name: "南非", flag: "🇿🇦", aliases: ["南非", "ZAF", "South Africa", "Johannesburg", "Cape Town", "约翰内斯堡", "开普敦"] },
  // 尼日利亚常见命名方式；补充拉各斯 / 阿布贾这类常见机房城市。
  { name: "尼日利亚", flag: "🇳🇬", aliases: ["尼日利亚", "NGA", "Nigeria", "Lagos", "Abuja", "拉各斯", "阿布贾"] },
  // 摩洛哥常见命名方式。
  { name: "摩洛哥", flag: "🇲🇦", aliases: ["摩洛哥", "MAR", "Morocco", "Casablanca", "Rabat", "卡萨布兰卡", "拉巴特"] },
  // 阿尔及利亚常见命名方式；优先使用中文名、三位缩写与首都，减少 DZ 误判。
  { name: "阿尔及利亚", flag: "🇩🇿", aliases: ["阿尔及利亚", "DZA", "Algeria", "Algiers", "阿尔及尔"] },
  // 突尼斯常见命名方式；优先使用中文名、三位缩写与首都，减少 TN 误判。
  { name: "突尼斯", flag: "🇹🇳", aliases: ["突尼斯", "TUN", "Tunisia", "Tunis", "突尼斯市"] },
  // 肯尼亚常见命名方式。
  { name: "肯尼亚", flag: "🇰🇪", aliases: ["肯尼亚", "KEN", "Kenya", "Nairobi", "内罗毕"] },
  // 以色列常见命名方式；不使用容易误判的 IL 两位缩写。
  { name: "以色列", flag: "🇮🇱", aliases: ["以色列", "ISR", "Israel", "Tel Aviv", "Jerusalem", "特拉维夫", "耶路撒冷"] },
  // 新西兰常见命名方式。
  { name: "新西兰", flag: "🇳🇿", aliases: ["新西兰", "NZ", "NZL", "New Zealand", "Auckland", "奥克兰"] },
  // 澳大利亚常见命名方式，这里用“袋鼠”作为显示名称。
  { name: "袋鼠", flag: "🇦🇺", aliases: ["澳大利亚", "澳洲", "袋鼠", "AU", "AUS", "Australia", "Sydney", "Melbourne", "悉尼", "墨尔本"] },
  // 俄罗斯常见命名方式，这里用“毛熊”作为显示名称。
  { name: "毛熊", flag: "🇷🇺", aliases: ["俄罗斯", "毛熊", "RU", "RUS", "Russia", "Moscow", "莫斯科"] }
];

// 区域分组定义：参考 GitHub 社区常见的“按亚洲/欧洲/美洲聚合国家组”玩法，但仅在用户显式开启 region-groups 时生成。
const REGION_GROUP_DEFINITIONS = Object.freeze([
  {
    key: "asia",
    name: "🌏 亚洲节点",
    aliases: ["asia", "asian", "as", "apac", "亚洲区", "亚洲"],
    countryKeys: ["香港", "澳门", "台湾", "日本", "狮城", "韩国", "印度", "巴基斯坦", "孟加拉", "尼泊尔", "斯里兰卡", "哈萨克", "乌兹别克", "吉尔吉斯", "大马", "泰国", "越南", "菲律宾", "印尼", "柬埔寨", "文莱", "亚美尼亚", "格鲁吉亚", "阿塞拜疆"]
  },
  {
    key: "eastasia",
    name: "🌸 东亚节点",
    aliases: ["eastasia", "east-asia", "northeastasia", "northeast-asia", "ea", "东亚"],
    includeInAuto: false,
    countryKeys: ["香港", "澳门", "台湾", "日本", "韩国"]
  },
  {
    key: "southeastasia",
    name: "🌴 东南亚节点",
    aliases: ["southeastasia", "south-east-asia", "sea", "seasia", "东南亚"],
    includeInAuto: false,
    countryKeys: ["狮城", "大马", "泰国", "越南", "菲律宾", "印尼", "柬埔寨", "文莱"]
  },
  {
    key: "southasia",
    name: "🕌 南亚节点",
    aliases: ["southasia", "south-asia", "saasia", "南亚"],
    includeInAuto: false,
    countryKeys: ["印度", "巴基斯坦", "孟加拉", "尼泊尔", "斯里兰卡"]
  },
  {
    key: "centralasia",
    name: "🐎 中亚节点",
    aliases: ["centralasia", "central-asia", "middleasia", "middle-asia", "中亚"],
    includeInAuto: false,
    countryKeys: ["哈萨克", "乌兹别克", "吉尔吉斯"]
  },
  {
    key: "caucasus",
    name: "⛰️ 高加索节点",
    aliases: ["caucasus", "caucasia", "highcaucasus", "高加索"],
    includeInAuto: false,
    countryKeys: ["亚美尼亚", "格鲁吉亚", "阿塞拜疆"]
  },
  {
    key: "europe",
    name: "🌍 欧洲节点",
    aliases: ["europe", "eu", "eur", "欧洲"],
    countryKeys: ["英国", "德国", "法国", "荷兰", "意大利", "西班牙", "瑞士", "瑞典", "挪威", "芬兰", "丹麦", "葡萄牙", "爱尔兰", "比利时", "奥地利", "波兰", "卢森堡", "爱沙尼亚", "拉脱维亚", "立陶宛", "保加利亚", "克罗地亚", "斯洛伐克", "斯洛文尼亚", "捷克", "匈牙利", "罗马尼亚", "希腊", "乌克兰", "冰岛", "塞尔维亚", "摩尔多瓦", "塞浦路斯", "毛熊"]
  },
  {
    key: "northeurope",
    name: "❄️ 北欧节点",
    aliases: ["northeurope", "north-europe", "nordic", "nordics", "北欧"],
    includeInAuto: false,
    countryKeys: ["英国", "爱尔兰", "冰岛", "瑞典", "挪威", "芬兰", "丹麦"]
  },
  {
    key: "centraleurope",
    name: "🏰 中欧节点",
    aliases: ["centraleurope", "central-europe", "mid-europe", "中欧"],
    includeInAuto: false,
    countryKeys: ["德国", "荷兰", "比利时", "卢森堡", "奥地利", "瑞士", "波兰", "捷克", "斯洛伐克", "匈牙利"]
  },
  {
    key: "americas",
    name: "🌎 美洲节点",
    aliases: ["americas", "america", "amer", "美洲"],
    countryKeys: ["美国", "枫叶", "墨西哥", "阿根廷", "巴西", "智利", "哥伦比亚", "秘鲁", "乌拉圭"]
  },
  {
    key: "northamerica",
    name: "🗽 北美节点",
    aliases: ["northamerica", "north-america", "naonly", "北美"],
    includeInAuto: false,
    countryKeys: ["美国", "枫叶", "墨西哥"]
  },
  {
    key: "southamerica",
    name: "💃 南美节点",
    aliases: ["southamerica", "south-america", "saonly", "南美"],
    includeInAuto: false,
    countryKeys: ["阿根廷", "巴西", "智利", "哥伦比亚", "秘鲁", "乌拉圭"]
  },
  {
    key: "middleeast",
    name: "🕌 中东节点",
    aliases: ["middleeast", "middle-east", "me", "中东"],
    countryKeys: ["阿联酋", "沙特", "以色列", "卡塔尔", "科威特", "土耳其"]
  },
  {
    key: "gulf",
    name: "🛢️ 海湾节点",
    aliases: ["gulf", "gcc", "gulfstates", "gulf-states", "海湾"],
    includeInAuto: false,
    countryKeys: ["阿联酋", "沙特", "卡塔尔", "科威特"]
  },
  {
    key: "oceania",
    name: "🦘 大洋洲节点",
    aliases: ["oceania", "oceana", "oce", "pacific", "大洋洲"],
    countryKeys: ["袋鼠", "新西兰"]
  },
  {
    key: "africa",
    name: "🌍 非洲节点",
    aliases: ["africa", "af", "非洲"],
    countryKeys: ["南非", "埃及", "尼日利亚", "摩洛哥", "阿尔及利亚", "突尼斯", "肯尼亚"]
  }
]);

// 判断对象自身是否真的拥有某个键，避免原型链上的同名属性干扰。
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

// 判断某个值是不是普通对象，排除 null 和数组。
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// 对字符串数组做清洗：去空、去首尾空格、去重。
function uniqueStrings(list) {
  // 用无原型对象作为去重表，避免键名冲突。
  const seen = Object.create(null);
  // 收集最终清洗后的结果。
  const result = [];

  // 逐个遍历输入数组里的元素。
  for (const item of Array.isArray(list) ? list : []) {
    // 只保留字符串值，其他类型全部跳过。
    if (typeof item !== "string") {
      continue;
    }

    // 统一去掉首尾空格，避免“同名不同空格”导致去重失败。
    const value = item.trim();
    // 如果是空串或已经出现过，则不再收录。
    if (!value || seen[value]) {
      continue;
    }

    // 标记当前字符串已出现。
    seen[value] = true;
    // 写入最终结果数组。
    result.push(value);
  }

  // 返回清洗和去重后的字符串列表。
  return result;
}

// 对数字数组做清洗：转 number、过滤 NaN/Infinity、去重。
function uniqueNumbers(list) {
  // 用无原型对象记录已出现的数字。
  const seen = Object.create(null);
  // 收集最终结果。
  const result = [];

  // 逐个遍历输入项。
  for (const item of Array.isArray(list) ? list : []) {
    // 把传入值统一转成数字。
    const value = Number(item);
    // 非有限数字直接跳过。
    if (!isFinite(value)) {
      continue;
    }

    // 已出现的数字不重复加入。
    if (seen[value]) {
      continue;
    }

    // 标记为已出现。
    seen[value] = true;
    // 加入结果数组。
    result.push(value);
  }

  // 返回清洗后的数字列表。
  return result;
}

// 合并两个普通对象，extra 的同名键会覆盖 base。
function mergeObjects(base, extra) {
  return Object.assign({}, isObject(base) ? base : {}, isObject(extra) ? extra : {});
}

// 把输入值安全地转换成字符串数组，不是数组就返回空数组。
function toStringArray(value) {
  if (typeof value === "string") {
    return uniqueStrings([value]);
  }

  return uniqueStrings(Array.isArray(value) ? value : []);
}

// 规范化 DNS policy 映射，把 string/array 都收敛成字符串数组，便于后续合并。
function normalizeDnsPolicyMap(value) {
  const source = isObject(value) ? value : {};
  const result = {};

  for (const key of Object.keys(source)) {
    result[key] = toStringArray(source[key]);
  }

  return result;
}

// 合并两个 DNS policy 映射，同名键按“默认值 + 用户值”去重拼接。
function mergeDnsPolicyMaps(base, extra) {
  const normalizedBase = normalizeDnsPolicyMap(base);
  const normalizedExtra = normalizeDnsPolicyMap(extra);
  const result = {};
  const keys = uniqueStrings(Object.keys(normalizedBase).concat(Object.keys(normalizedExtra)));

  for (const key of keys) {
    result[key] = uniqueStrings([]
      .concat(normalizedBase[key] || [])
      .concat(normalizedExtra[key] || []));
  }

  return result;
}

// 把传统 fake-ip-filter 条目转换成 fake-ip-filter-mode=rule 可用的规则语法。
function convertFakeIpFilterEntryToRule(entry) {
  const value = String(entry || "").trim();

  if (!value) {
    return "";
  }

  if (/^(MATCH|GEOSITE|RULE-SET|DOMAIN|DOMAIN-SUFFIX|DOMAIN-KEYWORD),/i.test(value)) {
    return /(,fake-ip|,real-ip)$/i.test(value) ? value : `${value},real-ip`;
  }

  if (/^geosite:/i.test(value)) {
    return `GEOSITE,${value.slice(8)},real-ip`;
  }

  if (/^\+\./.test(value) || /^\*\./.test(value)) {
    return `DOMAIN-SUFFIX,${value.slice(2)},real-ip`;
  }

  if (/^\./.test(value)) {
    return `DOMAIN-SUFFIX,${value.slice(1)},real-ip`;
  }

  return `DOMAIN,${value},real-ip`;
}

// 根据 fake-ip-filter-mode 构建最终 fake-ip-filter，并在 rule 模式下自动补齐规则语法。
function buildFakeIpFilter(defaultEntries, customEntries, mode) {
  const entries = uniqueStrings([]
    .concat(Array.isArray(defaultEntries) ? defaultEntries : [])
    .concat(toStringArray(customEntries)));

  if (String(mode || "").trim().toLowerCase() !== "rule") {
    return entries;
  }

  const rules = uniqueStrings(entries.map((item) => convertFakeIpFilterEntryToRule(item)).filter(Boolean));

  if (!rules.some((item) => /^MATCH,\s*fake-ip$/i.test(item))) {
    rules.push("MATCH,fake-ip");
  }

  return rules;
}

// 创建一个“存在性查找表”，便于后面 O(1) 判断某个名字是否存在。
function createLookup(list) {
  // 用无原型对象避免原型链污染。
  const lookup = Object.create(null);
  // 遍历并登记所有非空字符串。
  for (const item of uniqueStrings(list)) {
    lookup[item] = true;
  }
  // 返回查找表。
  return lookup;
}

// 从参数对象里按别名顺序取值，拿到第一个非空值就返回。
function pickArg(args, aliases) {
  // 非对象时直接返回 undefined。
  if (!isObject(args)) {
    return undefined;
  }

  // 按优先顺序遍历允许的参数名。
  for (const alias of aliases) {
    // 只有对象自身存在这个键时才继续读取。
    if (hasOwn(args, alias)) {
      // 取出当前参数值。
      const value = args[alias];
      // 过滤掉 undefined / null / 空串，避免把“没传”误当成有效值。
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
  }

  return undefined;
}

// 把各种布尔风格输入转成真正的 boolean。
function parseBool(value, defaultValue) {
  // 已经是布尔值则原样返回。
  if (typeof value === "boolean") {
    return value;
  }

  // 数字时按 0 / 非 0 处理。
  if (typeof value === "number") {
    return value !== 0;
  }

  // 字符串时兼容常见的真值/假值写法。
  if (typeof value === "string") {
    // 先做 trim + 小写归一化。
    const normalized = value.trim().toLowerCase();

    // 常见真值集合。
    if (["true", "1", "yes", "y", "on"].includes(normalized)) {
      return true;
    }

    // 常见假值集合。
    if (["false", "0", "no", "n", "off"].includes(normalized)) {
      return false;
    }
  }

  // 无法识别时回落到默认值。
  return defaultValue;
}

// 判断一个值是否至少长得像布尔量，便于对配置对象做宽松校验。
function isBooleanLike(value) {
  if (typeof value === "boolean") {
    return true;
  }

  if (typeof value === "number") {
    return value === 0 || value === 1;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes", "y", "on", "false", "0", "no", "n", "off"].includes(value.trim().toLowerCase());
  }

  return false;
}

// 把输入值转成整数，失败时返回默认值。
function parseNumber(value, defaultValue) {
  // 已经是正常数字时直接向下取整。
  if (typeof value === "number" && isFinite(value)) {
    return Math.floor(value);
  }

  // 字符串时尝试转数字。
  if (typeof value === "string") {
    // 先去掉首尾空格。
    const normalized = value.trim();
    // 空串直接回退默认值。
    if (!normalized) {
      return defaultValue;
    }

    // 用 Number 做更宽松的数字解析。
    const numeric = Number(normalized);
    // 转换成功就向下取整，失败则回退默认值。
    return isFinite(numeric) ? Math.floor(numeric) : defaultValue;
  }

  // 其他类型一律使用默认值。
  return defaultValue;
}

// 把一个数字限制在给定上下界之间。
function clampNumber(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(maxValue, value));
}

// 统一把字符串参数做 trim；非字符串一律转为空串。
function normalizeStringArg(value) {
  return typeof value === "string" ? value.trim() : "";
}

// 规范化可选目录参数：统一斜杠、去尾部 `/`，并尽量转成相对路径写法。
function normalizeOptionalPathDir(value) {
  const source = normalizeStringArg(value).replace(/\\/g, "/");

  if (!source) {
    return "";
  }

  let normalized = source.replace(/\/+/g, "/").replace(/\/+$/g, "");

  if (!normalized || normalized === ".") {
    return "";
  }

  if (!/^(?:\.{1,2}\/|\/|[A-Za-z]:\/)/.test(normalized)) {
    normalized = `./${normalized}`;
  }

  return normalized;
}

// 规范化 rule-provider 本地缓存目录：如果未设置则回退脚本默认目录。
function normalizeRuleProviderPathDir(value) {
  return normalizeOptionalPathDir(value) || RULE_PROVIDER_PATH_DIR;
}

// 规范化 proxy-provider 本地缓存目录：只有显式传值时才启用，避免改动现有默认行为。
function normalizeProxyProviderPathDir(value) {
  return normalizeOptionalPathDir(value);
}

// 规范化 Mihomo expected-status 参数：兼容字符串与数字输入，便于后续统一按官方语法校验。
function normalizeExpectedStatusArg(value) {
  if (typeof value === "number" && isFinite(value)) {
    return String(Math.floor(value));
  }

  return normalizeStringArg(value);
}

// 规范化 Mihomo proxy-group 的 interface-name：只接受非空字符串，空值统一视为未设置。
function normalizeInterfaceNameArg(value) {
  return normalizeStringArg(value);
}

// 规范化 Mihomo proxy-group 的 routing-mark：兼容数字与纯数字字符串，只接受大于等于 0 的整数。
function normalizeRoutingMarkArg(value) {
  if (typeof value === "number" && isFinite(value) && Math.floor(value) === value && value >= 0) {
    return value;
  }

  const normalized = normalizeStringArg(value);

  if (!normalized) {
    return null;
  }

  return /^\d+$/.test(normalized) ? Number(normalized) : null;
}

// 校验 Mihomo expected-status 语法：支持 `*`、单个状态码，以及 `200/302/400-503` 这类多状态/范围写法。
function isValidExpectedStatusValue(value) {
  const normalized = normalizeExpectedStatusArg(value);

  if (!normalized) {
    return false;
  }

  if (normalized === "*") {
    return true;
  }

  for (const part of normalized.split("/")) {
    const token = String(part || "").trim();
    if (!token) {
      return false;
    }

    if (/^\d{3}$/.test(token)) {
      continue;
    }

    const rangeMatch = token.match(/^(\d{3})-(\d{3})$/);
    if (!rangeMatch) {
      return false;
    }

    const start = Number(rangeMatch[1]);
    const end = Number(rangeMatch[2]);
    if (!isFinite(start) || !isFinite(end) || start > end) {
      return false;
    }
  }

  return true;
}

// 规范化 GitHub / Steam 这类独立组的模式参数。
function normalizeServiceGroupMode(value, defaultMode) {
  const normalized = normalizeStringArg(value).toLowerCase();

  if (["select", "direct", "proxy"].includes(normalized)) {
    return normalized;
  }

  return defaultMode;
}

// 规范化 GitHub / Steam 这类独立组的策略组类型参数。
function normalizeServiceGroupType(value, defaultType) {
  const normalized = normalizeStringArg(value).toLowerCase();

  if (["select", "url-test", "fallback", "load-balance"].includes(normalized)) {
    return normalized;
  }

  return defaultType;
}

// 规范化 Mihomo load-balance 的 strategy 参数，兼容常见连字符/空格/驼峰写法。
function normalizeLoadBalanceStrategy(value, defaultStrategy) {
  const normalized = normalizeGroupMarkerToken(value);
  const aliasMap = {
    roundrobin: "round-robin",
    consistenthashing: "consistent-hashing",
    sticky: "sticky-sessions",
    stickysession: "sticky-sessions",
    stickysessions: "sticky-sessions"
  };

  return aliasMap[normalized] || defaultStrategy;
}

// 规范化 Mihomo `ip-version` 参数，兼容常见连字符/空格写法。
function normalizeIpVersionArg(value, defaultValue) {
  const normalized = normalizeGroupMarkerToken(value);
  const aliasMap = {
    dual: "dual",
    ipv4: "ipv4",
    ipv6: "ipv6",
    ipv4prefer: "ipv4-prefer",
    ipv6prefer: "ipv6-prefer",
    preferipv4: "ipv4-prefer",
    preferipv6: "ipv6-prefer"
  };

  return aliasMap[normalized] || defaultValue;
}

// 规范化 GitHub / Steam / SteamCN 规则顺序参数，只允许 before / after 两种写法。
function normalizeRuleOrderPosition(value, defaultPosition) {
  const normalized = normalizeStringArg(value).toLowerCase();

  if (["before", "after"].includes(normalized)) {
    return normalized;
  }

  return defaultPosition;
}

// 规范化策略组布局预设名称，兼容常见 first / preset / layout 写法。
function normalizeGroupOrderPreset(value, defaultPreset) {
  const normalized = normalizeGroupMarkerToken(value);
  const aliasMap = {
    default: defaultPreset,
    script: defaultPreset,
    balanced: "balanced",
    core: "core",
    corefirst: "core",
    main: "core",
    mainfirst: "core",
    service: "service",
    services: "service",
    servicefirst: "service",
    business: "service",
    businessfirst: "service",
    media: "media",
    mediafirst: "media",
    streaming: "media",
    streamingfirst: "media",
    region: "region",
    regions: "region",
    regionfirst: "region",
    country: "region",
    countries: "region",
    countryfirst: "region"
  };

  return aliasMap[normalized] || defaultPreset;
}

// 规范化国家组 / 区域组排序模式，便于把定义顺序、数量优先、名称优先这些玩法收敛成固定枚举。
function normalizeGeoGroupSortMode(value, defaultMode) {
  const normalized = normalizeGroupMarkerToken(value);
  return GEO_GROUP_SORT_MODE_ALIAS_MAP[normalized] || defaultMode;
}

// 判断国家组 / 区域组排序参数是否为允许值，避免 country / region 两套校验列表长期分叉。
function isValidGeoGroupSortMode(value) {
  return GEO_GROUP_SORT_MODE_TOKENS.includes(normalizeGroupMarkerToken(value));
}

// 规范化社区规则源预设名称；默认继续使用 MetaCubeX 内置 geosite/geoip 规则。
function normalizeRuleSourcePreset(value, defaultPreset) {
  const normalized = normalizeGroupMarkerToken(value);
  const aliasMap = {
    default: defaultPreset,
    meta: "meta",
    metacubex: "meta",
    official: "meta",
    builtin: "meta",
    blackmatrix7: "blackmatrix7",
    blackmatrix: "blackmatrix7",
    bm7: "blackmatrix7",
    iosrulescript: "blackmatrix7"
  };

  return aliasMap[normalized] || defaultPreset;
}

// 判断某个 provider 类型是不是 Mihomo proxy-provider 官方支持的范围。
function isOfficialProxyProviderType(value) {
  return ["http", "file", "inline"].includes(normalizeStringArg(value).toLowerCase());
}

// 判断某个 provider 类型是不是 Mihomo rule-provider 官方支持的范围。
function isOfficialRuleProviderType(value) {
  return ["http", "file", "inline"].includes(normalizeStringArg(value).toLowerCase());
}

// 判断某个 rule-provider behavior 是否在 Mihomo 官方支持范围内。
function isOfficialRuleProviderBehavior(value) {
  return ["domain", "ipcidr", "classical"].includes(normalizeStringArg(value).toLowerCase());
}

// 判断某个 rule-provider format 是否在 Mihomo 官方支持范围内。
function isOfficialRuleProviderFormat(value) {
  return ["yaml", "text", "mrs"].includes(normalizeStringArg(value).toLowerCase());
}

// 判断 provider path 是否看起来可能超出 HomeDir，便于提示 SAFE_PATHS 官方限制。
function mayRequireProviderSafePaths(path) {
  const normalized = normalizeStringArg(path).replace(/\\/g, "/");

  if (!normalized) {
    return false;
  }

  return /^(?:\/|[A-Za-z]:\/)/.test(normalized) || normalized === ".." || normalized.startsWith("../") || normalized.includes("/../");
}

// 把自定义响应头名片段清洗成更安全的 HTTP Header Token。
function normalizeHeaderToken(value) {
  return normalizeStringArg(value).replace(/[^A-Za-z0-9-]/g, "").replace(/^-+|-+$/g, "");
}

// 校验 HTTP Header 名称是否合法；这里按常见 `A-Za-z0-9-` 写法收口，避免生成奇怪请求头。
function isValidRequestHeaderName(value) {
  return /^[A-Za-z0-9-]+$/.test(normalizeStringArg(value));
}

// 规范化响应头前缀，确保最终总是以连字符结尾，便于后续统一拼接。
function normalizeHeaderPrefix(value) {
  const token = normalizeHeaderToken(value);
  return `${token || "X-SubStore"}-`;
}

// 把调试信息安全写回 Sub-Store 官方 `_res.headers`，便于下载链路里直接观测。
function setRuntimeResponseHeaders(rawOptions, headers) {
  if (!isObject(rawOptions)) {
    return false;
  }

  const response = isObject(rawOptions._res) ? rawOptions._res : {};
  const resultHeaders = isObject(response.headers) ? Object.assign({}, response.headers) : {};

  for (const key of Object.keys(isObject(headers) ? headers : {})) {
    const headerName = normalizeHeaderToken(key);
    const headerValue = headers[key];

    if (!headerName || headerValue === undefined || headerValue === null || headerValue === "") {
      continue;
    }

    resultHeaders[headerName] = String(headerValue);
  }

  response.headers = resultHeaders;
  rawOptions._res = response;
  return true;
}

// 粗略判断一个字符串是否像 CIDR 网段，主要用于给参数输错时做提醒。
function looksLikeCidr(value) {
  const normalized = normalizeStringArg(value);

  if (!normalized || normalized.indexOf("/") === -1) {
    return false;
  }

  if (normalized.indexOf(":") !== -1) {
    return /^[0-9a-f:.]+\/\d{1,3}$/i.test(normalized);
  }

  return /^\d{1,3}(?:\.\d{1,3}){3}\/\d{1,2}$/.test(normalized);
}

// 粗略判断一个字符串是否像 http(s) URL，用于远程规则源参数轻量校验。
function looksLikeHttpUrl(value) {
  return /^https?:\/\/\S+$/i.test(normalizeStringArg(value));
}

// 把“逗号分隔字符串 / 数组”统一转成字符串列表，便于做国家优先链参数化。
function toStringList(value) {
  // 字符串时兼容逗号、竖线、换行分隔。
  if (typeof value === "string") {
    return uniqueStrings(value.split(/[,|\n]/).map((item) => String(item || "").trim()));
  }

  // 数组时把每一项都转成字符串再去重。
  if (Array.isArray(value)) {
    return uniqueStrings(value.map((item) => String(item || "").trim()));
  }

  // 其他类型一律回空数组。
  return [];
}

// 把“明确节点名列表”统一转成数组；这里只支持逗号 / 分号 / 换行分隔，避免把节点名里的 `|` 误切开。
function toExplicitNameList(value) {
  if (typeof value === "string") {
    return uniqueStrings(value.split(/[,，;\n]/).map((item) => String(item || "").trim()));
  }

  if (Array.isArray(value)) {
    return uniqueStrings(value.map((item) => String(item || "").trim()));
  }

  return [];
}

// 解析“国家: 别名1|别名2”的自定义国家别名参数，便于在不改脚本源码时继续扩展节点命名兼容。
function parseCountryExtraAliasEntries(value) {
  const result = {
    map: Object.create(null),
    invalidEntries: [],
    unknownCountryMarkers: []
  };
  const rawEntries = [];

  if (typeof value === "string") {
    rawEntries.push(...value.split(/(?:\r?\n|;|；|\|\|)+/));
  } else if (Array.isArray(value)) {
    rawEntries.push(...value.map((item) => String(item || "")));
  } else if (isObject(value)) {
    for (const key of Object.keys(value)) {
      const aliases = Array.isArray(value[key]) ? value[key].join("|") : String(value[key] || "");
      rawEntries.push(`${key}:${aliases}`);
    }
  }

  for (const entry of rawEntries) {
    const text = normalizeStringArg(entry);
    if (!text) {
      continue;
    }

    const match = text.match(/^([^:：=]+)\s*[:：=]\s*(.+)$/);
    if (!match) {
      result.invalidEntries.push(text);
      continue;
    }

    const countryMarker = normalizeStringArg(match[1]);
    const aliases = toStringList(match[2]);
    if (!countryMarker || !aliases.length) {
      result.invalidEntries.push(text);
      continue;
    }

    const definition = findCountryDefinitionByMarker(countryMarker);
    if (!definition) {
      result.unknownCountryMarkers.push(countryMarker);
      continue;
    }

    result.map[definition.name] = uniqueStrings((result.map[definition.name] || []).concat(aliases));
  }

  result.invalidEntries = uniqueStrings(result.invalidEntries);
  result.unknownCountryMarkers = uniqueStrings(result.unknownCountryMarkers);
  return result;
}

// 把 country-extra-aliases 的配置压成短摘要，便于 full 日志和响应调试头直接查看。
function formatCountryExtraAliasPreview(aliasMap, maxCountries, maxAliasesPerCountry, maxAliasLength) {
  const source = isObject(aliasMap) ? aliasMap : {};
  const countryNames = Object.keys(source);

  if (!countryNames.length) {
    return "none";
  }

  const countryLimit = Number.isFinite(maxCountries) && maxCountries > 0 ? Math.floor(maxCountries) : 4;
  const aliasLimit = Number.isFinite(maxAliasesPerCountry) && maxAliasesPerCountry > 0 ? Math.floor(maxAliasesPerCountry) : 2;
  const aliasNameLimit = Number.isFinite(maxAliasLength) && maxAliasLength > 4 ? Math.floor(maxAliasLength) : 18;
  const visibleCountries = countryNames.slice(0, countryLimit).map((countryName) => {
    const aliases = uniqueStrings(
      (Array.isArray(source[countryName]) ? source[countryName] : [])
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    );
    const visibleAliases = aliases
      .slice(0, aliasLimit)
      .map((alias) => (alias.length > aliasNameLimit ? `${alias.slice(0, aliasNameLimit - 3)}...` : alias));
    const remainingAliases = aliases.length - visibleAliases.length;
    return `${countryName}=${visibleAliases.join("/")}${remainingAliases > 0 ? `(+${remainingAliases})` : ""}`;
  });
  const remainingCountries = countryNames.length - visibleCountries.length;

  return `${visibleCountries.join(";")}${remainingCountries > 0 ? `(+${remainingCountries}国)` : ""}`;
}

// 把 country-extra-aliases 的冲突样本压成短摘要，避免日志里一长串刷屏。
function formatCountryExtraAliasConflictPreview(conflicts, maxItems, maxLength) {
  const source = uniqueStrings(
    (Array.isArray(conflicts) ? conflicts : [])
      .map((item) => String(item || "").trim())
      .filter(Boolean)
  );

  if (!source.length) {
    return "none";
  }

  const itemLimit = Number.isFinite(maxItems) && maxItems > 0 ? Math.floor(maxItems) : 4;
  const textLimit = Number.isFinite(maxLength) && maxLength > 6 ? Math.floor(maxLength) : 28;
  const visibleItems = source
    .slice(0, itemLimit)
    .map((item) => (item.length > textLimit ? `${item.slice(0, textLimit - 3)}...` : item));
  const remaining = source.length - visibleItems.length;

  return `${visibleItems.join(";")}${remaining > 0 ? `(+${remaining})` : ""}`;
}

// 把 Mihomo `exclude-type` 这类“类型列表”参数统一规范成 `A|B|C` 形式，兼容逗号 / 竖线 / 换行输入。
function normalizeTypeListArg(value) {
  return toStringList(value).join("|");
}

// 把 `exclude-type` 这类类型列表解析成小写数组，方便后面做大小写无关匹配。
function parseTypeList(value) {
  return uniqueStrings(toStringList(value).map((item) => String(item || "").trim().toLowerCase()).filter(Boolean));
}

// 解析 proxy-provider override.proxy-name 规则，支持 `pattern=>target||pattern2=>target2`、换行和对象数组三种输入。
function parseProxyNameOverrideRules(value) {
  const result = [];
  const seen = Object.create(null);
  const items = [];

  if (typeof value === "string") {
    items.push.apply(items, String(value || "").split(/\r?\n|\|\||;;/));
  } else if (Array.isArray(value)) {
    items.push.apply(items, value);
  } else if (isObject(value)) {
    items.push(value);
  }

  for (const item of items) {
    let pattern = "";
    let target = "";

    if (isObject(item)) {
      pattern = normalizeStringArg(item.pattern);
      target = normalizeStringArg(item.target);
    } else {
      const source = String(item || "").trim();
      const separatorIndex = source.indexOf("=>");
      if (separatorIndex === -1) {
        continue;
      }

      pattern = source.slice(0, separatorIndex).trim();
      target = source.slice(separatorIndex + 2).trim();
    }

    if (!pattern || !target) {
      continue;
    }

    const key = `${pattern}=>${target}`;
    if (seen[key]) {
      continue;
    }

    seen[key] = true;
    result.push({ pattern, target });
  }

  return result;
}

// 把用户传入的“策略组标记”做归一化，便于兼容 `manual-switch / Manual Switch / manual_switch` 这类写法。
function normalizeGroupMarkerToken(value) {
  return normalizeStringArg(value).toLowerCase().replace(/[\s_-]+/g, "");
}

// 规范化常见代理类型别名，兼容 Mihomo 文档里的展示名与配置里常见的短类型写法。
function getProxyTypeAliases(type) {
  const normalized = normalizeStringArg(type).toLowerCase();
  const aliasMap = {
    ss: ["ss", "shadowsocks"],
    shadowsocks: ["ss", "shadowsocks"],
    ssr: ["ssr", "shadowsocksr"],
    shadowsocksr: ["ssr", "shadowsocksr"],
    http: ["http"],
    https: ["https", "http"],
    socks: ["socks", "socks5"],
    socks5: ["socks", "socks5"],
    socks4: ["socks4"],
    vmess: ["vmess"],
    vless: ["vless"],
    trojan: ["trojan"],
    snell: ["snell"],
    ssh: ["ssh"],
    hysteria: ["hysteria", "hy", "hysteria1"],
    hysteria1: ["hysteria", "hy", "hysteria1"],
    hy: ["hysteria", "hy", "hysteria1"],
    hysteria2: ["hysteria2", "hy2"],
    hy2: ["hysteria2", "hy2"],
    tuic: ["tuic"],
    wireguard: ["wireguard", "wg"],
    wg: ["wireguard", "wg"],
    anytls: ["anytls"],
    mieru: ["mieru"],
    direct: ["direct"],
    relay: ["relay"]
  };

  return aliasMap[normalized] || (normalized ? [normalized] : []);
}

// 安全解码 URL 编码字符串；若解码失败则保留原值，避免单个坏参数拖垮整批解析。
function safeDecodeUriComponent(value) {
  try {
    return decodeURIComponent(String(value || "").replace(/\+/g, "%20"));
  } catch (error) {
    return String(value || "");
  }
}

// 把形如 a=1&b=2 的 querystring 解析成对象，兼容 Sub-Store 官方 `$options` 常见写法。
function parseQueryLikeArgs(text) {
  const source = normalizeStringArg(text).replace(/^[?#]/, "");
  const result = {};

  if (!source) {
    return result;
  }

  for (const segment of source.split("&")) {
    const item = String(segment || "").trim();
    if (!item) {
      continue;
    }

    const separatorIndex = item.indexOf("=");
    const rawKey = separatorIndex >= 0 ? item.slice(0, separatorIndex) : item;
    const rawValue = separatorIndex >= 0 ? item.slice(separatorIndex + 1) : "true";
    const key = safeDecodeUriComponent(rawKey).trim();
    const value = safeDecodeUriComponent(rawValue);

    if (!key) {
      continue;
    }

    // 同名参数若重复出现，则自动扩展成数组，便于后续 list 类参数直接复用。
    if (hasOwn(result, key)) {
      result[key] = Array.isArray(result[key]) ? result[key].concat(value) : [result[key], value];
      continue;
    }

    result[key] = value;
  }

  return result;
}

// 判断参数值是否“有实际内容”，用于多来源 query 合并时避免空值覆盖有效值。
function hasUsableArgValue(value) {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === "string") {
    return value !== "";
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

// 合并两份 query 参数，extra 优先，但空值不会把 base 里的有效值冲掉。
function mergeQueryArgs(base, extra) {
  const result = Object.assign({}, isObject(base) ? base : {});
  const source = isObject(extra) ? extra : {};

  for (const key of Object.keys(source)) {
    const value = source[key];

    if (!hasUsableArgValue(value) && hasUsableArgValue(result[key])) {
      continue;
    }

    result[key] = value;
  }

  return result;
}

// 解析 `_req.query` 字段本身，兼容对象与 querystring 两种常见结构。
function parseRequestQueryPayload(payload) {
  if (isObject(payload)) {
    return Object.assign({}, payload);
  }

  if (typeof payload === "string") {
    return parseQueryLikeArgs(payload);
  }

  return {};
}

// 从 `_req.url` / `_req.path` 这类请求位置字符串中提取 query 参数。
function parseQueryArgsFromRequestLocation(location) {
  const source = normalizeStringArg(location);
  const questionIndex = source.indexOf("?");
  const hashIndex = source.indexOf("#");
  let result = {};

  if (!source || (questionIndex === -1 && hashIndex === -1)) {
    return result;
  }

  if (questionIndex >= 0) {
    const endIndex = hashIndex >= 0 && hashIndex > questionIndex ? hashIndex : source.length;
    result = mergeQueryArgs(result, parseQueryLikeArgs(source.slice(questionIndex + 1, endIndex)));
  }

  if (hashIndex >= 0) {
    result = mergeQueryArgs(result, parseQueryLikeArgs(source.slice(hashIndex + 1)));
  }

  return result;
}

// 把 query 值规范成单值，若出现重复参数数组，则优先取最后一个，贴近常见 query 覆盖习惯。
function normalizeQueryValue(value) {
  if (Array.isArray(value)) {
    return value.length ? value[value.length - 1] : undefined;
  }

  return value;
}

// 尝试把 JSON 字符串解析成普通对象，失败则返回空对象。
function parseJsonLikeArgs(text) {
  const source = normalizeStringArg(text);
  if (!source) {
    return {};
  }

  try {
    const parsed = JSON.parse(source);
    return isObject(parsed) ? parsed : {};
  } catch (error) {
    return {};
  }
}

// 统一解析 Sub-Store 官方 `$options` 负载，兼容对象、querystring、JSON 字符串三种输入形式。
function parseOptionPayload(payload) {
  if (isObject(payload)) {
    return Object.assign({}, payload);
  }

  if (typeof payload !== "string") {
    return {};
  }

  const source = normalizeStringArg(payload);
  if (!source) {
    return {};
  }

  // 形如 {"a":1} 的 JSON 字符串优先按 JSON 解析；失败再退回 querystring。
  if (/^[{\[]/.test(source)) {
    const jsonPayload = parseJsonLikeArgs(source);
    if (Object.keys(jsonPayload).length) {
      return jsonPayload;
    }
  }

  return parseQueryLikeArgs(source);
}

// 统一把 Sub-Store 传入的原始参数规范成对象，兼容官方 `$options`、字符串与嵌套对象写法。
function normalizeScriptArgs(rawArgs) {
  // 纯字符串时，直接按 `$options` 负载解析。
  if (typeof rawArgs === "string") {
    return parseOptionPayload(rawArgs);
  }

  // 普通对象时，允许 `$options` / `options` 再嵌一层字符串或对象。
  if (isObject(rawArgs)) {
    const nestedOptions = mergeObjects(
      parseOptionPayload(rawArgs.$options),
      parseOptionPayload(rawArgs.options)
    );
    const topLevelArgs = Object.assign({}, rawArgs);

    delete topLevelArgs.$options;
    delete topLevelArgs.options;

    // 显式顶层参数优先级高于 `$options` 内的同名项。
    return Object.assign({}, nestedOptions, topLevelArgs);
  }

  // 其他类型统一回空对象。
  return {};
}

// 统一读取运行时请求 query，兼容 Sub-Store 官方 demo.js 中 `$options._req.query` 结构。
function getRuntimeRequestQuery(rawOptions) {
  const options = isObject(rawOptions) ? rawOptions : {};
  const request = isObject(options._req) ? options._req : {};
  const queryFromPath = parseQueryArgsFromRequestLocation(request.path);
  const queryFromUrl = parseQueryArgsFromRequestLocation(request.url);
  const queryFromField = parseRequestQueryPayload(request.query);

  return mergeQueryArgs(
    mergeQueryArgs(queryFromPath, queryFromUrl),
    queryFromField
  );
}

// Sub-Store 官方下载链接里有一批保留 query 参数，这里把它们排除，剩余的再当成脚本参数候选。
const RESERVED_QUERY_ARG_KEYS = createLookup([
  "$options",
  "options",
  "target",
  "platform",
  "url",
  "content",
  "ua",
  "proxy",
  "mergeSources",
  "ignoreFailedRemoteSub",
  "produceType",
  "noCache",
  "includeUnsupportedProxy"
]);

// Sub-Store 官方 mergeSources 只支持 localFirst / remoteFirst。
const RUNTIME_LINK_MERGE_SOURCE_VALUES = ["localFirst", "remoteFirst"];
// Sub-Store 官方 produceType 只支持 internal / raw。
const RUNTIME_LINK_PRODUCE_TYPE_VALUES = ["internal", "raw"];
// 这些键属于运行环境或保留字段，不应计入“脚本参数来源”统计。
const RUNTIME_INTERNAL_ARG_SOURCE_KEYS = createLookup(["$options", "options", "_req", "_res", "target", "platform", "targetPlatform"]);
// 这些键属于运行环境或官方保留参数，不应计入“未消费脚本参数”统计。
const RUNTIME_UNUSED_ARG_IGNORE_KEYS = createLookup(
  Object.keys(RUNTIME_INTERNAL_ARG_SOURCE_KEYS).concat(Object.keys(RESERVED_QUERY_ARG_KEYS))
);

// 规范化官方 mergeSources 参数，便于做统一校验与摘要输出。
function normalizeRuntimeLinkMergeSources(value) {
  const normalized = normalizeStringArg(value).toLowerCase();
  return RUNTIME_LINK_MERGE_SOURCE_VALUES.find((item) => item.toLowerCase() === normalized) || "";
}

// 规范化官方 produceType 参数，便于做统一校验与摘要输出。
function normalizeRuntimeLinkProduceType(value) {
  const normalized = normalizeStringArg(value).toLowerCase();
  return RUNTIME_LINK_PRODUCE_TYPE_VALUES.includes(normalized) ? normalized : "";
}

// 判断官方下载链接里的 url 是远程订阅、单节点本地内容，还是根本没传。
function resolveRuntimeLinkUrlKind(value) {
  const source = normalizeStringArg(value);

  if (!source) {
    return "none";
  }

  return looksLikeHttpUrl(source) ? "remote-http" : "local-node";
}

// 判断当前官方下载链接里是否存在真正的远程订阅来源。
function hasRemoteRuntimeLinkSource(linkOptions) {
  return isObject(linkOptions) && linkOptions.urlKind === "remote-http";
}

// 把官方下载链接参数的语义压成紧凑摘要，便于日志与响应调试头直接复用。
function buildRuntimeLinkSemanticSummary(linkOptions) {
  const source = isObject(linkOptions) ? linkOptions : {};
  const hasRemoteSource = hasRemoteRuntimeLinkSource(source);

  return `url-kind=${source.urlKind || "none"},content=${source.hasContent ? "yes" : "no"},merge=${source.hasMergeSources ? (source.mergeSourcesNormalized || source.mergeSources) : "default"},produce=${source.hasProduceType ? (source.produceTypeNormalized || source.produceType) : "default"},ua=${source.hasUa ? (hasRemoteSource ? "remote-fetch" : "no-remote") : "default"},proxy=${source.hasProxy ? (hasRemoteSource ? "remote-fetch" : "no-remote") : "default"},ignore-failed=${source.hasIgnoreFailedRemoteSub ? (source.ignoreFailedRemoteSub ? (hasRemoteSource ? "remote-only" : "no-remote") : "off") : "default"},no-cache=${source.hasNoCache ? (source.noCache ? (hasRemoteSource ? "remote-only" : "no-remote") : "off") : "default"}`;
}

// 提取原始参数对象里“直接挂在顶层”的脚本参数键，跳过运行环境保留字段。
function extractDirectScriptArgKeys(rawArgs) {
  if (typeof rawArgs === "string") {
    return Object.keys(parseOptionPayload(rawArgs));
  }

  if (!isObject(rawArgs)) {
    return [];
  }

  return Object.keys(rawArgs).filter((key) => !RUNTIME_INTERNAL_ARG_SOURCE_KEYS[key] && !/^_/.test(key));
}

// 提取原始参数对象里嵌套在 $options / options 中的脚本参数键。
function extractNestedScriptArgKeys(rawArgs) {
  if (!isObject(rawArgs)) {
    return [];
  }

  return Object.keys(
    mergeObjects(
      parseOptionPayload(rawArgs.$options),
      parseOptionPayload(rawArgs.options)
    )
  );
}

// 拆分运行时 query 中“直接参数”和“query.$options/options 嵌套参数”两类来源。
function extractRuntimeQueryArgBreakdown(rawOptions) {
  const query = getRuntimeRequestQuery(rawOptions);
  const nestedArgs = mergeObjects(
    parseOptionPayload(query.$options),
    parseOptionPayload(query.options)
  );
  const directArgs = {};

  for (const key of Object.keys(query)) {
    if (RESERVED_QUERY_ARG_KEYS[key]) {
      continue;
    }

    directArgs[key] = query[key];
  }

  return {
    directKeys: Object.keys(directArgs),
    nestedKeys: Object.keys(nestedArgs)
  };
}

// 判断 route-target 最终是从 params / url / path 哪一路识别出来的。
function resolveRouteTargetSource(rawOptions) {
  const options = isObject(rawOptions) ? rawOptions : {};
  const request = isObject(options._req) ? options._req : {};
  const params = isObject(request.params) ? request.params : {};

  if (normalizeStringArg(params.target || params.platform || "")) {
    return "params";
  }

  if (extractRouteTargetFromUrl(request.url)) {
    return "url";
  }

  if (extractRouteTargetFromUrl(request.path)) {
    return "path";
  }

  return "none";
}

// 判断 route-kind/route-name 是从 path / url 哪一路识别出来的。
function resolveRouteInfoSource(rawOptions) {
  const options = isObject(rawOptions) ? rawOptions : {};
  const request = isObject(options._req) ? options._req : {};
  const routeInfoFromPath = extractRouteInfoFromLocation(request.path);

  if (routeInfoFromPath.routeKind) {
    return "path";
  }

  const routeInfoFromUrl = extractRouteInfoFromLocation(request.url);
  return routeInfoFromUrl.routeKind ? "url" : "none";
}

// 汇总当前运行环境下脚本参数到底来自哪几路，便于快速排查官方 demo.js / 后端差异。
function analyzeRuntimeArgSources(rawOptions, rawArguments, mergedArgs) {
  const options = isObject(rawOptions) ? rawOptions : {};
  const request = isObject(options._req) ? options._req : {};
  const queryFromField = parseRequestQueryPayload(request.query);
  const queryFromUrl = parseQueryArgsFromRequestLocation(request.url);
  const queryFromPath = parseQueryArgsFromRequestLocation(request.path);
  const queryBreakdown = extractRuntimeQueryArgBreakdown(rawOptions);

  return {
    queryDirectCount: uniqueStrings(queryBreakdown.directKeys).length,
    queryNestedCount: uniqueStrings(queryBreakdown.nestedKeys).length,
    optionsDirectCount: uniqueStrings(extractDirectScriptArgKeys(rawOptions)).length,
    optionsNestedCount: uniqueStrings(extractNestedScriptArgKeys(rawOptions)).length,
    argumentsDirectCount: uniqueStrings(extractDirectScriptArgKeys(rawArguments)).length,
    argumentsNestedCount: uniqueStrings(extractNestedScriptArgKeys(rawArguments)).length,
    requestQuerySource: Object.keys(queryFromField).length ? "yes" : "no",
    requestUrlSource: Object.keys(queryFromUrl).length ? "yes" : "no",
    requestPathSource: Object.keys(queryFromPath).length ? "yes" : "no",
    routeTargetSource: resolveRouteTargetSource(rawOptions),
    routeInfoSource: resolveRouteInfoSource(rawOptions),
    mergedCount: Object.keys(isObject(mergedArgs) ? mergedArgs : {}).length
  };
}

// 把参数来源统计压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatRuntimeArgSourceSummary(source) {
  const current = isObject(source) ? source : {};
  return `query-direct=${Number(current.queryDirectCount) || 0},query-options=${Number(current.queryNestedCount) || 0},options-top=${Number(current.optionsDirectCount) || 0},options-nested=${Number(current.optionsNestedCount) || 0},arguments-top=${Number(current.argumentsDirectCount) || 0},arguments-nested=${Number(current.argumentsNestedCount) || 0},req-query=${current.requestQuerySource || "no"},req-url=${current.requestUrlSource || "no"},req-path=${current.requestPathSource || "no"},route-target=${current.routeTargetSource || "none"},route-info=${current.routeInfoSource || "none"},merged=${Number(current.mergedCount) || 0}`;
}

// 统计最终生效参数分别由 query / $options / $arguments 哪一路提供，并额外统计覆盖关系。
function analyzeRuntimeArgEffectiveSources(queryArgs, optionArgs, argumentArgs, mergedArgs) {
  const query = isObject(queryArgs) ? queryArgs : {};
  const options = isObject(optionArgs) ? optionArgs : {};
  const argumentsSource = isObject(argumentArgs) ? argumentArgs : {};
  const merged = isObject(mergedArgs) ? mergedArgs : {};
  const result = {
    total: 0,
    queryWin: 0,
    optionsWin: 0,
    argumentsWin: 0,
    optionsOverrideQuery: 0,
    argumentsOverrideQuery: 0,
    argumentsOverrideOptions: 0,
    queryKeys: [],
    optionsKeys: [],
    argumentsKeys: []
  };

  for (const key of Object.keys(merged)) {
    result.total += 1;

    if (hasOwn(argumentsSource, key)) {
      result.argumentsWin += 1;
      result.argumentsKeys.push(key);
    } else if (hasOwn(options, key)) {
      result.optionsWin += 1;
      result.optionsKeys.push(key);
    } else if (hasOwn(query, key)) {
      result.queryWin += 1;
      result.queryKeys.push(key);
    }

    if (hasOwn(options, key) && hasOwn(query, key)) {
      result.optionsOverrideQuery += 1;
    }

    if (hasOwn(argumentsSource, key) && hasOwn(query, key)) {
      result.argumentsOverrideQuery += 1;
    }

    if (hasOwn(argumentsSource, key) && hasOwn(options, key)) {
      result.argumentsOverrideOptions += 1;
    }
  }

  return result;
}

// 把参数生效来源统计压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatRuntimeArgEffectiveSummary(source) {
  const current = isObject(source) ? source : {};
  return `total=${Number(current.total) || 0},query-win=${Number(current.queryWin) || 0},options-win=${Number(current.optionsWin) || 0},arguments-win=${Number(current.argumentsWin) || 0},options>query=${Number(current.optionsOverrideQuery) || 0},arguments>query=${Number(current.argumentsOverrideQuery) || 0},arguments>options=${Number(current.argumentsOverrideOptions) || 0}`;
}

// 把最终生效参数的来源样本压成紧凑预览，便于快速定位哪些参数最终由哪一路接管。
function formatRuntimeArgEffectivePreview(source) {
  const current = isObject(source) ? source : {};
  return `query=${formatProviderPreviewNames(current.queryKeys, 3, 18)},options=${formatProviderPreviewNames(current.optionsKeys, 3, 18)},arguments=${formatProviderPreviewNames(current.argumentsKeys, 3, 18)}`;
}

// 统计当前合并后的脚本参数里，有多少键已经被 resolveArgs 识别，有多少其实根本没消费到。
function analyzeUnusedScriptArgs(mergedArgs) {
  const merged = isObject(mergedArgs) ? mergedArgs : {};
  const candidateKeys = Object.keys(merged).filter((key) => !RUNTIME_UNUSED_ARG_IGNORE_KEYS[key] && !/^_/.test(key));
  const unusedKeys = uniqueStrings(candidateKeys.filter((key) => !KNOWN_SCRIPT_ARG_KEYS[key]));

  return {
    total: candidateKeys.length,
    recognizedCount: candidateKeys.length - unusedKeys.length,
    unusedCount: unusedKeys.length,
    unusedKeys
  };
}

// 把未消费参数统计压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatUnusedScriptArgsSummary(source) {
  const current = isObject(source) ? source : {};
  return `total=${Number(current.total) || 0},recognized=${Number(current.recognizedCount) || 0},unused=${Number(current.unusedCount) || 0}`;
}

// 把未消费参数样本压成预览字符串，便于快速锁定拼错或暂未支持的参数名。
function formatUnusedScriptArgsPreview(source) {
  const current = isObject(source) ? source : {};
  return formatProviderPreviewNames(current.unusedKeys, 5, 18);
}

// 如果检测到未消费参数，则输出显式提醒，避免用户误以为参数已经生效。
function validateUnusedScriptArgs(source) {
  const current = isObject(source) ? source : {};

  if (!(Number(current.unusedCount) > 0)) {
    return [];
  }

  return [
    `检测到 ${current.unusedCount} 个未消费脚本参数: ${formatUnusedScriptArgsPreview(current)}；请检查参数名拼写、别名写法，或确认当前版本是否已支持`
  ];
}

// 从官方 `_req.query` 中提取“直接挂在下载链接上的脚本参数”，避免必须先包进 `$options`。
function parseRuntimeQueryArgs(rawOptions) {
  const query = getRuntimeRequestQuery(rawOptions);
  const nestedOptionsArgs = Object.assign(
    {},
    parseOptionPayload(query.$options),
    parseOptionPayload(query.options)
  );
  const directArgs = {};

  for (const key of Object.keys(query)) {
    if (RESERVED_QUERY_ARG_KEYS[key]) {
      continue;
    }

    directArgs[key] = query[key];
  }

  // 同一条链接里，显式 query 参数优先级高于 query.$options。
  return Object.assign({}, nestedOptionsArgs, directArgs);
}

// 从请求 URL 中提取多一级路由目标，例如 `/download/xxx/ClashMeta` 里的 `ClashMeta`。
function extractRouteTargetFromUrl(requestUrl) {
  const source = normalizeStringArg(requestUrl);
  if (!source) {
    return "";
  }

  const matched = source.match(/\/download\/[^/?#]+\/([^/?#]+)/i);
  return matched ? safeDecodeUriComponent(matched[1]).trim() : "";
}

// 统一从官方请求上下文里提取路由目标，优先 params，再回退 url/path。
function getRuntimeRouteTarget(request) {
  const source = isObject(request) ? request : {};
  const params = isObject(source.params) ? source.params : {};
  const paramsTarget = normalizeStringArg(params.target || params.platform || "");

  return paramsTarget || extractRouteTargetFromUrl(source.url) || extractRouteTargetFromUrl(source.path);
}

// 从请求 URL / path 中提取“纯路径部分”，去掉协议、域名、query 与 hash。
function extractRequestPathname(location) {
  const source = normalizeStringArg(location);
  if (!source) {
    return "";
  }

  const noHash = source.split("#")[0];
  const noQuery = noHash.split("?")[0];
  const matched = noQuery.match(/^[a-z]+:\/\/[^/]+(\/.*)$/i);
  return matched ? matched[1] : noQuery;
}

// 从请求路径中识别当前访问的是 download / share / file 哪类路由，以及对应名称。
function extractRouteInfoFromLocation(location) {
  const pathname = extractRequestPathname(location);
  const segments = pathname
    .split("/")
    .map((segment) => safeDecodeUriComponent(segment).trim())
    .filter(Boolean);

  if (!segments.length) {
    return { routeKind: "", routeName: "", routePath: pathname };
  }

  if (/^download$/i.test(segments[0]) && segments[1]) {
    return {
      routeKind: "download",
      routeName: segments[1],
      routePath: pathname
    };
  }

  if (/^share$/i.test(segments[0]) && segments[1]) {
    return {
      routeKind: "share",
      routeName: segments[1],
      routePath: pathname
    };
  }

  if (/^api$/i.test(segments[0]) && /^file$/i.test(segments[1] || "") && segments[2]) {
    return {
      routeKind: "file",
      routeName: segments[2],
      routePath: pathname
    };
  }

  return {
    routeKind: "",
    routeName: "",
    routePath: pathname
  };
}

// 读取官方链接上的保留 query 参数，给日志 / 诊断 / 响应头复用。
function resolveRuntimeLinkOptions(rawOptions) {
  const query = getRuntimeRequestQuery(rawOptions);
  const url = normalizeQueryValue(query.url);
  const content = normalizeQueryValue(query.content);
  const ua = normalizeQueryValue(query.ua);
  const proxy = normalizeQueryValue(query.proxy);
  const mergeSources = normalizeStringArg(normalizeQueryValue(query.mergeSources));
  const produceType = normalizeStringArg(normalizeQueryValue(query.produceType));
  const ignoreFailedRemoteSub = parseBool(normalizeQueryValue(query.ignoreFailedRemoteSub), false);
  const noCache = parseBool(normalizeQueryValue(query.noCache), false);
  const includeUnsupportedProxy = parseBool(normalizeQueryValue(query.includeUnsupportedProxy), false);
  const mergeSourcesNormalized = normalizeRuntimeLinkMergeSources(mergeSources);
  const produceTypeNormalized = normalizeRuntimeLinkProduceType(produceType);
  const urlKind = resolveRuntimeLinkUrlKind(url);

  return {
    hasUrl: hasUsableArgValue(url),
    hasContent: hasUsableArgValue(content),
    hasUa: hasUsableArgValue(ua),
    hasProxy: hasUsableArgValue(proxy),
    urlKind,
    mergeSources,
    mergeSourcesNormalized,
    hasMergeSources: !!mergeSources,
    produceType,
    produceTypeNormalized,
    hasProduceType: !!produceType,
    ignoreFailedRemoteSub,
    hasIgnoreFailedRemoteSub: hasOwn(query, "ignoreFailedRemoteSub"),
    noCache,
    hasNoCache: hasOwn(query, "noCache"),
    includeUnsupportedProxy,
    hasIncludeUnsupportedProxy: hasOwn(query, "includeUnsupportedProxy")
  };
}

// 按 Sub-Store 官方链接参数说明校验下载链路语义，避免保留参数传了却没有按预期生效。
function validateRuntimeLinkOptionWarnings(linkOptions) {
  const source = isObject(linkOptions) ? linkOptions : {};
  const warnings = [];
  const hasRemoteSource = hasRemoteRuntimeLinkSource(source);

  if (source.hasUrl && source.urlKind === "local-node") {
    warnings.push("当前链接里的 url 不是 http(s)；按 Sub-Store 官方说明它会被视为单条本地节点内容，而不是远程订阅地址");
  }

  if (source.hasMergeSources) {
    if (!source.mergeSourcesNormalized) {
      warnings.push(`mergeSources=${source.mergeSources} 仅支持 ${RUNTIME_LINK_MERGE_SOURCE_VALUES.join(" / ")}`);
    }

    if (!(source.hasUrl && source.hasContent)) {
      warnings.push("mergeSources 仅在同时传入 url 与 content 时才有实际意义");
    }
  }

  if (source.hasProduceType && !source.produceTypeNormalized) {
    warnings.push(`produceType=${source.produceType} 仅支持 ${RUNTIME_LINK_PRODUCE_TYPE_VALUES.join(" / ")}`);
  }

  if (source.hasUrl && source.hasContent && !source.hasMergeSources) {
    warnings.push("当前链接同时携带了 url 与 content，但未显式声明 mergeSources；请确认是否符合预期");
  }

  if (source.hasIgnoreFailedRemoteSub && source.ignoreFailedRemoteSub && !hasRemoteSource) {
    warnings.push("ignoreFailedRemoteSub 只对远程订阅 url 生效；当前链接里没有可识别的远程订阅地址");
  }

  if (source.hasNoCache && source.noCache && !hasRemoteSource) {
    warnings.push("noCache 只对远程链接来源生效；当前链接里没有可识别的远程订阅地址");
  }

  if (source.hasUa && !hasRemoteSource) {
    warnings.push("ua 主要用于请求远程订阅；当前链接里没有可识别的远程订阅地址");
  }

  if (source.hasProxy && !hasRemoteSource) {
    warnings.push("proxy 主要用于获取远程订阅；当前链接里没有可识别的远程订阅地址");
  }

  return uniqueStrings(warnings);
}

// 解析当前运行环境里的目标平台信息，优先使用官方上下文字段。
function resolveRuntimeContext(rawOptions) {
  const options = isObject(rawOptions) ? rawOptions : {};
  const request = isObject(options._req) ? options._req : {};
  const requestQuery = getRuntimeRequestQuery(options);
  const requestHeaders = isObject(request.headers) ? request.headers : {};
  const requestParams = isObject(request.params) ? request.params : {};
  const requestUrl = normalizeStringArg(request.url);
  const requestPath = normalizeStringArg(request.path);
  const routeInfoFromPath = extractRouteInfoFromLocation(requestPath);
  const routeInfoFromUrl = extractRouteInfoFromLocation(requestUrl);
  const routeInfo = routeInfoFromPath.routeKind ? routeInfoFromPath : routeInfoFromUrl;
  const requestParamsTarget = normalizeStringArg(requestParams.target || requestParams.platform || "");
  const routeTarget = getRuntimeRouteTarget(request);
  const queryTarget = normalizeStringArg(requestQuery.target || requestQuery.platform || "");
  const target = normalizeStringArg(
    typeof targetPlatform !== "undefined"
      ? targetPlatform
      : (
        options.targetPlatform ||
        routeTarget ||
        queryTarget ||
        ""
      )
  );
  const userAgent = normalizeStringArg(
    requestHeaders["user-agent"] ||
    requestHeaders["User-Agent"] ||
    ""
  );

  return {
    target,
    routeTarget,
    queryTarget,
    requestUrl,
    requestPath,
    routeKind: routeInfo.routeKind,
    routeName: routeInfo.routeName,
    routePath: routeInfo.routePath,
    requestParamsTarget,
    userAgent
  };
}

// 判断当前目标是否看起来属于 Clash / Mihomo 体系；若不是，只做提醒不阻断执行。
function isClashLikeTarget(target) {
  return /(clash|mihomo|meta|openclash)/i.test(normalizeStringArg(target));
}

// 统一规范节点名称，做 trim，并把连续空白折叠成单空格。
function normalizeProxyName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

// 转义正则特殊字符，避免别名中出现特殊符号时把正则语义搞乱。
function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 统一去掉脚本内部自定义的 (?i) 前缀，后面会在 RegExp 构造时显式传 i 标记。
function normalizePatternSource(pattern) {
  return String(pattern || "").replace(/^\(\?i\)/, "");
}

// 把脚本内部使用的正则源码安全地编译成 RegExp 对象。
function compilePatternRegExp(pattern) {
  // 非字符串或空字符串时，说明没有可编译内容。
  if (typeof pattern !== "string" || !pattern.trim()) {
    return null;
  }

  // 去掉自定义的 (?i) 前缀后，统一使用 JS RegExp 的 i 标志。
  return new RegExp(normalizePatternSource(pattern), "i");
}

// 把多个正则片段合并成一个大小写不敏感的正则表达式源码。
function composeCaseInsensitivePattern(patterns) {
  // 收集每一段已经清洗过的源码。
  const sources = [];

  // 遍历所有传入的模式片段。
  for (const pattern of patterns) {
    // 先把片段规范化，去掉重复的 (?i)。
    const source = normalizePatternSource(pattern);
    // 只有非空片段才拼进去。
    if (source) {
      sources.push(source);
    }
  }

  // 有内容就拼成 (?i)source1|source2...，没有内容就返回空串。
  return sources.length ? `(?i)${sources.join("|")}` : "";
}

// 把单个国家别名转换成一个更稳的正则片段。
function aliasToRegex(alias) {
  // 统一把别名转成去空格后的字符串。
  const value = String(alias || "").trim();
  // 空值直接返回空串，不参与后续拼接。
  if (!value) {
    return "";
  }

  // 纯英文短代码（如 US / JP）两边加边界，减少误伤普通单词。
  if (/^[A-Z]{2,4}$/.test(value)) {
    return `(?:^|[^A-Za-z])${escapeRegex(value)}(?:[^A-Za-z]|$)`;
  }

  // 英文词组允许中间空格有一定弹性，比如 Hong Kong / United States。
  if (/^[A-Za-z][A-Za-z\s-]+$/.test(value)) {
    return `(?:^|[^A-Za-z])${escapeRegex(value).replace(/\\ /g, "\\s*")}(?:[^A-Za-z]|$)`;
  }

  // 中文、emoji 等内容直接转义后使用。
  return escapeRegex(value);
}

// 把一个国家的所有别名拼成最终过滤正则。
function buildCountryPattern(aliases) {
  return composeCaseInsensitivePattern(uniqueStrings(aliases).map(aliasToRegex));
}

// 读取某个国家定义对应的“用户自定义额外别名”，便于把运行参数也纳入国家识别。
function getCountryExtraAliases(countryName) {
  if (typeof ARGS === "undefined" || !ARGS || !ARGS.hasCountryExtraAliases || !isObject(ARGS.countryExtraAliasesMap)) {
    return [];
  }

  return uniqueStrings(ARGS.countryExtraAliasesMap[countryName]);
}

// 统一收集某个国家定义里“脚本内置”的可识别标记：旗帜、显示名、内置别名。
function getBuiltInCountryDefinitionMarkers(country) {
  if (!isObject(country)) {
    return [];
  }

  return uniqueStrings([country.flag, country.name].concat(country.aliases || []));
}

// 统一收集某个国家定义的全部可识别标记：旗帜、显示名、内置别名、运行参数追加别名。
function getCountryDefinitionMarkers(country) {
  if (!isObject(country)) {
    return [];
  }

  return uniqueStrings(getBuiltInCountryDefinitionMarkers(country).concat(getCountryExtraAliases(country.name)));
}

// 分析 country-extra-aliases 是否存在“一个别名指向多个国家”或“撞到别的内置国家标记”的冲突。
function analyzeCountryExtraAliasMap(aliasMap) {
  const source = isObject(aliasMap) ? aliasMap : {};
  const customTokenOwners = Object.create(null);
  const customDuplicateConflicts = [];
  const builtInMarkerConflicts = [];

  for (const countryName of Object.keys(source)) {
    const aliases = Array.isArray(source[countryName]) ? source[countryName] : [];

    for (const alias of aliases) {
      const normalizedAlias = String(alias || "").trim();
      const token = normalizeGroupMarkerToken(normalizedAlias);
      if (!token) {
        continue;
      }

      customTokenOwners[token] = customTokenOwners[token] || {
        alias: normalizedAlias,
        countries: []
      };
      customTokenOwners[token].countries.push(countryName);
    }
  }

  for (const token of Object.keys(customTokenOwners)) {
    const owner = customTokenOwners[token];
    const countries = uniqueStrings(owner.countries);
    if (countries.length > 1) {
      customDuplicateConflicts.push(`${owner.alias}=>${countries.join("/")}`);
    }
  }

  for (const countryName of Object.keys(source)) {
    const aliases = Array.isArray(source[countryName]) ? source[countryName] : [];

    for (const alias of aliases) {
      const normalizedAlias = String(alias || "").trim();
      const token = normalizeGroupMarkerToken(normalizedAlias);
      if (!token) {
        continue;
      }

      for (const definition of COUNTRY_DEFINITIONS) {
        if (definition.name === countryName) {
          continue;
        }

        const markers = getBuiltInCountryDefinitionMarkers(definition);
        if (markers.some((item) => normalizeGroupMarkerToken(item) === token)) {
          builtInMarkerConflicts.push(`${normalizedAlias}=>${countryName}~${definition.name}`);
        }
      }
    }
  }

  const conflicts = uniqueStrings(customDuplicateConflicts.concat(builtInMarkerConflicts));
  return {
    customDuplicateConflicts: uniqueStrings(customDuplicateConflicts),
    builtInMarkerConflicts: uniqueStrings(builtInMarkerConflicts),
    conflicts
  };
}

// 按标记查找某个国家定义，兼容显示名、旗帜、内置别名与运行参数追加别名。
function findCountryDefinitionByMarker(marker) {
  const token = normalizeGroupMarkerToken(marker);
  if (!token) {
    return null;
  }

  for (const definition of COUNTRY_DEFINITIONS) {
    const markers = getCountryDefinitionMarkers(definition);
    if (markers.some((item) => normalizeGroupMarkerToken(item) === token)) {
      return definition;
    }
  }

  return null;
}

// 统一收集某个区域定义的全部可识别标记：key、显示名与内置别名。
function getRegionGroupDefinitionMarkers(definition) {
  if (!isObject(definition)) {
    return [];
  }

  return uniqueStrings([definition.key, definition.name].concat(definition.aliases || []));
}

// 按标记查找某个区域分组定义，兼容 key、显示名与别名。
function findRegionGroupDefinitionByToken(marker) {
  const token = normalizeGroupMarkerToken(marker);
  if (!token) {
    return null;
  }

  for (const definition of REGION_GROUP_DEFINITIONS) {
    const markers = getRegionGroupDefinitionMarkers(definition);
    if (markers.some((item) => normalizeGroupMarkerToken(item) === token)) {
      return definition;
    }
  }

  return null;
}

// 读取单个优先链 preset 的所有可匹配标记，兼容 key、显示名和别名。
function getPreferredCountryPresetDefinitionMarkers(definition) {
  if (!isObject(definition)) {
    return [];
  }

  return uniqueStrings([definition.key, definition.name].concat(definition.aliases || []));
}

// 按标记查找某个优先链 preset，兼容 key、显示名与别名。
function findPreferredCountryPresetDefinitionByToken(marker) {
  const token = normalizeGroupMarkerToken(marker);
  if (!token) {
    return null;
  }

  for (const definition of PREFERRED_COUNTRY_PRESET_DEFINITIONS) {
    const markers = getPreferredCountryPresetDefinitionMarkers(definition);
    if (markers.some((item) => normalizeGroupMarkerToken(item) === token)) {
      return definition;
    }
  }

  return null;
}

// 构造区域分组别名表，便于布局参数与独立组前置组都能直接引用 `asia / europe / americas` 这类短写。
function createRegionGroupAliasMap() {
  const aliasMap = {};

  for (const definition of REGION_GROUP_DEFINITIONS) {
    for (const marker of getRegionGroupDefinitionMarkers(definition)) {
      const token = normalizeGroupMarkerToken(marker);
      if (!token || hasOwn(aliasMap, token)) {
        continue;
      }

      aliasMap[token] = definition.name;
    }
  }

  return aliasMap;
}

// 解析 region-groups / continent-groups 参数，支持布尔、字符串、数组、对象与 JSON 字符串。
function parseRegionGroupKeys(value) {
  const allKeys = REGION_GROUP_DEFINITIONS
    .filter((definition) => definition && definition.includeInAuto !== false)
    .map((definition) => definition.key);
  const enabledKeys = [];
  const invalidTokens = [];
  const truthyTokens = ["true", "1", "yes", "y", "on", "all", "auto", "default"];
  const falsyTokens = ["false", "0", "no", "n", "off", "none", "disable", "disabled"];
  const pushByToken = (token) => {
    const normalized = normalizeStringArg(token);
    if (!normalized) {
      return;
    }

    const definition = findRegionGroupDefinitionByToken(normalized);
    if (definition) {
      enabledKeys.push(definition.key);
      return;
    }

    invalidTokens.push(normalized);
  };
  const collectFromString = (text) => {
    const source = normalizeStringArg(text);
    if (!source) {
      return;
    }

    const normalized = normalizeGroupMarkerToken(source);
    if (truthyTokens.includes(normalized)) {
      enabledKeys.push.apply(enabledKeys, allKeys);
      return;
    }

    if (falsyTokens.includes(normalized)) {
      return;
    }

    if (/^[\[{]/.test(source)) {
      try {
        const parsed = JSON.parse(source);
        const nested = parseRegionGroupKeys(parsed);
        enabledKeys.push.apply(enabledKeys, nested.keys);
        invalidTokens.push.apply(invalidTokens, nested.invalidTokens);
        return;
      } catch (error) {
        // JSON 解析失败时继续按普通分隔字符串处理。
      }
    }

    for (const token of source.split(/[,;|\n]/)) {
      pushByToken(token);
    }
  };

  if (typeof value === "boolean") {
    return { keys: value ? allKeys.slice() : [], invalidTokens: [] };
  }

  if (typeof value === "number" && isFinite(value)) {
    return { keys: value !== 0 ? allKeys.slice() : [], invalidTokens: [] };
  }

  if (typeof value === "string") {
    collectFromString(value);
    return {
      keys: uniqueStrings(enabledKeys),
      invalidTokens: uniqueStrings(invalidTokens)
    };
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string") {
        collectFromString(item);
        continue;
      }

      pushByToken(item);
    }

    return {
      keys: uniqueStrings(enabledKeys),
      invalidTokens: uniqueStrings(invalidTokens)
    };
  }

  if (isObject(value)) {
    for (const key of Object.keys(value)) {
      if (parseBool(value[key], false)) {
        pushByToken(key);
      }
    }

    return {
      keys: uniqueStrings(enabledKeys),
      invalidTokens: uniqueStrings(invalidTokens)
    };
  }

  return { keys: [], invalidTokens: [] };
}

// 把启用的区域组 key 列表压成简短预览，便于响应头与 full 日志直接观察。
function formatRegionGroupPreview(keys) {
  const names = uniqueStrings((Array.isArray(keys) ? keys : [])
    .map((key) => {
      const definition = findRegionGroupDefinitionByToken(key);
      return definition ? definition.name : "";
    })
    .filter(Boolean));

  return names.length ? names.join(" / ") : "none";
}

// 预编译国家元数据，把别名表变成真正可匹配的 regex。
function buildCompiledCountries() {
  // 把 COUNTRY_DEFINITIONS 逐条加工成运行时更易用的对象。
  return COUNTRY_DEFINITIONS.map((country) => {
    // 先把旗帜和别名全部合并成策略组可复用的 filter 表达式。
    const filter = buildCountryPattern(getCountryDefinitionMarkers(country));
    return {
      // 国家显示名。
      name: country.name,
      // 国家旗帜。
      flag: country.flag,
      // 给策略组 include-all 过滤器直接复用的源码。
      filter,
      // 给运行期节点识别直接复用的正则对象。
      regex: new RegExp(normalizePatternSource(filter), "i")
    };
  });
}

// 解析 Sub-Store 传入的运行参数，并做兼容与兜底。
function resolveArgs(rawArgs) {
  // 按 Sub-Store 官方 `$options` 说明统一规范参数，兼容对象、querystring 与 JSON 字符串。
  const args = normalizeScriptArgs(rawArgs);
  // 读取 threshold 原始值。
  const rawThreshold = pickArg(args, ["threshold"]);
  // 读取测速组探测地址参数原始值。
  const rawTestUrl = pickArg(args, ["testUrl", "test-url", "groupTestUrl", "group-test-url"]);
  // 读取测速组 interval 参数原始值。
  const rawGroupInterval = pickArg(args, ["groupInterval", "group-interval"]);
  // 读取测速组 tolerance 参数原始值。
  const rawGroupTolerance = pickArg(args, ["groupTolerance", "group-tolerance"]);
  // 读取测速组 timeout 参数原始值。
  const rawGroupTimeout = pickArg(args, ["groupTimeout", "group-timeout"]);
  // 读取测速组最大失败次数参数原始值。
  const rawGroupMaxFailedTimes = pickArg(args, ["groupMaxFailedTimes", "group-max-failed-times"]);
  // 读取测速组 expected-status 参数原始值。
  const rawGroupExpectedStatus = pickArg(args, ["groupExpectedStatus", "group-expected-status"]);
  // 读取测速组 lazy 参数原始值。
  const rawGroupLazy = pickArg(args, ["groupLazy", "group-lazy"]);
  // 读取 load-balance strategy 参数原始值。
  const rawGroupStrategy = pickArg(args, ["groupStrategy", "group-strategy", "loadBalanceStrategy", "load-balance-strategy"]);
  // 读取全局 proxy-group interface-name 参数原始值。
  const rawGroupInterfaceName = pickArg(args, ["groupInterfaceName", "group-interface-name", "proxyGroupInterfaceName", "proxy-group-interface-name"]);
  // 读取全局 proxy-group routing-mark 参数原始值。
  const rawGroupRoutingMark = pickArg(args, ["groupRoutingMark", "group-routing-mark", "proxyGroupRoutingMark", "proxy-group-routing-mark"]);
  // 读取策略组布局预设参数原始值。
  const rawGroupOrderPreset = pickArg(args, ["groupOrderPreset", "group-order-preset", "proxyGroupOrderPreset", "proxy-group-order-preset", "groupLayoutPreset", "group-layout-preset"]);
  // 读取策略组显式布局顺序参数原始值。
  const rawGroupOrder = pickArg(args, ["groupOrder", "group-order", "proxyGroupOrder", "proxy-group-order", "groupLayout", "group-layout"]);
  // 读取国家组排序参数原始值。
  const rawCountryGroupSort = pickArg(args, ["countryGroupSort", "country-group-sort", "countrySort", "country-sort", "countryOrder", "country-order"]);
  // 读取区域组排序参数原始值。
  const rawRegionGroupSort = pickArg(args, ["regionGroupSort", "region-group-sort", "regionSort", "region-sort", "regionOrder", "region-order"]);
  // 读取区域分组参数原始值。
  const rawRegionGroups = pickArg(args, ["regionGroups", "region-groups", "regionalGroups", "regional-groups", "continentGroups", "continent-groups"]);
  // 读取 Direct.list 规则源地址参数原始值。
  const rawDirectListUrl = pickArg(args, ["directListUrl", "direct-list-url"]);
  // 读取 Crypto.list 规则源地址参数原始值。
  const rawCryptoListUrl = pickArg(args, ["cryptoListUrl", "crypto-list-url"]);
  // 读取 ChatGPT.list 规则源地址参数原始值。
  const rawChatGptListUrl = pickArg(args, ["chatgptListUrl", "chatgpt-list-url", "chatGPTListUrl", "chatGPT-list-url"]);
  // 读取 AIExtra.list 规则源地址参数原始值。
  const rawAiExtraListUrl = pickArg(args, ["aiExtraListUrl", "ai-extra-list-url", "moreAiListUrl", "more-ai-list-url", "aiSupplementListUrl", "ai-supplement-list-url"]);
  // 读取内置社区规则源预设参数原始值。
  const rawRuleSourcePreset = pickArg(args, ["ruleSourcePreset", "rule-source-preset", "rulesetPreset", "ruleset-preset"]);
  // 读取 SteamFix 开关参数原始值。
  const rawSteamFix = pickArg(args, ["steamFix", "steam-fix"]);
  // 读取 SteamFix 规则源地址参数原始值。
  const rawSteamFixUrl = pickArg(args, ["steamFixUrl", "steam-fix-url"]);
  // 读取 rule-provider 本地缓存目录参数原始值。
  const rawRuleProviderPathDir = pickArg(args, ["ruleProviderPathDir", "rule-provider-path-dir", "providerPathDir", "provider-path-dir"]);
  // 读取 rule-provider 刷新间隔参数原始值。
  const rawRuleProviderInterval = pickArg(args, ["ruleProviderInterval", "rule-provider-interval", "providerInterval", "provider-interval"]);
  // 读取 rule-provider 下载代理参数原始值。
  const rawRuleProviderProxy = pickArg(args, ["ruleProviderProxy", "rule-provider-proxy", "providerProxy", "provider-proxy"]);
  // 读取 rule-provider 大小限制参数原始值。
  const rawRuleProviderSizeLimit = pickArg(args, ["ruleProviderSizeLimit", "rule-provider-size-limit", "providerSizeLimit", "provider-size-limit"]);
  // 读取 rule-provider 请求 User-Agent 参数原始值。
  const rawRuleProviderUserAgent = pickArg(args, ["ruleProviderUserAgent", "rule-provider-user-agent", "providerUserAgent", "provider-user-agent", "ruleProviderUA", "rule-provider-ua"]);
  // 读取 rule-provider 请求 Authorization 参数原始值。
  const rawRuleProviderAuthorization = pickArg(args, ["ruleProviderAuthorization", "rule-provider-authorization", "providerAuthorization", "provider-authorization", "ruleProviderAuth", "rule-provider-auth"]);
  // 读取 rule-provider 通用自定义请求头参数原始值。
  const rawRuleProviderHeader = pickArg(args, ["ruleProviderHeader", "rule-provider-header", "providerHeader", "provider-header", "ruleProviderHeaders", "rule-provider-headers"]);
  // 读取 rule-provider inline payload 参数原始值。
  const rawRuleProviderPayload = pickArg(args, ["ruleProviderPayload", "rule-provider-payload"]);
  // 读取 proxy-provider 刷新间隔参数原始值。
  const rawProxyProviderInterval = pickArg(args, ["proxyProviderInterval", "proxy-provider-interval"]);
  // 读取 proxy-provider 下载代理参数原始值。
  const rawProxyProviderProxy = pickArg(args, ["proxyProviderProxy", "proxy-provider-proxy"]);
  // 读取 proxy-provider 大小限制参数原始值。
  const rawProxyProviderSizeLimit = pickArg(args, ["proxyProviderSizeLimit", "proxy-provider-size-limit"]);
  // 读取 proxy-provider 请求 User-Agent 参数原始值。
  const rawProxyProviderUserAgent = pickArg(args, ["proxyProviderUserAgent", "proxy-provider-user-agent", "proxyProviderUA", "proxy-provider-ua"]);
  // 读取 proxy-provider 请求 Authorization 参数原始值。
  const rawProxyProviderAuthorization = pickArg(args, ["proxyProviderAuthorization", "proxy-provider-authorization", "proxyProviderAuth", "proxy-provider-auth"]);
  // 读取 proxy-provider 通用自定义请求头参数原始值。
  const rawProxyProviderHeader = pickArg(args, ["proxyProviderHeader", "proxy-provider-header", "proxyProviderHeaders", "proxy-provider-headers"]);
  // 读取 proxy-provider fallback/inline payload 参数原始值。
  const rawProxyProviderPayload = pickArg(args, ["proxyProviderPayload", "proxy-provider-payload"]);
  // 读取 proxy-provider 本地缓存目录参数原始值。
  const rawProxyProviderPathDir = pickArg(args, ["proxyProviderPathDir", "proxy-provider-path-dir", "proxyProviderDir", "proxy-provider-dir"]);
  // 读取 proxy-provider 节点筛选 filter 参数原始值。
  const rawProxyProviderFilter = pickArg(args, ["proxyProviderFilter", "proxy-provider-filter"]);
  // 读取 proxy-provider 节点排除 exclude-filter 参数原始值。
  const rawProxyProviderExcludeFilter = pickArg(args, ["proxyProviderExcludeFilter", "proxy-provider-exclude-filter"]);
  // 读取 proxy-provider 协议排除 exclude-type 参数原始值。
  const rawProxyProviderExcludeType = pickArg(args, ["proxyProviderExcludeType", "proxy-provider-exclude-type"]);
  // 读取 proxy-provider override additional-prefix 参数原始值。
  const rawProxyProviderOverrideAdditionalPrefix = pickArg(args, ["proxyProviderOverrideAdditionalPrefix", "proxy-provider-override-additional-prefix", "proxyProviderAdditionalPrefix", "proxy-provider-additional-prefix"]);
  // 读取 proxy-provider override additional-suffix 参数原始值。
  const rawProxyProviderOverrideAdditionalSuffix = pickArg(args, ["proxyProviderOverrideAdditionalSuffix", "proxy-provider-override-additional-suffix", "proxyProviderAdditionalSuffix", "proxy-provider-additional-suffix"]);
  // 读取 proxy-provider override udp 参数原始值。
  const rawProxyProviderOverrideUdp = pickArg(args, ["proxyProviderOverrideUdp", "proxy-provider-override-udp"]);
  // 读取 proxy-provider override udp-over-tcp 参数原始值。
  const rawProxyProviderOverrideUdpOverTcp = pickArg(args, ["proxyProviderOverrideUdpOverTcp", "proxy-provider-override-udp-over-tcp"]);
  // 读取 proxy-provider override down 参数原始值。
  const rawProxyProviderOverrideDown = pickArg(args, ["proxyProviderOverrideDown", "proxy-provider-override-down"]);
  // 读取 proxy-provider override up 参数原始值。
  const rawProxyProviderOverrideUp = pickArg(args, ["proxyProviderOverrideUp", "proxy-provider-override-up"]);
  // 读取 proxy-provider override tfo 参数原始值。
  const rawProxyProviderOverrideTfo = pickArg(args, ["proxyProviderOverrideTfo", "proxy-provider-override-tfo"]);
  // 读取 proxy-provider override mptcp 参数原始值。
  const rawProxyProviderOverrideMptcp = pickArg(args, ["proxyProviderOverrideMptcp", "proxy-provider-override-mptcp"]);
  // 读取 proxy-provider override skip-cert-verify 参数原始值。
  const rawProxyProviderOverrideSkipCertVerify = pickArg(args, ["proxyProviderOverrideSkipCertVerify", "proxy-provider-override-skip-cert-verify"]);
  // 读取 proxy-provider override dialer-proxy 参数原始值。
  const rawProxyProviderOverrideDialerProxy = pickArg(args, ["proxyProviderOverrideDialerProxy", "proxy-provider-override-dialer-proxy"]);
  // 读取 proxy-provider override interface-name 参数原始值。
  const rawProxyProviderOverrideInterfaceName = pickArg(args, ["proxyProviderOverrideInterfaceName", "proxy-provider-override-interface-name"]);
  // 读取 proxy-provider override routing-mark 参数原始值。
  const rawProxyProviderOverrideRoutingMark = pickArg(args, ["proxyProviderOverrideRoutingMark", "proxy-provider-override-routing-mark"]);
  // 读取 proxy-provider override ip-version 参数原始值。
  const rawProxyProviderOverrideIpVersion = pickArg(args, ["proxyProviderOverrideIpVersion", "proxy-provider-override-ip-version"]);
  // 读取 proxy-provider override proxy-name 正则改名参数原始值。
  const rawProxyProviderOverrideProxyName = pickArg(args, ["proxyProviderOverrideProxyName", "proxy-provider-override-proxy-name"]);
  // 读取 proxy-provider health-check enable 参数原始值。
  const rawProxyProviderHealthCheckEnable = pickArg(args, ["proxyProviderHealthCheckEnable", "proxy-provider-health-check-enable", "proxyProviderHealthCheck", "proxy-provider-health-check"]);
  // 读取 proxy-provider health-check url 参数原始值。
  const rawProxyProviderHealthCheckUrl = pickArg(args, ["proxyProviderHealthCheckUrl", "proxy-provider-health-check-url"]);
  // 读取 proxy-provider health-check interval 参数原始值。
  const rawProxyProviderHealthCheckInterval = pickArg(args, ["proxyProviderHealthCheckInterval", "proxy-provider-health-check-interval"]);
  // 读取 proxy-provider health-check timeout 参数原始值。
  const rawProxyProviderHealthCheckTimeout = pickArg(args, ["proxyProviderHealthCheckTimeout", "proxy-provider-health-check-timeout"]);
  // 读取 proxy-provider health-check lazy 参数原始值。
  const rawProxyProviderHealthCheckLazy = pickArg(args, ["proxyProviderHealthCheckLazy", "proxy-provider-health-check-lazy"]);
  // 读取 proxy-provider health-check expected-status 参数原始值。
  const rawProxyProviderHealthCheckExpectedStatus = pickArg(args, ["proxyProviderHealthCheckExpectedStatus", "proxy-provider-health-check-expected-status"]);
  // 读取 AI 国家优先链参数原始值。
  const rawAiPreferCountries = pickArg(args, ["aiPreferCountries", "ai-prefer-countries", "aiPrefer", "ai-prefer"]);
  // 读取加密货币国家优先链参数原始值。
  const rawCryptoPreferCountries = pickArg(args, ["cryptoPreferCountries", "crypto-prefer-countries", "cryptoPrefer", "crypto-prefer"]);
  // 读取 GitHub 国家优先链参数原始值。
  const rawGithubPreferCountries = pickArg(args, ["githubPreferCountries", "github-prefer-countries", "githubPrefer", "github-prefer"]);
  // 读取 Steam 国家优先链参数原始值。
  const rawSteamPreferCountries = pickArg(args, ["steamPreferCountries", "steam-prefer-countries", "steamPrefer", "steam-prefer"]);
  // 读取开发服务组国家优先链参数原始值。
  const rawDevPreferCountries = pickArg(args, ["devPreferCountries", "dev-prefer-countries", "developerPreferCountries", "developer-prefer-countries", "devPreferCountry", "dev-prefer-country"]);
  // 读取自定义国家别名追加参数原始值。
  const rawCountryExtraAliases = pickArg(args, ["countryExtraAliases", "country-extra-aliases", "countryAliases", "country-aliases", "countryAliasMap", "country-alias-map"]);
  // 读取 GitHub 独立组额外前置组参数原始值。
  const rawGithubPreferGroups = pickArg(args, ["githubPreferGroups", "github-prefer-groups", "githubPreferredGroups", "github-preferred-groups"]);
  // 读取 Steam 独立组额外前置组参数原始值。
  const rawSteamPreferGroups = pickArg(args, ["steamPreferGroups", "steam-prefer-groups", "steamPreferredGroups", "steam-preferred-groups"]);
  // 读取开发服务组额外前置组参数原始值。
  const rawDevPreferGroups = pickArg(args, ["devPreferGroups", "dev-prefer-groups", "developerPreferGroups", "developer-prefer-groups"]);
  // 读取 GitHub 独立组指定节点优先参数原始值。
  const rawGithubPreferNodes = pickArg(args, ["githubPreferNodes", "github-prefer-nodes", "githubPreferredNodes", "github-preferred-nodes"]);
  // 读取 Steam 独立组指定节点优先参数原始值。
  const rawSteamPreferNodes = pickArg(args, ["steamPreferNodes", "steam-prefer-nodes", "steamPreferredNodes", "steam-preferred-nodes"]);
  // 读取开发服务组指定节点优先参数原始值。
  const rawDevPreferNodes = pickArg(args, ["devPreferNodes", "dev-prefer-nodes", "developerPreferNodes", "developer-prefer-nodes"]);
  // 读取 GitHub 规则目标参数原始值。
  const rawGithubRuleTarget = pickArg(args, ["githubRuleTarget", "github-rule-target"]);
  // 读取 Steam 全球规则目标参数原始值。
  const rawSteamRuleTarget = pickArg(args, ["steamRuleTarget", "steam-rule-target"]);
  // 读取 Steam 中国区规则目标参数原始值。
  const rawSteamCnRuleTarget = pickArg(args, ["steamCnRuleTarget", "steam-cn-rule-target", "steamCNRuleTarget", "steam-cn-rule-target"]);
  // 读取开发服务规则目标参数原始值。
  const rawDevRuleTarget = pickArg(args, ["devRuleTarget", "dev-rule-target", "developerRuleTarget", "developer-rule-target"]);
  // 读取 GitHub 规则顺序锚点参数原始值。
  const rawGithubRuleAnchor = pickArg(args, ["githubRuleAnchor", "github-rule-anchor"]);
  // 读取 GitHub 规则顺序前后位置参数原始值。
  const rawGithubRulePosition = pickArg(args, ["githubRulePosition", "github-rule-position"]);
  // 读取 Steam 全球规则顺序锚点参数原始值。
  const rawSteamRuleAnchor = pickArg(args, ["steamRuleAnchor", "steam-rule-anchor"]);
  // 读取 Steam 全球规则顺序前后位置参数原始值。
  const rawSteamRulePosition = pickArg(args, ["steamRulePosition", "steam-rule-position"]);
  // 读取 Steam 中国区规则顺序锚点参数原始值。
  const rawSteamCnRuleAnchor = pickArg(args, ["steamCnRuleAnchor", "steam-cn-rule-anchor", "steamCNRuleAnchor", "steam-cn-rule-anchor"]);
  // 读取 Steam 中国区规则顺序前后位置参数原始值。
  const rawSteamCnRulePosition = pickArg(args, ["steamCnRulePosition", "steam-cn-rule-position", "steamCNRulePosition", "steam-cn-rule-position"]);
  // 读取开发服务规则顺序锚点参数原始值。
  const rawDevRuleAnchor = pickArg(args, ["devRuleAnchor", "dev-rule-anchor", "developerRuleAnchor", "developer-rule-anchor"]);
  // 读取开发服务规则顺序前后位置参数原始值。
  const rawDevRulePosition = pickArg(args, ["devRulePosition", "dev-rule-position", "developerRulePosition", "developer-rule-position"]);
  // 读取 config.rules 自定义规则区间锚点参数原始值。
  const rawCustomRuleAnchor = pickArg(args, ["customRuleAnchor", "custom-rule-anchor", "configRulesAnchor", "config-rules-anchor", "rulesAnchor", "rules-anchor"]);
  // 读取 config.rules 自定义规则区间前后位置参数原始值。
  const rawCustomRulePosition = pickArg(args, ["customRulePosition", "custom-rule-position", "configRulesPosition", "config-rules-position", "rulesPosition", "rules-position"]);
  // 读取 GitHub 独立组模式参数原始值。
  const rawGithubMode = pickArg(args, ["githubMode", "github-mode"]);
  // 读取 Steam 独立组模式参数原始值。
  const rawSteamMode = pickArg(args, ["steamMode", "steam-mode"]);
  // 读取开发服务组模式参数原始值。
  const rawDevMode = pickArg(args, ["devMode", "dev-mode", "developerMode", "developer-mode"]);
  // 读取 GitHub 独立组类型参数原始值。
  const rawGithubType = pickArg(args, ["githubType", "github-type", "githubGroupType", "github-group-type"]);
  // 读取 Steam 独立组类型参数原始值。
  const rawSteamType = pickArg(args, ["steamType", "steam-type", "steamGroupType", "steam-group-type"]);
  // 读取开发服务组类型参数原始值。
  const rawDevType = pickArg(args, ["devType", "dev-type", "developerType", "developer-type", "devGroupType", "dev-group-type"]);
  // 读取 GitHub 独立组专属测速地址参数原始值。
  const rawGithubTestUrl = pickArg(args, ["githubTestUrl", "github-test-url"]);
  // 读取 Steam 独立组专属测速地址参数原始值。
  const rawSteamTestUrl = pickArg(args, ["steamTestUrl", "steam-test-url"]);
  // 读取开发服务组专属测速地址参数原始值。
  const rawDevTestUrl = pickArg(args, ["devTestUrl", "dev-test-url", "developerTestUrl", "developer-test-url"]);
  // 读取 GitHub 独立组专属测速间隔参数原始值。
  const rawGithubGroupInterval = pickArg(args, ["githubGroupInterval", "github-group-interval"]);
  // 读取 Steam 独立组专属测速间隔参数原始值。
  const rawSteamGroupInterval = pickArg(args, ["steamGroupInterval", "steam-group-interval"]);
  // 读取开发服务组专属测速间隔参数原始值。
  const rawDevGroupInterval = pickArg(args, ["devGroupInterval", "dev-group-interval", "developerGroupInterval", "developer-group-interval"]);
  // 读取 GitHub 独立组专属测速容差参数原始值。
  const rawGithubGroupTolerance = pickArg(args, ["githubGroupTolerance", "github-group-tolerance"]);
  // 读取 Steam 独立组专属测速容差参数原始值。
  const rawSteamGroupTolerance = pickArg(args, ["steamGroupTolerance", "steam-group-tolerance"]);
  // 读取开发服务组专属测速容差参数原始值。
  const rawDevGroupTolerance = pickArg(args, ["devGroupTolerance", "dev-group-tolerance", "developerGroupTolerance", "developer-group-tolerance"]);
  // 读取 GitHub 独立组专属测速超时参数原始值。
  const rawGithubGroupTimeout = pickArg(args, ["githubGroupTimeout", "github-group-timeout"]);
  // 读取 Steam 独立组专属测速超时参数原始值。
  const rawSteamGroupTimeout = pickArg(args, ["steamGroupTimeout", "steam-group-timeout"]);
  // 读取开发服务组专属测速超时参数原始值。
  const rawDevGroupTimeout = pickArg(args, ["devGroupTimeout", "dev-group-timeout", "developerGroupTimeout", "developer-group-timeout"]);
  // 读取 GitHub 独立组专属 lazy 参数原始值。
  const rawGithubGroupLazy = pickArg(args, ["githubGroupLazy", "github-group-lazy"]);
  // 读取 Steam 独立组专属 lazy 参数原始值。
  const rawSteamGroupLazy = pickArg(args, ["steamGroupLazy", "steam-group-lazy"]);
  // 读取开发服务组专属 lazy 参数原始值。
  const rawDevGroupLazy = pickArg(args, ["devGroupLazy", "dev-group-lazy", "developerGroupLazy", "developer-group-lazy"]);
  // 读取 GitHub 独立组专属最大失败次数参数原始值。
  const rawGithubGroupMaxFailedTimes = pickArg(args, ["githubGroupMaxFailedTimes", "github-group-max-failed-times"]);
  // 读取 Steam 独立组专属最大失败次数参数原始值。
  const rawSteamGroupMaxFailedTimes = pickArg(args, ["steamGroupMaxFailedTimes", "steam-group-max-failed-times"]);
  // 读取开发服务组专属最大失败次数参数原始值。
  const rawDevGroupMaxFailedTimes = pickArg(args, ["devGroupMaxFailedTimes", "dev-group-max-failed-times", "developerGroupMaxFailedTimes", "developer-group-max-failed-times"]);
  // 读取 GitHub 独立组专属 expected-status 参数原始值。
  const rawGithubGroupExpectedStatus = pickArg(args, ["githubGroupExpectedStatus", "github-group-expected-status"]);
  // 读取 GitHub 独立组专属 load-balance strategy 参数原始值。
  const rawGithubGroupStrategy = pickArg(args, ["githubGroupStrategy", "github-group-strategy", "githubLoadBalanceStrategy", "github-load-balance-strategy"]);
  // 读取 Steam 独立组专属 expected-status 参数原始值。
  const rawSteamGroupExpectedStatus = pickArg(args, ["steamGroupExpectedStatus", "steam-group-expected-status"]);
  // 读取 Steam 独立组专属 load-balance strategy 参数原始值。
  const rawSteamGroupStrategy = pickArg(args, ["steamGroupStrategy", "steam-group-strategy", "steamLoadBalanceStrategy", "steam-load-balance-strategy"]);
  // 读取开发服务组专属 expected-status 参数原始值。
  const rawDevGroupExpectedStatus = pickArg(args, ["devGroupExpectedStatus", "dev-group-expected-status", "developerGroupExpectedStatus", "developer-group-expected-status"]);
  // 读取开发服务组专属 load-balance strategy 参数原始值。
  const rawDevGroupStrategy = pickArg(args, ["devGroupStrategy", "dev-group-strategy", "developerGroupStrategy", "developer-group-strategy", "devLoadBalanceStrategy", "dev-load-balance-strategy"]);
  // 读取 GitHub 独立组 proxy-provider 引用参数原始值。
  const rawGithubUseProviders = pickArg(args, ["githubUseProviders", "github-use-providers", "githubUseProvider", "github-use-provider"]);
  // 读取 Steam 独立组 proxy-provider 引用参数原始值。
  const rawSteamUseProviders = pickArg(args, ["steamUseProviders", "steam-use-providers", "steamUseProvider", "steam-use-provider"]);
  // 读取开发服务组 proxy-provider 引用参数原始值。
  const rawDevUseProviders = pickArg(args, ["devUseProviders", "dev-use-providers", "developerUseProviders", "developer-use-providers", "devUseProvider", "dev-use-provider"]);
  // 读取 GitHub 独立组 include-all 参数原始值。
  const rawGithubIncludeAll = pickArg(args, ["githubIncludeAll", "github-include-all", "githubAll", "github-all"]);
  // 读取 Steam 独立组 include-all 参数原始值。
  const rawSteamIncludeAll = pickArg(args, ["steamIncludeAll", "steam-include-all", "steamAll", "steam-all"]);
  // 读取开发服务组 include-all 参数原始值。
  const rawDevIncludeAll = pickArg(args, ["devIncludeAll", "dev-include-all", "developerIncludeAll", "developer-include-all", "devAll", "dev-all"]);
  // 读取 GitHub 独立组 include-all-proxies 参数原始值。
  const rawGithubIncludeAllProxies = pickArg(args, ["githubIncludeAllProxies", "github-include-all-proxies", "githubAllProxies", "github-all-proxies"]);
  // 读取 Steam 独立组 include-all-proxies 参数原始值。
  const rawSteamIncludeAllProxies = pickArg(args, ["steamIncludeAllProxies", "steam-include-all-proxies", "steamAllProxies", "steam-all-proxies"]);
  // 读取开发服务组 include-all-proxies 参数原始值。
  const rawDevIncludeAllProxies = pickArg(args, ["devIncludeAllProxies", "dev-include-all-proxies", "developerIncludeAllProxies", "developer-include-all-proxies", "devAllProxies", "dev-all-proxies"]);
  // 读取 GitHub 独立组 include-all-providers 参数原始值。
  const rawGithubIncludeAllProviders = pickArg(args, ["githubIncludeAllProviders", "github-include-all-providers", "githubAllProviders", "github-all-providers"]);
  // 读取 Steam 独立组 include-all-providers 参数原始值。
  const rawSteamIncludeAllProviders = pickArg(args, ["steamIncludeAllProviders", "steam-include-all-providers", "steamAllProviders", "steam-all-providers"]);
  // 读取开发服务组 include-all-providers 参数原始值。
  const rawDevIncludeAllProviders = pickArg(args, ["devIncludeAllProviders", "dev-include-all-providers", "developerIncludeAllProviders", "developer-include-all-providers", "devAllProviders", "dev-all-providers"]);
  // 读取 GitHub 独立组 hidden 参数原始值。
  const rawGithubHidden = pickArg(args, ["githubHidden", "github-hidden", "githubGroupHidden", "github-group-hidden"]);
  // 读取 Steam 独立组 hidden 参数原始值。
  const rawSteamHidden = pickArg(args, ["steamHidden", "steam-hidden", "steamGroupHidden", "steam-group-hidden"]);
  // 读取开发服务组 hidden 参数原始值。
  const rawDevHidden = pickArg(args, ["devHidden", "dev-hidden", "developerHidden", "developer-hidden", "devGroupHidden", "dev-group-hidden"]);
  // 读取 GitHub 独立组 disable-udp 参数原始值。
  const rawGithubDisableUdp = pickArg(args, ["githubDisableUdp", "github-disable-udp", "githubDisableUDP", "github-group-disable-udp", "githubGroupDisableUdp"]);
  // 读取 Steam 独立组 disable-udp 参数原始值。
  const rawSteamDisableUdp = pickArg(args, ["steamDisableUdp", "steam-disable-udp", "steamDisableUDP", "steam-group-disable-udp", "steamGroupDisableUdp"]);
  // 读取开发服务组 disable-udp 参数原始值。
  const rawDevDisableUdp = pickArg(args, ["devDisableUdp", "dev-disable-udp", "devDisableUDP", "developerDisableUdp", "developer-disable-udp", "devGroupDisableUdp", "dev-group-disable-udp"]);
  // 读取 GitHub 独立组 icon 参数原始值。
  const rawGithubIcon = pickArg(args, ["githubIcon", "github-icon", "githubGroupIcon", "github-group-icon"]);
  // 读取 Steam 独立组 icon 参数原始值。
  const rawSteamIcon = pickArg(args, ["steamIcon", "steam-icon", "steamGroupIcon", "steam-group-icon"]);
  // 读取开发服务组 icon 参数原始值。
  const rawDevIcon = pickArg(args, ["devIcon", "dev-icon", "developerIcon", "developer-icon", "devGroupIcon", "dev-group-icon"]);
  // 读取 GitHub 独立组 interface-name 参数原始值。
  const rawGithubInterfaceName = pickArg(args, ["githubInterfaceName", "github-interface-name", "githubGroupInterfaceName", "github-group-interface-name"]);
  // 读取 Steam 独立组 interface-name 参数原始值。
  const rawSteamInterfaceName = pickArg(args, ["steamInterfaceName", "steam-interface-name", "steamGroupInterfaceName", "steam-group-interface-name"]);
  // 读取开发服务组 interface-name 参数原始值。
  const rawDevInterfaceName = pickArg(args, ["devInterfaceName", "dev-interface-name", "developerInterfaceName", "developer-interface-name", "devGroupInterfaceName", "dev-group-interface-name"]);
  // 读取 GitHub 独立组 routing-mark 参数原始值。
  const rawGithubRoutingMark = pickArg(args, ["githubRoutingMark", "github-routing-mark", "githubGroupRoutingMark", "github-group-routing-mark"]);
  // 读取 Steam 独立组 routing-mark 参数原始值。
  const rawSteamRoutingMark = pickArg(args, ["steamRoutingMark", "steam-routing-mark", "steamGroupRoutingMark", "steam-group-routing-mark"]);
  // 读取开发服务组 routing-mark 参数原始值。
  const rawDevRoutingMark = pickArg(args, ["devRoutingMark", "dev-routing-mark", "developerRoutingMark", "developer-routing-mark", "devGroupRoutingMark", "dev-group-routing-mark"]);
  // 读取 GitHub 独立组原始节点筛选参数原始值。
  const rawGithubNodeFilter = pickArg(args, ["githubNodeFilter", "github-node-filter", "githubFilter", "github-filter"]);
  // 读取 Steam 独立组原始节点筛选参数原始值。
  const rawSteamNodeFilter = pickArg(args, ["steamNodeFilter", "steam-node-filter", "steamFilter", "steam-filter"]);
  // 读取开发服务组原始节点筛选参数原始值。
  const rawDevNodeFilter = pickArg(args, ["devNodeFilter", "dev-node-filter", "developerNodeFilter", "developer-node-filter", "devFilter", "dev-filter"]);
  // 读取 GitHub 独立组原始节点排除筛选参数原始值。
  const rawGithubNodeExcludeFilter = pickArg(args, ["githubNodeExcludeFilter", "github-node-exclude-filter", "githubExcludeFilter", "github-exclude-filter"]);
  // 读取 Steam 独立组原始节点排除筛选参数原始值。
  const rawSteamNodeExcludeFilter = pickArg(args, ["steamNodeExcludeFilter", "steam-node-exclude-filter", "steamExcludeFilter", "steam-exclude-filter"]);
  // 读取开发服务组原始节点排除筛选参数原始值。
  const rawDevNodeExcludeFilter = pickArg(args, ["devNodeExcludeFilter", "dev-node-exclude-filter", "developerNodeExcludeFilter", "developer-node-exclude-filter", "devExcludeFilter", "dev-exclude-filter"]);
  // 读取 GitHub 独立组协议排除参数原始值。
  const rawGithubNodeExcludeType = pickArg(args, ["githubNodeExcludeType", "github-node-exclude-type", "githubExcludeType", "github-exclude-type"]);
  // 读取 Steam 独立组协议排除参数原始值。
  const rawSteamNodeExcludeType = pickArg(args, ["steamNodeExcludeType", "steam-node-exclude-type", "steamExcludeType", "steam-exclude-type"]);
  // 读取开发服务组协议排除参数原始值。
  const rawDevNodeExcludeType = pickArg(args, ["devNodeExcludeType", "dev-node-exclude-type", "developerNodeExcludeType", "developer-node-exclude-type", "devExcludeType", "dev-exclude-type"]);
  // 读取 profile 缓存参数原始值。
  const rawProfileCache = pickArg(args, ["profileCache", "profile-cache", "cacheProfile", "cache-profile"]);
  // 读取 profile.store-selected 参数原始值。
  const rawProfileSelected = pickArg(args, ["profileSelected", "profile-selected", "storeSelected", "store-selected"]);
  // 读取 profile.store-fake-ip 参数原始值。
  const rawProfileFakeIp = pickArg(args, ["profileFakeIP", "profileFakeIp", "profile-fake-ip", "storeFakeIP", "storeFakeIp", "store-fake-ip"]);
  // 读取 geo 自动更新参数原始值。
  const rawGeoAutoUpdate = pickArg(args, ["geoAutoUpdate", "geo-auto-update", "geoUpdate", "geo-update"]);
  // 读取 geo 更新间隔参数原始值。
  const rawGeoUpdateInterval = pickArg(args, ["geoUpdateInterval", "geo-update-interval"]);
  // 读取全局 UA 参数原始值。
  const rawGlobalUa = pickArg(args, ["globalUA", "globalUa", "global-ua"]);
  // 读取调试响应头开关参数原始值。
  const rawResponseHeaders = pickArg(args, ["responseHeaders", "response-headers", "debugHeaders", "debug-headers", "resHeaders", "res-headers"]);
  // 读取调试响应头前缀参数原始值。
  const rawResponseHeaderPrefix = pickArg(args, ["responseHeaderPrefix", "response-header-prefix", "debugHeaderPrefix", "debug-header-prefix", "resHeaderPrefix", "res-header-prefix"]);
  // 读取 DNS prefer-h3 参数原始值。
  const rawDnsPreferH3 = pickArg(args, ["dnsPreferH3", "dns-prefer-h3", "preferH3", "prefer-h3"]);
  // 读取 DNS respect-rules 参数原始值。
  const rawDnsRespectRules = pickArg(args, ["dnsRespectRules", "dns-respect-rules", "respectRules", "respect-rules"]);
  // 读取 DNS cache-algorithm 参数原始值。
  const rawDnsCacheAlgorithm = pickArg(args, ["dnsCacheAlgorithm", "dns-cache-algorithm", "cacheAlgorithm", "cache-algorithm"]);
  // 读取 use-system-hosts 参数原始值。
  const rawDnsUseSystemHosts = pickArg(args, ["dnsUseSystemHosts", "dns-use-system-hosts", "useSystemHosts", "use-system-hosts"]);
  // 读取 DNS listen 参数原始值。
  const rawDnsListen = pickArg(args, ["dnsListen", "dns-listen"]);
  // 读取 fake-ip-filter-mode 参数原始值。
  const rawFakeIpFilterMode = pickArg(args, ["fakeIpFilterMode", "fake-ip-filter-mode"]);
  // 读取 fake-ip-ttl 参数原始值。
  const rawFakeIpTtl = pickArg(args, ["fakeIpTTL", "fakeIpTtl", "fake-ip-ttl"]);
  // 读取 fake-ip-range 参数原始值。
  const rawFakeIpRange = pickArg(args, ["fakeIpRange", "fake-ip-range"]);
  // 读取 fake-ip-range6 参数原始值。
  const rawFakeIpRange6 = pickArg(args, ["fakeIpRange6", "fake-ip-range6"]);
  // 读取 unified-delay 参数原始值。
  const rawUnifiedDelay = pickArg(args, ["unifiedDelay", "unified-delay"]);
  // 读取 tcp-concurrent 参数原始值。
  const rawTcpConcurrent = pickArg(args, ["tcpConcurrent", "tcp-concurrent"]);
  // 读取进程识别模式参数原始值。
  const rawProcessMode = pickArg(args, ["processMode", "process-mode", "findProcessMode", "find-process-mode"]);
  // 读取 geodata-loader 参数原始值。
  const rawGeodataLoader = pickArg(args, ["geodataLoader", "geodata-loader"]);
  // 读取 geodata-mode 参数原始值。
  const rawGeodataMode = pickArg(args, ["geodataMode", "geodata-mode"]);
  // 读取 Sniffer force-dns-mapping 参数原始值。
  const rawSnifferForceDnsMapping = pickArg(args, ["snifferForceDnsMapping", "sniffer-force-dns-mapping"]);
  // 读取 Sniffer parse-pure-ip 参数原始值。
  const rawSnifferParsePureIp = pickArg(args, ["snifferParsePureIp", "sniffer-parse-pure-ip"]);
  // 读取 Sniffer 全局 override-destination 参数原始值。
  const rawSnifferOverrideDestination = pickArg(args, ["snifferOverrideDestination", "sniffer-override-destination"]);
  // 读取 HTTP Sniffer override-destination 参数原始值。
  const rawSnifferHttpOverrideDestination = pickArg(args, ["snifferHttpOverrideDestination", "sniffer-http-override-destination"]);
  // 读取 Sniffer force-domain 追加参数原始值。
  const rawSnifferForceDomains = pickArg(args, ["snifferForceDomains", "sniffer-force-domains", "forceDomains", "force-domains"]);
  // 读取 Sniffer skip-domain 追加参数原始值。
  const rawSnifferSkipDomains = pickArg(args, ["snifferSkipDomains", "sniffer-skip-domains", "skipDomains", "skip-domains"]);
  // 尝试把 threshold 转成数字。
  const parsedThreshold = parseNumber(rawThreshold, 0);
  // 尝试把测速组 interval 转成数字。
  const parsedGroupInterval = parseNumber(rawGroupInterval, GROUP_INTERVAL);
  // 尝试把测速组 tolerance 转成数字。
  const parsedGroupTolerance = parseNumber(rawGroupTolerance, GROUP_TOLERANCE);
  // 尝试把测速组 timeout 转成数字。
  const parsedGroupTimeout = parseNumber(rawGroupTimeout, GROUP_TIMEOUT);
  // 尝试把测速组最大失败次数转成数字。
  const parsedGroupMaxFailedTimes = parseNumber(rawGroupMaxFailedTimes, GROUP_MAX_FAILED_TIMES);
  // 尝试把 geo 更新间隔转成数字。
  const parsedGeoUpdateInterval = parseNumber(rawGeoUpdateInterval, 24);
  // 尝试把 rule-provider 刷新间隔转成数字。
  const parsedRuleProviderInterval = parseNumber(rawRuleProviderInterval, RULE_INTERVAL);
  // 尝试把 rule-provider 大小限制转成数字。
  const parsedRuleProviderSizeLimit = parseNumber(rawRuleProviderSizeLimit, 0);
  // 尝试把 proxy-provider 刷新间隔转成数字。
  const parsedProxyProviderInterval = parseNumber(rawProxyProviderInterval, PROXY_PROVIDER_INTERVAL);
  // 尝试把 proxy-provider 大小限制转成数字。
  const parsedProxyProviderSizeLimit = parseNumber(rawProxyProviderSizeLimit, 0);
  // 尝试把 proxy-provider health-check interval 转成数字。
  const parsedProxyProviderHealthCheckInterval = parseNumber(rawProxyProviderHealthCheckInterval, GROUP_INTERVAL);
  // 尝试把 proxy-provider health-check timeout 转成数字。
  const parsedProxyProviderHealthCheckTimeout = parseNumber(rawProxyProviderHealthCheckTimeout, PROXY_PROVIDER_HEALTH_CHECK_TIMEOUT);
  // 尝试把 GitHub 独立组测速间隔转成数字。
  const parsedGithubGroupInterval = parseNumber(rawGithubGroupInterval, GROUP_INTERVAL);
  // 尝试把 Steam 独立组测速间隔转成数字。
  const parsedSteamGroupInterval = parseNumber(rawSteamGroupInterval, GROUP_INTERVAL);
  // 尝试把开发服务组测速间隔转成数字。
  const parsedDevGroupInterval = parseNumber(rawDevGroupInterval, GROUP_INTERVAL);
  // 尝试把 GitHub 独立组测速容差转成数字。
  const parsedGithubGroupTolerance = parseNumber(rawGithubGroupTolerance, GROUP_TOLERANCE);
  // 尝试把 Steam 独立组测速容差转成数字。
  const parsedSteamGroupTolerance = parseNumber(rawSteamGroupTolerance, GROUP_TOLERANCE);
  // 尝试把开发服务组测速容差转成数字。
  const parsedDevGroupTolerance = parseNumber(rawDevGroupTolerance, GROUP_TOLERANCE);
  // 尝试把 GitHub 独立组测速超时转成数字。
  const parsedGithubGroupTimeout = parseNumber(rawGithubGroupTimeout, GROUP_TIMEOUT);
  // 尝试把 Steam 独立组测速超时转成数字。
  const parsedSteamGroupTimeout = parseNumber(rawSteamGroupTimeout, GROUP_TIMEOUT);
  // 尝试把开发服务组测速超时转成数字。
  const parsedDevGroupTimeout = parseNumber(rawDevGroupTimeout, GROUP_TIMEOUT);
  // 尝试把 GitHub 独立组最大失败次数转成数字。
  const parsedGithubGroupMaxFailedTimes = parseNumber(rawGithubGroupMaxFailedTimes, GROUP_MAX_FAILED_TIMES);
  // 尝试把 Steam 独立组最大失败次数转成数字。
  const parsedSteamGroupMaxFailedTimes = parseNumber(rawSteamGroupMaxFailedTimes, GROUP_MAX_FAILED_TIMES);
  // 尝试把开发服务组最大失败次数转成数字。
  const parsedDevGroupMaxFailedTimes = parseNumber(rawDevGroupMaxFailedTimes, GROUP_MAX_FAILED_TIMES);
  // 尝试把 fake-ip-ttl 转成数字。
  const parsedFakeIpTtl = parseNumber(rawFakeIpTtl, 1);
  // 再把 threshold 限制在允许范围内。
  const threshold = clampNumber(parsedThreshold, 0, MAX_THRESHOLD);
  // 测速组 interval 至少为 1 秒。
  const groupInterval = Math.max(1, parsedGroupInterval);
  // 测速组 tolerance 允许为 0，但不能为负数。
  const groupTolerance = Math.max(0, parsedGroupTolerance);
  // 测速组 timeout 至少为 1 毫秒。
  const groupTimeout = Math.max(1, parsedGroupTimeout);
  // 健康检查最大失败次数至少为 1。
  const groupMaxFailedTimes = Math.max(1, parsedGroupMaxFailedTimes);
  // geo 更新间隔至少为 1 小时，避免生成非法配置。
  const geoUpdateInterval = Math.max(1, parsedGeoUpdateInterval);
  // rule-provider 刷新间隔至少为 1 秒，避免生成非法配置。
  const ruleProviderInterval = Math.max(1, parsedRuleProviderInterval);
  // rule-provider 大小限制最小为 0，0 表示不额外限制。
  const ruleProviderSizeLimit = Math.max(0, parsedRuleProviderSizeLimit);
  // proxy-provider 刷新间隔至少为 1 秒，避免生成非法配置。
  const proxyProviderInterval = Math.max(1, parsedProxyProviderInterval);
  // proxy-provider 大小限制最小为 0，0 表示不额外限制。
  const proxyProviderSizeLimit = Math.max(0, parsedProxyProviderSizeLimit);
  // proxy-provider health-check interval 至少为 1 秒。
  const proxyProviderHealthCheckInterval = Math.max(1, parsedProxyProviderHealthCheckInterval);
  // proxy-provider health-check timeout 至少为 1 毫秒。
  const proxyProviderHealthCheckTimeout = Math.max(1, parsedProxyProviderHealthCheckTimeout);
  // GitHub 独立组测速间隔至少为 1 秒。
  const githubGroupInterval = Math.max(1, parsedGithubGroupInterval);
  // Steam 独立组测速间隔至少为 1 秒。
  const steamGroupInterval = Math.max(1, parsedSteamGroupInterval);
  // 开发服务组测速间隔至少为 1 秒。
  const devGroupInterval = Math.max(1, parsedDevGroupInterval);
  // GitHub 独立组测速容差允许为 0。
  const githubGroupTolerance = Math.max(0, parsedGithubGroupTolerance);
  // Steam 独立组测速容差允许为 0。
  const steamGroupTolerance = Math.max(0, parsedSteamGroupTolerance);
  // 开发服务组测速容差允许为 0。
  const devGroupTolerance = Math.max(0, parsedDevGroupTolerance);
  // GitHub 独立组测速超时至少为 1。
  const githubGroupTimeout = Math.max(1, parsedGithubGroupTimeout);
  // Steam 独立组测速超时至少为 1。
  const steamGroupTimeout = Math.max(1, parsedSteamGroupTimeout);
  // 开发服务组测速超时至少为 1。
  const devGroupTimeout = Math.max(1, parsedDevGroupTimeout);
  // GitHub 独立组最大失败次数至少为 1。
  const githubGroupMaxFailedTimes = Math.max(1, parsedGithubGroupMaxFailedTimes);
  // Steam 独立组最大失败次数至少为 1。
  const steamGroupMaxFailedTimes = Math.max(1, parsedSteamGroupMaxFailedTimes);
  // 开发服务组最大失败次数至少为 1。
  const devGroupMaxFailedTimes = Math.max(1, parsedDevGroupMaxFailedTimes);
  // fake-ip-ttl 至少为 1，避免生成非法配置。
  const fakeIpTtl = Math.max(1, parsedFakeIpTtl);
  // 把字符串类参数统一做 trim，后面复用时就不用反复判断。
  const testUrl = normalizeStringArg(rawTestUrl);
  const rawNormalizedGroupExpectedStatus = normalizeExpectedStatusArg(rawGroupExpectedStatus);
  const groupExpectedStatus = isValidExpectedStatusValue(rawNormalizedGroupExpectedStatus) ? rawNormalizedGroupExpectedStatus : "";
  const groupStrategy = normalizeLoadBalanceStrategy(rawGroupStrategy, "");
  const groupInterfaceName = normalizeInterfaceNameArg(rawGroupInterfaceName);
  const groupRoutingMark = normalizeRoutingMarkArg(rawGroupRoutingMark);
  const dnsListen = normalizeStringArg(rawDnsListen);
  const fakeIpRange = normalizeStringArg(rawFakeIpRange);
  const fakeIpRange6 = normalizeStringArg(rawFakeIpRange6);
  const directListUrl = normalizeStringArg(rawDirectListUrl);
  const cryptoListUrl = normalizeStringArg(rawCryptoListUrl);
  const chatGptListUrl = normalizeStringArg(rawChatGptListUrl);
  const aiExtraListUrl = normalizeStringArg(rawAiExtraListUrl);
  const ruleSourcePreset = normalizeRuleSourcePreset(rawRuleSourcePreset, DEFAULT_RULE_SOURCE_PRESET);
  const steamFixUrl = normalizeStringArg(rawSteamFixUrl);
  const ruleProviderPathDir = normalizeRuleProviderPathDir(rawRuleProviderPathDir);
  const ruleProviderProxy = normalizeStringArg(rawRuleProviderProxy);
  const ruleProviderUserAgent = normalizeStringArg(rawRuleProviderUserAgent);
  const ruleProviderAuthorization = normalizeStringArg(rawRuleProviderAuthorization);
  const parsedRuleProviderHeaderEntries = parseProviderHeaderEntries(rawRuleProviderHeader);
  const ruleProviderHeader = parsedRuleProviderHeaderEntries.headers;
  const parsedRuleProviderPayload = parseRuleProviderPayload(rawRuleProviderPayload);
  const ruleProviderPayload = parsedRuleProviderPayload.items;
  const proxyProviderProxy = normalizeStringArg(rawProxyProviderProxy);
  const proxyProviderUserAgent = normalizeStringArg(rawProxyProviderUserAgent);
  const proxyProviderAuthorization = normalizeStringArg(rawProxyProviderAuthorization);
  const parsedProxyProviderHeaderEntries = parseProviderHeaderEntries(rawProxyProviderHeader);
  const proxyProviderHeader = parsedProxyProviderHeaderEntries.headers;
  const parsedProxyProviderPayload = parseProxyProviderPayload(rawProxyProviderPayload);
  const proxyProviderPayload = parsedProxyProviderPayload.items;
  const proxyProviderPathDir = normalizeProxyProviderPathDir(rawProxyProviderPathDir);
  const proxyProviderFilter = normalizeStringArg(rawProxyProviderFilter);
  const proxyProviderExcludeFilter = normalizeStringArg(rawProxyProviderExcludeFilter);
  const proxyProviderExcludeType = normalizeTypeListArg(rawProxyProviderExcludeType);
  const proxyProviderOverrideAdditionalPrefix = normalizeStringArg(rawProxyProviderOverrideAdditionalPrefix);
  const proxyProviderOverrideAdditionalSuffix = normalizeStringArg(rawProxyProviderOverrideAdditionalSuffix);
  const proxyProviderOverrideDown = normalizeStringArg(rawProxyProviderOverrideDown);
  const proxyProviderOverrideUp = normalizeStringArg(rawProxyProviderOverrideUp);
  const proxyProviderOverrideDialerProxy = normalizeStringArg(rawProxyProviderOverrideDialerProxy);
  const proxyProviderOverrideInterfaceName = normalizeInterfaceNameArg(rawProxyProviderOverrideInterfaceName);
  const proxyProviderOverrideRoutingMark = normalizeRoutingMarkArg(rawProxyProviderOverrideRoutingMark);
  const proxyProviderOverrideIpVersion = normalizeIpVersionArg(rawProxyProviderOverrideIpVersion, "");
  const parsedProxyProviderOverrideProxyNameRules = parseProxyNameOverrideRules(rawProxyProviderOverrideProxyName);
  const proxyProviderOverrideProxyNameRules = parsedProxyProviderOverrideProxyNameRules.filter((rule) => {
    try {
      compilePatternRegExp(rule.pattern);
      return true;
    } catch (error) {
      return false;
    }
  });
  const proxyProviderHealthCheckUrl = normalizeStringArg(rawProxyProviderHealthCheckUrl);
  const rawNormalizedProxyProviderHealthCheckExpectedStatus = normalizeExpectedStatusArg(rawProxyProviderHealthCheckExpectedStatus);
  const proxyProviderHealthCheckExpectedStatus = isValidExpectedStatusValue(rawNormalizedProxyProviderHealthCheckExpectedStatus) ? rawNormalizedProxyProviderHealthCheckExpectedStatus : "";
  const githubTestUrl = normalizeStringArg(rawGithubTestUrl);
  const steamTestUrl = normalizeStringArg(rawSteamTestUrl);
  const devTestUrl = normalizeStringArg(rawDevTestUrl);
  const rawNormalizedGithubGroupExpectedStatus = normalizeExpectedStatusArg(rawGithubGroupExpectedStatus);
  const githubGroupExpectedStatus = isValidExpectedStatusValue(rawNormalizedGithubGroupExpectedStatus) ? rawNormalizedGithubGroupExpectedStatus : "";
  const githubGroupStrategy = normalizeLoadBalanceStrategy(rawGithubGroupStrategy, "");
  const rawNormalizedSteamGroupExpectedStatus = normalizeExpectedStatusArg(rawSteamGroupExpectedStatus);
  const steamGroupExpectedStatus = isValidExpectedStatusValue(rawNormalizedSteamGroupExpectedStatus) ? rawNormalizedSteamGroupExpectedStatus : "";
  const steamGroupStrategy = normalizeLoadBalanceStrategy(rawSteamGroupStrategy, "");
  const rawNormalizedDevGroupExpectedStatus = normalizeExpectedStatusArg(rawDevGroupExpectedStatus);
  const devGroupExpectedStatus = isValidExpectedStatusValue(rawNormalizedDevGroupExpectedStatus) ? rawNormalizedDevGroupExpectedStatus : "";
  const devGroupStrategy = normalizeLoadBalanceStrategy(rawDevGroupStrategy, "");
  const githubInterfaceName = normalizeInterfaceNameArg(rawGithubInterfaceName);
  const steamInterfaceName = normalizeInterfaceNameArg(rawSteamInterfaceName);
  const devInterfaceName = normalizeInterfaceNameArg(rawDevInterfaceName);
  const githubRoutingMark = normalizeRoutingMarkArg(rawGithubRoutingMark);
  const steamRoutingMark = normalizeRoutingMarkArg(rawSteamRoutingMark);
  const devRoutingMark = normalizeRoutingMarkArg(rawDevRoutingMark);
  const githubUseProviders = toStringList(rawGithubUseProviders);
  const steamUseProviders = toStringList(rawSteamUseProviders);
  const devUseProviders = toStringList(rawDevUseProviders);
  const githubIcon = normalizeStringArg(rawGithubIcon);
  const steamIcon = normalizeStringArg(rawSteamIcon);
  const devIcon = normalizeStringArg(rawDevIcon);
  const githubNodeFilter = normalizeStringArg(rawGithubNodeFilter);
  const steamNodeFilter = normalizeStringArg(rawSteamNodeFilter);
  const devNodeFilter = normalizeStringArg(rawDevNodeFilter);
  const githubNodeExcludeFilter = normalizeStringArg(rawGithubNodeExcludeFilter);
  const steamNodeExcludeFilter = normalizeStringArg(rawSteamNodeExcludeFilter);
  const devNodeExcludeFilter = normalizeStringArg(rawDevNodeExcludeFilter);
  const githubNodeExcludeType = normalizeTypeListArg(rawGithubNodeExcludeType);
  const steamNodeExcludeType = normalizeTypeListArg(rawSteamNodeExcludeType);
  const devNodeExcludeType = normalizeTypeListArg(rawDevNodeExcludeType);
  const aiPreferCountries = toStringList(rawAiPreferCountries);
  const cryptoPreferCountries = toStringList(rawCryptoPreferCountries);
  const githubPreferCountries = toStringList(rawGithubPreferCountries);
  const steamPreferCountries = toStringList(rawSteamPreferCountries);
  const devPreferCountries = toStringList(rawDevPreferCountries);
  const parsedCountryExtraAliases = parseCountryExtraAliasEntries(rawCountryExtraAliases);
  const countryExtraAliasesMap = parsedCountryExtraAliases.map;
  const countryExtraAliasAnalysis = analyzeCountryExtraAliasMap(countryExtraAliasesMap);
  const countryExtraAliasCountryCount = Object.keys(countryExtraAliasesMap).length;
  const countryExtraAliasEntryCount = Object.keys(countryExtraAliasesMap).reduce((total, key) => total + countryExtraAliasesMap[key].length, 0);
  const countryExtraAliasPreview = formatCountryExtraAliasPreview(countryExtraAliasesMap, 4, 2, 18);
  const countryExtraAliasConflictCount = countryExtraAliasAnalysis.conflicts.length;
  const countryExtraAliasConflictPreview = formatCountryExtraAliasConflictPreview(countryExtraAliasAnalysis.conflicts, 4, 32);
  const githubPreferGroups = toStringList(rawGithubPreferGroups);
  const steamPreferGroups = toStringList(rawSteamPreferGroups);
  const devPreferGroups = toStringList(rawDevPreferGroups);
  const githubPreferNodes = toExplicitNameList(rawGithubPreferNodes);
  const steamPreferNodes = toExplicitNameList(rawSteamPreferNodes);
  const devPreferNodes = toExplicitNameList(rawDevPreferNodes);
  const githubRuleTarget = normalizeStringArg(rawGithubRuleTarget);
  const steamRuleTarget = normalizeStringArg(rawSteamRuleTarget);
  const steamCnRuleTarget = normalizeStringArg(rawSteamCnRuleTarget);
  const devRuleTarget = normalizeStringArg(rawDevRuleTarget);
  const githubRuleAnchor = normalizeStringArg(rawGithubRuleAnchor);
  const githubRulePosition = normalizeRuleOrderPosition(rawGithubRulePosition, "before");
  const steamRuleAnchor = normalizeStringArg(rawSteamRuleAnchor);
  const steamRulePosition = normalizeRuleOrderPosition(rawSteamRulePosition, "before");
  const steamCnRuleAnchor = normalizeStringArg(rawSteamCnRuleAnchor);
  const steamCnRulePosition = normalizeRuleOrderPosition(rawSteamCnRulePosition, "before");
  const devRuleAnchor = normalizeStringArg(rawDevRuleAnchor);
  const devRulePosition = normalizeRuleOrderPosition(rawDevRulePosition, "before");
  const customRuleAnchor = normalizeStringArg(rawCustomRuleAnchor);
  const customRulePosition = normalizeRuleOrderPosition(rawCustomRulePosition, "before");
  const githubMode = normalizeServiceGroupMode(rawGithubMode, "select");
  const steamMode = normalizeServiceGroupMode(rawSteamMode, "direct");
  const devMode = normalizeServiceGroupMode(rawDevMode, "select");
  const githubType = normalizeServiceGroupType(rawGithubType, "select");
  const steamType = normalizeServiceGroupType(rawSteamType, "select");
  const devType = normalizeServiceGroupType(rawDevType, "select");
  const groupOrderPreset = normalizeGroupOrderPreset(rawGroupOrderPreset, DEFAULT_GROUP_ORDER_PRESET);
  const groupOrder = toStringList(rawGroupOrder);
  const countryGroupSort = normalizeGeoGroupSortMode(rawCountryGroupSort, "definition");
  const regionGroupSort = normalizeGeoGroupSortMode(rawRegionGroupSort, "definition");
  const parsedRegionGroups = parseRegionGroupKeys(rawRegionGroups);
  const regionGroupKeys = parsedRegionGroups.keys;
  const regionGroupPreview = formatRegionGroupPreview(regionGroupKeys);
  const snifferForceDomains = toStringList(rawSnifferForceDomains);
  const snifferSkipDomains = toStringList(rawSnifferSkipDomains);
  const responseHeaderPrefix = normalizeHeaderPrefix(rawResponseHeaderPrefix);

  // 如果用户传入值被修正了，就打印一条警告帮助定位问题。
  if (parsedThreshold !== threshold) {
    console.warn(`⚠️ 警告: threshold 超出范围，已重置为 ${threshold}`);
  }

  // 如果测速组 interval 被修正，也打印提示。
  if (rawGroupInterval !== undefined && parsedGroupInterval !== groupInterval) {
    console.warn(`⚠️ 警告: group-interval 无效，已重置为 ${groupInterval}`);
  }

  // 如果测速组 tolerance 被修正，也打印提示。
  if (rawGroupTolerance !== undefined && parsedGroupTolerance !== groupTolerance) {
    console.warn(`⚠️ 警告: group-tolerance 无效，已重置为 ${groupTolerance}`);
  }

  // 如果测速组 timeout 被修正，也打印提示。
  if (rawGroupTimeout !== undefined && parsedGroupTimeout !== groupTimeout) {
    console.warn(`⚠️ 警告: group-timeout 无效，已重置为 ${groupTimeout}`);
  }

  // 如果全局 load-balance strategy 非法，则回退默认值并提示。
  if (rawGroupStrategy !== undefined && !groupStrategy) {
    console.warn("⚠️ 警告: group-strategy 无效，已回退为默认策略");
  }

  // 如果全局 interface-name 传了空值或非法值，则提示已经忽略。
  if (rawGroupInterfaceName !== undefined && !groupInterfaceName) {
    console.warn("⚠️ 警告: group-interface-name 为空，已忽略");
  }

  // 如果全局 routing-mark 非法，则显式提示帮助排查。
  if (rawGroupRoutingMark !== undefined && groupRoutingMark === null) {
    console.warn("⚠️ 警告: group-routing-mark 仅支持大于等于 0 的整数，已忽略");
  }

  // 如果测速组最大失败次数被修正，也打印提示。
  if (rawGroupMaxFailedTimes !== undefined && parsedGroupMaxFailedTimes !== groupMaxFailedTimes) {
    console.warn(`⚠️ 警告: group-max-failed-times 无效，已重置为 ${groupMaxFailedTimes}`);
  }

  // 如果全局 expected-status 语法非法，则回退默认值并提示。
  if (rawGroupExpectedStatus !== undefined && rawNormalizedGroupExpectedStatus && !groupExpectedStatus) {
    console.warn("⚠️ 警告: group-expected-status 语法无效，已回退为默认值");
  }

  // 如果自定义规则源 URL 看起来不像 http(s)，打印提示帮助定位问题。
  if (directListUrl && !looksLikeHttpUrl(directListUrl)) {
    console.warn(`⚠️ 警告: direct-list-url 看起来不像合法 http(s) 地址: ${directListUrl}`);
  }

  if (cryptoListUrl && !looksLikeHttpUrl(cryptoListUrl)) {
    console.warn(`⚠️ 警告: crypto-list-url 看起来不像合法 http(s) 地址: ${cryptoListUrl}`);
  }

  if (chatGptListUrl && !looksLikeHttpUrl(chatGptListUrl)) {
    console.warn(`⚠️ 警告: chatgpt-list-url 看起来不像合法 http(s) 地址: ${chatGptListUrl}`);
  }

  if (aiExtraListUrl && !looksLikeHttpUrl(aiExtraListUrl)) {
    console.warn(`⚠️ 警告: ai-extra-list-url 看起来不像合法 http(s) 地址: ${aiExtraListUrl}`);
  }

  // 如果自定义国家别名参数传了值，但最终一个有效条目都没解析出来，则显式提示正确写法。
  if (rawCountryExtraAliases !== undefined && hasUsableArgValue(rawCountryExtraAliases) && !countryExtraAliasCountryCount) {
    console.warn("⚠️ 警告: country-extra-aliases 未解析出任何有效条目，已忽略；请使用 国家:别名1|别名2;国家2:别名3 这种写法");
  }

  // 逐条提示 country-extra-aliases 里格式不合法的项，帮助定位拼写问题。
  for (const item of parsedCountryExtraAliases.invalidEntries) {
    console.warn(`⚠️ 警告: country-extra-aliases 条目无效，已忽略: ${item}`);
  }

  // 逐条提示没有命中内置国家定义的国家标记，避免自定义别名 silently fail。
  for (const item of parsedCountryExtraAliases.unknownCountryMarkers) {
    console.warn(`⚠️ 警告: country-extra-aliases 未匹配到内置国家定义，已忽略: ${item}`);
  }

  // 逐条提示 country-extra-aliases 自身的冲突条目，避免一个别名被多个国家复用导致识别歧义。
  for (const item of countryExtraAliasAnalysis.customDuplicateConflicts) {
    console.warn(`⚠️ 警告: country-extra-aliases 同一别名指向多个国家，可能导致识别歧义: ${item}`);
  }

  // 逐条提示自定义别名撞到其他国家内置标记的情况，便于及时收敛配置。
  for (const item of countryExtraAliasAnalysis.builtInMarkerConflicts) {
    console.warn(`⚠️ 警告: country-extra-aliases 别名与其他内置国家标记冲突，可能导致优先链歧义: ${item}`);
  }

  if (githubTestUrl && !looksLikeHttpUrl(githubTestUrl)) {
    console.warn(`⚠️ 警告: github-test-url 看起来不像合法 http(s) 地址: ${githubTestUrl}`);
  }

  if (steamTestUrl && !looksLikeHttpUrl(steamTestUrl)) {
    console.warn(`⚠️ 警告: steam-test-url 看起来不像合法 http(s) 地址: ${steamTestUrl}`);
  }

  if (devTestUrl && !looksLikeHttpUrl(devTestUrl)) {
    console.warn(`⚠️ 警告: dev-test-url 看起来不像合法 http(s) 地址: ${devTestUrl}`);
  }

  // 如果 rule-provider 路径目录传了空值，则回退默认目录并提示。
  if (rawRuleProviderPathDir !== undefined && !normalizeStringArg(rawRuleProviderPathDir)) {
    console.warn(`⚠️ 警告: rule-provider-path-dir 为空，已回退为默认目录 ${RULE_PROVIDER_PATH_DIR}`);
  }

  // 如果 rule-provider 自定义请求头完全没解析成功，则显式提示正确写法。
  if (rawRuleProviderHeader !== undefined && hasUsableArgValue(rawRuleProviderHeader) && !parsedRuleProviderHeaderEntries.entries.length) {
    console.warn("⚠️ 警告: rule-provider-header 语法无效，已忽略；请使用 Header: value||Header2: value2");
  }

  // 逐条提示 rule-provider 自定义请求头里的无效项，帮助定位拼写问题。
  for (const item of parsedRuleProviderHeaderEntries.invalidLines) {
    console.warn(`⚠️ 警告: rule-provider-header 条目无效，已忽略: ${item}`);
  }

  // 如果 rule-provider payload 完全没解析成功，则显式提示正确写法。
  if (rawRuleProviderPayload !== undefined && hasUsableArgValue(rawRuleProviderPayload) && !ruleProviderPayload.length) {
    const reason = parsedRuleProviderPayload.parseFailed
      ? "请使用 JSON 数组、换行或 || 分隔的规则列表"
      : "请至少提供一条非空规则字符串";
    console.warn(`⚠️ 警告: rule-provider-payload 无有效规则，已忽略；${reason}`);
  }

  // 逐条提示 rule-provider payload 里无效的规则项，帮助定位数组结构问题。
  for (const item of parsedRuleProviderPayload.invalidItems) {
    console.warn(`⚠️ 警告: rule-provider-payload 条目无效，已忽略: ${item}`);
  }

  // 如果 proxy-provider 路径目录传了空值，则忽略本轮目录接管并提示。
  if (rawProxyProviderPathDir !== undefined && !normalizeStringArg(rawProxyProviderPathDir)) {
    console.warn("⚠️ 警告: proxy-provider-path-dir 为空，已忽略本轮缓存目录接管");
  }

  // 如果 proxy-provider 路径目录看起来无效，则显式提示本轮不会生效。
  if (rawProxyProviderPathDir !== undefined && hasUsableArgValue(rawProxyProviderPathDir) && !proxyProviderPathDir) {
    console.warn(`⚠️ 警告: proxy-provider-path-dir 无效，已忽略: ${rawProxyProviderPathDir}`);
  }

  // 如果 proxy-provider 自定义请求头完全没解析成功，则显式提示正确写法。
  if (rawProxyProviderHeader !== undefined && hasUsableArgValue(rawProxyProviderHeader) && !parsedProxyProviderHeaderEntries.entries.length) {
    console.warn("⚠️ 警告: proxy-provider-header 语法无效，已忽略；请使用 Header: value||Header2: value2");
  }

  // 逐条提示 proxy-provider 自定义请求头里无效的项，帮助定位拼写问题。
  for (const item of parsedProxyProviderHeaderEntries.invalidLines) {
    console.warn(`⚠️ 警告: proxy-provider-header 条目无效，已忽略: ${item}`);
  }

  // 如果 proxy-provider payload 完全没解析成功，则提示应改为 JSON 数组/对象写法。
  if (rawProxyProviderPayload !== undefined && hasUsableArgValue(rawProxyProviderPayload) && !proxyProviderPayload.length) {
    const reason = parsedProxyProviderPayload.parseFailed
      ? "请使用 JSON 数组/对象写法"
      : "请至少提供带 name/type 的节点对象";
    console.warn(`⚠️ 警告: proxy-provider-payload 无有效节点，已忽略；${reason}`);
  }

  // 逐条提示 proxy-provider payload 里无效的节点项，帮助定位字段缺失。
  for (const item of parsedProxyProviderPayload.invalidItems) {
    console.warn(`⚠️ 警告: proxy-provider-payload 条目无效，已忽略: ${item}`);
  }

  // 如果 geo 更新间隔被修正，也打印提示。
  if (rawGeoUpdateInterval !== undefined && parsedGeoUpdateInterval !== geoUpdateInterval) {
    console.warn(`⚠️ 警告: geo-update-interval 无效，已重置为 ${geoUpdateInterval}`);
  }

  // 如果 rule-provider 刷新间隔被修正，也打印提示。
  if (rawRuleProviderInterval !== undefined && parsedRuleProviderInterval !== ruleProviderInterval) {
    console.warn(`⚠️ 警告: rule-provider-interval 无效，已重置为 ${ruleProviderInterval}`);
  }

  // 如果 rule-provider 大小限制被修正，也打印提示。
  if (rawRuleProviderSizeLimit !== undefined && parsedRuleProviderSizeLimit !== ruleProviderSizeLimit) {
    console.warn(`⚠️ 警告: rule-provider-size-limit 无效，已重置为 ${ruleProviderSizeLimit}`);
  }

  // 如果 proxy-provider 刷新间隔被修正，也打印提示。
  if (rawProxyProviderInterval !== undefined && parsedProxyProviderInterval !== proxyProviderInterval) {
    console.warn(`⚠️ 警告: proxy-provider-interval 无效，已重置为 ${proxyProviderInterval}`);
  }

  // 如果 proxy-provider 大小限制被修正，也打印提示。
  if (rawProxyProviderSizeLimit !== undefined && parsedProxyProviderSizeLimit !== proxyProviderSizeLimit) {
    console.warn(`⚠️ 警告: proxy-provider-size-limit 无效，已重置为 ${proxyProviderSizeLimit}`);
  }

  // 如果 proxy-provider health-check interval 被修正，也打印提示。
  if (rawProxyProviderHealthCheckInterval !== undefined && parsedProxyProviderHealthCheckInterval !== proxyProviderHealthCheckInterval) {
    console.warn(`⚠️ 警告: proxy-provider-health-check-interval 无效，已重置为 ${proxyProviderHealthCheckInterval}`);
  }

  // 如果 proxy-provider health-check timeout 被修正，也打印提示。
  if (rawProxyProviderHealthCheckTimeout !== undefined && parsedProxyProviderHealthCheckTimeout !== proxyProviderHealthCheckTimeout) {
    console.warn(`⚠️ 警告: proxy-provider-health-check-timeout 无效，已重置为 ${proxyProviderHealthCheckTimeout}`);
  }

  // 如果 proxy-provider health-check URL 看起来不像 http(s)，打印提示帮助定位问题。
  if (proxyProviderHealthCheckUrl && !looksLikeHttpUrl(proxyProviderHealthCheckUrl)) {
    console.warn(`⚠️ 警告: proxy-provider-health-check-url 看起来不像合法 http(s) 地址: ${proxyProviderHealthCheckUrl}`);
  }

  // 如果 proxy-provider health-check expected-status 语法非法，则回退为空并提示。
  if (rawProxyProviderHealthCheckExpectedStatus !== undefined && rawNormalizedProxyProviderHealthCheckExpectedStatus && !proxyProviderHealthCheckExpectedStatus) {
    console.warn("⚠️ 警告: proxy-provider-health-check-expected-status 语法无效，已忽略");
  }

  // 如果 proxy-provider filter 正则无法编译，则提前提示。
  if (rawProxyProviderFilter !== undefined && proxyProviderFilter) {
    try {
      compilePatternRegExp(proxyProviderFilter);
    } catch (error) {
      console.warn(`⚠️ 警告: proxy-provider-filter 正则无效: ${error.message}`);
    }
  }

  // 如果 proxy-provider exclude-filter 正则无法编译，则提前提示。
  if (rawProxyProviderExcludeFilter !== undefined && proxyProviderExcludeFilter) {
    try {
      compilePatternRegExp(proxyProviderExcludeFilter);
    } catch (error) {
      console.warn(`⚠️ 警告: proxy-provider-exclude-filter 正则无效: ${error.message}`);
    }
  }

  // 如果 proxy-provider exclude-type 清洗后为空，则提醒用户参数未生效。
  if (rawProxyProviderExcludeType !== undefined && normalizeStringArg(rawProxyProviderExcludeType) && !proxyProviderExcludeType) {
    console.warn("⚠️ 警告: proxy-provider-exclude-type 为空或格式无效，已忽略");
  }

  // Mihomo 官方文档说明 exclude-type 不支持正则；若看起来像正则语法则提前提醒。
  if (rawProxyProviderExcludeType !== undefined && /[()[\]{}*+?^$\\]/.test(normalizeStringArg(rawProxyProviderExcludeType))) {
    console.warn("⚠️ 警告: proxy-provider-exclude-type 不支持正则，请只保留类型名并使用 | 分隔");
  }

  // 如果 proxy-provider override udp 写法不像布尔量，则显式提示。
  if (rawProxyProviderOverrideUdp !== undefined && !isBooleanLike(rawProxyProviderOverrideUdp)) {
    console.warn("⚠️ 警告: proxy-provider-override-udp 仅支持布尔值，已回退为 false");
  }

  // 如果 proxy-provider override udp-over-tcp 写法不像布尔量，则显式提示。
  if (rawProxyProviderOverrideUdpOverTcp !== undefined && !isBooleanLike(rawProxyProviderOverrideUdpOverTcp)) {
    console.warn("⚠️ 警告: proxy-provider-override-udp-over-tcp 仅支持布尔值，已回退为 false");
  }

  // 如果 proxy-provider override down 为空，则提示已忽略。
  if (rawProxyProviderOverrideDown !== undefined && !proxyProviderOverrideDown) {
    console.warn("⚠️ 警告: proxy-provider-override-down 为空，已忽略");
  }

  // 如果 proxy-provider override up 为空，则提示已忽略。
  if (rawProxyProviderOverrideUp !== undefined && !proxyProviderOverrideUp) {
    console.warn("⚠️ 警告: proxy-provider-override-up 为空，已忽略");
  }

  // 如果 proxy-provider override tfo 写法不像布尔量，则显式提示。
  if (rawProxyProviderOverrideTfo !== undefined && !isBooleanLike(rawProxyProviderOverrideTfo)) {
    console.warn("⚠️ 警告: proxy-provider-override-tfo 仅支持布尔值，已回退为 false");
  }

  // 如果 proxy-provider override mptcp 写法不像布尔量，则显式提示。
  if (rawProxyProviderOverrideMptcp !== undefined && !isBooleanLike(rawProxyProviderOverrideMptcp)) {
    console.warn("⚠️ 警告: proxy-provider-override-mptcp 仅支持布尔值，已回退为 false");
  }

  // 如果 proxy-provider override skip-cert-verify 写法不像布尔量，则显式提示。
  if (rawProxyProviderOverrideSkipCertVerify !== undefined && !isBooleanLike(rawProxyProviderOverrideSkipCertVerify)) {
    console.warn("⚠️ 警告: proxy-provider-override-skip-cert-verify 仅支持布尔值，已回退为 false");
  }

  // 如果 proxy-provider override interface-name 为空，则提示已忽略。
  if (rawProxyProviderOverrideInterfaceName !== undefined && !proxyProviderOverrideInterfaceName) {
    console.warn("⚠️ 警告: proxy-provider-override-interface-name 为空，已忽略");
  }

  // 如果 proxy-provider override routing-mark 非法，则显式提示。
  if (rawProxyProviderOverrideRoutingMark !== undefined && proxyProviderOverrideRoutingMark === null) {
    console.warn("⚠️ 警告: proxy-provider-override-routing-mark 仅支持大于等于 0 的整数，已忽略");
  }

  // 如果 proxy-provider override ip-version 非法，则显式提示。
  if (rawProxyProviderOverrideIpVersion !== undefined && normalizeStringArg(rawProxyProviderOverrideIpVersion) && !proxyProviderOverrideIpVersion) {
    console.warn("⚠️ 警告: proxy-provider-override-ip-version 无效，已忽略");
  }

  // 如果 proxy-provider override proxy-name 规则未解析出任何有效项，则显式提示。
  if (rawProxyProviderOverrideProxyName !== undefined && hasUsableArgValue(rawProxyProviderOverrideProxyName) && !proxyProviderOverrideProxyNameRules.length) {
    console.warn("⚠️ 警告: proxy-provider-override-proxy-name 语法无效，已忽略；请使用 pattern=>target||pattern2=>target2");
  }

  // 逐条校验 proxy-provider override proxy-name 的正则是否可编译。
  for (const rule of parsedProxyProviderOverrideProxyNameRules) {
    try {
      compilePatternRegExp(rule.pattern);
    } catch (error) {
      console.warn(`⚠️ 警告: proxy-provider-override-proxy-name 正则无效 (${rule.pattern}): ${error.message}`);
    }
  }

  // 如果 GitHub 独立组测速间隔被修正，也打印提示。
  if (rawGithubGroupInterval !== undefined && parsedGithubGroupInterval !== githubGroupInterval) {
    console.warn(`⚠️ 警告: github-group-interval 无效，已重置为 ${githubGroupInterval}`);
  }

  // 如果 Steam 独立组测速间隔被修正，也打印提示。
  if (rawSteamGroupInterval !== undefined && parsedSteamGroupInterval !== steamGroupInterval) {
    console.warn(`⚠️ 警告: steam-group-interval 无效，已重置为 ${steamGroupInterval}`);
  }

  // 如果开发服务组测速间隔被修正，也打印提示。
  if (rawDevGroupInterval !== undefined && parsedDevGroupInterval !== devGroupInterval) {
    console.warn(`⚠️ 警告: dev-group-interval 无效，已重置为 ${devGroupInterval}`);
  }

  // 如果 GitHub 独立组测速容差被修正，也打印提示。
  if (rawGithubGroupTolerance !== undefined && parsedGithubGroupTolerance !== githubGroupTolerance) {
    console.warn(`⚠️ 警告: github-group-tolerance 无效，已重置为 ${githubGroupTolerance}`);
  }

  // 如果 Steam 独立组测速容差被修正，也打印提示。
  if (rawSteamGroupTolerance !== undefined && parsedSteamGroupTolerance !== steamGroupTolerance) {
    console.warn(`⚠️ 警告: steam-group-tolerance 无效，已重置为 ${steamGroupTolerance}`);
  }

  // 如果开发服务组测速容差被修正，也打印提示。
  if (rawDevGroupTolerance !== undefined && parsedDevGroupTolerance !== devGroupTolerance) {
    console.warn(`⚠️ 警告: dev-group-tolerance 无效，已重置为 ${devGroupTolerance}`);
  }

  // 如果 GitHub 独立组测速超时被修正，也打印提示。
  if (rawGithubGroupTimeout !== undefined && parsedGithubGroupTimeout !== githubGroupTimeout) {
    console.warn(`⚠️ 警告: github-group-timeout 无效，已重置为 ${githubGroupTimeout}`);
  }

  // 如果 Steam 独立组测速超时被修正，也打印提示。
  if (rawSteamGroupTimeout !== undefined && parsedSteamGroupTimeout !== steamGroupTimeout) {
    console.warn(`⚠️ 警告: steam-group-timeout 无效，已重置为 ${steamGroupTimeout}`);
  }

  // 如果开发服务组测速超时被修正，也打印提示。
  if (rawDevGroupTimeout !== undefined && parsedDevGroupTimeout !== devGroupTimeout) {
    console.warn(`⚠️ 警告: dev-group-timeout 无效，已重置为 ${devGroupTimeout}`);
  }

  // 如果 GitHub 独立组最大失败次数被修正，也打印提示。
  if (rawGithubGroupMaxFailedTimes !== undefined && parsedGithubGroupMaxFailedTimes !== githubGroupMaxFailedTimes) {
    console.warn(`⚠️ 警告: github-group-max-failed-times 无效，已重置为 ${githubGroupMaxFailedTimes}`);
  }

  // 如果 Steam 独立组最大失败次数被修正，也打印提示。
  if (rawSteamGroupMaxFailedTimes !== undefined && parsedSteamGroupMaxFailedTimes !== steamGroupMaxFailedTimes) {
    console.warn(`⚠️ 警告: steam-group-max-failed-times 无效，已重置为 ${steamGroupMaxFailedTimes}`);
  }

  // 如果开发服务组最大失败次数被修正，也打印提示。
  if (rawDevGroupMaxFailedTimes !== undefined && parsedDevGroupMaxFailedTimes !== devGroupMaxFailedTimes) {
    console.warn(`⚠️ 警告: dev-group-max-failed-times 无效，已重置为 ${devGroupMaxFailedTimes}`);
  }

  // 如果 GitHub 模式非法，则回退默认值并提示。
  if (rawGithubMode !== undefined && normalizeStringArg(rawGithubMode).toLowerCase() !== githubMode) {
    console.warn(`⚠️ 警告: github-mode 无效，已重置为 ${githubMode}`);
  }

  // 如果 Steam 模式非法，则回退默认值并提示。
  if (rawSteamMode !== undefined && normalizeStringArg(rawSteamMode).toLowerCase() !== steamMode) {
    console.warn(`⚠️ 警告: steam-mode 无效，已重置为 ${steamMode}`);
  }

  // 如果开发服务组模式非法，则回退默认值并提示。
  if (rawDevMode !== undefined && normalizeStringArg(rawDevMode).toLowerCase() !== devMode) {
    console.warn(`⚠️ 警告: dev-mode 无效，已重置为 ${devMode}`);
  }

  // 如果 GitHub 组类型非法，则回退默认值并提示。
  if (rawGithubType !== undefined && normalizeStringArg(rawGithubType).toLowerCase() !== githubType) {
    console.warn(`⚠️ 警告: github-type 无效，已重置为 ${githubType}`);
  }

  // 如果 Steam 组类型非法，则回退默认值并提示。
  if (rawSteamType !== undefined && normalizeStringArg(rawSteamType).toLowerCase() !== steamType) {
    console.warn(`⚠️ 警告: steam-type 无效，已重置为 ${steamType}`);
  }

  // 如果开发服务组类型非法，则回退默认值并提示。
  if (rawDevType !== undefined && normalizeStringArg(rawDevType).toLowerCase() !== devType) {
    console.warn(`⚠️ 警告: dev-type 无效，已重置为 ${devType}`);
  }

  // 如果 GitHub 独立组 strategy 非法，则回退默认值并提示。
  if (rawGithubGroupStrategy !== undefined && !githubGroupStrategy) {
    console.warn("⚠️ 警告: github-group-strategy 无效，已回退为默认策略");
  }

  // 如果 Steam 独立组 strategy 非法，则回退默认值并提示。
  if (rawSteamGroupStrategy !== undefined && !steamGroupStrategy) {
    console.warn("⚠️ 警告: steam-group-strategy 无效，已回退为默认策略");
  }

  // 如果开发服务组 strategy 非法，则回退默认值并提示。
  if (rawDevGroupStrategy !== undefined && !devGroupStrategy) {
    console.warn("⚠️ 警告: dev-group-strategy 无效，已回退为默认策略");
  }

  // 如果 GitHub 独立组 expected-status 语法非法，则回退默认值并提示。
  if (rawGithubGroupExpectedStatus !== undefined && rawNormalizedGithubGroupExpectedStatus && !githubGroupExpectedStatus) {
    console.warn("⚠️ 警告: github-group-expected-status 语法无效，已回退为默认值");
  }

  // 如果 Steam 独立组 expected-status 语法非法，则回退默认值并提示。
  if (rawSteamGroupExpectedStatus !== undefined && rawNormalizedSteamGroupExpectedStatus && !steamGroupExpectedStatus) {
    console.warn("⚠️ 警告: steam-group-expected-status 语法无效，已回退为默认值");
  }

  // 如果开发服务组 expected-status 语法非法，则回退默认值并提示。
  if (rawDevGroupExpectedStatus !== undefined && rawNormalizedDevGroupExpectedStatus && !devGroupExpectedStatus) {
    console.warn("⚠️ 警告: dev-group-expected-status 语法无效，已回退为默认值");
  }

  // 如果 GitHub / Steam 独立组 interface-name 传了空值，则提示已经忽略。
  if (rawGithubInterfaceName !== undefined && !githubInterfaceName) {
    console.warn("⚠️ 警告: github-interface-name 为空，已忽略");
  }

  if (rawSteamInterfaceName !== undefined && !steamInterfaceName) {
    console.warn("⚠️ 警告: steam-interface-name 为空，已忽略");
  }

  if (rawDevInterfaceName !== undefined && !devInterfaceName) {
    console.warn("⚠️ 警告: dev-interface-name 为空，已忽略");
  }

  // 如果 GitHub / Steam 独立组 routing-mark 非法，则显式提示帮助排查。
  if (rawGithubRoutingMark !== undefined && githubRoutingMark === null) {
    console.warn("⚠️ 警告: github-routing-mark 仅支持大于等于 0 的整数，已忽略");
  }

  if (rawSteamRoutingMark !== undefined && steamRoutingMark === null) {
    console.warn("⚠️ 警告: steam-routing-mark 仅支持大于等于 0 的整数，已忽略");
  }

  if (rawDevRoutingMark !== undefined && devRoutingMark === null) {
    console.warn("⚠️ 警告: dev-routing-mark 仅支持大于等于 0 的整数，已忽略");
  }

  // 如果同时设置了 GitHub use-providers 与 include-all-providers，则提示 use-providers 会被忽略。
  if (rawGithubIncludeAllProviders !== undefined && parseBool(rawGithubIncludeAllProviders, false) && githubUseProviders.length) {
    console.warn("⚠️ 警告: github-include-all-providers 已开启，github-use-providers 将被忽略");
  }

  // 如果同时设置了 Steam use-providers 与 include-all-providers，则提示 use-providers 会被忽略。
  if (rawSteamIncludeAllProviders !== undefined && parseBool(rawSteamIncludeAllProviders, false) && steamUseProviders.length) {
    console.warn("⚠️ 警告: steam-include-all-providers 已开启，steam-use-providers 将被忽略");
  }

  // 如果同时设置了 Dev use-providers 与 include-all-providers，则提示 use-providers 会被忽略。
  if (rawDevIncludeAllProviders !== undefined && parseBool(rawDevIncludeAllProviders, false) && devUseProviders.length) {
    console.warn("⚠️ 警告: dev-include-all-providers 已开启，dev-use-providers 将被忽略");
  }

  // 如果 GitHub include-all 已开启，则 use-providers / include-all-providers 都会被更高优先级的 include-all 覆盖。
  if (rawGithubIncludeAll !== undefined && parseBool(rawGithubIncludeAll, false) && (githubUseProviders.length || parseBool(rawGithubIncludeAllProviders, false))) {
    console.warn("⚠️ 警告: github-include-all 已开启，github-use-providers / github-include-all-providers 将被忽略");
  }

  // 如果 Steam include-all 已开启，则 use-providers / include-all-providers 都会被更高优先级的 include-all 覆盖。
  if (rawSteamIncludeAll !== undefined && parseBool(rawSteamIncludeAll, false) && (steamUseProviders.length || parseBool(rawSteamIncludeAllProviders, false))) {
    console.warn("⚠️ 警告: steam-include-all 已开启，steam-use-providers / steam-include-all-providers 将被忽略");
  }

  // 如果 Dev include-all 已开启，则 use-providers / include-all-providers 都会被更高优先级的 include-all 覆盖。
  if (rawDevIncludeAll !== undefined && parseBool(rawDevIncludeAll, false) && (devUseProviders.length || parseBool(rawDevIncludeAllProviders, false))) {
    console.warn("⚠️ 警告: dev-include-all 已开启，dev-use-providers / dev-include-all-providers 将被忽略");
  }

  // 如果 GitHub include-all 已开启，则 include-all-proxies 也会被更高优先级的 include-all 覆盖。
  if (rawGithubIncludeAll !== undefined && parseBool(rawGithubIncludeAll, false) && parseBool(rawGithubIncludeAllProxies, false)) {
    console.warn("⚠️ 警告: github-include-all 已开启，github-include-all-proxies 将被忽略");
  }

  // 如果 Steam include-all 已开启，则 include-all-proxies 也会被更高优先级的 include-all 覆盖。
  if (rawSteamIncludeAll !== undefined && parseBool(rawSteamIncludeAll, false) && parseBool(rawSteamIncludeAllProxies, false)) {
    console.warn("⚠️ 警告: steam-include-all 已开启，steam-include-all-proxies 将被忽略");
  }

  // 如果 Dev include-all 已开启，则 include-all-proxies 也会被更高优先级的 include-all 覆盖。
  if (rawDevIncludeAll !== undefined && parseBool(rawDevIncludeAll, false) && parseBool(rawDevIncludeAllProxies, false)) {
    console.warn("⚠️ 警告: dev-include-all 已开启，dev-include-all-proxies 将被忽略");
  }

  // 如果给 GitHub 传了 strategy，但当前组类型不是 load-balance，也提示其仅在 load-balance 下生效。
  if (rawGithubGroupStrategy !== undefined && githubGroupStrategy && githubType !== "load-balance") {
    console.warn("⚠️ 警告: github-group-strategy 仅在 github-type=load-balance 时生效");
  }

  // 如果给 Steam 传了 strategy，但当前组类型不是 load-balance，也提示其仅在 load-balance 下生效。
  if (rawSteamGroupStrategy !== undefined && steamGroupStrategy && steamType !== "load-balance") {
    console.warn("⚠️ 警告: steam-group-strategy 仅在 steam-type=load-balance 时生效");
  }

  // 如果给开发服务组传了 strategy，但当前组类型不是 load-balance，也提示其仅在 load-balance 下生效。
  if (rawDevGroupStrategy !== undefined && devGroupStrategy && devType !== "load-balance") {
    console.warn("⚠️ 警告: dev-group-strategy 仅在 dev-type=load-balance 时生效");
  }

  // 如果 GitHub icon 传了空值，则给出提示，避免用户误以为已经生效。
  if (rawGithubIcon !== undefined && !githubIcon) {
    console.warn("⚠️ 警告: github-icon 为空，已忽略");
  }

  // 如果 Steam icon 传了空值，则给出提示，避免用户误以为已经生效。
  if (rawSteamIcon !== undefined && !steamIcon) {
    console.warn("⚠️ 警告: steam-icon 为空，已忽略");
  }

  // 如果开发服务组 icon 传了空值，则给出提示，避免用户误以为已经生效。
  if (rawDevIcon !== undefined && !devIcon) {
    console.warn("⚠️ 警告: dev-icon 为空，已忽略");
  }

  // 官方文档已将 interface-name 标记为 deprecated，这里主动提醒，避免长期依赖。
  if (groupInterfaceName || githubInterfaceName || steamInterfaceName || devInterfaceName) {
    console.warn("⚠️ 提醒: Mihomo Proxy Groups 文档已将 interface-name 标记为 deprecated，请仅在必须绑定出口网卡时使用");
  }

  // 官方文档已将 routing-mark 标记为 deprecated，这里主动提醒，避免长期依赖。
  if (groupRoutingMark !== null || githubRoutingMark !== null || steamRoutingMark !== null || devRoutingMark !== null) {
    console.warn("⚠️ 提醒: Mihomo Proxy Groups 文档已将 routing-mark 标记为 deprecated，请仅在必须配合策略路由打标时使用");
  }

  // 如果 GitHub 规则顺序位置非法，则回退默认值并提示。
  if (rawGithubRulePosition !== undefined && normalizeStringArg(rawGithubRulePosition).toLowerCase() !== githubRulePosition) {
    console.warn(`⚠️ 警告: github-rule-position 无效，已重置为 ${githubRulePosition}`);
  }

  // 如果 Steam 规则顺序位置非法，则回退默认值并提示。
  if (rawSteamRulePosition !== undefined && normalizeStringArg(rawSteamRulePosition).toLowerCase() !== steamRulePosition) {
    console.warn(`⚠️ 警告: steam-rule-position 无效，已重置为 ${steamRulePosition}`);
  }

  // 如果 SteamCN 规则顺序位置非法，则回退默认值并提示。
  if (rawSteamCnRulePosition !== undefined && normalizeStringArg(rawSteamCnRulePosition).toLowerCase() !== steamCnRulePosition) {
    console.warn(`⚠️ 警告: steam-cn-rule-position 无效，已重置为 ${steamCnRulePosition}`);
  }

  // 如果开发服务规则顺序位置非法，则回退默认值并提示。
  if (rawDevRulePosition !== undefined && normalizeStringArg(rawDevRulePosition).toLowerCase() !== devRulePosition) {
    console.warn(`⚠️ 警告: dev-rule-position 无效，已重置为 ${devRulePosition}`);
  }

  // 如果 custom-rule-position 非法，则回退默认值并提示。
  if (rawCustomRulePosition !== undefined && normalizeStringArg(rawCustomRulePosition).toLowerCase() !== customRulePosition) {
    console.warn(`⚠️ 警告: custom-rule-position 无效，已重置为 ${customRulePosition}`);
  }

  // 如果策略组布局预设非法，则回退默认值并提示。
  if (rawGroupOrderPreset !== undefined && ![
    "default",
    "script",
    "balanced",
    "core",
    "corefirst",
    "main",
    "mainfirst",
    "service",
    "services",
    "servicefirst",
    "business",
    "businessfirst",
    "media",
    "mediafirst",
    "streaming",
    "streamingfirst",
    "region",
    "regions",
    "regionfirst",
    "country",
    "countries",
    "countryfirst"
  ].includes(normalizeGroupMarkerToken(rawGroupOrderPreset))) {
    console.warn(`⚠️ 警告: group-order-preset 无效，已重置为 ${groupOrderPreset}`);
  }

  // 如果显式传了 group-order 但最终一个 token 都没解析出来，则给出提示。
  if (rawGroupOrder !== undefined && !groupOrder.length) {
    console.warn("⚠️ 警告: group-order 为空，已忽略");
  }

  // 如果同时给了 preset 和显式顺序，则以显式顺序优先，并提醒覆盖关系。
  if (rawGroupOrderPreset !== undefined && rawGroupOrder !== undefined && groupOrder.length) {
    console.warn("⚠️ 提醒: 已同时配置 group-order-preset 与 group-order；当前以显式 group-order 为准");
  }

  // 如果国家组排序模式非法，则回退默认值并提示。
  if (rawCountryGroupSort !== undefined && !isValidGeoGroupSortMode(rawCountryGroupSort)) {
    console.warn(`⚠️ 警告: country-group-sort 无效，已重置为 ${countryGroupSort}`);
  }

  // 如果区域组排序模式非法，则回退默认值并提示。
  if (rawRegionGroupSort !== undefined && !isValidGeoGroupSortMode(rawRegionGroupSort)) {
    console.warn(`⚠️ 警告: region-group-sort 无效，已重置为 ${regionGroupSort}`);
  }

  // 逐条提示 region-groups / continent-groups 里未命中的区域标记，避免区域布局写了却静默失效。
  for (const item of parsedRegionGroups.invalidTokens) {
    console.warn(`⚠️ 警告: region-groups 未匹配到内置区域定义，已忽略: ${item}`);
  }

  // 如果规则源预设非法，则回退默认值并提示。
  if (rawRuleSourcePreset !== undefined && !["default", "meta", "metacubex", "official", "builtin", "blackmatrix7", "blackmatrix", "bm7", "iosrulescript"].includes(normalizeGroupMarkerToken(rawRuleSourcePreset))) {
    console.warn(`⚠️ 警告: rule-source-preset 无效，已重置为 ${ruleSourcePreset}`);
  }

  // 如果 SteamFix URL 看起来不像有效 http(s) 链接，则回退默认值并提示。
  if (rawSteamFixUrl !== undefined && steamFixUrl && !looksLikeHttpUrl(steamFixUrl)) {
    console.warn(`⚠️ 警告: steam-fix-url 看起来不是有效的 http(s) 链接，当前建议检查: ${steamFixUrl}`);
  }

  // 如果 fake-ip-ttl 被修正，也打印提示。
  if (rawFakeIpTtl !== undefined && parsedFakeIpTtl !== fakeIpTtl) {
    console.warn(`⚠️ 警告: fake-ip-ttl 无效，已重置为 ${fakeIpTtl}`);
  }

  // 返回最终规范化后的参数对象。
  return {
    // ipv6 兼容 ipv6Enabled / ipv6。
    ipv6: parseBool(pickArg(args, ["ipv6Enabled", "ipv6"]), true),
    // load-balance 兼容多种大小写/命名风格。
    lb: parseBool(pickArg(args, ["loadBalance", "loadbalance", "load-balance", "lb"]), false),
    // landing 只控制是否隔离落地节点。
    landing: parseBool(pickArg(args, ["landing"]), false),
    // hidden 控制是否隐藏辅助策略组，兼容多种写法。
    hidden: parseBool(pickArg(args, ["hiddenGroups", "hiddengroups", "hidden-groups", "hidden"]), false),
    // full 控制是否输出更完整的日志。
    full: parseBool(pickArg(args, ["fullConfig", "fullconfig", "full"]), false),
    // 允许用参数显式控制是否注入 profile.store-selected / store-fake-ip。
    profileCache: parseBool(rawProfileCache, false),
    hasProfileCache: rawProfileCache !== undefined,
    // 允许用参数覆盖自定义 classical 规则源地址。
    directListUrl,
    hasDirectListUrl: !!directListUrl,
    cryptoListUrl,
    hasCryptoListUrl: !!cryptoListUrl,
    chatGptListUrl,
    hasChatGptListUrl: !!chatGptListUrl,
    aiExtraListUrl,
    hasAiExtraListUrl: !!aiExtraListUrl,
    ruleSourcePreset,
    hasRuleSourcePreset: rawRuleSourcePreset !== undefined,
    steamFix: parseBool(rawSteamFix, false),
    hasSteamFix: rawSteamFix !== undefined,
    steamFixUrl,
    hasSteamFixUrl: !!steamFixUrl,
    ruleProviderPathDir,
    hasRuleProviderPathDir: rawRuleProviderPathDir !== undefined,
    ruleProviderInterval,
    hasRuleProviderInterval: rawRuleProviderInterval !== undefined,
    ruleProviderProxy,
    hasRuleProviderProxy: !!ruleProviderProxy,
    ruleProviderSizeLimit,
    hasRuleProviderSizeLimit: rawRuleProviderSizeLimit !== undefined,
    ruleProviderUserAgent,
    hasRuleProviderUserAgent: !!ruleProviderUserAgent,
    ruleProviderAuthorization,
    hasRuleProviderAuthorization: !!ruleProviderAuthorization,
    ruleProviderHeader,
    hasRuleProviderHeader: !!Object.keys(ruleProviderHeader).length,
    ruleProviderHeaderEntryCount: parsedRuleProviderHeaderEntries.entries.length,
    ruleProviderPayload,
    hasRuleProviderPayload: !!ruleProviderPayload.length,
    ruleProviderPayloadCount: ruleProviderPayload.length,
    proxyProviderInterval,
    hasProxyProviderInterval: rawProxyProviderInterval !== undefined,
    proxyProviderProxy,
    hasProxyProviderProxy: !!proxyProviderProxy,
    proxyProviderSizeLimit,
    hasProxyProviderSizeLimit: rawProxyProviderSizeLimit !== undefined,
    proxyProviderUserAgent,
    hasProxyProviderUserAgent: !!proxyProviderUserAgent,
    proxyProviderAuthorization,
    hasProxyProviderAuthorization: !!proxyProviderAuthorization,
    proxyProviderHeader,
    hasProxyProviderHeader: !!Object.keys(proxyProviderHeader).length,
    proxyProviderHeaderEntryCount: parsedProxyProviderHeaderEntries.entries.length,
    proxyProviderPayload,
    hasProxyProviderPayload: !!proxyProviderPayload.length,
    proxyProviderPayloadCount: proxyProviderPayload.length,
    proxyProviderPathDir,
    hasProxyProviderPathDir: !!proxyProviderPathDir,
    proxyProviderFilter,
    hasProxyProviderFilter: !!proxyProviderFilter,
    proxyProviderExcludeFilter,
    hasProxyProviderExcludeFilter: !!proxyProviderExcludeFilter,
    proxyProviderExcludeType,
    hasProxyProviderExcludeType: !!proxyProviderExcludeType,
    proxyProviderOverrideAdditionalPrefix,
    hasProxyProviderOverrideAdditionalPrefix: !!proxyProviderOverrideAdditionalPrefix,
    proxyProviderOverrideAdditionalSuffix,
    hasProxyProviderOverrideAdditionalSuffix: !!proxyProviderOverrideAdditionalSuffix,
    proxyProviderOverrideUdp: parseBool(rawProxyProviderOverrideUdp, false),
    hasProxyProviderOverrideUdp: rawProxyProviderOverrideUdp !== undefined,
    proxyProviderOverrideUdpOverTcp: parseBool(rawProxyProviderOverrideUdpOverTcp, false),
    hasProxyProviderOverrideUdpOverTcp: rawProxyProviderOverrideUdpOverTcp !== undefined,
    proxyProviderOverrideDown,
    hasProxyProviderOverrideDown: !!proxyProviderOverrideDown,
    proxyProviderOverrideUp,
    hasProxyProviderOverrideUp: !!proxyProviderOverrideUp,
    proxyProviderOverrideTfo: parseBool(rawProxyProviderOverrideTfo, false),
    hasProxyProviderOverrideTfo: rawProxyProviderOverrideTfo !== undefined,
    proxyProviderOverrideMptcp: parseBool(rawProxyProviderOverrideMptcp, false),
    hasProxyProviderOverrideMptcp: rawProxyProviderOverrideMptcp !== undefined,
    proxyProviderOverrideSkipCertVerify: parseBool(rawProxyProviderOverrideSkipCertVerify, false),
    hasProxyProviderOverrideSkipCertVerify: rawProxyProviderOverrideSkipCertVerify !== undefined,
    proxyProviderOverrideDialerProxy,
    hasProxyProviderOverrideDialerProxy: !!proxyProviderOverrideDialerProxy,
    proxyProviderOverrideInterfaceName,
    hasProxyProviderOverrideInterfaceName: !!proxyProviderOverrideInterfaceName,
    proxyProviderOverrideRoutingMark,
    hasProxyProviderOverrideRoutingMark: rawProxyProviderOverrideRoutingMark !== undefined && proxyProviderOverrideRoutingMark !== null,
    proxyProviderOverrideIpVersion,
    hasProxyProviderOverrideIpVersion: !!proxyProviderOverrideIpVersion,
    proxyProviderOverrideProxyNameRules,
    hasProxyProviderOverrideProxyNameRules: !!proxyProviderOverrideProxyNameRules.length,
    proxyProviderHealthCheckEnable: parseBool(rawProxyProviderHealthCheckEnable, true),
    hasProxyProviderHealthCheckEnable: rawProxyProviderHealthCheckEnable !== undefined,
    proxyProviderHealthCheckUrl,
    hasProxyProviderHealthCheckUrl: !!proxyProviderHealthCheckUrl,
    proxyProviderHealthCheckInterval,
    hasProxyProviderHealthCheckInterval: rawProxyProviderHealthCheckInterval !== undefined,
    proxyProviderHealthCheckTimeout,
    hasProxyProviderHealthCheckTimeout: rawProxyProviderHealthCheckTimeout !== undefined,
    proxyProviderHealthCheckLazy: parseBool(rawProxyProviderHealthCheckLazy, true),
    hasProxyProviderHealthCheckLazy: rawProxyProviderHealthCheckLazy !== undefined,
    proxyProviderHealthCheckExpectedStatus,
    hasProxyProviderHealthCheckExpectedStatus: !!proxyProviderHealthCheckExpectedStatus,
    // 允许用参数覆盖 AI / Crypto 的国家优先链。
    aiPreferCountries,
    hasAiPreferCountries: !!aiPreferCountries.length,
    cryptoPreferCountries,
    hasCryptoPreferCountries: !!cryptoPreferCountries.length,
    githubPreferCountries,
    hasGithubPreferCountries: !!githubPreferCountries.length,
    steamPreferCountries,
    hasSteamPreferCountries: !!steamPreferCountries.length,
    devPreferCountries,
    hasDevPreferCountries: !!devPreferCountries.length,
    countryExtraAliasesMap,
    hasCountryExtraAliases: !!countryExtraAliasCountryCount,
    countryExtraAliasCountryCount,
    countryExtraAliasEntryCount,
    countryExtraAliasPreview,
    countryExtraAliasConflictCount,
    countryExtraAliasConflictPreview,
    githubPreferGroups,
    hasGithubPreferGroups: !!githubPreferGroups.length,
    steamPreferGroups,
    hasSteamPreferGroups: !!steamPreferGroups.length,
    devPreferGroups,
    hasDevPreferGroups: !!devPreferGroups.length,
    githubPreferNodes,
    hasGithubPreferNodes: !!githubPreferNodes.length,
    steamPreferNodes,
    hasSteamPreferNodes: !!steamPreferNodes.length,
    devPreferNodes,
    hasDevPreferNodes: !!devPreferNodes.length,
    githubRuleTarget,
    hasGithubRuleTarget: !!githubRuleTarget,
    steamRuleTarget,
    hasSteamRuleTarget: !!steamRuleTarget,
    steamCnRuleTarget,
    hasSteamCnRuleTarget: !!steamCnRuleTarget,
    devRuleTarget,
    hasDevRuleTarget: !!devRuleTarget,
    githubRuleAnchor,
    hasGithubRuleAnchor: !!githubRuleAnchor,
    githubRulePosition,
    hasGithubRulePosition: rawGithubRulePosition !== undefined,
    steamRuleAnchor,
    hasSteamRuleAnchor: !!steamRuleAnchor,
    steamRulePosition,
    hasSteamRulePosition: rawSteamRulePosition !== undefined,
    steamCnRuleAnchor,
    hasSteamCnRuleAnchor: !!steamCnRuleAnchor,
    steamCnRulePosition,
    hasSteamCnRulePosition: rawSteamCnRulePosition !== undefined,
    devRuleAnchor,
    hasDevRuleAnchor: !!devRuleAnchor,
    devRulePosition,
    hasDevRulePosition: rawDevRulePosition !== undefined,
    customRuleAnchor,
    hasCustomRuleAnchor: !!customRuleAnchor,
    customRulePosition,
    hasCustomRulePosition: rawCustomRulePosition !== undefined,
    githubMode,
    hasGithubMode: rawGithubMode !== undefined,
    steamMode,
    hasSteamMode: rawSteamMode !== undefined,
    devMode,
    hasDevMode: rawDevMode !== undefined,
    githubType,
    hasGithubType: rawGithubType !== undefined,
    steamType,
    hasSteamType: rawSteamType !== undefined,
    devType,
    hasDevType: rawDevType !== undefined,
    devTestUrl,
    hasDevTestUrl: !!devTestUrl,
    devGroupInterval,
    hasDevGroupInterval: rawDevGroupInterval !== undefined,
    devGroupTolerance,
    hasDevGroupTolerance: rawDevGroupTolerance !== undefined,
    devGroupTimeout,
    hasDevGroupTimeout: rawDevGroupTimeout !== undefined,
    devGroupLazy: parseBool(rawDevGroupLazy, true),
    hasDevGroupLazy: rawDevGroupLazy !== undefined,
    devGroupMaxFailedTimes,
    hasDevGroupMaxFailedTimes: rawDevGroupMaxFailedTimes !== undefined,
    devGroupExpectedStatus,
    hasDevGroupExpectedStatus: !!devGroupExpectedStatus,
    devGroupStrategy,
    hasDevGroupStrategy: !!devGroupStrategy,
    devInterfaceName,
    hasDevInterfaceName: !!devInterfaceName,
    devRoutingMark,
    hasDevRoutingMark: devRoutingMark !== null,
    devHidden: parseBool(rawDevHidden, false),
    hasDevHidden: rawDevHidden !== undefined,
    devDisableUdp: parseBool(rawDevDisableUdp, false),
    hasDevDisableUdp: rawDevDisableUdp !== undefined,
    devIcon,
    hasDevIcon: !!devIcon,
    githubTestUrl,
    hasGithubTestUrl: !!githubTestUrl,
    githubGroupInterval,
    hasGithubGroupInterval: rawGithubGroupInterval !== undefined,
    githubGroupTolerance,
    hasGithubGroupTolerance: rawGithubGroupTolerance !== undefined,
    githubGroupTimeout,
    hasGithubGroupTimeout: rawGithubGroupTimeout !== undefined,
    githubGroupLazy: parseBool(rawGithubGroupLazy, true),
    hasGithubGroupLazy: rawGithubGroupLazy !== undefined,
    githubGroupMaxFailedTimes,
    hasGithubGroupMaxFailedTimes: rawGithubGroupMaxFailedTimes !== undefined,
    githubGroupExpectedStatus,
    hasGithubGroupExpectedStatus: !!githubGroupExpectedStatus,
    githubGroupStrategy,
    hasGithubGroupStrategy: !!githubGroupStrategy,
    githubInterfaceName,
    hasGithubInterfaceName: !!githubInterfaceName,
    githubRoutingMark,
    hasGithubRoutingMark: githubRoutingMark !== null,
    githubUseProviders,
    hasGithubUseProviders: !!githubUseProviders.length,
    githubIncludeAll: parseBool(rawGithubIncludeAll, false),
    hasGithubIncludeAll: rawGithubIncludeAll !== undefined,
    githubIncludeAllProxies: parseBool(rawGithubIncludeAllProxies, false),
    hasGithubIncludeAllProxies: rawGithubIncludeAllProxies !== undefined,
    githubIncludeAllProviders: parseBool(rawGithubIncludeAllProviders, false),
    hasGithubIncludeAllProviders: rawGithubIncludeAllProviders !== undefined,
    githubHidden: parseBool(rawGithubHidden, false),
    hasGithubHidden: rawGithubHidden !== undefined,
    githubDisableUdp: parseBool(rawGithubDisableUdp, false),
    hasGithubDisableUdp: rawGithubDisableUdp !== undefined,
    githubIcon,
    hasGithubIcon: !!githubIcon,
    githubNodeFilter,
    hasGithubNodeFilter: !!githubNodeFilter,
    githubNodeExcludeFilter,
    hasGithubNodeExcludeFilter: !!githubNodeExcludeFilter,
    githubNodeExcludeType,
    hasGithubNodeExcludeType: !!githubNodeExcludeType,
    steamTestUrl,
    hasSteamTestUrl: !!steamTestUrl,
    steamGroupInterval,
    hasSteamGroupInterval: rawSteamGroupInterval !== undefined,
    steamGroupTolerance,
    hasSteamGroupTolerance: rawSteamGroupTolerance !== undefined,
    steamGroupTimeout,
    hasSteamGroupTimeout: rawSteamGroupTimeout !== undefined,
    steamGroupLazy: parseBool(rawSteamGroupLazy, true),
    hasSteamGroupLazy: rawSteamGroupLazy !== undefined,
    steamGroupMaxFailedTimes,
    hasSteamGroupMaxFailedTimes: rawSteamGroupMaxFailedTimes !== undefined,
    steamGroupExpectedStatus,
    hasSteamGroupExpectedStatus: !!steamGroupExpectedStatus,
    steamGroupStrategy,
    hasSteamGroupStrategy: !!steamGroupStrategy,
    steamInterfaceName,
    hasSteamInterfaceName: !!steamInterfaceName,
    steamRoutingMark,
    hasSteamRoutingMark: steamRoutingMark !== null,
    steamUseProviders,
    hasSteamUseProviders: !!steamUseProviders.length,
    steamIncludeAll: parseBool(rawSteamIncludeAll, false),
    hasSteamIncludeAll: rawSteamIncludeAll !== undefined,
    steamIncludeAllProxies: parseBool(rawSteamIncludeAllProxies, false),
    hasSteamIncludeAllProxies: rawSteamIncludeAllProxies !== undefined,
    steamIncludeAllProviders: parseBool(rawSteamIncludeAllProviders, false),
    hasSteamIncludeAllProviders: rawSteamIncludeAllProviders !== undefined,
    steamHidden: parseBool(rawSteamHidden, false),
    hasSteamHidden: rawSteamHidden !== undefined,
    steamDisableUdp: parseBool(rawSteamDisableUdp, false),
    hasSteamDisableUdp: rawSteamDisableUdp !== undefined,
    steamIcon,
    hasSteamIcon: !!steamIcon,
    steamNodeFilter,
    hasSteamNodeFilter: !!steamNodeFilter,
    steamNodeExcludeFilter,
    hasSteamNodeExcludeFilter: !!steamNodeExcludeFilter,
    steamNodeExcludeType,
    hasSteamNodeExcludeType: !!steamNodeExcludeType,
    devUseProviders,
    hasDevUseProviders: !!devUseProviders.length,
    devIncludeAll: parseBool(rawDevIncludeAll, false),
    hasDevIncludeAll: rawDevIncludeAll !== undefined,
    devIncludeAllProxies: parseBool(rawDevIncludeAllProxies, false),
    hasDevIncludeAllProxies: rawDevIncludeAllProxies !== undefined,
    devIncludeAllProviders: parseBool(rawDevIncludeAllProviders, false),
    hasDevIncludeAllProviders: rawDevIncludeAllProviders !== undefined,
    devNodeFilter,
    hasDevNodeFilter: !!devNodeFilter,
    devNodeExcludeFilter,
    hasDevNodeExcludeFilter: !!devNodeExcludeFilter,
    devNodeExcludeType,
    hasDevNodeExcludeType: !!devNodeExcludeType,
    // 允许用参数分别控制 profile.store-selected / store-fake-ip。
    profileSelected: parseBool(rawProfileSelected, true),
    hasProfileSelected: rawProfileSelected !== undefined,
    profileFakeIp: parseBool(rawProfileFakeIp, true),
    hasProfileFakeIp: rawProfileFakeIp !== undefined,
    // fake-ip 兼容多种写法。
    fakeip: parseBool(pickArg(args, ["fakeIPEnabled", "fakeIpEnabled", "fakeip", "fake-ip"]), true),
    // quic 兼容 quicEnabled / quic。
    quic: parseBool(pickArg(args, ["quicEnabled", "quic"]), false),
    // 允许用参数直接覆盖 unified-delay / tcp-concurrent。
    unifiedDelay: parseBool(rawUnifiedDelay, true),
    hasUnifiedDelay: rawUnifiedDelay !== undefined,
    tcpConcurrent: parseBool(rawTcpConcurrent, true),
    hasTcpConcurrent: rawTcpConcurrent !== undefined,
    // 允许用参数显式控制 Geo 自动更新。
    geoAutoUpdate: parseBool(rawGeoAutoUpdate, false),
    hasGeoAutoUpdate: rawGeoAutoUpdate !== undefined,
    // 允许用参数显式控制 Geo 更新间隔。
    geoUpdateInterval,
    hasGeoUpdateInterval: rawGeoUpdateInterval !== undefined,
    // 允许用参数显式覆盖 global-ua。
    globalUa: typeof rawGlobalUa === "string" ? rawGlobalUa.trim() : "",
    hasGlobalUa: typeof rawGlobalUa === "string" && !!rawGlobalUa.trim(),
    // 允许把运行时调试摘要写进下载响应头，方便直接在 HTTP 层排查。
    responseHeaders: parseBool(rawResponseHeaders, false),
    hasResponseHeaders: rawResponseHeaders !== undefined,
    responseHeaderPrefix,
    hasResponseHeaderPrefix: typeof rawResponseHeaderPrefix === "string" && !!rawResponseHeaderPrefix.trim(),
    // 允许用参数显式覆盖 DNS 高级项。
    dnsPreferH3: parseBool(rawDnsPreferH3, false),
    hasDnsPreferH3: rawDnsPreferH3 !== undefined,
    dnsRespectRules: parseBool(rawDnsRespectRules, false),
    hasDnsRespectRules: rawDnsRespectRules !== undefined,
    dnsCacheAlgorithm: typeof rawDnsCacheAlgorithm === "string" ? rawDnsCacheAlgorithm.trim().toLowerCase() : "",
    hasDnsCacheAlgorithm: typeof rawDnsCacheAlgorithm === "string" && !!rawDnsCacheAlgorithm.trim(),
    dnsUseSystemHosts: parseBool(rawDnsUseSystemHosts, true),
    hasDnsUseSystemHosts: rawDnsUseSystemHosts !== undefined,
    fakeIpFilterMode: typeof rawFakeIpFilterMode === "string" ? rawFakeIpFilterMode.trim().toLowerCase() : "",
    hasFakeIpFilterMode: typeof rawFakeIpFilterMode === "string" && !!rawFakeIpFilterMode.trim(),
    fakeIpTtl,
    hasFakeIpTtl: rawFakeIpTtl !== undefined,
    // 允许用参数显式覆盖 find-process-mode / geodata-loader / geodata-mode。
    processMode: typeof rawProcessMode === "string" ? rawProcessMode.trim().toLowerCase() : "",
    hasProcessMode: typeof rawProcessMode === "string" && !!rawProcessMode.trim(),
    geodataLoader: typeof rawGeodataLoader === "string" ? rawGeodataLoader.trim().toLowerCase() : "",
    hasGeodataLoader: typeof rawGeodataLoader === "string" && !!rawGeodataLoader.trim(),
    geodataMode: parseBool(rawGeodataMode, true),
    hasGeodataMode: rawGeodataMode !== undefined,
    // 使用前面已校验过的 threshold。
    threshold,
    // 允许用参数覆盖测速组健康检查细节。
    testUrl,
    hasTestUrl: !!testUrl,
    groupInterval,
    hasGroupInterval: rawGroupInterval !== undefined,
    groupTolerance,
    hasGroupTolerance: rawGroupTolerance !== undefined,
    groupTimeout,
    hasGroupTimeout: rawGroupTimeout !== undefined,
    groupMaxFailedTimes,
    hasGroupMaxFailedTimes: rawGroupMaxFailedTimes !== undefined,
    groupExpectedStatus,
    hasGroupExpectedStatus: !!groupExpectedStatus,
    groupStrategy,
    hasGroupStrategy: !!groupStrategy,
    groupInterfaceName,
    hasGroupInterfaceName: !!groupInterfaceName,
    groupRoutingMark,
    hasGroupRoutingMark: groupRoutingMark !== null,
    groupOrderPreset,
    hasGroupOrderPreset: rawGroupOrderPreset !== undefined,
    groupOrder,
    hasGroupOrder: !!groupOrder.length,
    countryGroupSort,
    hasCountryGroupSort: rawCountryGroupSort !== undefined,
    regionGroupSort,
    hasRegionGroupSort: rawRegionGroupSort !== undefined,
    regionGroupKeys,
    hasRegionGroups: !!regionGroupKeys.length,
    hasRegionGroupsArg: rawRegionGroups !== undefined,
    regionGroupPreview,
    groupLazy: parseBool(rawGroupLazy, true),
    hasGroupLazy: rawGroupLazy !== undefined,
    // 允许用参数覆盖 DNS 监听地址与 Fake-IP 地址池。
    dnsListen,
    hasDnsListen: !!dnsListen,
    fakeIpRange,
    hasFakeIpRange: !!fakeIpRange,
    fakeIpRange6,
    hasFakeIpRange6: !!fakeIpRange6,
    // 允许用参数覆盖 Sniffer 官方示例中的核心布尔项。
    snifferForceDnsMapping: parseBool(rawSnifferForceDnsMapping, true),
    hasSnifferForceDnsMapping: rawSnifferForceDnsMapping !== undefined,
    snifferParsePureIp: parseBool(rawSnifferParsePureIp, true),
    hasSnifferParsePureIp: rawSnifferParsePureIp !== undefined,
    snifferOverrideDestination: parseBool(rawSnifferOverrideDestination, false),
    hasSnifferOverrideDestination: rawSnifferOverrideDestination !== undefined,
    snifferHttpOverrideDestination: parseBool(rawSnifferHttpOverrideDestination, true),
    hasSnifferHttpOverrideDestination: rawSnifferHttpOverrideDestination !== undefined,
    snifferForceDomains,
    hasSnifferForceDomains: !!snifferForceDomains.length,
    snifferSkipDomains,
    hasSnifferSkipDomains: !!snifferSkipDomains.length
  };
}

// 从 resolveArgs 源码里自动提取 pickArg 别名，避免后续每加一个参数都要手写维护白名单。
function collectKnownScriptArgAliases() {
  const source = typeof resolveArgs === "function" ? resolveArgs.toString() : "";
  const aliases = [];
  const pickArgPattern = /pickArg\(args,\s*\[([\s\S]*?)\]\)/g;
  let matched = pickArgPattern.exec(source);

  while (matched) {
    const aliasSource = matched[1];
    const aliasPattern = /["']([^"']+)["']/g;
    let aliasMatched = aliasPattern.exec(aliasSource);

    while (aliasMatched) {
      aliases.push(aliasMatched[1]);
      aliasMatched = aliasPattern.exec(aliasSource);
    }

    matched = pickArgPattern.exec(source);
  }

  return uniqueStrings(aliases);
}

// 建立所有“已知脚本参数别名”的查找表，给未消费参数诊断复用。
const KNOWN_SCRIPT_ARG_KEYS = createLookup(collectKnownScriptArgAliases());

// 根据 rule-provider 的格式推断更合适的本地缓存文件扩展名。
function getRuleProviderExtension(format) {
  const normalized = String(format || "yaml").trim().toLowerCase();

  if (normalized === "mrs") {
    return "mrs";
  }

  if (normalized === "text") {
    return "list";
  }

  return "yaml";
}

// 把 provider 名称转换成安全的本地文件名片段，避免路径里出现特殊字符。
function sanitizeFileToken(value) {
  const token = String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return token || "ruleset";
}

// 为 rule-provider 生成稳定的本地缓存路径，并保证同一批 provider 内不重名。
function buildRuleProviderPath(name, provider, usedPaths) {
  const seen = isObject(usedPaths) ? usedPaths : {};
  const extension = getRuleProviderExtension(isObject(provider) ? provider.format : "");
  const baseToken = sanitizeFileToken(name);
  const pathDir = typeof ARGS !== "undefined" && ARGS && ARGS.ruleProviderPathDir ? ARGS.ruleProviderPathDir : RULE_PROVIDER_PATH_DIR;
  let index = 0;

  while (true) {
    const suffix = index === 0 ? "" : `-${index + 1}`;
    const path = `${pathDir}/${baseToken}${suffix}.${extension}`;

    if (!seen[path]) {
      seen[path] = true;
      return path;
    }

    index += 1;
  }
}

// 从 path / url 这类字符串里提取文件扩展名，自动忽略 query/hash。
function getPathLikeExtension(value, fallback) {
  const source = normalizeStringArg(value).replace(/\\/g, "/");

  if (!source) {
    return fallback || "";
  }

  const normalized = source.replace(/[?#].*$/, "");
  const matched = normalized.match(/\.([A-Za-z0-9_-]+)$/);
  return matched ? matched[1].toLowerCase() : (fallback || "");
}

// 给 proxy-provider 推断缓存文件扩展名：优先沿用现有 path，其次尝试从 url 提取，最后回退 yaml。
function getProxyProviderExtension(provider) {
  if (!isObject(provider)) {
    return "yaml";
  }

  const pathExtension = getPathLikeExtension(provider.path, "");
  if (pathExtension) {
    return pathExtension;
  }

  return getPathLikeExtension(provider.url, "yaml");
}

// 为 proxy-provider 生成稳定的本地缓存路径，并尽量避免与现有 path 冲突。
function buildProxyProviderPath(name, provider, usedPaths) {
  const seen = isObject(usedPaths) ? usedPaths : {};
  const pathDir = typeof ARGS !== "undefined" && ARGS && ARGS.proxyProviderPathDir ? ARGS.proxyProviderPathDir : "";
  const extension = getProxyProviderExtension(provider);
  const baseToken = sanitizeFileToken(name);
  let index = 0;

  while (true) {
    const suffix = index === 0 ? "" : `-${index + 1}`;
    const path = `${pathDir}/${baseToken}${suffix}.${extension}`;

    if (!seen[path]) {
      seen[path] = true;
      return path;
    }

    index += 1;
  }
}

// 判断某个 rule-provider 是否属于可统一接管下载控制/缓存路径的 http 类型。
function canAutoAssignRuleProviderPath(provider) {
  return isObject(provider) && String(provider.type || "http").trim().toLowerCase() === "http";
}

// 判断当前是否开启了 rule-provider 的 http 下载控制接管，便于日志、响应头与校验共用同一套口径。
function hasRuleProviderDownloadConfiguredOptions() {
  return !!(
    typeof ARGS !== "undefined" &&
    ARGS &&
    (
      ARGS.hasRuleProviderInterval ||
      ARGS.hasRuleProviderProxy ||
      ARGS.hasRuleProviderSizeLimit ||
      ARGS.hasRuleProviderHeader ||
      ARGS.hasRuleProviderUserAgent ||
      ARGS.hasRuleProviderAuthorization
    )
  );
}

// 汇总 rule-provider 各类参数的实际接管范围，便于 full 日志与响应调试头直接复用。
function buildRuleProviderApplyScopeSummary() {
  if (typeof ARGS === "undefined" || !ARGS) {
    return "default";
  }

  const scopes = [];

  if (ARGS.hasRuleProviderPathDir) {
    scopes.push("path=http-only");
  }

  if (hasRuleProviderDownloadConfiguredOptions()) {
    scopes.push("download=http-only");
  }

  if (ARGS.hasRuleProviderPayload) {
    scopes.push("payload=inline-only");
  }

  return scopes.length ? scopes.join(",") : "default";
}

// 统计 rule-provider 在当前参数组合下的实际命中数量，便于把“作用范围”进一步落到真实条目数上。
function analyzeRuleProviderApplyStats(providers) {
  const source = isObject(providers) ? providers : {};
  const stats = {
    total: 0,
    http: 0,
    file: 0,
    inline: 0,
    other: 0,
    invalid: 0,
    pathHit: 0,
    downloadHit: 0,
    payloadHit: 0
  };

  for (const name of Object.keys(source)) {
    const provider = source[name];
    stats.total += 1;

    if (!isObject(provider)) {
      stats.invalid += 1;
      continue;
    }

    const type = normalizeStringArg(provider.type || "http").toLowerCase() || "http";

    if (type === "http") {
      stats.http += 1;
      if (ARGS.hasRuleProviderPathDir) {
        stats.pathHit += 1;
      }
      if (hasRuleProviderDownloadConfiguredOptions()) {
        stats.downloadHit += 1;
      }
      continue;
    }

    if (type === "file") {
      stats.file += 1;
      continue;
    }

    if (type === "inline") {
      stats.inline += 1;
      if (ARGS.hasRuleProviderPayload) {
        stats.payloadHit += 1;
      }
      continue;
    }

    stats.other += 1;
  }

  return stats;
}

// 把 rule-provider 命中统计压成紧凑摘要，方便写入 full 日志与响应调试头。
function formatRuleProviderApplyStats(stats) {
  const source = isObject(stats) ? stats : {};
  return `total=${Number(source.total) || 0},http=${Number(source.http) || 0},file=${Number(source.file) || 0},inline=${Number(source.inline) || 0},other=${Number(source.other) || 0},invalid=${Number(source.invalid) || 0},path-hit=${ARGS.hasRuleProviderPathDir ? (Number(source.pathHit) || 0) : "off"},download-hit=${hasRuleProviderDownloadConfiguredOptions() ? (Number(source.downloadHit) || 0) : "off"},payload-hit=${ARGS.hasRuleProviderPayload ? (Number(source.payloadHit) || 0) : "off"}`;
}

// 清洗 provider 名称样本，避免预览摘要里的分隔符与超长名称把调试信息挤爆。
function sanitizeProviderPreviewName(name) {
  return normalizeStringArg(name)
    .replace(/\s+/g, " ")
    .replace(/\|/g, "/")
    .replace(/,/g, ";");
}

// 把 provider 名称样本压成固定长度的可读片段，便于直接写入日志与响应头。
function formatProviderPreviewNames(names, maxItems, maxNameLength) {
  const source = uniqueStrings(
    (Array.isArray(names) ? names : [])
      .map((name) => sanitizeProviderPreviewName(name))
      .filter(Boolean)
  );

  if (!source.length) {
    return "none";
  }

  const itemLimit = Number.isFinite(maxItems) && maxItems > 0 ? Math.floor(maxItems) : 3;
  const nameLimit = Number.isFinite(maxNameLength) && maxNameLength > 4 ? Math.floor(maxNameLength) : 18;
  const visibleNames = source
    .slice(0, itemLimit)
    .map((name) => (name.length > nameLimit ? `${name.slice(0, nameLimit - 3)}...` : name));
  const remaining = source.length - visibleNames.length;

  return `${visibleNames.join("|")}${remaining > 0 ? `(+${remaining})` : ""}`;
}

// 统一格式化单类 provider 命中预览，未开启时标记 off，开启但未命中时标记 none。
function formatProviderPreviewEntry(label, names, enabled) {
  return `${label}=${enabled ? formatProviderPreviewNames(names, 3, 18) : "off"}`;
}

// 汇总 rule-provider 实际命中的名称样本，便于在统计之外快速定位具体条目。
function analyzeRuleProviderApplyPreview(providers) {
  const source = isObject(providers) ? providers : {};
  const preview = {
    path: [],
    download: [],
    payload: []
  };

  for (const name of Object.keys(source)) {
    const provider = source[name];

    if (!isObject(provider)) {
      continue;
    }

    const type = normalizeStringArg(provider.type || "http").toLowerCase() || "http";

    if (type === "http") {
      if (ARGS.hasRuleProviderPathDir) {
        preview.path.push(name);
      }
      if (hasRuleProviderDownloadConfiguredOptions()) {
        preview.download.push(name);
      }
      continue;
    }

    if (type === "inline" && ARGS.hasRuleProviderPayload) {
      preview.payload.push(name);
    }
  }

  return preview;
}

// 把 rule-provider 命中样本预览压成紧凑摘要，便于响应调试头与 full 日志复用。
function formatRuleProviderApplyPreview(preview) {
  const source = isObject(preview) ? preview : {};
  return [
    formatProviderPreviewEntry("path", source.path, ARGS.hasRuleProviderPathDir),
    formatProviderPreviewEntry("download", source.download, hasRuleProviderDownloadConfiguredOptions()),
    formatProviderPreviewEntry("payload", source.payload, ARGS.hasRuleProviderPayload)
  ].join(",");
}

// 判断两个 JSON 兼容值在当前脚本语义下是否等价，便于区分“新增写入”和“覆盖旧值”。
function areJsonValuesEqual(left, right) {
  if (left === right) {
    return true;
  }

  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch (error) {
    return false;
  }
}

// 统计一组字段在“原始 provider -> 最终 provider”之间是新增写入还是覆盖旧值。
function analyzeProviderMutationByKeys(beforeProvider, afterProvider, keys) {
  const result = {
    added: false,
    overrode: false,
    noop: false
  };
  const source = isObject(beforeProvider) ? beforeProvider : {};
  const target = isObject(afterProvider) ? afterProvider : {};
  let compared = false;

  for (const key of Array.isArray(keys) ? keys : []) {
    const beforeHas = hasOwn(source, key);
    const afterHas = hasOwn(target, key);

    if (!afterHas) {
      continue;
    }

    compared = true;

    if (beforeHas && areJsonValuesEqual(source[key], target[key])) {
      continue;
    }

    if (!beforeHas) {
      result.added = true;
      continue;
    }

    result.overrode = true;
  }

  if (compared && !result.added && !result.overrode) {
    result.noop = true;
  }

  return result;
}

// 创建一组 provider 改动样本桶，分别记录新增、覆盖与无变化的名称样本。
function createProviderMutationPreviewEntry() {
  return {
    added: [],
    overrode: [],
    noop: []
  };
}

// 把当前 provider 的改动类型写进样本桶，便于后续输出紧凑预览。
function appendProviderMutationPreviewEntry(entry, name, mutation) {
  const target = isObject(entry) ? entry : createProviderMutationPreviewEntry();

  if (!isObject(mutation)) {
    return target;
  }

  if (mutation.added) {
    target.added.push(name);
  }

  if (mutation.overrode) {
    target.overrode.push(name);
  }

  if (mutation.noop) {
    target.noop.push(name);
  }

  return target;
}

// 把单类 provider 改动样本压成紧凑摘要，未开启时显示 off，开启后分别预览 added/overrode/noop。
function formatProviderMutationPreviewEntry(label, entry, enabled) {
  const source = isObject(entry) ? entry : {};
  return `${label}=${enabled ? `added:${formatProviderPreviewNames(source.added, 2, 14)}/overrode:${formatProviderPreviewNames(source.overrode, 2, 14)}/noop:${formatProviderPreviewNames(source.noop, 2, 14)}` : "off"}`;
}

// 统计 rule-provider 参数最终是新增字段还是覆盖旧字段，帮助区分“补全”与“替换”。
function analyzeRuleProviderMutationStats(beforeProviders, afterProviders) {
  const source = isObject(beforeProviders) ? beforeProviders : {};
  const target = isObject(afterProviders) ? afterProviders : {};
  const stats = {
    total: 0,
    pathAdded: 0,
    pathOverrode: 0,
    pathNoop: 0,
    downloadAdded: 0,
    downloadOverrode: 0,
    downloadNoop: 0,
    payloadAdded: 0,
    payloadOverrode: 0,
    payloadNoop: 0
  };

  for (const name of Object.keys(target)) {
    const beforeProvider = isObject(source[name]) ? source[name] : {};
    const afterProvider = target[name];

    if (!isObject(afterProvider)) {
      continue;
    }

    stats.total += 1;
    const type = normalizeStringArg(afterProvider.type || beforeProvider.type || "http").toLowerCase() || "http";
    const isHttpProvider = type === "http";
    const isInlineProvider = type === "inline";

    if (ARGS.hasRuleProviderPathDir && isHttpProvider) {
      const mutation = analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["path"]);
      if (mutation.added) {
        stats.pathAdded += 1;
      }
      if (mutation.overrode) {
        stats.pathOverrode += 1;
      }
      if (mutation.noop) {
        stats.pathNoop += 1;
      }
    }

    if (hasRuleProviderDownloadConfiguredOptions() && isHttpProvider) {
      const mutation = analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["interval", "proxy", "size-limit", "header"]);
      if (mutation.added) {
        stats.downloadAdded += 1;
      }
      if (mutation.overrode) {
        stats.downloadOverrode += 1;
      }
      if (mutation.noop) {
        stats.downloadNoop += 1;
      }
    }

    if (ARGS.hasRuleProviderPayload && isInlineProvider) {
      const mutation = analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["payload"]);
      if (mutation.added) {
        stats.payloadAdded += 1;
      }
      if (mutation.overrode) {
        stats.payloadOverrode += 1;
      }
      if (mutation.noop) {
        stats.payloadNoop += 1;
      }
    }
  }

  return stats;
}

// 汇总 rule-provider 的改动样本，便于快速定位哪些 provider 被新增写入、覆盖或保持不变。
function analyzeRuleProviderMutationPreview(beforeProviders, afterProviders) {
  const source = isObject(beforeProviders) ? beforeProviders : {};
  const target = isObject(afterProviders) ? afterProviders : {};
  const preview = {
    path: createProviderMutationPreviewEntry(),
    download: createProviderMutationPreviewEntry(),
    payload: createProviderMutationPreviewEntry()
  };

  for (const name of Object.keys(target)) {
    const beforeProvider = isObject(source[name]) ? source[name] : {};
    const afterProvider = target[name];

    if (!isObject(afterProvider)) {
      continue;
    }

    const type = normalizeStringArg(afterProvider.type || beforeProvider.type || "http").toLowerCase() || "http";
    const isHttpProvider = type === "http";
    const isInlineProvider = type === "inline";

    if (ARGS.hasRuleProviderPathDir && isHttpProvider) {
      appendProviderMutationPreviewEntry(
        preview.path,
        name,
        analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["path"])
      );
    }

    if (hasRuleProviderDownloadConfiguredOptions() && isHttpProvider) {
      appendProviderMutationPreviewEntry(
        preview.download,
        name,
        analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["interval", "proxy", "size-limit", "header"])
      );
    }

    if (ARGS.hasRuleProviderPayload && isInlineProvider) {
      appendProviderMutationPreviewEntry(
        preview.payload,
        name,
        analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["payload"])
      );
    }
  }

  return preview;
}

// 把 rule-provider 改动统计压成紧凑摘要，便于写入 full 日志与响应调试头。
function formatRuleProviderMutationStats(stats) {
  const source = isObject(stats) ? stats : {};
  return `total=${Number(source.total) || 0},path-added=${ARGS.hasRuleProviderPathDir ? (Number(source.pathAdded) || 0) : "off"},path-overrode=${ARGS.hasRuleProviderPathDir ? (Number(source.pathOverrode) || 0) : "off"},path-noop=${ARGS.hasRuleProviderPathDir ? (Number(source.pathNoop) || 0) : "off"},download-added=${hasRuleProviderDownloadConfiguredOptions() ? (Number(source.downloadAdded) || 0) : "off"},download-overrode=${hasRuleProviderDownloadConfiguredOptions() ? (Number(source.downloadOverrode) || 0) : "off"},download-noop=${hasRuleProviderDownloadConfiguredOptions() ? (Number(source.downloadNoop) || 0) : "off"},payload-added=${ARGS.hasRuleProviderPayload ? (Number(source.payloadAdded) || 0) : "off"},payload-overrode=${ARGS.hasRuleProviderPayload ? (Number(source.payloadOverrode) || 0) : "off"},payload-noop=${ARGS.hasRuleProviderPayload ? (Number(source.payloadNoop) || 0) : "off"}`;
}

// 把 rule-provider 改动样本预览压成紧凑摘要，便于响应调试头与 full 日志复用。
function formatRuleProviderMutationPreview(preview) {
  const source = isObject(preview) ? preview : {};
  return [
    formatProviderMutationPreviewEntry("path", source.path, ARGS.hasRuleProviderPathDir),
    formatProviderMutationPreviewEntry("download", source.download, hasRuleProviderDownloadConfiguredOptions()),
    formatProviderMutationPreviewEntry("payload", source.payload, ARGS.hasRuleProviderPayload)
  ].join(",");
}

// 把最终 rule-provider 做统一定稿：补本地缓存路径，并把 http 类型的下载控制统一接管。
function finalizeRuleProviders(providers) {
  const source = isObject(providers) ? providers : {};
  const usedPaths = Object.create(null);
  const result = {};
  const hasDownloadConfiguredOptions = hasRuleProviderDownloadConfiguredOptions();
  const hasPayloadConfiguredOption = ARGS.hasRuleProviderPayload;

  // 先登记本轮不会被 path-dir 接管的既有路径，避免后续自动分配时撞上已有缓存文件。
  for (const name of Object.keys(source)) {
    const currentProvider = source[name];
    if (!isObject(currentProvider)) {
      continue;
    }

    const isHttpProvider = canAutoAssignRuleProviderPath(currentProvider);
    const shouldReassignPath = isHttpProvider && ARGS.hasRuleProviderPathDir;
    const currentPath = normalizeStringArg(currentProvider.path).replace(/\\/g, "/");

    if (currentPath && !shouldReassignPath && !usedPaths[currentPath]) {
      usedPaths[currentPath] = true;
    }
  }

  for (const name of Object.keys(source)) {
    const currentProvider = source[name];
    if (!isObject(currentProvider)) {
      result[name] = currentProvider;
      continue;
    }

    const provider = Object.assign({}, currentProvider);
    const currentPath = normalizeStringArg(provider.path).replace(/\\/g, "/");
    const type = normalizeStringArg(provider.type || "http").toLowerCase();
    const isHttpProvider = type === "http";
    const isInlineProvider = type === "inline";

    if (isHttpProvider && ARGS.hasRuleProviderPathDir) {
      provider.path = buildRuleProviderPath(name, provider, usedPaths);
    } else if (currentPath && !usedPaths[currentPath]) {
      provider.path = currentPath;
      usedPaths[currentPath] = true;
    } else if (isHttpProvider) {
      provider.path = buildRuleProviderPath(name, provider, usedPaths);
    }

    if (isHttpProvider && ARGS.hasRuleProviderInterval) {
      provider.interval = ARGS.ruleProviderInterval;
    }

    if (isHttpProvider && ARGS.hasRuleProviderProxy) {
      provider.proxy = ARGS.ruleProviderProxy;
    }

    if (isHttpProvider && ARGS.hasRuleProviderSizeLimit) {
      provider["size-limit"] = ARGS.ruleProviderSizeLimit;
    }

    if (isHttpProvider && hasDownloadConfiguredOptions) {
      const headers = mergeProviderHeaders(
        provider.header,
        ARGS.hasRuleProviderUserAgent ? ARGS.ruleProviderUserAgent : "",
        ARGS.hasRuleProviderAuthorization ? ARGS.ruleProviderAuthorization : "",
        ARGS.hasRuleProviderHeader ? ARGS.ruleProviderHeader : {}
      );

      if (headers) {
        provider.header = headers;
      }
    }

    if (isInlineProvider && hasPayloadConfiguredOption) {
      provider.payload = cloneJsonCompatibleValue(ARGS.ruleProviderPayload, []);
    }

    result[name] = provider;
  }

  return result;
}

// 合并用户原有 provider 与脚本内置 provider，并统一完成 path 去冲突与 http 下载控制接管。
function mergeRuleProviders(existingProviders, generatedProviders) {
  return finalizeRuleProviders(
    Object.assign(
      {},
      isObject(existingProviders) ? existingProviders : {},
      isObject(generatedProviders) ? generatedProviders : {}
    )
  );
}

// 把 JSON 兼容的数据做一次深拷贝，避免多个 provider 共享同一份 payload / header 引用。
function cloneJsonCompatibleValue(value, fallback) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    return fallback;
  }
}

// 解析 rule-provider payload 参数，支持字符串数组、JSON 数组，以及换行 / || 分隔的规则列表。
function parseRuleProviderPayload(value) {
  let source = value;

  if (typeof source === "string") {
    const text = normalizeStringArg(source);
    if (!text) {
      return { items: [], invalidItems: [], parseFailed: false };
    }

    try {
      source = JSON.parse(text);
    } catch (error) {
      source = text.replace(/\r/g, "").split(/\n|\|\|/);
    }
  }

  if (!Array.isArray(source) && typeof source !== "string") {
    return {
      items: [],
      invalidItems: ["payload 根结构必须是字符串或字符串数组"],
      parseFailed: true
    };
  }

  const rawItems = Array.isArray(source)
    ? source
    : String(source || "").replace(/\r/g, "").split(/\n|\|\|/);
  const items = [];
  const invalidItems = [];

  for (let index = 0; index < rawItems.length; index += 1) {
    const item = rawItems[index];

    if (typeof item !== "string") {
      invalidItems.push(`payload[${index}] 不是字符串`);
      continue;
    }

    const rule = normalizeStringArg(item);
    if (!rule) {
      continue;
    }

    items.push(rule);
  }

  return {
    items,
    invalidItems,
    parseFailed: false
  };
}

// 解析 proxy-provider payload 参数，支持对象、数组以及 JSON 字符串输入。
function parseProxyProviderPayload(value) {
  let source = value;

  if (typeof source === "string") {
    const text = normalizeStringArg(source);
    if (!text) {
      return { items: [], invalidItems: [], parseFailed: false };
    }

    try {
      source = JSON.parse(text);
    } catch (error) {
      return { items: [], invalidItems: [text], parseFailed: true };
    }
  }

  const rawItems = Array.isArray(source)
    ? source
    : (isObject(source) ? [source] : []);
  const items = [];
  const invalidItems = [];

  for (let index = 0; index < rawItems.length; index += 1) {
    const item = rawItems[index];

    if (!isObject(item)) {
      invalidItems.push(`payload[${index}] 不是对象`);
      continue;
    }

    const name = normalizeStringArg(item.name);
    const type = normalizeStringArg(item.type);

    if (!name || !type) {
      invalidItems.push(`payload[${index}] 缺少有效的 name/type`);
      continue;
    }

    items.push(cloneJsonCompatibleValue(item, Object.assign({}, item)));
  }

  return {
    items,
    invalidItems,
    parseFailed: false
  };
}

// 解析 provider 自定义请求头参数，支持 `Header: value||Header2: value2` 与多行写法。
function parseProviderHeaderEntries(value) {
  const sourceList = Array.isArray(value) ? value : [value];
  const headers = {};
  const entries = [];
  const invalidLines = [];

  for (const sourceItem of sourceList) {
    const lines = String(sourceItem == null ? "" : sourceItem).replace(/\r/g, "").split(/\n|\|\|/);

    for (const rawLine of lines) {
      const line = normalizeStringArg(rawLine);

      if (!line) {
        continue;
      }

      const arrowIndex = line.indexOf("=>");
      const colonIndex = line.indexOf(":");
      const splitIndex = arrowIndex > 0 ? arrowIndex : colonIndex;
      const separatorLength = arrowIndex > 0 ? 2 : 1;

      if (splitIndex <= 0) {
        invalidLines.push(line);
        continue;
      }

      const name = line.slice(0, splitIndex).trim();
      const headerValue = line.slice(splitIndex + separatorLength).trim();

      if (!name || !headerValue || !isValidRequestHeaderName(name)) {
        invalidLines.push(line);
        continue;
      }

      if (!Array.isArray(headers[name])) {
        headers[name] = [];
      }

      headers[name].push(headerValue);
      entries.push({ name, value: headerValue });
    }
  }

  return {
    headers,
    entries,
    invalidLines
  };
}

// 合并 provider 请求头，允许在保留现有 header 的前提下覆盖通用自定义头与常用 UA / Authorization。
function mergeProviderHeaders(baseHeaders, userAgent, authorization, extraHeaders) {
  const headers = isObject(baseHeaders) ? Object.assign({}, baseHeaders) : {};

  for (const name of Object.keys(isObject(extraHeaders) ? extraHeaders : {})) {
    const values = (Array.isArray(extraHeaders[name]) ? extraHeaders[name] : [extraHeaders[name]])
      .map((item) => normalizeStringArg(item))
      .filter(Boolean);

    if (values.length) {
      headers[name] = values;
    }
  }

  if (userAgent) {
    headers["User-Agent"] = [userAgent];
  }

  if (authorization) {
    headers.Authorization = [authorization];
  }

  return Object.keys(headers).length ? headers : undefined;
}

// 判断当前是否开启了 proxy-provider 的 http 下载控制接管，便于日志、响应头与校验共用同一套口径。
function hasProxyProviderDownloadConfiguredOptions() {
  return !!(
    typeof ARGS !== "undefined" &&
    ARGS &&
    (
      ARGS.hasProxyProviderInterval ||
      ARGS.hasProxyProviderProxy ||
      ARGS.hasProxyProviderSizeLimit ||
      ARGS.hasProxyProviderHeader ||
      ARGS.hasProxyProviderUserAgent ||
      ARGS.hasProxyProviderAuthorization
    )
  );
}

// 判断当前是否开启了 proxy-provider 节点池筛选参数，避免多处重复拼同一串布尔判断。
function hasProxyProviderCollectionConfiguredOptions() {
  return !!(
    typeof ARGS !== "undefined" &&
    ARGS &&
    (
      ARGS.hasProxyProviderFilter ||
      ARGS.hasProxyProviderExcludeFilter ||
      ARGS.hasProxyProviderExcludeType
    )
  );
}

// 判断当前是否开启了 proxy-provider override 批量改写参数。
function hasProxyProviderOverrideConfiguredOptions() {
  return !!(
    typeof ARGS !== "undefined" &&
    ARGS &&
    (
      ARGS.hasProxyProviderOverrideAdditionalPrefix ||
      ARGS.hasProxyProviderOverrideAdditionalSuffix ||
      ARGS.hasProxyProviderOverrideUdp ||
      ARGS.hasProxyProviderOverrideUdpOverTcp ||
      ARGS.hasProxyProviderOverrideDown ||
      ARGS.hasProxyProviderOverrideUp ||
      ARGS.hasProxyProviderOverrideTfo ||
      ARGS.hasProxyProviderOverrideMptcp ||
      ARGS.hasProxyProviderOverrideSkipCertVerify ||
      ARGS.hasProxyProviderOverrideDialerProxy ||
      ARGS.hasProxyProviderOverrideInterfaceName ||
      ARGS.hasProxyProviderOverrideRoutingMark ||
      ARGS.hasProxyProviderOverrideIpVersion ||
      ARGS.hasProxyProviderOverrideProxyNameRules
    )
  );
}

// 判断当前是否开启了 proxy-provider health-check 接管参数。
function hasProxyProviderHealthCheckConfiguredOptions() {
  return !!(
    typeof ARGS !== "undefined" &&
    ARGS &&
    (
      ARGS.hasProxyProviderHealthCheckEnable ||
      ARGS.hasProxyProviderHealthCheckUrl ||
      ARGS.hasProxyProviderHealthCheckInterval ||
      ARGS.hasProxyProviderHealthCheckTimeout ||
      ARGS.hasProxyProviderHealthCheckLazy ||
      ARGS.hasProxyProviderHealthCheckExpectedStatus
    )
  );
}

// 汇总 proxy-provider 各类参数的实际接管范围，便于 full 日志与响应调试头直接复用。
function buildProxyProviderApplyScopeSummary() {
  if (typeof ARGS === "undefined" || !ARGS) {
    return "default";
  }

  const scopes = [];

  if (ARGS.hasProxyProviderPathDir) {
    scopes.push("path=http-only");
  }

  if (hasProxyProviderDownloadConfiguredOptions()) {
    scopes.push("download=http-only");
  }

  if (ARGS.hasProxyProviderPayload) {
    scopes.push("payload=all-provider-types");
  }

  if (hasProxyProviderCollectionConfiguredOptions()) {
    scopes.push("collection=all-provider-types");
  }

  if (hasProxyProviderOverrideConfiguredOptions()) {
    scopes.push("override=all-provider-types");
  }

  if (hasProxyProviderHealthCheckConfiguredOptions()) {
    scopes.push("health-check=all-provider-types");
  }

  return scopes.length ? scopes.join(",") : "default";
}

// 统计 proxy-provider 在当前参数组合下的实际命中数量，便于确认每类接管到底打到了多少 provider。
function analyzeProxyProviderApplyStats(proxyProviders) {
  const source = isObject(proxyProviders) ? proxyProviders : {};
  const stats = {
    total: 0,
    http: 0,
    file: 0,
    inline: 0,
    other: 0,
    invalid: 0,
    pathHit: 0,
    downloadHit: 0,
    payloadHit: 0,
    collectionHit: 0,
    overrideHit: 0,
    healthCheckHit: 0
  };

  for (const name of Object.keys(source)) {
    const provider = source[name];
    stats.total += 1;

    if (!isObject(provider)) {
      stats.invalid += 1;
      continue;
    }

    const type = normalizeStringArg(provider.type || "http").toLowerCase() || "http";

    if (type === "http") {
      stats.http += 1;
      if (ARGS.hasProxyProviderPathDir) {
        stats.pathHit += 1;
      }
      if (hasProxyProviderDownloadConfiguredOptions()) {
        stats.downloadHit += 1;
      }
    } else if (type === "file") {
      stats.file += 1;
    } else if (type === "inline") {
      stats.inline += 1;
    } else {
      stats.other += 1;
    }

    if (ARGS.hasProxyProviderPayload) {
      stats.payloadHit += 1;
    }

    if (hasProxyProviderCollectionConfiguredOptions()) {
      stats.collectionHit += 1;
    }

    if (hasProxyProviderOverrideConfiguredOptions()) {
      stats.overrideHit += 1;
    }

    if (hasProxyProviderHealthCheckConfiguredOptions()) {
      stats.healthCheckHit += 1;
    }
  }

  return stats;
}

// 把 proxy-provider 命中统计压成紧凑摘要，方便写入 full 日志与响应调试头。
function formatProxyProviderApplyStats(stats) {
  const source = isObject(stats) ? stats : {};
  return `total=${Number(source.total) || 0},http=${Number(source.http) || 0},file=${Number(source.file) || 0},inline=${Number(source.inline) || 0},other=${Number(source.other) || 0},invalid=${Number(source.invalid) || 0},path-hit=${ARGS.hasProxyProviderPathDir ? (Number(source.pathHit) || 0) : "off"},download-hit=${hasProxyProviderDownloadConfiguredOptions() ? (Number(source.downloadHit) || 0) : "off"},payload-hit=${ARGS.hasProxyProviderPayload ? (Number(source.payloadHit) || 0) : "off"},collection-hit=${hasProxyProviderCollectionConfiguredOptions() ? (Number(source.collectionHit) || 0) : "off"},override-hit=${hasProxyProviderOverrideConfiguredOptions() ? (Number(source.overrideHit) || 0) : "off"},health-check-hit=${hasProxyProviderHealthCheckConfiguredOptions() ? (Number(source.healthCheckHit) || 0) : "off"}`;
}

// 汇总 proxy-provider 实际命中的名称样本，便于快速定位具体 provider。
function analyzeProxyProviderApplyPreview(proxyProviders) {
  const source = isObject(proxyProviders) ? proxyProviders : {};
  const preview = {
    path: [],
    download: [],
    payload: [],
    collection: [],
    override: [],
    healthCheck: []
  };

  for (const name of Object.keys(source)) {
    const provider = source[name];

    if (!isObject(provider)) {
      continue;
    }

    const type = normalizeStringArg(provider.type || "http").toLowerCase() || "http";
    const isHttpProvider = type === "http";

    if (ARGS.hasProxyProviderPathDir && isHttpProvider) {
      preview.path.push(name);
    }

    if (hasProxyProviderDownloadConfiguredOptions() && isHttpProvider) {
      preview.download.push(name);
    }

    if (ARGS.hasProxyProviderPayload) {
      preview.payload.push(name);
    }

    if (hasProxyProviderCollectionConfiguredOptions()) {
      preview.collection.push(name);
    }

    if (hasProxyProviderOverrideConfiguredOptions()) {
      preview.override.push(name);
    }

    if (hasProxyProviderHealthCheckConfiguredOptions()) {
      preview.healthCheck.push(name);
    }
  }

  return preview;
}

// 把 proxy-provider 命中样本预览压成紧凑摘要，便于响应调试头与 full 日志复用。
function formatProxyProviderApplyPreview(preview) {
  const source = isObject(preview) ? preview : {};
  return [
    formatProviderPreviewEntry("path", source.path, ARGS.hasProxyProviderPathDir),
    formatProviderPreviewEntry("download", source.download, hasProxyProviderDownloadConfiguredOptions()),
    formatProviderPreviewEntry("payload", source.payload, ARGS.hasProxyProviderPayload),
    formatProviderPreviewEntry("collection", source.collection, hasProxyProviderCollectionConfiguredOptions()),
    formatProviderPreviewEntry("override", source.override, hasProxyProviderOverrideConfiguredOptions()),
    formatProviderPreviewEntry("health-check", source.healthCheck, hasProxyProviderHealthCheckConfiguredOptions())
  ].join(",");
}

// 统计 proxy-provider 参数最终是新增字段还是覆盖旧字段，帮助区分“补全”与“替换”。
function analyzeProxyProviderMutationStats(beforeProviders, afterProviders) {
  const source = isObject(beforeProviders) ? beforeProviders : {};
  const target = isObject(afterProviders) ? afterProviders : {};
  const stats = {
    total: 0,
    pathAdded: 0,
    pathOverrode: 0,
    pathNoop: 0,
    downloadAdded: 0,
    downloadOverrode: 0,
    downloadNoop: 0,
    payloadAdded: 0,
    payloadOverrode: 0,
    payloadNoop: 0,
    collectionAdded: 0,
    collectionOverrode: 0,
    collectionNoop: 0,
    overrideAdded: 0,
    overrideOverrode: 0,
    overrideNoop: 0,
    healthCheckAdded: 0,
    healthCheckOverrode: 0,
    healthCheckNoop: 0
  };

  for (const name of Object.keys(target)) {
    const beforeProvider = isObject(source[name]) ? source[name] : {};
    const afterProvider = target[name];

    if (!isObject(afterProvider)) {
      continue;
    }

    stats.total += 1;
    const type = normalizeStringArg(afterProvider.type || beforeProvider.type || "http").toLowerCase() || "http";
    const isHttpProvider = type === "http";

    if (ARGS.hasProxyProviderPathDir && isHttpProvider) {
      const mutation = analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["path"]);
      if (mutation.added) {
        stats.pathAdded += 1;
      }
      if (mutation.overrode) {
        stats.pathOverrode += 1;
      }
      if (mutation.noop) {
        stats.pathNoop += 1;
      }
    }

    if (hasProxyProviderDownloadConfiguredOptions() && isHttpProvider) {
      const mutation = analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["interval", "proxy", "size-limit", "header"]);
      if (mutation.added) {
        stats.downloadAdded += 1;
      }
      if (mutation.overrode) {
        stats.downloadOverrode += 1;
      }
      if (mutation.noop) {
        stats.downloadNoop += 1;
      }
    }

    if (ARGS.hasProxyProviderPayload) {
      const mutation = analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["payload"]);
      if (mutation.added) {
        stats.payloadAdded += 1;
      }
      if (mutation.overrode) {
        stats.payloadOverrode += 1;
      }
      if (mutation.noop) {
        stats.payloadNoop += 1;
      }
    }

    if (hasProxyProviderCollectionConfiguredOptions()) {
      const mutation = analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["filter", "exclude-filter", "exclude-type"]);
      if (mutation.added) {
        stats.collectionAdded += 1;
      }
      if (mutation.overrode) {
        stats.collectionOverrode += 1;
      }
      if (mutation.noop) {
        stats.collectionNoop += 1;
      }
    }

    if (hasProxyProviderOverrideConfiguredOptions()) {
      const mutation = analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["override"]);
      if (mutation.added) {
        stats.overrideAdded += 1;
      }
      if (mutation.overrode) {
        stats.overrideOverrode += 1;
      }
      if (mutation.noop) {
        stats.overrideNoop += 1;
      }
    }

    if (hasProxyProviderHealthCheckConfiguredOptions()) {
      const mutation = analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["health-check"]);
      if (mutation.added) {
        stats.healthCheckAdded += 1;
      }
      if (mutation.overrode) {
        stats.healthCheckOverrode += 1;
      }
      if (mutation.noop) {
        stats.healthCheckNoop += 1;
      }
    }
  }

  return stats;
}

// 汇总 proxy-provider 的改动样本，便于快速定位哪些 provider 被新增写入、覆盖或保持不变。
function analyzeProxyProviderMutationPreview(beforeProviders, afterProviders) {
  const source = isObject(beforeProviders) ? beforeProviders : {};
  const target = isObject(afterProviders) ? afterProviders : {};
  const preview = {
    path: createProviderMutationPreviewEntry(),
    download: createProviderMutationPreviewEntry(),
    payload: createProviderMutationPreviewEntry(),
    collection: createProviderMutationPreviewEntry(),
    override: createProviderMutationPreviewEntry(),
    healthCheck: createProviderMutationPreviewEntry()
  };

  for (const name of Object.keys(target)) {
    const beforeProvider = isObject(source[name]) ? source[name] : {};
    const afterProvider = target[name];

    if (!isObject(afterProvider)) {
      continue;
    }

    const type = normalizeStringArg(afterProvider.type || beforeProvider.type || "http").toLowerCase() || "http";
    const isHttpProvider = type === "http";

    if (ARGS.hasProxyProviderPathDir && isHttpProvider) {
      appendProviderMutationPreviewEntry(
        preview.path,
        name,
        analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["path"])
      );
    }

    if (hasProxyProviderDownloadConfiguredOptions() && isHttpProvider) {
      appendProviderMutationPreviewEntry(
        preview.download,
        name,
        analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["interval", "proxy", "size-limit", "header"])
      );
    }

    if (ARGS.hasProxyProviderPayload) {
      appendProviderMutationPreviewEntry(
        preview.payload,
        name,
        analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["payload"])
      );
    }

    if (hasProxyProviderCollectionConfiguredOptions()) {
      appendProviderMutationPreviewEntry(
        preview.collection,
        name,
        analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["filter", "exclude-filter", "exclude-type"])
      );
    }

    if (hasProxyProviderOverrideConfiguredOptions()) {
      appendProviderMutationPreviewEntry(
        preview.override,
        name,
        analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["override"])
      );
    }

    if (hasProxyProviderHealthCheckConfiguredOptions()) {
      appendProviderMutationPreviewEntry(
        preview.healthCheck,
        name,
        analyzeProviderMutationByKeys(beforeProvider, afterProvider, ["health-check"])
      );
    }
  }

  return preview;
}

// 把 proxy-provider 改动统计压成紧凑摘要，便于写入 full 日志与响应调试头。
function formatProxyProviderMutationStats(stats) {
  const source = isObject(stats) ? stats : {};
  return `total=${Number(source.total) || 0},path-added=${ARGS.hasProxyProviderPathDir ? (Number(source.pathAdded) || 0) : "off"},path-overrode=${ARGS.hasProxyProviderPathDir ? (Number(source.pathOverrode) || 0) : "off"},path-noop=${ARGS.hasProxyProviderPathDir ? (Number(source.pathNoop) || 0) : "off"},download-added=${hasProxyProviderDownloadConfiguredOptions() ? (Number(source.downloadAdded) || 0) : "off"},download-overrode=${hasProxyProviderDownloadConfiguredOptions() ? (Number(source.downloadOverrode) || 0) : "off"},download-noop=${hasProxyProviderDownloadConfiguredOptions() ? (Number(source.downloadNoop) || 0) : "off"},payload-added=${ARGS.hasProxyProviderPayload ? (Number(source.payloadAdded) || 0) : "off"},payload-overrode=${ARGS.hasProxyProviderPayload ? (Number(source.payloadOverrode) || 0) : "off"},payload-noop=${ARGS.hasProxyProviderPayload ? (Number(source.payloadNoop) || 0) : "off"},collection-added=${hasProxyProviderCollectionConfiguredOptions() ? (Number(source.collectionAdded) || 0) : "off"},collection-overrode=${hasProxyProviderCollectionConfiguredOptions() ? (Number(source.collectionOverrode) || 0) : "off"},collection-noop=${hasProxyProviderCollectionConfiguredOptions() ? (Number(source.collectionNoop) || 0) : "off"},override-added=${hasProxyProviderOverrideConfiguredOptions() ? (Number(source.overrideAdded) || 0) : "off"},override-overrode=${hasProxyProviderOverrideConfiguredOptions() ? (Number(source.overrideOverrode) || 0) : "off"},override-noop=${hasProxyProviderOverrideConfiguredOptions() ? (Number(source.overrideNoop) || 0) : "off"},health-check-added=${hasProxyProviderHealthCheckConfiguredOptions() ? (Number(source.healthCheckAdded) || 0) : "off"},health-check-overrode=${hasProxyProviderHealthCheckConfiguredOptions() ? (Number(source.healthCheckOverrode) || 0) : "off"},health-check-noop=${hasProxyProviderHealthCheckConfiguredOptions() ? (Number(source.healthCheckNoop) || 0) : "off"}`;
}

// 把 proxy-provider 改动样本预览压成紧凑摘要，便于响应调试头与 full 日志复用。
function formatProxyProviderMutationPreview(preview) {
  const source = isObject(preview) ? preview : {};
  return [
    formatProviderMutationPreviewEntry("path", source.path, ARGS.hasProxyProviderPathDir),
    formatProviderMutationPreviewEntry("download", source.download, hasProxyProviderDownloadConfiguredOptions()),
    formatProviderMutationPreviewEntry("payload", source.payload, ARGS.hasProxyProviderPayload),
    formatProviderMutationPreviewEntry("collection", source.collection, hasProxyProviderCollectionConfiguredOptions()),
    formatProviderMutationPreviewEntry("override", source.override, hasProxyProviderOverrideConfiguredOptions()),
    formatProviderMutationPreviewEntry("health-check", source.healthCheck, hasProxyProviderHealthCheckConfiguredOptions())
  ].join(",");
}

// 统一增强现有 proxy-providers，便于批量接入下载控制与 health-check 参数。
function finalizeProxyProviders(existingProviders) {
  const source = isObject(existingProviders) ? existingProviders : {};
  const result = {};
  const usedPaths = Object.create(null);
  const hasOverrideOptions = hasProxyProviderOverrideConfiguredOptions();
  const hasHealthCheckOptions = hasProxyProviderHealthCheckConfiguredOptions();

  // 先登记不会被本轮重写的 path，避免后续自动生成目录时撞上原有缓存文件。
  for (const name of Object.keys(source)) {
    const currentProvider = source[name];
    if (!isObject(currentProvider)) {
      continue;
    }

    const type = normalizeStringArg(currentProvider.type).toLowerCase();
    const isHttpProvider = type === "http";
    const shouldAssignPath = isHttpProvider && ARGS.hasProxyProviderPathDir;
    const currentPath = normalizeStringArg(currentProvider.path).replace(/\\/g, "/");

    if (currentPath && !shouldAssignPath && !usedPaths[currentPath]) {
      usedPaths[currentPath] = true;
    }
  }

  for (const name of Object.keys(source)) {
    const currentProvider = source[name];
    if (!isObject(currentProvider)) {
      result[name] = currentProvider;
      continue;
    }

    const provider = Object.assign({}, currentProvider);
    const type = normalizeStringArg(provider.type).toLowerCase();
    const isHttpProvider = type === "http";

    if (isHttpProvider && ARGS.hasProxyProviderPathDir) {
      provider.path = buildProxyProviderPath(name, provider, usedPaths);
    }

    if (ARGS.hasProxyProviderPayload) {
      provider.payload = cloneJsonCompatibleValue(ARGS.proxyProviderPayload, []);
    }

    if (isHttpProvider && ARGS.hasProxyProviderInterval) {
      provider.interval = ARGS.proxyProviderInterval;
    }

    if (isHttpProvider && ARGS.hasProxyProviderProxy) {
      provider.proxy = ARGS.proxyProviderProxy;
    }

    if (isHttpProvider && ARGS.hasProxyProviderSizeLimit) {
      provider["size-limit"] = ARGS.proxyProviderSizeLimit;
    }

    if (isHttpProvider && (ARGS.hasProxyProviderHeader || ARGS.hasProxyProviderUserAgent || ARGS.hasProxyProviderAuthorization)) {
      const headers = mergeProviderHeaders(
        provider.header,
        ARGS.hasProxyProviderUserAgent ? ARGS.proxyProviderUserAgent : "",
        ARGS.hasProxyProviderAuthorization ? ARGS.proxyProviderAuthorization : "",
        ARGS.hasProxyProviderHeader ? ARGS.proxyProviderHeader : {}
      );
      if (headers) {
        provider.header = headers;
      }
    }

    if (ARGS.hasProxyProviderFilter) {
      provider.filter = ARGS.proxyProviderFilter;
    }

    if (ARGS.hasProxyProviderExcludeFilter) {
      provider["exclude-filter"] = ARGS.proxyProviderExcludeFilter;
    }

    if (ARGS.hasProxyProviderExcludeType) {
      provider["exclude-type"] = ARGS.proxyProviderExcludeType;
    }

    if (hasOverrideOptions) {
      const override = mergeObjects(provider.override, {});

      if (ARGS.hasProxyProviderOverrideAdditionalPrefix) {
        override["additional-prefix"] = ARGS.proxyProviderOverrideAdditionalPrefix;
      }

      if (ARGS.hasProxyProviderOverrideAdditionalSuffix) {
        override["additional-suffix"] = ARGS.proxyProviderOverrideAdditionalSuffix;
      }

      if (ARGS.hasProxyProviderOverrideUdp) {
        override.udp = ARGS.proxyProviderOverrideUdp;
      }

      if (ARGS.hasProxyProviderOverrideUdpOverTcp) {
        override["udp-over-tcp"] = ARGS.proxyProviderOverrideUdpOverTcp;
      }

      if (ARGS.hasProxyProviderOverrideDown) {
        override.down = ARGS.proxyProviderOverrideDown;
      }

      if (ARGS.hasProxyProviderOverrideUp) {
        override.up = ARGS.proxyProviderOverrideUp;
      }

      if (ARGS.hasProxyProviderOverrideTfo) {
        override.tfo = ARGS.proxyProviderOverrideTfo;
      }

      if (ARGS.hasProxyProviderOverrideMptcp) {
        override.mptcp = ARGS.proxyProviderOverrideMptcp;
      }

      if (ARGS.hasProxyProviderOverrideSkipCertVerify) {
        override["skip-cert-verify"] = ARGS.proxyProviderOverrideSkipCertVerify;
      }

      if (ARGS.hasProxyProviderOverrideDialerProxy) {
        override["dialer-proxy"] = ARGS.proxyProviderOverrideDialerProxy;
      }

      if (ARGS.hasProxyProviderOverrideInterfaceName) {
        override["interface-name"] = ARGS.proxyProviderOverrideInterfaceName;
      }

      if (ARGS.hasProxyProviderOverrideRoutingMark) {
        override["routing-mark"] = ARGS.proxyProviderOverrideRoutingMark;
      }

      if (ARGS.hasProxyProviderOverrideIpVersion) {
        override["ip-version"] = ARGS.proxyProviderOverrideIpVersion;
      }

      if (ARGS.hasProxyProviderOverrideProxyNameRules) {
        override["proxy-name"] = ARGS.proxyProviderOverrideProxyNameRules.map((rule) => ({ pattern: rule.pattern, target: rule.target }));
      }

      provider.override = override;
    }

    if (hasHealthCheckOptions) {
      const healthCheck = mergeObjects(provider["health-check"], {});

      if (ARGS.hasProxyProviderHealthCheckEnable) {
        healthCheck.enable = ARGS.proxyProviderHealthCheckEnable;
      }

      if (ARGS.hasProxyProviderHealthCheckUrl) {
        healthCheck.url = ARGS.proxyProviderHealthCheckUrl;
      }

      if (ARGS.hasProxyProviderHealthCheckInterval) {
        healthCheck.interval = ARGS.proxyProviderHealthCheckInterval;
      }

      if (ARGS.hasProxyProviderHealthCheckTimeout) {
        healthCheck.timeout = ARGS.proxyProviderHealthCheckTimeout;
      }

      if (ARGS.hasProxyProviderHealthCheckLazy) {
        healthCheck.lazy = ARGS.proxyProviderHealthCheckLazy;
      }

      if (ARGS.hasProxyProviderHealthCheckExpectedStatus) {
        healthCheck["expected-status"] = ARGS.proxyProviderHealthCheckExpectedStatus;
      }

      provider["health-check"] = healthCheck;
    }

    result[name] = provider;
  }

  return result;
}

// 统一创建规则提供器对象，避免每个 provider 都手写重复字段。
function createRuleProvider(behavior, url, format) {
  const provider = {
    // 统一使用 http 远程规则。
    type: "http",
    // 传入具体行为类型，例如 domain / ipcidr / classical。
    behavior,
    // 默认规则格式是 mrs，classical 文本规则会单独传 text。
    format: format || "mrs",
    // 使用全局统一的更新间隔，允许通过脚本参数覆盖。
    interval: typeof ARGS !== "undefined" && ARGS && ARGS.hasRuleProviderInterval ? ARGS.ruleProviderInterval : RULE_INTERVAL,
    // 传入规则源地址。
    url
  };

  // 允许统一指定 rule-provider 下载代理。
  if (typeof ARGS !== "undefined" && ARGS && ARGS.hasRuleProviderProxy) {
    provider.proxy = ARGS.ruleProviderProxy;
  }

  // 允许统一指定 rule-provider 下载大小限制。
  if (typeof ARGS !== "undefined" && ARGS && ARGS.hasRuleProviderSizeLimit) {
    provider["size-limit"] = ARGS.ruleProviderSizeLimit;
  }

  // 允许统一给 rule-provider 请求补充通用 Header / UA / Authorization。
  if (typeof ARGS !== "undefined" && ARGS && (ARGS.hasRuleProviderHeader || ARGS.hasRuleProviderUserAgent || ARGS.hasRuleProviderAuthorization)) {
    const headers = mergeProviderHeaders(
      {},
      ARGS.hasRuleProviderUserAgent ? ARGS.ruleProviderUserAgent : "",
      ARGS.hasRuleProviderAuthorization ? ARGS.ruleProviderAuthorization : "",
      ARGS.hasRuleProviderHeader ? ARGS.ruleProviderHeader : {}
    );
    provider.header = headers;
  }

  return provider;
}

// 拼接 geosite 规则完整地址。
function metaGeoSite(name) {
  return `${META_URL}/geosite/${name}.mrs`;
}

// 拼接 geoip 规则完整地址。
function metaGeoIp(name) {
  return `${META_URL}/geoip/${name}.mrs`;
}

// 拼接 geo-lite 版本的 geoip 规则完整地址。
function metaGeoLiteIp(name) {
  return `${META_GEO_LITE_URL}/geoip/${name}.mrs`;
}

// 拼接 blackmatrix7 的 Clash YAML 规则地址。
function blackmatrix7ClashRule(name) {
  return `${BLACKMATRIX7_CLASH_RULE_BASE_URL}/${name}/${name}.yaml`;
}

// 拼接 Accademia Additional_Rule_For_Clash 的补充 YAML 规则地址。
function accademiaAdditionalRule(name) {
  return `${ACCADEMIA_ADDITIONAL_RULE_BASE_URL}/${name}/${name}.yaml`;
}

// 当前脚本内置的社区规则源映射；仅对明确接入的业务规则生效，其余规则继续走 MetaCubeX 默认源。
function getCommunityRuleSourceSpec(name) {
  if (normalizeRuleSourcePreset(ARGS.ruleSourcePreset, DEFAULT_RULE_SOURCE_PRESET) !== "blackmatrix7") {
    return null;
  }

  const specMap = {
    OpenAI: { behavior: "classical", format: "yaml", url: blackmatrix7ClashRule("OpenAI") },
    // blackmatrix7 社区规则里对应 Anthropic/Claude 服务的目录名当前仍是 Claude。
    Anthropic: { behavior: "classical", format: "yaml", url: blackmatrix7ClashRule("Claude") },
    Gemini: { behavior: "classical", format: "yaml", url: blackmatrix7ClashRule("Gemini") },
    Copilot: { behavior: "classical", format: "yaml", url: blackmatrix7ClashRule("Copilot") },
    GitHub: { behavior: "classical", format: "yaml", url: blackmatrix7ClashRule("GitHub") },
    OneDrive: { behavior: "classical", format: "yaml", url: blackmatrix7ClashRule("OneDrive") },
    Steam: { behavior: "classical", format: "yaml", url: blackmatrix7ClashRule("Steam") },
    SteamCN: { behavior: "classical", format: "yaml", url: blackmatrix7ClashRule("SteamCN") }
  };

  return specMap[name] || null;
}

// 统一创建“支持社区规则源预设”的规则提供器：命中预设时自动切换到对应 GitHub 社区规则。
function createPresetAwareRuleProvider(name, behavior, url, format) {
  const presetSpec = getCommunityRuleSourceSpec(name);

  if (presetSpec) {
    return createRuleProvider(presetSpec.behavior, presetSpec.url, presetSpec.format);
  }

  return createRuleProvider(behavior, url, format);
}

// 新增的开发生态细分规则目前统一采用 blackmatrix7 提供的 Clash YAML 规则。
function createDeveloperRuleProvider(name) {
  return createRuleProvider("classical", blackmatrix7ClashRule(name), "yaml");
}

// 统一合并官方 `$options` 与 `$arguments`，并让显式 `$arguments` 保持更高优先级。
const RAW_OPTIONS = typeof $options !== "undefined" ? $options : {};
const RAW_ARGUMENTS = typeof $arguments !== "undefined" ? $arguments : {};
const RUNTIME_QUERY_ARGS = parseRuntimeQueryArgs(RAW_OPTIONS);
const RUNTIME_LINK_OPTIONS = resolveRuntimeLinkOptions(RAW_OPTIONS);
const NORMALIZED_OPTION_ARGS = normalizeScriptArgs(RAW_OPTIONS);
const NORMALIZED_ARGUMENT_ARGS = normalizeScriptArgs(RAW_ARGUMENTS);
const MERGED_SCRIPT_ARGS = Object.assign(
  {},
  RUNTIME_QUERY_ARGS,
  NORMALIZED_OPTION_ARGS,
  NORMALIZED_ARGUMENT_ARGS
);
// 记录本轮参数到底来自哪几路，便于排查官方运行环境差异。
const RUNTIME_ARG_SOURCES = analyzeRuntimeArgSources(RAW_OPTIONS, RAW_ARGUMENTS, MERGED_SCRIPT_ARGS);
// 记录最终到底是哪一路参数赢了优先级，便于排查同名参数冲突。
const RUNTIME_ARG_EFFECTIVE = analyzeRuntimeArgEffectiveSources(RUNTIME_QUERY_ARGS, NORMALIZED_OPTION_ARGS, NORMALIZED_ARGUMENT_ARGS, MERGED_SCRIPT_ARGS);
// 记录当前传入参数里有哪些根本没被脚本消费到，便于快速定位拼错或暂未支持的参数。
const RUNTIME_UNUSED_ARGS = analyzeUnusedScriptArgs(MERGED_SCRIPT_ARGS);
// 解析运行环境上下文，供后续日志与兼容性提醒使用。
const RUNTIME_CONTEXT = resolveRuntimeContext(RAW_OPTIONS);
// 从合并后的参数对象读取并规范化参数。
const ARGS = resolveArgs(MERGED_SCRIPT_ARGS);
// 脚本初始化阶段就把国家正则全部编译好，后续识别节点时直接复用。
const COMPILED_COUNTRIES = buildCompiledCountries();

// 规则提供器定义。
// 后面 rules 会通过 RULE-SET,provider,target 的方式引用这里的名字。
const ruleProviders = finalizeRuleProviders({
  // 私有域名规则，局域网/保留域名直连。
  Private: createRuleProvider("domain", metaGeoSite("private")),
  // 中国大陆域名规则。
  CN: createRuleProvider("domain", metaGeoSite("cn")),
  // 广告拦截规则。
  ADBlock: createRuleProvider("domain", "https://adrules.top/adrules-mihomo.mrs"),
  // 非中国大陆域名规则。
  Geo_Not_CN: createRuleProvider("domain", metaGeoSite("geolocation-!cn")),

  // AI 服务规则。
  AI: createRuleProvider("domain", metaGeoSite("category-ai-!cn")),
  // OpenAI 官方规则。
  OpenAI: createPresetAwareRuleProvider("OpenAI", "domain", metaGeoSite("openai")),
  // Anthropic 官方规则。
  Anthropic: createPresetAwareRuleProvider("Anthropic", "domain", metaGeoSite("anthropic")),
  // Google Gemini 官方规则。
  Gemini: createPresetAwareRuleProvider("Gemini", "domain", metaGeoSite("google-gemini")),
  // Copilot 规则目前复用 GitHub 社区里维护的 Clash YAML 规则源。
  Copilot: createPresetAwareRuleProvider("Copilot", "classical", blackmatrix7ClashRule("Copilot"), "yaml"),
  // Grok 规则复用社区补充规则项目，覆盖 x.ai / grok.com 等域名。
  Grok: createRuleProvider("classical", accademiaAdditionalRule("Grok"), "yaml"),
  // Apple Intelligence / PCC / Siri AI 相关规则也走社区补充规则。
  AppleAI: createRuleProvider("classical", accademiaAdditionalRule("AppleAI"), "yaml"),
  // 自定义 ChatGPT / OpenAI 规则，用来补足本地维护的精细域名。
  ChatGPT: createRuleProvider("classical", ARGS.hasChatGptListUrl ? ARGS.chatGptListUrl : CHATGPT_LIST_URL, "text"),
  // AI 补充规则，用来承接社区里常见的 Perplexity / Cursor / HuggingFace 等额外域名。
  AIExtra: createRuleProvider("classical", ARGS.hasAiExtraListUrl ? ARGS.aiExtraListUrl : AI_EXTRA_LIST_URL, "text"),
  // 自定义加密货币规则。
  Crypto: createRuleProvider("classical", ARGS.hasCryptoListUrl ? ARGS.cryptoListUrl : CRYPTO_LIST_URL, "text"),

  // YouTube 规则。
  YouTube: createRuleProvider("domain", metaGeoSite("youtube")),
  // Google 规则。
  Google: createRuleProvider("domain", metaGeoSite("google")),
  // GitHub 规则。
  GitHub: createPresetAwareRuleProvider("GitHub", "domain", metaGeoSite("github")),
  // GitLab 规则。
  GitLab: createDeveloperRuleProvider("GitLab"),
  // Docker 规则。
  Docker: createDeveloperRuleProvider("Docker"),
  // NPM / npmjs 规则。
  Npmjs: createDeveloperRuleProvider("Npmjs"),
  // JetBrains 规则。
  Jetbrains: createDeveloperRuleProvider("Jetbrains"),
  // Vercel / Next.js / TurboRepo 等开发部署生态规则。
  Vercel: createDeveloperRuleProvider("Vercel"),
  // Python / PyPI / pypa 生态规则。
  Python: createDeveloperRuleProvider("Python"),
  // JFrog / Bintray 制品仓库规则。
  Jfrog: createDeveloperRuleProvider("Jfrog"),
  // Heroku 部署平台规则。
  Heroku: createDeveloperRuleProvider("Heroku"),
  // GitBook 文档平台规则。
  GitBook: createDeveloperRuleProvider("GitBook"),
  // SourceForge 开源下载/分发平台规则。
  SourceForge: createDeveloperRuleProvider("SourceForge"),
  // DigitalOcean 云平台/对象存储规则。
  DigitalOcean: createDeveloperRuleProvider("DigitalOcean"),
  // Anaconda / conda 数据科学与 Python 包生态规则。
  Anaconda: createDeveloperRuleProvider("Anaconda"),
  // Atlassian / Bitbucket / Trello / Statuspage 协作平台规则。
  Atlassian: createDeveloperRuleProvider("Atlassian"),
  // Notion 研发文档/协作规则。
  Notion: createDeveloperRuleProvider("Notion"),
  // Figma 设计协作规则。
  Figma: createDeveloperRuleProvider("Figma"),
  // Slack 团队协作/消息规则。
  Slack: createDeveloperRuleProvider("Slack"),
  // Dropbox 文件同步/协作规则。
  Dropbox: createDeveloperRuleProvider("Dropbox"),
  // Telegram 规则。
  Telegram: createRuleProvider("domain", metaGeoSite("telegram")),
  // Netflix 规则。
  Netflix: createRuleProvider("domain", metaGeoSite("netflix")),
  // Disney 规则。
  Disney: createRuleProvider("domain", metaGeoSite("disney")),
  // Spotify 规则。
  Spotify: createRuleProvider("domain", metaGeoSite("spotify")),
  // TikTok 规则。
  TikTok: createRuleProvider("domain", metaGeoSite("tiktok")),

  // 微软服务规则。
  Microsoft: createRuleProvider("domain", metaGeoSite("microsoft")),
  // Bing 规则。
  Bing: createRuleProvider("domain", metaGeoSite("bing")),
  // OneDrive 规则：默认走 Meta geosite；当启用 blackmatrix7 预设时自动切到社区 YAML。
  OneDrive: createPresetAwareRuleProvider("OneDrive", "domain", metaGeoSite("onedrive")),
  // Apple 规则。
  Apple: createRuleProvider("domain", metaGeoSite("apple")),
  // Apple TV+ 规则。
  AppleTV: createRuleProvider("domain", metaGeoSite("apple-tvplus")),
  // SteamFix 直连补丁规则，仅在显式开启时接入。
  ...(ARGS.steamFix
    ? { SteamFix: createRuleProvider("classical", ARGS.hasSteamFixUrl ? ARGS.steamFixUrl : STEAM_FIX_LIST_URL, "text") }
    : {}),
  // Steam 全球规则。
  Steam: createPresetAwareRuleProvider("Steam", "domain", metaGeoSite("steam")),
  // Steam 中国区规则。
  SteamCN: createPresetAwareRuleProvider("SteamCN", "domain", metaGeoSite("steam@cn")),
  // Epic Games 规则。
  Epic: createRuleProvider("domain", metaGeoSite("epicgames")),

  // Ookla Speedtest 规则。
  Speedtest: createRuleProvider("domain", metaGeoSite("ookla-speedtest")),
  // PT 下载规则。
  PT: createRuleProvider("domain", metaGeoSite("category-pt")),
  // 自定义直连列表。
  DirectList: createRuleProvider("classical", ARGS.hasDirectListUrl ? ARGS.directListUrl : DIRECT_LIST_URL, "text"),

  // 中国大陆 IP 段规则。
  CN_IP: createRuleProvider("ipcidr", metaGeoIp("cn")),
  // 私有 IP 段规则。
  Private_IP: createRuleProvider("ipcidr", metaGeoIp("private")),
  // Google IP 段规则。
  Google_IP: createRuleProvider("ipcidr", metaGeoIp("google")),
  // Telegram IP 段规则。
  Telegram_IP: createRuleProvider("ipcidr", metaGeoIp("telegram")),
  // Netflix IP 段规则。
  Netflix_IP: createRuleProvider("ipcidr", metaGeoIp("netflix")),
  // Apple IP 段规则，使用更轻量的 geo-lite 数据。
  Apple_IP: createRuleProvider("ipcidr", metaGeoLiteIp("apple"))
});

// 规则引用清单。
// 这里只描述“哪个 provider 进入哪个策略组”，真正拼 RULE-SET 字符串在 buildRules 里做。
const RULE_SET_DEFINITIONS = (() => {
  const definitions = [
  // 广告规则命中后直接交给广告拦截组处理。
  { provider: "ADBlock", target: GROUPS.ADS },
  // 私有域名走直连。
  { provider: "Private", target: GROUPS.DIRECT },
  // 私有 IP 走直连，并且不做 DNS 解析。
  { provider: "Private_IP", target: GROUPS.DIRECT, noResolve: true },

  // 自定义 ChatGPT / OpenAI 规则优先进入 AI 组。
  { provider: "ChatGPT", target: GROUPS.AI },
  // AI 补充规则进入 AI 组。
  { provider: "AIExtra", target: GROUPS.AI },
  // OpenAI 官方规则进入 AI 组。
  { provider: "OpenAI", target: GROUPS.AI },
  // Anthropic 官方规则进入 AI 组。
  { provider: "Anthropic", target: GROUPS.AI },
  // Gemini 官方规则进入 AI 组。
  { provider: "Gemini", target: GROUPS.AI },
  // Copilot 社区规则进入 AI 组。
  { provider: "Copilot", target: GROUPS.AI },
  // Grok 社区规则进入 AI 组。
  { provider: "Grok", target: GROUPS.AI },
  // Apple Intelligence / PCC 社区规则也进入 AI 组。
  { provider: "AppleAI", target: GROUPS.AI },
  // AI 域名交给 AI 组。
  { provider: "AI", target: GROUPS.AI },
  // 加密货币域名交给加密货币组。
  { provider: "Crypto", target: GROUPS.CRYPTO },

  // YouTube 流量交给 YouTube 组。
  { provider: "YouTube", target: GROUPS.YOUTUBE },
  // Google 域名交给 Google 组。
  { provider: "Google", target: GROUPS.GOOGLE },
  // GitLab 流量交给开发服务组。
  { provider: "GitLab", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // Docker 流量交给开发服务组。
  { provider: "Docker", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // NPM / npmjs 流量交给开发服务组。
  { provider: "Npmjs", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // JetBrains 流量交给开发服务组。
  { provider: "Jetbrains", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // Vercel / Next.js / TurboRepo 相关流量交给开发服务组。
  { provider: "Vercel", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // Python / PyPI 相关流量交给开发服务组。
  { provider: "Python", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // JFrog / Bintray 制品仓库流量交给开发服务组。
  { provider: "Jfrog", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // Heroku 部署平台流量交给开发服务组。
  { provider: "Heroku", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // GitBook 文档平台流量交给开发服务组。
  { provider: "GitBook", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // SourceForge 下载/分发平台流量交给开发服务组。
  { provider: "SourceForge", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // DigitalOcean 云平台流量交给开发服务组。
  { provider: "DigitalOcean", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // Anaconda / conda 数据科学开发流量交给开发服务组。
  { provider: "Anaconda", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // Atlassian / Bitbucket / Trello / Statuspage 协作平台流量交给开发服务组。
  { provider: "Atlassian", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // Notion 文档/知识库流量交给开发服务组。
  { provider: "Notion", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // Figma 设计协作流量交给开发服务组。
  { provider: "Figma", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // Slack 团队协作流量交给开发服务组。
  { provider: "Slack", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // Dropbox 文件同步/协作流量交给开发服务组。
  { provider: "Dropbox", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
  // Google IP 段交给 Google 组，并关闭解析。
  { provider: "Google_IP", target: GROUPS.GOOGLE, noResolve: true },

  // Bing 流量交给 Bing 组。
  { provider: "Bing", target: GROUPS.BING },
  // OneDrive 流量交给 OneDrive 组。
  { provider: "OneDrive", target: GROUPS.ONEDRIVE },
  // 其他微软流量交给微软服务组。
  { provider: "Microsoft", target: GROUPS.MICROSOFT },

  // Apple TV+ 流量交给 Apple 组。
  { provider: "AppleTV", target: GROUPS.APPLE },
  // Apple 域名交给 Apple 组。
  { provider: "Apple", target: GROUPS.APPLE },
  // Apple IP 段交给 Apple 组，并关闭解析。
  { provider: "Apple_IP", target: GROUPS.APPLE, noResolve: true },

  // Telegram 域名交给 Telegram 组。
  { provider: "Telegram", target: GROUPS.TELEGRAM },
  // Telegram IP 段交给 Telegram 组，并关闭解析。
  { provider: "Telegram_IP", target: GROUPS.TELEGRAM, noResolve: true },
  // TikTok 流量交给 TikTok 组。
  { provider: "TikTok", target: GROUPS.TIKTOK },

  // Netflix 域名交给 Netflix 组。
  { provider: "Netflix", target: GROUPS.NETFLIX },
  // Netflix IP 段交给 Netflix 组，并关闭解析。
  { provider: "Netflix_IP", target: GROUPS.NETFLIX, noResolve: true },
  // Disney+ 流量交给 Disney 组。
  { provider: "Disney", target: GROUPS.DISNEY },
  // Spotify 流量交给 Spotify 组。
  { provider: "Spotify", target: GROUPS.SPOTIFY },

  // Steam 全球流量交给 Steam 独立组。
  {
    provider: "Steam",
    target: GROUPS.STEAM,
    overrideKey: "steamRuleTarget",
    overrideFlagKey: "hasSteamRuleTarget",
    overrideLabel: "Steam",
    ruleOrderAnchorKey: "steamRuleAnchor",
    ruleOrderPositionKey: "steamRulePosition"
  },
  // Steam 中国区流量也交给 Steam 独立组，由组内顺序决定优先直连。
  {
    provider: "SteamCN",
    target: GROUPS.STEAM,
    overrideKey: "steamCnRuleTarget",
    overrideFlagKey: "hasSteamCnRuleTarget",
    overrideLabel: "SteamCN",
    ruleOrderAnchorKey: "steamCnRuleAnchor",
    ruleOrderPositionKey: "steamCnRulePosition"
  },
  // Epic Games 流量交给游戏组。
  { provider: "Epic", target: GROUPS.GAMES },
  // PT 下载流量交给 PT 组。
  { provider: "PT", target: GROUPS.PT },
  // Speedtest 流量交给测速组。
  { provider: "Speedtest", target: GROUPS.SPEEDTEST },
  // GitHub 流量交给 GitHub 独立组。
  {
    provider: "GitHub",
    target: GROUPS.GITHUB,
    overrideKey: "githubRuleTarget",
    overrideFlagKey: "hasGithubRuleTarget",
    overrideLabel: "GitHub",
    ruleOrderAnchorKey: "githubRuleAnchor",
    ruleOrderPositionKey: "githubRulePosition"
  },

  // 自定义直连列表强制直连。
  { provider: "DirectList", target: GROUPS.DIRECT },
  // 非大陆流量默认交给主选择组。
  { provider: "Geo_Not_CN", target: GROUPS.SELECT },
  // 中国大陆域名强制直连。
  { provider: "CN", target: GROUPS.DIRECT },
  // 中国大陆 IP 段强制直连，并关闭解析。
  { provider: "CN_IP", target: GROUPS.DIRECT, noResolve: true }
  ];

  if (ARGS.steamFix) {
    const steamIndex = definitions.findIndex((definition) => definition && definition.provider === "Steam");
    const insertIndex = steamIndex === -1 ? definitions.length : steamIndex;
    definitions.splice(insertIndex, 0, { provider: "SteamFix", target: GROUPS.DIRECT });
  }

  return definitions;
})();

// 业务链路专属摘要重点关注的规则入口。
const SERVICE_ROUTING_PROFILE_DEFINITIONS = [
  { provider: "GitHub", label: "GitHub", expectedTarget: GROUPS.GITHUB },
  { provider: "GitLab", label: "GitLab", expectedTarget: GROUPS.DEV },
  { provider: "Docker", label: "Docker", expectedTarget: GROUPS.DEV },
  { provider: "Npmjs", label: "Npmjs", expectedTarget: GROUPS.DEV },
  { provider: "Jetbrains", label: "JetBrains", expectedTarget: GROUPS.DEV },
  { provider: "Vercel", label: "Vercel", expectedTarget: GROUPS.DEV },
  { provider: "Python", label: "Python", expectedTarget: GROUPS.DEV },
  { provider: "Jfrog", label: "Jfrog", expectedTarget: GROUPS.DEV },
  { provider: "Heroku", label: "Heroku", expectedTarget: GROUPS.DEV },
  { provider: "GitBook", label: "GitBook", expectedTarget: GROUPS.DEV },
  { provider: "SourceForge", label: "SourceForge", expectedTarget: GROUPS.DEV },
  { provider: "DigitalOcean", label: "DigitalOcean", expectedTarget: GROUPS.DEV },
  { provider: "Anaconda", label: "Anaconda", expectedTarget: GROUPS.DEV },
  { provider: "Atlassian", label: "Atlassian", expectedTarget: GROUPS.DEV },
  { provider: "Notion", label: "Notion", expectedTarget: GROUPS.DEV },
  { provider: "Figma", label: "Figma", expectedTarget: GROUPS.DEV },
  { provider: "Slack", label: "Slack", expectedTarget: GROUPS.DEV },
  { provider: "Dropbox", label: "Dropbox", expectedTarget: GROUPS.DEV },
  { provider: "OneDrive", label: "OneDrive", expectedTarget: GROUPS.ONEDRIVE },
  { provider: "Steam", label: "Steam", expectedTarget: GROUPS.STEAM },
  { provider: "SteamCN", label: "SteamCN", expectedTarget: GROUPS.STEAM },
  { provider: "AIExtra", label: "AIExtra", expectedTarget: GROUPS.AI },
  { provider: "Copilot", label: "Copilot", expectedTarget: GROUPS.AI },
  { provider: "Grok", label: "Grok", expectedTarget: GROUPS.AI },
  { provider: "AppleAI", label: "AppleAI", expectedTarget: GROUPS.AI },
  { provider: "AI", label: "AI", expectedTarget: GROUPS.AI },
  { provider: "Crypto", label: "Crypto", expectedTarget: GROUPS.CRYPTO }
];

// 构造单条 RULE-SET 规则字符串。
function buildRule(provider, target, noResolve) {
  // 按 Mihomo / Clash 规则格式输出 RULE-SET 语句，可选追加 no-resolve。
  return `RULE-SET,${provider},${target}${noResolve ? ",no-resolve" : ""}`;
}

// 根据用户参数把 GitHub / Steam / SteamCN 的规则目标解析成最终可用目标；解析失败时自动回退默认值。
function resolveRuleSetDefinitions(availableTargets) {
  return RULE_SET_DEFINITIONS.map((definition) => {
    if (!definition || !definition.overrideKey || !definition.overrideFlagKey || !ARGS[definition.overrideFlagKey]) {
      return definition;
    }

    const matchedTarget = findPreferredGroupReference(availableTargets, ARGS[definition.overrideKey]);
    return Object.assign({}, definition, {
      target: matchedTarget || definition.target
    });
  });
}

// 根据用户参数把 GitHub / Steam / SteamCN 的规则入口顺序重排到指定锚点前/后；支持 top/start 与 end/match 这种特殊位置。
function applyRuleSetDefinitionOrder(ruleDefinitions) {
  let orderedDefinitions = Array.isArray(ruleDefinitions) ? ruleDefinitions.slice() : RULE_SET_DEFINITIONS.slice();
  const sourceDefinitions = Array.isArray(ruleDefinitions) ? ruleDefinitions : RULE_SET_DEFINITIONS;

  for (const definition of sourceDefinitions) {
    if (!definition || !definition.ruleOrderAnchorKey || !ARGS[definition.ruleOrderAnchorKey]) {
      continue;
    }

    const anchorResult = inspectRuleProviderReference(orderedDefinitions, ARGS[definition.ruleOrderAnchorKey]);
    if (!anchorResult.match || anchorResult.match === definition.provider) {
      continue;
    }

    orderedDefinitions = moveRuleDefinitionByAnchor(
      orderedDefinitions,
      definition.provider,
      anchorResult.match,
      definition.ruleOrderPositionKey ? ARGS[definition.ruleOrderPositionKey] : "before"
    );
  }

  if (ARGS.hasDevRuleAnchor) {
    const anchorResult = inspectRuleProviderReference(orderedDefinitions, ARGS.devRuleAnchor);
    if (anchorResult.match && !DEV_RULE_PROVIDERS.includes(anchorResult.match)) {
      orderedDefinitions = moveRuleDefinitionBlockByAnchor(
        orderedDefinitions,
        DEV_RULE_PROVIDERS,
        anchorResult.match,
        ARGS.devRulePosition
      );
    }
  }

  return orderedDefinitions;
}

// 校验 GitHub / Steam / SteamCN 规则目标参数是否真的能匹配到当前可用的策略组/内置策略。
function validateRuleTargetMarkers(availableTargets, ruleDefinitions) {
  const warnings = [];

  for (const definition of Array.isArray(ruleDefinitions) ? ruleDefinitions : []) {
    if (!definition || !definition.overrideKey || !definition.overrideFlagKey || !ARGS[definition.overrideFlagKey]) {
      continue;
    }

    const rawTarget = ARGS[definition.overrideKey];
    const matchedTarget = findPreferredGroupReference(availableTargets, rawTarget);
    if (!matchedTarget) {
      warnings.push(`${definition.overrideLabel} 规则目标未匹配到当前可用的策略组/内置策略，已回退默认目标 ${definition.target}: ${rawTarget}`);
    }
  }

  return uniqueStrings(warnings);
}

// 校验 GitHub / Steam / SteamCN 规则顺序锚点是否真的能匹配到当前规则入口，避免把规则编排参数写错后悄悄失效。
function validateRuleOrderMarkers(ruleDefinitions) {
  const warnings = [];

  for (const definition of Array.isArray(ruleDefinitions) ? ruleDefinitions : []) {
    if (!definition || !definition.ruleOrderAnchorKey || !ARGS[definition.ruleOrderAnchorKey]) {
      continue;
    }

    const rawAnchor = ARGS[definition.ruleOrderAnchorKey];
    const anchorResult = inspectRuleProviderReference(ruleDefinitions, rawAnchor);
    if (anchorResult.match === definition.provider) {
      warnings.push(`${definition.overrideLabel} 规则顺序锚点不能引用自己: ${rawAnchor}`);
      continue;
    }

    if (anchorResult.match) {
      continue;
    }

    if (anchorResult.reason === "ambiguous") {
      warnings.push(`${definition.overrideLabel} 规则顺序锚点匹配到多个规则入口，请写得更精确: ${rawAnchor}`);
      continue;
    }

    warnings.push(`${definition.overrideLabel} 规则顺序锚点未匹配到当前规则入口: ${rawAnchor}`);
  }

  return uniqueStrings(warnings);
}

// 校验开发服务规则块顺序锚点是否真的能匹配到当前规则入口，并阻止引用开发规则块自身。
function validateDevRuleOrderMarker(ruleDefinitions) {
  if (!ARGS.hasDevRuleAnchor) {
    return [];
  }

  const anchorResult = inspectRuleProviderReference(ruleDefinitions, ARGS.devRuleAnchor);
  if (anchorResult.match && DEV_RULE_PROVIDERS.includes(anchorResult.match)) {
    return [`Dev 规则顺序锚点不能引用开发规则块自身: ${ARGS.devRuleAnchor}`];
  }

  if (anchorResult.match) {
    return [];
  }

  if (anchorResult.reason === "ambiguous") {
    return [`Dev 规则顺序锚点匹配到多个规则入口，请写得更精确: ${ARGS.devRuleAnchor}`];
  }

  return [`Dev 规则顺序锚点未匹配到当前规则入口: ${ARGS.devRuleAnchor}`];
}

// 校验 custom-rule-anchor 是否真的能匹配到当前 RULE-SET 入口，避免自定义规则重排参数写错后静默失效。
function validateCustomRuleOrderMarker(ruleDefinitions, configuredRules) {
  const rawConfiguredRuleList = Array.isArray(configuredRules) ? configuredRules.slice() : [];
  const rawExtraRules = uniqueStrings(rawConfiguredRuleList).filter((rule) => !/^MATCH,/i.test(normalizeStringArg(rule)));

  if (!ARGS.hasCustomRuleAnchor || rawExtraRules.length === 0) {
    return [];
  }

  const anchorResult = inspectRuleProviderReference(ruleDefinitions, ARGS.customRuleAnchor);
  if (anchorResult.match) {
    return [];
  }

  if (anchorResult.reason === "ambiguous") {
    return [`custom-rule-anchor 匹配到多个规则入口，请写得更精确: ${ARGS.customRuleAnchor}`];
  }

  return [`custom-rule-anchor 未匹配到当前规则入口: ${ARGS.customRuleAnchor}`];
}

// 校验显式 group-order 里的 token 是否都能匹配到最终策略组或分组桶，避免布局参数写错后静默失效。
function validateGroupOrderTokens(proxyGroups, countryConfigs) {
  if (!ARGS.hasGroupOrder) {
    return [];
  }

  const countryGroupNames = (Array.isArray(countryConfigs) ? countryConfigs : [])
    .map((country) => country && country.name)
    .filter(Boolean);
  const regionGroupNames = buildRegionGroupConfigs(countryConfigs, ARGS.regionGroupKeys)
    .map((region) => region && region.name)
    .filter(Boolean);
  const orderState = resolveConfiguredProxyGroupOrder(proxyGroups, countryGroupNames, regionGroupNames);

  return orderState.unresolvedTokens.map((token) => `group-order 条目未匹配到当前策略组/分组桶: ${token}`);
}

// 把规则顺序参数格式化成单行摘要，便于日志与响应头快速观察实际启用的编排方式。
function buildRuleOrderSummary(anchor, position) {
  const marker = normalizeStringArg(anchor);

  if (!marker) {
    return "default";
  }

  return `${normalizeRuleOrderPosition(position, "before")}:${marker}`;
}

// 把单条最终规则压成可读摘要，便于快速观察“谁排在前面、谁会先吃到流量”。
function describeTrafficRule(rule) {
  const source = normalizeStringArg(rule);

  if (!source) {
    return "";
  }

  if (/^AND,\(\(DST-PORT,443\),\(NETWORK,UDP\)\),REJECT$/i.test(source)) {
    return "QUIC-REJECT";
  }

  const parts = source.split(",");
  const type = normalizeStringArg(parts[0]).toUpperCase();
  let targetIndex = parts.length - 1;

  while (targetIndex > 0 && ["no-resolve", "src"].includes(normalizeStringArg(parts[targetIndex]).toLowerCase())) {
    targetIndex -= 1;
  }

  const target = sanitizeProviderPreviewName(parts[targetIndex] || "");

  if (type === "RULE-SET") {
    const provider = sanitizeProviderPreviewName(parts[1] || "");
    const group = sanitizeProviderPreviewName(parts[2] || "");
    return `${provider}->${group}${/no-resolve/i.test(source) ? ":NR" : ""}`;
  }

  if (type === "MATCH") {
    return `MATCH->${target || GROUPS.SELECT}`;
  }

  return `${type || "RULE"}->${target || "unknown"}`;
}

// 把最终规则链的优先级压成单行摘要，便于直接看出实际匹配顺序。
function buildTrafficPrioritySummary(rules, generatedRules, configuredRules) {
  const currentRules = Array.isArray(rules) ? rules : [];
  const baseRules = Array.isArray(generatedRules) ? uniqueStrings(generatedRules) : [];
  const generatedBodyRules = baseRules.filter((rule) => !/^MATCH,/i.test(normalizeStringArg(rule)));
  const rawConfiguredRuleList = Array.isArray(configuredRules) ? uniqueStrings(configuredRules) : [];
  const effectiveExtraRules = rawConfiguredRuleList
    .filter((rule) => !/^MATCH,/i.test(normalizeStringArg(rule)))
    .filter((rule) => !generatedBodyRules.includes(rule));
  const head = currentRules.slice(0, 6).map((rule) => describeTrafficRule(rule)).filter(Boolean);
  const tail = currentRules.slice(-4).map((rule) => describeTrafficRule(rule)).filter(Boolean);
  const mergeOrder = effectiveExtraRules.length
    ? (ARGS.hasCustomRuleAnchor
      ? `script+config@${buildRuleOrderSummary(ARGS.customRuleAnchor, ARGS.customRulePosition)}>match`
      : "script>config>match")
    : "script>match";

  return `match=first,order=${mergeOrder},head=${formatProviderPreviewNames(head, 6, 24)},tail=${formatProviderPreviewNames(tail, 4, 24)}`;
}

// 按规则语义给最终 rules 分层，便于把“哪些流量先走”拆成更直观的阶段结构。
function classifyTrafficRuleLayer(rule) {
  const source = normalizeStringArg(rule);

  if (!source) {
    return "unknown";
  }

  if (/^AND,\(\(DST-PORT,443\),\(NETWORK,UDP\)\),REJECT$/i.test(source)) {
    return "block";
  }

  const parts = source.split(",");
  const type = normalizeStringArg(parts[0]).toUpperCase();

  if (type === "MATCH") {
    return "match";
  }

  if (type !== "RULE-SET") {
    return "custom";
  }

  const provider = normalizeStringArg(parts[1]);

  if (provider === "ADBlock") {
    return "block";
  }

  if (["Private", "Private_IP"].includes(provider)) {
    return "local";
  }

  if (["ChatGPT", "OpenAI", "Anthropic", "Gemini", "AI", "Crypto"].includes(provider)) {
    return "ai-crypto";
  }

  if (provider === "DirectList") {
    return "direct";
  }

  if (provider === "Geo_Not_CN") {
    return "overseas";
  }

  if (["CN", "CN_IP"].includes(provider)) {
    return "cn";
  }

  if (ruleProviders[provider]) {
    return "service";
  }

  return "custom";
}

// 给规则层级打短标签，便于压进响应调试头与 full 日志。
function formatTrafficRuleLayerTag(layer) {
  const aliasMap = {
    block: "block",
    local: "local",
    "ai-crypto": "ai",
    service: "service",
    direct: "direct",
    overseas: "overseas",
    cn: "cn",
    custom: "custom",
    match: "match",
    unknown: "unknown"
  };

  return aliasMap[normalizeStringArg(layer)] || "unknown";
}

// 把最终规则按层级聚合成区间统计，便于快速观察每一层占了多少条、排在第几段。
function analyzeRuleLayering(rules) {
  const currentRules = Array.isArray(rules) ? rules : [];
  const layerEntries = [];
  const previewEntries = [];
  let customCount = 0;
  let matchIndex = -1;

  for (let index = 0; index < currentRules.length; index += 1) {
    const rule = currentRules[index];
    const layer = classifyTrafficRuleLayer(rule);
    const tag = formatTrafficRuleLayerTag(layer);
    const desc = describeTrafficRule(rule);

    if (layer === "custom") {
      customCount += 1;
    }

    if (layer === "match" && matchIndex === -1) {
      matchIndex = index;
    }

    let currentLayerEntry = layerEntries[layerEntries.length - 1];
    if (!currentLayerEntry || currentLayerEntry.layer !== layer) {
      currentLayerEntry = {
        layer,
        tag,
        count: 0,
        start: index,
        end: index,
        sample: desc || tag
      };
      layerEntries.push(currentLayerEntry);
    }

    currentLayerEntry.count += 1;
    currentLayerEntry.end = index;

    if (currentLayerEntry.sample && !previewEntries.includes(`${currentLayerEntry.tag}@${currentLayerEntry.start + 1}=${currentLayerEntry.sample}`)) {
      previewEntries.push(`${currentLayerEntry.tag}@${currentLayerEntry.start + 1}=${currentLayerEntry.sample}`);
    }
  }

  return {
    total: currentRules.length,
    layers: layerEntries.length,
    customCount,
    matchIndex: matchIndex === -1 ? currentRules.length - 1 : matchIndex,
    orderEntries: layerEntries.map((entry) => `${entry.tag}:${entry.count}@${entry.start + 1}-${entry.end + 1}`),
    previewEntries
  };
}

// 把规则层级统计压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatRuleLayeringSummary(source) {
  const current = isObject(source) ? source : {};
  return `total=${Number(current.total) || 0},layers=${Number(current.layers) || 0},custom=${Number(current.customCount) || 0},match=${Number(current.matchIndex) + 1 || 0},order=${formatProviderPreviewNames(current.orderEntries, 8, 18)}`;
}

// 把规则层级样本压成预览字符串，便于直接看出各层第一条规则分别是什么。
function formatRuleLayeringPreview(source) {
  const current = isObject(source) ? source : {};
  return formatProviderPreviewNames(current.previewEntries, 8, 24);
}

// 提取单条规则的类型与目标组，便于统计自定义规则主要是什么类型、最终打到哪里。
function inspectTrafficRuleShape(rule) {
  const source = normalizeStringArg(rule);

  if (!source) {
    return { type: "", target: "" };
  }

  if (/^AND,\(\(DST-PORT,443\),\(NETWORK,UDP\)\),REJECT$/i.test(source)) {
    return { type: "AND", target: "REJECT" };
  }

  const parts = source.split(",");
  const type = normalizeStringArg(parts[0]).toUpperCase();
  let targetIndex = parts.length - 1;

  while (targetIndex > 0 && ["no-resolve", "src"].includes(normalizeStringArg(parts[targetIndex]).toLowerCase())) {
    targetIndex -= 1;
  }

  return {
    type,
    target: normalizeStringArg(parts[targetIndex])
  };
}

// 单独分析 config.rules 在最终规则链里的有效插入区间，便于快速判断外部自定义规则到底插进了哪里。
function analyzeCustomRuleWindow(generatedRules, configuredRules, finalRules) {
  const baseRules = Array.isArray(generatedRules) ? uniqueStrings(generatedRules) : [];
  const mergedRules = Array.isArray(finalRules) ? uniqueStrings(finalRules) : [];
  const generatedBodyRules = baseRules.filter((rule) => !/^MATCH,/i.test(normalizeStringArg(rule)));
  const rawConfiguredRuleList = Array.isArray(configuredRules) ? configuredRules.slice() : [];
  const uniqueConfiguredRules = uniqueStrings(rawConfiguredRuleList);
  const rawMatchCount = rawConfiguredRuleList.filter((rule) => /^MATCH,/i.test(normalizeStringArg(rule))).length;
  const rawExtraRules = uniqueConfiguredRules.filter((rule) => !/^MATCH,/i.test(normalizeStringArg(rule)));
  const effectiveExtraRules = rawExtraRules.filter((rule) => !generatedBodyRules.includes(rule));
  const effectiveIndexes = effectiveExtraRules
    .map((rule) => mergedRules.findIndex((item) => normalizeStringArg(item) === normalizeStringArg(rule)))
    .filter((index) => index >= 0);
  const typeCounts = Object.create(null);
  const targetCounts = Object.create(null);

  for (const rule of effectiveExtraRules) {
    const shape = inspectTrafficRuleShape(rule);
    if (shape.type) {
      typeCounts[shape.type] = (typeCounts[shape.type] || 0) + 1;
    }
    if (shape.target) {
      targetCounts[shape.target] = (targetCounts[shape.target] || 0) + 1;
    }
  }

  const topTypes = Object.keys(typeCounts)
    .sort((left, right) => {
      const diff = typeCounts[right] - typeCounts[left];
      return diff !== 0 ? diff : left.localeCompare(right);
    })
    .map((type) => `${sanitizeProviderPreviewName(type)}:${typeCounts[type]}`);
  const topTargets = Object.keys(targetCounts)
    .sort((left, right) => {
      const diff = targetCounts[right] - targetCounts[left];
      return diff !== 0 ? diff : left.localeCompare(right);
    })
    .map((target) => `${sanitizeProviderPreviewName(target)}:${targetCounts[target]}`);
  const warnings = [];

  if (rawMatchCount > 0) {
    warnings.push(`当前 config.rules 中包含 ${rawMatchCount} 条 MATCH；为保证最终规则链只有一个兜底 MATCH，这些自定义 MATCH 在合并时已被移除`);
  }

  if (rawExtraRules.length > 0 && effectiveExtraRules.length === 0) {
    warnings.push(`当前 config.rules 去重并剔除 MATCH 后共有 ${rawExtraRules.length} 条自定义规则，但没有新的有效规则插入最终 rules；它们可能都与脚本已有规则重复`);
  }

  if (ARGS.hasCustomRuleAnchor && rawExtraRules.length === 0) {
    warnings.push(`已设置 custom-rule-anchor=${ARGS.customRuleAnchor}，但当前 config.rules 没有可插入的有效自定义规则`);
  }

  return {
    rawCount: rawExtraRules.length,
    effectiveCount: effectiveExtraRules.length,
    rawMatchCount,
    startIndex: effectiveIndexes.length ? Math.min(...effectiveIndexes) : -1,
    endIndex: effectiveIndexes.length ? Math.max(...effectiveIndexes) : -1,
    previewEntries: effectiveExtraRules.map((rule) => describeTrafficRule(rule)),
    topTypes,
    topTargets,
    warnings: uniqueStrings(warnings)
  };
}

// 把自定义规则区间统计压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatCustomRuleWindowSummary(source) {
  const current = isObject(source) ? source : {};
  return `raw=${Number(current.rawCount) || 0},effective=${Number(current.effectiveCount) || 0},match-stripped=${Number(current.rawMatchCount) || 0},start=${Number(current.startIndex) >= 0 ? Number(current.startIndex) + 1 : 0},end=${Number(current.endIndex) >= 0 ? Number(current.endIndex) + 1 : 0},types=${formatProviderPreviewNames(current.topTypes, 3, 18)},targets=${formatProviderPreviewNames(current.topTargets, 3, 18)}`;
}

// 把自定义规则区间样本压成预览字符串，便于快速确认真正插入的规则长什么样。
function formatCustomRuleWindowPreview(source) {
  const current = isObject(source) ? source : {};
  return formatProviderPreviewNames(current.previewEntries, 6, 24);
}

// 聚焦几条真正决定 GitHub / Steam / SteamCN 先后关系的关键规则窗口，便于直接看“谁卡在谁前面”。
function analyzeKeyRuleWindows(rules) {
  const currentRules = Array.isArray(rules) ? rules : [];
  const describedRules = currentRules.map((rule) => describeTrafficRule(rule));
  const definitions = []
    .concat(ARGS.steamFix ? [{ key: "SteamFix", label: "SteamFix", kind: "business" }] : [])
    .concat([
    { key: "Geo_Not_CN", label: "Geo_Not_CN", kind: "blocker" },
    { key: "DirectList", label: "DirectList", kind: "blocker" },
    { key: "CN", label: "CN", kind: "blocker" },
    { key: "CN_IP", label: "CN_IP", kind: "blocker" },
    { key: "GitHub", label: "GitHub", kind: "business" },
    { key: "Steam", label: "Steam", kind: "business" },
    { key: "SteamCN", label: "SteamCN", kind: "business" },
    { key: "MATCH", label: "MATCH", kind: "match" }
  ]);
  const result = {
    foundCount: 0,
    blockerCount: 0,
    businessCount: 0,
    missingCount: 0,
    matchIndex: -1,
    orderEntries: [],
    previewEntries: []
  };

  for (const definition of definitions) {
    const index = describedRules.findIndex((item) => definition.key === "MATCH"
      ? /^MATCH->/i.test(normalizeStringArg(item))
      : normalizeStringArg(item).indexOf(`${definition.key}->`) === 0
    );

    if (index === -1) {
      result.missingCount += 1;
      continue;
    }

    result.foundCount += 1;

    if (definition.kind === "blocker") {
      result.blockerCount += 1;
    } else if (definition.kind === "business") {
      result.businessCount += 1;
    } else if (definition.kind === "match") {
      result.matchIndex = index;
    }

    const previousRule = index > 0 ? describedRules[index - 1] : "START";
    const currentRule = describedRules[index] || definition.label;
    const nextRule = index < describedRules.length - 1 ? describedRules[index + 1] : "END";

    result.orderEntries.push(`${definition.label}@${index + 1}`);
    result.previewEntries.push(`${definition.label}@${index + 1}[${previousRule} < ${currentRule} < ${nextRule}]`);
  }

  return result;
}

// 把关键命中窗口统计压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatKeyRuleWindowSummary(source) {
  const current = isObject(source) ? source : {};
  return `found=${Number(current.foundCount) || 0},blockers=${Number(current.blockerCount) || 0},business=${Number(current.businessCount) || 0},missing=${Number(current.missingCount) || 0},match=${Number(current.matchIndex) >= 0 ? Number(current.matchIndex) + 1 : 0},order=${formatProviderPreviewNames(current.orderEntries, 8, 18)}`;
}

// 把关键命中窗口样本压成预览字符串，便于直接看出关键规则的前后邻居。
function formatKeyRuleWindowPreview(source) {
  const current = isObject(source) ? source : {};
  return formatProviderPreviewNames(current.previewEntries, 6, 48);
}

// 把规则层级与目标组做交叉统计，便于直接看出每一层主要把流量送到了哪些组。
function analyzeRuleLayerTargetMapping(rules) {
  const currentRules = Array.isArray(rules) ? rules : [];
  const layerCounts = Object.create(null);
  const targetCounts = Object.create(null);
  const crossCounts = Object.create(null);

  for (const rule of currentRules) {
    const layer = formatTrafficRuleLayerTag(classifyTrafficRuleLayer(rule));
    const shape = inspectTrafficRuleShape(rule);
    const target = sanitizeProviderPreviewName(shape.target || "unknown");
    const crossKey = `${layer}->${target}`;

    layerCounts[layer] = (layerCounts[layer] || 0) + 1;
    targetCounts[target] = (targetCounts[target] || 0) + 1;
    crossCounts[crossKey] = (crossCounts[crossKey] || 0) + 1;
  }

  const layerEntries = Object.keys(layerCounts)
    .sort((left, right) => {
      const diff = layerCounts[right] - layerCounts[left];
      return diff !== 0 ? diff : left.localeCompare(right);
    })
    .map((layer) => `${layer}:${layerCounts[layer]}`);
  const targetEntries = Object.keys(targetCounts)
    .sort((left, right) => {
      const diff = targetCounts[right] - targetCounts[left];
      return diff !== 0 ? diff : left.localeCompare(right);
    })
    .map((target) => `${target}:${targetCounts[target]}`);
  const crossEntries = Object.keys(crossCounts)
    .sort((left, right) => {
      const diff = crossCounts[right] - crossCounts[left];
      return diff !== 0 ? diff : left.localeCompare(right);
    })
    .map((entry) => `${entry}:${crossCounts[entry]}`);

  return {
    total: currentRules.length,
    layers: Object.keys(layerCounts).length,
    targets: Object.keys(targetCounts).length,
    layerEntries,
    targetEntries,
    crossEntries
  };
}

// 把规则层级 -> 目标组的交叉统计压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatRuleLayerTargetMappingSummary(source) {
  const current = isObject(source) ? source : {};
  return `total=${Number(current.total) || 0},layers=${Number(current.layers) || 0},targets=${Number(current.targets) || 0},top-layers=${formatProviderPreviewNames(current.layerEntries, 3, 18)},top-targets=${formatProviderPreviewNames(current.targetEntries, 3, 18)}`;
}

// 把规则层级 -> 目标组的主要交叉项压成预览字符串，便于快速看出哪一层主要送往哪个组。
function formatRuleLayerTargetMappingPreview(source) {
  const current = isObject(source) ? source : {};
  return formatProviderPreviewNames(current.crossEntries, 8, 26);
}

// 单独聚焦 AI / Crypto / GitHub / Steam / SteamCN 等业务规则的前后 2 跳窗口，便于快速看出它们被谁夹在中间。
function analyzeServiceRuleWindows(rules) {
  const currentRules = Array.isArray(rules) ? rules : [];
  const describedRules = currentRules.map((rule) => describeTrafficRule(rule));
  const definitions = [
    { key: "ChatGPT", label: "ChatGPT", category: "ai" },
    { key: "AIExtra", label: "AIExtra", category: "ai" },
    { key: "OpenAI", label: "OpenAI", category: "ai" },
    { key: "Anthropic", label: "Anthropic", category: "ai" },
    { key: "Gemini", label: "Gemini", category: "ai" },
    { key: "Copilot", label: "Copilot", category: "ai" },
    { key: "Grok", label: "Grok", category: "ai" },
    { key: "AppleAI", label: "AppleAI", category: "ai" },
    { key: "AI", label: "AI", category: "ai" },
    { key: "Crypto", label: "Crypto", category: "trade" },
    { key: "GitHub", label: "GitHub", category: "dev" },
    { key: "GitLab", label: "GitLab", category: "dev" },
    { key: "Docker", label: "Docker", category: "dev" },
    { key: "Npmjs", label: "Npmjs", category: "dev" },
    { key: "Jetbrains", label: "JetBrains", category: "dev" },
    { key: "Vercel", label: "Vercel", category: "dev" },
    { key: "Python", label: "Python", category: "dev" },
    { key: "Jfrog", label: "Jfrog", category: "dev" },
    { key: "Heroku", label: "Heroku", category: "dev" },
    { key: "GitBook", label: "GitBook", category: "dev" },
    { key: "SourceForge", label: "SourceForge", category: "dev" },
    { key: "DigitalOcean", label: "DigitalOcean", category: "dev" },
    { key: "Anaconda", label: "Anaconda", category: "dev" },
    { key: "Atlassian", label: "Atlassian", category: "dev" },
    { key: "Notion", label: "Notion", category: "dev" },
    { key: "Figma", label: "Figma", category: "dev" },
    { key: "Slack", label: "Slack", category: "dev" },
    { key: "Dropbox", label: "Dropbox", category: "dev" },
    { key: "Steam", label: "Steam", category: "game" },
    { key: "SteamCN", label: "SteamCN", category: "game" }
  ];
  const result = {
    tracked: definitions.length,
    foundCount: 0,
    aiCount: 0,
    devCount: 0,
    tradeCount: 0,
    gameCount: 0,
    missingCount: 0,
    firstIndex: -1,
    lastIndex: -1,
    orderEntries: [],
    previewEntries: []
  };

  for (const definition of definitions) {
    const index = describedRules.findIndex((item) => normalizeStringArg(item).indexOf(`${definition.key}->`) === 0);

    if (index === -1) {
      result.missingCount += 1;
      continue;
    }

    result.foundCount += 1;

    if (definition.category === "ai") {
      result.aiCount += 1;
    } else if (definition.category === "dev") {
      result.devCount += 1;
    } else if (definition.category === "trade") {
      result.tradeCount += 1;
    } else if (definition.category === "game") {
      result.gameCount += 1;
    }

    result.firstIndex = result.firstIndex === -1 ? index : Math.min(result.firstIndex, index);
    result.lastIndex = result.lastIndex === -1 ? index : Math.max(result.lastIndex, index);

    const previousRules = describedRules.slice(Math.max(0, index - 2), index);
    const nextRules = describedRules.slice(index + 1, index + 3);
    result.orderEntries.push(`${definition.label}@${index + 1}`);
    result.previewEntries.push(
      `${definition.label}@${index + 1}[prev=${formatProviderPreviewNames(previousRules, 2, 22)},curr=${describedRules[index] || definition.label},next=${formatProviderPreviewNames(nextRules, 2, 22)}]`
    );
  }

  return result;
}

// 把业务规则窗口统计压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatServiceRuleWindowSummary(source) {
  const current = isObject(source) ? source : {};
  const spanStart = Number(current.firstIndex);
  const spanEnd = Number(current.lastIndex);
  const span = spanStart >= 0 && spanEnd >= 0 ? `${spanStart + 1}-${spanEnd + 1}` : "0-0";
  return `tracked=${Number(current.tracked) || 0},found=${Number(current.foundCount) || 0},ai=${Number(current.aiCount) || 0},dev=${Number(current.devCount) || 0},trade=${Number(current.tradeCount) || 0},game=${Number(current.gameCount) || 0},missing=${Number(current.missingCount) || 0},span=${span},order=${formatProviderPreviewNames(current.orderEntries, 6, 14)}`;
}

// 把业务规则窗口样本压成预览字符串，便于直接看出这些业务规则的前后 2 跳邻居。
function formatServiceRuleWindowPreview(source) {
  const current = isObject(source) ? source : {};
  return formatProviderPreviewNames(current.previewEntries, 4, 64);
}

// 汇总规则入口最终会打到哪些目标组，并统计各目标组承接了多少条业务规则。
function analyzeRuleTargetMapping(ruleDefinitions, rules) {
  const definitions = Array.isArray(ruleDefinitions) ? ruleDefinitions : [];
  const targetCounts = Object.create(null);
  const previewEntries = [];

  for (const definition of definitions) {
    if (!isObject(definition) || !normalizeStringArg(definition.provider) || !normalizeStringArg(definition.target)) {
      continue;
    }

    const provider = normalizeStringArg(definition.provider);
    const target = normalizeStringArg(definition.target);
    previewEntries.push(`${sanitizeProviderPreviewName(provider)}->${sanitizeProviderPreviewName(target)}${definition.noResolve ? ":NR" : ""}`);
    targetCounts[target] = (targetCounts[target] || 0) + 1;
  }

  const targetEntries = Object.keys(targetCounts)
    .sort((left, right) => {
      const countDiff = targetCounts[right] - targetCounts[left];
      return countDiff !== 0 ? countDiff : left.localeCompare(right);
    })
    .map((target) => `${sanitizeProviderPreviewName(target)}:${targetCounts[target]}`);
  const currentRules = Array.isArray(rules) ? rules : [];
  const matchRule = currentRules.find((rule) => /^MATCH,/i.test(normalizeStringArg(rule)));
  const matchTarget = matchRule ? describeTrafficRule(matchRule).replace(/^MATCH->/, "") : GROUPS.SELECT;

  return {
    total: previewEntries.length,
    uniqueTargets: Object.keys(targetCounts).length,
    directCount: Number(targetCounts[GROUPS.DIRECT] || 0) + Number(targetCounts[BUILTIN_DIRECT] || 0),
    selectCount: Number(targetCounts[GROUPS.SELECT] || 0),
    matchTarget,
    previewEntries,
    targetEntries
  };
}

// 把规则入口 -> 目标组的统计压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatRuleTargetMappingSummary(source) {
  const current = isObject(source) ? source : {};
  return `total=${Number(current.total) || 0},targets=${Number(current.uniqueTargets) || 0},direct=${Number(current.directCount) || 0},select=${Number(current.selectCount) || 0},match=${sanitizeProviderPreviewName(current.matchTarget || GROUPS.SELECT)},top=${formatProviderPreviewNames(current.targetEntries, 3, 22)}`;
}

// 把规则入口最终映射的样本压成预览字符串，便于快速确认各业务规则被打到了哪里。
function formatRuleTargetMappingPreview(source) {
  const current = isObject(source) ? source : {};
  return formatProviderPreviewNames(current.previewEntries, 8, 24);
}

// 按 provider 名查找当前规则定义中的位置，便于判断“谁排在谁前面”。
function findRuleDefinitionIndex(ruleDefinitions, provider) {
  return (Array.isArray(ruleDefinitions) ? ruleDefinitions : []).findIndex((definition) => isObject(definition) && definition.provider === provider);
}

// 分析宽泛规则是否排在特定业务规则前面，避免目标流量被更早的规则入口提前吃掉。
function analyzeRulePriorityRisks(ruleDefinitions) {
  const definitions = Array.isArray(ruleDefinitions) ? ruleDefinitions : [];
  const result = {
    total: 0,
    geoOverrideCount: 0,
    cnOverrideCount: 0,
    directListOverrideCount: 0,
    previewEntries: [],
    warnings: []
  };

  function addRisk(category, blockerProvider, blockedProvider, message) {
    const blockerIndex = findRuleDefinitionIndex(definitions, blockerProvider);
    const blockedIndex = findRuleDefinitionIndex(definitions, blockedProvider);

    if (blockerIndex === -1 || blockedIndex === -1 || blockerIndex >= blockedIndex) {
      return;
    }

    result.total += 1;

    if (category === "geo") {
      result.geoOverrideCount += 1;
    } else if (category === "cn") {
      result.cnOverrideCount += 1;
    } else if (category === "directlist") {
      result.directListOverrideCount += 1;
    }

    result.previewEntries.push(`${sanitizeProviderPreviewName(blockerProvider)}>${sanitizeProviderPreviewName(blockedProvider)}`);
    result.warnings.push(message);
  }

  addRisk(
    "geo",
    "Geo_Not_CN",
    "GitHub",
    "GitHub 规则当前排在 Geo_Not_CN 之后；Geo_Not_CN 是更宽泛的海外规则，GitHub 流量可能会先命中节点选择而不是 GitHub 独立组"
  );
  addRisk(
    "geo",
    "Geo_Not_CN",
    "Steam",
    "Steam 规则当前排在 Geo_Not_CN 之后；Geo_Not_CN 是更宽泛的海外规则，Steam 全球流量可能会先命中节点选择而不是 Steam 独立组"
  );
  addRisk(
    "cn",
    "CN",
    "SteamCN",
    "SteamCN 规则当前排在 CN 之后；CN 是更宽泛的中国大陆规则，Steam 中国区流量可能会先命中全球直连而不是 Steam 独立组"
  );
  addRisk(
    "cn",
    "CN_IP",
    "SteamCN",
    "SteamCN 规则当前排在 CN_IP 之后；CN_IP 是更宽泛的中国大陆 IP 规则，Steam 中国区 IP 流量可能会先命中全球直连而不是 Steam 独立组"
  );
  addRisk(
    "directlist",
    "DirectList",
    "GitHub",
    "GitHub 规则当前排在 DirectList 之后；如果自定义直连列表与 GitHub 规则有重叠，相关流量会先命中全球直连而不是 GitHub 独立组"
  );
  addRisk(
    "directlist",
    "DirectList",
    "Steam",
    "Steam 规则当前排在 DirectList 之后；如果自定义直连列表与 Steam 规则有重叠，相关流量会先命中全球直连而不是 Steam 独立组"
  );
  addRisk(
    "directlist",
    "DirectList",
    "SteamCN",
    "SteamCN 规则当前排在 DirectList 之后；如果自定义直连列表与 SteamCN 规则有重叠，相关流量会先命中全球直连而不是 Steam 独立组"
  );

  result.previewEntries = uniqueStrings(result.previewEntries);
  result.warnings = uniqueStrings(result.warnings);
  return result;
}

// 把规则优先级风险统计压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatRulePriorityRiskSummary(source) {
  const current = isObject(source) ? source : {};
  return `total=${Number(current.total) || 0},geo-overrides=${Number(current.geoOverrideCount) || 0},cn-overrides=${Number(current.cnOverrideCount) || 0},directlist-overrides=${Number(current.directListOverrideCount) || 0}`;
}

// 把规则优先级风险样本压成预览字符串，便于快速确认是哪几条宽泛规则抢先了。
function formatRulePriorityRiskPreview(source) {
  const current = isObject(source) ? source : {};
  return formatProviderPreviewNames(current.previewEntries, 6, 20);
}

// 根据是否启用 QUIC 构建完整规则列表。
function buildRules(quicEnabled, ruleDefinitions) {
  // 用数组按顺序收集所有规则。
  const rules = [];
  // 没有显式传入时回退静态规则定义。
  const definitions = Array.isArray(ruleDefinitions) ? ruleDefinitions : RULE_SET_DEFINITIONS;

  // 如果禁用 QUIC，就显式拒绝 UDP 443，避免应用偷偷走 QUIC 绕过预期分流。
  if (!quicEnabled) {
    rules.push("AND,((DST-PORT,443),(NETWORK,UDP)),REJECT");
  }

  // 逐个把 RULE_SET_DEFINITIONS 映射为真正的 RULE-SET 字符串。
  for (const definition of definitions) {
    rules.push(buildRule(definition.provider, definition.target, definition.noResolve));
  }

  // 最后一条必须是 MATCH，把剩余流量全部交给主选择组。
  rules.push(`MATCH,${GROUPS.SELECT}`);
  // 最后再做一次字符串去重，防止后续扩展时意外重复。
  return uniqueStrings(rules);
}

// 在最终策略组列表里按名称查找单个组，便于构建关键组顺序摘要。
function findProxyGroupByName(proxyGroups, name) {
  return (Array.isArray(proxyGroups) ? proxyGroups : []).find((group) => isObject(group) && group.name === name) || null;
}

// 把单个关键策略组的候选顺序压成可读摘要，便于判断组内“谁排在前面”。
function formatProxyGroupPriorityEntry(group) {
  const current = isObject(group) ? group : null;

  if (!current || !normalizeStringArg(current.name)) {
    return "";
  }

  const type = normalizeStringArg(current.type) || "select";
  const proxies = Array.isArray(current.proxies) ? current.proxies : [];
  const extraFlags = [];

  if (current["include-all"]) {
    extraFlags.push("all");
  } else {
    if (current["include-all-proxies"]) {
      extraFlags.push("all-proxies");
    }

    if (current["include-all-providers"]) {
      extraFlags.push("all-providers");
    }
  }

  if (Array.isArray(current.use) && current.use.length) {
    extraFlags.push(`use:${formatProviderPreviewNames(current.use, 2, 12)}`);
  }

  return `${sanitizeProviderPreviewName(current.name)}[${type}]=${formatProviderPreviewNames(proxies, 3, 14)}${extraFlags.length ? `/${extraFlags.join("/")}` : ""}`;
}

// 把最终策略组在配置里的排列顺序压成单行摘要，便于区分“展示顺序”和“规则优先级”。
function buildProxyGroupOrderSummary(proxyGroups) {
  const names = (Array.isArray(proxyGroups) ? proxyGroups : []).map((group) => group && group.name).filter(Boolean);
  return `count=${names.length},order=${formatProviderPreviewNames(names, 10, 16)}`;
}

// 汇总几个最关键策略组的候选顺序，方便直接看出选择组/独立组/广告组内部谁排在前面。
function buildProxyGroupPrioritySummary(proxyGroups) {
  const keyNames = [GROUPS.SELECT, GROUPS.FALLBACK, GROUPS.AI, GROUPS.GITHUB, GROUPS.DEV, GROUPS.STEAM, GROUPS.DIRECT, GROUPS.ADS];
  const entries = keyNames
    .map((name) => formatProxyGroupPriorityEntry(findProxyGroupByName(proxyGroups, name)))
    .filter(Boolean);

  return entries.length ? entries.join("; ") : "none";
}

// 查找某个候选在策略组 proxies 列表中的位置，找不到时返回 -1。
function findProxyGroupCandidateIndex(group, candidate) {
  const proxies = Array.isArray(isObject(group) ? group.proxies : null) ? group.proxies : [];
  return proxies.findIndex((item) => item === candidate);
}

// 分析关键策略组的候选链顺序是否偏离脚本原本意图，避免 DIRECT / REJECT / FALLBACK / SELECT 排位异常。
function analyzeProxyGroupPriorityRisks(proxyGroups) {
  const result = {
    total: 0,
    directGroupCount: 0,
    adsGroupCount: 0,
    selectChainCount: 0,
    serviceChainCount: 0,
    modeCount: 0,
    previewEntries: [],
    warnings: []
  };

  function addRisk(category, groupName, tag, message) {
    result.total += 1;

    if (category === "direct-group") {
      result.directGroupCount += 1;
    } else if (category === "ads-group") {
      result.adsGroupCount += 1;
    } else if (category === "select-chain") {
      result.selectChainCount += 1;
    } else if (category === "service-chain") {
      result.serviceChainCount += 1;
    } else if (category === "mode-chain") {
      result.modeCount += 1;
    }

    result.previewEntries.push(`${sanitizeProviderPreviewName(groupName)}>${tag}`);
    result.warnings.push(message);
  }

  function inspectDirectFirstServiceGroup(name, label) {
    const group = findProxyGroupByName(proxyGroups, name);
    if (!group) {
      return;
    }

    const directIndex = findProxyGroupCandidateIndex(group, BUILTIN_DIRECT);
    const selectIndex = findProxyGroupCandidateIndex(group, GROUPS.SELECT);

    if (directIndex === -1) {
      addRisk("service-chain", name, "missing-DIRECT", `${label} ${name} 当前候选链里缺少 DIRECT；这类服务原本设计为直连优先，缺少 DIRECT 后可能更早走代理链`);
      return;
    }

    if (selectIndex !== -1 && directIndex > selectIndex) {
      addRisk("service-chain", name, "SELECT-before-DIRECT", `${label} ${name} 当前候选链里 节点选择 排在 DIRECT 前面；这类服务原本设计为直连优先，相关流量可能更早走主选择而不是直连`);
    }
  }

  function inspectDeveloperGroup(name, label) {
    const group = findProxyGroupByName(proxyGroups, name);
    if (!group) {
      return;
    }

    const githubIndex = findProxyGroupCandidateIndex(group, GROUPS.GITHUB);
    const selectIndex = findProxyGroupCandidateIndex(group, GROUPS.SELECT);

    if (githubIndex === -1) {
      addRisk("service-chain", name, "missing-GitHub", `${label} ${name} 当前候选链里缺少 ${GROUPS.GITHUB}；开发生态流量会失去与 GitHub 独立组联动的默认入口`);
      return;
    }

    if (selectIndex !== -1 && githubIndex > selectIndex) {
      addRisk("service-chain", name, "SELECT-before-GitHub", `${label} ${name} 当前候选链里 ${GROUPS.SELECT} 排在 ${GROUPS.GITHUB} 前面；开发生态流量可能不会优先走 GitHub / 开发链路`);
    }
  }

  function inspectModeSensitiveGroup(name, label, mode) {
    const group = findProxyGroupByName(proxyGroups, name);
    if (!group) {
      return;
    }

    const currentMode = normalizeStringArg(mode).toLowerCase();
    const directIndex = findProxyGroupCandidateIndex(group, BUILTIN_DIRECT);
    const selectIndex = findProxyGroupCandidateIndex(group, GROUPS.SELECT);

    if (currentMode === "direct") {
      if (directIndex === -1) {
        addRisk("mode-chain", name, "missing-DIRECT", `${label} ${name} 当前处于 direct 模式，但候选链里缺少 DIRECT；相关流量无法真正按直连优先执行`);
      } else if (selectIndex !== -1 && directIndex > selectIndex) {
        addRisk("mode-chain", name, "SELECT-before-DIRECT", `${label} ${name} 当前处于 direct 模式，但 节点选择 排在 DIRECT 前面；相关流量可能不会先走直连`);
      }
      return;
    }

    if (currentMode === "proxy" && directIndex !== -1 && selectIndex !== -1 && directIndex < selectIndex) {
      addRisk("mode-chain", name, "DIRECT-before-SELECT", `${label} ${name} 当前处于 proxy 模式，但 DIRECT 仍排在 节点选择 前面；相关流量可能比预期更早走直连`);
    }
  }

  const directGroup = findProxyGroupByName(proxyGroups, GROUPS.DIRECT);
  if (directGroup) {
    const directIndex = findProxyGroupCandidateIndex(directGroup, BUILTIN_DIRECT);
    const selectIndex = findProxyGroupCandidateIndex(directGroup, GROUPS.SELECT);

    if (directIndex !== 0) {
      addRisk("direct-group", GROUPS.DIRECT, "DIRECT-not-first", `${GROUPS.DIRECT} 当前第一个候选不是 DIRECT；这个组本应作为全局直连开关，DIRECT 不在最前会改变预期行为`);
    }

    if (selectIndex === -1) {
      addRisk("direct-group", GROUPS.DIRECT, "missing-SELECT", `${GROUPS.DIRECT} 当前候选链里缺少 ${GROUPS.SELECT}；这个组失去回退到主选择的能力`);
    }
  }

  const adsGroup = findProxyGroupByName(proxyGroups, GROUPS.ADS);
  if (adsGroup) {
    const proxies = Array.isArray(adsGroup.proxies) ? adsGroup.proxies : [];
    const firstProxy = proxies[0] || "";

    if (!["REJECT", "REJECT-DROP"].includes(firstProxy)) {
      addRisk("ads-group", GROUPS.ADS, "REJECT-not-first", `${GROUPS.ADS} 当前第一个候选不是 REJECT / REJECT-DROP；广告流量可能不会第一时间被拦截`);
    }

    if (!proxies.includes("REJECT") && !proxies.includes("REJECT-DROP")) {
      addRisk("ads-group", GROUPS.ADS, "missing-REJECT", `${GROUPS.ADS} 当前候选链里既没有 REJECT 也没有 REJECT-DROP；广告组可能失去拦截能力`);
    }
  }

  const selectGroup = findProxyGroupByName(proxyGroups, GROUPS.SELECT);
  if (selectGroup) {
    const fallbackIndex = findProxyGroupCandidateIndex(selectGroup, GROUPS.FALLBACK);
    const manualIndex = findProxyGroupCandidateIndex(selectGroup, GROUPS.MANUAL);
    const directIndex = findProxyGroupCandidateIndex(selectGroup, BUILTIN_DIRECT);

    if (fallbackIndex === -1) {
      addRisk("select-chain", GROUPS.SELECT, "missing-FALLBACK", `${GROUPS.SELECT} 当前候选链里缺少 ${GROUPS.FALLBACK}；主选择将失去自动测速回退链`);
    }

    if (manualIndex === -1) {
      addRisk("select-chain", GROUPS.SELECT, "missing-MANUAL", `${GROUPS.SELECT} 当前候选链里缺少 ${GROUPS.MANUAL}；主选择将失去手动全量切换入口`);
    }

    if (fallbackIndex !== -1 && manualIndex !== -1 && fallbackIndex > manualIndex) {
      addRisk("select-chain", GROUPS.SELECT, "MANUAL-before-FALLBACK", `${GROUPS.SELECT} 当前候选链里 ${GROUPS.MANUAL} 排在 ${GROUPS.FALLBACK} 前面；主选择可能更偏向手动入口而不是自动优选链`);
    }

    if (fallbackIndex !== -1 && directIndex !== -1 && directIndex < fallbackIndex) {
      addRisk("select-chain", GROUPS.SELECT, "DIRECT-before-FALLBACK", `${GROUPS.SELECT} 当前候选链里 DIRECT 排在 ${GROUPS.FALLBACK} 前面；主选择可能比预期更早走直连而不是自动测速链`);
    }
  }

  inspectDirectFirstServiceGroup(GROUPS.BING, "Bing 组");
  inspectDirectFirstServiceGroup(GROUPS.APPLE, "Apple 组");
  inspectDirectFirstServiceGroup(GROUPS.PT, "PT 组");
  inspectDirectFirstServiceGroup(GROUPS.SPEEDTEST, "Speedtest 组");
  inspectDeveloperGroup(GROUPS.DEV, "开发服务组");
  inspectModeSensitiveGroup(GROUPS.DEV, "开发服务组", ARGS.devMode);
  inspectModeSensitiveGroup(GROUPS.GITHUB, "GitHub 组", ARGS.githubMode);
  inspectModeSensitiveGroup(GROUPS.STEAM, "Steam 组", ARGS.steamMode);

  result.previewEntries = uniqueStrings(result.previewEntries);
  result.warnings = uniqueStrings(result.warnings);
  return result;
}

// 把策略组候选链风险统计压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatProxyGroupPriorityRiskSummary(source) {
  const current = isObject(source) ? source : {};
  return `total=${Number(current.total) || 0},direct-group=${Number(current.directGroupCount) || 0},ads-group=${Number(current.adsGroupCount) || 0},select-chain=${Number(current.selectChainCount) || 0},service-chain=${Number(current.serviceChainCount) || 0},mode=${Number(current.modeCount) || 0}`;
}

// 把策略组候选链风险样本压成预览字符串，便于快速确认是哪些组、哪种顺序异常。
function formatProxyGroupPriorityRiskPreview(source) {
  const current = isObject(source) ? source : {};
  return formatProviderPreviewNames(current.previewEntries, 6, 22);
}

// 把关键策略组的候选链压成简短片段，便于拼成整条分流链路摘要。
function buildTrafficChainGroupEntry(proxyGroups, groupName) {
  const group = findProxyGroupByName(proxyGroups, groupName);

  if (!group) {
    return "";
  }

  const proxies = Array.isArray(group.proxies) ? group.proxies : [];
  return `${sanitizeProviderPreviewName(groupName)}=${formatProviderPreviewNames(proxies, 3, 14)}`;
}

// 统一按“用户显式优先链 > 脚本默认优先链”解析国家组，避免 AI / Crypto / 诊断逻辑各写一份。
function buildPreferredCountryGroups(countryConfigs, preferredCountries, defaultMarkersList) {
  return buildPreferredCountryResolution(countryConfigs, preferredCountries, defaultMarkersList).groups;
}

// 同时构造国家优先链的“最终命中组 + 来源追踪 + 摘要”，避免主流程里为每条链重复拼装。
function buildPreferredCountryResolution(countryConfigs, preferredCountries, defaultMarkersList, defaultSourceKey) {
  if (Array.isArray(preferredCountries) && preferredCountries.length) {
    const markerResolutions = analyzePreferredCountryMarkerResolutions(countryConfigs, preferredCountries);
    const entries = [];
    for (const item of markerResolutions) {
      if (Array.isArray(item.entries) && item.entries.length) {
        entries.push.apply(entries, item.entries);
      }
    }
    const groups = extractPreferredCountryGroupsFromEntries(entries);
    return {
      groups,
      entries,
      summary: formatPreferredCountryGroupSummary(groups),
      trace: formatPreferredCountryGroupTrace(entries),
      explain: formatPreferredCountryMarkerResolutionSummary(markerResolutions),
      unmatched: formatPreferredCountryUnmatchedSummary(markerResolutions.filter((item) => !item.matched).map((item) => item.token))
    };
  }

  const groups = (Array.isArray(defaultMarkersList) ? defaultMarkersList : [])
    .map((markers) => findCountryGroup(countryConfigs, markers))
    .filter(Boolean);
  const entries = createPreferredCountryGroupEntries(groups, "default", defaultSourceKey || "default", "auto");
  const markerResolutions = entries.length
    ? [{
      token: "auto",
      matched: true,
      entries,
      groups,
      sourceType: "default",
      sourceKey: defaultSourceKey || "default",
      sourceToken: "auto"
    }]
    : [];
  return {
    groups,
    entries,
    summary: formatPreferredCountryGroupSummary(groups),
    trace: formatPreferredCountryGroupTrace(entries),
    explain: formatPreferredCountryMarkerResolutionSummary(markerResolutions),
    unmatched: "none"
  };
}

// 汇总“请求 -> 规则 -> 目标组 -> 组内候选链”的关键链路，便于快速观察整条分流路径。
function analyzeRoutingChain(runtimeContext, queryArgs, rules, ruleDefinitions, proxyGroups) {
  const context = isObject(runtimeContext) ? runtimeContext : {};
  const currentRules = Array.isArray(rules) ? rules : [];
  const definitions = Array.isArray(ruleDefinitions) ? ruleDefinitions : [];
  const query = isObject(queryArgs) ? queryArgs : {};
  const keyProviders = ["ADBlock"]
    .concat(ARGS.steamFix ? ["SteamFix"] : [])
    .concat(["GitHub", "GitLab", "Docker", "Npmjs", "Jetbrains", "Vercel", "Python", "Jfrog", "Heroku", "GitBook", "SourceForge", "DigitalOcean", "Anaconda", "Atlassian", "Notion", "Figma", "Slack", "Dropbox", "OneDrive", "Steam", "SteamCN", "Geo_Not_CN", "CN", "DirectList"]);
  const ruleEntries = keyProviders
    .map((provider) => {
      const definition = definitions.find((item) => isObject(item) && item.provider === provider);
      return definition ? `${sanitizeProviderPreviewName(provider)}->${sanitizeProviderPreviewName(definition.target)}${definition.noResolve ? ":NR" : ""}` : "";
    })
    .filter(Boolean);
  const groupEntries = [GROUPS.SELECT, GROUPS.GITHUB, GROUPS.DEV, GROUPS.STEAM, GROUPS.DIRECT, GROUPS.ADS]
    .map((groupName) => buildTrafficChainGroupEntry(proxyGroups, groupName))
    .filter(Boolean);
  const matchRule = currentRules.find((rule) => /^MATCH,/i.test(normalizeStringArg(rule)));
  const matchTarget = matchRule ? describeTrafficRule(matchRule).replace(/^MATCH->/, "") : GROUPS.SELECT;
  const firstRule = currentRules.length ? describeTrafficRule(currentRules[0]) : "none";
  const routeMarker = `${sanitizeProviderPreviewName(context.routeKind || "unknown")}:${sanitizeProviderPreviewName(context.routeName || "unknown")}`;
  const routeTarget = sanitizeProviderPreviewName(context.routeTarget || context.queryTarget || context.target || "unknown");

  return {
    routeMarker,
    routeTarget,
    queryArgCount: Object.keys(query).length,
    rulesCount: currentRules.length,
    firstRule,
    matchTarget,
    ruleEntries,
    groupEntries
  };
}

// 把整条分流链路压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatRoutingChainSummary(source) {
  const current = isObject(source) ? source : {};
  return `route=${current.routeMarker || "unknown:unknown"},target=${current.routeTarget || "unknown"},query=${Number(current.queryArgCount) || 0},rules=${Number(current.rulesCount) || 0},first=${sanitizeProviderPreviewName(current.firstRule || "none")},match=${sanitizeProviderPreviewName(current.matchTarget || GROUPS.SELECT)}`;
}

// 把整条分流链路的关键规则映射与关键组候选链压成预览字符串。
function formatRoutingChainPreview(source) {
  const current = isObject(source) ? source : {};
  return `rules=${formatProviderPreviewNames(current.ruleEntries, 6, 24)},groups=${formatProviderPreviewNames(current.groupEntries, 5, 22)}`;
}

// 单独聚焦 GitHub / Steam / SteamCN / AI / Crypto 等关键业务的规则入口与候选链，便于直接看“这类流量到底会怎么走”。
function analyzeServiceRoutingProfiles(ruleDefinitions, proxyGroups, countryConfigs) {
  const definitions = Array.isArray(ruleDefinitions) ? ruleDefinitions : [];
  const countries = Array.isArray(countryConfigs) ? countryConfigs : [];
  const cryptoPreferredGroupLookup = createLookup(
    buildPreferredCountryGroups(countries, ARGS.cryptoPreferCountries, DEFAULT_CRYPTO_PREFERRED_COUNTRY_MARKERS)
      .map((group) => group && group.name)
      .filter(Boolean)
  );
  const devPreferredGroupLookup = createLookup(
    (ARGS.hasDevPreferCountries ? resolvePreferredCountryGroups(countries, ARGS.devPreferCountries) : [])
      .map((group) => group && group.name)
      .filter(Boolean)
  );
  const hasDeveloperLeadingOverrides = !!(ARGS.hasDevPreferCountries || ARGS.hasDevPreferGroups || ARGS.hasDevPreferNodes);
  const expectedDeveloperFirstProxy = ARGS.devMode === "direct"
    ? BUILTIN_DIRECT
    : (hasDeveloperLeadingOverrides ? "" : GROUPS.GITHUB);
  const result = {
    total: 0,
    expectedTargetCount: 0,
    directTargetCount: 0,
    selectTargetCount: 0,
    latencyGroupCount: 0,
    directFirstCount: 0,
    missingGroupCount: 0,
    previewEntries: [],
    warnings: []
  };

  for (const profile of SERVICE_ROUTING_PROFILE_DEFINITIONS) {
    const definition = definitions.find((item) => isObject(item) && item.provider === profile.provider);
    const target = normalizeStringArg(definition && definition.target) || profile.expectedTarget;
    const targetGroup = findProxyGroupByName(proxyGroups, target);
    const groupType = targetGroup
      ? (normalizeStringArg(targetGroup.type) || "select")
      : (BUILTIN_POLICY_NAMES.includes(target) ? "builtin" : "missing");
    const groupProxies = Array.isArray(targetGroup && targetGroup.proxies) ? targetGroup.proxies : [];
    const firstProxy = groupProxies[0] || (target === BUILTIN_DIRECT ? BUILTIN_DIRECT : "");
    const ruleIndex = findRuleDefinitionIndex(definitions, profile.provider);

    result.total += 1;
    if (target === profile.expectedTarget) {
      result.expectedTargetCount += 1;
    }
    if (target === GROUPS.SELECT) {
      result.selectTargetCount += 1;
    }
    if ([BUILTIN_DIRECT, GROUPS.DIRECT].includes(target)) {
      result.directTargetCount += 1;
    }
    if (["url-test", "fallback", "load-balance"].includes(groupType)) {
      result.latencyGroupCount += 1;
    }
    if (firstProxy === BUILTIN_DIRECT) {
      result.directFirstCount += 1;
    }
    if (!targetGroup && !BUILTIN_POLICY_NAMES.includes(target)) {
      result.missingGroupCount += 1;
    }

    result.previewEntries.push(
      `${profile.label}@${ruleIndex === -1 ? "?" : ruleIndex + 1}->${sanitizeProviderPreviewName(target || "none")}[${sanitizeProviderPreviewName(groupType)}]=${formatProviderPreviewNames(groupProxies.length ? groupProxies : [target], 3, 14)}`
    );

    if (profile.provider === "GitHub" && [BUILTIN_DIRECT, GROUPS.DIRECT].includes(target)) {
      result.warnings.push(`GitHub 规则当前直接打到 ${target}；这会绕过 GitHub 独立组，相关流量会更偏向直连而不是 GitHub 专属候选链`);
    }

    if (DEV_RULE_PROVIDERS.includes(profile.provider) && target === GROUPS.DEV && expectedDeveloperFirstProxy && firstProxy && firstProxy !== expectedDeveloperFirstProxy) {
      result.warnings.push(`${profile.label} 当前打到 ${GROUPS.DEV}，但 ${GROUPS.DEV} 第一个候选不是 ${expectedDeveloperFirstProxy} 而是 ${firstProxy}；开发生态流量可能不会按当前 dev-mode 预期优先链执行`);
    }

    if (
      DEV_RULE_PROVIDERS.includes(profile.provider) &&
      target === GROUPS.DEV &&
      ARGS.hasDevPreferCountries &&
      !ARGS.hasDevPreferGroups &&
      !ARGS.hasDevPreferNodes &&
      ARGS.devMode !== "direct" &&
      Object.keys(devPreferredGroupLookup).length &&
      firstProxy &&
      !devPreferredGroupLookup[firstProxy]
    ) {
      result.warnings.push(`${profile.label} 当前打到 ${GROUPS.DEV}，但 ${GROUPS.DEV} 第一个候选不是开发优先国家链 ${formatProviderPreviewNames(Object.keys(devPreferredGroupLookup), 3, 12)} 中的组，而是 ${firstProxy}；相关流量可能不会先走偏好的国家节点`);
    }

    if (profile.provider === "SteamCN" && target === GROUPS.SELECT) {
      result.warnings.push(`SteamCN 规则当前直接打到 ${GROUPS.SELECT}；中国区流量会绕过 Steam 组内的直连优先链，相关请求可能不会先走 DIRECT`);
    }

    if (profile.provider === "AI" && firstProxy === BUILTIN_DIRECT) {
      result.warnings.push("AI 组当前第一个候选是 DIRECT；AIExtra / OpenAI / Anthropic / Gemini / Copilot / Grok / AppleAI 等流量可能会先走直连，而不是 AI 优先国家链");
    }

    if (profile.provider === "Crypto" && Object.keys(cryptoPreferredGroupLookup).length && firstProxy && !cryptoPreferredGroupLookup[firstProxy]) {
      result.warnings.push(`Crypto 组当前第一个候选是 ${firstProxy}，而不是预设国家优先链 ${formatProviderPreviewNames(Object.keys(cryptoPreferredGroupLookup), 3, 12)}；相关流量可能不会先走偏好的国家节点`);
    }
  }

  result.previewEntries = uniqueStrings(result.previewEntries);
  result.warnings = uniqueStrings(result.warnings);
  return result;
}

// 把关键业务链路压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatServiceRoutingProfilesSummary(source) {
  const current = isObject(source) ? source : {};
  return `total=${Number(current.total) || 0},expected=${Number(current.expectedTargetCount) || 0},direct-target=${Number(current.directTargetCount) || 0},select-target=${Number(current.selectTargetCount) || 0},latency-type=${Number(current.latencyGroupCount) || 0},direct-first=${Number(current.directFirstCount) || 0},missing=${Number(current.missingGroupCount) || 0}`;
}

// 把关键业务链路样本压成预览字符串，便于快速确认 GitHub / Steam / AI / Crypto 的实际走法。
function formatServiceRoutingProfilesPreview(source) {
  const current = isObject(source) ? source : {};
  return formatProviderPreviewNames(current.previewEntries, 5, 40);
}

// 按当前规则锚点参数计算 config.rules 的插入位置；未命中时回退到 MATCH 前。
function resolveCustomRuleInsertIndex(bodyRules, ruleDefinitions) {
  const rules = Array.isArray(bodyRules) ? bodyRules : [];

  if (!ARGS.hasCustomRuleAnchor) {
    return rules.length;
  }

  const anchorResult = inspectRuleProviderReference(ruleDefinitions, ARGS.customRuleAnchor);
  if (!anchorResult.match) {
    return rules.length;
  }

  if (anchorResult.match === RULE_ORDER_START) {
    return 0;
  }

  if (anchorResult.match === RULE_ORDER_END) {
    return rules.length;
  }

  const anchorDefinition = (Array.isArray(ruleDefinitions) ? ruleDefinitions : []).find((definition) => isObject(definition) && definition.provider === anchorResult.match);
  if (!anchorDefinition) {
    return rules.length;
  }

  const anchorRule = buildRule(anchorDefinition.provider, anchorDefinition.target, anchorDefinition.noResolve);
  const anchorIndex = rules.findIndex((rule) => normalizeStringArg(rule) === anchorRule);
  if (anchorIndex === -1) {
    return rules.length;
  }

  return ARGS.customRulePosition === "after" ? anchorIndex + 1 : anchorIndex;
}

// 把生成规则与原配置里的自定义规则合并，并允许通过 custom-rule-anchor 把 config.rules 插到任意关键规则前后。
function mergeRules(generatedRules, existingRules, ruleDefinitions) {
  // 先把脚本生成的规则去重。
  const baseRules = uniqueStrings(generatedRules);
  // 原配置里的规则也去重，但把用户自己的 MATCH 去掉，避免出现多个终结规则。
  const extraRules = uniqueStrings(existingRules).filter((rule) => !/^MATCH,/i.test(rule));
  // 取出脚本规则的最后一条。
  const lastRule = baseRules.length ? baseRules[baseRules.length - 1] : "";
  // 如果最后一条是 MATCH，就把它单独保存，后面重新放到最后。
  const matchRule = /^MATCH,/i.test(lastRule) ? lastRule : "";
  // 除最后 MATCH 之外的规则主体。
  const bodyRules = matchRule ? baseRules.slice(0, -1) : baseRules.slice();
  // 如果用户显式指定了 custom-rule-anchor，就按锚点决定 config.rules 插到哪里；否则继续维持默认“脚本主体后、MATCH 前”。
  const insertIndex = resolveCustomRuleInsertIndex(bodyRules, ruleDefinitions);
  const orderedRules = bodyRules
    .slice(0, insertIndex)
    .concat(extraRules, bodyRules.slice(insertIndex));

  // 最终顺序：按 custom-rule-anchor 插入后的规则主体 -> 单一 MATCH。
  return uniqueStrings(orderedRules.concat(matchRule ? [matchRule] : []));
}

// 在已生成的国家组里查找某个偏好国家组，例如日本/美国。
function findCountryGroup(countryConfigs, markers) {
  // 统一把单个标记转成数组，后面逻辑就能一致处理。
  const keywords = Array.isArray(markers) ? markers : [markers];

  // 遍历所有国家组配置。
  for (const config of countryConfigs) {
    // 一个国家组只要命中任一标记，就视为找到目标组。
    for (const marker of keywords) {
      if (config.name.indexOf(marker) !== -1) {
        return config;
      }
    }
  }

  return null;
}

// 把多个偏好国家组按顺序插到候选列表前面，用于实现“新加坡 > 日本 > 美国 > 香港”这类优先链。
function prependPreferredGroups(preferredGroups, proxies) {
  const preferredNames = [];

  for (const group of Array.isArray(preferredGroups) ? preferredGroups : []) {
    if (group && typeof group.name === "string" && group.name) {
      preferredNames.push(group.name);
    }
  }

  return uniqueStrings(preferredNames.concat(proxies));
}

// 把字符串形式的前置引用直接插到候选列表前面；可选保留 DIRECT 永远在最前。
function prependPreferredNames(preferredNames, proxies, keepDirectFirst) {
  const preferred = uniqueStrings(preferredNames);
  const base = uniqueStrings(proxies);

  if (keepDirectFirst) {
    return uniqueStrings([BUILTIN_DIRECT].concat(
      preferred.filter((name) => name !== BUILTIN_DIRECT),
      base.filter((name) => name !== BUILTIN_DIRECT)
    ));
  }

  return uniqueStrings(preferred.concat(base));
}

// 构造策略组布局编排专用别名表；这里的 direct 指向脚本生成的“全球直连”组，而不是内置 DIRECT。
function createProxyGroupOrderAliasMap() {
  return Object.assign({
    select: GROUPS.SELECT,
    proxy: GROUPS.SELECT,
    main: GROUPS.SELECT,
    manual: GROUPS.MANUAL,
    manualswitch: GROUPS.MANUAL,
    fallback: GROUPS.FALLBACK,
    auto: GROUPS.FALLBACK,
    autoswitch: GROUPS.FALLBACK,
    direct: GROUPS.DIRECT,
    globaldirect: GROUPS.DIRECT,
    scriptdirect: GROUPS.DIRECT,
    ai: GROUPS.AI,
    crypto: GROUPS.CRYPTO,
    apple: GROUPS.APPLE,
    microsoft: GROUPS.MICROSOFT,
    ms: GROUPS.MICROSOFT,
    google: GROUPS.GOOGLE,
    github: GROUPS.GITHUB,
    dev: GROUPS.DEV,
    developer: GROUPS.DEV,
    development: GROUPS.DEV,
    bing: GROUPS.BING,
    onedrive: GROUPS.ONEDRIVE,
    sharepoint: GROUPS.ONEDRIVE,
    skydrive: GROUPS.ONEDRIVE,
    "1drv": GROUPS.ONEDRIVE,
    telegram: GROUPS.TELEGRAM,
    youtube: GROUPS.YOUTUBE,
    netflix: GROUPS.NETFLIX,
    disney: GROUPS.DISNEY,
    disneyplus: GROUPS.DISNEY,
    spotify: GROUPS.SPOTIFY,
    tiktok: GROUPS.TIKTOK,
    steam: GROUPS.STEAM,
    game: GROUPS.GAMES,
    games: GROUPS.GAMES,
    pt: GROUPS.PT,
    speedtest: GROUPS.SPEEDTEST,
    ads: GROUPS.ADS,
    ad: GROUPS.ADS,
    other: GROUPS.OTHER,
    lowcost: GROUPS.LOW_COST,
    landing: GROUPS.LANDING
  }, createRegionGroupAliasMap());
}

// 解析策略组布局参数中的单个组引用：优先精确匹配，其次大小写无关，再尝试脚本别名，最后只接受唯一模糊命中。
function inspectProxyGroupOrderReference(availableNames, marker) {
  const names = uniqueStrings(availableNames);
  const token = normalizeStringArg(marker);

  if (!token) {
    return { match: "", recognized: false };
  }

  if (names.includes(token)) {
    return { match: token, recognized: true };
  }

  const lowerLookup = Object.create(null);
  for (const name of names) {
    const key = String(name || "").toLowerCase();
    if (key && !lowerLookup[key]) {
      lowerLookup[key] = name;
    }
  }

  const exactIgnoreCase = lowerLookup[token.toLowerCase()];
  if (exactIgnoreCase) {
    return { match: exactIgnoreCase, recognized: true };
  }

  const aliasTarget = createProxyGroupOrderAliasMap()[normalizeGroupMarkerToken(token)];
  if (aliasTarget) {
    return {
      match: names.includes(aliasTarget) ? aliasTarget : "",
      recognized: true
    };
  }

  const fuzzyMatches = names.filter((name) => String(name || "").toLowerCase().indexOf(token.toLowerCase()) !== -1);
  if (fuzzyMatches.length === 1) {
    return { match: fuzzyMatches[0], recognized: true };
  }

  return { match: "", recognized: false };
}

// 取出某个布局预设对应的 token 列表；若用户未传 preset，则回退脚本默认布局。
function buildGroupOrderPresetTokens(preset) {
  const normalizedPreset = normalizeGroupOrderPreset(preset, DEFAULT_GROUP_ORDER_PRESET);
  const tokens = GROUP_ORDER_PRESET_TOKENS[normalizedPreset];
  return Array.isArray(tokens) ? tokens.slice() : GROUP_ORDER_PRESET_TOKENS[DEFAULT_GROUP_ORDER_PRESET].slice();
}

// 汇总“理论上属于脚本自动生成”的组名集合，便于把用户自定义组识别成 extras。
function buildScriptManagedGroupNames(countryGroupNames, regionGroupNames) {
  return uniqueStrings(
    Object.keys(GROUPS)
      .map((key) => GROUPS[key])
      .concat(Array.isArray(regionGroupNames) ? regionGroupNames : [])
      .concat(Array.isArray(countryGroupNames) ? countryGroupNames : [])
  );
}

// 根据当前实际存在的组名，展开策略组布局里的 bucket token。
function buildProxyGroupOrderBuckets(groupNames, countryGroupNames, regionGroupNames) {
  const availableLookup = createLookup(groupNames);
  const scriptLookup = createLookup(buildScriptManagedGroupNames(countryGroupNames, regionGroupNames));
  const pickAvailable = (names) => uniqueStrings(names).filter((name) => availableLookup[name]);
  const extraGroupNames = groupNames.filter((name) => !scriptLookup[name]);

  return {
    core: pickAvailable([GROUPS.SELECT, GROUPS.MANUAL, GROUPS.FALLBACK, GROUPS.DIRECT]),
    services: pickAvailable([GROUPS.AI, GROUPS.TELEGRAM, GROUPS.GOOGLE, GROUPS.GITHUB, GROUPS.DEV, GROUPS.MICROSOFT, GROUPS.ONEDRIVE, GROUPS.GAMES, GROUPS.BING, GROUPS.APPLE, GROUPS.STEAM, GROUPS.PT, GROUPS.SPEEDTEST, GROUPS.CRYPTO]),
    media: pickAvailable([GROUPS.YOUTUBE, GROUPS.NETFLIX, GROUPS.DISNEY, GROUPS.SPOTIFY, GROUPS.TIKTOK]),
    regions: pickAvailable(regionGroupNames),
    countries: pickAvailable(countryGroupNames),
    helpers: pickAvailable([GROUPS.ADS, GROUPS.DIRECT, GROUPS.LANDING, GROUPS.LOW_COST, GROUPS.OTHER]),
    extras: pickAvailable(extraGroupNames)
  };
}

// 按 group-order / group-order-preset 计算最终策略组展示顺序；未命中的 token 会单独返回给告警层处理。
function resolveConfiguredProxyGroupOrder(proxyGroups, countryGroupNames, regionGroupNames) {
  const groups = Array.isArray(proxyGroups) ? proxyGroups.slice() : [];
  const groupNames = groups
    .filter((group) => isObject(group) && typeof group.name === "string" && group.name.trim())
    .map((group) => group.name.trim());
  const buckets = buildProxyGroupOrderBuckets(groupNames, countryGroupNames, regionGroupNames);
  const bucketAliasMap = {
    core: "core",
    coregroup: "core",
    coregroups: "core",
    main: "core",
    maingroup: "core",
    maingroups: "core",
    service: "services",
    services: "services",
    business: "services",
    businesses: "services",
    media: "media",
    streaming: "media",
    streamings: "media",
    region: "regions",
    regions: "regions",
    regional: "regions",
    regionals: "regions",
    continent: "regions",
    continents: "regions",
    country: "countries",
    countries: "countries",
    helper: "helpers",
    helpers: "helpers",
    extra: "extras",
    extras: "extras",
    custom: "extras",
    customs: "extras",
    user: "extras",
    users: "extras"
  };
  const tokens = ARGS.hasGroupOrder ? ARGS.groupOrder : buildGroupOrderPresetTokens(ARGS.groupOrderPreset);
  const orderedNames = [];
  const unresolvedTokens = [];

  for (const token of tokens) {
    const directMatch = inspectProxyGroupOrderReference(groupNames, token);
    if (directMatch.match) {
      orderedNames.push(directMatch.match);
      continue;
    }

    if (directMatch.recognized) {
      continue;
    }

    const bucketKey = bucketAliasMap[normalizeGroupMarkerToken(token)];
    if (bucketKey) {
      orderedNames.push(...(Array.isArray(buckets[bucketKey]) ? buckets[bucketKey] : []));
      continue;
    }

    unresolvedTokens.push(normalizeStringArg(token));
  }

  const finalNames = uniqueStrings(orderedNames.concat(groupNames));
  const groupLookup = Object.create(null);

  for (const group of groups) {
    if (group && typeof group.name === "string" && !groupLookup[group.name]) {
      groupLookup[group.name] = group;
    }
  }

  return {
    groups: finalNames.map((name) => groupLookup[name]).filter(Boolean),
    tokens: tokens.slice(),
    unresolvedTokens: uniqueStrings(unresolvedTokens.filter(Boolean))
  };
}

// 构造 GitHub / Steam 独立组“前置组”别名表，便于直接用 `manual / fallback / direct / lowcost` 这类简写。
function createPreferredGroupAliasMap() {
  return Object.assign({
    select: GROUPS.SELECT,
    proxy: GROUPS.SELECT,
    main: GROUPS.SELECT,
    manual: GROUPS.MANUAL,
    manualswitch: GROUPS.MANUAL,
    fallback: GROUPS.FALLBACK,
    auto: GROUPS.FALLBACK,
    autoswitch: GROUPS.FALLBACK,
    direct: BUILTIN_DIRECT,
    builtindirect: BUILTIN_DIRECT,
    globaldirect: GROUPS.DIRECT,
    scriptdirect: GROUPS.DIRECT,
    ai: GROUPS.AI,
    crypto: GROUPS.CRYPTO,
    apple: GROUPS.APPLE,
    microsoft: GROUPS.MICROSOFT,
    ms: GROUPS.MICROSOFT,
    google: GROUPS.GOOGLE,
    github: GROUPS.GITHUB,
    dev: GROUPS.DEV,
    developer: GROUPS.DEV,
    development: GROUPS.DEV,
    bing: GROUPS.BING,
    onedrive: GROUPS.ONEDRIVE,
    sharepoint: GROUPS.ONEDRIVE,
    skydrive: GROUPS.ONEDRIVE,
    "1drv": GROUPS.ONEDRIVE,
    telegram: GROUPS.TELEGRAM,
    youtube: GROUPS.YOUTUBE,
    netflix: GROUPS.NETFLIX,
    disney: GROUPS.DISNEY,
    disneyplus: GROUPS.DISNEY,
    spotify: GROUPS.SPOTIFY,
    tiktok: GROUPS.TIKTOK,
    steam: GROUPS.STEAM,
    game: GROUPS.GAMES,
    games: GROUPS.GAMES,
    pt: GROUPS.PT,
    speedtest: GROUPS.SPEEDTEST,
    ads: GROUPS.ADS,
    ad: GROUPS.ADS,
    other: GROUPS.OTHER,
    lowcost: GROUPS.LOW_COST,
    landing: GROUPS.LANDING,
    reject: "REJECT",
    rejectdrop: "REJECT-DROP",
    pass: "PASS",
    global: "GLOBAL",
    compatible: "COMPATIBLE"
  }, createRegionGroupAliasMap());
}

// 构造规则入口顺序编排的别名表，便于直接用 `ai / steamcn / geonotcn / match / top / end` 这类短写。
function createRuleProviderAliasMap() {
  return {
    start: RULE_ORDER_START,
    top: RULE_ORDER_START,
    first: RULE_ORDER_START,
    head: RULE_ORDER_START,
    begin: RULE_ORDER_START,
    beginning: RULE_ORDER_START,
    end: RULE_ORDER_END,
    last: RULE_ORDER_END,
    tail: RULE_ORDER_END,
    bottom: RULE_ORDER_END,
    final: RULE_ORDER_END,
    match: RULE_ORDER_END,
    adblock: "ADBlock",
    ads: "ADBlock",
    private: "Private",
    privateip: "Private_IP",
    chatgpt: "ChatGPT",
    aiextra: "AIExtra",
    moreai: "AIExtra",
    aisupplement: "AIExtra",
    perplexity: "AIExtra",
    pplx: "AIExtra",
    cursor: "AIExtra",
    huggingface: "AIExtra",
    hf: "AIExtra",
    openai: "OpenAI",
    anthropic: "Anthropic",
    gemini: "Gemini",
    copilot: "Copilot",
    grok: "Grok",
    xai: "Grok",
    appleai: "AppleAI",
    appleintelligence: "AppleAI",
    privatecloudcompute: "AppleAI",
    pcc: "AppleAI",
    ai: "AI",
    crypto: "Crypto",
    youtube: "YouTube",
    google: "Google",
    googleip: "Google_IP",
    bing: "Bing",
    onedrive: "OneDrive",
    sharepoint: "OneDrive",
    skydrive: "OneDrive",
    "1drv": "OneDrive",
    microsoft: "Microsoft",
    ms: "Microsoft",
    appletv: "AppleTV",
    apple: "Apple",
    appleip: "Apple_IP",
    telegram: "Telegram",
    telegramip: "Telegram_IP",
    tiktok: "TikTok",
    netflix: "Netflix",
    netflixip: "Netflix_IP",
    disney: "Disney",
    disneyplus: "Disney",
    spotify: "Spotify",
    steamfix: "SteamFix",
    steam: "Steam",
    steamcn: "SteamCN",
    epic: "Epic",
    game: "Epic",
    games: "Epic",
    pt: "PT",
    speedtest: "Speedtest",
    github: "GitHub",
    dev: "GitLab",
    developer: "GitLab",
    development: "GitLab",
    gitlab: "GitLab",
    docker: "Docker",
    npm: "Npmjs",
    npmjs: "Npmjs",
    jetbrains: "Jetbrains",
    vercel: "Vercel",
    nextjs: "Vercel",
    turborepo: "Vercel",
    python: "Python",
    pypi: "Python",
    pypa: "Python",
    pypaio: "Python",
    jfrog: "Jfrog",
    bintray: "Jfrog",
    artifactory: "Jfrog",
    heroku: "Heroku",
    herokuapp: "Heroku",
    gitbook: "GitBook",
    sourceforge: "SourceForge",
    sf: "SourceForge",
    fsdn: "SourceForge",
    digitalocean: "DigitalOcean",
    digitaloceanspaces: "DigitalOcean",
    doco: "DigitalOcean",
    anaconda: "Anaconda",
    conda: "Anaconda",
    atlassian: "Atlassian",
    bitbucket: "Atlassian",
    trello: "Atlassian",
    statuspage: "Atlassian",
    notion: "Notion",
    figma: "Figma",
    slack: "Slack",
    dropbox: "Dropbox",
    dbtt: "Dropbox",
    directlist: "DirectList",
    geonotcn: "Geo_Not_CN",
    geononcn: "Geo_Not_CN",
    overseas: "Geo_Not_CN",
    cn: "CN",
    cnip: "CN_IP"
  };
}

// 解析规则入口顺序锚点：优先精确匹配，其次大小写无关精确匹配，再尝试脚本内置别名，最后只接受唯一模糊命中。
function inspectRuleProviderReference(ruleDefinitions, marker) {
  const providers = uniqueStrings(
    (Array.isArray(ruleDefinitions) ? ruleDefinitions : []).map((definition) => definition && definition.provider).filter(Boolean)
  );
  const token = normalizeStringArg(marker);

  if (!token) {
    return { match: "", reason: "empty" };
  }

  if (providers.includes(token)) {
    return { match: token, reason: "exact" };
  }

  const lowerLookup = Object.create(null);
  for (const provider of providers) {
    const key = String(provider || "").toLowerCase();
    if (key && !lowerLookup[key]) {
      lowerLookup[key] = provider;
    }
  }

  const exactIgnoreCase = lowerLookup[token.toLowerCase()];
  if (exactIgnoreCase) {
    return { match: exactIgnoreCase, reason: "exactIgnoreCase" };
  }

  const aliasTarget = createRuleProviderAliasMap()[normalizeGroupMarkerToken(token)];
  if (aliasTarget === RULE_ORDER_START || aliasTarget === RULE_ORDER_END) {
    return { match: aliasTarget, reason: "alias" };
  }

  if (aliasTarget && providers.includes(aliasTarget)) {
    return { match: aliasTarget, reason: "alias" };
  }

  const fuzzyMatches = providers.filter((provider) => String(provider || "").toLowerCase().indexOf(token.toLowerCase()) !== -1);
  if (fuzzyMatches.length === 1) {
    return { match: fuzzyMatches[0], reason: "fuzzy" };
  }

  return {
    match: "",
    reason: fuzzyMatches.length > 1 ? "ambiguous" : "missing"
  };
}

// 把单个规则入口按 before/after 锚点重排到目标位置；start/end 会分别落到规则最前/最后（MATCH 之前）。
function moveRuleDefinitionByAnchor(ruleDefinitions, provider, anchor, position) {
  const definitions = Array.isArray(ruleDefinitions) ? ruleDefinitions.slice() : [];
  const currentIndex = definitions.findIndex((definition) => definition && definition.provider === provider);

  if (currentIndex === -1) {
    return definitions;
  }

  const [currentDefinition] = definitions.splice(currentIndex, 1);
  let insertIndex = 0;

  if (anchor === RULE_ORDER_END) {
    insertIndex = definitions.length;
  } else if (anchor === RULE_ORDER_START) {
    insertIndex = 0;
  } else {
    const anchorIndex = definitions.findIndex((definition) => definition && definition.provider === anchor);
    if (anchorIndex === -1) {
      definitions.splice(Math.min(currentIndex, definitions.length), 0, currentDefinition);
      return definitions;
    }

    insertIndex = position === "after" ? anchorIndex + 1 : anchorIndex;
  }

  definitions.splice(insertIndex, 0, currentDefinition);
  return definitions;
}

// 把一组规则入口按原有相对顺序整体搬到目标锚点前/后，适合开发生态这类“多条规则一起移动”的场景。
function moveRuleDefinitionBlockByAnchor(ruleDefinitions, providers, anchor, position) {
  const definitions = Array.isArray(ruleDefinitions) ? ruleDefinitions.slice() : [];
  const providerLookup = createLookup(uniqueStrings(providers));
  const blockDefinitions = definitions.filter((definition) => definition && providerLookup[definition.provider]);

  if (!blockDefinitions.length) {
    return definitions;
  }

  const remainingDefinitions = definitions.filter((definition) => !(definition && providerLookup[definition.provider]));
  let insertIndex = 0;

  if (anchor === RULE_ORDER_END) {
    insertIndex = remainingDefinitions.length;
  } else if (anchor === RULE_ORDER_START) {
    insertIndex = 0;
  } else {
    const anchorIndex = remainingDefinitions.findIndex((definition) => definition && definition.provider === anchor);
    if (anchorIndex === -1) {
      return definitions;
    }

    insertIndex = position === "after" ? anchorIndex + 1 : anchorIndex;
  }

  remainingDefinitions.splice(insertIndex, 0, ...blockDefinitions);
  return remainingDefinitions;
}

// 从“当前可用组名 + 内置策略”里解析用户传入的前置组标记。
function findPreferredGroupReference(availableNames, marker) {
  const names = uniqueStrings(availableNames);
  const token = normalizeStringArg(marker);

  if (!token) {
    return "";
  }

  // 先尝试完全匹配，保留用户原始大小写/emoji 组名写法。
  if (names.includes(token)) {
    return token;
  }

  const lowerLookup = Object.create(null);
  for (const name of names) {
    const key = String(name || "").toLowerCase();
    if (key && !lowerLookup[key]) {
      lowerLookup[key] = name;
    }
  }

  // 再尝试大小写无关精确匹配。
  const exactIgnoreCase = lowerLookup[token.toLowerCase()];
  if (exactIgnoreCase) {
    return exactIgnoreCase;
  }

  // 再尝试按脚本内置别名映射。
  const aliasMap = createPreferredGroupAliasMap();
  const aliasTarget = aliasMap[normalizeGroupMarkerToken(token)];
  if (aliasTarget && names.includes(aliasTarget)) {
    return aliasTarget;
  }

  // 最后再做一次模糊包含，但仅当唯一命中时才接受，避免歧义。
  const fuzzyMatches = names.filter((name) => String(name || "").toLowerCase().indexOf(token.toLowerCase()) !== -1);
  return fuzzyMatches.length === 1 ? fuzzyMatches[0] : "";
}

// 把用户传入的“前置组标记”解析成真实可引用的策略组/内置策略名称。
function resolvePreferredGroupReferences(availableNames, markers, excludedNames) {
  const excludedLookup = createLookup(excludedNames);
  const resolvedNames = [];

  for (const marker of Array.isArray(markers) ? markers : []) {
    const matched = findPreferredGroupReference(availableNames, marker);
    if (matched && !excludedLookup[matched]) {
      resolvedNames.push(matched);
    }
  }

  return uniqueStrings(resolvedNames);
}

// 解析 proxy-provider 引用：优先精确匹配，其次大小写无关精确匹配，最后只在唯一命中时接受模糊包含匹配。
function inspectPreferredProxyProviderReference(providerNames, marker) {
  const names = uniqueStrings(providerNames);
  const token = normalizeStringArg(marker);

  if (!token) {
    return { match: "", reason: "empty" };
  }

  if (names.includes(token)) {
    return { match: token, reason: "exact" };
  }

  const lowerLookup = Object.create(null);
  for (const name of names) {
    const key = String(name || "").toLowerCase();
    if (key && !lowerLookup[key]) {
      lowerLookup[key] = name;
    }
  }

  const exactIgnoreCase = lowerLookup[token.toLowerCase()];
  if (exactIgnoreCase) {
    return { match: exactIgnoreCase, reason: "exactIgnoreCase" };
  }

  const fuzzyMatches = names.filter((name) => String(name || "").toLowerCase().indexOf(token.toLowerCase()) !== -1);
  if (fuzzyMatches.length === 1) {
    return { match: fuzzyMatches[0], reason: "fuzzy" };
  }

  return {
    match: "",
    reason: fuzzyMatches.length > 1 ? "ambiguous" : "missing"
  };
}

// 把用户传入的 proxy-provider 标记解析成真实 provider 名称。
function resolvePreferredProxyProviderReferences(providerNames, markers) {
  const resolvedNames = [];

  for (const marker of Array.isArray(markers) ? markers : []) {
    const result = inspectPreferredProxyProviderReference(providerNames, marker);
    if (result.match) {
      resolvedNames.push(result.match);
    }
  }

  return uniqueStrings(resolvedNames);
}

// 校验 GitHub / Steam 独立组 provider 标记是否真的能匹配到当前 proxy-providers。
function validatePreferredProxyProviderMarkers(providerNames, markers, label, includeAllProviders, includeAll) {
  const warnings = [];

  if (includeAll && !uniqueStrings(providerNames).length) {
    warnings.push(`${label} include-all 已开启，但当前配置中不存在可用 proxy-providers；当前只会吸收真实节点`);
  }

  if (includeAllProviders && !uniqueStrings(providerNames).length) {
    warnings.push(`${label} include-all-providers 已开启，但当前配置中不存在可用 proxy-providers`);
  }

  if (includeAll || includeAllProviders) {
    return uniqueStrings(warnings);
  }

  for (const token of Array.isArray(markers) ? markers : []) {
    const result = inspectPreferredProxyProviderReference(providerNames, token);
    if (result.match) {
      continue;
    }

    if (result.reason === "ambiguous") {
      warnings.push(`${label} provider 标记匹配到多个 proxy-provider，请写得更精确: ${token}`);
      continue;
    }

    warnings.push(`${label} provider 标记未匹配到当前 proxy-providers: ${token}`);
  }

  return uniqueStrings(warnings);
}

// 校验 latency/load-balance 组若主要通过 proxy-providers 引入节点，Mihomo 健康检查只检查 proxies 字段这一官方语义盲区。
function validateProxyProviderHealthCheckCaveats(proxyGroups) {
  const warnings = [];

  for (const group of Array.isArray(proxyGroups) ? proxyGroups : []) {
    if (!isObject(group)) {
      continue;
    }

    const type = normalizeStringArg(group.type).toLowerCase();
    if (!["url-test", "fallback", "load-balance"].includes(type)) {
      continue;
    }

    const hasProviderPool = !!(group["include-all"] || group["include-all-providers"] || (Array.isArray(group.use) && group.use.length));
    if (!hasProviderPool) {
      continue;
    }

    const name = typeof group.name === "string" && group.name ? group.name : "(未命名测速组)";
    warnings.push(`${name}: 当前通过 proxy-providers 池引入节点；按 Mihomo 官方语义，健康检查只检查 proxies 字段，不检查 provider 内节点`);
  }

  return uniqueStrings(warnings);
}

// 解析“点名节点”标记：优先精确匹配，其次大小写无关精确匹配，最后只在唯一命中时接受模糊包含匹配。
function inspectPreferredProxyReference(proxyNames, marker) {
  const names = uniqueStrings(proxyNames);
  const token = normalizeProxyName(marker);

  if (!token) {
    return { match: "", reason: "empty" };
  }

  const entries = names.map((name) => ({
    name,
    normalized: normalizeProxyName(name),
    lower: normalizeProxyName(name).toLowerCase()
  }));

  const exactMatches = entries.filter((item) => item.normalized === token);
  if (exactMatches.length === 1) {
    return { match: exactMatches[0].name, reason: "exact" };
  }

  const ignoreCaseMatches = entries.filter((item) => item.lower === token.toLowerCase());
  if (ignoreCaseMatches.length === 1) {
    return { match: ignoreCaseMatches[0].name, reason: "ignore-case" };
  }

  if (ignoreCaseMatches.length > 1) {
    return { match: "", reason: "ambiguous" };
  }

  const fuzzyMatches = entries.filter((item) => item.lower.indexOf(token.toLowerCase()) !== -1);
  if (fuzzyMatches.length === 1) {
    return { match: fuzzyMatches[0].name, reason: "fuzzy" };
  }

  return { match: "", reason: fuzzyMatches.length > 1 ? "ambiguous" : "not-found" };
}

// 把用户传入的“点名节点标记”解析成真实代理节点名称。
function resolvePreferredProxyReferences(proxyNames, markers) {
  const resolvedNames = [];

  for (const marker of Array.isArray(markers) ? markers : []) {
    const result = inspectPreferredProxyReference(proxyNames, marker);
    if (result.match) {
      resolvedNames.push(result.match);
    }
  }

  return uniqueStrings(resolvedNames);
}

// 把单个区域标记展开成当前已生成的国家组；顺序跟随当前 countryConfigs，便于自动继承国家排序参数的效果。
function resolvePreferredRegionCountryGroups(countryConfigs, marker) {
  const definition = findRegionGroupDefinitionByToken(marker);
  if (!definition) {
    return [];
  }

  const countryKeyLookup = createLookup(uniqueStrings(definition.countryKeys || []));
  return (Array.isArray(countryConfigs) ? countryConfigs : []).filter((group) => group && countryKeyLookup[group.key]);
}

// 统一构造国家优先链“来源追踪”条目，便于 full 日志和响应头直接复用。
function createPreferredCountryGroupEntries(groups, sourceType, sourceKey, sourceToken) {
  const source = normalizeStringArg(sourceKey) || normalizeStringArg(sourceToken) || "unknown";
  const token = normalizeStringArg(sourceToken) || source;

  return (Array.isArray(groups) ? groups : [])
    .filter((group) => group && typeof group.name === "string" && group.name)
    .map((group) => ({
      group,
      name: group.name,
      sourceType: normalizeStringArg(sourceType) || "unknown",
      sourceKey: source,
      sourceToken: token
    }));
}

// 把追踪条目重新折叠回国家组对象，兼容旧逻辑仍只关心最终命中的国家组。
function extractPreferredCountryGroupsFromEntries(entries) {
  const groups = (Array.isArray(entries) ? entries : [])
    .map((entry) => entry && entry.group)
    .filter(Boolean);

  return uniqueStrings(groups.map((group) => group.name)).map((name) => groups.find((group) => group.name === name));
}

// 递归展开优先链单个标记，支持 preset -> 区域/子区域 -> 国家 逐层展开，并防止 preset 循环引用。
function resolvePreferredCountryGroupEntriesByMarker(countryConfigs, marker, visitedPresets, inheritedSource) {
  const token = String(marker || "").trim();
  if (!token) {
    return [];
  }

  const sourceInfo = isObject(inheritedSource) ? inheritedSource : null;
  const presetDefinition = findPreferredCountryPresetDefinitionByToken(token);
  if (presetDefinition) {
    const presetKey = normalizeGroupMarkerToken(presetDefinition.key);
    const currentVisited = isObject(visitedPresets) ? visitedPresets : Object.create(null);
    if (currentVisited[presetKey]) {
      return [];
    }

    const nextVisited = Object.assign(Object.create(null), currentVisited);
    nextVisited[presetKey] = true;
    return resolvePreferredCountryGroupEntries(
      countryConfigs,
      presetDefinition.markers,
      nextVisited,
      sourceInfo || {
        sourceType: "preset",
        sourceKey: presetDefinition.key,
        sourceToken: token
      }
    );
  }

  let matchedGroup = null;
  const countryDefinition = findCountryDefinitionByMarker(token);
  if (countryDefinition) {
    matchedGroup = findCountryGroup(countryConfigs, getCountryDefinitionMarkers(countryDefinition));
  }

  if (matchedGroup) {
    return createPreferredCountryGroupEntries(
      [matchedGroup],
      sourceInfo ? sourceInfo.sourceType : "country",
      sourceInfo ? sourceInfo.sourceKey : countryDefinition.name,
      sourceInfo ? sourceInfo.sourceToken : token
    );
  }

  const regionDefinition = findRegionGroupDefinitionByToken(token);
  const regionGroups = resolvePreferredRegionCountryGroups(countryConfigs, token);
  if (regionGroups.length) {
    return createPreferredCountryGroupEntries(
      regionGroups,
      sourceInfo ? sourceInfo.sourceType : "region",
      sourceInfo ? sourceInfo.sourceKey : (regionDefinition ? regionDefinition.key : token),
      sourceInfo ? sourceInfo.sourceToken : token
    );
  }

  matchedGroup = findCountryGroup(countryConfigs, [token]);
  return matchedGroup
    ? createPreferredCountryGroupEntries(
      [matchedGroup],
      sourceInfo ? sourceInfo.sourceType : "fallback",
      sourceInfo ? sourceInfo.sourceKey : token,
      sourceInfo ? sourceInfo.sourceToken : token
    )
    : [];
}

// 把用户传入的国家偏好标记解析成带来源信息的条目；支持旗帜、国家名、COUNTRY_DEFINITIONS.aliases、区域/子区域 token，以及可复用 preset。
function resolvePreferredCountryGroupEntries(countryConfigs, markers, visitedPresets, inheritedSource) {
  const entries = [];

  // 逐个处理偏好标记。
  for (const marker of Array.isArray(markers) ? markers : []) {
    entries.push.apply(entries, resolvePreferredCountryGroupEntriesByMarker(countryConfigs, marker, visitedPresets, inheritedSource));
  }

  // 对“同一来源 -> 同一国家组”的重复命中去重，避免 preset / alias 递归展开时把相同条目写多次。
  return uniqueStrings(entries.map((entry) => `${entry.sourceType}::${entry.sourceKey}::${entry.sourceToken}::${entry.name}`))
    .map((uniqueKey) => entries.find((entry) => `${entry.sourceType}::${entry.sourceKey}::${entry.sourceToken}::${entry.name}` === uniqueKey));
}

// 把用户传入的国家偏好标记解析成真实国家组；在来源追踪基础上保持旧接口兼容。
function resolvePreferredCountryGroups(countryConfigs, markers, visitedPresets, inheritedSource) {
  return extractPreferredCountryGroupsFromEntries(
    resolvePreferredCountryGroupEntries(countryConfigs, markers, visitedPresets, inheritedSource)
  );
}

// 逐个检查国家优先链 token 到底怎么解析，便于把“每个输入标记”的结果直接写到日志和响应头。
function analyzePreferredCountryMarkerResolutions(countryConfigs, markers) {
  const resolutions = [];

  for (const marker of Array.isArray(markers) ? markers : []) {
    const token = String(marker || "").trim();
    if (!token) {
      continue;
    }

    const entries = resolvePreferredCountryGroupEntriesByMarker(countryConfigs, token);
    const groups = extractPreferredCountryGroupsFromEntries(entries);
    const firstEntry = entries.length ? entries[0] : null;
    resolutions.push({
      token,
      matched: groups.length > 0,
      entries,
      groups,
      sourceType: firstEntry && firstEntry.sourceType ? firstEntry.sourceType : "unmatched",
      sourceKey: firstEntry && firstEntry.sourceKey ? firstEntry.sourceKey : token,
      sourceToken: firstEntry && firstEntry.sourceToken ? firstEntry.sourceToken : token
    });
  }

  return resolutions;
}

// 校验用户传入的国家优先链标记是否真的能匹配到“当前已生成”的国家组；区域 token 也按展开后的结果一起校验。
function validatePreferredCountryMarkers(countryConfigs, markers, label) {
  const warnings = [];

  for (const marker of Array.isArray(markers) ? markers : []) {
    const token = String(marker || "").trim();
    if (!token) {
      continue;
    }

    if (resolvePreferredCountryGroups(countryConfigs, [token]).length === 0) {
      warnings.push(`${label} 优先链标记未匹配到当前已生成的国家组: ${token}`);
    }
  }

  return uniqueStrings(warnings);
}

// 校验用户传入的前置组标记是否真的能匹配到当前可用策略组/内置策略，并阻止独立组引用自身。
function validatePreferredGroupMarkers(availableNames, markers, label, excludedNames) {
  const warnings = [];
  const excludedLookup = createLookup(excludedNames);

  for (const marker of Array.isArray(markers) ? markers : []) {
    const token = String(marker || "").trim();
    if (!token) {
      continue;
    }

    const matched = findPreferredGroupReference(availableNames, token);
    if (!matched) {
      warnings.push(`${label} 前置组标记未匹配到当前可用的策略组/内置策略: ${token}`);
      continue;
    }

    if (excludedLookup[matched]) {
      warnings.push(`${label} 前置组标记不能引用自身策略组: ${token}`);
    }
  }

  return uniqueStrings(warnings);
}

// 校验用户传入的点名节点标记是否真的能定位到唯一节点，避免模糊匹配产生歧义。
function validatePreferredProxyMarkers(proxyNames, markers, label) {
  const warnings = [];

  for (const marker of Array.isArray(markers) ? markers : []) {
    const token = String(marker || "").trim();
    if (!token) {
      continue;
    }

    const result = inspectPreferredProxyReference(proxyNames, token);
    if (result.match) {
      continue;
    }

    if (result.reason === "ambiguous") {
      warnings.push(`${label} 点名节点标记匹配到多个节点，请写得更精确: ${token}`);
      continue;
    }

    warnings.push(`${label} 点名节点标记未匹配到当前节点: ${token}`);
  }

  return uniqueStrings(warnings);
}

// 只有在用户显式开启 hidden 参数时，才把指定辅助组标记为隐藏。
function shouldHideGroup(name) {
  return ARGS.hidden && typeof name === "string" && HIDEABLE_GROUPS.includes(name);
}

// 给所有脚本生成的策略组统一挂载全局网络高级项，例如 interface-name / routing-mark。
function applyGlobalProxyGroupAdvancedOptions(group) {
  const result = Object.assign({}, isObject(group) ? group : {});

  if (ARGS.hasGroupInterfaceName) {
    result["interface-name"] = ARGS.groupInterfaceName;
  }

  if (ARGS.hasGroupRoutingMark) {
    result["routing-mark"] = ARGS.groupRoutingMark;
  }

  return result;
}

// 给所有脚本生成的策略组统一挂载展示层选项，例如 hidden。
function applyGroupPresentationOptions(group) {
  const result = applyGlobalProxyGroupAdvancedOptions(group);

  if (shouldHideGroup(result.name)) {
    result.hidden = true;
  }

  return result;
}

// 给 GitHub / Steam 这类独立组继续挂载 Mihomo 官方支持的 hidden / icon / disable-udp / interface-name / routing-mark 等高级项。
function applyProxyGroupAdvancedOptions(group, options) {
  const result = Object.assign({}, isObject(group) ? group : {});
  const custom = isObject(options) ? options : {};

  if (custom.hasHidden) {
    result.hidden = !!custom.hidden;
  }

  if (custom.hasIcon && custom.icon) {
    result.icon = custom.icon;
  }

  if (custom.hasDisableUdp) {
    result["disable-udp"] = !!custom.disableUdp;
  }

  if (custom.hasInterfaceName && custom.interfaceName) {
    result["interface-name"] = custom.interfaceName;
  }

  if (custom.hasRoutingMark) {
    result["routing-mark"] = custom.routingMark;
  }

  return result;
}

// 给所有测速类策略组统一挂载 Mihomo 支持的健康检查增强选项，并允许局部覆盖。
function applyLatencyGroupOptions(group, overrides) {
  const result = applyGroupPresentationOptions(group);
  const custom = isObject(overrides) ? overrides : {};

  result.url = custom.hasTestUrl
    ? custom.testUrl
    : (ARGS.hasTestUrl ? ARGS.testUrl : (typeof result.url === "string" && result.url ? result.url : TEST_URL));
  result.interval = custom.hasGroupInterval
    ? custom.groupInterval
    : (ARGS.hasGroupInterval ? ARGS.groupInterval : (hasOwn(result, "interval") ? result.interval : GROUP_INTERVAL));
  result.tolerance = custom.hasGroupTolerance
    ? custom.groupTolerance
    : (ARGS.hasGroupTolerance ? ARGS.groupTolerance : (hasOwn(result, "tolerance") ? result.tolerance : GROUP_TOLERANCE));
  result.lazy = custom.hasGroupLazy
    ? custom.groupLazy
    : (ARGS.hasGroupLazy ? ARGS.groupLazy : (hasOwn(result, "lazy") ? result.lazy : true));
  result.timeout = custom.hasGroupTimeout
    ? custom.groupTimeout
    : (ARGS.hasGroupTimeout ? ARGS.groupTimeout : (hasOwn(result, "timeout") ? result.timeout : GROUP_TIMEOUT));
  result["max-failed-times"] = custom.hasGroupMaxFailedTimes
    ? custom.groupMaxFailedTimes
    : (ARGS.hasGroupMaxFailedTimes ? ARGS.groupMaxFailedTimes : (hasOwn(result, "max-failed-times") ? result["max-failed-times"] : GROUP_MAX_FAILED_TIMES));
  result["expected-status"] = custom.hasGroupExpectedStatus
    ? custom.groupExpectedStatus
    : (ARGS.hasGroupExpectedStatus ? ARGS.groupExpectedStatus : (typeof result["expected-status"] === "string" && result["expected-status"] ? result["expected-status"] : GROUP_EXPECTED_STATUS));

  // 只有 load-balance 策略组才挂载 strategy；优先使用局部覆盖，其次用全局参数。
  if (normalizeStringArg(result.type).toLowerCase() === "load-balance") {
    const strategy = custom.hasGroupStrategy
      ? custom.groupStrategy
      : (ARGS.hasGroupStrategy ? ARGS.groupStrategy : normalizeLoadBalanceStrategy(result.strategy, ""));

    if (strategy) {
      result.strategy = strategy;
    }
  }

  return result;
}

// 给策略组挂上 Mihomo `include-all-proxies` 自动收集选项，便于在显式候选之外再吸收匹配到的原始节点。
function applyAutoProxyCollectionOptions(group, options) {
  const result = Object.assign({}, isObject(group) ? group : {});
  const custom = isObject(options) ? options : {};
  const hasAutoCollection = !!(custom.filter || custom.excludeFilter || custom.excludeType || custom.includeAllProxies);

  if (!hasAutoCollection) {
    return result;
  }

  result["include-all-proxies"] = true;

  if (custom.filter) {
    result.filter = custom.filter;
  }

  if (custom.excludeFilter) {
    result["exclude-filter"] = custom.excludeFilter;
  }

  if (custom.excludeType) {
    result["exclude-type"] = custom.excludeType;
  }

  return result;
}

// 给策略组挂上 Mihomo `use / include-all-providers`，便于直接吸收原配置里的 proxy-providers。
function applyProxyProviderCollectionOptions(group, options) {
  const result = Object.assign({}, isObject(group) ? group : {});
  const custom = isObject(options) ? options : {};
  const useProviders = uniqueStrings(custom.use);

  if (custom.includeAll) {
    result["include-all"] = true;
    delete result["include-all-proxies"];
    delete result["include-all-providers"];
    delete result.use;
    return result;
  }

  if (custom.includeAllProviders) {
    result["include-all-providers"] = true;
    return result;
  }

  if (useProviders.length) {
    result.use = useProviders;
  }

  return result;
}

// 判断某个策略组是否属于 Mihomo 自动收集型分组。
function isAutoCollectionGroup(group) {
  return !!(
    isObject(group) &&
    (
      group["include-all"] ||
      group["include-all-proxies"] ||
      group["include-all-providers"]
    )
  );
}

// 统计节点整体概况，方便后续日志输出和分组判断。
function analyzeProxies(proxies) {
  // 预置统计对象。
  const stats = {
    // 原始节点总数。
    total: Array.isArray(proxies) ? proxies.length : 0,
    // 有效节点数（有 name 且非空）。
    valid: 0,
    // 低倍率节点数。
    lowCost: 0,
    // 落地节点数。
    landing: 0
  };

  // 遍历所有节点做分类统计。
  for (const proxy of Array.isArray(proxies) ? proxies : []) {
    // 无效节点直接跳过。
    if (!proxy || typeof proxy.name !== "string" || !proxy.name.trim()) {
      continue;
    }

    // 统一取出干净的节点名。
    const name = proxy.name.trim();
    // 这是一个有效节点。
    stats.valid += 1;

    // 命中低倍率规则则计数。
    if (REGEX_LOW_COST.test(name)) {
      stats.lowCost += 1;
    }

    // 命中落地规则则计数。
    if (REGEX_LANDING_ISOLATE.test(name)) {
      stats.landing += 1;
    }
  }

  // 返回统计结果。
  return stats;
}

// 分析国家识别覆盖率：有多少节点被识别进国家体系，还有多少仍处于未识别状态。
function analyzeCountryCoverage(proxies) {
  // 已被国家规则识别的节点数。
  let classified = 0;
  // 未被国家规则识别的节点名称样本。
  const unclassifiedExamples = [];
  // 未被国家规则识别的节点总数。
  let unclassified = 0;

  // 逐个检查节点。
  for (const proxy of Array.isArray(proxies) ? proxies : []) {
    // 非法节点直接跳过。
    if (!isObject(proxy) || typeof proxy.name !== "string") {
      continue;
    }

    // 取出名称。
    const name = proxy.name.trim();
    // 空名跳过。
    if (!name) {
      continue;
    }

    // 低倍率节点不参与国家覆盖率统计。
    if (REGEX_LOW_COST.test(name)) {
      continue;
    }

    // landing=true 时，落地节点也不参与国家覆盖率统计。
    if (ARGS.landing && REGEX_LANDING_ISOLATE.test(name)) {
      continue;
    }

    // 判断当前节点是否命中任意国家规则。
    const matched = COMPILED_COUNTRIES.some((country) => country.regex.test(name));
    if (matched) {
      classified += 1;
      continue;
    }

    // 没命中任何国家规则时，记为未识别节点。
    unclassified += 1;
    // 只保留少量样本，避免日志过长。
    if (unclassifiedExamples.length < 10) {
      unclassifiedExamples.push(name);
    }
  }

  // 返回覆盖率分析结果。
  return {
    classified,
    unclassified,
    unclassifiedExamples
  };
}

// 统一清洗并规范代理节点名称。
// 重点处理两类问题：首尾空格/多空格，以及重复节点名。
function normalizeProxies(proxies) {
  // 记录每个“规范化后基础名称”已经出现了多少次。
  const nameCounts = Object.create(null);
  // 收集最终可用的代理节点。
  const normalizedProxies = [];
  // 记录本轮被自动改名的节点，便于日志输出。
  const renamed = [];

  // 遍历原始节点数组。
  for (const proxy of Array.isArray(proxies) ? proxies : []) {
    // 非普通对象直接跳过。
    if (!isObject(proxy) || typeof proxy.name !== "string") {
      continue;
    }

    // 先把原始名称规范化。
    const normalizedName = normalizeProxyName(proxy.name);
    // 规范化后为空的节点直接丢弃。
    if (!normalizedName) {
      continue;
    }

    // 记录当前基础名称出现次数。
    nameCounts[normalizedName] = (nameCounts[normalizedName] || 0) + 1;
    // 第一次出现保留原名，重复出现则自动追加 #序号。
    const index = nameCounts[normalizedName];
    const finalName = index === 1 ? normalizedName : `${normalizedName} #${index}`;
    // 拷贝节点对象并写入最终名称。
    const normalizedProxy = Object.assign({}, proxy, { name: finalName });

    // 记录任何“名称发生变化”的情况，包含 trim、多空格折叠、重复重命名。
    if (proxy.name !== finalName) {
      renamed.push({
        from: proxy.name,
        to: finalName
      });
    }

    // 收集到最终节点数组。
    normalizedProxies.push(normalizedProxy);
  }

  // 返回清洗后的节点和改名信息。
  return {
    proxies: normalizedProxies,
    renamed
  };
}

// 解析所有节点，提取能成立的国家分组配置。
function parseCountries(proxies) {
  // 保护性判断：没有节点就直接返回空数组。
  if (!Array.isArray(proxies) || proxies.length === 0) {
    console.warn("⚠️ 警告: 代理节点数组为空，无法解析国家信息");
    return [];
  }

  // 记录每个国家被识别到的节点数量。
  const countryCounts = Object.create(null);

  // 遍历所有代理节点，尝试给它们归属国家。
  for (const proxy of proxies) {
    // 无效节点直接跳过。
    if (!proxy || typeof proxy.name !== "string") {
      continue;
    }

    // 取出去空格后的节点名称。
    const name = proxy.name.trim();
    // 空名节点直接跳过。
    if (!name) {
      continue;
    }

    // 低倍率节点不参与国家统计，避免污染主国家分组质量。
    if (REGEX_LOW_COST.test(name)) {
      continue;
    }

    // 如果启用了 landing 隔离，则落地节点也不参与国家统计。
    if (ARGS.landing && REGEX_LANDING_ISOLATE.test(name)) {
      continue;
    }

    // 依次尝试匹配每个国家配置。
    for (const country of COMPILED_COUNTRIES) {
      // 命中某个国家后就给该国家计数 +1。
      if (country.regex.test(name)) {
        countryCounts[country.name] = (countryCounts[country.name] || 0) + 1;
        // 一个节点只归属第一个命中的国家，避免重复统计。
        break;
      }
    }
  }

  // 按 COMPILED_COUNTRIES 的顺序生成最终国家分组配置。
  const matchedCountries = COMPILED_COUNTRIES
    .map((country) => {
      // 读取当前国家的识别数量。
      const count = countryCounts[country.name] || 0;
      // 数量未超过 threshold 就不生成该国家组。
      if (count <= ARGS.threshold) {
        return null;
      }

      return {
        // 保存原始国家键名，便于后续逻辑处理。
        key: country.name,
        // 生成最终显示组名。
        name: `${country.flag} ${country.name}${NODE_SUFFIX}`,
        // 把国家 filter 暴露出去，给 include-all 策略组使用。
        filter: country.filter,
        // 顺带保存节点数量，给 full 日志输出用。
        count
      };
    })
    // 去掉未达阈值而返回的 null 项。
    .filter(Boolean);

  return sortGeoGroupConfigs(matchedCountries, ARGS.countryGroupSort);
}

// 清洗国家组 / 区域组用于名称排序的显示名，避免把开头 emoji 一起拿去做字典序比较。
function normalizeGeoGroupSortName(value) {
  return normalizeStringArg(value).replace(/^[^A-Za-z\u4e00-\u9fa5]+/, "");
}

// 按用户选择的模式重排国家组 / 区域组；默认保持脚本定义顺序，其余模式才显式改动展示与候选链顺序。
function sortGeoGroupConfigs(configs, mode) {
  const current = Array.isArray(configs) ? configs.slice() : [];
  const normalizedMode = normalizeGeoGroupSortMode(mode, "definition");

  if (normalizedMode === "definition") {
    return current;
  }

  return current
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftCount = Number(left.item && left.item.count) || 0;
      const rightCount = Number(right.item && right.item.count) || 0;
      const leftName = normalizeGeoGroupSortName(left.item && left.item.name);
      const rightName = normalizeGeoGroupSortName(right.item && right.item.name);

      if (normalizedMode === "count-desc") {
        if (rightCount !== leftCount) {
          return rightCount - leftCount;
        }

        const nameDiff = leftName.localeCompare(rightName);
        return nameDiff || (left.index - right.index);
      }

      if (normalizedMode === "count-asc") {
        if (leftCount !== rightCount) {
          return leftCount - rightCount;
        }

        const nameDiff = leftName.localeCompare(rightName);
        return nameDiff || (left.index - right.index);
      }

      if (normalizedMode === "name") {
        const nameDiff = leftName.localeCompare(rightName);
        if (nameDiff) {
          return nameDiff;
        }

        return (rightCount - leftCount) || (left.index - right.index);
      }

      if (normalizedMode === "name-desc") {
        const nameDiff = rightName.localeCompare(leftName);
        if (nameDiff) {
          return nameDiff;
        }

        return (rightCount - leftCount) || (left.index - right.index);
      }

      return left.index - right.index;
    })
    .map((entry) => entry.item);
}

// 根据已生成的国家组，再聚合出“区域级”策略组配置；只聚合当前真实存在的国家组，避免空壳区域组。
function buildRegionGroupConfigs(countryConfigs, regionKeys) {
  const availableCountries = Array.isArray(countryConfigs) ? countryConfigs : [];
  const availableRegionKeys = uniqueStrings(Array.isArray(regionKeys) ? regionKeys : []);
  const countryLookup = Object.create(null);

  for (const country of availableCountries) {
    if (!country || typeof country.key !== "string" || !country.key || typeof country.name !== "string" || !country.name) {
      continue;
    }

    countryLookup[country.key] = country;
  }

  const matchedRegions = availableRegionKeys
    .map((regionKey) => {
      const definition = REGION_GROUP_DEFINITIONS.find((item) => item.key === regionKey);
      if (!definition) {
        return null;
      }

      const matchedCountries = uniqueStrings(definition.countryKeys || [])
        .map((countryKey) => countryLookup[countryKey])
        .filter(Boolean);
      const proxies = uniqueStrings(matchedCountries.map((country) => country.name));
      if (!proxies.length) {
        return null;
      }

      return {
        key: definition.key,
        name: definition.name,
        proxies,
        count: matchedCountries.reduce((total, country) => total + (Number(country.count) || 0), 0),
        countryCount: matchedCountries.length
      };
    })
    .filter(Boolean);

  return sortGeoGroupConfigs(matchedRegions, ARGS.regionGroupSort);
}

// 把区域分组统计格式化成单行文本，便于 full 模式输出日志与响应头摘要。
function buildRegionGroupSummary(regionConfigs) {
  return (Array.isArray(regionConfigs) ? regionConfigs : [])
    .map((region) => `${region.name}(${region.countryCount}组/${region.count}节点)`)
    .join(" / ");
}

// 构造一个普通 select 策略组。
function createSelectGroup(name, proxies) {
  return applyGroupPresentationOptions({
    // 策略组名称。
    name,
    // 类型固定为 select，用户手动切换用。
    type: "select",
    // 候选节点/子组列表做一次清洗去重。
    proxies: uniqueStrings(proxies)
  });
}

// 构造一个 include-all 的 select 策略组，适合“自动收集所有匹配节点”的场景。
function createIncludeAllSelectGroup(name, filter, excludeFilter) {
  // 基础结构：select + include-all-proxies，仅自动收集真实节点。
  const group = {
    name,
    type: "select",
    "include-all-proxies": true
  };

  // 如果传了 filter，就只收集匹配该正则的节点。
  if (filter) {
    group.filter = filter;
  }

  // 如果传了 exclude-filter，就把命中的节点排除掉。
  if (excludeFilter) {
    group["exclude-filter"] = excludeFilter;
  }

  return applyGroupPresentationOptions(group);
}

// 构造一个基于显式候选列表的测速类策略组。
function createProxyListLatencyGroup(name, proxies, type, overrides) {
  return applyLatencyGroupOptions({
    // 策略组名称。
    name,
    // 默认是 url-test，也可显式传入 fallback / load-balance 等类型。
    type: type || "url-test",
    // 候选节点/子组列表做一次去重。
    proxies: uniqueStrings(proxies)
  }, overrides);
}

// 按给定 group type 构造“显式候选列表型”服务组，兼容 select / url-test / fallback / load-balance，并允许继续挂载独立组高级项。
function createServiceGroup(name, proxies, type, overrides, autoCollectionOptions, advancedOptions, providerCollectionOptions) {
  const groupType = normalizeServiceGroupType(type, "select");
  const group = groupType === "select"
    ? createSelectGroup(name, proxies)
    : createProxyListLatencyGroup(name, proxies, groupType, overrides);
  return applyProxyGroupAdvancedOptions(
    applyProxyProviderCollectionOptions(
      applyAutoProxyCollectionOptions(group, autoCollectionOptions),
      providerCollectionOptions
    ),
    advancedOptions
  );
}

// 构造一个 include-all 自动收集节点的测速类策略组。
function createIncludeAllLatencyGroup(name, filter, excludeFilter, type) {
  // 先生成基础结构。
  const group = {
    name,
    // 未显式传 type 时，根据用户参数决定是 load-balance 还是 url-test。
    type: type || (ARGS.lb ? "load-balance" : "url-test"),
    // 开启 include-all-proxies，表示自动从所有真实节点中按 filter 吸收成员。
    "include-all-proxies": true
  };

  // 传了 filter 就只收集命中的节点。
  if (filter) {
    group.filter = filter;
  }

  // 传了 exclude-filter 就排除命中的节点。
  if (excludeFilter) {
    group["exclude-filter"] = excludeFilter;
  }

  return applyLatencyGroupOptions(group);
}

// 清洗策略组定义，做名称去重、空组移除、候选列表去重。
function sanitizeProxyGroups(groups) {
  // 记录哪些组名已经出现过。
  const seen = Object.create(null);
  // 存放最终有效的策略组。
  const result = [];

  // 逐个检查所有传入组。
  for (const item of Array.isArray(groups) ? groups : []) {
    // 非普通对象、没有有效 name 的组直接跳过。
    if (!isObject(item) || typeof item.name !== "string" || !item.name.trim()) {
      continue;
    }

    // 同名组只保留第一份，防止冲突。
    if (seen[item.name]) {
      continue;
    }

    // 浅拷贝一份，避免直接修改外部传入对象。
    const group = Object.assign({}, item);

    // 如果这个组带 proxies 数组，则先做一次候选列表去重。
    if (Array.isArray(group.proxies)) {
      group.proxies = uniqueStrings(group.proxies);
    }

    // 非自动收集组且没有 filter 的组，本质上依赖显式 proxies。
    if (!isAutoCollectionGroup(group) && !group.filter) {
      // 如果连 proxies 都没有，就说明这是个空组，直接丢弃。
      if (!Array.isArray(group.proxies) || group.proxies.length === 0) {
        console.warn(`⚠️ 警告: 策略组 ${group.name} 无可用候选，已跳过`);
        continue;
      }
    }

    // 标记该组名已经被占用。
    seen[group.name] = true;
    // 加入最终结果。
    result.push(group);
  }

  // 返回清洗后的策略组数组。
  return result;
}

// 合并脚本生成的策略组与原配置中的自定义策略组。
function mergeProxyGroups(generatedGroups, existingGroups) {
  // 先清洗脚本生成的组，确保基础结构稳定。
  const baseGroups = sanitizeProxyGroups(generatedGroups);
  // 用于记录已经占用的组名。
  const seen = Object.create(null);

  // 先把脚本生成的组名都登记进去。
  for (const group of baseGroups) {
    seen[group.name] = true;
  }

  // 收集用户原配置中不冲突的额外策略组。
  const extras = [];
  // 遍历用户原配置的策略组。
  for (const group of Array.isArray(existingGroups) ? existingGroups : []) {
    // 非法组或名称冲突的组直接跳过。
    if (!isObject(group) || typeof group.name !== "string" || seen[group.name]) {
      continue;
    }

    // 追加到额外组列表。
    extras.push(group);
    // 同时登记组名，防止 extras 内部也重复。
    seen[group.name] = true;
  }

  // 最终结果 = 脚本组 + 用户不冲突组，再统一清洗一遍。
  return sanitizeProxyGroups(baseGroups.concat(extras));
}

// 校验规则定义里引用的 provider 是否都真实存在。
function validateRuleProviders(providerDefinitions, providers) {
  // 建立 provider 名称查找表。
  const providerLookup = createLookup(Object.keys(isObject(providers) ? providers : {}));
  // 收集不存在的 provider 名称。
  const missingProviders = [];

  // 逐条检查规则定义。
  for (const definition of Array.isArray(providerDefinitions) ? providerDefinitions : []) {
    // provider 不存在时记入缺失列表。
    if (!providerLookup[definition.provider]) {
      missingProviders.push(definition.provider);
    }
  }

  // 返回去重后的缺失列表。
  return uniqueStrings(missingProviders);
}

// 校验 rule-provider 的 path 是否发生冲突，帮助定位缓存文件覆盖问题。
function validateRuleProviderPaths(providers) {
  const source = isObject(providers) ? providers : {};
  const seen = Object.create(null);
  const conflicts = [];

  for (const name of Object.keys(source)) {
    const provider = source[name];
    const path = isObject(provider) && typeof provider.path === "string" ? provider.path.trim() : "";

    if (!path) {
      continue;
    }

    if (seen[path] && seen[path] !== name) {
      conflicts.push(`${seen[path]} <-> ${name}: ${path}`);
      continue;
    }

    seen[path] = name;
  }

  return uniqueStrings(conflicts);
}

// 校验 http 类型 rule-provider 的远程地址是否看起来正常，避免参数拼错后静默失效。
function validateRuleProviderUrls(providers) {
  const source = isObject(providers) ? providers : {};
  const warnings = [];

  for (const name of Object.keys(source)) {
    const provider = source[name];
    const type = isObject(provider) ? normalizeStringArg(provider.type).toLowerCase() : "";
    const url = isObject(provider) ? normalizeStringArg(provider.url) : "";

    if (type !== "http") {
      continue;
    }

    if (!looksLikeHttpUrl(url)) {
      warnings.push(`${name}: url=${provider.url} 看起来不像合法 http(s) 地址`);
    }
  }

  return uniqueStrings(warnings);
}

// 校验 rule-provider 的官方 type/behavior/format/path/payload 语义，避免“能生成但不符合 Mihomo 官方要求”。
function validateRuleProviderOptions(providers) {
  const source = isObject(providers) ? providers : {};
  const warnings = [];
  const hasPathConfiguredOption = ARGS.hasRuleProviderPathDir;
  const hasPayloadConfiguredOption = ARGS.hasRuleProviderPayload;
  const hasDownloadConfiguredOptions = hasRuleProviderDownloadConfiguredOptions();
  let inlineProviderCount = 0;

  for (const name of Object.keys(source)) {
    const provider = source[name];

    if (!isObject(provider)) {
      warnings.push(`${name}: rule-provider 必须为对象`);
      continue;
    }

    const type = normalizeStringArg(provider.type).toLowerCase();
    const behavior = normalizeStringArg(provider.behavior).toLowerCase();
    const format = normalizeStringArg(provider.format).toLowerCase();
    const url = normalizeStringArg(provider.url);
    const path = normalizeStringArg(provider.path).replace(/\\/g, "/");

    if (!isOfficialRuleProviderType(type)) {
      warnings.push(`${name}: type=${provider.type || "unknown"} 不在 Mihomo 官方 rule-provider 类型范围内，仅支持 http/file/inline`);
    }

    if (!isOfficialRuleProviderBehavior(behavior)) {
      warnings.push(`${name}: behavior=${provider.behavior || "unknown"} 不在 Mihomo 官方 rule-provider 行为范围内，仅支持 domain/ipcidr/classical`);
    }

    if (format && !isOfficialRuleProviderFormat(format)) {
      warnings.push(`${name}: format=${provider.format} 不在 Mihomo 官方 rule-provider 格式范围内，仅支持 yaml/text/mrs`);
    }

    if (type === "http") {
      if (!url) {
        warnings.push(`${name}: type=http 时必须配置 url`);
      } else if (!looksLikeHttpUrl(url)) {
        warnings.push(`${name}: url=${provider.url} 看起来不像合法 http(s) 地址`);
      }

      if (hasOwn(provider, "interval")) {
        const interval = Number(provider.interval);
        if (!isFinite(interval) || interval < 1) {
          warnings.push(`${name}: interval 必须为大于等于 1 的数字`);
        }
      }

      if (hasOwn(provider, "size-limit")) {
        const sizeLimit = Number(provider["size-limit"]);
        if (!isFinite(sizeLimit) || sizeLimit < 0) {
          warnings.push(`${name}: size-limit 必须为大于等于 0 的数字`);
        }
      }
    } else {
      const skippedHttpOnlyOptions = [];

      if (hasPathConfiguredOption) {
        skippedHttpOnlyOptions.push("rule-provider-path-dir");
      }

      if (hasDownloadConfiguredOptions) {
        skippedHttpOnlyOptions.push("interval/proxy/size-limit/header");
      }

      if (skippedHttpOnlyOptions.length) {
        warnings.push(`${name}: type=${provider.type || "unknown"} 不是 http，${skippedHttpOnlyOptions.join("、")} 不会生效`);
      }
    }

    if (type === "file" && !path) {
      warnings.push(`${name}: type=file 时通常需要有效 path 来定位本地 rule-provider 文件`);
    }

    if (type === "inline") {
      inlineProviderCount += 1;
      if (!Array.isArray(provider.payload) || !provider.payload.length) {
        warnings.push(`${name}: type=inline 时建议提供有效 payload`);
      }
      if (url) {
        warnings.push(`${name}: type=inline 时通常不需要 url`);
      }
    }

    if (hasOwn(provider, "payload")) {
      if (!Array.isArray(provider.payload)) {
        warnings.push(`${name}: payload 必须为数组`);
      } else if (!provider.payload.length) {
        warnings.push(`${name}: payload 不能为空数组`);
      } else {
        for (let index = 0; index < provider.payload.length; index += 1) {
          const item = provider.payload[index];
          if (typeof item !== "string") {
            warnings.push(`${name}: payload[${index}] 必须为字符串规则`);
            continue;
          }

          if (!normalizeStringArg(item)) {
            warnings.push(`${name}: payload[${index}] 不能为空字符串`);
          }
        }
      }

      if (type && type !== "inline") {
        warnings.push(`${name}: 按 Mihomo 官方语义，payload 只对 type=inline 生效；当前 type=${provider.type || "unknown"} 时通常不会生效`);
      }
    } else if (type === "inline" && hasPayloadConfiguredOption) {
      warnings.push(`${name}: 已配置 rule-provider-payload，但当前 payload 仍未生成`);
    }

    if (format === "mrs" && behavior === "classical") {
      warnings.push(`${name}: 按 Mihomo 官方语义，format=mrs 仅支持 domain/ipcidr，不支持 classical`);
    }

    if (hasOwn(provider, "header")) {
      if (!isObject(provider.header)) {
        warnings.push(`${name}: header 必须为对象`);
      } else {
        for (const headerName of Object.keys(provider.header)) {
          const rawHeaderValues = Array.isArray(provider.header[headerName]) ? provider.header[headerName] : [provider.header[headerName]];
          const headerValues = rawHeaderValues.map((item) => normalizeStringArg(item)).filter(Boolean);

          if (!isValidRequestHeaderName(headerName)) {
            warnings.push(`${name}: header 名称无效: ${headerName}`);
          }

          if (!headerValues.length) {
            warnings.push(`${name}: header.${headerName} 不能为空`);
          }
        }
      }
    }

    if (hasOwn(provider, "path")) {
      if (!path) {
        warnings.push(`${name}: path 不能为空字符串`);
      } else {
        const pathDirPrefix = ARGS.ruleProviderPathDir === "/" ? "/" : `${ARGS.ruleProviderPathDir}/`;
        if (type === "http" && hasPathConfiguredOption && !path.startsWith(pathDirPrefix)) {
          warnings.push(`${name}: path=${path} 未落在 rule-provider-path-dir=${ARGS.ruleProviderPathDir} 下`);
        }
        if (mayRequireProviderSafePaths(path)) {
          warnings.push(`${name}: path=${path} 可能超出 HomeDir；按 Mihomo 官方语义，若不在 HomeDir 下通常需要额外 SAFE_PATHS`);
        }
      }
    } else if (type === "http" && hasPathConfiguredOption) {
      warnings.push(`${name}: 已配置 rule-provider-path-dir，但当前 path 仍未生成`);
    }
  }

  if (hasPayloadConfiguredOption && !inlineProviderCount) {
    warnings.push("已配置 rule-provider-payload，但当前配置中没有 type=inline 的 rule-providers");
  }

  return uniqueStrings(warnings);
}

// 校验 proxy-provider 的官方 type/url/path/payload 语义、缓存路径、下载控制与 health-check 参数是否完整，避免远程集合静默失效。
function validateProxyProviderOptions(proxyProviders) {
  const source = isObject(proxyProviders) ? proxyProviders : {};
  const warnings = [];
  const seenPaths = Object.create(null);
  const hasPathConfiguredOption = ARGS.hasProxyProviderPathDir;
  const hasPayloadConfiguredOption = ARGS.hasProxyProviderPayload;
  const hasDownloadConfiguredOptions = hasProxyProviderDownloadConfiguredOptions();
  const hasCollectionConfiguredOptions = hasProxyProviderCollectionConfiguredOptions();
  const hasOverrideConfiguredOptions = hasProxyProviderOverrideConfiguredOptions();
  const hasHealthCheckConfiguredOptions = hasProxyProviderHealthCheckConfiguredOptions();
  const hasConfiguredOptions = !!(
    hasPathConfiguredOption ||
    hasPayloadConfiguredOption ||
    hasDownloadConfiguredOptions ||
    hasCollectionConfiguredOptions ||
    hasOverrideConfiguredOptions ||
    hasHealthCheckConfiguredOptions
  );

  if (!Object.keys(source).length) {
    if (hasConfiguredOptions) {
      warnings.push("已配置 proxy-provider 参数，但当前配置中不存在 proxy-providers");
    }
    return warnings;
  }

  for (const name of Object.keys(source)) {
    const provider = source[name];
    if (!isObject(provider)) {
      warnings.push(`${name}: proxy-provider 必须为对象`);
      continue;
    }

    const type = normalizeStringArg(provider.type).toLowerCase();
    const url = normalizeStringArg(provider.url);
    const path = normalizeStringArg(provider.path).replace(/\\/g, "/");

    if (!isOfficialProxyProviderType(type)) {
      warnings.push(`${name}: type=${provider.type || "unknown"} 不在 Mihomo 官方 proxy-provider 类型范围内，仅支持 http/file/inline`);
    }

    if (type === "http") {
      if (!url) {
        warnings.push(`${name}: type=http 时必须配置 url`);
      } else if (!looksLikeHttpUrl(url)) {
        warnings.push(`${name}: url=${provider.url} 看起来不像合法 http(s) 地址`);
      }

      if (hasOwn(provider, "interval")) {
        const interval = Number(provider.interval);
        if (!isFinite(interval) || interval < 1) {
          warnings.push(`${name}: interval 必须为大于等于 1 的数字`);
        }
      }

      if (hasOwn(provider, "size-limit")) {
        const sizeLimit = Number(provider["size-limit"]);
        if (!isFinite(sizeLimit) || sizeLimit < 0) {
          warnings.push(`${name}: size-limit 必须为大于等于 0 的数字`);
        }
      }
    } else {
      const skippedHttpOnlyOptions = [];

      if (hasPathConfiguredOption) {
        skippedHttpOnlyOptions.push("proxy-provider-path-dir");
      }

      if (hasDownloadConfiguredOptions) {
        skippedHttpOnlyOptions.push("interval/proxy/size-limit/header");
      }

      if (skippedHttpOnlyOptions.length) {
        warnings.push(`${name}: type=${provider.type || "unknown"} 不是 http，${skippedHttpOnlyOptions.join("、")} 不会生效`);
      }
    }

    if (type === "file" && !path) {
      warnings.push(`${name}: type=file 时通常需要有效 path 来定位本地 provider 文件`);
    }

    if (type === "inline" && (!Array.isArray(provider.payload) || !provider.payload.length)) {
      warnings.push(`${name}: type=inline 时建议提供有效 payload`);
    }

    if (hasOwn(provider, "payload")) {
      if (!Array.isArray(provider.payload)) {
        warnings.push(`${name}: payload 必须为数组`);
      } else if (!provider.payload.length) {
        warnings.push(`${name}: payload 不能为空数组`);
      } else {
        for (let index = 0; index < provider.payload.length; index += 1) {
          const item = provider.payload[index];
          if (!isObject(item)) {
            warnings.push(`${name}: payload[${index}] 必须为对象`);
            continue;
          }

          if (!normalizeStringArg(item.name) || !normalizeStringArg(item.type)) {
            warnings.push(`${name}: payload[${index}] 缺少有效的 name/type`);
          }
        }
      }
    } else if (hasPayloadConfiguredOption) {
      warnings.push(`${name}: 已配置 proxy-provider-payload，但当前 payload 仍未生成`);
    }

    if (hasOwn(provider, "header")) {
      if (!isObject(provider.header)) {
        warnings.push(`${name}: header 必须为对象`);
      } else {
        for (const headerName of Object.keys(provider.header)) {
          const rawHeaderValues = Array.isArray(provider.header[headerName]) ? provider.header[headerName] : [provider.header[headerName]];
          const headerValues = rawHeaderValues.map((item) => normalizeStringArg(item)).filter(Boolean);

          if (!isValidRequestHeaderName(headerName)) {
            warnings.push(`${name}: header 名称无效: ${headerName}`);
          }

          if (!headerValues.length) {
            warnings.push(`${name}: header.${headerName} 不能为空`);
          }
        }
      }
    } else if (type === "http" && ARGS.hasProxyProviderHeader) {
      warnings.push(`${name}: 已配置 proxy-provider-header，但当前 header 仍未生成`);
    }

    if (hasOwn(provider, "path")) {
      if (!path) {
        warnings.push(`${name}: path 不能为空字符串`);
      } else {
        if (mayRequireProviderSafePaths(path)) {
          warnings.push(`${name}: path=${path} 可能超出 HomeDir；按 Mihomo 官方语义，若不在 HomeDir 下通常需要额外 SAFE_PATHS`);
        }

        if (seenPaths[path] && seenPaths[path] !== name) {
          warnings.push(`${seenPaths[path]} <-> ${name}: proxy-provider path 冲突 ${path}`);
        } else {
          seenPaths[path] = name;
        }

        const pathDirPrefix = ARGS.proxyProviderPathDir === "/" ? "/" : `${ARGS.proxyProviderPathDir}/`;
        if (type === "http" && hasPathConfiguredOption && !path.startsWith(pathDirPrefix)) {
          warnings.push(`${name}: path=${path} 未落在 proxy-provider-path-dir=${ARGS.proxyProviderPathDir} 下`);
        }
      }
    } else if (type === "http" && hasPathConfiguredOption) {
      warnings.push(`${name}: 已配置 proxy-provider-path-dir，但当前 path 仍未生成`);
    }

    if (hasOwn(provider, "filter")) {
      const filter = normalizeStringArg(provider.filter);
      if (!filter) {
        warnings.push(`${name}: filter 不能为空字符串`);
      } else {
        try {
          compilePatternRegExp(filter);
        } catch (error) {
          warnings.push(`${name}: filter 正则无效: ${error.message}`);
        }
      }
    }

    if (hasOwn(provider, "exclude-filter")) {
      const excludeFilter = normalizeStringArg(provider["exclude-filter"]);
      if (!excludeFilter) {
        warnings.push(`${name}: exclude-filter 不能为空字符串`);
      } else {
        try {
          compilePatternRegExp(excludeFilter);
        } catch (error) {
          warnings.push(`${name}: exclude-filter 正则无效: ${error.message}`);
        }
      }
    }

    if (hasOwn(provider, "exclude-type")) {
      const excludeTypeSource = normalizeStringArg(provider["exclude-type"]);
      const excludeTypes = parseTypeList(provider["exclude-type"]);
      if (/[()[\]{}*+?^$\\]/.test(excludeTypeSource)) {
        warnings.push(`${name}: exclude-type 不支持正则，请只保留类型名并使用 | 分隔`);
      }
      if (excludeTypeSource && !excludeTypes.length) {
        warnings.push(`${name}: exclude-type 不能为空列表`);
      }
    }

    if (hasOwn(provider, "override")) {
      if (!isObject(provider.override)) {
        warnings.push(`${name}: override 必须为对象`);
      } else {
        const override = provider.override;

        if (hasOwn(override, "additional-prefix") && !normalizeStringArg(override["additional-prefix"])) {
          warnings.push(`${name}: override.additional-prefix 不能为空字符串`);
        }

        if (hasOwn(override, "additional-suffix") && !normalizeStringArg(override["additional-suffix"])) {
          warnings.push(`${name}: override.additional-suffix 不能为空字符串`);
        }

        if (hasOwn(override, "udp") && !isBooleanLike(override.udp)) {
          warnings.push(`${name}: override.udp 仅支持布尔值`);
        }

        if (hasOwn(override, "udp-over-tcp") && !isBooleanLike(override["udp-over-tcp"])) {
          warnings.push(`${name}: override.udp-over-tcp 仅支持布尔值`);
        }

        if (hasOwn(override, "down") && !normalizeStringArg(override.down)) {
          warnings.push(`${name}: override.down 不能为空字符串`);
        }

        if (hasOwn(override, "up") && !normalizeStringArg(override.up)) {
          warnings.push(`${name}: override.up 不能为空字符串`);
        }

        if (hasOwn(override, "tfo") && !isBooleanLike(override.tfo)) {
          warnings.push(`${name}: override.tfo 仅支持布尔值`);
        }

        if (hasOwn(override, "mptcp") && !isBooleanLike(override.mptcp)) {
          warnings.push(`${name}: override.mptcp 仅支持布尔值`);
        }

        if (hasOwn(override, "skip-cert-verify") && !isBooleanLike(override["skip-cert-verify"])) {
          warnings.push(`${name}: override.skip-cert-verify 仅支持布尔值`);
        }

        if (hasOwn(override, "dialer-proxy") && !normalizeStringArg(override["dialer-proxy"])) {
          warnings.push(`${name}: override.dialer-proxy 不能为空字符串`);
        }

        if (hasOwn(override, "interface-name") && !normalizeInterfaceNameArg(override["interface-name"])) {
          warnings.push(`${name}: override.interface-name 必须为非空字符串`);
        }

        if (hasOwn(override, "routing-mark") && normalizeRoutingMarkArg(override["routing-mark"]) === null) {
          warnings.push(`${name}: override.routing-mark 仅支持大于等于 0 的整数`);
        }

        if (hasOwn(override, "ip-version")) {
          const ipVersion = normalizeIpVersionArg(override["ip-version"], "");
          if (!ipVersion) {
            warnings.push(`${name}: override.ip-version 仅支持 dual / ipv4 / ipv6 / ipv4-prefer / ipv6-prefer`);
          }
        }

        if (hasOwn(override, "proxy-name")) {
          if (!Array.isArray(override["proxy-name"])) {
            warnings.push(`${name}: override.proxy-name 必须为数组`);
          } else if (!override["proxy-name"].length) {
            warnings.push(`${name}: override.proxy-name 不能为空数组`);
          } else {
            for (const item of override["proxy-name"]) {
              if (!isObject(item)) {
                warnings.push(`${name}: override.proxy-name 的每一项都必须为对象`);
                continue;
              }

              const pattern = normalizeStringArg(item.pattern);
              const target = normalizeStringArg(item.target);
              if (!pattern || !target) {
                warnings.push(`${name}: override.proxy-name 规则必须同时包含 pattern 与 target`);
                continue;
              }

              try {
                compilePatternRegExp(pattern);
              } catch (error) {
                warnings.push(`${name}: override.proxy-name 正则无效 (${pattern}): ${error.message}`);
              }
            }
          }
        }
      }
    }

    if (!hasOwn(provider, "health-check")) {
      continue;
    }

    if (!isObject(provider["health-check"])) {
      warnings.push(`${name}: health-check 必须为对象`);
      continue;
    }

    const healthCheck = provider["health-check"];

    if (hasOwn(healthCheck, "url") && !looksLikeHttpUrl(healthCheck.url)) {
      warnings.push(`${name}: health-check.url=${healthCheck.url} 看起来不像合法 http(s) 地址`);
    }

    if (hasOwn(healthCheck, "interval")) {
      const interval = Number(healthCheck.interval);
      if (!isFinite(interval) || interval < 1) {
        warnings.push(`${name}: health-check.interval 必须为大于等于 1 的数字`);
      }
    }

    if (hasOwn(healthCheck, "timeout")) {
      const timeout = Number(healthCheck.timeout);
      if (!isFinite(timeout) || timeout < 1) {
        warnings.push(`${name}: health-check.timeout 必须为大于等于 1 的数字`);
      }
    }

    if (hasOwn(healthCheck, "expected-status")) {
      const expectedStatus = normalizeExpectedStatusArg(healthCheck["expected-status"]);
      if (!expectedStatus) {
        warnings.push(`${name}: health-check.expected-status 不能为空字符串`);
      } else if (!isValidExpectedStatusValue(expectedStatus)) {
        warnings.push(`${name}: health-check.expected-status 仅支持 *、单个状态码，或 200/302/400-503 这类官方语法`);
      }
    }
  }

  return uniqueStrings(warnings);
}

// 校验配置与生成结果中是否包含 Mihomo 文档已经标记为弃用的字段。
function validateDeprecatedSettings(config, proxyGroups) {
  const currentConfig = isObject(config) ? config : {};
  const deprecatedSettings = [];

  if (hasOwn(currentConfig, "global-client-fingerprint")) {
    deprecatedSettings.push("global-client-fingerprint 已被 Mihomo General 文档标记为 deprecated");
  }

  if (Array.isArray(proxyGroups) && proxyGroups.some((group) => isObject(group) && hasOwn(group, "interface-name"))) {
    deprecatedSettings.push("当前生成的 proxy-groups 使用了 interface-name；Mihomo Proxy Groups 文档已标记为 deprecated");
  }

  if (Array.isArray(proxyGroups) && proxyGroups.some((group) => isObject(group) && hasOwn(group, "routing-mark"))) {
    deprecatedSettings.push("当前生成的 proxy-groups 使用了 routing-mark；Mihomo Proxy Groups 文档已标记为 deprecated");
  }

  return uniqueStrings(deprecatedSettings);
}

// 校验 DNS 里是否存在 Mihomo 文档明确不推荐的危险组合。
function validateDnsRiskWarnings(dns) {
  const currentDns = isObject(dns) ? dns : {};
  const warnings = [];

  if (parseBool(currentDns["prefer-h3"], false) && parseBool(currentDns["respect-rules"], false)) {
    warnings.push("dns.prefer-h3 与 dns.respect-rules 同时启用，Mihomo DNS 文档明确不推荐");
  }

  return uniqueStrings(warnings);
}

// 校验 DNS 高级项本身是否落在 Mihomo 文档常见允许值内。
function validateDnsOptionWarnings(dns) {
  const currentDns = isObject(dns) ? dns : {};
  const warnings = [];
  const cacheAlgorithm = typeof currentDns["cache-algorithm"] === "string" ? currentDns["cache-algorithm"].trim().toLowerCase() : "";
  const fakeIpFilterMode = typeof currentDns["fake-ip-filter-mode"] === "string" ? currentDns["fake-ip-filter-mode"].trim().toLowerCase() : "";

  if (cacheAlgorithm && !["arc", "lru"].includes(cacheAlgorithm)) {
    warnings.push(`cache-algorithm=${currentDns["cache-algorithm"]} 不在常见取值 arc/lru 内`);
  }

  if (fakeIpFilterMode && !["blacklist", "whitelist", "rule"].includes(fakeIpFilterMode)) {
    warnings.push(`fake-ip-filter-mode=${currentDns["fake-ip-filter-mode"]} 不在常见取值 blacklist/whitelist/rule 内`);
  }

  if (fakeIpFilterMode === "whitelist") {
    warnings.push("fake-ip-filter-mode=whitelist 会改变内置默认 fake-ip-filter 语义，请谨慎使用");
  }

  if (hasOwn(currentDns, "fake-ip-ttl")) {
    const ttl = Number(currentDns["fake-ip-ttl"]);
    if (!isFinite(ttl) || ttl < 1) {
      warnings.push("fake-ip-ttl 必须为大于等于 1 的数字");
    }
  }

  if (hasOwn(currentDns, "listen") && (typeof currentDns.listen !== "string" || !currentDns.listen.trim())) {
    warnings.push("dns.listen 必须为非空字符串");
  }

  if (hasOwn(currentDns, "fake-ip-range") && !looksLikeCidr(currentDns["fake-ip-range"])) {
    warnings.push(`fake-ip-range=${currentDns["fake-ip-range"]} 看起来不像合法 CIDR 网段`);
  }

  if (hasOwn(currentDns, "fake-ip-range6") && !looksLikeCidr(currentDns["fake-ip-range6"])) {
    warnings.push(`fake-ip-range6=${currentDns["fake-ip-range6"]} 看起来不像合法 CIDR 网段`);
  }

  if (fakeIpFilterMode === "rule") {
    const filters = toStringArray(currentDns["fake-ip-filter"]);
    if (!filters.some((item) => /^MATCH,\s*fake-ip$/i.test(item))) {
      warnings.push("fake-ip-filter-mode=rule 时，fake-ip-filter 建议以 MATCH,fake-ip 收尾");
    }
  }

  return uniqueStrings(warnings);
}

// 校验 GEO 相关配置是否完整，尤其是自动更新链路是否具备必要字段。
function validateGeoConfig(config) {
  const currentConfig = isObject(config) ? config : {};
  const warnings = [];
  const geoxUrl = isObject(currentConfig["geox-url"]) ? currentConfig["geox-url"] : {};

  if (hasOwn(currentConfig, "geo-update-interval")) {
    const interval = Number(currentConfig["geo-update-interval"]);
    if (!isFinite(interval) || interval < 1) {
      warnings.push("geo-update-interval 必须为大于等于 1 的数字");
    }
  }

  if (parseBool(currentConfig["geo-auto-update"], false)) {
    for (const key of ["geoip", "geosite", "mmdb", "asn"]) {
      if (typeof geoxUrl[key] !== "string" || !geoxUrl[key].trim()) {
        warnings.push(`geo-auto-update 已启用，但 geox-url.${key} 缺失`);
      }
    }
  }

  return uniqueStrings(warnings);
}

// 校验核心内核选项是否落在 Mihomo 文档允许的常见取值范围内。
function validateKernelOptionWarnings(config) {
  const currentConfig = isObject(config) ? config : {};
  const warnings = [];
  const processMode = typeof currentConfig["find-process-mode"] === "string" ? currentConfig["find-process-mode"].trim().toLowerCase() : "";
  const geodataLoader = typeof currentConfig["geodata-loader"] === "string" ? currentConfig["geodata-loader"].trim().toLowerCase() : "";

  if (processMode && !["strict", "always", "off"].includes(processMode)) {
    warnings.push(`find-process-mode=${currentConfig["find-process-mode"]} 不在常见取值 strict/always/off 内`);
  }

  if (geodataLoader && !["standard", "memconservative"].includes(geodataLoader)) {
    warnings.push(`geodata-loader=${currentConfig["geodata-loader"]} 不在常见取值 standard/memconservative 内`);
  }

  return uniqueStrings(warnings);
}

// 校验测速类策略组的健康检查参数是否完整，避免参数化后意外生成不可用配置。
function validateLatencyGroupOptions(proxyGroups) {
  const warnings = [];

  for (const group of Array.isArray(proxyGroups) ? proxyGroups : []) {
    if (!isObject(group)) {
      continue;
    }

    const type = normalizeStringArg(group.type).toLowerCase();
    if (!["url-test", "load-balance", "fallback"].includes(type)) {
      continue;
    }

    const name = typeof group.name === "string" && group.name ? group.name : "(未命名测速组)";
    const interval = Number(group.interval);
    const tolerance = Number(group.tolerance);
    const timeout = Number(group.timeout);
    const maxFailedTimes = Number(group["max-failed-times"]);

    if (typeof group.url !== "string" || !group.url.trim()) {
      warnings.push(`${name}: url 不能为空`);
    }

    if (!isFinite(interval) || interval < 1) {
      warnings.push(`${name}: interval 必须为大于等于 1 的数字`);
    }

    if (!isFinite(tolerance) || tolerance < 0) {
      warnings.push(`${name}: tolerance 必须为大于等于 0 的数字`);
    }

    if (!isFinite(timeout) || timeout < 1) {
      warnings.push(`${name}: timeout 必须为大于等于 1 的数字`);
    }

    if (!isFinite(maxFailedTimes) || maxFailedTimes < 1) {
      warnings.push(`${name}: max-failed-times 必须为大于等于 1 的数字`);
    }

    if (hasOwn(group, "expected-status")) {
      const expectedStatus = normalizeExpectedStatusArg(group["expected-status"]);
      if (!expectedStatus) {
        warnings.push(`${name}: expected-status 不能为空字符串`);
      } else if (!isValidExpectedStatusValue(expectedStatus)) {
        warnings.push(`${name}: expected-status 仅支持 *、单个状态码，或 200/302/400-503 这类官方语法`);
      }
    }

    if (type === "load-balance" && hasOwn(group, "strategy")) {
      const strategy = normalizeLoadBalanceStrategy(group.strategy, "");
      if (!strategy) {
        warnings.push(`${name}: strategy 仅支持 round-robin / consistent-hashing / sticky-sessions`);
      }
    }
  }

  return uniqueStrings(warnings);
}

// 校验规则目标组是否都能在生成后的 proxy-groups 中找到。
function validateRuleTargets(proxyGroups, ruleDefinitions) {
  // 收集所有真实生成的组名。
  const groupNames = Array.isArray(proxyGroups) ? proxyGroups.map((group) => group.name) : [];
  // 建立组名查找表。
  const groupLookup = createLookup(groupNames);
  // 收集规则里要求存在的目标组。
  const expectedTargets = uniqueStrings(
    (Array.isArray(ruleDefinitions) ? ruleDefinitions : RULE_SET_DEFINITIONS).map((definition) => definition.target).concat(GROUPS.SELECT)
  );
  // 返回缺失的目标组。
  return expectedTargets.filter((target) => !groupLookup[target]);
}

// 校验策略组里的 proxies 引用是否都能解析到“已有策略组 / 实际节点 / 内置策略”。
function validateProxyGroupReferences(proxyGroups, proxies) {
  // 收集所有策略组名称。
  const groupNames = Array.isArray(proxyGroups) ? proxyGroups.map((group) => group.name) : [];
  // 收集所有节点名称。
  const proxyNames = Array.isArray(proxies) ? proxies.map((proxy) => proxy.name) : [];
  // 建立统一查找表。
  const validReferenceLookup = createLookup(groupNames.concat(proxyNames, BUILTIN_POLICY_NAMES));
  // 收集所有无效引用。
  const unresolvedReferences = [];

  // 遍历所有策略组。
  for (const group of Array.isArray(proxyGroups) ? proxyGroups : []) {
    // 只检查显式 proxies 列表。
    if (!isObject(group) || !Array.isArray(group.proxies)) {
      continue;
    }

    // 检查当前组中的每一项引用。
    for (const reference of group.proxies) {
      // 引用不存在时记录下来。
      if (!validReferenceLookup[reference]) {
        unresolvedReferences.push(`${group.name} -> ${reference}`);
      }
    }
  }

  // 返回去重后的异常引用。
  return uniqueStrings(unresolvedReferences);
}

// 校验策略组里的 use 引用是否都能解析到现有 proxy-providers。
function validateProxyGroupProviderReferences(proxyGroups, proxyProviders) {
  const providerNames = Object.keys(isObject(proxyProviders) ? proxyProviders : {});
  const providerLookup = createLookup(providerNames);
  const unresolvedReferences = [];

  for (const group of Array.isArray(proxyGroups) ? proxyGroups : []) {
    if (!isObject(group) || !Array.isArray(group.use)) {
      continue;
    }

    for (const reference of group.use) {
      if (!providerLookup[reference]) {
        unresolvedReferences.push(`${group.name} -> use:${reference}`);
      }
    }
  }

  return uniqueStrings(unresolvedReferences);
}

// 统计某个 include-all 自动分组基于当前节点列表最终能吸收到多少节点。
function countAutoGroupMatches(group, proxies) {
  // 尝试编译 include 规则；没有 filter 时表示不过滤、默认全量。
  const includeRegex = group.filter ? compilePatternRegExp(group.filter) : null;
  // 尝试编译 exclude 规则；没有 exclude-filter 时表示不排除。
  const excludeRegex = group["exclude-filter"] ? compilePatternRegExp(group["exclude-filter"]) : null;
  // 尝试解析 exclude-type 列表；存在时会进一步按代理协议类型排除。
  const excludeTypes = createLookup(parseTypeList(group["exclude-type"]));
  // 统计命中的节点数量。
  let count = 0;

  // 逐个检查节点名。
  for (const proxy of Array.isArray(proxies) ? proxies : []) {
    // 只接受带 name 的有效节点。
    if (!isObject(proxy) || typeof proxy.name !== "string") {
      continue;
    }

    // 取出节点名。
    const name = proxy.name;
    // 取出当前节点协议类型别名集合，便于兼容 `ss` / `Shadowsocks` 这类不同写法。
    const typeAliases = getProxyTypeAliases(proxy.type);
    // include 规则存在且未命中时跳过。
    if (includeRegex && !includeRegex.test(name)) {
      continue;
    }

    // exclude 规则存在且命中时跳过。
    if (excludeRegex && excludeRegex.test(name)) {
      continue;
    }

    // exclude-type 存在且当前代理类型命中时也跳过。
    if (typeAliases.some((item) => excludeTypes[item])) {
      continue;
    }

    // 说明这个节点会被当前自动分组吸收。
    count += 1;
  }

  // 返回命中总数。
  return count;
}

// 校验自动收集型分组是否真的能匹配到节点，同时检查 filter 正则本身是否可编译。
function validateAutoGroups(proxyGroups, proxies) {
  // 收集“正则无法编译”的组。
  const invalidGroupPatterns = [];
  // 收集“自动分组最终一个节点也吸不到”的组。
  const emptyAutoGroups = [];

  // 遍历所有策略组。
  for (const group of Array.isArray(proxyGroups) ? proxyGroups : []) {
    // 这里只检查自动收集型策略组。
    if (!isAutoCollectionGroup(group)) {
      continue;
    }

    try {
      // include-all-providers 的真实节点数量在脚本运行期不可见，这里只校验正则可编译，不强行判断是否为空。
      if (group["include-all-providers"]) {
        if (group.filter) {
          compilePatternRegExp(group.filter);
        }
        if (group["exclude-filter"]) {
          compilePatternRegExp(group["exclude-filter"]);
        }
        continue;
      }

      // 计算当前自动分组能匹配到多少节点。
      const matchedCount = countAutoGroupMatches(group, proxies);
      // 一个节点都匹配不到时，记为告警项。
      if (matchedCount === 0 && !ALLOW_EMPTY_AUTO_GROUPS.includes(group.name)) {
        emptyAutoGroups.push(group.name);
      }
    } catch (error) {
      // 如果正则编译或匹配过程中抛错，则记录该组模式异常。
      invalidGroupPatterns.push(`${group.name}: ${error.message}`);
    }
  }

  // 返回两类检查结果。
  return {
    invalidGroupPatterns: uniqueStrings(invalidGroupPatterns),
    emptyAutoGroups: uniqueStrings(emptyAutoGroups)
  };
}

// 对最终生成结果做一次整体自检，提前发现“能生成但不一定能正常工作”的问题。
function validateGeneratedArtifacts(proxies, proxyGroups, providers, config, dns, countryConfigs, ruleDefinitions, configuredRules) {
  // 先跑自动分组可用性校验。
  const autoGroupValidation = validateAutoGroups(proxyGroups, proxies);
  // 提前抽出最终可见节点名称，给 GitHub / Steam 点名节点参数校验复用。
  const proxyNames = Array.isArray(proxies)
    ? proxies
      .filter((proxy) => isObject(proxy) && typeof proxy.name === "string" && proxy.name.trim())
      .map((proxy) => proxy.name.trim())
    : [];
  // 收集最终可用的策略组名称与内置策略，给 GitHub / Steam 前置组参数校验复用。
  const availableGroupNames = uniqueStrings(
    (Array.isArray(proxyGroups) ? proxyGroups.map((group) => group && group.name).filter(Boolean) : [])
      .concat(BUILTIN_POLICY_NAMES)
  );
  // 收集当前可用 proxy-provider 名称，给 GitHub / Steam provider 池参数校验复用。
  const availableProxyProviderNames = Object.keys(isObject(config && config["proxy-providers"]) ? config["proxy-providers"] : {});
  const ruleProviderApplyStats = analyzeRuleProviderApplyStats(providers);
  const proxyProviderApplyStats = analyzeProxyProviderApplyStats(config && config["proxy-providers"]);
  const ruleProviderApplyPreview = analyzeRuleProviderApplyPreview(providers);
  const proxyProviderApplyPreview = analyzeProxyProviderApplyPreview(config && config["proxy-providers"]);
  return {
    missingProviders: validateRuleProviders(ruleDefinitions, providers),
    duplicateRuleProviderPaths: validateRuleProviderPaths(providers),
    invalidRuleProviderUrls: validateRuleProviderUrls(providers),
    ruleProviderWarnings: validateRuleProviderOptions(providers),
    proxyProviderWarnings: validateProxyProviderOptions(config && config["proxy-providers"]),
    ruleProviderApplyStats,
    ruleProviderApplyPreview,
    proxyProviderApplyStats,
    proxyProviderApplyPreview,
    deprecatedSettings: validateDeprecatedSettings(config, proxyGroups),
    dnsRiskWarnings: validateDnsRiskWarnings(dns),
    dnsOptionWarnings: validateDnsOptionWarnings(dns),
    geoConfigWarnings: validateGeoConfig(config),
    kernelOptionWarnings: validateKernelOptionWarnings(config),
    latencyGroupWarnings: validateLatencyGroupOptions(proxyGroups),
    providerHealthWarnings: validateProxyProviderHealthCheckCaveats(proxyGroups),
    preferredCountryWarnings: uniqueStrings(
      validatePreferredCountryMarkers(countryConfigs, ARGS.aiPreferCountries, "AI").concat(
        validatePreferredCountryMarkers(countryConfigs, ARGS.cryptoPreferCountries, "Crypto"),
        validatePreferredCountryMarkers(countryConfigs, ARGS.githubPreferCountries, "GitHub"),
        validatePreferredCountryMarkers(countryConfigs, ARGS.steamPreferCountries, "Steam"),
        validatePreferredCountryMarkers(countryConfigs, ARGS.devPreferCountries, "Dev")
      )
    ),
    preferredGroupWarnings: uniqueStrings(
      validatePreferredGroupMarkers(availableGroupNames, ARGS.githubPreferGroups, "GitHub", [GROUPS.GITHUB]).concat(
        validatePreferredGroupMarkers(availableGroupNames, ARGS.steamPreferGroups, "Steam", [GROUPS.STEAM]),
        validatePreferredGroupMarkers(availableGroupNames, ARGS.devPreferGroups, "Dev", [GROUPS.DEV])
      )
    ),
    preferredNodeWarnings: uniqueStrings(
      validatePreferredProxyMarkers(proxyNames, ARGS.githubPreferNodes, "GitHub").concat(
        validatePreferredProxyMarkers(proxyNames, ARGS.steamPreferNodes, "Steam"),
        validatePreferredProxyMarkers(proxyNames, ARGS.devPreferNodes, "Dev")
      )
    ),
    preferredProviderWarnings: uniqueStrings(
      validatePreferredProxyProviderMarkers(availableProxyProviderNames, ARGS.githubUseProviders, "GitHub", ARGS.githubIncludeAllProviders, ARGS.githubIncludeAll).concat(
        validatePreferredProxyProviderMarkers(availableProxyProviderNames, ARGS.steamUseProviders, "Steam", ARGS.steamIncludeAllProviders, ARGS.steamIncludeAll),
        validatePreferredProxyProviderMarkers(availableProxyProviderNames, ARGS.devUseProviders, "Dev", ARGS.devIncludeAllProviders, ARGS.devIncludeAll)
      )
    ),
    groupOrderWarnings: validateGroupOrderTokens(proxyGroups, countryConfigs),
    ruleOrderWarnings: uniqueStrings(validateRuleOrderMarkers(ruleDefinitions).concat(
      validateDevRuleOrderMarker(ruleDefinitions)
    )),
    customRuleOrderWarnings: validateCustomRuleOrderMarker(ruleDefinitions, configuredRules),
    ruleTargetWarnings: validateRuleTargetMarkers(availableGroupNames, ruleDefinitions),
    rulePriorityWarnings: analyzeRulePriorityRisks(ruleDefinitions).warnings,
    proxyGroupPriorityWarnings: analyzeProxyGroupPriorityRisks(proxyGroups).warnings,
    targetPlatformWarnings: uniqueStrings([]
      .concat(
        RUNTIME_CONTEXT.target && !isClashLikeTarget(RUNTIME_CONTEXT.target)
          ? [`当前目标平台看起来不是 Clash/Mihomo 体系: ${RUNTIME_CONTEXT.target}；本脚本更适合 Clash/Mihomo/OpenClash 输出`]
          : []
      )
      .concat(
        RUNTIME_CONTEXT.routeTarget && RUNTIME_CONTEXT.queryTarget && RUNTIME_CONTEXT.routeTarget !== RUNTIME_CONTEXT.queryTarget
          ? [`路由目标 ${RUNTIME_CONTEXT.routeTarget} 与 query target ${RUNTIME_CONTEXT.queryTarget} 不一致；当前以路由目标为准`]
          : []
      )),
    runtimeArgWarnings: validateUnusedScriptArgs(RUNTIME_UNUSED_ARGS),
    runtimeResponseWarnings: uniqueStrings(
      ARGS.hasResponseHeaders && ARGS.responseHeaders && !isObject(RAW_OPTIONS)
        ? ["当前运行环境中的 $options 不是对象，无法写入 _res.headers 调试响应头"]
        : []
    ),
    runtimeLinkWarnings: validateRuntimeLinkOptionWarnings(RUNTIME_LINK_OPTIONS),
    missingRuleTargets: validateRuleTargets(proxyGroups, ruleDefinitions),
    unresolvedGroupReferences: validateProxyGroupReferences(proxyGroups, proxies),
    unresolvedProviderReferences: validateProxyGroupProviderReferences(proxyGroups, config && config["proxy-providers"]),
    invalidGroupPatterns: autoGroupValidation.invalidGroupPatterns,
    emptyAutoGroups: autoGroupValidation.emptyAutoGroups
  };
}

// 统计诊断项总数，便于写入响应头摘要。
function countDiagnosticIssues(diagnostics) {
  const keys = [
    "renamedProxies",
    "missingProviders",
    "duplicateRuleProviderPaths",
    "invalidRuleProviderUrls",
    "ruleProviderWarnings",
    "proxyProviderWarnings",
    "deprecatedSettings",
    "dnsRiskWarnings",
    "dnsOptionWarnings",
    "geoConfigWarnings",
    "kernelOptionWarnings",
    "latencyGroupWarnings",
    "providerHealthWarnings",
    "preferredCountryWarnings",
    "preferredGroupWarnings",
    "preferredNodeWarnings",
    "preferredProviderWarnings",
    "groupOrderWarnings",
    "ruleOrderWarnings",
    "customRuleOrderWarnings",
    "ruleTargetWarnings",
    "rulePriorityWarnings",
    "proxyGroupPriorityWarnings",
    "customRuleWarnings",
    "serviceRoutingWarnings",
    "targetPlatformWarnings",
    "runtimeArgWarnings",
    "runtimeResponseWarnings",
    "runtimeLinkWarnings",
    "missingRuleTargets",
    "unresolvedGroupReferences",
    "unresolvedProviderReferences",
    "invalidGroupPatterns",
    "emptyAutoGroups"
  ];
  let total = 0;

  for (const key of keys) {
    if (Array.isArray(diagnostics[key])) {
      total += diagnostics[key].length;
    }
  }

  if (typeof diagnostics.unclassifiedCountryProxies === "number" && diagnostics.unclassifiedCountryProxies > 0) {
    total += diagnostics.unclassifiedCountryProxies;
  }

  return total;
}

// 构建写入 `_res.headers` 的调试头，便于直接在下载响应中查看关键运行信息。
function buildRuntimeResponseHeaders(diagnostics) {
  const prefix = ARGS.responseHeaderPrefix;

  return {
    [`${prefix}Script-Version`]: SCRIPT_VERSION,
    [`${prefix}Target`]: RUNTIME_CONTEXT.target || "unknown",
    [`${prefix}Route-Kind`]: RUNTIME_CONTEXT.routeKind || "unknown",
    [`${prefix}Route-Name`]: RUNTIME_CONTEXT.routeName || "unknown",
    [`${prefix}Route-Target`]: RUNTIME_CONTEXT.routeTarget || "none",
    [`${prefix}Query-Target`]: RUNTIME_CONTEXT.queryTarget || "none",
    [`${prefix}Request-Params-Target`]: RUNTIME_CONTEXT.requestParamsTarget || "none",
    [`${prefix}Arg-Source-Summary`]: formatRuntimeArgSourceSummary(RUNTIME_ARG_SOURCES),
    [`${prefix}Arg-Effective-Summary`]: formatRuntimeArgEffectiveSummary(RUNTIME_ARG_EFFECTIVE),
    [`${prefix}Arg-Effective-Preview`]: formatRuntimeArgEffectivePreview(RUNTIME_ARG_EFFECTIVE),
    [`${prefix}Unused-Arg-Summary`]: formatUnusedScriptArgsSummary(RUNTIME_UNUSED_ARGS),
    [`${prefix}Unused-Arg-Preview`]: formatUnusedScriptArgsPreview(RUNTIME_UNUSED_ARGS),
    [`${prefix}Route-Target-Source`]: RUNTIME_ARG_SOURCES.routeTargetSource || "none",
    [`${prefix}Route-Info-Source`]: RUNTIME_ARG_SOURCES.routeInfoSource || "none",
    [`${prefix}Merge-Sources`]: RUNTIME_LINK_OPTIONS.hasMergeSources ? RUNTIME_LINK_OPTIONS.mergeSources : "default",
    [`${prefix}No-Cache`]: RUNTIME_LINK_OPTIONS.hasNoCache ? RUNTIME_LINK_OPTIONS.noCache : "default",
    [`${prefix}Include-Unsupported`]: RUNTIME_LINK_OPTIONS.hasIncludeUnsupportedProxy ? RUNTIME_LINK_OPTIONS.includeUnsupportedProxy : "default",
    [`${prefix}Link-Url-Kind`]: RUNTIME_LINK_OPTIONS.urlKind || "none",
    [`${prefix}Link-Semantic-Summary`]: buildRuntimeLinkSemanticSummary(RUNTIME_LINK_OPTIONS),
    [`${prefix}Link-Semantic-Check`]: "enabled",
    [`${prefix}Rule-Source-Preset`]: ARGS.hasRuleSourcePreset ? ARGS.ruleSourcePreset : DEFAULT_RULE_SOURCE_PRESET,
    [`${prefix}Steam-Fix`]: ARGS.hasSteamFix ? ARGS.steamFix : false,
    [`${prefix}Steam-Fix-Url`]: ARGS.steamFix ? (ARGS.hasSteamFixUrl ? ARGS.steamFixUrl : STEAM_FIX_LIST_URL) : "disabled",
    [`${prefix}Direct-List-Url`]: ARGS.hasDirectListUrl ? ARGS.directListUrl : "default",
    [`${prefix}Crypto-List-Url`]: ARGS.hasCryptoListUrl ? ARGS.cryptoListUrl : "default",
    [`${prefix}ChatGPT-List-Url`]: ARGS.hasChatGptListUrl ? ARGS.chatGptListUrl : "default",
    [`${prefix}AI-Extra-List-Url`]: ARGS.hasAiExtraListUrl ? ARGS.aiExtraListUrl : "default",
    [`${prefix}Grok-Rule-Url`]: accademiaAdditionalRule("Grok"),
    [`${prefix}Apple-AI-Rule-Url`]: accademiaAdditionalRule("AppleAI"),
    [`${prefix}Rule-Provider-Path-Dir`]: ARGS.ruleProviderPathDir,
    [`${prefix}Rule-Provider-Interval`]: ARGS.hasRuleProviderInterval ? ARGS.ruleProviderInterval : RULE_INTERVAL,
    [`${prefix}Rule-Provider-Proxy`]: ARGS.hasRuleProviderProxy ? ARGS.ruleProviderProxy : "default",
    [`${prefix}Rule-Provider-Size-Limit`]: ARGS.hasRuleProviderSizeLimit ? ARGS.ruleProviderSizeLimit : "default",
    [`${prefix}Rule-Provider-UA`]: ARGS.hasRuleProviderUserAgent ? ARGS.ruleProviderUserAgent : "default",
    [`${prefix}Rule-Provider-Authorization`]: ARGS.hasRuleProviderAuthorization ? "configured" : "default",
    [`${prefix}Rule-Provider-Header`]: ARGS.hasRuleProviderHeader ? `configured:${ARGS.ruleProviderHeaderEntryCount}` : "default",
    [`${prefix}Rule-Provider-Payload`]: ARGS.hasRuleProviderPayload ? `configured:${ARGS.ruleProviderPayloadCount}` : "default",
    [`${prefix}Rule-Provider-Apply-Scope`]: (ARGS.hasRuleProviderPathDir || hasRuleProviderDownloadConfiguredOptions()) ? "all-http" : "default",
    [`${prefix}Rule-Provider-Apply-Scope-Detail`]: buildRuleProviderApplyScopeSummary(),
    [`${prefix}Rule-Provider-Apply-Stats`]: formatRuleProviderApplyStats(diagnostics.ruleProviderApplyStats),
    [`${prefix}Rule-Provider-Apply-Preview`]: formatRuleProviderApplyPreview(diagnostics.ruleProviderApplyPreview),
    [`${prefix}Rule-Provider-Mutation-Stats`]: formatRuleProviderMutationStats(diagnostics.ruleProviderMutationStats),
    [`${prefix}Rule-Provider-Mutation-Preview`]: formatRuleProviderMutationPreview(diagnostics.ruleProviderMutationPreview),
    [`${prefix}Rule-Provider-Payload-Apply-Scope`]: ARGS.hasRuleProviderPayload ? "inline-only" : "default",
    [`${prefix}Rule-Provider-Semantic-Check`]: "enabled",
    [`${prefix}Proxy-Provider-Interval`]: ARGS.hasProxyProviderInterval ? ARGS.proxyProviderInterval : "default",
    [`${prefix}Proxy-Provider-Proxy`]: ARGS.hasProxyProviderProxy ? ARGS.proxyProviderProxy : "default",
    [`${prefix}Proxy-Provider-Size-Limit`]: ARGS.hasProxyProviderSizeLimit ? ARGS.proxyProviderSizeLimit : "default",
    [`${prefix}Proxy-Provider-UA`]: ARGS.hasProxyProviderUserAgent ? ARGS.proxyProviderUserAgent : "default",
    [`${prefix}Proxy-Provider-Authorization`]: ARGS.hasProxyProviderAuthorization ? "configured" : "default",
    [`${prefix}Proxy-Provider-Header`]: ARGS.hasProxyProviderHeader ? `configured:${ARGS.proxyProviderHeaderEntryCount}` : "default",
    [`${prefix}Proxy-Provider-Payload`]: ARGS.hasProxyProviderPayload ? `configured:${ARGS.proxyProviderPayloadCount}` : "default",
    [`${prefix}Proxy-Provider-Path-Dir`]: ARGS.hasProxyProviderPathDir ? ARGS.proxyProviderPathDir : "unchanged",
    [`${prefix}Proxy-Provider-Apply-Scope`]: buildProxyProviderApplyScopeSummary(),
    [`${prefix}Proxy-Provider-Apply-Stats`]: formatProxyProviderApplyStats(diagnostics.proxyProviderApplyStats),
    [`${prefix}Proxy-Provider-Apply-Preview`]: formatProxyProviderApplyPreview(diagnostics.proxyProviderApplyPreview),
    [`${prefix}Proxy-Provider-Mutation-Stats`]: formatProxyProviderMutationStats(diagnostics.proxyProviderMutationStats),
    [`${prefix}Proxy-Provider-Mutation-Preview`]: formatProxyProviderMutationPreview(diagnostics.proxyProviderMutationPreview),
    [`${prefix}Proxy-Provider-Semantic-Check`]: "enabled",
    [`${prefix}Proxy-Provider-Filter`]: ARGS.hasProxyProviderFilter ? ARGS.proxyProviderFilter : "default",
    [`${prefix}Proxy-Provider-Exclude-Filter`]: ARGS.hasProxyProviderExcludeFilter ? ARGS.proxyProviderExcludeFilter : "default",
    [`${prefix}Proxy-Provider-Exclude-Type`]: ARGS.hasProxyProviderExcludeType ? ARGS.proxyProviderExcludeType : "default",
    [`${prefix}Proxy-Provider-Override-Prefix`]: ARGS.hasProxyProviderOverrideAdditionalPrefix ? ARGS.proxyProviderOverrideAdditionalPrefix : "default",
    [`${prefix}Proxy-Provider-Override-Suffix`]: ARGS.hasProxyProviderOverrideAdditionalSuffix ? ARGS.proxyProviderOverrideAdditionalSuffix : "default",
    [`${prefix}Proxy-Provider-Override-UDP`]: ARGS.hasProxyProviderOverrideUdp ? ARGS.proxyProviderOverrideUdp : "default",
    [`${prefix}Proxy-Provider-Override-UDP-Over-TCP`]: ARGS.hasProxyProviderOverrideUdpOverTcp ? ARGS.proxyProviderOverrideUdpOverTcp : "default",
    [`${prefix}Proxy-Provider-Override-Down`]: ARGS.hasProxyProviderOverrideDown ? ARGS.proxyProviderOverrideDown : "default",
    [`${prefix}Proxy-Provider-Override-Up`]: ARGS.hasProxyProviderOverrideUp ? ARGS.proxyProviderOverrideUp : "default",
    [`${prefix}Proxy-Provider-Override-TFO`]: ARGS.hasProxyProviderOverrideTfo ? ARGS.proxyProviderOverrideTfo : "default",
    [`${prefix}Proxy-Provider-Override-MPTCP`]: ARGS.hasProxyProviderOverrideMptcp ? ARGS.proxyProviderOverrideMptcp : "default",
    [`${prefix}Proxy-Provider-Override-Skip-Cert-Verify`]: ARGS.hasProxyProviderOverrideSkipCertVerify ? ARGS.proxyProviderOverrideSkipCertVerify : "default",
    [`${prefix}Proxy-Provider-Override-Dialer-Proxy`]: ARGS.hasProxyProviderOverrideDialerProxy ? ARGS.proxyProviderOverrideDialerProxy : "default",
    [`${prefix}Proxy-Provider-Override-Interface-Name`]: ARGS.hasProxyProviderOverrideInterfaceName ? ARGS.proxyProviderOverrideInterfaceName : "default",
    [`${prefix}Proxy-Provider-Override-Routing-Mark`]: ARGS.hasProxyProviderOverrideRoutingMark ? ARGS.proxyProviderOverrideRoutingMark : "default",
    [`${prefix}Proxy-Provider-Override-IP-Version`]: ARGS.hasProxyProviderOverrideIpVersion ? ARGS.proxyProviderOverrideIpVersion : "default",
    [`${prefix}Proxy-Provider-Override-Proxy-Name`]: ARGS.hasProxyProviderOverrideProxyNameRules ? `configured:${ARGS.proxyProviderOverrideProxyNameRules.length}` : "default",
    [`${prefix}Proxy-Provider-HC-Enable`]: ARGS.hasProxyProviderHealthCheckEnable ? ARGS.proxyProviderHealthCheckEnable : "default",
    [`${prefix}Proxy-Provider-HC-Url`]: ARGS.hasProxyProviderHealthCheckUrl ? ARGS.proxyProviderHealthCheckUrl : "default",
    [`${prefix}Proxy-Provider-HC-Interval`]: ARGS.hasProxyProviderHealthCheckInterval ? ARGS.proxyProviderHealthCheckInterval : "default",
    [`${prefix}Proxy-Provider-HC-Timeout`]: ARGS.hasProxyProviderHealthCheckTimeout ? ARGS.proxyProviderHealthCheckTimeout : "default",
    [`${prefix}Proxy-Provider-HC-Lazy`]: ARGS.hasProxyProviderHealthCheckLazy ? ARGS.proxyProviderHealthCheckLazy : "default",
    [`${prefix}Proxy-Provider-HC-Expected-Status`]: ARGS.hasProxyProviderHealthCheckExpectedStatus ? ARGS.proxyProviderHealthCheckExpectedStatus : "default",
    [`${prefix}Group-Strategy`]: ARGS.hasGroupStrategy ? ARGS.groupStrategy : "default",
    [`${prefix}Group-Interface-Name`]: ARGS.hasGroupInterfaceName ? ARGS.groupInterfaceName : "default",
    [`${prefix}Group-Routing-Mark`]: ARGS.hasGroupRoutingMark ? ARGS.groupRoutingMark : "default",
    [`${prefix}Group-Order-Preset`]: ARGS.hasGroupOrder ? "custom" : (ARGS.hasGroupOrderPreset ? ARGS.groupOrderPreset : DEFAULT_GROUP_ORDER_PRESET),
    [`${prefix}Group-Order-Config`]: ARGS.hasGroupOrder ? formatProviderPreviewNames(ARGS.groupOrder, 8, 12) : "preset-only",
    [`${prefix}Country-Group-Sort`]: ARGS.hasCountryGroupSort ? ARGS.countryGroupSort : "definition/default",
    [`${prefix}Country-Group-Summary`]: diagnostics.countrySummary || "none",
    [`${prefix}Region-Group-Sort`]: ARGS.hasRegionGroupSort ? ARGS.regionGroupSort : "definition/default",
    [`${prefix}Region-Groups`]: ARGS.hasRegionGroups ? `configured:${ARGS.regionGroupKeys.length}` : (ARGS.hasRegionGroupsArg ? "configured:off" : "default/off"),
    [`${prefix}Region-Group-Preview`]: ARGS.hasRegionGroups ? ARGS.regionGroupPreview : (ARGS.hasRegionGroupsArg ? "off" : "none"),
    [`${prefix}Region-Group-Summary`]: diagnostics.regionGroupSummary || "none",
    [`${prefix}Dev-Mode`]: ARGS.hasDevMode ? ARGS.devMode : "default",
    [`${prefix}Dev-Type`]: ARGS.hasDevType ? ARGS.devType : "default",
    [`${prefix}Dev-Test-Url`]: ARGS.hasDevTestUrl ? ARGS.devTestUrl : "default",
    [`${prefix}Dev-Group-Strategy`]: ARGS.hasDevGroupStrategy ? ARGS.devGroupStrategy : "default",
    [`${prefix}Dev-Hidden`]: ARGS.hasDevHidden ? ARGS.devHidden : "default",
    [`${prefix}Dev-Disable-UDP`]: ARGS.hasDevDisableUdp ? ARGS.devDisableUdp : "default",
    [`${prefix}Dev-Icon`]: ARGS.hasDevIcon ? ARGS.devIcon : "default",
    [`${prefix}Dev-Interface-Name`]: ARGS.hasDevInterfaceName ? ARGS.devInterfaceName : "default",
    [`${prefix}Dev-Routing-Mark`]: ARGS.hasDevRoutingMark ? ARGS.devRoutingMark : "default",
    [`${prefix}GitHub-Prefer-Groups`]: ARGS.hasGithubPreferGroups ? "configured" : "default",
    [`${prefix}Steam-Prefer-Groups`]: ARGS.hasSteamPreferGroups ? "configured" : "default",
    [`${prefix}Dev-Prefer-Groups`]: ARGS.hasDevPreferGroups ? "configured" : "default",
    [`${prefix}GitHub-Prefer-Countries`]: ARGS.hasGithubPreferCountries ? "configured" : "default",
    [`${prefix}Steam-Prefer-Countries`]: ARGS.hasSteamPreferCountries ? "configured" : "default",
    [`${prefix}Dev-Prefer-Countries`]: ARGS.hasDevPreferCountries ? "configured" : "default",
    [`${prefix}AI-Prefer-Countries-Resolved`]: diagnostics.aiPreferCountryResolvedSummary || "none",
    [`${prefix}Crypto-Prefer-Countries-Resolved`]: diagnostics.cryptoPreferCountryResolvedSummary || "none",
    [`${prefix}GitHub-Prefer-Countries-Resolved`]: diagnostics.githubPreferCountryResolvedSummary || "none",
    [`${prefix}Steam-Prefer-Countries-Resolved`]: diagnostics.steamPreferCountryResolvedSummary || "none",
    [`${prefix}Dev-Prefer-Countries-Resolved`]: diagnostics.devPreferCountryResolvedSummary || "none",
    [`${prefix}AI-Prefer-Countries-Trace`]: diagnostics.aiPreferCountryTraceSummary || "none",
    [`${prefix}Crypto-Prefer-Countries-Trace`]: diagnostics.cryptoPreferCountryTraceSummary || "none",
    [`${prefix}GitHub-Prefer-Countries-Trace`]: diagnostics.githubPreferCountryTraceSummary || "none",
    [`${prefix}Steam-Prefer-Countries-Trace`]: diagnostics.steamPreferCountryTraceSummary || "none",
    [`${prefix}Dev-Prefer-Countries-Trace`]: diagnostics.devPreferCountryTraceSummary || "none",
    [`${prefix}AI-Prefer-Countries-Explain`]: diagnostics.aiPreferCountryExplainSummary || "none",
    [`${prefix}Crypto-Prefer-Countries-Explain`]: diagnostics.cryptoPreferCountryExplainSummary || "none",
    [`${prefix}GitHub-Prefer-Countries-Explain`]: diagnostics.githubPreferCountryExplainSummary || "none",
    [`${prefix}Steam-Prefer-Countries-Explain`]: diagnostics.steamPreferCountryExplainSummary || "none",
    [`${prefix}Dev-Prefer-Countries-Explain`]: diagnostics.devPreferCountryExplainSummary || "none",
    [`${prefix}AI-Prefer-Countries-Unmatched`]: diagnostics.aiPreferCountryUnmatchedSummary || "none",
    [`${prefix}Crypto-Prefer-Countries-Unmatched`]: diagnostics.cryptoPreferCountryUnmatchedSummary || "none",
    [`${prefix}GitHub-Prefer-Countries-Unmatched`]: diagnostics.githubPreferCountryUnmatchedSummary || "none",
    [`${prefix}Steam-Prefer-Countries-Unmatched`]: diagnostics.steamPreferCountryUnmatchedSummary || "none",
    [`${prefix}Dev-Prefer-Countries-Unmatched`]: diagnostics.devPreferCountryUnmatchedSummary || "none",
    [`${prefix}Country-Extra-Aliases`]: ARGS.hasCountryExtraAliases ? "configured" : "default",
    [`${prefix}Country-Extra-Alias-Countries`]: ARGS.hasCountryExtraAliases ? ARGS.countryExtraAliasCountryCount : 0,
    [`${prefix}Country-Extra-Alias-Entries`]: ARGS.hasCountryExtraAliases ? ARGS.countryExtraAliasEntryCount : 0,
    [`${prefix}Country-Extra-Alias-Preview`]: ARGS.hasCountryExtraAliases ? ARGS.countryExtraAliasPreview : "none",
    [`${prefix}Country-Extra-Alias-Conflicts`]: ARGS.hasCountryExtraAliases ? ARGS.countryExtraAliasConflictCount : 0,
    [`${prefix}Country-Extra-Alias-Conflict-Preview`]: ARGS.hasCountryExtraAliases ? ARGS.countryExtraAliasConflictPreview : "none",
    [`${prefix}GitHub-Prefer-Nodes`]: ARGS.hasGithubPreferNodes ? "configured" : "default",
    [`${prefix}Steam-Prefer-Nodes`]: ARGS.hasSteamPreferNodes ? "configured" : "default",
    [`${prefix}Dev-Prefer-Nodes`]: ARGS.hasDevPreferNodes ? "configured" : "default",
    [`${prefix}GitHub-Use-Providers`]: ARGS.hasGithubUseProviders ? "configured" : "default",
    [`${prefix}Steam-Use-Providers`]: ARGS.hasSteamUseProviders ? "configured" : "default",
    [`${prefix}Dev-Use-Providers`]: ARGS.hasDevUseProviders ? "configured" : "default",
    [`${prefix}GitHub-Include-All`]: ARGS.hasGithubIncludeAll ? ARGS.githubIncludeAll : "default",
    [`${prefix}Steam-Include-All`]: ARGS.hasSteamIncludeAll ? ARGS.steamIncludeAll : "default",
    [`${prefix}Dev-Include-All`]: ARGS.hasDevIncludeAll ? ARGS.devIncludeAll : "default",
    [`${prefix}GitHub-Include-All-Proxies`]: ARGS.hasGithubIncludeAllProxies ? ARGS.githubIncludeAllProxies : "default",
    [`${prefix}Steam-Include-All-Proxies`]: ARGS.hasSteamIncludeAllProxies ? ARGS.steamIncludeAllProxies : "default",
    [`${prefix}Dev-Include-All-Proxies`]: ARGS.hasDevIncludeAllProxies ? ARGS.devIncludeAllProxies : "default",
    [`${prefix}GitHub-Include-All-Providers`]: ARGS.hasGithubIncludeAllProviders ? ARGS.githubIncludeAllProviders : "default",
    [`${prefix}Steam-Include-All-Providers`]: ARGS.hasSteamIncludeAllProviders ? ARGS.steamIncludeAllProviders : "default",
    [`${prefix}Dev-Include-All-Providers`]: ARGS.hasDevIncludeAllProviders ? ARGS.devIncludeAllProviders : "default",
    [`${prefix}GitHub-Group-Strategy`]: ARGS.hasGithubGroupStrategy ? ARGS.githubGroupStrategy : "default",
    [`${prefix}Steam-Group-Strategy`]: ARGS.hasSteamGroupStrategy ? ARGS.steamGroupStrategy : "default",
    [`${prefix}GitHub-Hidden`]: ARGS.hasGithubHidden ? ARGS.githubHidden : "default",
    [`${prefix}Steam-Hidden`]: ARGS.hasSteamHidden ? ARGS.steamHidden : "default",
    [`${prefix}GitHub-Disable-UDP`]: ARGS.hasGithubDisableUdp ? ARGS.githubDisableUdp : "default",
    [`${prefix}Steam-Disable-UDP`]: ARGS.hasSteamDisableUdp ? ARGS.steamDisableUdp : "default",
    [`${prefix}GitHub-Icon`]: ARGS.hasGithubIcon ? ARGS.githubIcon : "default",
    [`${prefix}Steam-Icon`]: ARGS.hasSteamIcon ? ARGS.steamIcon : "default",
    [`${prefix}GitHub-Interface-Name`]: ARGS.hasGithubInterfaceName ? ARGS.githubInterfaceName : "default",
    [`${prefix}Steam-Interface-Name`]: ARGS.hasSteamInterfaceName ? ARGS.steamInterfaceName : "default",
    [`${prefix}GitHub-Routing-Mark`]: ARGS.hasGithubRoutingMark ? ARGS.githubRoutingMark : "default",
    [`${prefix}Steam-Routing-Mark`]: ARGS.hasSteamRoutingMark ? ARGS.steamRoutingMark : "default",
    [`${prefix}Dev-Rule-Order`]: buildRuleOrderSummary(ARGS.devRuleAnchor, ARGS.devRulePosition),
    [`${prefix}GitHub-Rule-Order`]: buildRuleOrderSummary(ARGS.githubRuleAnchor, ARGS.githubRulePosition),
    [`${prefix}Steam-Rule-Order`]: buildRuleOrderSummary(ARGS.steamRuleAnchor, ARGS.steamRulePosition),
    [`${prefix}SteamCN-Rule-Order`]: buildRuleOrderSummary(ARGS.steamCnRuleAnchor, ARGS.steamCnRulePosition),
    [`${prefix}Custom-Rule-Order`]: buildRuleOrderSummary(ARGS.customRuleAnchor, ARGS.customRulePosition),
    [`${prefix}Dev-Rule-Target`]: ARGS.hasDevRuleTarget ? ARGS.devRuleTarget : "default",
    [`${prefix}GitHub-Rule-Target`]: ARGS.hasGithubRuleTarget ? ARGS.githubRuleTarget : "default",
    [`${prefix}Steam-Rule-Target`]: ARGS.hasSteamRuleTarget ? ARGS.steamRuleTarget : "default",
    [`${prefix}SteamCN-Rule-Target`]: ARGS.hasSteamCnRuleTarget ? ARGS.steamCnRuleTarget : "default",
    [`${prefix}Rule-Target-Summary`]: diagnostics.ruleTargetMappingSummary || "none",
    [`${prefix}Rule-Target-Preview`]: diagnostics.ruleTargetMappingPreview || "none",
    [`${prefix}Rule-Priority-Risk-Summary`]: diagnostics.rulePriorityRiskSummary || "none",
    [`${prefix}Rule-Priority-Risk-Preview`]: diagnostics.rulePriorityRiskPreview || "none",
    [`${prefix}Proxy-Group-Priority-Risk-Summary`]: diagnostics.proxyGroupPriorityRiskSummary || "none",
    [`${prefix}Proxy-Group-Priority-Risk-Preview`]: diagnostics.proxyGroupPriorityRiskPreview || "none",
    [`${prefix}Proxy-Group-Order`]: diagnostics.proxyGroupOrderSummary || "none",
    [`${prefix}Proxy-Group-Priority`]: diagnostics.proxyGroupPrioritySummary || "none",
    [`${prefix}Traffic-Priority-Summary`]: diagnostics.trafficPrioritySummary || "none",
    [`${prefix}Rule-Layer-Summary`]: diagnostics.ruleLayerSummary || "none",
    [`${prefix}Rule-Layer-Preview`]: diagnostics.ruleLayerPreview || "none",
    [`${prefix}Custom-Rule-Summary`]: diagnostics.customRuleSummary || "none",
    [`${prefix}Custom-Rule-Preview`]: diagnostics.customRulePreview || "none",
    [`${prefix}Key-Rule-Window-Summary`]: diagnostics.keyRuleWindowSummary || "none",
    [`${prefix}Key-Rule-Window-Preview`]: diagnostics.keyRuleWindowPreview || "none",
    [`${prefix}Rule-Layer-Target-Summary`]: diagnostics.ruleLayerTargetSummary || "none",
    [`${prefix}Rule-Layer-Target-Preview`]: diagnostics.ruleLayerTargetPreview || "none",
    [`${prefix}Service-Rule-Window-Summary`]: diagnostics.serviceRuleWindowSummary || "none",
    [`${prefix}Service-Rule-Window-Preview`]: diagnostics.serviceRuleWindowPreview || "none",
    [`${prefix}Service-Routing-Summary`]: diagnostics.serviceRoutingSummary || "none",
    [`${prefix}Service-Routing-Preview`]: diagnostics.serviceRoutingPreview || "none",
    [`${prefix}Routing-Chain-Summary`]: diagnostics.routingChainSummary || "none",
    [`${prefix}Routing-Chain-Preview`]: diagnostics.routingChainPreview || "none",
    [`${prefix}GitHub-Auto-Proxies`]: ARGS.hasGithubNodeFilter || ARGS.hasGithubNodeExcludeFilter || ARGS.hasGithubNodeExcludeType || ARGS.hasGithubIncludeAllProxies ? "configured" : "default",
    [`${prefix}Steam-Auto-Proxies`]: ARGS.hasSteamNodeFilter || ARGS.hasSteamNodeExcludeFilter || ARGS.hasSteamNodeExcludeType || ARGS.hasSteamIncludeAllProxies ? "configured" : "default",
    [`${prefix}Dev-Auto-Proxies`]: ARGS.hasDevNodeFilter || ARGS.hasDevNodeExcludeFilter || ARGS.hasDevNodeExcludeType || ARGS.hasDevIncludeAllProxies ? "configured" : "default",
    [`${prefix}Query-Args`]: Object.keys(RUNTIME_QUERY_ARGS).length,
    [`${prefix}Diagnostic-Issues`]: countDiagnosticIssues(diagnostics)
  };
}

// 构建完整的策略组列表。
// 这里会把国家组、功能组、优先级组、兜底组全部拼出来。
function buildProxyGroups(proxies, countryConfigs, regionConfigs, hasLowCost, existingGroups, existingProxyProviders) {
  // full 模式下统计构建耗时，方便后续优化。
  if (ARGS.full) {
    console.time("buildProxyGroups");
  }

  // 只提取国家组名称，便于后面组装候选列表。
  const countryGroupNames = countryConfigs.map((country) => country.name);
  // 区域分组仅作为国家组的聚合层，默认不参与功能组候选链。
  const resolvedRegionConfigs = Array.isArray(regionConfigs) ? regionConfigs : [];
  const regionGroupNames = resolvedRegionConfigs.map((region) => region.name);
  // 提前提取用户原配置中已有的策略组名称，供独立组前置组参数解析复用。
  const existingGroupNames = Array.isArray(existingGroups)
    ? existingGroups
      .filter((group) => isObject(group) && typeof group.name === "string" && group.name.trim())
      .map((group) => group.name.trim())
    : [];
  // 提前提取用户原配置中已有的 proxy-provider 名称，供 GitHub / Steam provider 池参数解析复用。
  const existingProxyProviderNames = Object.keys(isObject(existingProxyProviders) ? existingProxyProviders : {});
  // 提前提取当前所有可见节点名称，供独立组点名节点参数解析复用。
  const proxyNames = Array.isArray(proxies)
    ? proxies
      .filter((proxy) => isObject(proxy) && typeof proxy.name === "string" && proxy.name.trim())
      .map((proxy) => proxy.name.trim())
    : [];
  // 同时提取国家过滤表达式，给“兜底节点”组排除这些国家用。
  const countryFilters = countryConfigs.map((country) => country.filter);
  // 一个国家组都没识别出来时，打个提醒。
  if (!countryGroupNames.length) {
    console.warn("⚠️ 警告: 未检测到有效的国家分组，将使用兜底节点组");
  }

  // 国家组的统一排除条件：至少排除低倍率，landing=true 时再额外排除落地节点。
  const countryExcludeFilter = composeCaseInsensitivePattern([
    REGEX_LOW_COST.source,
    ARGS.landing ? REGEX_LANDING_ISOLATE.source : ""
  ]);

  // 兜底组的排除条件：排除低倍率、排除落地（可选）、排除所有已识别国家组节点。
  const otherExcludeFilter = composeCaseInsensitivePattern([
    hasLowCost ? REGEX_LOW_COST.source : "",
    ARGS.landing ? REGEX_LANDING_ISOLATE.source : "",
    ...countryFilters
  ]);

  // 所有“功能类总池”候选：落地组（可选）+ 国家组 + 兜底组 + 低倍率组（可选）。
  const functionalPool = uniqueStrings([
    ARGS.landing ? GROUPS.LANDING : "",
    ...countryGroupNames,
    GROUPS.OTHER,
    hasLowCost ? GROUPS.LOW_COST : ""
  ]);

  // 主选择 / AI / Google 等大多数策略组共用的基础候选顺序。
  const baseProxies = uniqueStrings([
    GROUPS.FALLBACK,
    ...functionalPool,
    GROUPS.MANUAL,
    BUILTIN_DIRECT
  ]);

  // 自动切换组的候选池，不需要再把自己塞进去，所以只从功能池里选。
  const fallbackProxies = uniqueStrings(functionalPool.length ? functionalPool : [BUILTIN_DIRECT]);
  // 直连优先的服务组候选顺序：DIRECT -> 主选择 -> 其他。
  const directFirstProxies = uniqueStrings([BUILTIN_DIRECT, GROUPS.SELECT, ...baseProxies]);
  // 主选择优先的服务组候选顺序：主选择 -> 其他。
  const selectFirstProxies = uniqueStrings([GROUPS.SELECT, ...baseProxies]);
  // 开发生态组默认优先沿用 GitHub 独立组，其次回落到主选择链；也允许切成直连优先或更纯粹的代理优先。
  const developerModeBaseProxies = ARGS.devMode === "direct"
    ? uniqueStrings([BUILTIN_DIRECT, GROUPS.GITHUB, ...selectFirstProxies])
    : (ARGS.devMode === "proxy"
      ? uniqueStrings([GROUPS.GITHUB, ...baseProxies])
      : uniqueStrings([GROUPS.GITHUB, ...selectFirstProxies]));
  // 媒体类服务候选顺序：主选择 -> 国家组 -> 兜底 -> 手动。
  const mediaProxies = uniqueStrings([GROUPS.SELECT, ...countryGroupNames, GROUPS.OTHER, GROUPS.MANUAL]);

  // AI / Crypto 的国家优先链统一复用同一套解析 helper，避免默认链与诊断链各自漂移。
  const aiPreferredGroups = buildPreferredCountryGroups(countryConfigs, ARGS.aiPreferCountries, DEFAULT_AI_PREFERRED_COUNTRY_MARKERS);
  const cryptoPreferredGroups = buildPreferredCountryGroups(countryConfigs, ARGS.cryptoPreferCountries, DEFAULT_CRYPTO_PREFERRED_COUNTRY_MARKERS);
  // 若用户传入 GitHub 优先链参数，则按参数解析；否则保持原有固定顺序。
  const githubPreferredGroups = ARGS.hasGithubPreferCountries
    ? resolvePreferredCountryGroups(countryConfigs, ARGS.githubPreferCountries)
    : [];
  // 若用户传入 Steam 优先链参数，则按参数解析；否则保持原有固定顺序。
  const steamPreferredGroups = ARGS.hasSteamPreferCountries
    ? resolvePreferredCountryGroups(countryConfigs, ARGS.steamPreferCountries)
    : [];
  // 若用户传入开发服务组优先国家参数，则按参数解析；否则继续保持 GitHub 优先的基础链。
  const devPreferredGroups = ARGS.hasDevPreferCountries
    ? resolvePreferredCountryGroups(countryConfigs, ARGS.devPreferCountries)
    : [];
  // 当前这次构建中“稳定会生成”的内置组名集合。
  const alwaysGeneratedGroupNames = [
    GROUPS.SELECT,
    GROUPS.MANUAL,
    GROUPS.FALLBACK,
    GROUPS.DIRECT,
    GROUPS.OTHER,
    GROUPS.AI,
    GROUPS.CRYPTO,
    GROUPS.APPLE,
    GROUPS.MICROSOFT,
    GROUPS.GOOGLE,
    GROUPS.GITHUB,
    GROUPS.DEV,
    GROUPS.BING,
    GROUPS.ONEDRIVE,
    GROUPS.TELEGRAM,
    GROUPS.YOUTUBE,
    GROUPS.NETFLIX,
    GROUPS.DISNEY,
    GROUPS.SPOTIFY,
    GROUPS.TIKTOK,
    GROUPS.STEAM,
    GROUPS.GAMES,
    GROUPS.PT,
    GROUPS.SPEEDTEST,
    GROUPS.ADS
  ];
  // 汇总当前可引用的组名/内置策略，供 GitHub / Steam 前置组参数解析。
  const availableGroupNames = uniqueStrings(
    countryGroupNames
      .concat(regionGroupNames)
      .concat(
        alwaysGeneratedGroupNames,
        ARGS.landing ? [GROUPS.LANDING] : [],
        hasLowCost ? [GROUPS.LOW_COST] : [],
        existingGroupNames,
        BUILTIN_POLICY_NAMES
      )
  );
  // 若用户传入 GitHub 前置组参数，则把它解析成真实可引用的组名/内置策略。
  const githubPreferredReferences = ARGS.hasGithubPreferGroups
    ? resolvePreferredGroupReferences(availableGroupNames, ARGS.githubPreferGroups, [GROUPS.GITHUB])
    : [];
  // 若用户传入 Steam 前置组参数，则把它解析成真实可引用的组名/内置策略。
  const steamPreferredReferences = ARGS.hasSteamPreferGroups
    ? resolvePreferredGroupReferences(availableGroupNames, ARGS.steamPreferGroups, [GROUPS.STEAM])
    : [];
  // 若用户传入开发服务组前置组参数，则把它解析成真实可引用的组名/内置策略。
  const devPreferredReferences = ARGS.hasDevPreferGroups
    ? resolvePreferredGroupReferences(availableGroupNames, ARGS.devPreferGroups, [GROUPS.DEV])
    : [];
  // 若用户传入 GitHub 点名节点参数，则把它解析成真实节点名。
  const githubPreferredNodes = ARGS.hasGithubPreferNodes
    ? resolvePreferredProxyReferences(proxyNames, ARGS.githubPreferNodes)
    : [];
  // 若用户传入 Steam 点名节点参数，则把它解析成真实节点名。
  const steamPreferredNodes = ARGS.hasSteamPreferNodes
    ? resolvePreferredProxyReferences(proxyNames, ARGS.steamPreferNodes)
    : [];
  // 若用户传入开发服务组点名节点参数，则把它解析成真实节点名。
  const devPreferredNodes = ARGS.hasDevPreferNodes
    ? resolvePreferredProxyReferences(proxyNames, ARGS.devPreferNodes)
    : [];
  // 若用户传入 GitHub proxy-provider 参数，则把它解析成真实 provider 名称。
  const githubProviderReferences = ARGS.hasGithubUseProviders
    ? resolvePreferredProxyProviderReferences(existingProxyProviderNames, ARGS.githubUseProviders)
    : [];
  // 若用户传入 Steam proxy-provider 参数，则把它解析成真实 provider 名称。
  const steamProviderReferences = ARGS.hasSteamUseProviders
    ? resolvePreferredProxyProviderReferences(existingProxyProviderNames, ARGS.steamUseProviders)
    : [];
  // 若用户传入开发服务组 proxy-provider 参数，则把它解析成真实 provider 名称。
  const devProviderReferences = ARGS.hasDevUseProviders
    ? resolvePreferredProxyProviderReferences(existingProxyProviderNames, ARGS.devUseProviders)
    : [];
  // 根据模式挑选 GitHub 独立组的基础候选顺序。
  const githubModeBaseProxies = ARGS.githubMode === "direct"
    ? directFirstProxies
    : (ARGS.githubMode === "proxy" ? baseProxies : selectFirstProxies);
  // 根据模式挑选 Steam 独立组的基础候选顺序。
  const steamModeBaseProxies = ARGS.steamMode === "direct"
    ? directFirstProxies
    : (ARGS.steamMode === "proxy" ? baseProxies : selectFirstProxies);

  // 加密货币组：优先日本，其次新加坡，再次香港；也允许用户通过参数自定义优先链。
  const cryptoProxies = prependPreferredGroups(cryptoPreferredGroups, baseProxies);
  // AI 组：优先新加坡、日本、美国、香港；也允许用户通过参数自定义优先链。
  const aiProxies = prependPreferredGroups(aiPreferredGroups, baseProxies);
  // GitHub 组默认采用主选择优先；也允许用户切换为直连优先或纯代理优先。
  const githubBaseProxies = ARGS.hasGithubPreferCountries
    ? (ARGS.githubMode === "direct"
      ? uniqueStrings([BUILTIN_DIRECT].concat(prependPreferredGroups(githubPreferredGroups, selectFirstProxies)))
      : prependPreferredGroups(githubPreferredGroups, githubModeBaseProxies))
    : githubModeBaseProxies;
  // Steam 组默认采用直连优先；也允许用户切换为主选择优先或纯代理优先。
  const steamBaseProxies = ARGS.hasSteamPreferCountries
    ? (ARGS.steamMode === "direct"
      ? uniqueStrings([BUILTIN_DIRECT].concat(prependPreferredGroups(steamPreferredGroups, selectFirstProxies)))
      : prependPreferredGroups(steamPreferredGroups, steamModeBaseProxies))
    : steamModeBaseProxies;
  // 开发服务组默认优先沿用 GitHub；若显式设置国家优先链，则把对应国家组插到 GitHub 前面，并在 direct 模式下继续固定 DIRECT 第一位。
  const developerBaseProxies = ARGS.hasDevPreferCountries
    ? (ARGS.devMode === "direct"
      ? uniqueStrings([BUILTIN_DIRECT].concat(prependPreferredGroups(devPreferredGroups, uniqueStrings([GROUPS.GITHUB, ...selectFirstProxies]))))
      : prependPreferredGroups(devPreferredGroups, developerModeBaseProxies))
    : developerModeBaseProxies;
  // GitHub 组额外支持用“前置组参数”插入任意已有组/内置策略。
  const githubStructuredProxies = ARGS.hasGithubPreferGroups
    ? prependPreferredNames(githubPreferredReferences, githubBaseProxies, ARGS.githubMode === "direct")
    : githubBaseProxies;
  const githubProxies = ARGS.hasGithubPreferNodes
    ? prependPreferredNames(githubPreferredNodes, githubStructuredProxies, ARGS.githubMode === "direct")
    : githubStructuredProxies;
  // Steam 组同样支持额外前置组，并在 direct 模式下继续固定 DIRECT 在最前。
  const steamStructuredProxies = ARGS.hasSteamPreferGroups
    ? prependPreferredNames(steamPreferredReferences, steamBaseProxies, ARGS.steamMode === "direct")
    : steamBaseProxies;
  const steamProxies = ARGS.hasSteamPreferNodes
    ? prependPreferredNames(steamPreferredNodes, steamStructuredProxies, ARGS.steamMode === "direct")
    : steamStructuredProxies;
  // 开发服务组也支持额外前置组与点名节点，并在 direct 模式下继续固定 DIRECT 在最前。
  const developerStructuredProxies = ARGS.hasDevPreferGroups
    ? prependPreferredNames(devPreferredReferences, developerModeBaseProxies, ARGS.devMode === "direct")
    : developerModeBaseProxies;
  const developerProxies = ARGS.hasDevPreferNodes
    ? prependPreferredNames(devPreferredNodes, developerStructuredProxies, ARGS.devMode === "direct")
    : developerStructuredProxies;
  // GitHub 独立组专属测速覆盖，只影响 GitHub 组自身。
  const githubLatencyOverrides = {
    testUrl: ARGS.githubTestUrl,
    hasTestUrl: ARGS.hasGithubTestUrl,
    groupInterval: ARGS.githubGroupInterval,
    hasGroupInterval: ARGS.hasGithubGroupInterval,
    groupTolerance: ARGS.githubGroupTolerance,
    hasGroupTolerance: ARGS.hasGithubGroupTolerance,
    groupTimeout: ARGS.githubGroupTimeout,
    hasGroupTimeout: ARGS.hasGithubGroupTimeout,
    groupLazy: ARGS.githubGroupLazy,
    hasGroupLazy: ARGS.hasGithubGroupLazy,
    groupMaxFailedTimes: ARGS.githubGroupMaxFailedTimes,
    hasGroupMaxFailedTimes: ARGS.hasGithubGroupMaxFailedTimes,
    groupExpectedStatus: ARGS.githubGroupExpectedStatus,
    hasGroupExpectedStatus: ARGS.hasGithubGroupExpectedStatus,
    groupStrategy: ARGS.githubGroupStrategy,
    hasGroupStrategy: ARGS.hasGithubGroupStrategy
  };
  // Steam 独立组专属测速覆盖，只影响 Steam 组自身。
  const steamLatencyOverrides = {
    testUrl: ARGS.steamTestUrl,
    hasTestUrl: ARGS.hasSteamTestUrl,
    groupInterval: ARGS.steamGroupInterval,
    hasGroupInterval: ARGS.hasSteamGroupInterval,
    groupTolerance: ARGS.steamGroupTolerance,
    hasGroupTolerance: ARGS.hasSteamGroupTolerance,
    groupTimeout: ARGS.steamGroupTimeout,
    hasGroupTimeout: ARGS.hasSteamGroupTimeout,
    groupLazy: ARGS.steamGroupLazy,
    hasGroupLazy: ARGS.hasSteamGroupLazy,
    groupMaxFailedTimes: ARGS.steamGroupMaxFailedTimes,
    hasGroupMaxFailedTimes: ARGS.hasSteamGroupMaxFailedTimes,
    groupExpectedStatus: ARGS.steamGroupExpectedStatus,
    hasGroupExpectedStatus: ARGS.hasSteamGroupExpectedStatus,
    groupStrategy: ARGS.steamGroupStrategy,
    hasGroupStrategy: ARGS.hasSteamGroupStrategy
  };
  // 开发服务组专属测速覆盖，只影响开发服务组自身。
  const devLatencyOverrides = {
    testUrl: ARGS.devTestUrl,
    hasTestUrl: ARGS.hasDevTestUrl,
    groupInterval: ARGS.devGroupInterval,
    hasGroupInterval: ARGS.hasDevGroupInterval,
    groupTolerance: ARGS.devGroupTolerance,
    hasGroupTolerance: ARGS.hasDevGroupTolerance,
    groupTimeout: ARGS.devGroupTimeout,
    hasGroupTimeout: ARGS.hasDevGroupTimeout,
    groupLazy: ARGS.devGroupLazy,
    hasGroupLazy: ARGS.hasDevGroupLazy,
    groupMaxFailedTimes: ARGS.devGroupMaxFailedTimes,
    hasGroupMaxFailedTimes: ARGS.hasDevGroupMaxFailedTimes,
    groupExpectedStatus: ARGS.devGroupExpectedStatus,
    hasGroupExpectedStatus: ARGS.hasDevGroupExpectedStatus,
    groupStrategy: ARGS.devGroupStrategy,
    hasGroupStrategy: ARGS.hasDevGroupStrategy
  };
  // GitHub 独立组可选开启原始节点自动收集，用于按节点名 / 协议类型做更细粒度的专用池。
  const githubAutoCollectionOptions = {
    filter: ARGS.githubNodeFilter,
    excludeFilter: ARGS.githubNodeExcludeFilter,
    excludeType: ARGS.githubNodeExcludeType,
    includeAllProxies: ARGS.githubIncludeAllProxies
  };
  // Steam 独立组同样支持原始节点自动收集。
  const steamAutoCollectionOptions = {
    filter: ARGS.steamNodeFilter,
    excludeFilter: ARGS.steamNodeExcludeFilter,
    excludeType: ARGS.steamNodeExcludeType,
    includeAllProxies: ARGS.steamIncludeAllProxies
  };
  // 开发服务组也支持按节点名 / 协议类型自动收集原始节点。
  const devAutoCollectionOptions = {
    filter: ARGS.devNodeFilter,
    excludeFilter: ARGS.devNodeExcludeFilter,
    excludeType: ARGS.devNodeExcludeType,
    includeAllProxies: ARGS.devIncludeAllProxies
  };
  // GitHub 独立组支持额外引用 proxy-providers；若开启 include-all-providers，则 use 列表自动失效。
  const githubProviderCollectionOptions = {
    includeAll: ARGS.githubIncludeAll,
    use: githubProviderReferences,
    includeAllProviders: ARGS.githubIncludeAllProviders
  };
  // Steam 独立组同样支持额外引用 proxy-providers。
  const steamProviderCollectionOptions = {
    includeAll: ARGS.steamIncludeAll,
    use: steamProviderReferences,
    includeAllProviders: ARGS.steamIncludeAllProviders
  };
  // 开发服务组同样支持额外引用 proxy-providers，并兼容 include-all / include-all-providers。
  const devProviderCollectionOptions = {
    includeAll: ARGS.devIncludeAll,
    use: devProviderReferences,
    includeAllProviders: ARGS.devIncludeAllProviders
  };
  // GitHub 独立组展示/传输高级项：支持按需隐藏、挂图标、关闭 UDP。
  const githubAdvancedOptions = {
    hidden: ARGS.githubHidden,
    hasHidden: ARGS.hasGithubHidden,
    disableUdp: ARGS.githubDisableUdp,
    hasDisableUdp: ARGS.hasGithubDisableUdp,
    icon: ARGS.githubIcon,
    hasIcon: ARGS.hasGithubIcon,
    interfaceName: ARGS.githubInterfaceName,
    hasInterfaceName: ARGS.hasGithubInterfaceName,
    routingMark: ARGS.githubRoutingMark,
    hasRoutingMark: ARGS.hasGithubRoutingMark
  };
  // Steam 独立组展示/传输高级项：支持按需隐藏、挂图标、关闭 UDP。
  const steamAdvancedOptions = {
    hidden: ARGS.steamHidden,
    hasHidden: ARGS.hasSteamHidden,
    disableUdp: ARGS.steamDisableUdp,
    hasDisableUdp: ARGS.hasSteamDisableUdp,
    icon: ARGS.steamIcon,
    hasIcon: ARGS.hasSteamIcon,
    interfaceName: ARGS.steamInterfaceName,
    hasInterfaceName: ARGS.hasSteamInterfaceName,
    routingMark: ARGS.steamRoutingMark,
    hasRoutingMark: ARGS.hasSteamRoutingMark
  };
  // 开发服务组展示/传输高级项：支持按需隐藏、挂图标、关闭 UDP。
  const devAdvancedOptions = {
    hidden: ARGS.devHidden,
    hasHidden: ARGS.hasDevHidden,
    disableUdp: ARGS.devDisableUdp,
    hasDisableUdp: ARGS.hasDevDisableUdp,
    icon: ARGS.devIcon,
    hasIcon: ARGS.hasDevIcon,
    interfaceName: ARGS.devInterfaceName,
    hasInterfaceName: ARGS.hasDevInterfaceName,
    routingMark: ARGS.devRoutingMark,
    hasRoutingMark: ARGS.hasDevRoutingMark
  };

  // 先构造固定功能组。
  const generatedGroups = [
    // 主选择组。
    createSelectGroup(GROUPS.SELECT, baseProxies),
    // 手动切换组，自动吸收所有节点。
    createIncludeAllSelectGroup(GROUPS.MANUAL),
    // 自动切换组，基于候选池做测速优选。
    createProxyListLatencyGroup(GROUPS.FALLBACK, fallbackProxies),

    // AI 组，优先新加坡 / 日本 / 美国 / 香港。
    createSelectGroup(GROUPS.AI, aiProxies),
    // Telegram 组。
    createSelectGroup(GROUPS.TELEGRAM, baseProxies),
    // Google 组。
    createSelectGroup(GROUPS.GOOGLE, baseProxies),
    // GitHub 组。
    createServiceGroup(GROUPS.GITHUB, githubProxies, ARGS.githubType, githubLatencyOverrides, githubAutoCollectionOptions, githubAdvancedOptions, githubProviderCollectionOptions),
    // 开发生态组，默认优先沿用 GitHub 独立组，也允许独立切换组类型与候选顺序。
    createServiceGroup(GROUPS.DEV, developerProxies, ARGS.devType, devLatencyOverrides, devAutoCollectionOptions, devAdvancedOptions, devProviderCollectionOptions),
    // 微软服务组。
    createSelectGroup(GROUPS.MICROSOFT, baseProxies),
    // OneDrive 组。
    createSelectGroup(GROUPS.ONEDRIVE, baseProxies),
    // 泛游戏组。
    createSelectGroup(GROUPS.GAMES, baseProxies),

    // Bing 组，优先直连。
    createSelectGroup(GROUPS.BING, directFirstProxies),
    // Apple 组，优先直连。
    createSelectGroup(GROUPS.APPLE, directFirstProxies),
    // Steam 组，默认优先直连，也允许切换为测速/故障转移类组。
    createServiceGroup(GROUPS.STEAM, steamProxies, ARGS.steamType, steamLatencyOverrides, steamAutoCollectionOptions, steamAdvancedOptions, steamProviderCollectionOptions),
    // PT 组，优先直连。
    createSelectGroup(GROUPS.PT, directFirstProxies),
    // Speedtest 组，优先直连。
    createSelectGroup(GROUPS.SPEEDTEST, directFirstProxies),

    // YouTube 组，走媒体类候选顺序。
    createSelectGroup(GROUPS.YOUTUBE, mediaProxies),
    // Netflix 组。
    createSelectGroup(GROUPS.NETFLIX, mediaProxies),
    // Disney+ 组。
    createSelectGroup(GROUPS.DISNEY, mediaProxies),
    // Spotify 组。
    createSelectGroup(GROUPS.SPOTIFY, mediaProxies),
    // TikTok 组。
    createSelectGroup(GROUPS.TIKTOK, mediaProxies),

    // 加密货币组，优先日本 / 新加坡 / 香港。
    createSelectGroup(GROUPS.CRYPTO, cryptoProxies),
    // 广告组，优先 REJECT，其次 REJECT-DROP，再次允许直连。
    createSelectGroup(GROUPS.ADS, ["REJECT", "REJECT-DROP", GROUPS.DIRECT]),
    // 全局直连组，本质上是在 DIRECT 和 主选择 之间切换。
    createSelectGroup(GROUPS.DIRECT, [BUILTIN_DIRECT, GROUPS.SELECT])
  ];

  // 如果启用了落地隔离，则额外生成落地节点专用组。
  if (ARGS.landing) {
    generatedGroups.push(
      createIncludeAllSelectGroup(GROUPS.LANDING, composeCaseInsensitivePattern([REGEX_LANDING_ISOLATE.source]))
    );
  }

  // 如果确实检测到低倍率节点，则额外生成低倍率测速组。
  if (hasLowCost) {
    generatedGroups.push(
      createIncludeAllLatencyGroup(GROUPS.LOW_COST, composeCaseInsensitivePattern([REGEX_LOW_COST.source]), "", "url-test")
    );
  }

  // 为每个识别出来的国家生成单独国家组。
  for (const country of countryConfigs) {
    generatedGroups.push(
      createIncludeAllLatencyGroup(country.name, country.filter, countryExcludeFilter, ARGS.lb ? "load-balance" : "url-test")
    );
  }

  // 若启用了区域分组，则基于已生成的国家组再聚合出区域级 select 组，方便做面板布局与快速切换。
  for (const region of resolvedRegionConfigs) {
    generatedGroups.push(
      createSelectGroup(region.name, region.proxies)
    );
  }

  // 最后生成真正的兜底节点组，吸收所有未被国家组等主分组吃掉的节点。
  generatedGroups.push(
    createIncludeAllSelectGroup(GROUPS.OTHER, "", otherExcludeFilter)
  );

  // 再把生成组和用户原配置里的额外组做合并。
  const mergedGroups = mergeProxyGroups(generatedGroups, existingGroups);
  // 最后按布局预设或显式 group-order 对最终策略组顺序做一次重排。
  const orderedGroups = resolveConfiguredProxyGroupOrder(mergedGroups, countryGroupNames, regionGroupNames).groups;

  // full 模式下输出构建耗时。
  if (ARGS.full) {
    console.timeEnd("buildProxyGroups");
  }

  // 返回最终策略组数组。
  return orderedGroups;
}

// 构建 DNS 配置，同时尽量保留用户原配置中的扩展项。
function buildDnsConfig(existingDns) {
  // 把传入值规范成普通对象，便于后续安全合并。
  const currentDns = isObject(existingDns) ? existingDns : {};
  // 允许脚本参数覆盖 DNS cache-algorithm。
  const cacheAlgorithm = ARGS.hasDnsCacheAlgorithm ? ARGS.dnsCacheAlgorithm : (typeof currentDns["cache-algorithm"] === "string" && currentDns["cache-algorithm"] ? currentDns["cache-algorithm"] : "arc");
  // 允许脚本参数覆盖 DNS prefer-h3。
  const preferH3 = ARGS.hasDnsPreferH3 ? ARGS.dnsPreferH3 : parseBool(currentDns["prefer-h3"], false);
  // 允许脚本参数覆盖 DNS respect-rules。
  const respectRules = ARGS.hasDnsRespectRules ? ARGS.dnsRespectRules : parseBool(currentDns["respect-rules"], false);
  // 允许脚本参数覆盖 use-system-hosts。
  const useSystemHosts = ARGS.hasDnsUseSystemHosts ? ARGS.dnsUseSystemHosts : parseBool(currentDns["use-system-hosts"], true);
  // 允许脚本参数覆盖 DNS listen。
  const listen = ARGS.hasDnsListen ? ARGS.dnsListen : (typeof currentDns.listen === "string" && currentDns.listen ? currentDns.listen : ":1053");
  // 允许脚本参数覆盖 fake-ip-filter-mode。
  const fakeIpFilterMode = ARGS.hasFakeIpFilterMode ? ARGS.fakeIpFilterMode : (typeof currentDns["fake-ip-filter-mode"] === "string" && currentDns["fake-ip-filter-mode"] ? currentDns["fake-ip-filter-mode"] : "blacklist");
  // 允许脚本参数覆盖 fake-ip-range。
  const fakeIpRange = ARGS.hasFakeIpRange ? ARGS.fakeIpRange : (typeof currentDns["fake-ip-range"] === "string" && currentDns["fake-ip-range"] ? currentDns["fake-ip-range"] : "198.18.0.1/16");
  // 国内主 DNS 列表，优先阿里和腾讯 DoH。
  const domesticNameservers = [
    "https://dns.alidns.com/dns-query",
    "https://doh.pub/dns-query"
  ];
  // 国际回退 DNS 列表，优先 Cloudflare 和 Google。
  const fallbackNameservers = [
    "https://1.1.1.1/dns-query",
    "https://8.8.8.8/dns-query"
  ];
  // 代理节点域名解析优先走国际 DNS，同时保留国内 DNS 作为兜底。
  const proxyServerNameservers = uniqueStrings([
    ...fallbackNameservers,
    ...domesticNameservers,
    ...toStringArray(currentDns["proxy-server-nameserver"])
  ]);
  // 直连流量域名解析优先走国内 DNS，降低国内直连场景的解析绕路概率。
  const directNameservers = uniqueStrings([
    ...domesticNameservers,
    ...toStringArray(currentDns["direct-nameserver"])
  ]);
  // Fake-IP 排除列表，这些域名强制返回真实 IP。
  const fakeIpFilter = [
    "dns.msftncsi.com",
    "www.msftncsi.com",
    "www.msftconnecttest.com",
    "connectivitycheck.gstatic.com",
    "*.xboxlive.com",
    "*.nintendo.net",
    "*.sonyentertainmentnetwork.com",
    "geosite:cn",
    "geosite:apple",
    "geosite:microsoft",
    "geosite:steam@cn"
  ];
  // 按域名类别分流 DNS 服务器。
  const nameserverPolicy = {
    "geosite:cn,private,apple,steam@cn,microsoft": domesticNameservers,
    "geosite:geolocation-!cn,gfw,google,youtube,telegram,openai,anthropic,google-gemini": fallbackNameservers
  };
  // 专供“节点服务器域名解析”使用的 policy，默认和主 nameserver-policy 保持一致。
  const proxyServerNameserverPolicy = {
    "geosite:cn,private,apple,steam@cn,microsoft": domesticNameservers,
    "geosite:geolocation-!cn,gfw,google,youtube,telegram,openai,anthropic,google-gemini": fallbackNameservers
  };

  // 先合并基础 DNS 开关和全局行为。
  const dns = mergeObjects(currentDns, {
    // 强制启用 DNS 模块。
    enable: true,
    // 是否启用 IPv6 跟随脚本参数。
    ipv6: ARGS.ipv6,
    // 显式启用更适合长时间运行场景的 ARC 缓存算法。
    "cache-algorithm": cacheAlgorithm,
    // prefer-h3 允许用户显式打开，但默认仍保守关闭。
    "prefer-h3": preferH3,
    // 按参数决定走 fake-ip 还是 redir-host。
    "enhanced-mode": ARGS.fakeip ? "fake-ip" : "redir-host",
    // listen 支持参数化，没传参数时优先保留原配置。
    listen,
    // 保留 hosts 支持。
    "use-hosts": parseBool(currentDns["use-hosts"], true),
    // 额外启用系统 hosts，方便桌面端/路由端把静态 hosts 一并纳入解析流程。
    "use-system-hosts": useSystemHosts,
    // fake-ip-filter-mode 支持 blacklist / whitelist / rule，默认仍为 blacklist。
    "fake-ip-filter-mode": fakeIpFilterMode,
    // 若用户自己开启 respect-rules，则这里沿用用户配置；否则默认关闭，减少 DNS 自身依赖规则造成的复杂度。
    "respect-rules": respectRules,
    // fake-ip 地址池优先保留用户原值，否则回落到标准保留网段。
    "fake-ip-range": fakeIpRange
  });

  // 如果启用了 IPv6，则尽量补齐官方示例风格的 fake-ip IPv6 地址池。
  if (ARGS.hasFakeIpRange6) {
    dns["fake-ip-range6"] = ARGS.fakeIpRange6;
  } else if (typeof currentDns["fake-ip-range6"] === "string" && currentDns["fake-ip-range6"]) {
    dns["fake-ip-range6"] = currentDns["fake-ip-range6"];
  } else if (ARGS.ipv6) {
    dns["fake-ip-range6"] = "fdfe:dcba:9876::1/64";
  }

  // fake-ip-ttl 只在用户显式配置或参数传入时才写入，避免无意义覆盖宿主默认值。
  if (ARGS.hasFakeIpTtl || hasOwn(currentDns, "fake-ip-ttl")) {
    dns["fake-ip-ttl"] = ARGS.hasFakeIpTtl ? ARGS.fakeIpTtl : currentDns["fake-ip-ttl"];
  }

  // 默认 DNS 服务器：脚本默认值 + 用户原值，最后做去重。
  dns["default-nameserver"] = uniqueStrings([
    "223.5.5.5",
    "119.29.29.29",
    ...toStringArray(currentDns["default-nameserver"])
  ]);

  // 主 nameserver 列表：国内 DoH 优先，再补上用户自定义项。
  dns.nameserver = uniqueStrings([...domesticNameservers, ...toStringArray(currentDns.nameserver)]);
  // fallback 列表：国际 DNS 优先，再补上用户自定义项。
  dns.fallback = uniqueStrings([...fallbackNameservers, ...toStringArray(currentDns.fallback)]);
  // 代理服务器域名解析单独指定解析器，避免“节点域名也被策略路由”时出现环依赖。
  dns["proxy-server-nameserver"] = proxyServerNameservers;
  // 直连流量也单独指定解析器，配合 follow-policy 让直连域名尽量就近解析。
  dns["direct-nameserver"] = directNameservers;
  // 允许 direct-nameserver 跟随 nameserver-policy，兼顾国内直连与自定义策略。
  dns["direct-nameserver-follow-policy"] = parseBool(currentDns["direct-nameserver-follow-policy"], true);
  // fake-ip-filter：按当前 fake-ip-filter-mode 生成；rule 模式下会自动转为规则语法。
  dns["fake-ip-filter"] = buildFakeIpFilter(fakeIpFilter, currentDns["fake-ip-filter"], fakeIpFilterMode);

  // fallback-filter：先给默认值，再允许用户覆盖/补充。
  dns["fallback-filter"] = mergeObjects(
    {
      geoip: true,
      "geoip-code": "CN",
      geosite: ["gfw"],
      domain: ["+.google.com", "+.facebook.com", "+.youtube.com"],
      ipcidr: ["240.0.0.0/4"]
    },
    currentDns["fallback-filter"]
  );
  // geosite 规则也做去重合并，默认至少保留 gfw。
  dns["fallback-filter"].geosite = uniqueStrings([
    "gfw",
    ...toStringArray(dns["fallback-filter"].geosite)
  ]);
  // domain 规则也做去重合并，兼容官方示例中的兜底域名。
  dns["fallback-filter"].domain = uniqueStrings([
    "+.google.com",
    "+.facebook.com",
    "+.youtube.com",
    ...toStringArray(dns["fallback-filter"].domain)
  ]);
  // fallback-filter 里的 ipcidr 也做去重合并。
  dns["fallback-filter"].ipcidr = uniqueStrings([
    "240.0.0.0/4",
    ...toStringArray(dns["fallback-filter"].ipcidr)
  ]);

  // nameserver-policy 也是默认策略优先，再叠加用户自定义，并合并数组值。
  dns["nameserver-policy"] = mergeDnsPolicyMaps(nameserverPolicy, currentDns["nameserver-policy"]);
  // 节点域名解析策略也单独补齐，避免代理服务器域名始终走单一 DNS。
  dns["proxy-server-nameserver-policy"] = mergeDnsPolicyMaps(
    proxyServerNameserverPolicy,
    currentDns["proxy-server-nameserver-policy"]
  );
  // 返回最终 DNS 配置。
  return dns;
}

// 合并某个协议的 sniff 配置，重点是把端口列表做合并去重。
function mergeSniffProtocol(baseProtocol, existingProtocol) {
  // 先把脚本默认字段和用户自定义字段合并，允许用户显式覆盖默认行为。
  const protocol = mergeObjects(baseProtocol, existingProtocol);
  // 端口列表按“默认端口 + 用户端口”合并并去重。
  protocol.ports = uniqueNumbers([].concat(baseProtocol.ports || [], existingProtocol && existingProtocol.ports || []));
  // 返回合并后的协议配置。
  return protocol;
}

// 构建 Mihomo 通用内核默认项，尽量给出稳妥默认值，同时保留用户显式配置。
function buildKernelDefaults(config) {
  const currentConfig = isObject(config) ? config : {};
  const currentGeoxUrl = isObject(currentConfig["geox-url"]) ? currentConfig["geox-url"] : {};
  const geoxUrl = mergeObjects(GEOX_URLS, currentGeoxUrl);
  const globalUa = ARGS.hasGlobalUa ? ARGS.globalUa : (typeof currentConfig["global-ua"] === "string" && currentConfig["global-ua"] ? currentConfig["global-ua"] : "clash.meta");
  const geoAutoUpdate = ARGS.hasGeoAutoUpdate ? ARGS.geoAutoUpdate : parseBool(currentConfig["geo-auto-update"], false);
  const geoUpdateInterval = ARGS.hasGeoUpdateInterval ? ARGS.geoUpdateInterval : (hasOwn(currentConfig, "geo-update-interval") ? currentConfig["geo-update-interval"] : 24);
  const processMode = ARGS.hasProcessMode ? ARGS.processMode : (typeof currentConfig["find-process-mode"] === "string" && currentConfig["find-process-mode"] ? currentConfig["find-process-mode"] : "strict");
  const geodataMode = ARGS.hasGeodataMode ? ARGS.geodataMode : parseBool(currentConfig["geodata-mode"], true);
  const geodataLoader = ARGS.hasGeodataLoader ? ARGS.geodataLoader : (typeof currentConfig["geodata-loader"] === "string" && currentConfig["geodata-loader"] ? currentConfig["geodata-loader"] : "memconservative");

  return {
    // 绝大多数规则配置都以 rule 模式为主，但若用户已指定则完全保留。
    mode: typeof currentConfig.mode === "string" && currentConfig.mode ? currentConfig.mode : "rule",
    // 统一设置 Mihomo 远程资源下载使用的 User-Agent，便于命中兼容性更好的服务端分支。
    "global-ua": globalUa,
    // 官方推荐的严格进程匹配模式，便于桌面端分应用识别。
    "find-process-mode": processMode,
    // geosite / geoip 相关特性依赖 geodata-mode，脚本既然大量使用 geosite，就尽量显式开启。
    "geodata-mode": geodataMode,
    // 大规则集场景更省内存的 geodata 加载方式。
    "geodata-loader": geodataLoader,
    // 允许 Mihomo 自动更新 GeoX 数据；若用户已有配置则完全保留。
    "geo-auto-update": geoAutoUpdate,
    // GeoX 自动更新间隔按小时计，这里采用官方常见示例值 24 小时。
    "geo-update-interval": geoUpdateInterval,
    // GeoX 下载地址沿用 Mihomo 官方 General 文档推荐值，但允许用户局部覆盖。
    "geox-url": geoxUrl,
    // 启用 ETag 支持，减少规则文件重复下载。
    "etag-support": parseBool(currentConfig["etag-support"], true),
    // 按当前 Mihomo General 文档推荐值，保活空闲时间默认 15 秒。
    "keep-alive-idle": hasOwn(currentConfig, "keep-alive-idle") ? currentConfig["keep-alive-idle"] : 15,
    // 给保活探测一个较温和的默认间隔。
    "keep-alive-interval": hasOwn(currentConfig, "keep-alive-interval") ? currentConfig["keep-alive-interval"] : 15,
    // 默认不关闭 keep-alive，但允许用户手动覆盖。
    "disable-keep-alive": hasOwn(currentConfig, "disable-keep-alive") ? currentConfig["disable-keep-alive"] : false,
    // 按官方文档推荐默认开启 TCP 并发建连，加快多路候选链路握手。
    "tcp-concurrent": hasOwn(currentConfig, "tcp-concurrent") ? currentConfig["tcp-concurrent"] : true
  };
}

// 构建 Sniffer 配置，同时保留用户原有的扩展设置。
function buildSnifferConfig(existingSniffer) {
  // 规范化原 Sniffer 配置。
  const currentSniffer = isObject(existingSniffer) ? existingSniffer : {};
  // 规范化 sniff 子对象。
  const currentSniff = isObject(currentSniffer.sniff) ? currentSniffer.sniff : {};
  // force-dns-mapping 支持参数优先，其次保留用户原值，最后回落脚本默认。
  const forceDnsMapping = ARGS.hasSnifferForceDnsMapping ? ARGS.snifferForceDnsMapping : parseBool(currentSniffer["force-dns-mapping"], true);
  // parse-pure-ip 支持参数优先，其次保留用户原值，最后回落脚本默认。
  const parsePureIp = ARGS.hasSnifferParsePureIp ? ARGS.snifferParsePureIp : parseBool(currentSniffer["parse-pure-ip"], true);
  // 全局 override-destination 支持参数优先，其次保留用户原值，最后回落脚本默认 false。
  const overrideDestination = ARGS.hasSnifferOverrideDestination ? ARGS.snifferOverrideDestination : parseBool(currentSniffer["override-destination"], false);
  // 参考 Mihomo 官方示例，给少数容易被 Sniffer 干扰的域名做默认豁免。
  const defaultSkipDomains = [
    "Mijia Cloud",
    "+.push.apple.com"
  ];
  // 参考你现有 Nikki 配置，把 OpenAI / Anthropic 加入默认强制嗅探域名，提升 AI 分流命中率。
  const defaultForceDomains = [
    "+.openai.com",
    "+.anthropic.com"
  ];

  // 先合并全局 Sniffer 开关和默认行为。
  const sniffer = mergeObjects(currentSniffer, {
    enable: true,
    "force-dns-mapping": forceDnsMapping,
    "parse-pure-ip": parsePureIp,
    "override-destination": overrideDestination
  });

  // 复制出 sniff 协议表，后续分别处理 TLS / HTTP / QUIC。
  const protocols = mergeObjects(currentSniff, {});
  // 合并 TLS 嗅探端口。
  protocols.TLS = mergeSniffProtocol({ ports: [443, 8443] }, currentSniff.TLS);
  // 合并 HTTP 嗅探端口，并默认开启目标覆写，提升基于 Host 的分流命中率。
  protocols.HTTP = mergeSniffProtocol({ ports: [80, 8080, 8880], "override-destination": true }, currentSniff.HTTP);
  // 合并 QUIC 嗅探端口。
  protocols.QUIC = mergeSniffProtocol({ ports: [443, 8443] }, currentSniff.QUIC);

  // 如果用户显式传入 HTTP 覆写参数，则强制覆盖协议级设置。
  if (ARGS.hasSnifferHttpOverrideDestination) {
    protocols.HTTP["override-destination"] = ARGS.snifferHttpOverrideDestination;
  }

  // 把协议表挂回 sniffer。
  sniffer.sniff = protocols;

  // skip-domain 默认合并官方示例中的保底域名，再叠加用户自定义值。
  sniffer["skip-domain"] = uniqueStrings(defaultSkipDomains.concat(toStringArray(currentSniffer["skip-domain"]), ARGS.snifferSkipDomains));

  // force-domain 默认补上 AI 服务常见主域名，再叠加用户原值，提升域名嗅探命中率。
  if (Array.isArray(currentSniffer["force-domain"]) || typeof currentSniffer["force-domain"] === "string" || defaultForceDomains.length) {
    sniffer["force-domain"] = uniqueStrings(defaultForceDomains.concat(toStringArray(currentSniffer["force-domain"]), ARGS.snifferForceDomains));
  }

  // 如果用户原配置中已经定义了基于源地址/目标地址的嗅探豁免，也一并保留。
  if (Array.isArray(currentSniffer["skip-src-address"]) || typeof currentSniffer["skip-src-address"] === "string") {
    sniffer["skip-src-address"] = uniqueStrings(toStringArray(currentSniffer["skip-src-address"]));
  }

  if (Array.isArray(currentSniffer["skip-dst-address"]) || typeof currentSniffer["skip-dst-address"] === "string") {
    sniffer["skip-dst-address"] = uniqueStrings(toStringArray(currentSniffer["skip-dst-address"]));
  }

  // 返回最终 Sniffer 配置。
  return sniffer;
}

// 把国家分组统计格式化成单行文本，便于 full 模式输出日志。
function buildCountrySummary(countryConfigs) {
  return countryConfigs.map((country) => `${country.name}(${country.count})`).join(" / ");
}

// 把某条国家优先链最终命中的国家组压成紧凑摘要，便于写入 full 日志与响应调试头。
function formatPreferredCountryGroupSummary(groups) {
  const names = uniqueStrings((Array.isArray(groups) ? groups : [])
    .map((group) => group && group.name)
    .filter(Boolean));

  return names.length ? `${names.length}:${formatProviderPreviewNames(names, 8, 18)}` : "none";
}

// 把来源类型 + 规范来源键压成短标签，便于直接写进日志与响应头。
function formatPreferredCountryTraceSource(entry) {
  const current = isObject(entry) ? entry : {};
  const sourceType = sanitizeProviderPreviewName(current.sourceType || "unknown");
  const sourceKey = sanitizeProviderPreviewName(current.sourceKey || current.sourceToken || "unknown");
  const sourceToken = sanitizeProviderPreviewName(current.sourceToken || "");

  return sourceToken && sourceToken !== sourceKey
    ? `${sourceType}:${sourceKey}[${sourceToken}]`
    : `${sourceType}:${sourceKey}`;
}

// 把国家优先链来源追踪压成紧凑摘要：同一来源聚合同一批最终命中国家组。
function formatPreferredCountryGroupTrace(entries) {
  const buckets = [];
  const bucketLookup = Object.create(null);

  for (const entry of Array.isArray(entries) ? entries : []) {
    if (!isObject(entry) || typeof entry.name !== "string" || !entry.name) {
      continue;
    }

    const bucketKey = `${entry.sourceType}::${entry.sourceKey}::${entry.sourceToken}`;
    if (!bucketLookup[bucketKey]) {
      bucketLookup[bucketKey] = {
        sourceType: entry.sourceType,
        sourceKey: entry.sourceKey,
        sourceToken: entry.sourceToken,
        names: []
      };
      buckets.push(bucketLookup[bucketKey]);
    }

    bucketLookup[bucketKey].names.push(entry.name);
  }

  if (!buckets.length) {
    return "none";
  }

  const visibleBuckets = buckets.slice(0, 6).map((bucket) => `${formatPreferredCountryTraceSource(bucket)}->${formatProviderPreviewNames(uniqueStrings(bucket.names), 4, 18)}`);
  const remaining = buckets.length - visibleBuckets.length;
  return `${visibleBuckets.join("; ")}${remaining > 0 ? `; +${remaining}` : ""}`;
}

// 把“每个输入 token 是怎么被解析的”压成短摘要，便于直接确认 classic-4 / eastasia / 日本 这些标记分别落到了哪。
function formatPreferredCountryMarkerResolutionSummary(items) {
  const source = Array.isArray(items) ? items : [];
  if (!source.length) {
    return "none";
  }

  const visibleItems = source.slice(0, 6).map((item) => {
    const token = sanitizeProviderPreviewName(item && item.token ? item.token : "unknown");
    if (!item || !item.matched) {
      return `${token}=unmatched`;
    }

    return `${token}=${formatPreferredCountryTraceSource(item)}->${formatProviderPreviewNames((item.groups || []).map((group) => group && group.name).filter(Boolean), 4, 18)}`;
  });
  const remaining = source.length - visibleItems.length;
  return `${visibleItems.join("; ")}${remaining > 0 ? `; +${remaining}` : ""}`;
}

// 单独汇总未命中的 token，便于在响应头里快速看见哪几个标记写了但当前没生成出来。
function formatPreferredCountryUnmatchedSummary(tokens) {
  const names = uniqueStrings((Array.isArray(tokens) ? tokens : []).map((item) => sanitizeProviderPreviewName(item)).filter(Boolean));
  return names.length ? `${names.length}:${formatProviderPreviewNames(names, 8, 18)}` : "none";
}

// 输出构建过程中的诊断信息，例如自动重命名和一致性校验告警。
function logDiagnostics(diagnostics) {
  // 没有诊断对象就直接跳过。
  if (!isObject(diagnostics)) {
    return;
  }

  // 节点名称发生自动规范化/重命名时，输出提醒。
  if (Array.isArray(diagnostics.renamedProxies) && diagnostics.renamedProxies.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.renamedProxies.length} 个节点名称被自动规范化或重命名`);

    // full 模式下额外输出前几个示例，方便定位。
    if (ARGS.full) {
      for (const item of diagnostics.renamedProxies.slice(0, 8)) {
        console.warn(`   · ${item.from} => ${item.to}`);
      }
    }
  }

  // 如果规则引用了不存在的 provider，输出告警。
  if (Array.isArray(diagnostics.missingProviders) && diagnostics.missingProviders.length) {
    console.warn(`⚠️ 规则定义引用了不存在的 rule-provider: ${diagnostics.missingProviders.join(", ")}`);
  }

  // 如果检测到已弃用的配置项，也输出提醒。
  if (Array.isArray(diagnostics.deprecatedSettings) && diagnostics.deprecatedSettings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.deprecatedSettings.length} 个已弃用配置项`);

    if (ARGS.full) {
      for (const item of diagnostics.deprecatedSettings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果 rule-provider 的远程链接不合法，也输出提醒。
  if (Array.isArray(diagnostics.invalidRuleProviderUrls) && diagnostics.invalidRuleProviderUrls.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.invalidRuleProviderUrls.length} 个 rule-provider URL 异常`);

    if (ARGS.full) {
      for (const item of diagnostics.invalidRuleProviderUrls.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果 rule-provider 官方结构语义存在异常，也输出提醒。
  if (Array.isArray(diagnostics.ruleProviderWarnings) && diagnostics.ruleProviderWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.ruleProviderWarnings.length} 个 rule-provider 语义异常`);

    if (ARGS.full) {
      for (const item of diagnostics.ruleProviderWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果 proxy-provider 下载控制或健康检查存在异常，也输出提醒。
  if (Array.isArray(diagnostics.proxyProviderWarnings) && diagnostics.proxyProviderWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.proxyProviderWarnings.length} 个 proxy-provider 参数异常`);

    if (ARGS.full) {
      for (const item of diagnostics.proxyProviderWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果命中 DNS 风险组合，也输出提醒。
  if (Array.isArray(diagnostics.dnsRiskWarnings) && diagnostics.dnsRiskWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.dnsRiskWarnings.length} 个 DNS 风险组合`);

    if (ARGS.full) {
      for (const item of diagnostics.dnsRiskWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果 DNS 高级项落在非常规取值，也输出提醒。
  if (Array.isArray(diagnostics.dnsOptionWarnings) && diagnostics.dnsOptionWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.dnsOptionWarnings.length} 个 DNS 选项风险`);

    if (ARGS.full) {
      for (const item of diagnostics.dnsOptionWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果测速组健康检查参数存在异常，也输出提醒。
  if (Array.isArray(diagnostics.latencyGroupWarnings) && diagnostics.latencyGroupWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.latencyGroupWarnings.length} 个测速组参数异常`);

    if (ARGS.full) {
      for (const item of diagnostics.latencyGroupWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果某些 latency/load-balance 组主要通过 provider 池引入节点，也输出官方语义提醒。
  if (Array.isArray(diagnostics.providerHealthWarnings) && diagnostics.providerHealthWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.providerHealthWarnings.length} 个 provider 型健康检查提醒`);

    if (ARGS.full) {
      for (const item of diagnostics.providerHealthWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果 AI / Crypto 国家优先链里有未匹配的国家标记，也输出提醒。
  if (Array.isArray(diagnostics.preferredCountryWarnings) && diagnostics.preferredCountryWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.preferredCountryWarnings.length} 个国家优先链标记未命中`);

    if (ARGS.full) {
      for (const item of diagnostics.preferredCountryWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果 GitHub / Steam 前置组标记未命中或错误引用自身，也输出提醒。
  if (Array.isArray(diagnostics.preferredGroupWarnings) && diagnostics.preferredGroupWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.preferredGroupWarnings.length} 个独立组前置组标记异常`);

    if (ARGS.full) {
      for (const item of diagnostics.preferredGroupWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果 GitHub / Steam 点名节点标记未命中或存在歧义，也输出提醒。
  if (Array.isArray(diagnostics.preferredNodeWarnings) && diagnostics.preferredNodeWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.preferredNodeWarnings.length} 个独立组点名节点标记异常`);

    if (ARGS.full) {
      for (const item of diagnostics.preferredNodeWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果 GitHub / Steam provider 池标记未命中，也输出提醒。
  if (Array.isArray(diagnostics.preferredProviderWarnings) && diagnostics.preferredProviderWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.preferredProviderWarnings.length} 个独立组 provider 池参数异常`);

    if (ARGS.full) {
      for (const item of diagnostics.preferredProviderWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果显式 group-order 有未命中的条目，也输出提醒。
  if (Array.isArray(diagnostics.groupOrderWarnings) && diagnostics.groupOrderWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.groupOrderWarnings.length} 个策略组布局参数异常`);

    if (ARGS.full) {
      for (const item of diagnostics.groupOrderWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果 GitHub / Steam / SteamCN 规则顺序锚点参数未命中或引用自身，也输出提醒。
  if (Array.isArray(diagnostics.ruleOrderWarnings) && diagnostics.ruleOrderWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.ruleOrderWarnings.length} 个规则顺序参数异常`);

    if (ARGS.full) {
      for (const item of diagnostics.ruleOrderWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果 custom-rule-anchor 未命中，也输出提醒。
  if (Array.isArray(diagnostics.customRuleOrderWarnings) && diagnostics.customRuleOrderWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.customRuleOrderWarnings.length} 个自定义规则编排异常`);

    if (ARGS.full) {
      for (const item of diagnostics.customRuleOrderWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果 GitHub / Steam / SteamCN 规则入口目标参数未命中，也输出提醒。
  if (Array.isArray(diagnostics.ruleTargetWarnings) && diagnostics.ruleTargetWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.ruleTargetWarnings.length} 个规则入口目标参数异常`);

    if (ARGS.full) {
      for (const item of diagnostics.ruleTargetWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果某些宽泛规则排在特定业务规则前面，也输出风险提醒。
  if (Array.isArray(diagnostics.rulePriorityWarnings) && diagnostics.rulePriorityWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.rulePriorityWarnings.length} 个规则优先级风险`);

    if (ARGS.full) {
      for (const item of diagnostics.rulePriorityWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果关键策略组的候选链顺序异常，也输出风险提醒。
  if (Array.isArray(diagnostics.proxyGroupPriorityWarnings) && diagnostics.proxyGroupPriorityWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.proxyGroupPriorityWarnings.length} 个策略组候选链风险`);

    if (ARGS.full) {
      for (const item of diagnostics.proxyGroupPriorityWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果自定义规则区间存在明显异常，也输出提醒。
  if (Array.isArray(diagnostics.customRuleWarnings) && diagnostics.customRuleWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.customRuleWarnings.length} 个自定义规则提醒`);

    if (ARGS.full) {
      for (const item of diagnostics.customRuleWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果关键业务的专属链路出现明显偏离，也输出提醒。
  if (Array.isArray(diagnostics.serviceRoutingWarnings) && diagnostics.serviceRoutingWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.serviceRoutingWarnings.length} 个业务链路提醒`);

    if (ARGS.full) {
      for (const item of diagnostics.serviceRoutingWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果当前目标平台看起来不是 Clash / Mihomo，也输出提醒。
  if (Array.isArray(diagnostics.targetPlatformWarnings) && diagnostics.targetPlatformWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.targetPlatformWarnings.length} 个目标平台兼容性提醒`);

    if (ARGS.full) {
      for (const item of diagnostics.targetPlatformWarnings.slice(0, 5)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果存在未消费脚本参数，也输出提醒，便于尽快发现拼写错误或未支持参数。
  if (Array.isArray(diagnostics.runtimeArgWarnings) && diagnostics.runtimeArgWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.runtimeArgWarnings.length} 个参数诊断提醒`);

    if (ARGS.full) {
      for (const item of diagnostics.runtimeArgWarnings.slice(0, 5)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果当前环境不支持写入官方 `_res.headers`，也输出提醒。
  if (Array.isArray(diagnostics.runtimeResponseWarnings) && diagnostics.runtimeResponseWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.runtimeResponseWarnings.length} 个响应调试链路提醒`);

    if (ARGS.full) {
      for (const item of diagnostics.runtimeResponseWarnings.slice(0, 5)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果官方保留下载参数存在潜在歧义，也输出提醒。
  if (Array.isArray(diagnostics.runtimeLinkWarnings) && diagnostics.runtimeLinkWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.runtimeLinkWarnings.length} 个下载链路参数提醒`);

    if (ARGS.full) {
      for (const item of diagnostics.runtimeLinkWarnings.slice(0, 5)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果 GEO 配置不完整，也输出提醒。
  if (Array.isArray(diagnostics.geoConfigWarnings) && diagnostics.geoConfigWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.geoConfigWarnings.length} 个 GEO 配置风险`);

    if (ARGS.full) {
      for (const item of diagnostics.geoConfigWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果核心内核项落在非常规取值，也输出提醒。
  if (Array.isArray(diagnostics.kernelOptionWarnings) && diagnostics.kernelOptionWarnings.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.kernelOptionWarnings.length} 个核心内核项风险`);

    if (ARGS.full) {
      for (const item of diagnostics.kernelOptionWarnings.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果 provider 本地缓存路径发生冲突，也输出告警。
  if (Array.isArray(diagnostics.duplicateRuleProviderPaths) && diagnostics.duplicateRuleProviderPaths.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.duplicateRuleProviderPaths.length} 个 rule-provider path 冲突`);

    // full 模式下输出部分明细。
    if (ARGS.full) {
      for (const item of diagnostics.duplicateRuleProviderPaths.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果规则目标组缺失，输出告警。
  if (Array.isArray(diagnostics.missingRuleTargets) && diagnostics.missingRuleTargets.length) {
    console.warn(`⚠️ 规则目标策略组缺失: ${diagnostics.missingRuleTargets.join(", ")}`);
  }

  // 如果策略组引用了解析不到的组名/节点名，也输出告警。
  if (Array.isArray(diagnostics.unresolvedGroupReferences) && diagnostics.unresolvedGroupReferences.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.unresolvedGroupReferences.length} 个策略组引用无法解析`);

    // full 模式下输出部分明细。
    if (ARGS.full) {
      for (const item of diagnostics.unresolvedGroupReferences.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果某些策略组里的 use 引用无法解析到 proxy-providers，也输出告警。
  if (Array.isArray(diagnostics.unresolvedProviderReferences) && diagnostics.unresolvedProviderReferences.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.unresolvedProviderReferences.length} 个 proxy-provider 引用无法解析`);

    if (ARGS.full) {
      for (const item of diagnostics.unresolvedProviderReferences.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果某些自动分组的正则无法编译，输出告警。
  if (Array.isArray(diagnostics.invalidGroupPatterns) && diagnostics.invalidGroupPatterns.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.invalidGroupPatterns.length} 个自动分组的过滤正则无效`);

    // full 模式下输出部分明细。
    if (ARGS.full) {
      for (const item of diagnostics.invalidGroupPatterns.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果某些 include-all 自动分组实际上一个节点都匹配不到，也输出告警。
  if (Array.isArray(diagnostics.emptyAutoGroups) && diagnostics.emptyAutoGroups.length) {
    console.warn(`⚠️ 检测到 ${diagnostics.emptyAutoGroups.length} 个自动分组当前为空`);

    // full 模式下输出部分明细。
    if (ARGS.full) {
      for (const item of diagnostics.emptyAutoGroups.slice(0, 12)) {
        console.warn(`   · ${item}`);
      }
    }
  }

  // 如果存在未被国家体系识别的节点，也输出提醒，便于后续扩充国家别名。
  if (typeof diagnostics.unclassifiedCountryProxies === "number" && diagnostics.unclassifiedCountryProxies > 0) {
    console.warn(`⚠️ 检测到 ${diagnostics.unclassifiedCountryProxies} 个节点未命中任何国家识别规则`);

    // full 模式下输出部分样本。
    if (ARGS.full && Array.isArray(diagnostics.unclassifiedCountryExamples)) {
      for (const item of diagnostics.unclassifiedCountryExamples.slice(0, 10)) {
        console.warn(`   · ${item}`);
      }
    }
  }
}

// 输出 full 模式下的构建统计信息。
function logBuildSummary(stats) {
  // 输出主标题并带上脚本版本。
  console.log(`📊 配置生成完毕 (Sub-Store.js v${SCRIPT_VERSION})`);
  // 输出代理节点总数。
  console.log(`   ✓ 代理节点: ${stats.totalProxies} 个`);
  // 输出有效节点数。
  console.log(`   ✓ 有效节点: ${stats.validProxies} 个`);
  // 输出低倍率节点数。
  console.log(`   ✓ 低倍率节点: ${stats.lowCostProxies} 个`);
  // 输出落地节点数。
  console.log(`   ✓ 落地节点: ${stats.landingProxies} 个`);
  // 输出国家分组数量。
  console.log(`   ✓ 国家分组: ${stats.countryGroups} 个`);
  // 输出区域分组数量。
  console.log(`   ✓ 区域分组: ${stats.regionGroups} 个`);
  // 输出策略组总数。
  console.log(`   ✓ 策略组: ${stats.proxyGroups} 个`);
  // 输出规则总数。
  console.log(`   ✓ 规则数: ${stats.rules} 条`);
  // 输出国家识别覆盖数。
  console.log(`   ✓ 国家识别节点: ${stats.classifiedCountryProxies} 个`);
  // 输出国家未识别节点数。
  console.log(`   ✓ 国家未识别节点: ${stats.unclassifiedCountryProxies} 个`);
  // 输出自动规范化/重命名节点数量。
  console.log(`   ✓ 自动改名节点: ${stats.renamedProxies} 个`);
  // 输出 provider 缺失告警数。
  console.log(`   ✓ Provider告警: ${stats.missingProviders} 条`);
  // 输出 provider URL 异常数。
  console.log(`   ✓ Provider链接告警: ${stats.invalidRuleProviderUrls} 条`);
  // 输出 rule-provider 官方语义异常数。
  console.log(`   ✓ 规则源语义告警: ${stats.ruleProviderWarnings} 条`);
  // 输出 proxy-provider 参数异常数。
  console.log(`   ✓ 代理集合告警: ${stats.proxyProviderWarnings} 条`);
  // 输出已弃用配置项告警数。
  console.log(`   ✓ 弃用项告警: ${stats.deprecatedSettings} 条`);
  // 输出 DNS 风险组合告警数。
  console.log(`   ✓ DNS风险告警: ${stats.dnsRiskWarnings} 条`);
  // 输出 DNS 选项风险告警数。
  console.log(`   ✓ DNS选项告警: ${stats.dnsOptionWarnings} 条`);
  // 输出测速组参数告警数。
  console.log(`   ✓ 测速组告警: ${stats.latencyGroupWarnings} 条`);
  // 输出 provider 型健康检查提醒数。
  console.log(`   ✓ Provider健康提醒: ${stats.providerHealthWarnings} 条`);
  // 输出国家优先链未命中告警数。
  console.log(`   ✓ 优先链告警: ${stats.preferredCountryWarnings} 条`);
  // 输出独立组前置组标记告警数。
  console.log(`   ✓ 前置组告警: ${stats.preferredGroupWarnings} 条`);
  // 输出独立组点名节点标记告警数。
  console.log(`   ✓ 点名节点告警: ${stats.preferredNodeWarnings} 条`);
  // 输出独立组 provider 池参数告警数。
  console.log(`   ✓ Provider池告警: ${stats.preferredProviderWarnings} 条`);
  // 输出策略组布局参数告警数。
  console.log(`   ✓ 策略组布局告警: ${stats.groupOrderWarnings} 条`);
  // 输出规则顺序参数告警数。
  console.log(`   ✓ 规则顺序告警: ${stats.ruleOrderWarnings} 条`);
  // 输出自定义规则编排参数告警数。
  console.log(`   ✓ 自定义规则编排告警: ${stats.customRuleOrderWarnings} 条`);
  // 输出规则入口目标参数告警数。
  console.log(`   ✓ 规则入口告警: ${stats.ruleTargetWarnings} 条`);
  // 输出规则优先级风险告警数。
  console.log(`   ✓ 规则优先级风险: ${stats.rulePriorityWarnings} 条`);
  // 输出策略组候选链风险告警数。
  console.log(`   ✓ 候选链风险: ${stats.proxyGroupPriorityWarnings} 条`);
  // 输出自定义规则提醒数。
  console.log(`   ✓ 自定义规则提醒: ${stats.customRuleWarnings} 条`);
  // 输出关键业务链路提醒数。
  console.log(`   ✓ 业务链路提醒: ${stats.serviceRoutingWarnings} 条`);
  // 输出目标平台兼容性提醒数。
  console.log(`   ✓ 平台提醒: ${stats.targetPlatformWarnings} 条`);
  // 输出未消费参数诊断提醒数。
  console.log(`   ✓ 参数诊断提醒: ${stats.runtimeArgWarnings} 条`);
  // 输出响应调试链路提醒数。
  console.log(`   ✓ 响应头提醒: ${stats.runtimeResponseWarnings} 条`);
  // 输出下载链路参数提醒数。
  console.log(`   ✓ 链路参数提醒: ${stats.runtimeLinkWarnings} 条`);
  // 输出 GEO 配置风险告警数。
  console.log(`   ✓ GEO风险告警: ${stats.geoConfigWarnings} 条`);
  // 输出核心内核项风险告警数。
  console.log(`   ✓ 核心项告警: ${stats.kernelOptionWarnings} 条`);
  // 输出 provider path 冲突告警数。
  console.log(`   ✓ Provider路径告警: ${stats.duplicateRuleProviderPaths} 条`);
  // 输出规则目标缺失告警数。
  console.log(`   ✓ 规则目标告警: ${stats.missingRuleTargets} 条`);
  // 输出策略组引用异常数量。
  console.log(`   ✓ 引用异常告警: ${stats.unresolvedGroupReferences} 条`);
  // 输出 proxy-provider 引用异常数量。
  console.log(`   ✓ Provider引用告警: ${stats.unresolvedProviderReferences} 条`);
  // 输出自动分组正则异常数量。
  console.log(`   ✓ 分组正则告警: ${stats.invalidGroupPatterns} 条`);
  // 输出空自动分组数量。
  console.log(`   ✓ 空自动分组告警: ${stats.emptyAutoGroups} 条`);

  // 如果有国家统计摘要，则补充输出。
  if (stats.countrySummary) {
    console.log(`   ✓ 国家统计: ${stats.countrySummary}`);
  }

  // 如果有区域统计摘要，则补充输出。
  if (stats.regionGroupSummary) {
    console.log(`   ✓ 区域统计: ${stats.regionGroupSummary}`);
  }

  // 如果有国家优先链来源追踪，则补充输出，便于直接区分 preset / region / country 的展开来源。
  if (stats.aiPreferCountryTraceSummary || stats.cryptoPreferCountryTraceSummary || stats.githubPreferCountryTraceSummary || stats.steamPreferCountryTraceSummary || stats.devPreferCountryTraceSummary) {
    console.log(`   ✓ 国家优先链来源: AI=${stats.aiPreferCountryTraceSummary || "none"}, Crypto=${stats.cryptoPreferCountryTraceSummary || "none"}, GitHub=${stats.githubPreferCountryTraceSummary || "none"}, Steam=${stats.steamPreferCountryTraceSummary || "none"}, Dev=${stats.devPreferCountryTraceSummary || "none"}`);
  }

  // 如果有逐 token 解析说明，则输出每条链的 explain 摘要，便于直接定位是哪个标记没命中。
  if (stats.aiPreferCountryExplainSummary || stats.cryptoPreferCountryExplainSummary || stats.githubPreferCountryExplainSummary || stats.steamPreferCountryExplainSummary || stats.devPreferCountryExplainSummary) {
    console.log(`   ✓ 国家优先链解析: AI=${stats.aiPreferCountryExplainSummary || "none"}, Crypto=${stats.cryptoPreferCountryExplainSummary || "none"}, GitHub=${stats.githubPreferCountryExplainSummary || "none"}, Steam=${stats.steamPreferCountryExplainSummary || "none"}, Dev=${stats.devPreferCountryExplainSummary || "none"}`);
  }

  // 如果有未命中的 token，则再单独给一行更紧凑的未命中摘要。
  if (stats.aiPreferCountryUnmatchedSummary || stats.cryptoPreferCountryUnmatchedSummary || stats.githubPreferCountryUnmatchedSummary || stats.steamPreferCountryUnmatchedSummary || stats.devPreferCountryUnmatchedSummary) {
    console.log(`   ✓ 国家优先链未命中: AI=${stats.aiPreferCountryUnmatchedSummary || "none"}, Crypto=${stats.cryptoPreferCountryUnmatchedSummary || "none"}, GitHub=${stats.githubPreferCountryUnmatchedSummary || "none"}, Steam=${stats.steamPreferCountryUnmatchedSummary || "none"}, Dev=${stats.devPreferCountryUnmatchedSummary || "none"}`);
  }

  // 输出国家组 / 区域组排序模式，便于直接确认当前面板顺序和部分候选链顺序是按什么口径生成。
  console.log(`   ✓ 分组排序: countries=${ARGS.countryGroupSort}${ARGS.hasCountryGroupSort ? "" : " (default)"}, regions=${ARGS.regionGroupSort}${ARGS.hasRegionGroupSort ? "" : " (default)"}`);

  // 最后输出本次运行采用的参数组合，便于排查。
  console.log(`   ✓ 参数: ipv6=${ARGS.ipv6}, landing=${ARGS.landing}, hidden=${ARGS.hidden}, load-balance=${ARGS.lb}, fakeip=${ARGS.fakeip}, quic=${ARGS.quic}, unified-delay=${ARGS.hasUnifiedDelay ? ARGS.unifiedDelay : "config"}, tcp-concurrent=${ARGS.hasTcpConcurrent ? ARGS.tcpConcurrent : "config"}, dns-respect-rules=${ARGS.hasDnsRespectRules ? ARGS.dnsRespectRules : "config"}, dns-prefer-h3=${ARGS.hasDnsPreferH3 ? ARGS.dnsPreferH3 : "config"}, profile-cache=${ARGS.hasProfileCache ? ARGS.profileCache : "auto"}, geo-auto-update=${ARGS.hasGeoAutoUpdate ? ARGS.geoAutoUpdate : "config"}, geo-update-interval=${ARGS.hasGeoUpdateInterval ? ARGS.geoUpdateInterval : "config"}, threshold=${ARGS.threshold}`);
  // 额外输出本轮新增的测速组参数覆盖情况。
  console.log(`   ✓ 测速参数: test-url=${ARGS.hasTestUrl ? ARGS.testUrl : "default"}, group-interval=${ARGS.hasGroupInterval ? ARGS.groupInterval : "default"}, group-tolerance=${ARGS.hasGroupTolerance ? ARGS.groupTolerance : "default"}, group-timeout=${ARGS.hasGroupTimeout ? ARGS.groupTimeout : "default"}, group-max-failed-times=${ARGS.hasGroupMaxFailedTimes ? ARGS.groupMaxFailedTimes : "default"}, group-expected-status=${ARGS.hasGroupExpectedStatus ? ARGS.groupExpectedStatus : "default"}, group-lazy=${ARGS.hasGroupLazy ? ARGS.groupLazy : "default"}, group-strategy=${ARGS.hasGroupStrategy ? ARGS.groupStrategy : "default"}`);
  // 输出 Sniffer 参数覆盖情况。
  console.log(`   ✓ Sniffer参数: force-dns-mapping=${ARGS.hasSnifferForceDnsMapping ? ARGS.snifferForceDnsMapping : "default"}, parse-pure-ip=${ARGS.hasSnifferParsePureIp ? ARGS.snifferParsePureIp : "default"}, override-destination=${ARGS.hasSnifferOverrideDestination ? ARGS.snifferOverrideDestination : "default"}, http-override-destination=${ARGS.hasSnifferHttpOverrideDestination ? ARGS.snifferHttpOverrideDestination : "default"}`);
  // 输出 Sniffer 域名追加参数覆盖情况。
  console.log(`   ✓ Sniffer域名: force-domain+=${ARGS.hasSnifferForceDomains ? ARGS.snifferForceDomains.join(" | ") : "default"}, skip-domain+=${ARGS.hasSnifferSkipDomains ? ARGS.snifferSkipDomains.join(" | ") : "default"}`);
  // 输出 DNS listen / fake-ip 地址池覆盖情况。
  console.log(`   ✓ DNS池参数: listen=${ARGS.hasDnsListen ? ARGS.dnsListen : "config/default"}, fake-ip-range=${ARGS.hasFakeIpRange ? ARGS.fakeIpRange : "config/default"}, fake-ip-range6=${ARGS.hasFakeIpRange6 ? ARGS.fakeIpRange6 : (ARGS.ipv6 ? "auto/default" : "off")}`);
  // 输出自定义规则源覆盖情况。
  console.log(`   ✓ 规则源参数: preset=${ARGS.hasRuleSourcePreset ? ARGS.ruleSourcePreset : DEFAULT_RULE_SOURCE_PRESET}, steam-fix=${ARGS.hasSteamFix ? ARGS.steamFix : false}, steam-fix-url=${ARGS.steamFix ? (ARGS.hasSteamFixUrl ? ARGS.steamFixUrl : STEAM_FIX_LIST_URL) : "disabled"}, direct-list-url=${ARGS.hasDirectListUrl ? ARGS.directListUrl : "default"}, crypto-list-url=${ARGS.hasCryptoListUrl ? ARGS.cryptoListUrl : "default"}, chatgpt-list-url=${ARGS.hasChatGptListUrl ? ARGS.chatGptListUrl : "default"}, ai-extra-list-url=${ARGS.hasAiExtraListUrl ? ARGS.aiExtraListUrl : "default"}, grok-rule-url=${accademiaAdditionalRule("Grok")}, apple-ai-rule-url=${accademiaAdditionalRule("AppleAI")}, provider-path-dir=${ARGS.ruleProviderPathDir}, provider-interval=${ARGS.hasRuleProviderInterval ? ARGS.ruleProviderInterval : RULE_INTERVAL}, provider-proxy=${ARGS.hasRuleProviderProxy ? ARGS.ruleProviderProxy : "default"}, provider-size-limit=${ARGS.hasRuleProviderSizeLimit ? ARGS.ruleProviderSizeLimit : "default"}, provider-ua=${ARGS.hasRuleProviderUserAgent ? ARGS.ruleProviderUserAgent : "default"}, provider-auth=${ARGS.hasRuleProviderAuthorization ? "configured" : "default"}, provider-headers=${ARGS.hasRuleProviderHeader ? ARGS.ruleProviderHeaderEntryCount : "default"}, provider-payload=${ARGS.hasRuleProviderPayload ? ARGS.ruleProviderPayloadCount : "default"}, scope=${(ARGS.hasRuleProviderPathDir || hasRuleProviderDownloadConfiguredOptions()) ? "all-http" : "generated/default"}, payload-scope=${ARGS.hasRuleProviderPayload ? "inline-only" : "default"}, apply-scope=${buildRuleProviderApplyScopeSummary()}, apply-stats=${stats.ruleProviderApplyStatsSummary}, apply-preview=${stats.ruleProviderApplyPreviewSummary}, mutation-stats=${stats.ruleProviderMutationStatsSummary}, mutation-preview=${stats.ruleProviderMutationPreviewSummary}`);
  // 输出 rule-provider 官方语义自检开关，便于确认本轮自检已启用。
  console.log("   ✓ 规则源语义: official-type/behavior/format/path/payload-check=on, safe-path-hint=on");
  // 输出 proxy-provider 下载控制、节点池筛选与 health-check 覆盖情况。
  console.log(`   ✓ 代理集合参数: interval=${ARGS.hasProxyProviderInterval ? ARGS.proxyProviderInterval : "default"}, proxy=${ARGS.hasProxyProviderProxy ? ARGS.proxyProviderProxy : "default"}, size-limit=${ARGS.hasProxyProviderSizeLimit ? ARGS.proxyProviderSizeLimit : "default"}, ua=${ARGS.hasProxyProviderUserAgent ? ARGS.proxyProviderUserAgent : "default"}, auth=${ARGS.hasProxyProviderAuthorization ? "configured" : "default"}, headers=${ARGS.hasProxyProviderHeader ? ARGS.proxyProviderHeaderEntryCount : "default"}, payload=${ARGS.hasProxyProviderPayload ? ARGS.proxyProviderPayloadCount : "default"}, path-dir=${ARGS.hasProxyProviderPathDir ? ARGS.proxyProviderPathDir : "unchanged"}, filter=${ARGS.hasProxyProviderFilter ? ARGS.proxyProviderFilter : "default"}, exclude-filter=${ARGS.hasProxyProviderExcludeFilter ? ARGS.proxyProviderExcludeFilter : "default"}, exclude-type=${ARGS.hasProxyProviderExcludeType ? ARGS.proxyProviderExcludeType : "default"}, hc-enable=${ARGS.hasProxyProviderHealthCheckEnable ? ARGS.proxyProviderHealthCheckEnable : "default"}, hc-url=${ARGS.hasProxyProviderHealthCheckUrl ? ARGS.proxyProviderHealthCheckUrl : "default"}, hc-interval=${ARGS.hasProxyProviderHealthCheckInterval ? ARGS.proxyProviderHealthCheckInterval : "default"}, hc-timeout=${ARGS.hasProxyProviderHealthCheckTimeout ? ARGS.proxyProviderHealthCheckTimeout : "default"}, hc-lazy=${ARGS.hasProxyProviderHealthCheckLazy ? ARGS.proxyProviderHealthCheckLazy : "default"}, hc-expected-status=${ARGS.hasProxyProviderHealthCheckExpectedStatus ? ARGS.proxyProviderHealthCheckExpectedStatus : "default"}, apply-scope=${buildProxyProviderApplyScopeSummary()}, apply-stats=${stats.proxyProviderApplyStatsSummary}, apply-preview=${stats.proxyProviderApplyPreviewSummary}, mutation-stats=${stats.proxyProviderMutationStatsSummary}, mutation-preview=${stats.proxyProviderMutationPreviewSummary}`);
  // 输出这一轮补强的官方语义自检开关，便于确认是否已走到新逻辑。
  console.log("   ✓ 代理集合语义: official-type/url/path/payload-check=on, safe-path-hint=on");
  // 输出 proxy-provider override 批量改写参数覆盖情况。
  console.log(`   ✓ 代理集合Override: prefix=${ARGS.hasProxyProviderOverrideAdditionalPrefix ? ARGS.proxyProviderOverrideAdditionalPrefix : "default"}, suffix=${ARGS.hasProxyProviderOverrideAdditionalSuffix ? ARGS.proxyProviderOverrideAdditionalSuffix : "default"}, udp=${ARGS.hasProxyProviderOverrideUdp ? ARGS.proxyProviderOverrideUdp : "default"}, udp-over-tcp=${ARGS.hasProxyProviderOverrideUdpOverTcp ? ARGS.proxyProviderOverrideUdpOverTcp : "default"}, down=${ARGS.hasProxyProviderOverrideDown ? ARGS.proxyProviderOverrideDown : "default"}, up=${ARGS.hasProxyProviderOverrideUp ? ARGS.proxyProviderOverrideUp : "default"}, tfo=${ARGS.hasProxyProviderOverrideTfo ? ARGS.proxyProviderOverrideTfo : "default"}, mptcp=${ARGS.hasProxyProviderOverrideMptcp ? ARGS.proxyProviderOverrideMptcp : "default"}, skip-cert-verify=${ARGS.hasProxyProviderOverrideSkipCertVerify ? ARGS.proxyProviderOverrideSkipCertVerify : "default"}, dialer-proxy=${ARGS.hasProxyProviderOverrideDialerProxy ? ARGS.proxyProviderOverrideDialerProxy : "default"}, interface-name=${ARGS.hasProxyProviderOverrideInterfaceName ? ARGS.proxyProviderOverrideInterfaceName : "default"}, routing-mark=${ARGS.hasProxyProviderOverrideRoutingMark ? ARGS.proxyProviderOverrideRoutingMark : "default"}, ip-version=${ARGS.hasProxyProviderOverrideIpVersion ? ARGS.proxyProviderOverrideIpVersion : "default"}, proxy-name-rules=${ARGS.hasProxyProviderOverrideProxyNameRules ? ARGS.proxyProviderOverrideProxyNameRules.length : "default"}`);
  // 输出 AI / Crypto / GitHub / Steam / Dev 国家优先链参数覆盖情况。
  console.log(`   ✓ 国家优先链: ai=${ARGS.hasAiPreferCountries ? ARGS.aiPreferCountries.join(" > ") : "default"}, crypto=${ARGS.hasCryptoPreferCountries ? ARGS.cryptoPreferCountries.join(" > ") : "default"}, github=${ARGS.hasGithubPreferCountries ? ARGS.githubPreferCountries.join(" > ") : "default"} (${ARGS.githubMode}, ${ARGS.githubType}), steam=${ARGS.hasSteamPreferCountries ? ARGS.steamPreferCountries.join(" > ") : "default"} (${ARGS.steamMode}, ${ARGS.steamType}), dev=${ARGS.hasDevPreferCountries ? ARGS.devPreferCountries.join(" > ") : "default"} (${ARGS.devMode}, ${ARGS.devType})`);
  // 输出国家优先链最终命中的国家组摘要，便于直接确认区域 token / 国家 token / 自定义别名最终到底展开成了什么。
  console.log(`   ✓ 国家优先链命中: ai=${stats.aiPreferCountryResolvedSummary || "none"}, crypto=${stats.cryptoPreferCountryResolvedSummary || "none"}, github=${stats.githubPreferCountryResolvedSummary || "none"}, steam=${stats.steamPreferCountryResolvedSummary || "none"}, dev=${stats.devPreferCountryResolvedSummary || "none"}`);
  // 输出 country-extra-aliases 参数覆盖情况，便于确认这轮自定义国家别名是否真正生效。
  console.log(`   ✓ 国家附加别名: ${ARGS.hasCountryExtraAliases ? `configured,countries=${ARGS.countryExtraAliasCountryCount},aliases=${ARGS.countryExtraAliasEntryCount},conflicts=${ARGS.countryExtraAliasConflictCount},preview=${ARGS.countryExtraAliasPreview},conflict-preview=${ARGS.countryExtraAliasConflictPreview}` : "default"}`);
  // 输出区域分组参数覆盖情况，便于确认这轮 GitHub 社区常见“区域聚合面板”玩法是否真正生效。
  console.log(`   ✓ 区域分组参数: ${ARGS.hasRegionGroups ? `configured,preview=${ARGS.regionGroupPreview},generated=${stats.regionGroups},summary=${stats.regionGroupSummary || "none"}` : (ARGS.hasRegionGroupsArg ? "configured:off" : "default/off")}`);
  // 输出国家组 / 区域组排序参数覆盖情况，便于确认本轮“哪些国家/区域排前面”到底按什么规则走。
  console.log(`   ✓ 分组排序参数: country-sort=${ARGS.hasCountryGroupSort ? ARGS.countryGroupSort : "definition/default"}, region-sort=${ARGS.hasRegionGroupSort ? ARGS.regionGroupSort : "definition/default"}`);
  // 输出开发服务组参数覆盖情况。
  console.log(`   ✓ 开发服务组: mode=${ARGS.hasDevMode ? ARGS.devMode : "default"}, type=${ARGS.hasDevType ? ARGS.devType : "default"}, prefer-groups=${ARGS.hasDevPreferGroups ? ARGS.devPreferGroups.join(" > ") : "default"}, prefer-nodes=${ARGS.hasDevPreferNodes ? ARGS.devPreferNodes.join(" > ") : "default"}`);
  // 输出开发服务组高级项覆盖情况。
  console.log(`   ✓ 开发服务组高级项: test-url=${ARGS.hasDevTestUrl ? ARGS.devTestUrl : "default"}, strategy=${ARGS.hasDevGroupStrategy ? ARGS.devGroupStrategy : "default"}, hidden=${ARGS.hasDevHidden ? ARGS.devHidden : "default"}, disable-udp=${ARGS.hasDevDisableUdp ? ARGS.devDisableUdp : "default"}, icon=${ARGS.hasDevIcon ? ARGS.devIcon : "default"}, interface-name=${ARGS.hasDevInterfaceName ? ARGS.devInterfaceName : "default"}, routing-mark=${ARGS.hasDevRoutingMark ? ARGS.devRoutingMark : "default"}`);
  // 输出 GitHub / Steam 独立组额外前置组覆盖情况。
  console.log(`   ✓ 独立组前置组: github=${ARGS.hasGithubPreferGroups ? ARGS.githubPreferGroups.join(" > ") : "default"}, steam=${ARGS.hasSteamPreferGroups ? ARGS.steamPreferGroups.join(" > ") : "default"}, dev=${ARGS.hasDevPreferGroups ? ARGS.devPreferGroups.join(" > ") : "default"}`);
  // 输出 GitHub / Steam / Dev 独立组点名节点覆盖情况。
  console.log(`   ✓ 独立组点名节点: github=${ARGS.hasGithubPreferNodes ? ARGS.githubPreferNodes.join(" > ") : "default"}, steam=${ARGS.hasSteamPreferNodes ? ARGS.steamPreferNodes.join(" > ") : "default"}, dev=${ARGS.hasDevPreferNodes ? ARGS.devPreferNodes.join(" > ") : "default"}`);
  // 输出 GitHub / Steam 独立组 provider 池覆盖情况。
  console.log(`   ✓ 独立组Provider池: github=${ARGS.hasGithubIncludeAll ? (ARGS.githubIncludeAll ? "include-all" : "off") : (ARGS.hasGithubIncludeAllProviders ? (ARGS.githubIncludeAllProviders ? "include-all-providers" : "off") : (ARGS.hasGithubUseProviders ? ARGS.githubUseProviders.join(" > ") : "default"))}, steam=${ARGS.hasSteamIncludeAll ? (ARGS.steamIncludeAll ? "include-all" : "off") : (ARGS.hasSteamIncludeAllProviders ? (ARGS.steamIncludeAllProviders ? "include-all-providers" : "off") : (ARGS.hasSteamUseProviders ? ARGS.steamUseProviders.join(" > ") : "default"))}, dev=${ARGS.hasDevIncludeAll ? (ARGS.devIncludeAll ? "include-all" : "off") : (ARGS.hasDevIncludeAllProviders ? (ARGS.devIncludeAllProviders ? "include-all-providers" : "off") : (ARGS.hasDevUseProviders ? ARGS.devUseProviders.join(" > ") : "default"))}`);
  // 输出策略组布局预设 / 显式顺序覆盖情况。
  console.log(`   ✓ 策略组编排: preset=${ARGS.hasGroupOrder ? "custom" : (ARGS.hasGroupOrderPreset ? ARGS.groupOrderPreset : DEFAULT_GROUP_ORDER_PRESET)}, order=${ARGS.hasGroupOrder ? ARGS.groupOrder.join(" > ") : "preset-only"}`);
  // 输出 GitHub / Steam / SteamCN / Dev 规则顺序覆盖情况。
  console.log(`   ✓ 规则顺序编排: github=${buildRuleOrderSummary(ARGS.githubRuleAnchor, ARGS.githubRulePosition)}, steam=${buildRuleOrderSummary(ARGS.steamRuleAnchor, ARGS.steamRulePosition)}, steam-cn=${buildRuleOrderSummary(ARGS.steamCnRuleAnchor, ARGS.steamCnRulePosition)}, dev=${buildRuleOrderSummary(ARGS.devRuleAnchor, ARGS.devRulePosition)}`);
  // 输出 config.rules 自定义规则插入位置覆盖情况。
  console.log(`   ✓ 自定义规则编排: ${buildRuleOrderSummary(ARGS.customRuleAnchor, ARGS.customRulePosition)}`);
  // 输出最终策略组在配置中的排列顺序，便于直接观察面板展示顺序。
  console.log(`   ✓ 策略组顺序: ${stats.proxyGroupOrderSummary}`);
  // 输出关键策略组内部的候选优先级，便于查看各业务流量组默认会先尝试谁。
  console.log(`   ✓ 策略组优先级: ${stats.proxyGroupPrioritySummary}`);
  // 输出最终规则链的优先级摘要，便于判断哪些流量会先命中、最后由谁兜底。
  console.log(`   ✓ 流量优先级: ${stats.trafficPrioritySummary}`);
  // 输出最终 rules 的层级拆分，便于比 head/tail 更直观看出拦截层、业务层、地区层和兜底层的先后。
  console.log(`   ✓ 规则层级总览: ${stats.ruleLayerSummary}, preview=${stats.ruleLayerPreview}`);
  // 输出 config.rules 在最终规则链里的实际插入区间，便于直接判断外部自定义规则到底插在什么位置。
  console.log(`   ✓ 自定义规则区间: ${stats.customRuleSummary}, preview=${stats.customRulePreview}`);
  // 输出关键规则及其前后邻居窗口，便于直接看出 Geo_Not_CN / DirectList / CN / CN_IP 与 GitHub / Steam / SteamCN / MATCH 的相对位置。
  console.log(`   ✓ 关键命中窗口: ${stats.keyRuleWindowSummary}, preview=${stats.keyRuleWindowPreview}`);
  // 输出规则层级与目标组的交叉映射，便于直接看出每一层主要把流量送到哪里。
  console.log(`   ✓ 规则层级目标映射: ${stats.ruleLayerTargetSummary}, preview=${stats.ruleLayerTargetPreview}`);
  // 输出业务规则的前后 2 跳窗口，便于直接看出 AI / Crypto / GitHub / Steam / SteamCN 被谁夹在中间。
  console.log(`   ✓ 业务规则窗口: ${stats.serviceRuleWindowSummary}, preview=${stats.serviceRuleWindowPreview}`);
  // 输出 GitHub / Steam / SteamCN / Dev 规则入口目标覆盖情况。
  console.log(`   ✓ 规则入口目标: github=${ARGS.hasGithubRuleTarget ? ARGS.githubRuleTarget : "default"}, steam=${ARGS.hasSteamRuleTarget ? ARGS.steamRuleTarget : "default"}, steam-cn=${ARGS.hasSteamCnRuleTarget ? ARGS.steamCnRuleTarget : "default"}, dev=${ARGS.hasDevRuleTarget ? ARGS.devRuleTarget : "default"}`);
  // 输出规则入口最终映射与目标分布，便于直接看出每条业务规则最终被送进了哪个组。
  console.log(`   ✓ 规则入口映射: ${stats.ruleTargetMappingSummary}, preview=${stats.ruleTargetMappingPreview}`);
  // 输出宽泛规则抢先命中的风险摘要，便于快速发现 GitHub / Steam / SteamCN 被前置规则吃掉。
  console.log(`   ✓ 规则优先级风险: ${stats.rulePriorityRiskSummary}, preview=${stats.rulePriorityRiskPreview}`);
  // 输出关键策略组候选链的顺序风险，便于快速发现 DIRECT / REJECT / FALLBACK / SELECT 排位异常。
  console.log(`   ✓ 策略组候选链风险: ${stats.proxyGroupPriorityRiskSummary}, preview=${stats.proxyGroupPriorityRiskPreview}`);
  // 输出关键业务的规则入口、目标组、组类型与头部候选链，便于单独观察 GitHub / Steam / AI / Crypto 的实际走法。
  console.log(`   ✓ 业务链路总览: ${stats.serviceRoutingSummary}, preview=${stats.serviceRoutingPreview}`);
  // 输出“请求 -> 规则 -> 目标组 -> 组内候选链”的总览，便于一眼看完整条分流路径。
  console.log(`   ✓ 分流链路总览: ${stats.routingChainSummary}, preview=${stats.routingChainPreview}`);
  // 输出 GitHub / Steam 独立组 hidden / icon 覆盖情况。
  console.log(`   ✓ 独立组展示: github-hidden=${ARGS.hasGithubHidden ? ARGS.githubHidden : "default"}, github-icon=${ARGS.hasGithubIcon ? ARGS.githubIcon : "default"}, steam-hidden=${ARGS.hasSteamHidden ? ARGS.steamHidden : "default"}, steam-icon=${ARGS.hasSteamIcon ? ARGS.steamIcon : "default"}`);
  // 输出 GitHub / Steam 独立组 disable-udp 覆盖情况。
  console.log(`   ✓ 独立组UDP: github-disable-udp=${ARGS.hasGithubDisableUdp ? ARGS.githubDisableUdp : "default"}, steam-disable-udp=${ARGS.hasSteamDisableUdp ? ARGS.steamDisableUdp : "default"}`);
  // 输出全局与 GitHub / Steam 独立组的网络字段覆盖情况。
  console.log(`   ✓ 独立组网络: group-interface-name=${ARGS.hasGroupInterfaceName ? ARGS.groupInterfaceName : "default"}, group-routing-mark=${ARGS.hasGroupRoutingMark ? ARGS.groupRoutingMark : "default"}, github-interface-name=${ARGS.hasGithubInterfaceName ? ARGS.githubInterfaceName : "default"}, github-routing-mark=${ARGS.hasGithubRoutingMark ? ARGS.githubRoutingMark : "default"}, steam-interface-name=${ARGS.hasSteamInterfaceName ? ARGS.steamInterfaceName : "default"}, steam-routing-mark=${ARGS.hasSteamRoutingMark ? ARGS.steamRoutingMark : "default"}`);
  // 输出 GitHub / Steam 独立组的专属测速覆盖情况。
  console.log(`   ✓ 独立组测速: github-test-url=${ARGS.hasGithubTestUrl ? ARGS.githubTestUrl : "default"}, github-group-interval=${ARGS.hasGithubGroupInterval ? ARGS.githubGroupInterval : "default"}, github-group-tolerance=${ARGS.hasGithubGroupTolerance ? ARGS.githubGroupTolerance : "default"}, github-group-timeout=${ARGS.hasGithubGroupTimeout ? ARGS.githubGroupTimeout : "default"}, github-group-lazy=${ARGS.hasGithubGroupLazy ? ARGS.githubGroupLazy : "default"}, github-group-max-failed-times=${ARGS.hasGithubGroupMaxFailedTimes ? ARGS.githubGroupMaxFailedTimes : "default"}, github-group-expected-status=${ARGS.hasGithubGroupExpectedStatus ? ARGS.githubGroupExpectedStatus : "default"}, github-group-strategy=${ARGS.hasGithubGroupStrategy ? ARGS.githubGroupStrategy : "default"}, steam-test-url=${ARGS.hasSteamTestUrl ? ARGS.steamTestUrl : "default"}, steam-group-interval=${ARGS.hasSteamGroupInterval ? ARGS.steamGroupInterval : "default"}, steam-group-tolerance=${ARGS.hasSteamGroupTolerance ? ARGS.steamGroupTolerance : "default"}, steam-group-timeout=${ARGS.hasSteamGroupTimeout ? ARGS.steamGroupTimeout : "default"}, steam-group-lazy=${ARGS.hasSteamGroupLazy ? ARGS.steamGroupLazy : "default"}, steam-group-max-failed-times=${ARGS.hasSteamGroupMaxFailedTimes ? ARGS.steamGroupMaxFailedTimes : "default"}, steam-group-expected-status=${ARGS.hasSteamGroupExpectedStatus ? ARGS.steamGroupExpectedStatus : "default"}, steam-group-strategy=${ARGS.hasSteamGroupStrategy ? ARGS.steamGroupStrategy : "default"}`);
  // 输出 GitHub / Steam 独立组的原始节点自动收集参数覆盖情况。
  console.log(`   ✓ 独立组节点池: github-include-all-proxies=${ARGS.hasGithubIncludeAllProxies ? ARGS.githubIncludeAllProxies : "default"}, github-filter=${ARGS.hasGithubNodeFilter ? ARGS.githubNodeFilter : "default"}, github-exclude-filter=${ARGS.hasGithubNodeExcludeFilter ? ARGS.githubNodeExcludeFilter : "default"}, github-exclude-type=${ARGS.hasGithubNodeExcludeType ? ARGS.githubNodeExcludeType : "default"}, steam-include-all-proxies=${ARGS.hasSteamIncludeAllProxies ? ARGS.steamIncludeAllProxies : "default"}, steam-filter=${ARGS.hasSteamNodeFilter ? ARGS.steamNodeFilter : "default"}, steam-exclude-filter=${ARGS.hasSteamNodeExcludeFilter ? ARGS.steamNodeExcludeFilter : "default"}, steam-exclude-type=${ARGS.hasSteamNodeExcludeType ? ARGS.steamNodeExcludeType : "default"}, dev-include-all-proxies=${ARGS.hasDevIncludeAllProxies ? ARGS.devIncludeAllProxies : "default"}, dev-filter=${ARGS.hasDevNodeFilter ? ARGS.devNodeFilter : "default"}, dev-exclude-filter=${ARGS.hasDevNodeExcludeFilter ? ARGS.devNodeExcludeFilter : "default"}, dev-exclude-type=${ARGS.hasDevNodeExcludeType ? ARGS.devNodeExcludeType : "default"}`);
  // 输出响应头调试参数覆盖情况。
  console.log(`   ✓ 响应头参数: enabled=${ARGS.hasResponseHeaders ? ARGS.responseHeaders : false}, prefix=${ARGS.responseHeaderPrefix}, applied=${stats.responseHeadersApplied ? "yes" : "no"}`);
  // 输出官方下载链接保留参数摘要，便于排查分享链接 / 文件链接 / 远程覆盖来源。
  console.log(`   ✓ 下载链路: route-kind=${RUNTIME_CONTEXT.routeKind || "unknown"}, route-name=${RUNTIME_CONTEXT.routeName || "unknown"}, no-cache=${RUNTIME_LINK_OPTIONS.hasNoCache ? RUNTIME_LINK_OPTIONS.noCache : "default"}, include-unsupported=${RUNTIME_LINK_OPTIONS.hasIncludeUnsupportedProxy ? RUNTIME_LINK_OPTIONS.includeUnsupportedProxy : "default"}, ignore-failed=${RUNTIME_LINK_OPTIONS.hasIgnoreFailedRemoteSub ? RUNTIME_LINK_OPTIONS.ignoreFailedRemoteSub : "default"}, merge-sources=${RUNTIME_LINK_OPTIONS.hasMergeSources ? RUNTIME_LINK_OPTIONS.mergeSources : "default"}, produce-type=${RUNTIME_LINK_OPTIONS.hasProduceType ? RUNTIME_LINK_OPTIONS.produceType : "default"}, url=${RUNTIME_LINK_OPTIONS.hasUrl ? "yes" : "no"}, url-kind=${RUNTIME_LINK_OPTIONS.urlKind || "none"}, content=${RUNTIME_LINK_OPTIONS.hasContent ? "yes" : "no"}, ua=${RUNTIME_LINK_OPTIONS.hasUa ? "yes" : "no"}, proxy=${RUNTIME_LINK_OPTIONS.hasProxy ? "yes" : "no"}`);
  // 输出这一轮补强的官方链接参数语义摘要，便于确认保留参数是否按官方规则生效。
  console.log(`   ✓ 下载链路语义: official-link-params-check=on, summary=${buildRuntimeLinkSemanticSummary(RUNTIME_LINK_OPTIONS)}`);
  // 输出脚本参数来源摘要，便于排查真实运行环境里参数是从哪一路传进来的。
  console.log(`   ✓ 参数来源: ${formatRuntimeArgSourceSummary(RUNTIME_ARG_SOURCES)}`);
  // 输出最终生效参数的赢家来源摘要，便于定位 query / $options / $arguments 冲突时谁覆盖了谁。
  console.log(`   ✓ 参数生效来源: ${formatRuntimeArgEffectiveSummary(RUNTIME_ARG_EFFECTIVE)}, preview=${formatRuntimeArgEffectivePreview(RUNTIME_ARG_EFFECTIVE)}`);
  // 输出未消费脚本参数摘要，便于快速发现拼错、写错别名或当前版本尚未支持的参数。
  console.log(`   ✓ 未消费参数: ${formatUnusedScriptArgsSummary(RUNTIME_UNUSED_ARGS)}, preview=${formatUnusedScriptArgsPreview(RUNTIME_UNUSED_ARGS)}`);
  // 输出当前运行环境上下文，便于排查 Sub-Store 官方 target / 请求来源是否正确传入。
  console.log(`   ✓ 运行环境: target=${RUNTIME_CONTEXT.target || "unknown"}, route-target=${RUNTIME_CONTEXT.routeTarget || "none"}, query-target=${RUNTIME_CONTEXT.queryTarget || "none"}, request-url=${RUNTIME_CONTEXT.requestUrl || "unknown"}, request-path=${RUNTIME_CONTEXT.requestPath || "unknown"}, route-path=${RUNTIME_CONTEXT.routePath || "unknown"}, request-params-target=${RUNTIME_CONTEXT.requestParamsTarget || "none"}, ua=${RUNTIME_CONTEXT.userAgent || "unknown"}, query-args=${Object.keys(RUNTIME_QUERY_ARGS).length}`);
}

// 主入口函数。
// Sub-Store 在运行脚本时会把配置对象传进来，我们在这里做二次加工。
function main(config) {
  // 非对象输入说明运行环境异常，直接返回空对象。
  if (!isObject(config)) {
    console.error("❌ 错误: 配置对象不存在");
    return {};
  }

  // 没有 proxies 字段就说明不是标准 Clash 配置，原样返回。
  if (!Array.isArray(config.proxies)) {
    console.warn("⚠️ 警告: 配置文件中未找到代理节点数组");
    return config;
  }

  // proxies 是空数组时没法做任何分组，直接返回原配置。
  if (config.proxies.length === 0) {
    console.warn("⚠️ 警告: 代理节点数组为空，无法生成完整配置");
    return config;
  }

  // 用 try/catch 包住主流程，确保脚本出错时不会把整个配置弄坏。
  try {
    // 先清洗并规范节点名称，处理空格和重复名称问题。
    const normalizedProxyState = normalizeProxies(config.proxies);
    // 取出规范化后的有效节点列表。
    const proxies = normalizedProxyState.proxies;
    // 如果清洗完一个有效节点都没有，则回退原配置。
    if (proxies.length === 0) {
      console.warn("⚠️ 警告: 有效代理节点为空，已返回原配置");
      return config;
    }

    // 统计节点概况。
    const proxyStats = analyzeProxies(proxies);
    // 分析国家规则覆盖率。
    const countryCoverage = analyzeCountryCoverage(proxies);
    // 解析出所有国家分组配置。
    const countryConfigs = parseCountries(proxies);
    const countrySummary = buildCountrySummary(countryConfigs);
    const aiPreferredCountryResolution = buildPreferredCountryResolution(
      countryConfigs,
      ARGS.aiPreferCountries,
      DEFAULT_AI_PREFERRED_COUNTRY_MARKERS,
      "ai-default"
    );
    const cryptoPreferredCountryResolution = buildPreferredCountryResolution(
      countryConfigs,
      ARGS.cryptoPreferCountries,
      DEFAULT_CRYPTO_PREFERRED_COUNTRY_MARKERS,
      "crypto-default"
    );
    const githubPreferredCountryResolution = buildPreferredCountryResolution(
      countryConfigs,
      ARGS.hasGithubPreferCountries ? ARGS.githubPreferCountries : [],
      [],
      "github-default"
    );
    const steamPreferredCountryResolution = buildPreferredCountryResolution(
      countryConfigs,
      ARGS.hasSteamPreferCountries ? ARGS.steamPreferCountries : [],
      [],
      "steam-default"
    );
    const devPreferredCountryResolution = buildPreferredCountryResolution(
      countryConfigs,
      ARGS.hasDevPreferCountries ? ARGS.devPreferCountries : [],
      [],
      "dev-default"
    );
    const aiPreferredCountryResolvedSummary = aiPreferredCountryResolution.summary;
    const cryptoPreferredCountryResolvedSummary = cryptoPreferredCountryResolution.summary;
    const githubPreferredCountryResolvedSummary = githubPreferredCountryResolution.summary;
    const steamPreferredCountryResolvedSummary = steamPreferredCountryResolution.summary;
    const devPreferredCountryResolvedSummary = devPreferredCountryResolution.summary;
    const aiPreferredCountryTraceSummary = aiPreferredCountryResolution.trace;
    const cryptoPreferredCountryTraceSummary = cryptoPreferredCountryResolution.trace;
    const githubPreferredCountryTraceSummary = githubPreferredCountryResolution.trace;
    const steamPreferredCountryTraceSummary = steamPreferredCountryResolution.trace;
    const devPreferredCountryTraceSummary = devPreferredCountryResolution.trace;
    const aiPreferredCountryExplainSummary = aiPreferredCountryResolution.explain;
    const cryptoPreferredCountryExplainSummary = cryptoPreferredCountryResolution.explain;
    const githubPreferredCountryExplainSummary = githubPreferredCountryResolution.explain;
    const steamPreferredCountryExplainSummary = steamPreferredCountryResolution.explain;
    const devPreferredCountryExplainSummary = devPreferredCountryResolution.explain;
    const aiPreferredCountryUnmatchedSummary = aiPreferredCountryResolution.unmatched;
    const cryptoPreferredCountryUnmatchedSummary = cryptoPreferredCountryResolution.unmatched;
    const githubPreferredCountryUnmatchedSummary = githubPreferredCountryResolution.unmatched;
    const steamPreferredCountryUnmatchedSummary = steamPreferredCountryResolution.unmatched;
    const devPreferredCountryUnmatchedSummary = devPreferredCountryResolution.unmatched;
    // 按 GitHub 社区常见玩法，把已生成国家组进一步聚合成可选的区域分组。
    const regionConfigs = buildRegionGroupConfigs(countryConfigs, ARGS.regionGroupKeys);
    const regionGroupSummary = buildRegionGroupSummary(regionConfigs);
    // 生成并合并策略组。
    const proxyGroups = buildProxyGroups(proxies, countryConfigs, regionConfigs, proxyStats.lowCost > 0, config["proxy-groups"], config["proxy-providers"]);
    // 先基于最终可用组名/内置策略解析 GitHub / Steam / SteamCN 的规则入口目标。
    const resolvedRuleDefinitions = resolveRuleSetDefinitions(
      uniqueStrings(proxyGroups.map((group) => group.name).concat(BUILTIN_POLICY_NAMES))
    );
    // 再按用户提供的锚点把 GitHub / Steam / SteamCN 规则入口重排到指定前后位置。
    const orderedRuleDefinitions = applyRuleSetDefinitionOrder(resolvedRuleDefinitions);
    // 这里把最终顺序后的规则定义继续传给规则生成与自检，确保日志/校验和实际产物一致。
    const finalRuleDefinitions = orderedRuleDefinitions;
    // 用最终顺序后的规则定义生成 RULE-SET 主体。
    const generatedRules = buildRules(ARGS.quic, finalRuleDefinitions);
    const rules = mergeRules(generatedRules, config.rules, finalRuleDefinitions);
    // 汇总最终策略组展示顺序、关键组候选顺序与规则匹配优先级，便于日志和响应头直接复用。
    const routingChain = analyzeRoutingChain(RUNTIME_CONTEXT, RUNTIME_QUERY_ARGS, rules, finalRuleDefinitions, proxyGroups);
    const routingChainSummary = formatRoutingChainSummary(routingChain);
    const routingChainPreview = formatRoutingChainPreview(routingChain);
    const serviceRoutingProfiles = analyzeServiceRoutingProfiles(finalRuleDefinitions, proxyGroups, countryConfigs);
    const serviceRoutingSummary = formatServiceRoutingProfilesSummary(serviceRoutingProfiles);
    const serviceRoutingPreview = formatServiceRoutingProfilesPreview(serviceRoutingProfiles);
    const proxyGroupPriorityRisks = analyzeProxyGroupPriorityRisks(proxyGroups);
    const proxyGroupPriorityRiskSummary = formatProxyGroupPriorityRiskSummary(proxyGroupPriorityRisks);
    const proxyGroupPriorityRiskPreview = formatProxyGroupPriorityRiskPreview(proxyGroupPriorityRisks);
    const rulePriorityRisks = analyzeRulePriorityRisks(finalRuleDefinitions);
    const rulePriorityRiskSummary = formatRulePriorityRiskSummary(rulePriorityRisks);
    const rulePriorityRiskPreview = formatRulePriorityRiskPreview(rulePriorityRisks);
    const ruleTargetMapping = analyzeRuleTargetMapping(finalRuleDefinitions, rules);
    const ruleTargetMappingSummary = formatRuleTargetMappingSummary(ruleTargetMapping);
    const ruleTargetMappingPreview = formatRuleTargetMappingPreview(ruleTargetMapping);
    const proxyGroupOrderSummary = buildProxyGroupOrderSummary(proxyGroups);
    const proxyGroupPrioritySummary = buildProxyGroupPrioritySummary(proxyGroups);
    const trafficPrioritySummary = buildTrafficPrioritySummary(rules, generatedRules, config.rules);
    const ruleLayering = analyzeRuleLayering(rules);
    const ruleLayerSummary = formatRuleLayeringSummary(ruleLayering);
    const ruleLayerPreview = formatRuleLayeringPreview(ruleLayering);
    const customRuleWindow = analyzeCustomRuleWindow(generatedRules, config.rules, rules);
    const customRuleSummary = formatCustomRuleWindowSummary(customRuleWindow);
    const customRulePreview = formatCustomRuleWindowPreview(customRuleWindow);
    const keyRuleWindows = analyzeKeyRuleWindows(rules);
    const keyRuleWindowSummary = formatKeyRuleWindowSummary(keyRuleWindows);
    const keyRuleWindowPreview = formatKeyRuleWindowPreview(keyRuleWindows);
    const ruleLayerTargetMapping = analyzeRuleLayerTargetMapping(rules);
    const ruleLayerTargetSummary = formatRuleLayerTargetMappingSummary(ruleLayerTargetMapping);
    const ruleLayerTargetPreview = formatRuleLayerTargetMappingPreview(ruleLayerTargetMapping);
    const serviceRuleWindows = analyzeServiceRuleWindows(rules);
    const serviceRuleWindowSummary = formatServiceRuleWindowSummary(serviceRuleWindows);
    const serviceRuleWindowPreview = formatServiceRuleWindowPreview(serviceRuleWindows);
    // 生成并合并 DNS。
    const dns = buildDnsConfig(config.dns);
    // 生成并合并 Sniffer。
    const sniffer = buildSnifferConfig(config.sniffer);
    // 统一增强现有 proxy-providers，便于批量注入缓存路径、下载控制与 health-check 参数。
    const proxyProviders = finalizeProxyProviders(config["proxy-providers"]);
    // 规则提供器合并：用户自定义 + 脚本内置，并统一补全/去重本地缓存路径。
    const finalRuleProviders = mergeRuleProviders(config["rule-providers"], ruleProviders);
    // 统计 provider 本轮到底是新增写入字段，还是覆盖了原有字段。
    const ruleProviderMutationStats = analyzeRuleProviderMutationStats(config["rule-providers"], finalRuleProviders);
    const proxyProviderMutationStats = analyzeProxyProviderMutationStats(config["proxy-providers"], proxyProviders);
    const ruleProviderMutationPreview = analyzeRuleProviderMutationPreview(config["rule-providers"], finalRuleProviders);
    const proxyProviderMutationPreview = analyzeProxyProviderMutationPreview(config["proxy-providers"], proxyProviders);
    // 生成通用内核默认项。
    const kernelDefaults = buildKernelDefaults(config);

    // 在原配置基础上覆盖/注入脚本生成的新配置项。
    const result = {
      // 先展开原配置，保留用户未冲突的全局键。
      ...config,
      // 注入通用内核默认项，但不覆盖用户显式设置。
      ...kernelDefaults,
      // 覆盖为清洗后的有效节点列表。
      proxies,
      // 注入新生成的策略组。
      "proxy-groups": proxyGroups,
      // 保留原有 proxy-providers，并按脚本参数统一补强下载控制与 health-check。
      ...(hasOwn(config, "proxy-providers") || Object.keys(proxyProviders).length
        ? { "proxy-providers": proxyProviders }
        : {}),
      // 规则提供器合并：用户自定义 + 脚本内置，并统一补全/去重本地缓存路径。
      "rule-providers": finalRuleProviders,
      // 覆盖最终规则。
      rules,
      // 覆盖最终 DNS。
      dns,
      // mixed-port 优先保留用户原配置，否则使用默认端口。
      "mixed-port": hasOwn(config, "mixed-port") ? config["mixed-port"] : DEFAULT_MIXED_PORT,
      // IPv6 由脚本参数控制。
      ipv6: ARGS.ipv6,
      // allow-lan 优先保留用户原值，否则默认 true。
      "allow-lan": hasOwn(config, "allow-lan") ? config["allow-lan"] : true,
      // unified-delay 允许脚本参数优先覆盖，否则保留用户原值，最后回落默认 true。
      "unified-delay": ARGS.hasUnifiedDelay ? ARGS.unifiedDelay : (hasOwn(config, "unified-delay") ? config["unified-delay"] : true),
      // tcp-concurrent 允许脚本参数优先覆盖，否则保留用户原值，最后回落默认 true。
      "tcp-concurrent": ARGS.hasTcpConcurrent ? ARGS.tcpConcurrent : (hasOwn(config, "tcp-concurrent") ? config["tcp-concurrent"] : true),
      // 注入最终 Sniffer。
      sniffer
    };

    // 对最终产物做一次一致性自检。
    const diagnostics = validateGeneratedArtifacts(proxies, proxyGroups, result["rule-providers"], result, dns, countryConfigs, finalRuleDefinitions, config.rules);
    // 补上本轮节点自动改名信息。
    diagnostics.renamedProxies = normalizedProxyState.renamed;
    // 补上 provider 改动类型统计，便于区分新增写入与覆盖旧值。
    diagnostics.ruleProviderMutationStats = ruleProviderMutationStats;
    diagnostics.proxyProviderMutationStats = proxyProviderMutationStats;
    diagnostics.ruleProviderMutationPreview = ruleProviderMutationPreview;
    diagnostics.proxyProviderMutationPreview = proxyProviderMutationPreview;
    // 补上国家识别覆盖率信息。
    diagnostics.unclassifiedCountryProxies = countryCoverage.unclassified;
    diagnostics.unclassifiedCountryExamples = countryCoverage.unclassifiedExamples;
    diagnostics.countrySummary = countrySummary;
    diagnostics.aiPreferCountryResolvedSummary = aiPreferredCountryResolvedSummary;
    diagnostics.cryptoPreferCountryResolvedSummary = cryptoPreferredCountryResolvedSummary;
    diagnostics.githubPreferCountryResolvedSummary = githubPreferredCountryResolvedSummary;
    diagnostics.steamPreferCountryResolvedSummary = steamPreferredCountryResolvedSummary;
    diagnostics.devPreferCountryResolvedSummary = devPreferredCountryResolvedSummary;
    diagnostics.aiPreferCountryTraceSummary = aiPreferredCountryTraceSummary;
    diagnostics.cryptoPreferCountryTraceSummary = cryptoPreferredCountryTraceSummary;
    diagnostics.githubPreferCountryTraceSummary = githubPreferredCountryTraceSummary;
    diagnostics.steamPreferCountryTraceSummary = steamPreferredCountryTraceSummary;
    diagnostics.devPreferCountryTraceSummary = devPreferredCountryTraceSummary;
    diagnostics.aiPreferCountryExplainSummary = aiPreferredCountryExplainSummary;
    diagnostics.cryptoPreferCountryExplainSummary = cryptoPreferredCountryExplainSummary;
    diagnostics.githubPreferCountryExplainSummary = githubPreferredCountryExplainSummary;
    diagnostics.steamPreferCountryExplainSummary = steamPreferredCountryExplainSummary;
    diagnostics.devPreferCountryExplainSummary = devPreferredCountryExplainSummary;
    diagnostics.aiPreferCountryUnmatchedSummary = aiPreferredCountryUnmatchedSummary;
    diagnostics.cryptoPreferCountryUnmatchedSummary = cryptoPreferredCountryUnmatchedSummary;
    diagnostics.githubPreferCountryUnmatchedSummary = githubPreferredCountryUnmatchedSummary;
    diagnostics.steamPreferCountryUnmatchedSummary = steamPreferredCountryUnmatchedSummary;
    diagnostics.devPreferCountryUnmatchedSummary = devPreferredCountryUnmatchedSummary;
    diagnostics.ruleTargetMappingSummary = ruleTargetMappingSummary;
    diagnostics.ruleTargetMappingPreview = ruleTargetMappingPreview;
    diagnostics.rulePriorityRiskSummary = rulePriorityRiskSummary;
    diagnostics.rulePriorityRiskPreview = rulePriorityRiskPreview;
    diagnostics.proxyGroupPriorityRiskSummary = proxyGroupPriorityRiskSummary;
    diagnostics.proxyGroupPriorityRiskPreview = proxyGroupPriorityRiskPreview;
    diagnostics.serviceRoutingWarnings = serviceRoutingProfiles.warnings;
    diagnostics.serviceRoutingSummary = serviceRoutingSummary;
    diagnostics.serviceRoutingPreview = serviceRoutingPreview;
    diagnostics.regionGroupSummary = regionGroupSummary;
    diagnostics.proxyGroupOrderSummary = proxyGroupOrderSummary;
    diagnostics.proxyGroupPrioritySummary = proxyGroupPrioritySummary;
    diagnostics.trafficPrioritySummary = trafficPrioritySummary;
    diagnostics.ruleLayerSummary = ruleLayerSummary;
    diagnostics.ruleLayerPreview = ruleLayerPreview;
    diagnostics.customRuleWarnings = customRuleWindow.warnings;
    diagnostics.customRuleSummary = customRuleSummary;
    diagnostics.customRulePreview = customRulePreview;
    diagnostics.keyRuleWindowSummary = keyRuleWindowSummary;
    diagnostics.keyRuleWindowPreview = keyRuleWindowPreview;
    diagnostics.ruleLayerTargetSummary = ruleLayerTargetSummary;
    diagnostics.ruleLayerTargetPreview = ruleLayerTargetPreview;
    diagnostics.serviceRuleWindowSummary = serviceRuleWindowSummary;
    diagnostics.serviceRuleWindowPreview = serviceRuleWindowPreview;
    diagnostics.routingChainSummary = routingChainSummary;
    diagnostics.routingChainPreview = routingChainPreview;
    // 根据参数决定是否把调试摘要写回下载响应头。
    const responseHeadersEnabled = ARGS.hasResponseHeaders ? ARGS.responseHeaders : false;
    const responseHeadersApplied = responseHeadersEnabled
      ? setRuntimeResponseHeaders(RAW_OPTIONS, buildRuntimeResponseHeaders(diagnostics))
      : false;
    // 输出诊断告警。
    logDiagnostics(diagnostics);

    // 根据参数或 full 模式决定是否注入 profile 缓存配置。
    if (ARGS.hasProfileCache ? ARGS.profileCache : (ARGS.hasProfileSelected || ARGS.hasProfileFakeIp || ARGS.full)) {
      // profile 合并默认值和用户原值，保留策略组选择和 fake-ip 映射。
      result.profile = mergeObjects(
        {
          "store-selected": ARGS.hasProfileSelected ? ARGS.profileSelected : true,
          "store-fake-ip": ARGS.hasProfileFakeIp ? ARGS.profileFakeIp : true
        },
        config.profile
      );
    }

    // full 模式下补充日志等级和统计日志。
    if (ARGS.full) {
      // log-level 优先保留用户原值，否则使用 info。
      result["log-level"] = typeof config["log-level"] === "string" && config["log-level"] ? config["log-level"] : "info";

      // 输出本次构建的完整摘要日志。
      logBuildSummary({
        totalProxies: proxyStats.total,
        validProxies: proxyStats.valid,
        lowCostProxies: proxyStats.lowCost,
        landingProxies: proxyStats.landing,
        countryGroups: countryConfigs.length,
        countrySummary,
        aiPreferCountryResolvedSummary,
        cryptoPreferCountryResolvedSummary,
        githubPreferCountryResolvedSummary,
        steamPreferCountryResolvedSummary,
        devPreferCountryResolvedSummary,
        aiPreferCountryTraceSummary,
        cryptoPreferCountryTraceSummary,
        githubPreferCountryTraceSummary,
        steamPreferCountryTraceSummary,
        devPreferCountryTraceSummary,
        aiPreferCountryExplainSummary,
        cryptoPreferCountryExplainSummary,
        githubPreferCountryExplainSummary,
        steamPreferCountryExplainSummary,
        devPreferCountryExplainSummary,
        aiPreferCountryUnmatchedSummary,
        cryptoPreferCountryUnmatchedSummary,
        githubPreferCountryUnmatchedSummary,
        steamPreferCountryUnmatchedSummary,
        devPreferCountryUnmatchedSummary,
        regionGroups: regionConfigs.length,
        regionGroupSummary,
        proxyGroups: proxyGroups.length,
        rules: rules.length,
        routingChainSummary,
        routingChainPreview,
        serviceRoutingSummary,
        serviceRoutingPreview,
        proxyGroupPriorityRiskSummary,
        proxyGroupPriorityRiskPreview,
        rulePriorityRiskSummary,
        rulePriorityRiskPreview,
        ruleTargetMappingSummary,
        ruleTargetMappingPreview,
        proxyGroupOrderSummary,
        proxyGroupPrioritySummary,
        trafficPrioritySummary,
        ruleLayerSummary,
        ruleLayerPreview,
        customRuleSummary,
        customRulePreview,
        keyRuleWindowSummary,
        keyRuleWindowPreview,
        ruleLayerTargetSummary,
        ruleLayerTargetPreview,
        serviceRuleWindowSummary,
        serviceRuleWindowPreview,
        classifiedCountryProxies: countryCoverage.classified,
        unclassifiedCountryProxies: countryCoverage.unclassified,
        renamedProxies: diagnostics.renamedProxies.length,
        missingProviders: diagnostics.missingProviders.length,
        invalidRuleProviderUrls: diagnostics.invalidRuleProviderUrls.length,
        ruleProviderWarnings: diagnostics.ruleProviderWarnings.length,
        proxyProviderWarnings: diagnostics.proxyProviderWarnings.length,
        deprecatedSettings: diagnostics.deprecatedSettings.length,
        dnsRiskWarnings: diagnostics.dnsRiskWarnings.length,
        dnsOptionWarnings: diagnostics.dnsOptionWarnings.length,
        latencyGroupWarnings: diagnostics.latencyGroupWarnings.length,
        providerHealthWarnings: diagnostics.providerHealthWarnings.length,
        preferredCountryWarnings: diagnostics.preferredCountryWarnings.length,
        preferredGroupWarnings: diagnostics.preferredGroupWarnings.length,
        preferredNodeWarnings: diagnostics.preferredNodeWarnings.length,
        preferredProviderWarnings: diagnostics.preferredProviderWarnings.length,
        groupOrderWarnings: diagnostics.groupOrderWarnings.length,
        ruleOrderWarnings: diagnostics.ruleOrderWarnings.length,
        customRuleOrderWarnings: diagnostics.customRuleOrderWarnings.length,
        ruleTargetWarnings: diagnostics.ruleTargetWarnings.length,
        rulePriorityWarnings: diagnostics.rulePriorityWarnings.length,
        proxyGroupPriorityWarnings: diagnostics.proxyGroupPriorityWarnings.length,
        customRuleWarnings: diagnostics.customRuleWarnings.length,
        serviceRoutingWarnings: diagnostics.serviceRoutingWarnings.length,
        targetPlatformWarnings: diagnostics.targetPlatformWarnings.length,
        runtimeArgWarnings: diagnostics.runtimeArgWarnings.length,
        runtimeResponseWarnings: diagnostics.runtimeResponseWarnings.length,
        runtimeLinkWarnings: diagnostics.runtimeLinkWarnings.length,
        geoConfigWarnings: diagnostics.geoConfigWarnings.length,
        kernelOptionWarnings: diagnostics.kernelOptionWarnings.length,
        duplicateRuleProviderPaths: diagnostics.duplicateRuleProviderPaths.length,
        missingRuleTargets: diagnostics.missingRuleTargets.length,
        unresolvedGroupReferences: diagnostics.unresolvedGroupReferences.length,
        unresolvedProviderReferences: diagnostics.unresolvedProviderReferences.length,
        invalidGroupPatterns: diagnostics.invalidGroupPatterns.length,
        emptyAutoGroups: diagnostics.emptyAutoGroups.length,
        ruleProviderApplyStatsSummary: formatRuleProviderApplyStats(diagnostics.ruleProviderApplyStats),
        ruleProviderApplyPreviewSummary: formatRuleProviderApplyPreview(diagnostics.ruleProviderApplyPreview),
        proxyProviderApplyStatsSummary: formatProxyProviderApplyStats(diagnostics.proxyProviderApplyStats),
        proxyProviderApplyPreviewSummary: formatProxyProviderApplyPreview(diagnostics.proxyProviderApplyPreview),
        ruleProviderMutationStatsSummary: formatRuleProviderMutationStats(diagnostics.ruleProviderMutationStats),
        ruleProviderMutationPreviewSummary: formatRuleProviderMutationPreview(diagnostics.ruleProviderMutationPreview),
        proxyProviderMutationStatsSummary: formatProxyProviderMutationStats(diagnostics.proxyProviderMutationStats),
        proxyProviderMutationPreviewSummary: formatProxyProviderMutationPreview(diagnostics.proxyProviderMutationPreview),
        responseHeadersApplied
      });
    }

    // 一切正常则返回最终生成的完整配置。
    return result;
  } catch (error) {
    // 打印异常主信息。
    console.error(`❌ 配置生成失败: ${error.message}`);
    // 如果有堆栈也打印出来，方便定位。
    if (error && error.stack) {
      console.error(error.stack);
    }
    // 出错时回退原配置，保证用户至少还能继续使用原订阅。
    return config;
  }
}
