/**
 * ==================================================================================
 * Sub-Store 终极策略增强脚本 V9.14.12
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
 * 147. 开发补充规则增强：新增 Dev.list 与 dev-list-url，本地承接社区规则未完全覆盖的开发域名补丁。
 * 148. 默认布局优化：参考 GitHub 上常见的 Mihomo/Clash 公共配置，把开发服务组前移到 GitHub 后、Steam 前，并统一把兜底节点后置。
 * 149. 开发规则观测增强：把 DevList 一并纳入业务规则窗口、业务链路总览、规则顺序锚点别名与开发规则块移动范围。
 * 150. 兜底节点说明增强：明确保留兜底节点作为国家识别失败/未命名节点收容池，但默认继续保持面板后置，避免抢占主工作流。
 * 151. 区域组可见性增强：新增区域组可见性诊断，显式提示“区域组已开启但没生成”或“生成了但排太后”的情况。
 * 152. 区域布局预设别名增强：group-order-preset 继续兼容 region-first / regions-first / regional-first / geo-first 等更直白写法。
 * 153. Clash Verge 排查增强：把区域组位置摘要写入 full 日志与响应调试头，便于直接判断面板里为什么看不到区域组。
 * 154. 内部缓存优化：把区域组别名、策略组布局别名、前置组别名与规则锚点别名提到顶层缓存，减少重复构造对象。
 * 155. 诊断复用优化：把区域可见性、规则优先级风险与策略组优先级风险分析改成主流程统一复用，减少重复扫描。
 * 156. 开发锚点修正：修复规则顺序别名表里 `dev` 被 `GitLab` 别名覆盖的问题，保证开发规则块锚点稳定指向 DevList。
 * 157. 注释增强：继续给关键规范化、可见性诊断与缓存别名逻辑补充更细粒度的逐行中文注释。
 * 158. 国家识别继续扩容：新增巴林、阿曼、约旦、白俄罗斯、马耳他、老挝、巴拿马等常见节点国家，补齐更多机场命名。
 * 159. 子区域继续增强：新增华语区、西欧、东欧、伊比利亚、比荷卢、DACH、西亚、亚太、英语区、黎凡特等区域 token，便于 region-groups 与 prefer-countries 精细编排。
 * 160. 优先链预设继续增强：新增 apac-core / westasia-core / workspace-core / westeurope-core / easteurope-core / greaterchina-core / anglosphere-core / gulf-core / asia-5 等 preset，减少手写长串 token。
 * 161. 默认面板布局增强：新增 workspace / compact / national 布局预设，并把默认 balanced 布局中的区域组/国家组前移，兼顾工作流优先、紧凑面板与国家组优先三种常见玩法。
 * 162. 区域玩法继续扩容：继续补齐 greaterchina / westasia / dach / anglosphere 等更贴近日常机场选线的区域 token。
 * 163. 优先链预设继续补厚：继续补上 apac-core / westasia-core / greaterchina-core / anglosphere-core / asia-5 等组合 preset。
 * 164. 国家覆盖继续补洞：继续补巴拿马并接入美洲 / 北美 / 拉美聚合，减少中美洲节点掉进兜底节点。
 * 165. 布局语义修正：`groupOrderPreset=country/countries` 现在会真正落到国家优先布局，而不再错误映射到区域优先布局。
 * 166. 紧凑布局继续优化：`compact` 现在会把区域组放到国家组前面，更适合在 Clash Verge 里先看聚合分区再看单国家。
 * 167. 地理紧凑布局增强：新增 `geo-compact` / `subregion-first` 这类更短、更偏地理选线的面板预设。
 * 168. 优先链预设继续补强：新增 `southeastasia-core / northamerica-core / nordic-core / dach-core` 等短小高频 preset。
 * 169. 区域别名继续补强：`eastasia` 兼容 `cjk / 中日韩 / 东北亚`，`southeastasia` 兼容 `asean / 东盟`，`anglosphere` 兼容 `five-eyes / 五眼`。
 * 170. 国家识别继续扩容：新增 `黎巴嫩 / 哥斯达黎加 / 厄瓜多尔`，并补充澳洲 / 葡萄牙 / 阿联酋 / 菲律宾等常见城市别名。
 * 171. 区域映射继续补洞：新增国家会同步接进 `middleeast / levant / westasia / mediterranean / americas / northamerica / southamerica / latam`。
 * 172. Rule.ini 对齐继续补强：固定模板新增本地 `Direct.list / ChatGPT.list`，与脚本主线的补充 ruleset 继续靠拢。
 * 173. 开发生态补丁继续补厚：`Dev.list` 新增 Node.js / pnpm / Deno / Go / Rust / RubyGems / Maven / Gradle 常见域名。
 * 174. 注释增强：继续给国家优先链解析、策略组排序、区域组聚合这几段核心流程补细粒度中文注释。
 * 175. 面板预设继续补强：新增 `dashboard / daily / panel` 这类更贴近日常使用的默认布局，把高频手动切换组再往前收一轮。
 * 176. 短小地理 preset 继续补强：新增 `cjk-core / asean-core / levant-core / oceania-core`，方便直接复用东亚、东盟、黎凡特、澳新玩法。
 * 177. 大洋洲别名继续补强：`oceania` 兼容 `anz / anzac / 澳新` 这类常见社区写法。
 * 178. 固定模板面板顺序继续优化：`Rule.ini` 里的 `全球直连` 前移，`AI / 开发 / 加密 / 游戏` 收拢成连续服务块。
 * 179. 区域 token 继续补齐：新增 `mena`，把中东与北非收成一个可直接在 `regionGroups` 里使用的常见社区写法。
 * 180. 子区域 preset 继续补齐：新增 `iberia-core / benelux-core / northafrica-core`，让西葡、比荷卢、北非这些现成区域也有短写入口。
 * 181. preset 与 regionGroups 语义继续对齐：已有 `mena-core` 现在也能和 `regionGroups=mena` 直接配套使用，少记一层映射。
 * 182. 注释增强：继续给策略组引用解析补逐步中文注释，便于后续自己排查 group-order / group 引用为什么命中或没命中。
 * 183. 区域玩法继续扩容：新增 `baltics / nafta / southerncone` 等更贴近 GitHub 社区常见面板分法的子区域 token。
 * 184. 优先链预设继续补厚：新增 `baltics-core / nafta-core / southerncone-core`，让波罗的海、美加墨、南锥体玩法可以直接短写。
 * 185. 国家识别继续补洞：新增 `巴拉圭 / 玻利维亚`，并同步接进美洲 / 拉美 / 南美聚合，减少南美节点掉进兜底节点。
 * 186. 开发补丁规则继续扩容：`Dev.list` 继续补入 Bun / JSR / NuGet / Composer / Dart / Flutter / Swift / CocoaPods / Hex 等常见开发生态域名。
 * 187. 开发补丁说明增强：README 同步补充 `Dev.list` 本地补丁层的适用范围与典型生态示例，便于后续继续扩展。
 * 188. 注释增强：继续给 `DevList` 规则接入点与开发规则入口集合补充中文注释，后续自己顺着源码找会更轻松。
 * 189. 规则诊断缓存优化：把 rules 的描述/层级/目标解析与关键 provider 首次命中索引缓存到主流程，减少多份顺序诊断里的重复扫描。
 * 190. 服务校验抽象优化：把 GitHub / Steam / Dev 的优选组、点名节点、Provider 池诊断改成数据驱动，减少 validate 阶段的重复拼接。
 * 191. 服务组选项构造优化：把 GitHub / Steam / Dev 的测速、节点池、Provider 池与展示高级项拼装收敛到统一 helper，减少 buildProxyGroups 内平行模板代码。
 * 192. 服务组候选链优化：把 GitHub / Steam / Dev 的前置组、点名节点、Provider 引用解析与最终候选链拼装抽成统一 helper，继续压缩 buildProxyGroups 模板代码。
 * 193. 摘要装配优化：把 diagnostics 补充字段与 full 日志数量指标改成统一装配 helper，减少 main/logBuildSummary 内的长串手写赋值。
 * 194. 诊断日志模板优化：把 logDiagnostics 中成组的告警输出改成统一定义表驱动，减少几十段重复 warn 模板。
 * 195. 服务日志摘要优化：把 full 日志里 GitHub / Steam / Dev 的前置组、节点池、Provider 池、测速与高级项输出收敛到统一 helper。
 * 196. 诊断摘要继续收敛：把响应头与 full 日志共用的链路/规则摘要字段改成统一定义表，并收敛剩余服务参数日志模板。
 * 197. Provider 模板继续收敛：把 rule/proxy-provider 响应头和 full 日志里的下载控制/Override 参数改成统一定义驱动。
 * 198. 运行时响应头继续收敛：把下载链路上下文与规则源 URL 类响应头改成统一定义装配，继续压缩主响应头函数。
 * 199. 地理参数摘要继续收敛：把 group/region/country-extra-alias 响应头与对应 full 日志改成统一计算定义。
 * 200. 收尾模板继续收敛：把顺序类响应头与若干运行时/编排摘要日志改成统一 value 定义，继续压缩主函数体积。
 * 201. full 日志参数块继续收敛：把全局参数、测速、Sniffer、DNS 池、国家优先链与开发服务组摘要改成统一定义表输出。
 * 202. 可选摘要继续收敛：把国家/区域统计与国家优先链 trace/explain/unmatched 这些按条件输出的行也改成定义驱动。
 * 203. diagnostics 补字段继续收敛：把 diagnostics supplement 和 full 日志剩余散点摘要继续改成统一定义表。
 * 204. 摘要定义引用优化：把 full 日志里的定义访问从数组索引改成按标签查找，降低后续继续插项时的维护成本。
 * 205. 摘要查表继续收敛：给 full 日志定义表增加 lookup/批量输出 helper，避免反复 `find` 同一批 label。
 * 206. 告警与摘要装配继续收敛：把 diagnostics 特例告警和 full 日志 payload 装配改成统一 helper，继续压缩主流程。
 * 207. full 日志分段计划化：把按标签批量输出的摘要分段改成配置表，进一步减少 logBuildSummary 主体里的重复调用。
 * 208. main 装配继续收敛：把 diagnostics supplement 的上游上下文拼装也改成定义驱动，继续压缩主流程中的长对象字面量。
 * 209. 分析摘要继续收敛：把 main 里成组的 `analyze -> formatSummary/Preview` 结果改成统一定义装配，减少平行变量。
 * 210. 主流程分析装配继续收敛：把 main 里连续的分析对象计算与派生 payload 打包成统一 helper，继续压缩主流程。
 * 211. 预计算分析缓存收敛：把 validate 阶段复用的 analysis cache 提取成 helper，继续减少 main 中的零散对象拼装。
 * 212. 最终结果装配收敛：把 main 里最终 result 对象的构建抽成 helper，继续压缩主流程并集中默认值策略。
 * 213. Provider 阶段装配收敛：把 provider 合并、补强与 mutation 统计改成统一 helper，继续减少 main 中平行变量。
 * 214. 尾部后处理收敛：把 profile 注入与 full 模式日志/日志等级处理收成 helper，继续压缩 main 尾段。
 * 215. 前置阶段装配收敛：把 main 里国家/区域阶段与规则阶段的连续准备逻辑抽成 helper，继续压缩主流程前半段。
 * 216. diagnostics 阶段装配收敛：把主流程中的校验、补字段、响应头回写与诊断日志输出整理成统一 helper。
 * 217. 最终结果字段装配继续收敛：把 mixed-port / allow-lan / unified-delay / tcp-concurrent 等收尾字段改成统一定义驱动。
 * 218. full 日志收尾装配继续收敛：把 full 模式日志上下文与 log-level 解析抽成 helper，继续压缩 finalizeMainResultArtifacts。
 * 219. 阶段产物裁剪继续收敛：把 geo/rule 两批 artifacts 的常用字段提炼成统一规范化 helper，减少多个 payload builder 重复挑字段。
 * 220. payload 装配继续收敛：analysis/result/diagnostics/finalize 四段改为复用共享 artifacts helper，继续压缩阶段上下文拼装代码。
 * 221. 收尾摘要上下文继续收敛：把 finalize/full 日志共同依赖的 geo/rule/analysis 摘要字段提炼成共享 helper，减少重复装配。
 * 222. profile 注入模板继续收敛：把 profile.store-selected/store-fake-ip 默认值组装抽成 helper，减少 buildMainProfileConfig 内条件模板。
 * 223. diagnostics 摘要装配继续收敛：让 diagnostics payload/supplement 复用共享摘要上下文，减少 country/analysis 字段重复拼装。
 * 224. diagnostics 补字段收尾继续收敛：把 provider mutation 与 analysis 摘要并入统一 supplement context helper，继续压缩 buildMainDiagnosticsArtifacts。
 * 225. 收尾摘要字段定义化：把 geo/rule/analysis 摘要上下文改成统一定义表装配，减少 buildMainSummaryPayloadContext 内重复 fallback 模板。
 * 226. 主流程阶段编排继续收敛：把 pipeline 前半段五个阶段改成顺序定义表驱动，减少 buildMainPipelineArtifacts 内平行调用模板。
 * 227. 规则输入裁剪继续收敛：把主流程对 config.rules 的规范化读取抽成 helper，减少 pipeline/diagnostics 阶段重复兜底。
 * 228. payload 装配上下文继续收敛：把 result/diagnostics/finalize 三段共同依赖的规范化输入提炼成共享 helper，减少多处重复取值。
 * 229. 最终结果字段继续收敛：把 result 阶段的 provider 注入与基础输出字段拆成共享 helper，减少 buildMainResultConfig 内对象模板体积。
 * 230. 收尾 full 模式继续收敛：把 full 日志所需的 log-level 与 summary payload 装配抽成 helper，继续压缩 finalizeMainResultArtifacts。
 * 231. 定义驱动装配继续收敛：把若干“遍历 definitions 产出对象”的同构循环抽成统一 helper，减少收尾阶段重复模板。
 * 232. full 日志上下文继续收敛：让 full summary payload 复用主流程统一装配上下文，减少 summary/finalize 间的重复裁剪。
 * 233. diagnostics/analysis builder 继续收敛：把 supplement、single-value 与 summary/preview 这几类定义驱动装配统一走共享 helper，减少同构循环。
 * 234. analysis/provider 继续定义化：把分析主产物与 provider mutation 摘要装配改成统一定义驱动，减少平铺调用模板。
 * 235. full 日志指标继续收敛：把 diagnostics 统计里的额外 Provider/改名摘要改成定义表装配，减少 buildFullSummaryDiagnosticMetrics 内模板代码。
 * 236. 裁剪型 helper 继续定义化：把 analysis-stage / validation-cache / diagnostics-supplement-context 这些字段挑选逻辑改成统一定义驱动。
 * 237. artifacts 裁剪继续定义化：把 analysis/geo/rule 三组 payload-artifacts helper 也改成统一定义表装配，继续减少重复裁剪模板。
 * 238. 结果/profile 字段继续定义化：把 result 核心产物字段与 profile 运行时字段都改成统一定义驱动，继续压缩收尾 helper。
 * 239. 收尾副作用继续收敛：把 diagnostics 响应头回写与 full 模式结果字段装配提成 helper/定义表，减少 finalize 阶段条件模板。
 * 240. diagnostics/pipeline 装配继续收敛：把 diagnostics supplement 合并与 pipeline 阶段执行上下文抽成 helper，继续减少阶段函数里的模板代码。
 * 241. 响应头装配继续收敛：把 buildRuntimeResponseHeaders 里的多段 header section 合并改成统一计划表驱动，减少主函数平铺模板。
 * 242. 响应头与摘要循环继续收敛：把 runtime 响应头剩余附加字段与 logBuildSummary 里的批量循环也改成统一定义/批量执行 helper。
 * 243. buildProxyGroups 服务组装配继续收敛：把 GitHub / Steam / Dev 的资源解析、候选链与组选项构建抽成统一 helper，减少函数中成组模板代码。
 * 244. 日志定义批量执行继续收敛：把 diagnostics/full-summary 里按 definitions 顺序执行的循环抽成统一 helper，减少日志函数模板。
 * 245. 顺序产物装配继续收敛：新增顺序定义执行 helper，并让 geo/rule/pipeline 三段顺序产物统一走同一套装配模式。
 * 246. 日志循环继续收敛：把 logDiagnostics 与 logBuildSummary 里按 definitions 顺序执行的同构循环进一步抽成统一 helper。
 * 247. 响应头/日志分段继续计划化：把 runtime header section 的 mode 分派与 logBuildSummary 里的剩余分组循环改成统一计划表驱动。
 * 248. buildProxyGroups 服务组装配继续收敛：把 GitHub / Steam / Dev 的资源解析、候选链与组选项构建进一步合并成共享 helper。
 * 249. buildProxyGroups 服务状态继续收敛：把 GitHub / Steam / Dev 的模式基链、优选资源、组选项与最终组构造提炼成统一 helper。
 * 250. buildProxyGroups 服务定义继续收敛：把 GitHub / Steam / Dev 的服务组构造计划改成统一定义表装配，继续压缩函数内部平行模板。
 * 251. buildProxyGroups 固定组装配继续收敛：把固定功能组数组改成统一定义表构造，减少大段 createSelectGroup/createServiceGroup 模板。
 * 252. buildProxyGroups 追加组继续收敛：把 landing/low-cost/country/region/other 这些追加组构造改成统一 helper，继续压缩尾段模板。
 * 253. buildProxyGroups 尾段列表装配继续收敛：把固定组与追加组的拼接统一交给 helper，减少尾段 push/循环模板。
 * 254. buildProxyGroups 收尾继续收敛：把生成组拼装与 merge/order 收尾提成 helper，减少 buildProxyGroups 尾段样板代码。
 * 255. buildProxyGroups 前置状态继续收敛：把 preferred country groups 与 mode base proxies 改成定义驱动装配，继续压缩函数前半段平行模板。
 * 256. name 列表提取继续收敛：把多处对象数组里的 `name` 收集模板抽成统一 helper，顺带压缩策略组排序、诊断与 buildProxyGroups 中的重复过滤逻辑。
 * 257. 可用组名集合继续收敛：把“若干组名数组 + 内置策略名”的拼装提成统一 helper，并抽出稳定生成的功能组常量，减少规则/校验/buildProxyGroups 中的重复列表模板。
 * 258. buildProxyGroups 基础上下文继续收敛：把 country/region/group/provider/name 这批无副作用的前置提取统一收成 helper，继续压缩函数开头的平行变量模板。
 * 259. diagnostics 预览输出继续收敛：把 warning/special-warning 在 full 模式下的样本打印模板抽成共享 helper，减少日志函数里的重复 slice/format 循环。
 * 260. DNS / Kernel / Sniffer 标量回退继续收敛：把“参数优先 -> 配置回退 -> 默认值”的 string/bool/hasOwn 模板提成通用 resolver，减少核心配置构建函数中的重复三元分支。
 * 261. definition-build 列表装配继续收敛：把“definitions -> build -> 列表/拍平列表”的双份循环统一成共享 helper，减少 buildProxyGroups 周边重复模板。
 * 262. build summary 阶段调度继续收敛：给 definition handler sections 显式加上 phase，移除 logBuildSummary 里的 slice 魔法索引。
 * 263. runtime response-header section 分派继续收敛：把 definition / diagnostic-summary 的 kind 分支改成注册表驱动，减少 section payload builder 内的条件模板。
 * 264. 校验/内核显式值回退继续收敛：把 validateRuleTargets 的组名提取与 Kernel 默认项里剩余的 hasOwn 标量模板继续统一到共享 helper。
 * 265. DNS / Kernel / Sniffer 标量装配继续定义化：把已抽成 resolver 的局部标量字段改为小范围 definition-driven 产物，继续压缩三段配置构建函数里的平行局部变量模板。
 * 266. diagnostics 定义解析继续收敛：把 warning/special-warning 对 shouldLog/message/previewItems/preview 配置的默认值解析统一到共享 helper，并补齐 DNS fake-ip-filter 的新字段引用。
 * 267. DNS / Kernel config-only 标量继续定义化：把 use-hosts / direct-nameserver-follow-policy / mode / etag-support 这批仅依赖配置回退的字段也并入共享 scalar definitions，继续收敛零散模板。
 * 268. DNS optional scalar / diagnostics logger 状态继续收敛：把 fake-ip-range6/fake-ip-ttl 写回改成可选定义装配，并把 warning/special-warning 的运行态解析统一到单一 state resolver。
 * 269. DNS 默认列表合并继续收敛：把 default-nameserver / nameserver / fallback / fallback-filter 里的默认值拼接模板统一到共享 helper，减少 buildDnsConfig 中的重复 uniqueStrings + toStringArray 模板。
 * 270. DNS fallback-filter 继续局部定义化：把“默认对象 + geosite/domain/ipcidr 三段补齐”收成专用 helper，继续压缩 buildDnsConfig 尾段固定模板。
 * 271. full 日志服务摘要行继续收敛：把独立组前置组/点名节点/Provider池/测速/节点池这批同构 value 行抽成共享构造 helper，减少 BUILD_SUMMARY_VALUE_LINE_DEFINITIONS 中的重复模板。
 * 272. 响应头条件定义继续收敛：把 country-extra-aliases 与 rule-order 这两组同构 header 定义抽成共享构造 helper，减少 response-header definitions 中的重复模板。
 * 273. summary/header 参数定义继续收敛：把 `ARGS.hasX ? ARGS.x : fallback` 型 header 定义与 BUILD_SUMMARY_SERVICE_ARG_LINE_DEFINITIONS 的条目构造统一到共享 helper，继续压缩 definitions 区域的重复模板。
 * 274. response-header / summary definitions 继续模板化：把 Geo/Rule-Order 里同构的参数回退 header 与 build summary 参数条目统一到共享构造 helper，减少 definitions 区域里重复的 `hasX/valueKey/fallback` 样板。
 * 275. rule-order 展示定义继续收敛：把 full 日志里的规则顺序摘要与响应头里共用的 anchor/position 读取逻辑统一到共享 helper / definitions，集中维护规则顺序的键位映射。
 * 276. Sniffer / build-summary 模板继续收敛：把 sniff 协议表与字符串列表写回改成 definitions 驱动，并统一 full 日志单行输出 helper，继续压缩局部重复模板。
 * 277. Kernel 默认项输出映射继续定义化：把 buildKernelDefaults 末尾静态的输出键投影集中到共享 definitions，保持默认值解析不变，只收敛最终装配模板。
 * 278. DNS 默认列表 / policy 合并继续定义化：把 buildDnsConfig 尾段的 nameserver/fallback/proxy-server-nameserver 与两组 policy 合并模板统一到共享 definitions，集中维护默认值来源与写回顺序。
 * 279. diagnostics 执行壳层继续收敛：把 warning/special-warning 共同的 message + preview 输出流程统一到共享 helper，保持 definitions、触发条件与预览格式不变。
 * 280. diagnostics 计数/response-header 适配继续收敛：把 issue 总数改成从 diagnostics definitions 派生，并统一两类 response-header definition 的适配壳层，减少计数名单与响应头映射模板的漂移。
 * 281. diagnostics 调度壳层继续收敛：把 logDiagnostics 里 warning/special-warning 的分发顺序整理成统一 section 计划表，继续压缩主函数中的平铺 handler 调用。
 * 282. DNS policy / diagnostics count definitions 继续收敛：把 buildDnsConfig 里两份同构 nameserver-policy 模板统一到共享 builder，并把 special issue 计数 definitions 收成轻量构造 helper，继续减少定义区样板。
 * 283. diagnostics count meta 继续内聚：把 special-warning 的计数来源直接并回 DIAGNOSTIC_SPECIAL_WARNING_DEFINITIONS，进一步消除日志定义与计数定义的并行维护。
 * 284. response-header entry shape 继续收敛：把 `{ suffix, value }` 结构的构造统一到共享 helper，减少 header 适配层里重复的 entry 字面量模板。
 * 285. DNS policy merge / header single-entry 路径继续收敛：把成对的 DNS policy merge definition 改成共享 builder，并把单值响应头的 entry-list 构造统一到轻量 helper，继续压缩适配层样板。
 * 286. diagnostics handler 协议继续收敛：把 warning/special-warning 两类 diagnostics 输出统一到单一 definition handler，保持定义表、顺序与输出格式不变，继续压缩分发壳层。
 * 287. definition-handler section runner 继续收敛：把 diagnostics 与 build summary 里两处同构的 section 循环统一到共享 runner，继续压缩调度层重复模板。
 * 288. DNS / header runtime context 继续收敛：把 buildDnsConfig 尾段共享数据打包成统一 runtime context，并把 runtime response-header section 改成显式 context 协议，继续压缩装配层样板。
 * 289. response-header normalize boundary 继续前移：把 entry 后缀标准化集中到 buildMappedResponseHeaders 中间层，让 buildPrefixedHeaderPayload 更专注于最终 header 拼装，继续压缩重复校验模板。
 * 290. runtime response-header section 协议继续统一：把 definitions 驱动区段、自定义区段与 diagnostic-summary 区段统一成更显式的 section 协议，并集中到共享 section payload resolver，继续压缩装配层模板。
 * 291. DNS runtime context 继续定义化：把 buildDnsRuntimeContext 里的固定 nameserver 列表与 policy 派生字段进一步收成共享常量/definitions，继续压缩 runtime context 装配模板。
 * 292. response-header emit / section 协议继续收敛：把 prefixed header 的最终 emit 独立成纯 helper，并让 diagnostics/build-summary 的 section 都显式带 handler，继续收紧 builder 层级职责。
 * 293. runtime response-header builder 层级继续收紧：把 trailing headers 也纳入统一 section 协议，并新增专用 runtime context builder，让 buildRuntimeResponseHeaders 只负责装配 context 与执行 section 计划。
 * 294. runtime response-header section 工厂继续收敛：把 definitions 型与 diagnostic-summary 型 section 统一到共享的映射式 section builder，并让 section payload resolver 改按显式 kind 分发，继续压缩 section 装配模板。
 * 295. runtime response-header builder 继续局部收敛：把 section helper 统一到单一协议，并把 definitions→entries 的两类小映射模板抽成共享 helper，继续压缩映射层样板。
 * 296. DNS runtime context 继续分层定义化：把 buildDnsRuntimeContext 拆成 base definitions 与 policy definitions 两段串行装配，显式表达“基础列表/选项 -> policy 派生字段”的依赖层次。
 * 297. buildProxyGroups 生成组列表继续收敛：把固定组与追加组 definitions 合并成单一生成计划，减少尾段数组拼接模板。
 * 298. runtime response-header definition 继续收敛：把 service / prefer-country custom sections 改为同一套 definition section，避免多层 master builder 模板。
 * 299. assemblyContext 装配继续定义化：把 result / diagnostics / finalize 共用的阶段裁剪字段收成 definitions，并让 supplement 上下文优先复用预装配产物。
 * 300. runtime response-header section 协议收尾：移除已无调用的 custom 分支与 build 回退，显式只保留 definition / diagnostic-summary 两类 section。
 * 301. build summary metrics 继续收敛：把 primary / warning metric logging 集合成同一套 definition section，减少 `logBuildSummary` 的平铺调用。
 * 311. 服务响应头继续收敛：把独立组字段适用性判断与 definitions 展开统一到共享 helper，减少 service header 区域的 filter/reduce 模板。
 * 312. 服务日志字段继续收敛：把独立组测速/节点池/高级项日志都统一到字段 definitions + 单一 formatter，并把资源摘要行改成定义驱动生成。
 * 302. buildProxyGroups 运行时上下文继续收敛：把候选链、优先国家链与服务组中间产物改成顺序 definitions builder，压缩函数前半段平行局部变量。
 * 303. build summary metric lines 收敛：抽出 `emitBuildSummaryMetricLine` 统一 label/value/unit 输出，减少 `logBuildSummaryMetricLines` 主体的重复模板。
 * 304. 调度 helper 继续收口：移除 buildProxyGroups 与 diagnostics section 中剩余的一次性中转 wrapper，减少无意义的调用层级。
 * 305. assemblyContext 消费层继续定义化：把 result / finalization / full-summary 这几段输出装配统一成 definitions，减少尾部对象模板。
 * 306. build summary / proxy group definition 继续收口：把 lookup registry/section 与 fixed/extra group 常见模板抽成 helper，继续压缩重复对象壳层。
 * 307. summary/preview 派生 definitions 继续收口：把 diagnostics/full-summary 对同一批摘要键的展开统一成 helper，减少重复 flatMap 模板。
 * 308. response-header / diagnostics definitions 继续收口：把服务响应头与 special-warning 的同构对象模板抽成轻量 helper，继续压缩 definitions 区样板。
 * 309. 分类计数模板继续收口：把业务窗口/规则风险/策略组风险里的 category 计数分支统一改成映射 + helper，减少多处 if-else 累加模板。
 * 310. 规则定义查表继续收口：把 provider->definition / provider->index 两份查找表构建统一到共享 builder，减少重复循环模板。
 * 313. resolveArgs 服务告警继续收敛：把 GitHub / Steam / Dev 的测速、模式、类型、strategy、expected-status 等同构告警收成共享 helper + 状态表批量输出。
 * 314. resolveArgs 服务 URL/优先级告警继续收敛：把独立组 test-url、include-all 覆盖链、icon/interface/routing-mark 提示改成统一循环，减少大段平铺 if 模板。
 * 315. GitHub 社区分组继续补厚：参考 blackmatrix7 / QuixoticHeart 等规则仓库，新增 Discord / WhatsApp / LINE / Instagram / Facebook / PayPal 独立组，并收紧 Meta 系规则顺序，避免宽泛规则抢先命中。
 * 316. 社区高频社交分组继续补齐：继续参考 blackmatrix7 当前规则目录，把 Twitter / Reddit 提升为独立组；Threads / Twitch / LinkedIn 暂不单拆，避免和既有 Meta / 媒体 / 开发生态重复堆叠。
 * 317. 分组必要性继续审计：按“能并入现有大组就不再单拆”的原则，把 Threads 并入 Facebook、LinkedIn 并入微软服务，并把 Riot / Battle / Blizzard / EA / Nintendo / PlayStation / Xbox / Ubisoft 统一补进游戏加速组。
 * 318. 分组审计继续收尾：继续参考 blackmatrix7 的 Teams / Twitch 规则，把 Teams 并入微软服务、Twitch 并入游戏加速；Pinterest / PrimeVideo / HBO / Hulu 这类当前没有合适现成组的条目先不硬塞。
 * 319. 媒体分组继续收敛：新增通用“流媒体”组承接 PrimeVideo / HBO / Hulu / Paramount+ / Peacock / Discovery+，并把 YouTube Music 明确并入 YouTube，避免继续为每个平台单拆一整排面板。
 * 320. 媒体规则继续补漏：参考 MetaCubeX 的 geosite，把 AppleMusic 并入 Apple、ProxyMedia 并入流媒体组，继续用“补覆盖而不膨胀面板”的方式收尾。
 * 321. 音乐流媒体继续补齐：参考 blackmatrix7 当前目录，把 SoundCloud / Deezer / KKBOX / Pandora 统一并入流媒体组；Spotify 保持独立，其余音乐平台不再额外拆新面板。
 * 322. 交易电商继续收敛：参考 blackmatrix7 当前目录，把 Stripe / Shopify / Amazon / AmazonCN 统一并入 PayPal 组；不额外新开购物面板，但通过规则顺序保证 PrimeVideo 仍优先命中流媒体组。
 * 323. 交易规则继续补齐并修序：继续把 eBay / AmazonTrust 并入 PayPal 组，同时把 Amazon 系规则整体后移到 PrimeVideo / 流媒体块之后，避免电商泛规则抢先吃掉 Prime Video。
 * 324. 视觉社交继续收敛：参考 blackmatrix7 当前目录，把 Pinterest 并入 Instagram 组；不再额外拆新社交面板，但补上图文灵感类流量覆盖。
 * 325. 国内支付规则继续审计：参考 blackmatrix7 当前目录，把 AliPay 补进直连规则，确保支付宝 / 跨境收银相关域名优先走直连；Alibaba 规则因范围过宽暂不纳入，避免误把泛阿里业务强塞进支付分组。
 * 326. 亚洲媒体规则继续审计：参考 blackmatrix7 当前目录，把 BiliBiliIntl 并入流媒体组，补上 bilibili.tv / Bstar 国际版；Abema / Bahamut 暂不纳入，避免为区域性媒体继续堆叠低频规则或引入过宽域名。
 * 327. 苹果生态规则继续审计：参考 blackmatrix7 当前目录，把 TestFlight 并入 Apple 组，补上 beta.apple.com / testflight.apple.com；GoogleVoice 规则仅覆盖单一域名且收益较低，暂不单独纳入。
 * 328. 视觉社区规则继续审计：参考 blackmatrix7 当前目录，把 Pixiv 并入 Instagram 组，统一承接 Pixiv / FANBOX / Booth 创作者社区流量；Patreon / Shopee 暂不纳入，避免把创作者赞助与区域电商硬塞进现有支付分组。
 * 329. 区域流媒体继续审计：参考 blackmatrix7 当前目录，把 All4 并入流媒体组，补上 channel4.com / c4assets.com；BritboxUK / Abema 仍暂不纳入，避免把 BBC / ITV / Ameba 等更宽泛站点一起卷进来。
 * 330. 创作者付费规则继续审计：参考 blackmatrix7 当前目录，把 Patreon 并入 PayPal 组，补上 patreon.com / patreonusercontent.com；Shopee 仍暂不纳入，避免把区域电商大盘误并到支付分组。
 * 331. 图片社区规则继续审计：参考 blackmatrix7 当前目录，把 Imgur 并入 Instagram 组，补上 imgur.com / imgurinc.com；Flickr / Behance 当前目录下无对应 Clash 规则，先不额外引入。
 */

// 记录当前脚本版本，便于在日志中确认用户正在运行哪一版脚本。
const SCRIPT_VERSION = "9.14.12";
// 对外 README / 变更说明使用带 V 前缀的版本标签：V9.14.12。
// 统一保存 Clash/Mihomo 内置的直连策略名称，避免魔法字符串散落全文件。
const BUILTIN_DIRECT = "DIRECT";
// 给国家分组拼接统一后缀，最终会生成诸如“🇯🇵 日本节点”的组名。
const NODE_SUFFIX = "节点";
// 统一维护国家组 / 区域组排序模式别名，避免规范化逻辑和参数校验各写一份后逐步漂移。
const GEO_GROUP_SORT_MODE_ALIAS_MAP = Object.freeze({
  // default / script / builtin / order 这一批都收敛到脚本内置定义顺序。
  default: "definition",
  script: "definition",
  builtin: "definition",
  original: "definition",
  order: "definition",
  definition: "definition",
  definitions: "definition",
  manual: "definition",
  // count / hot / popular 这批都表示按命中数量从高到低排序。
  count: "count-desc",
  hot: "count-desc",
  popular: "count-desc",
  size: "count-desc",
  countdesc: "count-desc",
  desc: "count-desc",
  descending: "count-desc",
  // asc / countasc 则是按命中数量从低到高，方便把冷门国家组顶到前面。
  countasc: "count-asc",
  asc: "count-asc",
  ascending: "count-asc",
  // name / alpha 统一映射到按显示名正序排列。
  name: "name",
  names: "name",
  alpha: "name",
  alphabetical: "name",
  // name-desc / reversealpha 用于按显示名倒序排列。
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
// 下面这组 URL/path 常量分别服务于：本地规则缓存目录、社区规则源、Geo 数据下载与脚本内置补丁规则。
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
// 默认开发补充规则地址，用来承接社区规则没完全覆盖的开发域名。
const DEV_LIST_URL = `${RULESET_REPO_BASE_URL}/Dev.list`;
// 默认 SteamFix 规则地址。
const STEAM_FIX_LIST_URL = `${POWERFULLZ_RULESET_BASE_URL}/SteamFix.list`;
// Mihomo 官方 General 配置文档中的推荐 GeoX 下载地址。
const GEOX_URLS = {
  // geoip / geosite / mmdb / asn 都按 Mihomo 常见字段名保存，后面写回 geox-url 时可直接复用。
  geoip: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat",
  geosite: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat",
  mmdb: "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb",
  asn: "https://github.com/xishang0128/geoip/releases/download/latest/GeoLite2-ASN.mmdb"
};

// 下面这批正则/保留名常量会被国家识别、落地节点隔离、策略组过滤与组名去重等多个流程反复复用。
// 用于识别低倍率、公益、实验性等不适合参与主国家分组统计的节点。
const REGEX_LOW_COST = /0\.[0-5]|低倍率|省流|大流量|实验性|公益/i;
// 用于识别“落地 / 中转 / Relay”等需要单独隔离的节点。
const REGEX_LANDING_ISOLATE = /落地|Relay|To-user|中转/i;
// 这些名称属于策略引擎内置保留策略，不需要在 proxy-groups 中额外定义。
const BUILTIN_POLICY_NAMES = ["DIRECT", "REJECT", "REJECT-DROP", "PASS", "GLOBAL", "COMPATIBLE"];
// 规则顺序编排时，用这两个哨兵值表示“移到最前 / 移到最后（MATCH 之前）”。
const RULE_ORDER_START = "__RULE_ORDER_START__";
// RULE_ORDER_END 表示规则项应尽量后置，但仍会排在最终 MATCH 规则之前。
const RULE_ORDER_END = "__RULE_ORDER_END__";
// 策略组布局预设的默认模式。
const DEFAULT_GROUP_ORDER_PRESET = "balanced";
// 内置规则源预设的默认模式。
const DEFAULT_RULE_SOURCE_PRESET = "meta";
// 统一把 group-order-preset 的社区别名折叠到固定枚举，避免每次规范化都临时造一份 alias map。
const GROUP_ORDER_PRESET_ALIAS_MAP = Object.freeze({
  // balanced 是默认均衡布局；没有显式传参时最终会回落到它。
  balanced: "balanced",
  // core/main 一组别名都表示“核心功能组优先”的面板布局。
  core: "core",
  corefirst: "core",
  main: "core",
  mainfirst: "core",
  // service/business 一组别名都表示把业务分组整体前移。
  service: "service",
  services: "service",
  servicefirst: "service",
  business: "service",
  businessfirst: "service",
  // media/streaming 别名收敛到“媒体分组优先”布局。
  media: "media",
  mediafirst: "media",
  streaming: "media",
  streamingfirst: "media",
  // region/regional/geography 这批都表示“区域组优先”的地理布局。
  region: "region",
  regions: "region",
  regionfirst: "region",
  regionsfirst: "region",
  regional: "region",
  regionalfirst: "region",
  geofirst: "region",
  geography: "region",
  // country/national 这一批都落到“国家组优先”布局。
  country: "national",
  countries: "national",
  countryfirst: "national",
  national: "national",
  nationalfirst: "national",
  nationfirst: "national",
  countrygroupsfirst: "national",
  countriesfirst: "national",
  // workspace/dashboard/compact/geo-compact 则分别对应工作流优先、日常面板、紧凑面板、地理紧凑面板。
  workspace: "workspace",
  work: "workspace",
  office: "workspace",
  workbench: "workspace",
  workspacefirst: "workspace",
  workflow: "workspace",
  workflowfirst: "workspace",
  dashboard: "dashboard",
  daily: "dashboard",
  panel: "dashboard",
  home: "dashboard",
  desk: "dashboard",
  compact: "compact",
  minimal: "compact",
  mini: "compact",
  lite: "compact",
  compactfirst: "compact",
  geocompact: "geo-compact",
  compactgeo: "geo-compact",
  subregionfirst: "geo-compact",
  subregionsfirst: "geo-compact",
  geofocus: "geo-compact"
});

// group-order-preset 的合法值统一收口到顶层常量，避免新增布局后漏改校验名单。
const VALID_GROUP_ORDER_PRESET_TOKENS = Object.freeze(["default", "script"].concat(Object.keys(GROUP_ORDER_PRESET_ALIAS_MAP)));

// 统一维护所有策略组的展示名称，后面所有规则和分组都从这里取值。
const GROUPS = {
  // 下面先放基础功能组，再放业务组；这样后续阅读规则目标、布局预设和固定组定义时更顺手。
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
  // PayPal / 支付购物服务专用策略组；组名保持兼容，不额外新开购物面板。
  PAYPAL: "💳 PayPal",
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

  // Discord 专用策略组。
  DISCORD: "💬 Discord",
  // Telegram 专用策略组。
  TELEGRAM: "✈️ Telegram",
  // WhatsApp 专用策略组。
  WHATSAPP: "🟢 WhatsApp",
  // LINE 专用策略组。
  LINE: "💚 LINE",
  // Twitter / X 专用策略组。
  TWITTER: "🐦 Twitter",
  // Instagram 专用策略组。
  INSTAGRAM: "📸 Instagram",
  // Facebook 专用策略组。
  FACEBOOK: "📘 Facebook",
  // Reddit 专用策略组。
  REDDIT: "👽 Reddit",
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
  // 兜住额外国际视频平台的通用流媒体组。
  STREAMING: "🎬 流媒体",

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

// 这批功能组在脚本正常构建时始终会生成，可供规则目标解析与前置组引用直接复用。
const PROXY_GROUP_ALWAYS_GENERATED_NAMES = Object.freeze([
  // 这里只放“稳定生成”的功能组；像 LANDING / LOW_COST 会按条件生成，所以不放进这份稳定名单。
  GROUPS.SELECT,
  GROUPS.MANUAL,
  GROUPS.FALLBACK,
  GROUPS.DIRECT,
  GROUPS.OTHER,
  GROUPS.AI,
  GROUPS.CRYPTO,
  GROUPS.PAYPAL,
  GROUPS.APPLE,
  GROUPS.MICROSOFT,
  GROUPS.GOOGLE,
  GROUPS.GITHUB,
  GROUPS.DEV,
  GROUPS.BING,
  GROUPS.ONEDRIVE,
  GROUPS.DISCORD,
  GROUPS.TELEGRAM,
  GROUPS.WHATSAPP,
  GROUPS.LINE,
  GROUPS.TWITTER,
  GROUPS.INSTAGRAM,
  GROUPS.FACEBOOK,
  GROUPS.REDDIT,
  GROUPS.YOUTUBE,
  GROUPS.NETFLIX,
  GROUPS.DISNEY,
  GROUPS.SPOTIFY,
  GROUPS.TIKTOK,
  GROUPS.STREAMING,
  GROUPS.STEAM,
  GROUPS.GAMES,
  GROUPS.PT,
  GROUPS.SPEEDTEST,
  GROUPS.ADS
]);

// 开发生态规则入口集合：用于统一改写 DevList / GitLab / Docker / Npmjs / JetBrains / Vercel / Python / Jfrog / Heroku / GitBook / SourceForge / DigitalOcean / Anaconda / Atlassian / Notion / Figma / Slack / Dropbox 这类开发服务规则。
// 这里刻意把“本地补丁层 DevList”放在最前面，方便后续继续往 Bun / NuGet / Composer / Flutter 这类零散生态上补域名，而不用每次都新增一整套独立规则提供器。
const DEV_RULE_PROVIDERS = Object.freeze(["DevList", "GitLab", "Docker", "Npmjs", "Jetbrains", "Vercel", "Python", "Jfrog", "Heroku", "GitBook", "SourceForge", "DigitalOcean", "Anaconda", "Atlassian", "Notion", "Figma", "Slack", "Dropbox"]);

// 策略组布局预设：用于整体重排面板里 proxy-groups 的展示顺序。
const GROUP_ORDER_PRESET_TOKENS = {
  // token 列表里不是最终组名，而是布局阶段使用的抽象槽位；后面会再解析成实际 groups / region / country / helper 区块。
  balanced: ["select", "manual", "fallback", "ai", "github", "dev", "microsoft", "onedrive", "google", "telegram", "discord", "whatsapp", "line", "twitter", "instagram", "facebook", "reddit", "steam", "regions", "countries", "bing", "apple", "games", "paypal", "crypto", "pt", "speedtest", "media", "ads", "direct", "landing", "lowcost", "other", "extras"],
  core: ["select", "manual", "fallback", "direct", "ads", "ai", "github", "dev", "steam", "crypto", "paypal", "google", "microsoft", "onedrive", "telegram", "discord", "whatsapp", "line", "twitter", "instagram", "facebook", "reddit", "apple", "bing", "games", "pt", "speedtest", "media", "landing", "lowcost", "regions", "countries", "other", "extras"],
  service: ["select", "manual", "fallback", "ai", "github", "dev", "microsoft", "onedrive", "google", "telegram", "discord", "whatsapp", "line", "twitter", "instagram", "facebook", "reddit", "steam", "bing", "apple", "games", "paypal", "crypto", "pt", "speedtest", "media", "ads", "direct", "landing", "lowcost", "regions", "countries", "other", "extras"],
  media: ["select", "manual", "fallback", "media", "ai", "github", "dev", "telegram", "discord", "whatsapp", "line", "twitter", "instagram", "facebook", "reddit", "google", "steam", "apple", "microsoft", "onedrive", "bing", "games", "paypal", "crypto", "pt", "speedtest", "ads", "direct", "landing", "lowcost", "regions", "countries", "other", "extras"],
  region: ["select", "manual", "fallback", "regions", "countries", "ai", "github", "dev", "microsoft", "onedrive", "google", "telegram", "discord", "whatsapp", "line", "twitter", "instagram", "facebook", "reddit", "steam", "bing", "apple", "games", "paypal", "crypto", "pt", "speedtest", "media", "ads", "direct", "landing", "lowcost", "other", "extras"],
  national: ["select", "manual", "fallback", "countries", "regions", "ai", "github", "dev", "microsoft", "onedrive", "google", "telegram", "discord", "whatsapp", "line", "twitter", "instagram", "facebook", "reddit", "steam", "bing", "apple", "games", "paypal", "crypto", "pt", "speedtest", "media", "ads", "direct", "landing", "lowcost", "other", "extras"],
  workspace: ["select", "manual", "fallback", "ai", "github", "dev", "microsoft", "onedrive", "google", "telegram", "discord", "whatsapp", "line", "twitter", "instagram", "facebook", "reddit", "countries", "regions", "steam", "bing", "apple", "games", "paypal", "crypto", "media", "pt", "speedtest", "ads", "direct", "landing", "lowcost", "other", "extras"],
  dashboard: ["select", "manual", "fallback", "direct", "ai", "github", "dev", "crypto", "paypal", "steam", "games", "regions", "countries", "telegram", "discord", "whatsapp", "line", "twitter", "instagram", "facebook", "reddit", "microsoft", "onedrive", "google", "media", "bing", "apple", "pt", "speedtest", "ads", "landing", "lowcost", "other", "extras"],
  compact: ["select", "manual", "fallback", "ai", "github", "dev", "telegram", "discord", "whatsapp", "line", "twitter", "instagram", "facebook", "reddit", "paypal", "steam", "media", "regions", "countries", "helpers", "extras"],
  "geo-compact": ["select", "manual", "fallback", "regions", "countries", "ai", "github", "dev", "telegram", "discord", "whatsapp", "line", "twitter", "instagram", "facebook", "reddit", "paypal", "steam", "media", "helpers", "extras"]
};

// 某些自动分组天然允许为空，不必为此输出告警。
const ALLOW_EMPTY_AUTO_GROUPS = [GROUPS.OTHER, GROUPS.LANDING];
// 允许通过参数隐藏的辅助策略组。
const HIDEABLE_GROUPS = [GROUPS.DIRECT, GROUPS.ADS, GROUPS.LANDING, GROUPS.LOW_COST];
// AI 默认优先国家链：新加坡 -> 日本 -> 美国 -> 香港。
// 这里的每一项都是“可匹配 marker 列表”，后面会依次尝试命中国家名、旗帜、别名或区域 token。
const DEFAULT_AI_PREFERRED_COUNTRY_MARKERS = [["🇸🇬", "狮城", "新加坡"], ["🇯🇵", "日本"], ["🇺🇸", "美国"], ["🇭🇰", "香港"]];
// Crypto 默认优先国家链：日本 -> 新加坡 -> 香港。
const DEFAULT_CRYPTO_PREFERRED_COUNTRY_MARKERS = [["🇯🇵", "日本"], ["🇸🇬", "狮城", "新加坡"], ["🇭🇰", "香港"]];
// Prefer-Countries 预设包：让 AI / Crypto / GitHub / Steam / Dev 等优先链不用每次手写长串国家/区域标记。
// 每个 preset 由四部分组成：key（规范名）、name（展示名）、aliases（兼容写法）、markers（最终展开的国家/区域 token）。
const PREFERRED_COUNTRY_PRESET_DEFINITIONS = Object.freeze([
  // 这一段是“业务导向”的核心预设：直接面向 AI / Crypto / 游戏 / 开发等常见使用场景。
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
  // 这一段是“地理导向”的核心预设：按亚洲/欧洲/美洲/中东/非洲等大区快速展开。
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
    key: "latam-core",
    name: "🌮 拉美核心链",
    aliases: ["latamcore", "latam-core", "latinamericacore", "latin-america-core", "拉美核心"],
    markers: ["latam"]
  },
  {
    key: "middleeast-core",
    name: "🕌 中东核心链",
    aliases: ["middleeastcore", "middleeast-core", "mecore", "me-core", "中东核心"],
    markers: ["middleeast"]
  },
  {
    key: "africa-core",
    name: "🌍 非洲核心链",
    aliases: ["africacore", "africa-core", "非洲核心"],
    markers: ["northafrica", "尼日利亚", "肯尼亚", "南非"]
  },
  {
    key: "mena-core",
    name: "🏜️ 中东北非核心链",
    aliases: ["menacore", "mena-core", "middleeastnorthafrica", "middle-east-north-africa", "中东北非核心"],
    markers: ["middleeast", "northafrica"]
  },
  {
    key: "balkans-core",
    name: "🧭 巴尔干核心链",
    aliases: ["balkanscore", "balkans-core", "balkancore", "balkan-core", "巴尔干核心"],
    markers: ["balkans"]
  },
  {
    key: "mediterranean-core",
    name: "🌊 地中海核心链",
    aliases: ["mediterraneancore", "mediterranean-core", "medcore", "med-core", "地中海核心"],
    markers: ["mediterranean"]
  },
  {
    key: "eurasia-core",
    name: "🌐 欧亚核心链",
    aliases: ["eurasiacore", "eurasia-core", "eurasiacenter", "欧亚核心"],
    markers: ["eastasia", "southasia", "centralasia", "caucasus"]
  },
  {
    key: "global-core",
    name: "🌐 全球核心链",
    aliases: ["globalcore", "global-core", "worldcore", "world-core", "全球核心"],
    markers: ["eastasia", "southeastasia", "northeurope", "centraleurope", "northamerica", "gulf"]
  },
  // 这一段继续补充“偏工作流/子区域”的核心预设，用于更细颗粒度的线路选择。
  {
    key: "apac-core",
    name: "🌏 亚太核心链",
    aliases: ["apaccore", "apac-core", "asiapacificcore", "asia-pacific-core", "亚太核心"],
    markers: ["apac", "eastasia", "southeastasia", "oceania"]
  },
  {
    key: "westasia-core",
    name: "🧿 西亚核心链",
    aliases: ["westasiacore", "westasia-core", "西亚核心"],
    markers: ["westasia", "gulf", "levant"]
  },
  {
    key: "workspace-core",
    name: "🧑‍💻 工作流核心链",
    aliases: ["workspacecore", "workspace-core", "workbenchcore", "workbench-core", "办公核心", "工作流核心"],
    markers: ["eastasia", "southeastasia", "northeurope", "centraleurope", "northamerica"]
  },
  {
    key: "westeurope-core",
    name: "🌤️ 西欧核心链",
    aliases: ["westeuropecore", "west-europe-core", "wecore", "we-core", "西欧核心"],
    markers: ["westeurope", "benelux", "iberia"]
  },
  {
    key: "easteurope-core",
    name: "🧊 东欧核心链",
    aliases: ["easteuropecore", "east-europe-core", "eecore", "ee-core", "东欧核心"],
    markers: ["easteurope", "balkans"]
  },
  {
    key: "gulf-core",
    name: "🛢️ 海湾核心链",
    aliases: ["gulfcore", "gulf-core", "gcccore", "gcc-core", "海湾核心"],
    markers: ["gulf", "levant"]
  },
  {
    key: "greaterchina-core",
    name: "🀄 华语核心链",
    aliases: ["greaterchinacore", "greaterchina-core", "greater-china-core", "sinospherecore", "sinosphere-core", "华语核心"],
    markers: ["greaterchina"]
  },
  {
    key: "anglosphere-core",
    name: "🌐 英语区核心链",
    aliases: ["anglospherecore", "anglosphere-core", "englishcore", "english-core", "英语区核心"],
    markers: ["anglosphere"]
  },
  {
    key: "southeastasia-core",
    name: "🌴 东南亚核心链",
    aliases: ["southeastasiacore", "south-east-asia-core", "seasiacore", "aseancore", "asean-core", "东南亚核心", "东盟核心"],
    markers: ["asean", "southeastasia"]
  },
  {
    key: "northamerica-core",
    name: "🗽 北美核心链",
    aliases: ["northamericacore", "north-america-core", "nacore", "na-core", "北美核心"],
    markers: ["northamerica"]
  },
  {
    key: "iberia-core",
    name: "🍷 伊比利亚核心链",
    aliases: ["iberiacore", "iberia-core", "西葡核心", "伊比利亚核心"],
    markers: ["iberia"]
  },
  {
    key: "benelux-core",
    name: "💎 比荷卢核心链",
    aliases: ["beneluxcore", "benelux-core", "比荷卢核心"],
    markers: ["benelux"]
  },
  {
    key: "northafrica-core",
    name: "🏜️ 北非核心链",
    aliases: ["northafricacore", "north-africa-core", "maghrebcore", "maghreb-core", "北非核心"],
    markers: ["northafrica"]
  },
  {
    key: "nordic-core",
    name: "❄️ 北欧核心链",
    aliases: ["nordiccore", "nordic-core", "northeuropecore", "north-europe-core", "北欧核心"],
    markers: ["northeurope"]
  },
  {
    key: "dach-core",
    name: "🏔️ DACH核心链",
    aliases: ["dachcore", "dach-core", "deatchcore", "de-at-ch-core", "德语区核心"],
    markers: ["dach"]
  },
  {
    key: "cjk-core",
    name: "🈶 CJK核心链",
    aliases: ["cjkcore", "cjk-core", "东北亚核心", "中日韩核心"],
    markers: ["cjk"]
  },
  {
    key: "asean-core",
    name: "🧩 东盟核心链",
    aliases: ["aseancore", "asean-core", "东盟核心"],
    markers: ["asean"]
  },
  {
    key: "levant-core",
    name: "🧭 黎凡特核心链",
    aliases: ["levantcore", "levant-core", "黎凡特核心", "eastmedcore", "eastmed-core"],
    markers: ["levant"]
  },
  {
    key: "oceania-core",
    name: "🦘 大洋洲核心链",
    aliases: ["oceaniacore", "oceania-core", "anzcore", "anz-core", "大洋洲核心", "澳新核心"],
    markers: ["oceania"]
  },
  {
    key: "baltics-core",
    name: "🌊 波罗的海核心链",
    aliases: ["balticscore", "baltics-core", "balticcore", "baltic-core", "波罗的海核心"],
    markers: ["baltics"]
  },
  {
    key: "nafta-core",
    name: "🚚 北美自贸核心链",
    aliases: ["naftacore", "nafta-core", "usmcacore", "usmca-core", "北美自贸核心", "美加墨核心"],
    markers: ["nafta"]
  },
  {
    key: "southerncone-core",
    name: "🧉 南锥体核心链",
    aliases: ["southernconecore", "southern-cone-core", "southcone-core", "南锥体核心"],
    markers: ["southerncone"]
  },
  // 最后一段是社区常见“经典 N 地”快捷组合，主要兼容面板/仓库里常见的 HK/TW/SG/JP/KR/US 连写习惯。
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
  },
  {
    key: "asia-5",
    name: "🌏 亚洲五地",
    aliases: ["asia5", "asia-5", "eastasia5", "east-asia-5", "hktwsgjpkr", "hk-tw-sg-jp-kr", "亚洲五地"],
    markers: ["香港", "台湾", "狮城", "日本", "韩国"]
  }
]);

// 国家/地区识别配置表。
// 这里不只放国家名，还放旗帜和别名，用于后续自动识别节点归属。
const COUNTRY_DEFINITIONS = [
  // 这一大段的每一项都遵循同一结构：name 用作最终组名显示，flag 用于界面与日志展示，aliases 则负责命中机场节点里的各种写法。
  // 对容易与普通英文单词冲突的两位缩写（如 IT / IN / NO / CH / IE / PT），尽量只保留中文名、三位缩写和主要城市名，减少误判。
  // 香港常见命名方式。
  { name: "香港", flag: "🇭🇰", aliases: ["香港", "HK", "HKG", "Hong Kong", "HongKong"] },
  // 澳门常见命名方式。
  { name: "澳门", flag: "🇲🇴", aliases: ["澳门", "MO", "MAC", "Macao", "Macau"] },
  // 台湾常见命名方式。
  { name: "台湾", flag: "🇹🇼", aliases: ["台湾", "台北", "新北", "TW", "TWN", "Taiwan"] },
  // 日本常见命名方式。
  { name: "日本", flag: "🇯🇵", aliases: ["日本", "东京", "大阪", "埼玉", "名古屋", "福冈", "JP", "JPN", "Japan", "Tokyo", "Osaka", "Nagoya", "Fukuoka"] },
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
  { name: "葡萄牙", flag: "🇵🇹", aliases: ["葡萄牙", "PRT", "Portugal", "Lisbon", "Porto", "里斯本", "波尔图"] },
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
  // 白俄罗斯常见命名方式；优先使用中文名、三位缩写与首都，减少 BY 误判。
  { name: "白俄罗斯", flag: "🇧🇾", aliases: ["白俄罗斯", "BLR", "Belarus", "Minsk", "明斯克"] },
  // 冰岛常见命名方式；不使用容易误判的 IS 两位缩写。
  { name: "冰岛", flag: "🇮🇸", aliases: ["冰岛", "ISL", "Iceland", "Reykjavik", "雷克雅未克"] },
  // 塞尔维亚常见命名方式；优先使用中文名、三位缩写与首都，减少 RS 误判。
  { name: "塞尔维亚", flag: "🇷🇸", aliases: ["塞尔维亚", "SRB", "Serbia", "Belgrade", "贝尔格莱德"] },
  // 阿尔巴尼亚常见命名方式；优先使用中文名、三位缩写与首都，减少 AL 误判。
  { name: "阿尔巴尼亚", flag: "🇦🇱", aliases: ["阿尔巴尼亚", "ALB", "Albania", "Tirana", "地拉那"] },
  // 波黑常见命名方式；显示名沿用常见中文简称。
  { name: "波黑", flag: "🇧🇦", aliases: ["波黑", "波斯尼亚", "波斯尼亚和黑塞哥维那", "BIH", "Bosnia", "Bosnia and Herzegovina", "Sarajevo", "萨拉热窝"] },
  // 黑山常见命名方式；优先使用中文名、三位缩写与首都，减少 ME 与中东 token 冲突。
  { name: "黑山", flag: "🇲🇪", aliases: ["黑山", "MNE", "Montenegro", "Podgorica", "波德戈里察"] },
  // 北马其顿常见命名方式；优先使用完整中文名、三位缩写与首都。
  { name: "北马其顿", flag: "🇲🇰", aliases: ["北马其顿", "马其顿", "MKD", "North Macedonia", "Skopje", "斯科普里"] },
  // 摩尔多瓦常见命名方式；优先使用三位缩写，避免 MD 与普通文本冲突。
  { name: "摩尔多瓦", flag: "🇲🇩", aliases: ["摩尔多瓦", "MDA", "Moldova", "Chisinau", "Chișinău", "基希讷乌"] },
  // 塞浦路斯常见命名方式；优先使用三位缩写，避免 CY 误判。
  { name: "塞浦路斯", flag: "🇨🇾", aliases: ["塞浦路斯", "CYP", "Cyprus", "Nicosia", "尼科西亚"] },
  // 马耳他常见命名方式；优先使用中文名、三位缩写与首都，减少 MT 误判。
  { name: "马耳他", flag: "🇲🇹", aliases: ["马耳他", "MLT", "Malta", "Valletta", "瓦莱塔"] },

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
  { name: "菲律宾", flag: "🇵🇭", aliases: ["菲律宾", "PH", "PHL", "Philippines", "Manila", "Cebu", "Davao", "马尼拉", "宿务", "达沃"] },
  // 印度尼西亚常见命名方式，这里用“印尼”作为显示名称。
  { name: "印尼", flag: "🇮🇩", aliases: ["印尼", "印度尼西亚", "ID", "IDN", "Indonesia", "Jakarta", "Surabaya", "雅加达", "泗水"] },
  // 柬埔寨常见命名方式；优先使用中文名、三位缩写与首都别名。
  { name: "柬埔寨", flag: "🇰🇭", aliases: ["柬埔寨", "KHM", "Cambodia", "Phnom Penh", "金边"] },
  // 文莱常见命名方式；在东南亚节点里偶尔出现，这里补上。
  { name: "文莱", flag: "🇧🇳", aliases: ["文莱", "BRN", "Brunei", "Bandar Seri Begawan", "斯里巴加湾"] },
  // 老挝常见命名方式；在东南亚/中南半岛节点里偶有出现。
  { name: "老挝", flag: "🇱🇦", aliases: ["老挝", "LAO", "Laos", "Lao", "Vientiane", "万象"] },
  // 阿联酋常见命名方式。
  { name: "阿联酋", flag: "🇦🇪", aliases: ["阿联酋", "UAE", "AE", "ARE", "United Arab Emirates", "Dubai", "Abu Dhabi", "Sharjah", "迪拜", "阿布扎比", "沙迦"] },
  // 卡塔尔常见命名方式。
  { name: "卡塔尔", flag: "🇶🇦", aliases: ["卡塔尔", "QAT", "Qatar", "Doha", "多哈"] },
  // 科威特常见命名方式。
  { name: "科威特", flag: "🇰🇼", aliases: ["科威特", "KWT", "Kuwait", "Kuwait City", "科威特城"] },
  // 巴林常见命名方式；优先使用中文名、三位缩写与首都，减少 BH 误判。
  { name: "巴林", flag: "🇧🇭", aliases: ["巴林", "BHR", "Bahrain", "Manama", "麦纳麦"] },
  // 阿曼常见命名方式；优先使用中文名、三位缩写与首都，减少 OM 误判。
  { name: "阿曼", flag: "🇴🇲", aliases: ["阿曼", "OMN", "Oman", "Muscat", "马斯喀特"] },
  // 约旦常见命名方式；优先使用中文名、三位缩写与首都，减少 JO 误判。
  { name: "约旦", flag: "🇯🇴", aliases: ["约旦", "JOR", "Jordan", "Amman", "安曼"] },
  // 黎巴嫩常见命名方式；优先使用中文名、三位缩写与首都，减少 LB 误判。
  { name: "黎巴嫩", flag: "🇱🇧", aliases: ["黎巴嫩", "LBN", "Lebanon", "Beirut", "贝鲁特"] },
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
  // 巴拿马常见命名方式；中美洲/中转节点里偶尔会直接写 Panama City。
  { name: "巴拿马", flag: "🇵🇦", aliases: ["巴拿马", "PAN", "Panama", "Panama City", "巴拿马城"] },
  // 哥斯达黎加常见命名方式；中美洲机场偶尔会直接写 San Jose。
  { name: "哥斯达黎加", flag: "🇨🇷", aliases: ["哥斯达黎加", "CRI", "Costa Rica", "San Jose", "San José", "圣何塞"] },
  // 厄瓜多尔常见命名方式；南美节点里偶尔会直接写 Quito。
  { name: "厄瓜多尔", flag: "🇪🇨", aliases: ["厄瓜多尔", "ECU", "Ecuador", "Quito", "基多"] },
  // 智利常见命名方式；不使用容易误判的 CL 两位缩写。
  { name: "智利", flag: "🇨🇱", aliases: ["智利", "CHL", "Chile", "Santiago", "圣地亚哥"] },
  // 哥伦比亚常见命名方式；优先使用中文名、三位缩写与城市名，减少 CO 误判。
  { name: "哥伦比亚", flag: "🇨🇴", aliases: ["哥伦比亚", "COL", "Colombia", "Bogota", "Bogotá", "波哥大"] },
  // 秘鲁常见命名方式；优先使用中文名、三位缩写与城市名，减少 PE 误判。
  { name: "秘鲁", flag: "🇵🇪", aliases: ["秘鲁", "PER", "Peru", "Lima", "利马"] },
  // 巴拉圭常见命名方式；南美节点里偶尔会直接写 Asuncion。
  { name: "巴拉圭", flag: "🇵🇾", aliases: ["巴拉圭", "PRY", "Paraguay", "Asuncion", "Asunción", "亚松森"] },
  // 玻利维亚常见命名方式；优先使用中文名、三位缩写与常见城市名。
  { name: "玻利维亚", flag: "🇧🇴", aliases: ["玻利维亚", "BOL", "Bolivia", "La Paz", "Santa Cruz", "拉巴斯", "圣克鲁斯"] },
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
  // 利比亚常见命名方式；优先使用中文名、三位缩写与首都，减少 LY 误判。
  { name: "利比亚", flag: "🇱🇾", aliases: ["利比亚", "LBY", "Libya", "Tripoli", "的黎波里"] },
  // 突尼斯常见命名方式；优先使用中文名、三位缩写与首都，减少 TN 误判。
  { name: "突尼斯", flag: "🇹🇳", aliases: ["突尼斯", "TUN", "Tunisia", "Tunis", "突尼斯市"] },
  // 肯尼亚常见命名方式。
  { name: "肯尼亚", flag: "🇰🇪", aliases: ["肯尼亚", "KEN", "Kenya", "Nairobi", "内罗毕"] },
  // 以色列常见命名方式；不使用容易误判的 IL 两位缩写。
  { name: "以色列", flag: "🇮🇱", aliases: ["以色列", "ISR", "Israel", "Tel Aviv", "Jerusalem", "特拉维夫", "耶路撒冷"] },
  // 新西兰常见命名方式。
  { name: "新西兰", flag: "🇳🇿", aliases: ["新西兰", "NZ", "NZL", "New Zealand", "Auckland", "奥克兰"] },
  // 澳大利亚常见命名方式，这里用“袋鼠”作为显示名称。
  { name: "袋鼠", flag: "🇦🇺", aliases: ["澳大利亚", "澳洲", "袋鼠", "AU", "AUS", "Australia", "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "悉尼", "墨尔本", "布里斯班", "珀斯", "阿德莱德"] },
  // 俄罗斯常见命名方式，这里用“毛熊”作为显示名称。
  { name: "毛熊", flag: "🇷🇺", aliases: ["俄罗斯", "毛熊", "RU", "RUS", "Russia", "Moscow", "莫斯科"] }
];

// 区域分组定义：参考 GitHub 社区常见的“按亚洲/欧洲/美洲聚合国家组”玩法，但仅在用户显式开启 region-groups 时生成。
const REGION_GROUP_DEFINITIONS = Object.freeze([
  // key 是规范 token，name 是最终展示名，aliases 用于兼容 region-groups / prefer-countries 中的多种写法。
  // countryKeys 必须对应上面 COUNTRY_DEFINITIONS 里的 name；includeInAuto=false 表示它是“显式点名才生成”的细分区域，不会混进默认 all/auto 面板。
  {
    key: "asia",
    name: "🌏 亚洲节点",
    aliases: ["asia", "asian", "as", "亚洲区", "亚洲"],
    countryKeys: ["香港", "澳门", "台湾", "日本", "狮城", "韩国", "印度", "巴基斯坦", "孟加拉", "尼泊尔", "斯里兰卡", "哈萨克", "乌兹别克", "吉尔吉斯", "大马", "泰国", "越南", "菲律宾", "印尼", "柬埔寨", "文莱", "老挝", "亚美尼亚", "格鲁吉亚", "阿塞拜疆"]
  },
  {
    key: "greaterchina",
    name: "🀄 华语节点",
    aliases: ["greaterchina", "greater-china", "greatercn", "sinosphere", "华语", "大中华"],
    // 华语区这类细分区域默认不自动展开，避免旧布局在开启 region-groups 时突然膨胀。
    includeInAuto: false,
    countryKeys: ["香港", "澳门", "台湾"]
  },
  {
    key: "eastasia",
    name: "🌸 东亚节点",
    aliases: ["eastasia", "east-asia", "northeastasia", "northeast-asia", "cjk", "zh-jp-kr", "中日韩", "东北亚", "ea", "东亚"],
    includeInAuto: false,
    countryKeys: ["香港", "澳门", "台湾", "日本", "韩国"]
  },
  {
    key: "southeastasia",
    name: "🌴 东南亚节点",
    aliases: ["southeastasia", "south-east-asia", "sea", "seasia", "asean", "asean10", "asean-10", "东盟", "东南亚"],
    includeInAuto: false,
    countryKeys: ["狮城", "大马", "泰国", "越南", "菲律宾", "印尼", "柬埔寨", "文莱", "老挝"]
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
    // 这里把“毛熊”也归到欧洲大区，方便延续多数机场面板把 RU 视作欧线的常见习惯。
    countryKeys: ["英国", "德国", "法国", "荷兰", "意大利", "西班牙", "瑞士", "瑞典", "挪威", "芬兰", "丹麦", "葡萄牙", "爱尔兰", "比利时", "奥地利", "波兰", "卢森堡", "爱沙尼亚", "拉脱维亚", "立陶宛", "保加利亚", "克罗地亚", "斯洛伐克", "斯洛文尼亚", "捷克", "匈牙利", "罗马尼亚", "希腊", "乌克兰", "白俄罗斯", "冰岛", "塞尔维亚", "阿尔巴尼亚", "波黑", "黑山", "北马其顿", "摩尔多瓦", "塞浦路斯", "马耳他", "毛熊"]
  },
  {
    key: "westeurope",
    name: "🌤️ 西欧节点",
    aliases: ["westeurope", "west-europe", "weurope", "西欧"],
    includeInAuto: false,
    countryKeys: ["英国", "爱尔兰", "法国", "德国", "荷兰", "比利时", "卢森堡", "瑞士"]
  },
  {
    key: "easteurope",
    name: "🧊 东欧节点",
    aliases: ["easteurope", "east-europe", "eeurope", "东欧"],
    includeInAuto: false,
    countryKeys: ["波兰", "爱沙尼亚", "拉脱维亚", "立陶宛", "捷克", "斯洛伐克", "匈牙利", "罗马尼亚", "乌克兰", "白俄罗斯", "摩尔多瓦", "毛熊"]
  },
  {
    key: "iberia",
    name: "🍷 伊比利亚节点",
    aliases: ["iberia", "iberian", "iberianpeninsula", "伊比利亚"],
    includeInAuto: false,
    countryKeys: ["西班牙", "葡萄牙"]
  },
  {
    key: "benelux",
    name: "💎 比荷卢节点",
    aliases: ["benelux", "lowcountries", "比荷卢"],
    includeInAuto: false,
    countryKeys: ["荷兰", "比利时", "卢森堡"]
  },
  {
    key: "baltics",
    name: "🌊 波罗的海节点",
    aliases: ["baltics", "baltic", "balticstates", "baltic-states", "波罗的海", "波罗的海三国"],
    includeInAuto: false,
    countryKeys: ["爱沙尼亚", "拉脱维亚", "立陶宛"]
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
    key: "dach",
    name: "🏔️ DACH节点",
    aliases: ["dach", "de-at-ch", "德语区"],
    includeInAuto: false,
    countryKeys: ["德国", "奥地利", "瑞士"]
  },
  {
    key: "balkans",
    name: "🧭 巴尔干节点",
    aliases: ["balkans", "balkan", "south-eastern-europe", "巴尔干"],
    includeInAuto: false,
    countryKeys: ["希腊", "保加利亚", "罗马尼亚", "塞尔维亚", "阿尔巴尼亚", "波黑", "黑山", "北马其顿", "克罗地亚", "斯洛文尼亚"]
  },
  {
    key: "americas",
    name: "🌎 美洲节点",
    aliases: ["americas", "america", "amer", "美洲"],
    countryKeys: ["美国", "枫叶", "墨西哥", "巴拿马", "哥斯达黎加", "阿根廷", "巴西", "厄瓜多尔", "智利", "哥伦比亚", "秘鲁", "巴拉圭", "玻利维亚", "乌拉圭"]
  },
  {
    key: "northamerica",
    name: "🗽 北美节点",
    aliases: ["northamerica", "north-america", "naonly", "北美"],
    includeInAuto: false,
    countryKeys: ["美国", "枫叶", "墨西哥", "巴拿马", "哥斯达黎加"]
  },
  {
    key: "nafta",
    name: "🚚 北美自贸节点",
    aliases: ["nafta", "usmca", "usmca-region", "t-mec", "北美自贸", "美加墨"],
    includeInAuto: false,
    countryKeys: ["美国", "枫叶", "墨西哥"]
  },
  {
    key: "southamerica",
    name: "💃 南美节点",
    aliases: ["southamerica", "south-america", "saonly", "南美"],
    includeInAuto: false,
    countryKeys: ["阿根廷", "巴西", "厄瓜多尔", "智利", "哥伦比亚", "秘鲁", "巴拉圭", "玻利维亚", "乌拉圭"]
  },
  {
    key: "southerncone",
    name: "🧉 南锥体节点",
    aliases: ["southerncone", "southern-cone", "southcone", "cone-south", "南锥体"],
    includeInAuto: false,
    countryKeys: ["阿根廷", "智利", "巴拉圭", "乌拉圭"]
  },
  {
    key: "latam",
    name: "🌮 拉美节点",
    aliases: ["latam", "latinamerica", "latin-america", "latinamericas", "拉美", "拉丁美洲"],
    includeInAuto: false,
    countryKeys: ["墨西哥", "巴拿马", "哥斯达黎加", "阿根廷", "巴西", "厄瓜多尔", "智利", "哥伦比亚", "秘鲁", "巴拉圭", "玻利维亚", "乌拉圭"]
  },
  {
    key: "middleeast",
    name: "🕌 中东节点",
    aliases: ["middleeast", "middle-east", "me", "中东"],
    countryKeys: ["阿联酋", "沙特", "以色列", "卡塔尔", "科威特", "巴林", "阿曼", "约旦", "黎巴嫩", "土耳其"]
  },
  {
    key: "levant",
    name: "🧭 黎凡特节点",
    aliases: ["levant", "levantine", "eastmed", "东地中海", "黎凡特"],
    includeInAuto: false,
    countryKeys: ["以色列", "约旦", "黎巴嫩", "塞浦路斯", "土耳其"]
  },
  {
    key: "gulf",
    name: "🛢️ 海湾节点",
    aliases: ["gulf", "gcc", "gulfstates", "gulf-states", "海湾"],
    includeInAuto: false,
    countryKeys: ["阿联酋", "沙特", "卡塔尔", "科威特", "巴林", "阿曼"]
  },
  {
    key: "westasia",
    name: "🧿 西亚节点",
    aliases: ["westasia", "west-asia", "西亚"],
    includeInAuto: false,
    countryKeys: ["土耳其", "塞浦路斯", "约旦", "黎巴嫩", "以色列", "阿联酋", "巴林", "阿曼", "沙特", "卡塔尔", "科威特", "亚美尼亚", "格鲁吉亚", "阿塞拜疆"]
  },
  {
    key: "oceania",
    name: "🦘 大洋洲节点",
    aliases: ["oceania", "oceana", "oce", "pacific", "anz", "anzac", "澳新", "大洋洲"],
    countryKeys: ["袋鼠", "新西兰"]
  },
  {
    key: "apac",
    name: "🌏 亚太节点",
    aliases: ["apac", "asia-pacific", "asiapacific", "亚太"],
    includeInAuto: false,
    countryKeys: ["香港", "澳门", "台湾", "日本", "狮城", "韩国", "印度", "巴基斯坦", "孟加拉", "尼泊尔", "斯里兰卡", "哈萨克", "乌兹别克", "吉尔吉斯", "大马", "泰国", "越南", "菲律宾", "印尼", "柬埔寨", "文莱", "老挝", "袋鼠", "新西兰"]
  },
  {
    key: "anglosphere",
    name: "🌐 英语区节点",
    aliases: ["anglosphere", "englishworld", "english-world", "fiveeyes", "five-eyes", "五眼", "英语区"],
    includeInAuto: false,
    countryKeys: ["美国", "枫叶", "英国", "袋鼠", "新西兰"]
  },
  {
    key: "africa",
    name: "🌍 非洲节点",
    aliases: ["africa", "af", "非洲"],
    countryKeys: ["南非", "埃及", "尼日利亚", "摩洛哥", "阿尔及利亚", "利比亚", "突尼斯", "肯尼亚"]
  },
  {
    key: "northafrica",
    name: "🏜️ 北非节点",
    aliases: ["northafrica", "north-africa", "maghreb", "北非"],
    includeInAuto: false,
    countryKeys: ["埃及", "摩洛哥", "阿尔及利亚", "利比亚", "突尼斯"]
  },
  {
    key: "mena",
    name: "🏜️ 中东北非节点",
    aliases: ["mena", "middleeastnorthafrica", "middle-east-north-africa", "中东北非"],
    includeInAuto: false,
    countryKeys: ["阿联酋", "沙特", "以色列", "卡塔尔", "科威特", "巴林", "阿曼", "约旦", "黎巴嫩", "土耳其", "埃及", "摩洛哥", "阿尔及利亚", "利比亚", "突尼斯"]
  },
  {
    key: "mediterranean",
    name: "🌊 地中海节点",
    aliases: ["mediterranean", "mediterraneansea", "med-sea", "med", "地中海"],
    includeInAuto: false,
    countryKeys: ["西班牙", "葡萄牙", "意大利", "希腊", "塞浦路斯", "马耳他", "土耳其", "黎巴嫩", "以色列", "埃及", "摩洛哥", "阿尔及利亚", "突尼斯"]
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

// 从对象数组里稳定提取 `.name` 字段，统一处理空值/空白，避免多处重复写 filter + map 模板。
function collectNamedEntries(items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => isObject(item) && typeof item.name === "string" && item.name.trim())
    .map((item) => item.name.trim());
}

// 把多段组名/节点名引用统一拼成“可直接引用的名字列表”，并自动附带内置策略名。
function buildBuiltinAwareNameList() {
  const segments = Array.prototype.slice.call(arguments);
  const names = [];

  for (const segment of segments) {
    names.push.apply(names, toStringArray(segment));
  }

  return uniqueStrings(names.concat(BUILTIN_POLICY_NAMES));
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

// 常见的“参数优先 -> 配置字符串 -> 默认值”模板统一收口，避免 DNS / Kernel 等区域重复手写。
function resolveArgOrStringConfigValue(current, hasArgKey, argKey, configKey, defaultValue) {
  const source = isObject(current) ? current : {};
  return ARGS[hasArgKey]
    ? ARGS[argKey]
    : (typeof source[configKey] === "string" && source[configKey] ? source[configKey] : defaultValue);
}

// 常见的“参数优先 -> parseBool(配置值) -> 默认值”模板统一收口。
function resolveArgOrParsedBoolConfigValue(current, hasArgKey, argKey, configKey, defaultValue) {
  const source = isObject(current) ? current : {};
  return ARGS[hasArgKey]
    ? ARGS[argKey]
    : parseBool(source[configKey], defaultValue);
}

// 常见的“参数优先 -> 保留配置显式值 -> 默认值”模板统一收口，适合 number / boolean / 任意标量。
function resolveArgOrHasOwnConfigValue(current, hasArgKey, argKey, configKey, defaultValue) {
  const source = isObject(current) ? current : {};
  return ARGS[hasArgKey]
    ? ARGS[argKey]
    : (hasOwn(source, configKey) ? source[configKey] : defaultValue);
}

// 没有参数覆盖时，一些字段只需要“保留配置显式值，否则回落默认”，这里单独收口。
function resolveConfigOrDefaultValue(current, configKey, defaultValue) {
  const source = isObject(current) ? current : {};
  return hasOwn(source, configKey) ? source[configKey] : defaultValue;
}

// 常见的“只看配置字符串，否则回落默认值”模板统一收口。
function resolveConfigStringValue(current, configKey, defaultValue) {
  const source = isObject(current) ? current : {};
  return typeof source[configKey] === "string" && source[configKey] ? source[configKey] : defaultValue;
}

// 常见的“只看配置值并按布尔解析，否则回落默认值”模板统一收口。
function resolveConfigParsedBoolValue(current, configKey, defaultValue) {
  const source = isObject(current) ? current : {};
  return parseBool(source[configKey], defaultValue);
}

// buildDnsConfig 顶部这批标量字段都遵循同一套参数/配置回退策略，这里先定义化，减少平铺局部变量。
const DNS_SCALAR_RUNTIME_OPTION_DEFINITIONS = Object.freeze([
  { key: "cacheAlgorithm", value: (currentDns) => resolveArgOrStringConfigValue(currentDns, "hasDnsCacheAlgorithm", "dnsCacheAlgorithm", "cache-algorithm", "arc") },
  { key: "preferH3", value: (currentDns) => resolveArgOrParsedBoolConfigValue(currentDns, "hasDnsPreferH3", "dnsPreferH3", "prefer-h3", false) },
  { key: "respectRules", value: (currentDns) => resolveArgOrParsedBoolConfigValue(currentDns, "hasDnsRespectRules", "dnsRespectRules", "respect-rules", false) },
  { key: "useHosts", value: (currentDns) => resolveConfigParsedBoolValue(currentDns, "use-hosts", true) },
  { key: "useSystemHosts", value: (currentDns) => resolveArgOrParsedBoolConfigValue(currentDns, "hasDnsUseSystemHosts", "dnsUseSystemHosts", "use-system-hosts", true) },
  { key: "listen", value: (currentDns) => resolveArgOrStringConfigValue(currentDns, "hasDnsListen", "dnsListen", "listen", ":1053") },
  { key: "fakeIpFilterMode", value: (currentDns) => resolveArgOrStringConfigValue(currentDns, "hasFakeIpFilterMode", "fakeIpFilterMode", "fake-ip-filter-mode", "blacklist") },
  { key: "fakeIpRange", value: (currentDns) => resolveArgOrStringConfigValue(currentDns, "hasFakeIpRange", "fakeIpRange", "fake-ip-range", "198.18.0.1/16") },
  { key: "directNameserverFollowPolicy", value: (currentDns) => resolveConfigParsedBoolValue(currentDns, "direct-nameserver-follow-policy", true) }
]);

// DNS 顶部那批纯标量 runtime 选项统一通过 definitions 装配，避免 buildDnsConfig 再继续堆平行常量。
function buildDnsScalarRuntimeOptions(currentDns) {
  return buildDefinitionDrivenPayload(DNS_SCALAR_RUNTIME_OPTION_DEFINITIONS, currentDns);
}

// DNS 里少量“满足条件才写回”的可选标量统一定义化，避免 buildDnsConfig 尾段继续保留多段 if/else 模板。
const DNS_OPTIONAL_SCALAR_DEFINITIONS = Object.freeze([
  {
    key: "fake-ip-range6",
    value: (currentDns) => {
      if (ARGS.hasFakeIpRange6) {
        return ARGS.fakeIpRange6;
      }
      if (typeof currentDns["fake-ip-range6"] === "string" && currentDns["fake-ip-range6"]) {
        return currentDns["fake-ip-range6"];
      }
      return ARGS.ipv6 ? "fdfe:dcba:9876::1/64" : undefined;
    }
  },
  {
    key: "fake-ip-ttl",
    value: (currentDns) => (ARGS.hasFakeIpTtl || hasOwn(currentDns, "fake-ip-ttl"))
      ? (ARGS.hasFakeIpTtl ? ARGS.fakeIpTtl : currentDns["fake-ip-ttl"])
      : undefined
  }
]);

// 只把 value !== undefined 的定义结果写入 payload，适合 DNS 这类“可选写回”的字段装配。
function buildOptionalDefinitionDrivenPayload(definitions, context) {
  const source = Array.isArray(definitions) ? definitions : [];
  const payload = {};

  for (const definition of source) {
    const key = normalizeStringArg(definition && definition.key);
    if (!key || typeof (definition && definition.value) !== "function") {
      continue;
    }

    const value = definition.value(context);
    if (typeof value !== "undefined") {
      payload[key] = value;
    }
  }

  return payload;
}

// DNS 尾段这些可选标量统一通过 definitions 装配，避免 buildDnsConfig 再保留多段条件写回模板。
function buildDnsOptionalScalarOptions(currentDns) {
  return buildOptionalDefinitionDrivenPayload(DNS_OPTIONAL_SCALAR_DEFINITIONS, currentDns);
}

// DNS 里很多列表都遵循“默认值在前 + 用户当前值在后 + 去重”的同一模板，这里统一收口。
function mergeDefaultStringEntries(defaultEntries, currentEntries) {
  return uniqueStrings(toStringArray(defaultEntries).concat(toStringArray(currentEntries)));
}

// buildDnsConfig 里多组 nameserver 列表只是默认来源不同，这里集中成 definitions，避免尾段继续平铺赋值模板。
const DNS_DEFAULT_STRING_LIST_DEFINITIONS = Object.freeze([
  {
    key: "default-nameserver",
    value: (context) => mergeDefaultStringEntries([
      "223.5.5.5",
      "119.29.29.29"
    ], context.currentDns["default-nameserver"])
  },
  { key: "nameserver", value: (context) => mergeDefaultStringEntries(context.domesticNameservers, context.currentDns.nameserver) },
  { key: "fallback", value: (context) => mergeDefaultStringEntries(context.fallbackNameservers, context.currentDns.fallback) },
  {
    key: "proxy-server-nameserver",
    value: (context) => mergeDefaultStringEntries(
      context.fallbackNameservers.concat(context.domesticNameservers),
      context.currentDns["proxy-server-nameserver"]
    )
  },
  { key: "direct-nameserver", value: (context) => mergeDefaultStringEntries(context.domesticNameservers, context.currentDns["direct-nameserver"]) }
]);

// 批量装配 DNS 默认字符串列表，确保默认值始终在前、用户原值在后，并统一去重。
function buildDnsDefaultStringListPayload(context) {
  return buildDefinitionDrivenPayload(DNS_DEFAULT_STRING_LIST_DEFINITIONS, isObject(context) ? context : {});
}

// DNS policy 这类 pair-definition 只是目标字段和默认 policy 来源不同，这里统一构造，减少 definitions 内联函数重复。
function createDnsPolicyMergeDefinition(key, policySourceKey) {
  return {
    key,
    value: (context) => mergeDnsPolicyMaps(
      context[policySourceKey],
      context.currentDns[key]
    )
  };
}

// nameserver-policy 与 proxy-server-nameserver-policy 都遵循“默认 policy + 用户 policy”的同构模板，也统一定义化。
const DNS_POLICY_MERGE_DEFINITIONS = Object.freeze([
  createDnsPolicyMergeDefinition("nameserver-policy", "nameserverPolicy"),
  createDnsPolicyMergeDefinition("proxy-server-nameserver-policy", "proxyServerNameserverPolicy")
]);

// 批量装配 DNS policy 字段，避免 buildDnsConfig 尾段再平铺两段近似的 mergeDnsPolicyMaps。
function buildDnsPolicyPayload(context) {
  return buildDefinitionDrivenPayload(DNS_POLICY_MERGE_DEFINITIONS, isObject(context) ? context : {});
}

// 默认 nameserver-policy 模板本体在主 DNS 与 proxy-server DNS 两侧完全同构，这里统一成共享 builder。
function buildDefaultDnsNameserverPolicy(domesticNameservers, fallbackNameservers) {
  return {
    "geosite:cn,private,apple,steam@cn,microsoft": domesticNameservers,
    "geosite:geolocation-!cn,gfw,google,youtube,telegram,openai,anthropic,google-gemini": fallbackNameservers
  };
}

// buildDnsRuntimeContext 里这两组默认 nameserver 列表是稳定常量，提前提升避免每次都内联构造。
const DNS_DEFAULT_DOMESTIC_NAMESERVERS = Object.freeze([
  "https://dns.alidns.com/dns-query",
  "https://doh.pub/dns-query"
]);

// fallback nameserver 面向非中国/被墙场景，默认采用公共 DoH 服务。
const DNS_DEFAULT_FALLBACK_NAMESERVERS = Object.freeze([
  "https://1.1.1.1/dns-query",
  "https://8.8.8.8/dns-query"
]);

// DNS runtime context 第一层是基础选项与默认 nameserver 列表；这批字段不依赖 policy 派生值，先单独装配。
const DNS_RUNTIME_BASE_CONTEXT_DEFINITIONS = Object.freeze([
  { key: "scalarOptions", value: (context) => buildDnsScalarRuntimeOptions(context.currentDns) },
  { key: "optionalScalarOptions", value: (context) => buildDnsOptionalScalarOptions(context.currentDns) },
  { key: "domesticNameservers", value: () => DNS_DEFAULT_DOMESTIC_NAMESERVERS.slice() },
  { key: "fallbackNameservers", value: () => DNS_DEFAULT_FALLBACK_NAMESERVERS.slice() }
]);

// 两个 policy context 字段完全同构，只是输出 key 不同，这里统一构造避免 definitions 内重复。
function createDnsRuntimePolicyContextDefinition(key) {
  return {
    key,
    value: (context) => buildDefaultDnsNameserverPolicy(context.domesticNameservers, context.fallbackNameservers)
  };
}

// DNS runtime context 第二层是基于 nameserver 列表派生的 policy 字段，单独装配后依赖关系更直观。
const DNS_RUNTIME_POLICY_CONTEXT_DEFINITIONS = Object.freeze([
  createDnsRuntimePolicyContextDefinition("nameserverPolicy"),
  createDnsRuntimePolicyContextDefinition("proxyServerNameserverPolicy")
]);

// buildDnsConfig 尾段这批 current/default/policy 数据始终成组流动，这里统一打包成 runtime context，减少调用点重复装配。
function buildDnsRuntimeContext(existingDns) {
  const currentDns = isObject(existingDns) ? existingDns : {};
  const baseContext = Object.assign(
    { currentDns },
    buildDefinitionDrivenPayload(DNS_RUNTIME_BASE_CONTEXT_DEFINITIONS, { currentDns })
  );

  return Object.assign(
    baseContext,
    buildDefinitionDrivenPayload(DNS_RUNTIME_POLICY_CONTEXT_DEFINITIONS, baseContext)
  );
}

// fallback-filter 固定遵循“默认对象 + geosite/domain/ipcidr 三段补齐”的模板，这里单独抽出便于复用。
function buildDnsFallbackFilter(currentFallbackFilter) {
  const fallbackFilter = mergeObjects(
    {
      geoip: true,
      "geoip-code": "CN",
      geosite: ["gfw"],
      domain: ["+.google.com", "+.facebook.com", "+.youtube.com"],
      ipcidr: ["240.0.0.0/4"]
    },
    currentFallbackFilter
  );

  fallbackFilter.geosite = mergeDefaultStringEntries(["gfw"], fallbackFilter.geosite);
  fallbackFilter.domain = mergeDefaultStringEntries([
    "+.google.com",
    "+.facebook.com",
    "+.youtube.com"
  ], fallbackFilter.domain);
  fallbackFilter.ipcidr = mergeDefaultStringEntries(["240.0.0.0/4"], fallbackFilter.ipcidr);
  return fallbackFilter;
}

// Kernel 默认项里的标量回退规则也统一定义化，后续加字段时不必再扩一串局部变量。
const KERNEL_DEFAULT_SCALAR_DEFINITIONS = Object.freeze([
  { key: "mode", value: (currentConfig) => resolveConfigStringValue(currentConfig, "mode", "rule") },
  { key: "globalUa", value: (currentConfig) => resolveArgOrStringConfigValue(currentConfig, "hasGlobalUa", "globalUa", "global-ua", "clash.meta") },
  { key: "geoAutoUpdate", value: (currentConfig) => resolveArgOrParsedBoolConfigValue(currentConfig, "hasGeoAutoUpdate", "geoAutoUpdate", "geo-auto-update", false) },
  { key: "geoUpdateInterval", value: (currentConfig) => resolveArgOrHasOwnConfigValue(currentConfig, "hasGeoUpdateInterval", "geoUpdateInterval", "geo-update-interval", 24) },
  { key: "processMode", value: (currentConfig) => resolveArgOrStringConfigValue(currentConfig, "hasProcessMode", "processMode", "find-process-mode", "strict") },
  { key: "geodataMode", value: (currentConfig) => resolveArgOrParsedBoolConfigValue(currentConfig, "hasGeodataMode", "geodataMode", "geodata-mode", true) },
  { key: "geodataLoader", value: (currentConfig) => resolveArgOrStringConfigValue(currentConfig, "hasGeodataLoader", "geodataLoader", "geodata-loader", "memconservative") },
  { key: "etagSupport", value: (currentConfig) => resolveConfigParsedBoolValue(currentConfig, "etag-support", true) },
  { key: "keepAliveIdle", value: (currentConfig) => resolveConfigOrDefaultValue(currentConfig, "keep-alive-idle", 15) },
  { key: "keepAliveInterval", value: (currentConfig) => resolveConfigOrDefaultValue(currentConfig, "keep-alive-interval", 15) },
  { key: "disableKeepAlive", value: (currentConfig) => resolveConfigOrDefaultValue(currentConfig, "disable-keep-alive", false) },
  { key: "tcpConcurrent", value: (currentConfig) => resolveConfigOrDefaultValue(currentConfig, "tcp-concurrent", true) }
]);

// Kernel 默认项里这批标量字段集中装配，避免 buildKernelDefaults 里继续保留多段近似 fallback 模板。
function buildKernelDefaultScalarOptions(currentConfig) {
  return buildDefinitionDrivenPayload(KERNEL_DEFAULT_SCALAR_DEFINITIONS, currentConfig);
}

// buildKernelDefaults 末尾只是把准备好的运行时值投影成固定输出键，这里集中成 definitions，减少平铺对象模板。
const KERNEL_DEFAULT_OUTPUT_DEFINITIONS = Object.freeze([
  { key: "mode", value: (context) => context.mode },
  { key: "global-ua", value: (context) => context.globalUa },
  { key: "find-process-mode", value: (context) => context.processMode },
  { key: "geodata-mode", value: (context) => context.geodataMode },
  { key: "geodata-loader", value: (context) => context.geodataLoader },
  { key: "geo-auto-update", value: (context) => context.geoAutoUpdate },
  { key: "geo-update-interval", value: (context) => context.geoUpdateInterval },
  { key: "geox-url", value: (context) => context.geoxUrl },
  { key: "etag-support", value: (context) => context.etagSupport },
  { key: "keep-alive-idle", value: (context) => context.keepAliveIdle },
  { key: "keep-alive-interval", value: (context) => context.keepAliveInterval },
  { key: "disable-keep-alive", value: (context) => context.disableKeepAlive },
  { key: "tcp-concurrent", value: (context) => context.tcpConcurrent }
]);

// 按固定顺序装配 Kernel 默认项输出，避免 buildKernelDefaults 主体里保留一大段静态投影。
function buildKernelDefaultOutputPayload(context) {
  return buildDefinitionDrivenPayload(KERNEL_DEFAULT_OUTPUT_DEFINITIONS, context);
}

// Sniffer 顶层布尔开关完全同构，这里单独定义化，避免继续保留三段相同 resolver 调用。
const SNIFFER_SCALAR_OPTION_DEFINITIONS = Object.freeze([
  { key: "forceDnsMapping", value: (currentSniffer) => resolveArgOrParsedBoolConfigValue(currentSniffer, "hasSnifferForceDnsMapping", "snifferForceDnsMapping", "force-dns-mapping", true) },
  { key: "parsePureIp", value: (currentSniffer) => resolveArgOrParsedBoolConfigValue(currentSniffer, "hasSnifferParsePureIp", "snifferParsePureIp", "parse-pure-ip", true) },
  { key: "overrideDestination", value: (currentSniffer) => resolveArgOrParsedBoolConfigValue(currentSniffer, "hasSnifferOverrideDestination", "snifferOverrideDestination", "override-destination", false) }
]);

// Sniffer 顶层布尔选项统一装配，保持 buildSnifferConfig 更聚焦在协议表和域名列表拼装。
function buildSnifferScalarOptions(currentSniffer) {
  return buildDefinitionDrivenPayload(SNIFFER_SCALAR_OPTION_DEFINITIONS, currentSniffer);
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
  // 先把用户输入统一裁剪、去连接符并折叠成内部比较用 token。
  const normalized = normalizeGroupMarkerToken(value);

  // 空值、default、script 都表示“继续沿用脚本默认布局预设”。
  if (!normalized || ["default", "script"].includes(normalized)) {
    return defaultPreset;
  }

  // 其余情况只接受缓存好的社区别名；未命中时安全回退默认预设。
  return GROUP_ORDER_PRESET_ALIAS_MAP[normalized] || defaultPreset;
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
  // 统一把解析结果拆成“成功映射 / 非法输入 / 未知国家标记”三部分，方便后续日志直接消费。
  const result = {
    map: Object.create(null),
    invalidEntries: [],
    unknownCountryMarkers: []
  };
  // 先把各种输入形态摊平成原始文本条目，再走统一解析流程。
  const rawEntries = [];

  if (typeof value === "string") {
    // 字符串支持换行、分号与双竖线分隔，兼容 URL 参数和多行配置。
    rawEntries.push(...value.split(/(?:\r?\n|;|；|\|\|)+/));
  } else if (Array.isArray(value)) {
    // 数组模式直接逐项转字符串。
    rawEntries.push(...value.map((item) => String(item || "")));
  } else if (isObject(value)) {
    // 对象模式会把 { 国家: [别名] } 重新拼回统一的 `国家:别名1|别名2` 语法。
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

    // 允许 `:` / `：` / `=` 作为国家与别名列表的分隔符。
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

    // 解析 country-extra-aliases 时 ARGS 还没初始化完成，所以这里显式把“本轮已解析出的别名映射”传进去，
    // 既能避免触发 ARGS 的 TDZ，也能让同一批配置里的前序别名立即参与后续国家匹配。
    const definition = findCountryDefinitionByMarker(countryMarker, result.map);
    if (!definition) {
      result.unknownCountryMarkers.push(countryMarker);
      continue;
    }

    // 映射时统一收敛到国家定义的标准 name，避免同一国家被多种 marker 拆成多份配置。
    result.map[definition.name] = uniqueStrings((result.map[definition.name] || []).concat(aliases));
  }

  // 最终再做一次去重，保证日志与响应头输出稳定。
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

  // 这些上限主要用于 full 日志与响应头预览，默认偏保守，避免输出过长。
  const countryLimit = Number.isFinite(maxCountries) && maxCountries > 0 ? Math.floor(maxCountries) : 4;
  const aliasLimit = Number.isFinite(maxAliasesPerCountry) && maxAliasesPerCountry > 0 ? Math.floor(maxAliasesPerCountry) : 2;
  const aliasNameLimit = Number.isFinite(maxAliasLength) && maxAliasLength > 4 ? Math.floor(maxAliasLength) : 18;
  const visibleCountries = countryNames.slice(0, countryLimit).map((countryName) => {
    const aliases = uniqueStrings(
      (Array.isArray(source[countryName]) ? source[countryName] : [])
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    );
    // 每个国家只展示前若干个别名，并对超长别名做截断。
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
  // 冲突预览同样只展示少量样本，避免调试头被长文本撑爆。
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
  // 先统一收集候选条目，再逐条解析成 pattern/target。
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
      // 对象模式直接读取字段，更适合脚本内结构化传参。
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

    // 用 `pattern=>target` 作为去重键，避免重复规则多次命中。
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
  // win 表示“最终值来自哪一路”；override 表示“更高优先级覆盖了较低优先级的同名键”。
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

    // 按最终合并优先级判断赢家：$arguments > $options > query。
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

    // 下列计数只关心“多路同时声明同名键”这种覆盖关系，与赢家是谁分开统计。
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
  // 先把路径切成已解码的段，后续所有路由识别都基于它。
  const segments = pathname
    .split("/")
    .map((segment) => safeDecodeUriComponent(segment).trim())
    .filter(Boolean);

  if (!segments.length) {
    return { routeKind: "", routeName: "", routePath: pathname };
  }

  if (/^download$/i.test(segments[0]) && segments[1]) {
    // `/download/<name>`：最常见的下载路由。
    return {
      routeKind: "download",
      routeName: segments[1],
      routePath: pathname
    };
  }

  if (/^share$/i.test(segments[0]) && segments[1]) {
    // `/share/<name>`：分享页路由。
    return {
      routeKind: "share",
      routeName: segments[1],
      routePath: pathname
    };
  }

  if (/^api$/i.test(segments[0]) && /^file$/i.test(segments[1] || "") && segments[2]) {
    // `/api/file/<name>`：API 文件导出路由。
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
  // 这些字段对应 Sub-Store 官方下载链接里常见的保留参数。
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
    // hasXxx 代表“用户是否显式传了该参数”，与最终标准化结果分开保存，方便做诊断。
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
  // 很多 query 参数只有在存在远程订阅源时才真正有意义。
  const hasRemoteSource = hasRemoteRuntimeLinkSource(source);

  if (source.hasUrl && source.urlKind === "local-node") {
    warnings.push("当前链接里的 url 不是 http(s)；按 Sub-Store 官方说明它会被视为单条本地节点内容，而不是远程订阅地址");
  }

  if (source.hasMergeSources) {
    if (!source.mergeSourcesNormalized) {
      warnings.push(`mergeSources=${source.mergeSources} 仅支持 ${RUNTIME_LINK_MERGE_SOURCE_VALUES.join(" / ")}`);
    }

    // mergeSources 只有在 url 与 content 同时存在时才需要参与决策。
    if (!(source.hasUrl && source.hasContent)) {
      warnings.push("mergeSources 仅在同时传入 url 与 content 时才有实际意义");
    }
  }

  if (source.hasProduceType && !source.produceTypeNormalized) {
    warnings.push(`produceType=${source.produceType} 仅支持 ${RUNTIME_LINK_PRODUCE_TYPE_VALUES.join(" / ")}`);
  }

  if (source.hasUrl && source.hasContent && !source.hasMergeSources) {
    // 双源同时存在但没声明合并策略时，最容易造成“结果与预期不一致”。
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

  // 最终去重，避免同一语义问题从多个分支重复报出。
  return uniqueStrings(warnings);
}

// 解析当前运行环境里的目标平台信息，优先使用官方上下文字段。
function resolveRuntimeContext(rawOptions) {
  const options = isObject(rawOptions) ? rawOptions : {};
  // 官方运行时通常把请求信息挂在 `_req` 上；这里全部兜底成对象，避免宿主差异导致报错。
  const request = isObject(options._req) ? options._req : {};
  const requestQuery = getRuntimeRequestQuery(options);
  const requestHeaders = isObject(request.headers) ? request.headers : {};
  const requestParams = isObject(request.params) ? request.params : {};
  const requestUrl = normalizeStringArg(request.url);
  const requestPath = normalizeStringArg(request.path);
  // path 和完整 url 都可能包含有效路由信息，这里两边都尝试识别，再优先采用 path 结果。
  const routeInfoFromPath = extractRouteInfoFromLocation(requestPath);
  const routeInfoFromUrl = extractRouteInfoFromLocation(requestUrl);
  const routeInfo = routeInfoFromPath.routeKind ? routeInfoFromPath : routeInfoFromUrl;
  const requestParamsTarget = normalizeStringArg(requestParams.target || requestParams.platform || "");
  const routeTarget = getRuntimeRouteTarget(request);
  const queryTarget = normalizeStringArg(requestQuery.target || requestQuery.platform || "");
  // target 优先级：宿主显式 targetPlatform > 运行 options > 路由 > query。
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
  // UA 主要用于日志与链路语义诊断，不参与策略逻辑。
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

// country-extra-aliases 需要在 ARGS 完成解析前后都可安全访问，这里单独维护一份运行态别名映射，避免 helper 提前触发 ARGS 的 TDZ。
let COUNTRY_EXTRA_ALIAS_RUNTIME_MAP = Object.create(null);

// 读取某个国家定义对应的“用户自定义额外别名”，便于把运行参数也纳入国家识别。
// aliasMap 可选：解析阶段传入临时映射，运行阶段则回落到全局缓存。
function getCountryExtraAliases(countryName, aliasMap) {
  const source = isObject(aliasMap) ? aliasMap : COUNTRY_EXTRA_ALIAS_RUNTIME_MAP;
  return uniqueStrings(source[countryName]);
}

// 统一收集某个国家定义里“脚本内置”的可识别标记：旗帜、显示名、内置别名。
function getBuiltInCountryDefinitionMarkers(country) {
  if (!isObject(country)) {
    return [];
  }

  return uniqueStrings([country.flag, country.name].concat(country.aliases || []));
}

// 统一收集某个国家定义的全部可识别标记：旗帜、显示名、内置别名、运行参数追加别名。
function getCountryDefinitionMarkers(country, aliasMap) {
  if (!isObject(country)) {
    return [];
  }

  // aliasMap 存在时优先用本轮临时映射；否则退回运行态缓存，保证“解析期”和“正式运行期”看到的额外别名都一致。
  // 这样 findCountryDefinitionByMarker 在解析 country-extra-aliases 自身时，也能逐步吸收前面已经识别成功的国家别名。
  return uniqueStrings(getBuiltInCountryDefinitionMarkers(country).concat(getCountryExtraAliases(country.name, aliasMap)));
}

// 分析 country-extra-aliases 是否存在“一个别名指向多个国家”或“撞到别的内置国家标记”的冲突。
function analyzeCountryExtraAliasMap(aliasMap) {
  const source = isObject(aliasMap) ? aliasMap : {};
  // 第一类冲突：多个国家同时声明了同一个自定义别名。
  const customTokenOwners = Object.create(null);
  const customDuplicateConflicts = [];
  // 第二类冲突：用户自定义别名撞上了其他国家定义里已内置的 marker。
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
      // 这里先记 owner，不立即报错，方便后面统一做去重与汇总。
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

        // 只要命中“别的国家”的任一内置 marker，就视为潜在识别冲突。
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
// aliasMap 可选：用于 country-extra-aliases 解析早期，把“尚未落到 ARGS 上的临时别名”一并纳入匹配。
function findCountryDefinitionByMarker(marker, aliasMap) {
  const token = normalizeGroupMarkerToken(marker);
  if (!token) {
    return null;
  }

  for (const definition of COUNTRY_DEFINITIONS) {
    const markers = getCountryDefinitionMarkers(definition, aliasMap);
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

// 实际构造区域分组别名表的底层 helper；单独拆出来是为了把结果缓存到顶层常量里。
function buildRegionGroupAliasMap() {
  const aliasMap = {};

  // 逐个遍历区域定义，把 asia / eastasia / europe / gulf 这类 token 全部映射到最终展示组名。
  for (const definition of REGION_GROUP_DEFINITIONS) {
    // 一个区域定义可能带多种别名写法，这里统一全部吸收进 alias map。
    for (const marker of getRegionGroupDefinitionMarkers(definition)) {
      const token = normalizeGroupMarkerToken(marker);
      // 空 token 或已被更早定义占用的 token 都跳过，避免脏数据与重复覆盖。
      if (!token || hasOwn(aliasMap, token)) {
        continue;
      }

      aliasMap[token] = definition.name;
    }
  }

  return aliasMap;
}

// 顶层缓存区域分组别名，避免 group-order / prefer-groups 每次解析都重跑整份区域定义。
const REGION_GROUP_ALIAS_MAP = Object.freeze(buildRegionGroupAliasMap());

// 对外继续保留旧 helper 名称，调用点不用改；内部实际直接返回缓存对象。
function createRegionGroupAliasMap() {
  return REGION_GROUP_ALIAS_MAP;
}

// 解析 region-groups / continent-groups 参数，支持布尔、字符串、数组、对象与 JSON 字符串。
function parseRegionGroupKeys(value) {
  // allKeys 表示“默认自动启用”的全部区域组；includeInAuto=false 的定义不会自动进入这里。
  const allKeys = REGION_GROUP_DEFINITIONS
    .filter((definition) => definition && definition.includeInAuto !== false)
    .map((definition) => definition.key);
  const enabledKeys = [];
  const invalidTokens = [];
  // 布尔语义关键字用于兼容 `region-groups=true/all/default` 这类简写。
  const truthyTokens = ["true", "1", "yes", "y", "on", "all", "auto", "default"];
  const falsyTokens = ["false", "0", "no", "n", "off", "none", "disable", "disabled"];
  const pushByToken = (token) => {
    const normalized = normalizeStringArg(token);
    if (!normalized) {
      return;
    }

    const definition = findRegionGroupDefinitionByToken(normalized);
    if (definition) {
      // 一旦命中定义，统一收敛到标准 key，便于后面稳定去重。
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
      // true/all/default 等价于启用所有自动区域组。
      enabledKeys.push.apply(enabledKeys, allKeys);
      return;
    }

    if (falsyTokens.includes(normalized)) {
      // false/off/none 直接表示禁用，不记为错误输入。
      return;
    }

    if (/^[\[{]/.test(source)) {
      try {
        // 字符串里若看起来像 JSON，就递归复用本函数解析。
        const parsed = JSON.parse(source);
        const nested = parseRegionGroupKeys(parsed);
        enabledKeys.push.apply(enabledKeys, nested.keys);
        invalidTokens.push.apply(invalidTokens, nested.invalidTokens);
        return;
      } catch (error) {
        // JSON 解析失败时继续按普通分隔字符串处理。
      }
    }

    // 普通字符串则按常见分隔符拆开逐项解析。
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
    // 数组允许混合“整段字符串”和“单个 token”两类输入。
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
    // 对象模式仅采纳值为 truthy 的键，便于写成 `{ asia: true, europe: false }`。
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

// 统一管理运行期 warning：保留原始文案格式，同时自动去重完全相同的警告，减少单次执行内的重复刷屏。
let RUNTIME_WARNING_ONCE_MAP = Object.create(null);

function resetRuntimeWarningState() {
  RUNTIME_WARNING_ONCE_MAP = Object.create(null);
}

function emitWarning(message, options) {
  const rawText = message === undefined || message === null
    ? ""
    : String(message);
  const normalizedText = normalizeStringArg(rawText);
  const currentOptions = isObject(options) ? options : {};
  const onceKey = normalizeStringArg(currentOptions.onceKey || normalizedText);
  const shouldDedup = currentOptions.once !== false
    && !!onceKey
    && /^⚠️/.test(normalizedText);

  if (!normalizedText) {
    return;
  }

  if (shouldDedup && RUNTIME_WARNING_ONCE_MAP[onceKey]) {
    return;
  }

  if (shouldDedup) {
    RUNTIME_WARNING_ONCE_MAP[onceKey] = true;
  }

  console.warn(rawText);
}

// 批量 warning 最终都落成“遍历列表 -> 生成文案 -> emitWarning”这同一套流程，这里统一收口。
function emitWarningList(items, formatter, options) {
  const source = Array.isArray(items) ? items : [];
  const formatCurrent = typeof formatter === "function"
    ? formatter
    : (item) => `${item}`;

  for (let index = 0; index < source.length; index += 1) {
    const message = formatCurrent(source[index], index, source);
    if (!normalizeStringArg(message)) {
      continue;
    }

    emitWarning(message, options);
  }
}

// 多类“某参数的某些条目无效/冲突”告警都只是描述语不同，这里统一成共享 helper。
function emitInvalidEntryWarnings(argLabel, items, description) {
  const normalizedLabel = normalizeStringArg(argLabel);
  const normalizedDescription = normalizeStringArg(description);
  if (!normalizedLabel || !normalizedDescription) {
    return;
  }

  emitWarningList(items, (item) => `⚠️ 警告: ${normalizedLabel} ${normalizedDescription}: ${item}`);
}

// 这类“原始值存在且最终被 clamp/兜底修正”的告警模板在 resolveArgs 里大量出现，这里统一成共享 helper。
function warnAdjustedNumericArg(rawValue, parsedValue, finalValue, argLabel) {
  if (rawValue === undefined || parsedValue === finalValue) {
    return;
  }

  emitWarning(`⚠️ 警告: ${argLabel} 无效，已重置为 ${finalValue}`);
}

// 这类“枚举值非法，最终回退到规范值”的告警也统一收口，减少 mode/type/position 这类参数的重复模板。
function warnNormalizedChoiceArg(rawValue, finalValue, argLabel) {
  if (rawValue === undefined || normalizeStringArg(rawValue).toLowerCase() === finalValue) {
    return;
  }

  emitWarning(`⚠️ 警告: ${argLabel} 无效，已重置为 ${finalValue}`);
}

// expected-status 三类提示文案完全同构，只是参数名不同，这里统一收口。
function warnInvalidExpectedStatusArg(rawValue, normalizedValue, finalValue, argLabel) {
  if (rawValue === undefined || !normalizedValue || finalValue) {
    return;
  }

  emitWarning(`⚠️ 警告: ${argLabel} 语法无效，已回退为默认值`);
}

// icon / interface-name 这种“传了值但规范化后为空”的提示模板一致，也抽成 helper。
function warnIgnoredEmptyStringArg(rawValue, finalValue, argLabel) {
  if (rawValue === undefined || finalValue) {
    return;
  }

  emitWarning(`⚠️ 警告: ${argLabel} 为空，已忽略`);
}

// routing-mark 统一只接受 >=0 的整数；各服务提示文案一致，这里复用同一 helper。
function warnIgnoredRoutingMarkArg(rawValue, finalValue, argLabel) {
  if (rawValue === undefined || finalValue !== null) {
    return;
  }

  emitWarning(`⚠️ 警告: ${argLabel} 仅支持大于等于 0 的整数，已忽略`);
}

// strategy 参数本身非法时会回退默认值；这类提示在 GitHub / Steam / Dev 三组里完全同构。
function warnInvalidStrategyArg(rawValue, finalValue, argLabel) {
  if (rawValue === undefined || finalValue) {
    return;
  }

  emitWarning(`⚠️ 警告: ${argLabel} 无效，已回退为默认策略`);
}

// strategy 只有 load-balance 组才生效；GitHub / Steam / Dev 三组提示模板一致，这里统一收敛。
function warnIneffectiveStrategyArg(rawValue, finalValue, typeValue, strategyLabel, typeLabel) {
  if (rawValue === undefined || !finalValue || typeValue === "load-balance") {
    return;
  }

  emitWarning(`⚠️ 警告: ${strategyLabel} 仅在 ${typeLabel}=load-balance 时生效`);
}

// GitHub / Steam / Dev 在 resolveArgs 里会经历同一套“原始值 -> 规范化值 -> 告警状态 -> 返回字段”流程，这里统一收口。
function buildResolveArgServiceState(payload) {
  const current = isObject(payload) ? payload : {};
  const key = normalizeStringArg(current.key).toLowerCase();
  const rawNormalizedExpectedStatus = normalizeExpectedStatusArg(current.rawGroupExpectedStatus);
  const parsedGroupInterval = parseNumber(current.rawGroupInterval, GROUP_INTERVAL);
  const parsedGroupTolerance = parseNumber(current.rawGroupTolerance, GROUP_TOLERANCE);
  const parsedGroupTimeout = parseNumber(current.rawGroupTimeout, GROUP_TIMEOUT);
  const parsedGroupMaxFailedTimes = parseNumber(current.rawGroupMaxFailedTimes, GROUP_MAX_FAILED_TIMES);

  return {
    key,
    rawTestUrl: current.rawTestUrl,
    testUrl: normalizeStringArg(current.rawTestUrl),
    rawGroupInterval: current.rawGroupInterval,
    parsedGroupInterval,
    groupInterval: Math.max(1, parsedGroupInterval),
    rawGroupTolerance: current.rawGroupTolerance,
    parsedGroupTolerance,
    groupTolerance: Math.max(0, parsedGroupTolerance),
    rawGroupTimeout: current.rawGroupTimeout,
    parsedGroupTimeout,
    groupTimeout: Math.max(1, parsedGroupTimeout),
    rawGroupLazy: current.rawGroupLazy,
    groupLazy: parseBool(current.rawGroupLazy, true),
    rawGroupMaxFailedTimes: current.rawGroupMaxFailedTimes,
    parsedGroupMaxFailedTimes,
    groupMaxFailedTimes: Math.max(1, parsedGroupMaxFailedTimes),
    rawGroupExpectedStatus: current.rawGroupExpectedStatus,
    normalizedExpectedStatus: rawNormalizedExpectedStatus,
    groupExpectedStatus: isValidExpectedStatusValue(rawNormalizedExpectedStatus) ? rawNormalizedExpectedStatus : "",
    rawGroupStrategy: current.rawGroupStrategy,
    groupStrategy: normalizeLoadBalanceStrategy(current.rawGroupStrategy, ""),
    rawMode: current.rawMode,
    mode: normalizeServiceGroupMode(current.rawMode, current.defaultMode || "select"),
    rawType: current.rawType,
    type: normalizeServiceGroupType(current.rawType, current.defaultType || "select"),
    rawRuleTarget: current.rawRuleTarget,
    ruleTarget: normalizeStringArg(current.rawRuleTarget),
    rawRuleAnchor: current.rawRuleAnchor,
    ruleAnchor: normalizeStringArg(current.rawRuleAnchor),
    rawRulePosition: current.rawRulePosition,
    rulePosition: normalizeRuleOrderPosition(current.rawRulePosition, "before"),
    rawPreferCountries: current.rawPreferCountries,
    preferCountries: toStringList(current.rawPreferCountries),
    rawPreferGroups: current.rawPreferGroups,
    preferGroups: toStringList(current.rawPreferGroups),
    rawPreferNodes: current.rawPreferNodes,
    preferNodes: toExplicitNameList(current.rawPreferNodes),
    rawInterfaceName: current.rawInterfaceName,
    interfaceName: normalizeInterfaceNameArg(current.rawInterfaceName),
    rawRoutingMark: current.rawRoutingMark,
    routingMark: normalizeRoutingMarkArg(current.rawRoutingMark),
    rawUseProviders: current.rawUseProviders,
    useProviders: toStringList(current.rawUseProviders),
    rawIncludeAll: current.rawIncludeAll,
    includeAll: parseBool(current.rawIncludeAll, false),
    rawIncludeAllProviders: current.rawIncludeAllProviders,
    includeAllProviders: parseBool(current.rawIncludeAllProviders, false),
    rawIncludeAllProxies: current.rawIncludeAllProxies,
    includeAllProxies: parseBool(current.rawIncludeAllProxies, false),
    rawHidden: current.rawHidden,
    hidden: parseBool(current.rawHidden, false),
    rawDisableUdp: current.rawDisableUdp,
    disableUdp: parseBool(current.rawDisableUdp, false),
    rawIcon: current.rawIcon,
    icon: normalizeStringArg(current.rawIcon),
    rawNodeFilter: current.rawNodeFilter,
    nodeFilter: normalizeStringArg(current.rawNodeFilter),
    rawNodeExcludeFilter: current.rawNodeExcludeFilter,
    nodeExcludeFilter: normalizeStringArg(current.rawNodeExcludeFilter),
    rawNodeExcludeType: current.rawNodeExcludeType,
    nodeExcludeType: normalizeTypeListArg(current.rawNodeExcludeType)
  };
}

// 单个服务状态的数值/枚举/布尔兼容性告警统一收在这里，避免 resolveArgs 里维护一长段重复 warn helper 调用。
function warnResolveArgServiceState(serviceState) {
  const current = isObject(serviceState) ? serviceState : buildResolveArgServiceState();
  const key = normalizeStringArg(current.key);
  if (!key) {
    return;
  }

  warnAdjustedNumericArg(current.rawGroupInterval, current.parsedGroupInterval, current.groupInterval, `${key}-group-interval`);
  warnAdjustedNumericArg(current.rawGroupTolerance, current.parsedGroupTolerance, current.groupTolerance, `${key}-group-tolerance`);
  warnAdjustedNumericArg(current.rawGroupTimeout, current.parsedGroupTimeout, current.groupTimeout, `${key}-group-timeout`);
  warnAdjustedNumericArg(current.rawGroupMaxFailedTimes, current.parsedGroupMaxFailedTimes, current.groupMaxFailedTimes, `${key}-group-max-failed-times`);
  warnNormalizedChoiceArg(current.rawMode, current.mode, `${key}-mode`);
  warnNormalizedChoiceArg(current.rawType, current.type, `${key}-type`);
  warnInvalidStrategyArg(current.rawGroupStrategy, current.groupStrategy, `${key}-group-strategy`);
  warnInvalidExpectedStatusArg(current.rawGroupExpectedStatus, current.normalizedExpectedStatus, current.groupExpectedStatus, `${key}-group-expected-status`);
  warnIgnoredEmptyStringArg(current.rawInterfaceName, current.interfaceName, `${key}-interface-name`);
  warnIgnoredRoutingMarkArg(current.rawRoutingMark, current.routingMark, `${key}-routing-mark`);
  warnIneffectiveStrategyArg(current.rawGroupStrategy, current.groupStrategy, current.type, `${key}-group-strategy`, `${key}-type`);
  warnIgnoredEmptyStringArg(current.rawIcon, current.icon, `${key}-icon`);
}

// GitHub / Steam / Dev 这一批“跨服务批量提示”的文案模式高度一致，统一改成 definitions 批量派发。
const RESOLVE_ARG_SERVICE_BATCH_WARNING_DEFINITIONS = Object.freeze([
  {
    message: (serviceState) => serviceState.testUrl && !looksLikeHttpUrl(serviceState.testUrl)
      ? `⚠️ 警告: ${serviceState.key}-test-url 看起来不像合法 http(s) 地址: ${serviceState.testUrl}`
      : ""
  },
  {
    message: (serviceState) => serviceState.rawIncludeAllProviders !== undefined && serviceState.includeAllProviders && serviceState.useProviders.length
      ? `⚠️ 警告: ${serviceState.key}-include-all-providers 已开启，${serviceState.key}-use-providers 将被忽略`
      : ""
  },
  {
    message: (serviceState) => serviceState.rawIncludeAll !== undefined && serviceState.includeAll && (serviceState.useProviders.length || serviceState.includeAllProviders)
      ? `⚠️ 警告: ${serviceState.key}-include-all 已开启，${serviceState.key}-use-providers / ${serviceState.key}-include-all-providers 将被忽略`
      : ""
  },
  {
    message: (serviceState) => serviceState.rawIncludeAll !== undefined && serviceState.includeAll && serviceState.includeAllProxies
      ? `⚠️ 警告: ${serviceState.key}-include-all 已开启，${serviceState.key}-include-all-proxies 将被忽略`
      : ""
  },
  {
    message: (serviceState) => serviceState.rawRulePosition !== undefined
      && normalizeStringArg(serviceState.rawRulePosition).toLowerCase() !== serviceState.rulePosition
      ? `⚠️ 警告: ${serviceState.key}-rule-position 无效，已重置为 ${serviceState.rulePosition}`
      : ""
  }
]);

function emitResolveArgServiceBatchWarnings(serviceStates, definitions) {
  const source = Array.isArray(definitions) ? definitions : [];
  for (const definition of source) {
    emitWarningList(
      serviceStates,
      typeof (definition && definition.message) === "function"
        ? definition.message
        : (() => "")
    );
  }
}

// 服务参数 warnings 分成“单状态规范化提示 + 跨服务批量提示”两段统一执行，resolveArgs 主体只保留调度。
function warnResolveArgServiceStates(serviceStates) {
  for (const serviceState of Array.isArray(serviceStates) ? serviceStates : []) {
    warnResolveArgServiceState(serviceState);
  }

  emitResolveArgServiceBatchWarnings(serviceStates, RESOLVE_ARG_SERVICE_BATCH_WARNING_DEFINITIONS);
}

// 把服务状态重新拍平成 resolveArgs 最终返回对象里的字段，避免 return 区继续手写三套近似属性。
function buildResolveArgServiceResultPayload(serviceStates) {
  const payload = {};

  for (const state of Array.isArray(serviceStates) ? serviceStates : []) {
    if (!isObject(state) || !state.key) {
      continue;
    }

    const key = state.key;
    const token = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    payload[`${key}PreferCountries`] = state.preferCountries;
    payload[`has${token}PreferCountries`] = !!state.preferCountries.length;
    payload[`${key}PreferGroups`] = state.preferGroups;
    payload[`has${token}PreferGroups`] = !!state.preferGroups.length;
    payload[`${key}PreferNodes`] = state.preferNodes;
    payload[`has${token}PreferNodes`] = !!state.preferNodes.length;
    payload[`${key}RuleTarget`] = state.ruleTarget;
    payload[`has${token}RuleTarget`] = !!state.ruleTarget;
    payload[`${key}RuleAnchor`] = state.ruleAnchor;
    payload[`has${token}RuleAnchor`] = !!state.ruleAnchor;
    payload[`${key}RulePosition`] = state.rulePosition;
    payload[`has${token}RulePosition`] = state.rawRulePosition !== undefined;
    payload[`${key}Mode`] = state.mode;
    payload[`has${token}Mode`] = state.rawMode !== undefined;
    payload[`${key}Type`] = state.type;
    payload[`has${token}Type`] = state.rawType !== undefined;
    payload[`${key}TestUrl`] = state.testUrl;
    payload[`has${token}TestUrl`] = !!state.testUrl;
    payload[`${key}GroupInterval`] = state.groupInterval;
    payload[`has${token}GroupInterval`] = state.rawGroupInterval !== undefined;
    payload[`${key}GroupTolerance`] = state.groupTolerance;
    payload[`has${token}GroupTolerance`] = state.rawGroupTolerance !== undefined;
    payload[`${key}GroupTimeout`] = state.groupTimeout;
    payload[`has${token}GroupTimeout`] = state.rawGroupTimeout !== undefined;
    payload[`${key}GroupLazy`] = state.groupLazy;
    payload[`has${token}GroupLazy`] = state.rawGroupLazy !== undefined;
    payload[`${key}GroupMaxFailedTimes`] = state.groupMaxFailedTimes;
    payload[`has${token}GroupMaxFailedTimes`] = state.rawGroupMaxFailedTimes !== undefined;
    payload[`${key}GroupExpectedStatus`] = state.groupExpectedStatus;
    payload[`has${token}GroupExpectedStatus`] = !!state.groupExpectedStatus;
    payload[`${key}GroupStrategy`] = state.groupStrategy;
    payload[`has${token}GroupStrategy`] = !!state.groupStrategy;
    payload[`${key}InterfaceName`] = state.interfaceName;
    payload[`has${token}InterfaceName`] = !!state.interfaceName;
    payload[`${key}RoutingMark`] = state.routingMark;
    payload[`has${token}RoutingMark`] = state.routingMark !== null;
    payload[`${key}UseProviders`] = state.useProviders;
    payload[`has${token}UseProviders`] = !!state.useProviders.length;
    payload[`${key}IncludeAll`] = state.includeAll;
    payload[`has${token}IncludeAll`] = state.rawIncludeAll !== undefined;
    payload[`${key}IncludeAllProxies`] = state.includeAllProxies;
    payload[`has${token}IncludeAllProxies`] = state.rawIncludeAllProxies !== undefined;
    payload[`${key}IncludeAllProviders`] = state.includeAllProviders;
    payload[`has${token}IncludeAllProviders`] = state.rawIncludeAllProviders !== undefined;
    payload[`${key}Hidden`] = state.hidden;
    payload[`has${token}Hidden`] = state.rawHidden !== undefined;
    payload[`${key}DisableUdp`] = state.disableUdp;
    payload[`has${token}DisableUdp`] = state.rawDisableUdp !== undefined;
    payload[`${key}Icon`] = state.icon;
    payload[`has${token}Icon`] = !!state.icon;
    payload[`${key}NodeFilter`] = state.nodeFilter;
    payload[`has${token}NodeFilter`] = !!state.nodeFilter;
    payload[`${key}NodeExcludeFilter`] = state.nodeExcludeFilter;
    payload[`has${token}NodeExcludeFilter`] = !!state.nodeExcludeFilter;
    payload[`${key}NodeExcludeType`] = state.nodeExcludeType;
    payload[`has${token}NodeExcludeType`] = !!state.nodeExcludeType;
  }

  return payload;
}

// rule-provider 在 resolveArgs 里要同时处理路径、下载选项、header 与 inline payload，这里统一收敛成状态对象。
function buildResolveArgRuleProviderState(payload) {
  const current = isObject(payload) ? payload : {};
  const parsedInterval = parseNumber(current.rawInterval, RULE_INTERVAL);
  const parsedSizeLimit = parseNumber(current.rawSizeLimit, 0);
  const parsedHeaderEntries = parseProviderHeaderEntries(current.rawHeader);
  const parsedPayload = parseRuleProviderPayload(current.rawPayload);

  return {
    rawPathDir: current.rawPathDir,
    pathDir: normalizeRuleProviderPathDir(current.rawPathDir),
    rawInterval: current.rawInterval,
    parsedInterval,
    interval: Math.max(1, parsedInterval),
    rawProxy: current.rawProxy,
    proxy: normalizeStringArg(current.rawProxy),
    rawSizeLimit: current.rawSizeLimit,
    parsedSizeLimit,
    sizeLimit: Math.max(0, parsedSizeLimit),
    rawUserAgent: current.rawUserAgent,
    userAgent: normalizeStringArg(current.rawUserAgent),
    rawAuthorization: current.rawAuthorization,
    authorization: normalizeStringArg(current.rawAuthorization),
    rawHeader: current.rawHeader,
    parsedHeaderEntries,
    header: parsedHeaderEntries.headers,
    rawPayload: current.rawPayload,
    parsedPayload,
    payload: parsedPayload.items
  };
}

// proxy-provider 的参数面更宽，这里统一收口成状态对象，后续告警与返回字段都从这里展开。
function buildResolveArgProxyProviderState(payload) {
  const current = isObject(payload) ? payload : {};
  const parsedInterval = parseNumber(current.rawInterval, PROXY_PROVIDER_INTERVAL);
  const parsedSizeLimit = parseNumber(current.rawSizeLimit, 0);
  const parsedHealthCheckInterval = parseNumber(current.rawHealthCheckInterval, GROUP_INTERVAL);
  const parsedHealthCheckTimeout = parseNumber(current.rawHealthCheckTimeout, PROXY_PROVIDER_HEALTH_CHECK_TIMEOUT);
  const parsedHeaderEntries = parseProviderHeaderEntries(current.rawHeader);
  const parsedPayload = parseProxyProviderPayload(current.rawPayload);
  const parsedOverrideProxyNameRules = parseProxyNameOverrideRules(current.rawOverrideProxyName);
  const normalizedHealthCheckExpectedStatus = normalizeExpectedStatusArg(current.rawHealthCheckExpectedStatus);
  // 这里先筛掉正则无法编译的改名规则，后面返回给 ARGS 的就是“可真正落地”的版本。
  const overrideProxyNameRules = parsedOverrideProxyNameRules.filter((rule) => {
    try {
      compilePatternRegExp(rule.pattern);
      return true;
    } catch (error) {
      return false;
    }
  });

  return {
    rawInterval: current.rawInterval,
    parsedInterval,
    interval: Math.max(1, parsedInterval),
    rawProxy: current.rawProxy,
    proxy: normalizeStringArg(current.rawProxy),
    rawSizeLimit: current.rawSizeLimit,
    parsedSizeLimit,
    sizeLimit: Math.max(0, parsedSizeLimit),
    rawUserAgent: current.rawUserAgent,
    userAgent: normalizeStringArg(current.rawUserAgent),
    rawAuthorization: current.rawAuthorization,
    authorization: normalizeStringArg(current.rawAuthorization),
    rawHeader: current.rawHeader,
    parsedHeaderEntries,
    header: parsedHeaderEntries.headers,
    rawPayload: current.rawPayload,
    parsedPayload,
    payload: parsedPayload.items,
    rawPathDir: current.rawPathDir,
    pathDir: normalizeProxyProviderPathDir(current.rawPathDir),
    rawFilter: current.rawFilter,
    filter: normalizeStringArg(current.rawFilter),
    rawExcludeFilter: current.rawExcludeFilter,
    excludeFilter: normalizeStringArg(current.rawExcludeFilter),
    rawExcludeType: current.rawExcludeType,
    excludeType: normalizeTypeListArg(current.rawExcludeType),
    rawOverrideAdditionalPrefix: current.rawOverrideAdditionalPrefix,
    overrideAdditionalPrefix: normalizeStringArg(current.rawOverrideAdditionalPrefix),
    rawOverrideAdditionalSuffix: current.rawOverrideAdditionalSuffix,
    overrideAdditionalSuffix: normalizeStringArg(current.rawOverrideAdditionalSuffix),
    rawOverrideUdp: current.rawOverrideUdp,
    overrideUdp: parseBool(current.rawOverrideUdp, false),
    rawOverrideUdpOverTcp: current.rawOverrideUdpOverTcp,
    overrideUdpOverTcp: parseBool(current.rawOverrideUdpOverTcp, false),
    rawOverrideDown: current.rawOverrideDown,
    overrideDown: normalizeStringArg(current.rawOverrideDown),
    rawOverrideUp: current.rawOverrideUp,
    overrideUp: normalizeStringArg(current.rawOverrideUp),
    rawOverrideTfo: current.rawOverrideTfo,
    overrideTfo: parseBool(current.rawOverrideTfo, false),
    rawOverrideMptcp: current.rawOverrideMptcp,
    overrideMptcp: parseBool(current.rawOverrideMptcp, false),
    rawOverrideSkipCertVerify: current.rawOverrideSkipCertVerify,
    overrideSkipCertVerify: parseBool(current.rawOverrideSkipCertVerify, false),
    rawOverrideDialerProxy: current.rawOverrideDialerProxy,
    overrideDialerProxy: normalizeStringArg(current.rawOverrideDialerProxy),
    rawOverrideInterfaceName: current.rawOverrideInterfaceName,
    overrideInterfaceName: normalizeInterfaceNameArg(current.rawOverrideInterfaceName),
    rawOverrideRoutingMark: current.rawOverrideRoutingMark,
    overrideRoutingMark: normalizeRoutingMarkArg(current.rawOverrideRoutingMark),
    rawOverrideIpVersion: current.rawOverrideIpVersion,
    overrideIpVersion: normalizeIpVersionArg(current.rawOverrideIpVersion, ""),
    rawOverrideProxyName: current.rawOverrideProxyName,
    parsedOverrideProxyNameRules,
    overrideProxyNameRules,
    rawHealthCheckEnable: current.rawHealthCheckEnable,
    healthCheckEnable: parseBool(current.rawHealthCheckEnable, true),
    rawHealthCheckUrl: current.rawHealthCheckUrl,
    healthCheckUrl: normalizeStringArg(current.rawHealthCheckUrl),
    rawHealthCheckInterval: current.rawHealthCheckInterval,
    parsedHealthCheckInterval,
    healthCheckInterval: Math.max(1, parsedHealthCheckInterval),
    rawHealthCheckTimeout: current.rawHealthCheckTimeout,
    parsedHealthCheckTimeout,
    healthCheckTimeout: Math.max(1, parsedHealthCheckTimeout),
    rawHealthCheckLazy: current.rawHealthCheckLazy,
    healthCheckLazy: parseBool(current.rawHealthCheckLazy, true),
    rawHealthCheckExpectedStatus: current.rawHealthCheckExpectedStatus,
    normalizedHealthCheckExpectedStatus,
    healthCheckExpectedStatus: isValidExpectedStatusValue(normalizedHealthCheckExpectedStatus) ? normalizedHealthCheckExpectedStatus : ""
  };
}

// 输出 rule-provider 参数相关告警，避免 resolveArgs 主体里堆积大量样板判断。
function warnResolveArgRuleProviderState(ruleProviderState) {
  const current = isObject(ruleProviderState) ? ruleProviderState : buildResolveArgRuleProviderState();

  if (current.rawPathDir !== undefined && !normalizeStringArg(current.rawPathDir)) {
    emitWarning(`⚠️ 警告: rule-provider-path-dir 为空，已回退为默认目录 ${RULE_PROVIDER_PATH_DIR}`);
  }

  if (current.rawHeader !== undefined && hasUsableArgValue(current.rawHeader) && !current.parsedHeaderEntries.entries.length) {
    emitWarning("⚠️ 警告: rule-provider-header 语法无效，已忽略；请使用 Header: value||Header2: value2");
  }

  if (current.parsedHeaderEntries.entries.length) {
    emitInvalidEntryWarnings("rule-provider-header", current.parsedHeaderEntries.invalidLines, "条目无效，已忽略");
  }

  if (current.rawPayload !== undefined && hasUsableArgValue(current.rawPayload) && !current.payload.length) {
    const reason = current.parsedPayload.parseFailed
      ? "请使用 JSON 数组、换行或 || 分隔的规则列表"
      : "请至少提供一条非空规则字符串";
    emitWarning(`⚠️ 警告: rule-provider-payload 无有效规则，已忽略；${reason}`);
  }

  if (current.payload.length) {
    emitInvalidEntryWarnings("rule-provider-payload", current.parsedPayload.invalidItems, "条目无效，已忽略");
  }

  warnAdjustedNumericArg(current.rawInterval, current.parsedInterval, current.interval, "rule-provider-interval");
  warnAdjustedNumericArg(current.rawSizeLimit, current.parsedSizeLimit, current.sizeLimit, "rule-provider-size-limit");
}

// 输出 proxy-provider 参数相关告警，减少 resolveArgs 主体里的样板判断。
function warnResolveArgProxyProviderState(proxyProviderState) {
  const current = isObject(proxyProviderState) ? proxyProviderState : buildResolveArgProxyProviderState();

  if (current.rawPathDir !== undefined && !normalizeStringArg(current.rawPathDir)) {
    emitWarning("⚠️ 警告: proxy-provider-path-dir 为空，已忽略本轮缓存目录接管");
  }

  if (current.rawPathDir !== undefined && hasUsableArgValue(current.rawPathDir) && !current.pathDir) {
    emitWarning(`⚠️ 警告: proxy-provider-path-dir 无效，已忽略: ${current.rawPathDir}`);
  }

  if (current.rawHeader !== undefined && hasUsableArgValue(current.rawHeader) && !current.parsedHeaderEntries.entries.length) {
    emitWarning("⚠️ 警告: proxy-provider-header 语法无效，已忽略；请使用 Header: value||Header2: value2");
  }

  if (current.parsedHeaderEntries.entries.length) {
    emitInvalidEntryWarnings("proxy-provider-header", current.parsedHeaderEntries.invalidLines, "条目无效，已忽略");
  }

  if (current.rawPayload !== undefined && hasUsableArgValue(current.rawPayload) && !current.payload.length) {
    const reason = current.parsedPayload.parseFailed
      ? "请使用 JSON 数组/对象写法"
      : "请至少提供带 name/type 的节点对象";
    emitWarning(`⚠️ 警告: proxy-provider-payload 无有效节点，已忽略；${reason}`);
  }

  if (current.payload.length) {
    emitInvalidEntryWarnings("proxy-provider-payload", current.parsedPayload.invalidItems, "条目无效，已忽略");
  }

  warnAdjustedNumericArg(current.rawInterval, current.parsedInterval, current.interval, "proxy-provider-interval");
  warnAdjustedNumericArg(current.rawSizeLimit, current.parsedSizeLimit, current.sizeLimit, "proxy-provider-size-limit");
  warnAdjustedNumericArg(
    current.rawHealthCheckInterval,
    current.parsedHealthCheckInterval,
    current.healthCheckInterval,
    "proxy-provider-health-check-interval"
  );
  warnAdjustedNumericArg(
    current.rawHealthCheckTimeout,
    current.parsedHealthCheckTimeout,
    current.healthCheckTimeout,
    "proxy-provider-health-check-timeout"
  );

  if (current.healthCheckUrl && !looksLikeHttpUrl(current.healthCheckUrl)) {
    emitWarning(`⚠️ 警告: proxy-provider-health-check-url 看起来不像合法 http(s) 地址: ${current.healthCheckUrl}`);
  }

  if (current.rawHealthCheckExpectedStatus !== undefined && current.normalizedHealthCheckExpectedStatus && !current.healthCheckExpectedStatus) {
    emitWarning("⚠️ 警告: proxy-provider-health-check-expected-status 语法无效，已忽略");
  }

  if (current.rawFilter !== undefined && current.filter) {
    try {
      compilePatternRegExp(current.filter);
    } catch (error) {
      emitWarning(`⚠️ 警告: proxy-provider-filter 正则无效: ${error.message}`);
    }
  }

  if (current.rawExcludeFilter !== undefined && current.excludeFilter) {
    try {
      compilePatternRegExp(current.excludeFilter);
    } catch (error) {
      emitWarning(`⚠️ 警告: proxy-provider-exclude-filter 正则无效: ${error.message}`);
    }
  }

  if (current.rawExcludeType !== undefined && normalizeStringArg(current.rawExcludeType) && !current.excludeType) {
    emitWarning("⚠️ 警告: proxy-provider-exclude-type 为空或格式无效，已忽略");
  }

  if (current.rawExcludeType !== undefined && /[()[\]{}*+?^$\\]/.test(normalizeStringArg(current.rawExcludeType))) {
    emitWarning("⚠️ 警告: proxy-provider-exclude-type 不支持正则，请只保留类型名并使用 | 分隔");
  }

  if (current.rawOverrideUdp !== undefined && !isBooleanLike(current.rawOverrideUdp)) {
    emitWarning("⚠️ 警告: proxy-provider-override-udp 仅支持布尔值，已回退为 false");
  }

  if (current.rawOverrideUdpOverTcp !== undefined && !isBooleanLike(current.rawOverrideUdpOverTcp)) {
    emitWarning("⚠️ 警告: proxy-provider-override-udp-over-tcp 仅支持布尔值，已回退为 false");
  }

  if (current.rawOverrideDown !== undefined && !current.overrideDown) {
    emitWarning("⚠️ 警告: proxy-provider-override-down 为空，已忽略");
  }

  if (current.rawOverrideUp !== undefined && !current.overrideUp) {
    emitWarning("⚠️ 警告: proxy-provider-override-up 为空，已忽略");
  }

  if (current.rawOverrideTfo !== undefined && !isBooleanLike(current.rawOverrideTfo)) {
    emitWarning("⚠️ 警告: proxy-provider-override-tfo 仅支持布尔值，已回退为 false");
  }

  if (current.rawOverrideMptcp !== undefined && !isBooleanLike(current.rawOverrideMptcp)) {
    emitWarning("⚠️ 警告: proxy-provider-override-mptcp 仅支持布尔值，已回退为 false");
  }

  if (current.rawOverrideSkipCertVerify !== undefined && !isBooleanLike(current.rawOverrideSkipCertVerify)) {
    emitWarning("⚠️ 警告: proxy-provider-override-skip-cert-verify 仅支持布尔值，已回退为 false");
  }

  if (current.rawOverrideInterfaceName !== undefined && !current.overrideInterfaceName) {
    emitWarning("⚠️ 警告: proxy-provider-override-interface-name 为空，已忽略");
  }

  if (current.rawOverrideRoutingMark !== undefined && current.overrideRoutingMark === null) {
    emitWarning("⚠️ 警告: proxy-provider-override-routing-mark 仅支持大于等于 0 的整数，已忽略");
  }

  if (current.rawOverrideIpVersion !== undefined && normalizeStringArg(current.rawOverrideIpVersion) && !current.overrideIpVersion) {
    emitWarning("⚠️ 警告: proxy-provider-override-ip-version 无效，已忽略");
  }

  if (current.rawOverrideProxyName !== undefined && hasUsableArgValue(current.rawOverrideProxyName) && !current.overrideProxyNameRules.length) {
    emitWarning("⚠️ 警告: proxy-provider-override-proxy-name 语法无效，已忽略；请使用 pattern=>target||pattern2=>target2");
  }

  for (const rule of current.parsedOverrideProxyNameRules) {
    try {
      compilePatternRegExp(rule.pattern);
    } catch (error) {
      emitWarning(`⚠️ 警告: proxy-provider-override-proxy-name 正则无效 (${rule.pattern}): ${error.message}`);
    }
  }
}

// 把 rule-provider / proxy-provider 的状态统一展开回 resolveArgs 返回对象里的字段。
function buildResolveArgProviderResultPayload(ruleProviderState, proxyProviderState) {
  const currentRuleProviderState = isObject(ruleProviderState) ? ruleProviderState : buildResolveArgRuleProviderState();
  const currentProxyProviderState = isObject(proxyProviderState) ? proxyProviderState : buildResolveArgProxyProviderState();

  return {
    ruleProviderPathDir: currentRuleProviderState.pathDir,
    hasRuleProviderPathDir: currentRuleProviderState.rawPathDir !== undefined,
    ruleProviderInterval: currentRuleProviderState.interval,
    hasRuleProviderInterval: currentRuleProviderState.rawInterval !== undefined,
    ruleProviderProxy: currentRuleProviderState.proxy,
    hasRuleProviderProxy: !!currentRuleProviderState.proxy,
    ruleProviderSizeLimit: currentRuleProviderState.sizeLimit,
    hasRuleProviderSizeLimit: currentRuleProviderState.rawSizeLimit !== undefined,
    ruleProviderUserAgent: currentRuleProviderState.userAgent,
    hasRuleProviderUserAgent: !!currentRuleProviderState.userAgent,
    ruleProviderAuthorization: currentRuleProviderState.authorization,
    hasRuleProviderAuthorization: !!currentRuleProviderState.authorization,
    ruleProviderHeader: currentRuleProviderState.header,
    hasRuleProviderHeader: !!Object.keys(currentRuleProviderState.header).length,
    ruleProviderHeaderEntryCount: currentRuleProviderState.parsedHeaderEntries.entries.length,
    ruleProviderPayload: currentRuleProviderState.payload,
    hasRuleProviderPayload: !!currentRuleProviderState.payload.length,
    ruleProviderPayloadCount: currentRuleProviderState.payload.length,
    proxyProviderInterval: currentProxyProviderState.interval,
    hasProxyProviderInterval: currentProxyProviderState.rawInterval !== undefined,
    proxyProviderProxy: currentProxyProviderState.proxy,
    hasProxyProviderProxy: !!currentProxyProviderState.proxy,
    proxyProviderSizeLimit: currentProxyProviderState.sizeLimit,
    hasProxyProviderSizeLimit: currentProxyProviderState.rawSizeLimit !== undefined,
    proxyProviderUserAgent: currentProxyProviderState.userAgent,
    hasProxyProviderUserAgent: !!currentProxyProviderState.userAgent,
    proxyProviderAuthorization: currentProxyProviderState.authorization,
    hasProxyProviderAuthorization: !!currentProxyProviderState.authorization,
    proxyProviderHeader: currentProxyProviderState.header,
    hasProxyProviderHeader: !!Object.keys(currentProxyProviderState.header).length,
    proxyProviderHeaderEntryCount: currentProxyProviderState.parsedHeaderEntries.entries.length,
    proxyProviderPayload: currentProxyProviderState.payload,
    hasProxyProviderPayload: !!currentProxyProviderState.payload.length,
    proxyProviderPayloadCount: currentProxyProviderState.payload.length,
    proxyProviderPathDir: currentProxyProviderState.pathDir,
    hasProxyProviderPathDir: !!currentProxyProviderState.pathDir,
    proxyProviderFilter: currentProxyProviderState.filter,
    hasProxyProviderFilter: !!currentProxyProviderState.filter,
    proxyProviderExcludeFilter: currentProxyProviderState.excludeFilter,
    hasProxyProviderExcludeFilter: !!currentProxyProviderState.excludeFilter,
    proxyProviderExcludeType: currentProxyProviderState.excludeType,
    hasProxyProviderExcludeType: !!currentProxyProviderState.excludeType,
    proxyProviderOverrideAdditionalPrefix: currentProxyProviderState.overrideAdditionalPrefix,
    hasProxyProviderOverrideAdditionalPrefix: !!currentProxyProviderState.overrideAdditionalPrefix,
    proxyProviderOverrideAdditionalSuffix: currentProxyProviderState.overrideAdditionalSuffix,
    hasProxyProviderOverrideAdditionalSuffix: !!currentProxyProviderState.overrideAdditionalSuffix,
    proxyProviderOverrideUdp: currentProxyProviderState.overrideUdp,
    hasProxyProviderOverrideUdp: currentProxyProviderState.rawOverrideUdp !== undefined,
    proxyProviderOverrideUdpOverTcp: currentProxyProviderState.overrideUdpOverTcp,
    hasProxyProviderOverrideUdpOverTcp: currentProxyProviderState.rawOverrideUdpOverTcp !== undefined,
    proxyProviderOverrideDown: currentProxyProviderState.overrideDown,
    hasProxyProviderOverrideDown: !!currentProxyProviderState.overrideDown,
    proxyProviderOverrideUp: currentProxyProviderState.overrideUp,
    hasProxyProviderOverrideUp: !!currentProxyProviderState.overrideUp,
    proxyProviderOverrideTfo: currentProxyProviderState.overrideTfo,
    hasProxyProviderOverrideTfo: currentProxyProviderState.rawOverrideTfo !== undefined,
    proxyProviderOverrideMptcp: currentProxyProviderState.overrideMptcp,
    hasProxyProviderOverrideMptcp: currentProxyProviderState.rawOverrideMptcp !== undefined,
    proxyProviderOverrideSkipCertVerify: currentProxyProviderState.overrideSkipCertVerify,
    hasProxyProviderOverrideSkipCertVerify: currentProxyProviderState.rawOverrideSkipCertVerify !== undefined,
    proxyProviderOverrideDialerProxy: currentProxyProviderState.overrideDialerProxy,
    hasProxyProviderOverrideDialerProxy: !!currentProxyProviderState.overrideDialerProxy,
    proxyProviderOverrideInterfaceName: currentProxyProviderState.overrideInterfaceName,
    hasProxyProviderOverrideInterfaceName: !!currentProxyProviderState.overrideInterfaceName,
    proxyProviderOverrideRoutingMark: currentProxyProviderState.overrideRoutingMark,
    hasProxyProviderOverrideRoutingMark: currentProxyProviderState.rawOverrideRoutingMark !== undefined && currentProxyProviderState.overrideRoutingMark !== null,
    proxyProviderOverrideIpVersion: currentProxyProviderState.overrideIpVersion,
    hasProxyProviderOverrideIpVersion: !!currentProxyProviderState.overrideIpVersion,
    proxyProviderOverrideProxyNameRules: currentProxyProviderState.overrideProxyNameRules,
    hasProxyProviderOverrideProxyNameRules: !!currentProxyProviderState.overrideProxyNameRules.length,
    proxyProviderHealthCheckEnable: currentProxyProviderState.healthCheckEnable,
    hasProxyProviderHealthCheckEnable: currentProxyProviderState.rawHealthCheckEnable !== undefined,
    proxyProviderHealthCheckUrl: currentProxyProviderState.healthCheckUrl,
    hasProxyProviderHealthCheckUrl: !!currentProxyProviderState.healthCheckUrl,
    proxyProviderHealthCheckInterval: currentProxyProviderState.healthCheckInterval,
    hasProxyProviderHealthCheckInterval: currentProxyProviderState.rawHealthCheckInterval !== undefined,
    proxyProviderHealthCheckTimeout: currentProxyProviderState.healthCheckTimeout,
    hasProxyProviderHealthCheckTimeout: currentProxyProviderState.rawHealthCheckTimeout !== undefined,
    proxyProviderHealthCheckLazy: currentProxyProviderState.healthCheckLazy,
    hasProxyProviderHealthCheckLazy: currentProxyProviderState.rawHealthCheckLazy !== undefined,
    proxyProviderHealthCheckExpectedStatus: currentProxyProviderState.healthCheckExpectedStatus,
    hasProxyProviderHealthCheckExpectedStatus: !!currentProxyProviderState.healthCheckExpectedStatus
  };
}

// 全局测速组选项也有一整套数值归一化 / 语法校验 / 返回字段展开流程，这里统一收口成状态对象。
function buildResolveArgGroupState(payload) {
  const current = isObject(payload) ? payload : {};
  const rawNormalizedExpectedStatus = normalizeExpectedStatusArg(current.rawGroupExpectedStatus);
  const parsedGroupInterval = parseNumber(current.rawGroupInterval, GROUP_INTERVAL);
  const parsedGroupTolerance = parseNumber(current.rawGroupTolerance, GROUP_TOLERANCE);
  const parsedGroupTimeout = parseNumber(current.rawGroupTimeout, GROUP_TIMEOUT);
  const parsedGroupMaxFailedTimes = parseNumber(current.rawGroupMaxFailedTimes, GROUP_MAX_FAILED_TIMES);

  return {
    rawTestUrl: current.rawTestUrl,
    testUrl: normalizeStringArg(current.rawTestUrl),
    rawGroupInterval: current.rawGroupInterval,
    parsedGroupInterval,
    groupInterval: Math.max(1, parsedGroupInterval),
    rawGroupTolerance: current.rawGroupTolerance,
    parsedGroupTolerance,
    groupTolerance: Math.max(0, parsedGroupTolerance),
    rawGroupTimeout: current.rawGroupTimeout,
    parsedGroupTimeout,
    groupTimeout: Math.max(1, parsedGroupTimeout),
    rawGroupLazy: current.rawGroupLazy,
    groupLazy: parseBool(current.rawGroupLazy, true),
    rawGroupMaxFailedTimes: current.rawGroupMaxFailedTimes,
    parsedGroupMaxFailedTimes,
    groupMaxFailedTimes: Math.max(1, parsedGroupMaxFailedTimes),
    rawGroupExpectedStatus: current.rawGroupExpectedStatus,
    normalizedExpectedStatus: rawNormalizedExpectedStatus,
    groupExpectedStatus: isValidExpectedStatusValue(rawNormalizedExpectedStatus) ? rawNormalizedExpectedStatus : "",
    rawGroupStrategy: current.rawGroupStrategy,
    groupStrategy: normalizeLoadBalanceStrategy(current.rawGroupStrategy, ""),
    rawInterfaceName: current.rawInterfaceName,
    interfaceName: normalizeInterfaceNameArg(current.rawInterfaceName),
    rawRoutingMark: current.rawRoutingMark,
    routingMark: normalizeRoutingMarkArg(current.rawRoutingMark)
  };
}

// 策略组布局参数属于另一块高频重复字段，这里也统一收口成状态对象。
function buildResolveArgGroupLayoutState(payload) {
  const current = isObject(payload) ? payload : {};
  const parsedRegionGroups = parseRegionGroupKeys(current.rawRegionGroups);
  const regionGroupKeys = parsedRegionGroups.keys;

  return {
    rawGroupOrderPreset: current.rawGroupOrderPreset,
    groupOrderPreset: normalizeGroupOrderPreset(current.rawGroupOrderPreset, DEFAULT_GROUP_ORDER_PRESET),
    rawGroupOrder: current.rawGroupOrder,
    groupOrder: toStringList(current.rawGroupOrder),
    rawCountryGroupSort: current.rawCountryGroupSort,
    countryGroupSort: normalizeGeoGroupSortMode(current.rawCountryGroupSort, "definition"),
    rawRegionGroupSort: current.rawRegionGroupSort,
    regionGroupSort: normalizeGeoGroupSortMode(current.rawRegionGroupSort, "definition"),
    rawRegionGroups: current.rawRegionGroups,
    parsedRegionGroups,
    regionGroupKeys,
    regionGroupPreview: formatRegionGroupPreview(regionGroupKeys)
  };
}

// 全局测速组告警与服务组告警高度同构，这里收口后减少 resolveArgs 主体里的样板判断。
function warnResolveArgGroupState(groupState) {
  const current = isObject(groupState) ? groupState : buildResolveArgGroupState();
  warnAdjustedNumericArg(current.rawGroupInterval, current.parsedGroupInterval, current.groupInterval, "group-interval");
  warnAdjustedNumericArg(current.rawGroupTolerance, current.parsedGroupTolerance, current.groupTolerance, "group-tolerance");
  warnAdjustedNumericArg(current.rawGroupTimeout, current.parsedGroupTimeout, current.groupTimeout, "group-timeout");
  warnAdjustedNumericArg(current.rawGroupMaxFailedTimes, current.parsedGroupMaxFailedTimes, current.groupMaxFailedTimes, "group-max-failed-times");
  warnInvalidStrategyArg(current.rawGroupStrategy, current.groupStrategy, "group-strategy");
  warnIgnoredEmptyStringArg(current.rawInterfaceName, current.interfaceName, "group-interface-name");
  warnIgnoredRoutingMarkArg(current.rawRoutingMark, current.routingMark, "group-routing-mark");
  warnInvalidExpectedStatusArg(
    current.rawGroupExpectedStatus,
    current.normalizedExpectedStatus,
    current.groupExpectedStatus,
    "group-expected-status"
  );
}

// 布局类参数的提示文案也集中处理，避免 resolveArgs 主体继续堆积 if/for 模板。
function warnResolveArgGroupLayoutState(layoutState) {
  const current = isObject(layoutState) ? layoutState : buildResolveArgGroupLayoutState();

  if (current.rawGroupOrderPreset !== undefined && !VALID_GROUP_ORDER_PRESET_TOKENS.includes(normalizeGroupMarkerToken(current.rawGroupOrderPreset))) {
    emitWarning(`⚠️ 警告: group-order-preset 无效，已重置为 ${current.groupOrderPreset}`);
  }

  if (current.rawGroupOrder !== undefined && !current.groupOrder.length) {
    emitWarning("⚠️ 警告: group-order 为空，已忽略");
  }

  if (current.rawGroupOrderPreset !== undefined && current.rawGroupOrder !== undefined && current.groupOrder.length) {
    emitWarning("⚠️ 提醒: 已同时配置 group-order-preset 与 group-order；当前以显式 group-order 为准");
  }

  if (current.rawCountryGroupSort !== undefined && !isValidGeoGroupSortMode(current.rawCountryGroupSort)) {
    emitWarning(`⚠️ 警告: country-group-sort 无效，已重置为 ${current.countryGroupSort}`);
  }

  if (current.rawRegionGroupSort !== undefined && !isValidGeoGroupSortMode(current.rawRegionGroupSort)) {
    emitWarning(`⚠️ 警告: region-group-sort 无效，已重置为 ${current.regionGroupSort}`);
  }

  emitInvalidEntryWarnings("region-groups", current.parsedRegionGroups.invalidTokens, "未匹配到内置区域定义，已忽略");
}

// 把全局测速组状态拍平成 resolveArgs 返回对象里的字段。
function buildResolveArgGroupResultPayload(groupState) {
  const current = isObject(groupState) ? groupState : buildResolveArgGroupState();

  return {
    testUrl: current.testUrl,
    hasTestUrl: !!current.testUrl,
    groupInterval: current.groupInterval,
    hasGroupInterval: current.rawGroupInterval !== undefined,
    groupTolerance: current.groupTolerance,
    hasGroupTolerance: current.rawGroupTolerance !== undefined,
    groupTimeout: current.groupTimeout,
    hasGroupTimeout: current.rawGroupTimeout !== undefined,
    groupMaxFailedTimes: current.groupMaxFailedTimes,
    hasGroupMaxFailedTimes: current.rawGroupMaxFailedTimes !== undefined,
    groupExpectedStatus: current.groupExpectedStatus,
    hasGroupExpectedStatus: !!current.groupExpectedStatus,
    groupStrategy: current.groupStrategy,
    hasGroupStrategy: !!current.groupStrategy,
    groupInterfaceName: current.interfaceName,
    hasGroupInterfaceName: !!current.interfaceName,
    groupRoutingMark: current.routingMark,
    hasGroupRoutingMark: current.routingMark !== null,
    groupLazy: current.groupLazy,
    hasGroupLazy: current.rawGroupLazy !== undefined
  };
}

// 把布局状态拍平成 resolveArgs 返回对象里的字段。
function buildResolveArgGroupLayoutResultPayload(layoutState) {
  const current = isObject(layoutState) ? layoutState : buildResolveArgGroupLayoutState();

  return {
    groupOrderPreset: current.groupOrderPreset,
    hasGroupOrderPreset: current.rawGroupOrderPreset !== undefined,
    groupOrder: current.groupOrder,
    hasGroupOrder: !!current.groupOrder.length,
    countryGroupSort: current.countryGroupSort,
    hasCountryGroupSort: current.rawCountryGroupSort !== undefined,
    regionGroupSort: current.regionGroupSort,
    hasRegionGroupSort: current.rawRegionGroupSort !== undefined,
    regionGroupKeys: current.regionGroupKeys,
    hasRegionGroups: !!current.regionGroupKeys.length,
    hasRegionGroupsArg: current.rawRegionGroups !== undefined,
    regionGroupPreview: current.regionGroupPreview
  };
}

// 规则源参数既包含多个 URL，也包含 preset / steam-fix 这类开关，这里统一收口成状态对象。
function buildResolveArgRuleSourceState(payload) {
  const current = isObject(payload) ? payload : {};

  return {
    rawDirectListUrl: current.rawDirectListUrl,
    directListUrl: normalizeStringArg(current.rawDirectListUrl),
    rawCryptoListUrl: current.rawCryptoListUrl,
    cryptoListUrl: normalizeStringArg(current.rawCryptoListUrl),
    rawChatGptListUrl: current.rawChatGptListUrl,
    chatGptListUrl: normalizeStringArg(current.rawChatGptListUrl),
    rawAiExtraListUrl: current.rawAiExtraListUrl,
    aiExtraListUrl: normalizeStringArg(current.rawAiExtraListUrl),
    rawDevListUrl: current.rawDevListUrl,
    devListUrl: normalizeStringArg(current.rawDevListUrl),
    rawRuleSourcePreset: current.rawRuleSourcePreset,
    ruleSourcePreset: normalizeRuleSourcePreset(current.rawRuleSourcePreset, DEFAULT_RULE_SOURCE_PRESET),
    rawSteamFix: current.rawSteamFix,
    steamFix: parseBool(current.rawSteamFix, false),
    rawSteamFixUrl: current.rawSteamFixUrl,
    steamFixUrl: normalizeStringArg(current.rawSteamFixUrl)
  };
}

// country-extra-aliases 在 resolveArgs 里同时承担解析、冲突分析和运行态别名缓存输入，这里统一收口。
function buildResolveArgCountryAliasState(payload) {
  const current = isObject(payload) ? payload : {};
  const parsedEntries = parseCountryExtraAliasEntries(current.rawCountryExtraAliases);
  const countryExtraAliasesMap = parsedEntries.map;
  const analysis = analyzeCountryExtraAliasMap(countryExtraAliasesMap);
  const countryCount = Object.keys(countryExtraAliasesMap).length;
  const entryCount = Object.keys(countryExtraAliasesMap).reduce((total, key) => total + countryExtraAliasesMap[key].length, 0);

  return {
    rawCountryExtraAliases: current.rawCountryExtraAliases,
    parsedEntries,
    countryExtraAliasesMap,
    analysis,
    countryExtraAliasCountryCount: countryCount,
    countryExtraAliasEntryCount: entryCount,
    countryExtraAliasPreview: formatCountryExtraAliasPreview(countryExtraAliasesMap, 4, 2, 18),
    countryExtraAliasConflictCount: analysis.conflicts.length,
    countryExtraAliasConflictPreview: formatCountryExtraAliasConflictPreview(analysis.conflicts, 4, 32)
  };
}

// 规则源相关告警集中处理，避免 resolveArgs 主体里继续堆积多段 URL/preset 模板。
function warnResolveArgRuleSourceState(ruleSourceState) {
  const current = isObject(ruleSourceState) ? ruleSourceState : buildResolveArgRuleSourceState();
  const urlDefinitions = [
    { rawValue: current.rawDirectListUrl, value: current.directListUrl, label: "direct-list-url" },
    { rawValue: current.rawCryptoListUrl, value: current.cryptoListUrl, label: "crypto-list-url" },
    { rawValue: current.rawChatGptListUrl, value: current.chatGptListUrl, label: "chatgpt-list-url" },
    { rawValue: current.rawAiExtraListUrl, value: current.aiExtraListUrl, label: "ai-extra-list-url" }
  ];

  emitWarningList(
    urlDefinitions,
    (item) => item.value && !looksLikeHttpUrl(item.value)
      ? `⚠️ 警告: ${item.label} 看起来不像合法 http(s) 地址: ${item.value}`
      : ""
  );

  if (current.rawRuleSourcePreset !== undefined && !["default", "meta", "metacubex", "official", "builtin", "blackmatrix7", "blackmatrix", "bm7", "iosrulescript"].includes(normalizeGroupMarkerToken(current.rawRuleSourcePreset))) {
    emitWarning(`⚠️ 警告: rule-source-preset 无效，已重置为 ${current.ruleSourcePreset}`);
  }

  if (current.rawSteamFixUrl !== undefined && current.steamFixUrl && !looksLikeHttpUrl(current.steamFixUrl)) {
    emitWarning(`⚠️ 警告: steam-fix-url 看起来不是有效的 http(s) 链接，当前建议检查: ${current.steamFixUrl}`);
  }
}

// country-extra-aliases 告警集中处理，减少 resolveArgs 主体里的多段循环。
function warnResolveArgCountryAliasState(countryAliasState) {
  const current = isObject(countryAliasState) ? countryAliasState : buildResolveArgCountryAliasState();

  if (current.rawCountryExtraAliases !== undefined && hasUsableArgValue(current.rawCountryExtraAliases) && !current.countryExtraAliasCountryCount) {
    emitWarning("⚠️ 警告: country-extra-aliases 未解析出任何有效条目，已忽略；请使用 国家:别名1|别名2;国家2:别名3 这种写法");
  }

  if (current.countryExtraAliasCountryCount) {
    emitInvalidEntryWarnings("country-extra-aliases", current.parsedEntries.invalidEntries, "条目无效，已忽略");
    emitInvalidEntryWarnings("country-extra-aliases", current.parsedEntries.unknownCountryMarkers, "未匹配到内置国家定义，已忽略");
    emitInvalidEntryWarnings("country-extra-aliases", current.analysis.customDuplicateConflicts, "同一别名指向多个国家，可能导致识别歧义");
    emitInvalidEntryWarnings("country-extra-aliases", current.analysis.builtInMarkerConflicts, "别名与其他内置国家标记冲突，可能导致优先链歧义");
  }
}

// 把规则源状态拍平成 resolveArgs 返回对象里的字段。
function buildResolveArgRuleSourceResultPayload(ruleSourceState) {
  const current = isObject(ruleSourceState) ? ruleSourceState : buildResolveArgRuleSourceState();

  return {
    directListUrl: current.directListUrl,
    hasDirectListUrl: !!current.directListUrl,
    cryptoListUrl: current.cryptoListUrl,
    hasCryptoListUrl: !!current.cryptoListUrl,
    chatGptListUrl: current.chatGptListUrl,
    hasChatGptListUrl: !!current.chatGptListUrl,
    aiExtraListUrl: current.aiExtraListUrl,
    hasAiExtraListUrl: !!current.aiExtraListUrl,
    devListUrl: current.devListUrl,
    hasDevListUrl: !!current.devListUrl,
    ruleSourcePreset: current.ruleSourcePreset,
    hasRuleSourcePreset: current.rawRuleSourcePreset !== undefined,
    steamFix: current.steamFix,
    hasSteamFix: current.rawSteamFix !== undefined,
    steamFixUrl: current.steamFixUrl,
    hasSteamFixUrl: !!current.steamFixUrl
  };
}

// 把 country-extra-aliases 状态拍平成 resolveArgs 返回对象里的字段。
function buildResolveArgCountryAliasResultPayload(countryAliasState) {
  const current = isObject(countryAliasState) ? countryAliasState : buildResolveArgCountryAliasState();

  return {
    countryExtraAliasesMap: current.countryExtraAliasesMap,
    hasCountryExtraAliases: !!current.countryExtraAliasCountryCount,
    countryExtraAliasCountryCount: current.countryExtraAliasCountryCount,
    countryExtraAliasEntryCount: current.countryExtraAliasEntryCount,
    countryExtraAliasPreview: current.countryExtraAliasPreview,
    countryExtraAliasConflictCount: current.countryExtraAliasConflictCount,
    countryExtraAliasConflictPreview: current.countryExtraAliasConflictPreview
  };
}

// resolveArgs 末尾剩余的 Profile / Runtime / DNS / Kernel 标量参数很多，这里统一收口成状态对象。
function buildResolveArgRuntimeCoreState(payload) {
  const current = isObject(payload) ? payload : {};
  const parsedGeoUpdateInterval = parseNumber(current.rawGeoUpdateInterval, 24);
  const parsedFakeIpTtl = parseNumber(current.rawFakeIpTtl, 1);

  return {
    rawProfileSelected: current.rawProfileSelected,
    profileSelected: parseBool(current.rawProfileSelected, true),
    rawProfileFakeIp: current.rawProfileFakeIp,
    profileFakeIp: parseBool(current.rawProfileFakeIp, true),
    rawFakeIpEnabled: current.rawFakeIpEnabled,
    fakeip: parseBool(current.rawFakeIpEnabled, true),
    rawQuicEnabled: current.rawQuicEnabled,
    quic: parseBool(current.rawQuicEnabled, false),
    rawUnifiedDelay: current.rawUnifiedDelay,
    unifiedDelay: parseBool(current.rawUnifiedDelay, true),
    rawTcpConcurrent: current.rawTcpConcurrent,
    tcpConcurrent: parseBool(current.rawTcpConcurrent, true),
    rawGeoAutoUpdate: current.rawGeoAutoUpdate,
    geoAutoUpdate: parseBool(current.rawGeoAutoUpdate, false),
    rawGeoUpdateInterval: current.rawGeoUpdateInterval,
    parsedGeoUpdateInterval,
    geoUpdateInterval: Math.max(1, parsedGeoUpdateInterval),
    rawGlobalUa: current.rawGlobalUa,
    globalUa: normalizeStringArg(current.rawGlobalUa),
    rawResponseHeaders: current.rawResponseHeaders,
    responseHeaders: parseBool(current.rawResponseHeaders, false),
    rawResponseHeaderPrefix: current.rawResponseHeaderPrefix,
    responseHeaderPrefix: normalizeHeaderPrefix(current.rawResponseHeaderPrefix),
    rawDnsPreferH3: current.rawDnsPreferH3,
    dnsPreferH3: parseBool(current.rawDnsPreferH3, false),
    rawDnsRespectRules: current.rawDnsRespectRules,
    dnsRespectRules: parseBool(current.rawDnsRespectRules, false),
    rawDnsCacheAlgorithm: current.rawDnsCacheAlgorithm,
    dnsCacheAlgorithm: normalizeStringArg(current.rawDnsCacheAlgorithm).toLowerCase(),
    rawDnsUseSystemHosts: current.rawDnsUseSystemHosts,
    dnsUseSystemHosts: parseBool(current.rawDnsUseSystemHosts, true),
    rawFakeIpFilterMode: current.rawFakeIpFilterMode,
    fakeIpFilterMode: normalizeStringArg(current.rawFakeIpFilterMode).toLowerCase(),
    rawFakeIpTtl: current.rawFakeIpTtl,
    parsedFakeIpTtl,
    fakeIpTtl: Math.max(1, parsedFakeIpTtl),
    rawProcessMode: current.rawProcessMode,
    processMode: normalizeStringArg(current.rawProcessMode).toLowerCase(),
    rawGeodataLoader: current.rawGeodataLoader,
    geodataLoader: normalizeStringArg(current.rawGeodataLoader).toLowerCase(),
    rawGeodataMode: current.rawGeodataMode,
    geodataMode: parseBool(current.rawGeodataMode, true),
    rawDnsListen: current.rawDnsListen,
    dnsListen: normalizeStringArg(current.rawDnsListen),
    rawFakeIpRange: current.rawFakeIpRange,
    fakeIpRange: normalizeStringArg(current.rawFakeIpRange),
    rawFakeIpRange6: current.rawFakeIpRange6,
    fakeIpRange6: normalizeStringArg(current.rawFakeIpRange6)
  };
}

// Runtime 数值项目前只剩 geo-update-interval / fake-ip-ttl 两个需要 clamp 告警，这里统一收口。
function warnResolveArgRuntimeCoreState(runtimeCoreState) {
  const current = isObject(runtimeCoreState) ? runtimeCoreState : buildResolveArgRuntimeCoreState();

  warnAdjustedNumericArg(current.rawGeoUpdateInterval, current.parsedGeoUpdateInterval, current.geoUpdateInterval, "geo-update-interval");
  warnAdjustedNumericArg(current.rawFakeIpTtl, current.parsedFakeIpTtl, current.fakeIpTtl, "fake-ip-ttl");
}

// 把 Runtime / DNS / Kernel 主状态拍平成 resolveArgs 返回对象里的字段。
function buildResolveArgRuntimeCoreResultPayload(runtimeCoreState) {
  const current = isObject(runtimeCoreState) ? runtimeCoreState : buildResolveArgRuntimeCoreState();

  return {
    profileSelected: current.profileSelected,
    hasProfileSelected: current.rawProfileSelected !== undefined,
    profileFakeIp: current.profileFakeIp,
    hasProfileFakeIp: current.rawProfileFakeIp !== undefined,
    fakeip: current.fakeip,
    quic: current.quic,
    unifiedDelay: current.unifiedDelay,
    hasUnifiedDelay: current.rawUnifiedDelay !== undefined,
    tcpConcurrent: current.tcpConcurrent,
    hasTcpConcurrent: current.rawTcpConcurrent !== undefined,
    geoAutoUpdate: current.geoAutoUpdate,
    hasGeoAutoUpdate: current.rawGeoAutoUpdate !== undefined,
    geoUpdateInterval: current.geoUpdateInterval,
    hasGeoUpdateInterval: current.rawGeoUpdateInterval !== undefined,
    globalUa: current.globalUa,
    hasGlobalUa: !!current.globalUa,
    responseHeaders: current.responseHeaders,
    hasResponseHeaders: current.rawResponseHeaders !== undefined,
    responseHeaderPrefix: current.responseHeaderPrefix,
    hasResponseHeaderPrefix: typeof current.rawResponseHeaderPrefix === "string" && !!current.rawResponseHeaderPrefix.trim(),
    dnsPreferH3: current.dnsPreferH3,
    hasDnsPreferH3: current.rawDnsPreferH3 !== undefined,
    dnsRespectRules: current.dnsRespectRules,
    hasDnsRespectRules: current.rawDnsRespectRules !== undefined,
    dnsCacheAlgorithm: current.dnsCacheAlgorithm,
    hasDnsCacheAlgorithm: !!current.dnsCacheAlgorithm,
    dnsUseSystemHosts: current.dnsUseSystemHosts,
    hasDnsUseSystemHosts: current.rawDnsUseSystemHosts !== undefined,
    fakeIpFilterMode: current.fakeIpFilterMode,
    hasFakeIpFilterMode: !!current.fakeIpFilterMode,
    fakeIpTtl: current.fakeIpTtl,
    hasFakeIpTtl: current.rawFakeIpTtl !== undefined,
    processMode: current.processMode,
    hasProcessMode: !!current.processMode,
    geodataLoader: current.geodataLoader,
    hasGeodataLoader: !!current.geodataLoader,
    geodataMode: current.geodataMode,
    hasGeodataMode: current.rawGeodataMode !== undefined
  };
}

// DNS 监听地址与 Fake-IP 地址池单独拍平，便于 resolveArgs return 保持原有 threshold 前后顺序。
function buildResolveArgRuntimeDnsAddressResultPayload(runtimeCoreState) {
  const current = isObject(runtimeCoreState) ? runtimeCoreState : buildResolveArgRuntimeCoreState();

  return {
    dnsListen: current.dnsListen,
    hasDnsListen: !!current.dnsListen,
    fakeIpRange: current.fakeIpRange,
    hasFakeIpRange: !!current.fakeIpRange,
    fakeIpRange6: current.fakeIpRange6,
    hasFakeIpRange6: !!current.fakeIpRange6
  };
}

// Sniffer 顶层布尔项与域名名单参数统一收口，避免 resolveArgs return 区继续手写成片字段。
function buildResolveArgSnifferState(payload) {
  const current = isObject(payload) ? payload : {};

  return {
    rawSnifferForceDnsMapping: current.rawSnifferForceDnsMapping,
    snifferForceDnsMapping: parseBool(current.rawSnifferForceDnsMapping, true),
    rawSnifferParsePureIp: current.rawSnifferParsePureIp,
    snifferParsePureIp: parseBool(current.rawSnifferParsePureIp, true),
    rawSnifferOverrideDestination: current.rawSnifferOverrideDestination,
    snifferOverrideDestination: parseBool(current.rawSnifferOverrideDestination, false),
    rawSnifferHttpOverrideDestination: current.rawSnifferHttpOverrideDestination,
    snifferHttpOverrideDestination: parseBool(current.rawSnifferHttpOverrideDestination, true),
    rawSnifferForceDomains: current.rawSnifferForceDomains,
    snifferForceDomains: toStringList(current.rawSnifferForceDomains),
    rawSnifferSkipDomains: current.rawSnifferSkipDomains,
    snifferSkipDomains: toStringList(current.rawSnifferSkipDomains)
  };
}

// 把 Sniffer 状态拍平成 resolveArgs 返回对象里的字段。
function buildResolveArgSnifferResultPayload(snifferState) {
  const current = isObject(snifferState) ? snifferState : buildResolveArgSnifferState();

  return {
    snifferForceDnsMapping: current.snifferForceDnsMapping,
    hasSnifferForceDnsMapping: current.rawSnifferForceDnsMapping !== undefined,
    snifferParsePureIp: current.snifferParsePureIp,
    hasSnifferParsePureIp: current.rawSnifferParsePureIp !== undefined,
    snifferOverrideDestination: current.snifferOverrideDestination,
    hasSnifferOverrideDestination: current.rawSnifferOverrideDestination !== undefined,
    snifferHttpOverrideDestination: current.snifferHttpOverrideDestination,
    hasSnifferHttpOverrideDestination: current.rawSnifferHttpOverrideDestination !== undefined,
    snifferForceDomains: current.snifferForceDomains,
    hasSnifferForceDomains: !!current.snifferForceDomains.length,
    snifferSkipDomains: current.snifferSkipDomains,
    hasSnifferSkipDomains: !!current.snifferSkipDomains.length
  };
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
  // 读取 Dev.list 规则源地址参数原始值。
  const rawDevListUrl = pickArg(args, ["devListUrl", "dev-list-url", "devExtraListUrl", "dev-extra-list-url", "developerListUrl", "developer-list-url"]);
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
  // 尝试把 geo 更新间隔转成数字。
  const parsedGeoUpdateInterval = parseNumber(rawGeoUpdateInterval, 24);
  // 尝试把 fake-ip-ttl 转成数字。
  const parsedFakeIpTtl = parseNumber(rawFakeIpTtl, 1);
  // 再把 threshold 限制在允许范围内。
  const threshold = clampNumber(parsedThreshold, 0, MAX_THRESHOLD);
  // geo 更新间隔至少为 1 小时，避免生成非法配置。
  const geoUpdateInterval = Math.max(1, parsedGeoUpdateInterval);
  // fake-ip-ttl 至少为 1，避免生成非法配置。
  const fakeIpTtl = Math.max(1, parsedFakeIpTtl);
  // 把字符串类参数统一做 trim，后面复用时就不用反复判断。
  const dnsListen = normalizeStringArg(rawDnsListen);
  const fakeIpRange = normalizeStringArg(rawFakeIpRange);
  const fakeIpRange6 = normalizeStringArg(rawFakeIpRange6);
  const ruleSourceResolveState = buildResolveArgRuleSourceState({
    rawDirectListUrl,
    rawCryptoListUrl,
    rawChatGptListUrl,
    rawAiExtraListUrl,
    rawDevListUrl,
    rawRuleSourcePreset,
    rawSteamFix,
    rawSteamFixUrl
  });
  const groupResolveState = buildResolveArgGroupState({
    rawTestUrl,
    rawGroupInterval,
    rawGroupTolerance,
    rawGroupTimeout,
    rawGroupLazy,
    rawGroupMaxFailedTimes,
    rawGroupExpectedStatus,
    rawGroupStrategy,
    rawInterfaceName: rawGroupInterfaceName,
    rawRoutingMark: rawGroupRoutingMark
  });
  const ruleProviderResolveState = buildResolveArgRuleProviderState({
    rawPathDir: rawRuleProviderPathDir,
    rawInterval: rawRuleProviderInterval,
    rawProxy: rawRuleProviderProxy,
    rawSizeLimit: rawRuleProviderSizeLimit,
    rawUserAgent: rawRuleProviderUserAgent,
    rawAuthorization: rawRuleProviderAuthorization,
    rawHeader: rawRuleProviderHeader,
    rawPayload: rawRuleProviderPayload
  });
  const proxyProviderResolveState = buildResolveArgProxyProviderState({
    rawInterval: rawProxyProviderInterval,
    rawProxy: rawProxyProviderProxy,
    rawSizeLimit: rawProxyProviderSizeLimit,
    rawUserAgent: rawProxyProviderUserAgent,
    rawAuthorization: rawProxyProviderAuthorization,
    rawHeader: rawProxyProviderHeader,
    rawPayload: rawProxyProviderPayload,
    rawPathDir: rawProxyProviderPathDir,
    rawFilter: rawProxyProviderFilter,
    rawExcludeFilter: rawProxyProviderExcludeFilter,
    rawExcludeType: rawProxyProviderExcludeType,
    rawOverrideAdditionalPrefix: rawProxyProviderOverrideAdditionalPrefix,
    rawOverrideAdditionalSuffix: rawProxyProviderOverrideAdditionalSuffix,
    rawOverrideUdp: rawProxyProviderOverrideUdp,
    rawOverrideUdpOverTcp: rawProxyProviderOverrideUdpOverTcp,
    rawOverrideDown: rawProxyProviderOverrideDown,
    rawOverrideUp: rawProxyProviderOverrideUp,
    rawOverrideTfo: rawProxyProviderOverrideTfo,
    rawOverrideMptcp: rawProxyProviderOverrideMptcp,
    rawOverrideSkipCertVerify: rawProxyProviderOverrideSkipCertVerify,
    rawOverrideDialerProxy: rawProxyProviderOverrideDialerProxy,
    rawOverrideInterfaceName: rawProxyProviderOverrideInterfaceName,
    rawOverrideRoutingMark: rawProxyProviderOverrideRoutingMark,
    rawOverrideIpVersion: rawProxyProviderOverrideIpVersion,
    rawOverrideProxyName: rawProxyProviderOverrideProxyName,
    rawHealthCheckEnable: rawProxyProviderHealthCheckEnable,
    rawHealthCheckUrl: rawProxyProviderHealthCheckUrl,
    rawHealthCheckInterval: rawProxyProviderHealthCheckInterval,
    rawHealthCheckTimeout: rawProxyProviderHealthCheckTimeout,
    rawHealthCheckLazy: rawProxyProviderHealthCheckLazy,
    rawHealthCheckExpectedStatus: rawProxyProviderHealthCheckExpectedStatus
  });
  const aiPreferCountries = toStringList(rawAiPreferCountries);
  const cryptoPreferCountries = toStringList(rawCryptoPreferCountries);
  const countryAliasResolveState = buildResolveArgCountryAliasState({
    rawCountryExtraAliases
  });
  // 解析完成后立刻刷新运行态缓存，确保后续 parseCountries / preferred-country 等流程读取到的是本轮最新别名。
  COUNTRY_EXTRA_ALIAS_RUNTIME_MAP = isObject(countryAliasResolveState.countryExtraAliasesMap) ? countryAliasResolveState.countryExtraAliasesMap : Object.create(null);
  const steamCnRuleTarget = normalizeStringArg(rawSteamCnRuleTarget);
  const steamCnRuleAnchor = normalizeStringArg(rawSteamCnRuleAnchor);
  const steamCnRulePosition = normalizeRuleOrderPosition(rawSteamCnRulePosition, "before");
  const customRuleAnchor = normalizeStringArg(rawCustomRuleAnchor);
  const customRulePosition = normalizeRuleOrderPosition(rawCustomRulePosition, "before");
  const groupLayoutResolveState = buildResolveArgGroupLayoutState({
    rawGroupOrderPreset,
    rawGroupOrder,
    rawCountryGroupSort,
    rawRegionGroupSort,
    rawRegionGroups
  });
  const snifferForceDomains = toStringList(rawSnifferForceDomains);
  const snifferSkipDomains = toStringList(rawSnifferSkipDomains);
  const responseHeaderPrefix = normalizeHeaderPrefix(rawResponseHeaderPrefix);
  // GitHub / Steam / Dev 三类独立组的大部分参数语义一致，这里统一收口成服务状态表，供告警与最终返回复用。
  const serviceResolveStates = [
    buildResolveArgServiceState({
      key: "github",
      defaultMode: "select",
      defaultType: "select",
      rawTestUrl: rawGithubTestUrl,
      rawGroupInterval: rawGithubGroupInterval,
      rawGroupTolerance: rawGithubGroupTolerance,
      rawGroupTimeout: rawGithubGroupTimeout,
      rawGroupLazy: rawGithubGroupLazy,
      rawGroupMaxFailedTimes: rawGithubGroupMaxFailedTimes,
      rawGroupExpectedStatus: rawGithubGroupExpectedStatus,
      rawGroupStrategy: rawGithubGroupStrategy,
      rawMode: rawGithubMode,
      rawType: rawGithubType,
      rawRuleTarget: rawGithubRuleTarget,
      rawRuleAnchor: rawGithubRuleAnchor,
      rawRulePosition: rawGithubRulePosition,
      rawPreferCountries: rawGithubPreferCountries,
      rawPreferGroups: rawGithubPreferGroups,
      rawPreferNodes: rawGithubPreferNodes,
      rawInterfaceName: rawGithubInterfaceName,
      rawRoutingMark: rawGithubRoutingMark,
      rawUseProviders: rawGithubUseProviders,
      rawIncludeAll: rawGithubIncludeAll,
      rawIncludeAllProviders: rawGithubIncludeAllProviders,
      rawIncludeAllProxies: rawGithubIncludeAllProxies,
      rawHidden: rawGithubHidden,
      rawDisableUdp: rawGithubDisableUdp,
      rawIcon: rawGithubIcon,
      rawNodeFilter: rawGithubNodeFilter,
      rawNodeExcludeFilter: rawGithubNodeExcludeFilter,
      rawNodeExcludeType: rawGithubNodeExcludeType
    }),
    buildResolveArgServiceState({
      key: "steam",
      defaultMode: "direct",
      defaultType: "select",
      rawTestUrl: rawSteamTestUrl,
      rawGroupInterval: rawSteamGroupInterval,
      rawGroupTolerance: rawSteamGroupTolerance,
      rawGroupTimeout: rawSteamGroupTimeout,
      rawGroupLazy: rawSteamGroupLazy,
      rawGroupMaxFailedTimes: rawSteamGroupMaxFailedTimes,
      rawGroupExpectedStatus: rawSteamGroupExpectedStatus,
      rawGroupStrategy: rawSteamGroupStrategy,
      rawMode: rawSteamMode,
      rawType: rawSteamType,
      rawRuleTarget: rawSteamRuleTarget,
      rawRuleAnchor: rawSteamRuleAnchor,
      rawRulePosition: rawSteamRulePosition,
      rawPreferCountries: rawSteamPreferCountries,
      rawPreferGroups: rawSteamPreferGroups,
      rawPreferNodes: rawSteamPreferNodes,
      rawInterfaceName: rawSteamInterfaceName,
      rawRoutingMark: rawSteamRoutingMark,
      rawUseProviders: rawSteamUseProviders,
      rawIncludeAll: rawSteamIncludeAll,
      rawIncludeAllProviders: rawSteamIncludeAllProviders,
      rawIncludeAllProxies: rawSteamIncludeAllProxies,
      rawHidden: rawSteamHidden,
      rawDisableUdp: rawSteamDisableUdp,
      rawIcon: rawSteamIcon,
      rawNodeFilter: rawSteamNodeFilter,
      rawNodeExcludeFilter: rawSteamNodeExcludeFilter,
      rawNodeExcludeType: rawSteamNodeExcludeType
    }),
    buildResolveArgServiceState({
      key: "dev",
      defaultMode: "select",
      defaultType: "select",
      rawTestUrl: rawDevTestUrl,
      rawGroupInterval: rawDevGroupInterval,
      rawGroupTolerance: rawDevGroupTolerance,
      rawGroupTimeout: rawDevGroupTimeout,
      rawGroupLazy: rawDevGroupLazy,
      rawGroupMaxFailedTimes: rawDevGroupMaxFailedTimes,
      rawGroupExpectedStatus: rawDevGroupExpectedStatus,
      rawGroupStrategy: rawDevGroupStrategy,
      rawMode: rawDevMode,
      rawType: rawDevType,
      rawRuleTarget: rawDevRuleTarget,
      rawRuleAnchor: rawDevRuleAnchor,
      rawRulePosition: rawDevRulePosition,
      rawPreferCountries: rawDevPreferCountries,
      rawPreferGroups: rawDevPreferGroups,
      rawPreferNodes: rawDevPreferNodes,
      rawInterfaceName: rawDevInterfaceName,
      rawRoutingMark: rawDevRoutingMark,
      rawUseProviders: rawDevUseProviders,
      rawIncludeAll: rawDevIncludeAll,
      rawIncludeAllProviders: rawDevIncludeAllProviders,
      rawIncludeAllProxies: rawDevIncludeAllProxies,
      rawHidden: rawDevHidden,
      rawDisableUdp: rawDevDisableUdp,
      rawIcon: rawDevIcon,
      rawNodeFilter: rawDevNodeFilter,
      rawNodeExcludeFilter: rawDevNodeExcludeFilter,
      rawNodeExcludeType: rawDevNodeExcludeType
    })
  ];
  // 全局测速组与布局字段也提前展开，避免 return 区继续维护成片平铺属性。
  const resolvedGroupArgPayload = buildResolveArgGroupResultPayload(groupResolveState);
  const resolvedGroupLayoutArgPayload = buildResolveArgGroupLayoutResultPayload(groupLayoutResolveState);
  // 规则源与 country-extra-aliases 字段也统一拍平，避免 return 区继续手写大段重复键。
  const resolvedRuleSourceArgPayload = buildResolveArgRuleSourceResultPayload(ruleSourceResolveState);
  const resolvedCountryAliasArgPayload = buildResolveArgCountryAliasResultPayload(countryAliasResolveState);
  // 预先展开服务相关返回字段，避免 return 区继续手写三套近似属性。
  const resolvedServiceArgPayload = buildResolveArgServiceResultPayload(serviceResolveStates);
  // provider 相关字段也提前展开，避免 return 区继续维护大段平铺属性。
  const resolvedProviderArgPayload = buildResolveArgProviderResultPayload(ruleProviderResolveState, proxyProviderResolveState);

  // 如果用户传入值被修正了，就打印一条警告帮助定位问题。
  if (parsedThreshold !== threshold) {
    emitWarning(`⚠️ 警告: threshold 超出范围，已重置为 ${threshold}`);
  }

  // 全局测速组的规范化与诊断逻辑已收口到状态 helper，这里直接复用。
  warnResolveArgGroupState(groupResolveState);

  // 规则源参数与 country-extra-aliases 的告警也统一收口，减少 resolveArgs 主体里的样板判断。
  warnResolveArgRuleSourceState(ruleSourceResolveState);
  warnResolveArgCountryAliasState(countryAliasResolveState);

  // GitHub / Steam / Dev 三类独立组的所有参数告警统一走共享 helper，减少 resolveArgs 主体里的重复循环。
  warnResolveArgServiceStates(serviceResolveStates);

  // rule-provider / proxy-provider 的解析与诊断逻辑已收口到状态 helper，这里直接复用。
  warnResolveArgRuleProviderState(ruleProviderResolveState);
  warnResolveArgProxyProviderState(proxyProviderResolveState);

  // 如果 geo 更新间隔被修正，也打印提示。
  if (rawGeoUpdateInterval !== undefined && parsedGeoUpdateInterval !== geoUpdateInterval) {
    emitWarning(`⚠️ 警告: geo-update-interval 无效，已重置为 ${geoUpdateInterval}`);
  }

  // 官方文档已将 interface-name 标记为 deprecated，这里主动提醒，避免长期依赖。
  if (groupResolveState.interfaceName || serviceResolveStates.some((serviceState) => !!serviceState.interfaceName)) {
    emitWarning("⚠️ 提醒: Mihomo Proxy Groups 文档已将 interface-name 标记为 deprecated，请仅在必须绑定出口网卡时使用");
  }

  // 官方文档已将 routing-mark 标记为 deprecated，这里主动提醒，避免长期依赖。
  if (groupResolveState.routingMark !== null || serviceResolveStates.some((serviceState) => serviceState.routingMark !== null)) {
    emitWarning("⚠️ 提醒: Mihomo Proxy Groups 文档已将 routing-mark 标记为 deprecated，请仅在必须配合策略路由打标时使用");
  }

  // 如果 SteamCN 规则顺序位置非法，则回退默认值并提示。
  if (rawSteamCnRulePosition !== undefined && normalizeStringArg(rawSteamCnRulePosition).toLowerCase() !== steamCnRulePosition) {
    emitWarning(`⚠️ 警告: steam-cn-rule-position 无效，已重置为 ${steamCnRulePosition}`);
  }

  // 如果 custom-rule-position 非法，则回退默认值并提示。
  if (rawCustomRulePosition !== undefined && normalizeStringArg(rawCustomRulePosition).toLowerCase() !== customRulePosition) {
    emitWarning(`⚠️ 警告: custom-rule-position 无效，已重置为 ${customRulePosition}`);
  }

  // 布局参数告警同样已收口到状态 helper，避免 resolveArgs 主体继续堆积模板。
  warnResolveArgGroupLayoutState(groupLayoutResolveState);

  // 如果 fake-ip-ttl 被修正，也打印提示。
  if (rawFakeIpTtl !== undefined && parsedFakeIpTtl !== fakeIpTtl) {
    emitWarning(`⚠️ 警告: fake-ip-ttl 无效，已重置为 ${fakeIpTtl}`);
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
    // 规则源字段统一由规则源状态表展开，避免 return 区继续维护 URL/preset/steam-fix 多段平铺属性。
    ...resolvedRuleSourceArgPayload,
    // rule-provider / proxy-provider 字段统一由 provider 状态表展开，避免 return 区继续维护一长串重复属性。
    ...resolvedProviderArgPayload,
    // 允许用参数覆盖 AI / Crypto 的国家优先链。
    aiPreferCountries,
    hasAiPreferCountries: !!aiPreferCountries.length,
    cryptoPreferCountries,
    hasCryptoPreferCountries: !!cryptoPreferCountries.length,
    // country-extra-aliases 字段统一由国家别名状态表展开，避免 return 区继续维护冲突/预览等派生字段。
    ...resolvedCountryAliasArgPayload,
    // 全局测速组与布局字段也统一由状态表展开，避免 return 区继续堆积重复属性。
    ...resolvedGroupArgPayload,
    ...resolvedGroupLayoutArgPayload,
    // GitHub / Steam / Dev 三类独立组的解析字段统一由状态表展开，避免 return 区继续维护三套重复键。
    ...resolvedServiceArgPayload,
    steamCnRuleTarget,
    hasSteamCnRuleTarget: !!steamCnRuleTarget,
    steamCnRuleAnchor,
    hasSteamCnRuleAnchor: !!steamCnRuleAnchor,
    steamCnRulePosition,
    hasSteamCnRulePosition: rawSteamCnRulePosition !== undefined,
    customRuleAnchor,
    hasCustomRuleAnchor: !!customRuleAnchor,
    customRulePosition,
    hasCustomRulePosition: rawCustomRulePosition !== undefined,
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

// 统一把 provider type 解析成可复用的布尔标记，供 apply/mutation 两条统计链共用。
function buildProviderCapabilityTypeInfo(provider, fallbackType) {
  const current = isObject(provider) ? provider : {};
  const type = normalizeStringArg(current.type || fallbackType || "http").toLowerCase() || "http";
  return {
    type,
    isHttpProvider: type === "http",
    isFileProvider: type === "file",
    isInlineProvider: type === "inline"
  };
}

// mutation 阶段通常要同时看 before/after 的 type；这里统一按 after -> before -> fallback 的顺序回退。
function buildProviderCapabilityTypeInfoFromPair(beforeProvider, afterProvider, fallbackType) {
  return buildProviderCapabilityTypeInfo({
    type: isObject(afterProvider) && hasOwn(afterProvider, "type")
      ? afterProvider.type
      : (isObject(beforeProvider) ? beforeProvider.type : fallbackType)
  }, fallbackType);
}

// definitions 里的 enabled 既可能是布尔值也可能是函数，这里统一转成最终布尔结果。
function isProviderCapabilityEnabled(definition) {
  if (!definition) {
    return false;
  }

  return typeof definition.enabled === "function"
    ? !!definition.enabled()
    : !!definition.enabled;
}

// 某些能力只作用于 http/inline provider；match 统一在这里执行，调用方不再手写类型分支。
function shouldTrackProviderCapability(definition, typeInfo, provider, name) {
  if (!definition || typeof definition.match !== "function") {
    return true;
  }

  return !!definition.match(isObject(typeInfo) ? typeInfo : {}, provider, name);
}

// 把 capability key + Added/Overrode/Noop 统一转成 stats 字段名，避免各处手写字符串拼接。
function buildProviderCapabilityStatKey(capabilityKey, suffix) {
  const token = String(suffix || "");
  return `${String(capabilityKey || "")}${token ? `${token.charAt(0).toUpperCase()}${token.slice(1)}` : ""}`;
}

// apply 统计固定都会带 total/http/file/inline/other/invalid，再额外挂每类 capability 的 xxxHit。
function createProviderApplyStatsShell(definitions) {
  const stats = {
    total: 0,
    http: 0,
    file: 0,
    inline: 0,
    other: 0,
    invalid: 0
  };

  for (const definition of Array.isArray(definitions) ? definitions : []) {
    if (!definition || !definition.key) {
      continue;
    }
    stats[buildProviderCapabilityStatKey(definition.key, "Hit")] = 0;
  }

  return stats;
}

// apply 预览里每类 capability 只需要一组名称数组样本。
function createProviderApplyPreviewShell(definitions) {
  const preview = {};
  for (const definition of Array.isArray(definitions) ? definitions : []) {
    if (!definition || !definition.key) {
      continue;
    }
    preview[definition.key] = [];
  }
  return preview;
}

// mutation 统计里每类 capability 都需要 added/overrode/noop 三元组计数。
function createProviderMutationStatsShell(definitions) {
  const stats = { total: 0 };
  for (const definition of Array.isArray(definitions) ? definitions : []) {
    if (!definition || !definition.key) {
      continue;
    }

    for (const suffix of ["Added", "Overrode", "Noop"]) {
      stats[buildProviderCapabilityStatKey(definition.key, suffix)] = 0;
    }
  }

  return stats;
}

// mutation 预览里每类 capability 都保留 added/overrode/noop 三个名称样本桶。
function createProviderMutationPreviewShell(definitions) {
  const preview = {};
  for (const definition of Array.isArray(definitions) ? definitions : []) {
    if (!definition || !definition.key) {
      continue;
    }
    preview[definition.key] = createProviderMutationPreviewEntry();
  }
  return preview;
}

// provider 类型统计属于固定维度，这里统一写进对应桶，避免 rule/proxy 两边各写一份分支。
function appendProviderTypeStats(stats, typeInfo) {
  const target = isObject(stats) ? stats : {};
  const currentTypeInfo = isObject(typeInfo) ? typeInfo : {};
  if (currentTypeInfo.isHttpProvider) {
    target.http += 1;
    return target;
  }

  if (currentTypeInfo.isFileProvider) {
    target.file += 1;
    return target;
  }

  if (currentTypeInfo.isInlineProvider) {
    target.inline += 1;
    return target;
  }

  target.other += 1;
  return target;
}

// definitions 驱动的 apply 统计：统一完成类型分桶与 capability hit 计数。
function analyzeProviderApplyStatsByDefinitions(providers, definitions, fallbackType) {
  const source = isObject(providers) ? providers : {};
  const capabilityDefinitions = Array.isArray(definitions) ? definitions : [];
  const stats = createProviderApplyStatsShell(capabilityDefinitions);

  for (const name of Object.keys(source)) {
    const provider = source[name];
    stats.total += 1;

    if (!isObject(provider)) {
      stats.invalid += 1;
      continue;
    }

    const typeInfo = buildProviderCapabilityTypeInfo(provider, fallbackType);
    appendProviderTypeStats(stats, typeInfo);

    for (const definition of capabilityDefinitions) {
      if (!definition || !definition.key || !isProviderCapabilityEnabled(definition) || !shouldTrackProviderCapability(definition, typeInfo, provider, name)) {
        continue;
      }

      stats[buildProviderCapabilityStatKey(definition.key, "Hit")] += 1;
    }
  }

  return stats;
}

// definitions 驱动的 apply 预览：和 apply stats 同口径，只保留命中名称样本。
function analyzeProviderApplyPreviewByDefinitions(providers, definitions, fallbackType) {
  const source = isObject(providers) ? providers : {};
  const capabilityDefinitions = Array.isArray(definitions) ? definitions : [];
  const preview = createProviderApplyPreviewShell(capabilityDefinitions);

  for (const name of Object.keys(source)) {
    const provider = source[name];
    if (!isObject(provider)) {
      continue;
    }

    const typeInfo = buildProviderCapabilityTypeInfo(provider, fallbackType);
    for (const definition of capabilityDefinitions) {
      if (!definition || !definition.key || !isProviderCapabilityEnabled(definition) || !shouldTrackProviderCapability(definition, typeInfo, provider, name)) {
        continue;
      }

      preview[definition.key].push(name);
    }
  }

  return preview;
}

// definitions 驱动的 mutation 统计：统一完成 added/overrode/noop 三类计数。
function analyzeProviderMutationStatsByDefinitions(beforeProviders, afterProviders, definitions, fallbackType) {
  const source = isObject(beforeProviders) ? beforeProviders : {};
  const target = isObject(afterProviders) ? afterProviders : {};
  const capabilityDefinitions = Array.isArray(definitions) ? definitions : [];
  const stats = createProviderMutationStatsShell(capabilityDefinitions);

  for (const name of Object.keys(target)) {
    const beforeProvider = isObject(source[name]) ? source[name] : {};
    const afterProvider = target[name];
    if (!isObject(afterProvider)) {
      continue;
    }

    stats.total += 1;
    const typeInfo = buildProviderCapabilityTypeInfoFromPair(beforeProvider, afterProvider, fallbackType);

    for (const definition of capabilityDefinitions) {
      if (
        !definition ||
        !definition.key ||
        !Array.isArray(definition.mutationKeys) ||
        !definition.mutationKeys.length ||
        !isProviderCapabilityEnabled(definition) ||
        !shouldTrackProviderCapability(definition, typeInfo, afterProvider, name)
      ) {
        continue;
      }

      const mutation = analyzeProviderMutationByKeys(beforeProvider, afterProvider, definition.mutationKeys);
      if (mutation.added) {
        stats[buildProviderCapabilityStatKey(definition.key, "Added")] += 1;
      }
      if (mutation.overrode) {
        stats[buildProviderCapabilityStatKey(definition.key, "Overrode")] += 1;
      }
      if (mutation.noop) {
        stats[buildProviderCapabilityStatKey(definition.key, "Noop")] += 1;
      }
    }
  }

  return stats;
}

// definitions 驱动的 mutation 预览：和 mutation stats 保持同口径，只追加样本名称。
function analyzeProviderMutationPreviewByDefinitions(beforeProviders, afterProviders, definitions, fallbackType) {
  const source = isObject(beforeProviders) ? beforeProviders : {};
  const target = isObject(afterProviders) ? afterProviders : {};
  const capabilityDefinitions = Array.isArray(definitions) ? definitions : [];
  const preview = createProviderMutationPreviewShell(capabilityDefinitions);

  for (const name of Object.keys(target)) {
    const beforeProvider = isObject(source[name]) ? source[name] : {};
    const afterProvider = target[name];
    if (!isObject(afterProvider)) {
      continue;
    }

    const typeInfo = buildProviderCapabilityTypeInfoFromPair(beforeProvider, afterProvider, fallbackType);
    for (const definition of capabilityDefinitions) {
      if (
        !definition ||
        !definition.key ||
        !Array.isArray(definition.mutationKeys) ||
        !definition.mutationKeys.length ||
        !isProviderCapabilityEnabled(definition) ||
        !shouldTrackProviderCapability(definition, typeInfo, afterProvider, name)
      ) {
        continue;
      }

      appendProviderMutationPreviewEntry(
        preview[definition.key],
        name,
        analyzeProviderMutationByKeys(beforeProvider, afterProvider, definition.mutationKeys)
      );
    }
  }

  return preview;
}

// apply 统计输出统一按 definitions 拼成 `path-hit=...` 这类紧凑片段，避免 rule/proxy 两边各维护一串模板。
function formatProviderApplyStatsByDefinitions(stats, definitions) {
  const source = isObject(stats) ? stats : {};
  return [
    `total=${Number(source.total) || 0}`,
    `http=${Number(source.http) || 0}`,
    `file=${Number(source.file) || 0}`,
    `inline=${Number(source.inline) || 0}`,
    `other=${Number(source.other) || 0}`,
    `invalid=${Number(source.invalid) || 0}`
  ].concat(
    (Array.isArray(definitions) ? definitions : [])
      .filter((definition) => definition && definition.key)
      .map((definition) => `${definition.label || definition.key}-hit=${isProviderCapabilityEnabled(definition) ? (Number(source[buildProviderCapabilityStatKey(definition.key, "Hit")]) || 0) : "off"}`)
  ).join(",");
}

// apply 预览输出同样统一按 definitions 拼接。
function formatProviderApplyPreviewByDefinitions(preview, definitions) {
  const source = isObject(preview) ? preview : {};
  return (Array.isArray(definitions) ? definitions : [])
    .filter((definition) => definition && definition.key)
    .map((definition) => formatProviderPreviewEntry(definition.label || definition.key, source[definition.key], isProviderCapabilityEnabled(definition)))
    .join(",");
}

// mutation 统计输出统一按 definitions 拉平成 added/overrode/noop 三元组，减少长模板字符串。
function formatProviderMutationStatsByDefinitions(stats, definitions) {
  const source = isObject(stats) ? stats : {};
  const entries = [`total=${Number(source.total) || 0}`];

  for (const definition of Array.isArray(definitions) ? definitions : []) {
    if (!definition || !definition.key) {
      continue;
    }

    const label = definition.label || definition.key;
    const enabled = isProviderCapabilityEnabled(definition);
    entries.push(`${label}-added=${enabled ? (Number(source[buildProviderCapabilityStatKey(definition.key, "Added")]) || 0) : "off"}`);
    entries.push(`${label}-overrode=${enabled ? (Number(source[buildProviderCapabilityStatKey(definition.key, "Overrode")]) || 0) : "off"}`);
    entries.push(`${label}-noop=${enabled ? (Number(source[buildProviderCapabilityStatKey(definition.key, "Noop")]) || 0) : "off"}`);
  }

  return entries.join(",");
}

// mutation 样本预览也统一按 definitions 驱动，避免每新增一类 capability 都要手工改一遍 join 模板。
function formatProviderMutationPreviewByDefinitions(preview, definitions) {
  const source = isObject(preview) ? preview : {};
  return (Array.isArray(definitions) ? definitions : [])
    .filter((definition) => definition && definition.key)
    .map((definition) => formatProviderMutationPreviewEntry(definition.label || definition.key, source[definition.key], isProviderCapabilityEnabled(definition)))
    .join(",");
}

// rule-provider 的 path/download/payload 三类 capability 现在统一集中维护，apply 与 mutation 两条链都复用这份定义。
const RULE_PROVIDER_CAPABILITY_DEFINITIONS = Object.freeze([
  Object.freeze({
    key: "path",
    label: "path",
    enabled: () => typeof ARGS !== "undefined" && ARGS && ARGS.hasRuleProviderPathDir,
    match: (typeInfo) => typeInfo.isHttpProvider,
    mutationKeys: ["path"]
  }),
  Object.freeze({
    key: "download",
    label: "download",
    enabled: () => hasRuleProviderDownloadConfiguredOptions(),
    match: (typeInfo) => typeInfo.isHttpProvider,
    mutationKeys: ["interval", "proxy", "size-limit", "header"]
  }),
  Object.freeze({
    key: "payload",
    label: "payload",
    enabled: () => typeof ARGS !== "undefined" && ARGS && ARGS.hasRuleProviderPayload,
    match: (typeInfo) => typeInfo.isInlineProvider,
    mutationKeys: ["payload"]
  })
]);

// proxy-provider 的 capability 更丰富：除 path/download 外，其余几类可作用于所有合法 provider。
const PROXY_PROVIDER_CAPABILITY_DEFINITIONS = Object.freeze([
  Object.freeze({
    key: "path",
    label: "path",
    enabled: () => typeof ARGS !== "undefined" && ARGS && ARGS.hasProxyProviderPathDir,
    match: (typeInfo) => typeInfo.isHttpProvider,
    mutationKeys: ["path"]
  }),
  Object.freeze({
    key: "download",
    label: "download",
    enabled: () => hasProxyProviderDownloadConfiguredOptions(),
    match: (typeInfo) => typeInfo.isHttpProvider,
    mutationKeys: ["interval", "proxy", "size-limit", "header"]
  }),
  Object.freeze({
    key: "payload",
    label: "payload",
    enabled: () => typeof ARGS !== "undefined" && ARGS && ARGS.hasProxyProviderPayload,
    mutationKeys: ["payload"]
  }),
  Object.freeze({
    key: "collection",
    label: "collection",
    enabled: () => hasProxyProviderCollectionConfiguredOptions(),
    mutationKeys: ["filter", "exclude-filter", "exclude-type"]
  }),
  Object.freeze({
    key: "override",
    label: "override",
    enabled: () => hasProxyProviderOverrideConfiguredOptions(),
    mutationKeys: ["override"]
  }),
  Object.freeze({
    key: "healthCheck",
    label: "health-check",
    enabled: () => hasProxyProviderHealthCheckConfiguredOptions(),
    mutationKeys: ["health-check"]
  })
]);

// 统计 rule-provider 在当前参数组合下的实际命中数量，便于把“作用范围”进一步落到真实条目数上。
function analyzeRuleProviderApplyStats(providers) {
  return analyzeProviderApplyStatsByDefinitions(providers, RULE_PROVIDER_CAPABILITY_DEFINITIONS, "http");
}

// 把 rule-provider 命中统计压成紧凑摘要，方便写入 full 日志与响应调试头。
function formatRuleProviderApplyStats(stats) {
  return formatProviderApplyStatsByDefinitions(stats, RULE_PROVIDER_CAPABILITY_DEFINITIONS);
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
  return analyzeProviderApplyPreviewByDefinitions(providers, RULE_PROVIDER_CAPABILITY_DEFINITIONS, "http");
}

// 把 rule-provider 命中样本预览压成紧凑摘要，便于响应调试头与 full 日志复用。
function formatRuleProviderApplyPreview(preview) {
  return formatProviderApplyPreviewByDefinitions(preview, RULE_PROVIDER_CAPABILITY_DEFINITIONS);
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
      // 最终对象里都没有该字段，说明本次无需比较。
      continue;
    }

    compared = true;

    if (beforeHas && areJsonValuesEqual(source[key], target[key])) {
      // 字段存在且值相同，说明这一项属于 noop。
      continue;
    }

    if (!beforeHas) {
      // 原来没有、现在有，记为新增写入。
      result.added = true;
      continue;
    }

    // 原来就有且值变化，记为覆盖旧值。
    result.overrode = true;
  }

  if (compared && !result.added && !result.overrode) {
    // 所有参与比较的字段都未变化，整体标记为 noop。
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
  return analyzeProviderMutationStatsByDefinitions(
    beforeProviders,
    afterProviders,
    RULE_PROVIDER_CAPABILITY_DEFINITIONS,
    "http"
  );
}

// 汇总 rule-provider 的改动样本，便于快速定位哪些 provider 被新增写入、覆盖或保持不变。
function analyzeRuleProviderMutationPreview(beforeProviders, afterProviders) {
  return analyzeProviderMutationPreviewByDefinitions(
    beforeProviders,
    afterProviders,
    RULE_PROVIDER_CAPABILITY_DEFINITIONS,
    "http"
  );
}

// 把 rule-provider 改动统计压成紧凑摘要，便于写入 full 日志与响应调试头。
function formatRuleProviderMutationStats(stats) {
  return formatProviderMutationStatsByDefinitions(stats, RULE_PROVIDER_CAPABILITY_DEFINITIONS);
}

// 把 rule-provider 改动样本预览压成紧凑摘要，便于响应调试头与 full 日志复用。
function formatRuleProviderMutationPreview(preview) {
  return formatProviderMutationPreviewByDefinitions(preview, RULE_PROVIDER_CAPABILITY_DEFINITIONS);
}

// 把最终 rule-provider 做统一定稿：补本地缓存路径，并把 http 类型的下载控制统一接管。
function finalizeRuleProviders(providers) {
  const source = isObject(providers) ? providers : {};
  const usedPaths = buildReservedProviderPaths(source, (provider) => {
    const isHttpProvider = canAutoAssignRuleProviderPath(provider);
    return !(isHttpProvider && ARGS.hasRuleProviderPathDir);
  });
  const result = {};
  const hasDownloadConfiguredOptions = hasRuleProviderDownloadConfiguredOptions();
  const hasPayloadConfiguredOption = ARGS.hasRuleProviderPayload;

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

    // http provider 优先按 path-dir 重新分配缓存路径；非 http 则尽量保留原 path。
    if (isHttpProvider && ARGS.hasRuleProviderPathDir) {
      provider.path = buildRuleProviderPath(name, provider, usedPaths);
    } else if (currentPath && !usedPaths[currentPath]) {
      provider.path = currentPath;
      usedPaths[currentPath] = true;
    } else if (isHttpProvider) {
      provider.path = buildRuleProviderPath(name, provider, usedPaths);
    }

    if (isHttpProvider) {
      applyProviderAssignmentDefinitions(provider, RULE_PROVIDER_HTTP_ASSIGNMENT_DEFINITIONS);
    }

    if (isHttpProvider && hasDownloadConfiguredOptions) {
      // 下载相关 header 统一通过 mergeProviderHeaders 合并，避免把原 header 全部抹掉。
      const headers = buildFinalizedRuleProviderHeaders(provider.header);

      if (headers) {
        provider.header = headers;
      }
    }

    if (isInlineProvider && hasPayloadConfiguredOption) {
      // inline provider 的 payload 直接由脚本参数接管，避免复用外部对象引用。
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

  // 未传 payload 时按“未配置”处理，避免默认空参在脚本初始化阶段产生误报。
  if (source === undefined || source === null) {
    return { items: [], invalidItems: [], parseFailed: false };
  }

  if (typeof source === "string") {
    // 字符串优先尝试按 JSON 解析；失败后再退回到“纯文本规则列表”模式。
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
      // rule-provider payload 每一项都必须是规则字符串。
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
    // proxy-provider payload 必须能解析成 JSON；纯文本模式在这里没有意义。
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
      // 单个节点必须是对象结构，否则后面无法做字段校验与直传。
      invalidItems.push(`payload[${index}] 不是对象`);
      continue;
    }

    const name = normalizeStringArg(item.name);
    const type = normalizeStringArg(item.type);

    if (!name || !type) {
      // name/type 是最小必需字段，缺任一都无法构成合法节点定义。
      invalidItems.push(`payload[${index}] 缺少有效的 name/type`);
      continue;
    }

    // 深拷贝一份，避免外部对象被后续 mutate 时反向污染 ARGS。
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
    // 支持数组、多行文本与 `||` 串联三种常见传参方式。
    const lines = String(sourceItem == null ? "" : sourceItem).replace(/\r/g, "").split(/\n|\|\|/);

    for (const rawLine of lines) {
      const line = normalizeStringArg(rawLine);

      if (!line) {
        continue;
      }

      const arrowIndex = line.indexOf("=>");
      const colonIndex = line.indexOf(":");
      // 同时兼容 `Header: value` 与 `Header=>value` 两套写法。
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

      // 同名 header 保留多个值，交给下游 provider 自己决定是否接受多值头。
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

// 一组“参数命中时把值写回对象字段”的赋值逻辑反复出现在 provider finalize 阶段，这里统一成 definitions 驱动。
function applyProviderAssignmentDefinitions(target, definitions) {
  const result = isObject(target) ? target : {};
  if (typeof ARGS === "undefined" || !ARGS) {
    return result;
  }
  for (const definition of Array.isArray(definitions) ? definitions : []) {
    if (!definition || !ARGS[definition.hasArgKey]) {
      continue;
    }

    result[definition.key] = typeof definition.getValue === "function"
      ? definition.getValue(result, definition)
      : ARGS[definition.valueKey];
  }

  return result;
}

// rule-provider 的 http 下载控制只涉及 interval / proxy / size-limit 三个标量字段，统一收成赋值表。
const RULE_PROVIDER_HTTP_ASSIGNMENT_DEFINITIONS = Object.freeze([
  { hasArgKey: "hasRuleProviderInterval", key: "interval", valueKey: "ruleProviderInterval" },
  { hasArgKey: "hasRuleProviderProxy", key: "proxy", valueKey: "ruleProviderProxy" },
  { hasArgKey: "hasRuleProviderSizeLimit", key: "size-limit", valueKey: "ruleProviderSizeLimit" }
]);

// proxy-provider 的 http 下载控制与 rule-provider 同构，但参数前缀不同，单独维护定义避免 finalize 中三段 if 平铺。
const PROXY_PROVIDER_HTTP_ASSIGNMENT_DEFINITIONS = Object.freeze([
  { hasArgKey: "hasProxyProviderInterval", key: "interval", valueKey: "proxyProviderInterval" },
  { hasArgKey: "hasProxyProviderProxy", key: "proxy", valueKey: "proxyProviderProxy" },
  { hasArgKey: "hasProxyProviderSizeLimit", key: "size-limit", valueKey: "proxyProviderSizeLimit" }
]);

// proxy-provider 节点池筛选字段也统一走 definitions，便于后续继续追加 collection 相关参数。
const PROXY_PROVIDER_COLLECTION_ASSIGNMENT_DEFINITIONS = Object.freeze([
  { hasArgKey: "hasProxyProviderFilter", key: "filter", valueKey: "proxyProviderFilter" },
  { hasArgKey: "hasProxyProviderExcludeFilter", key: "exclude-filter", valueKey: "proxyProviderExcludeFilter" },
  { hasArgKey: "hasProxyProviderExcludeType", key: "exclude-type", valueKey: "proxyProviderExcludeType" }
]);

// override 字段较多，统一改成表驱动后，finalizeProxyProviders 就不用再铺十几段 if。
const PROXY_PROVIDER_OVERRIDE_ASSIGNMENT_DEFINITIONS = Object.freeze([
  { hasArgKey: "hasProxyProviderOverrideAdditionalPrefix", key: "additional-prefix", valueKey: "proxyProviderOverrideAdditionalPrefix" },
  { hasArgKey: "hasProxyProviderOverrideAdditionalSuffix", key: "additional-suffix", valueKey: "proxyProviderOverrideAdditionalSuffix" },
  { hasArgKey: "hasProxyProviderOverrideUdp", key: "udp", valueKey: "proxyProviderOverrideUdp" },
  { hasArgKey: "hasProxyProviderOverrideUdpOverTcp", key: "udp-over-tcp", valueKey: "proxyProviderOverrideUdpOverTcp" },
  { hasArgKey: "hasProxyProviderOverrideDown", key: "down", valueKey: "proxyProviderOverrideDown" },
  { hasArgKey: "hasProxyProviderOverrideUp", key: "up", valueKey: "proxyProviderOverrideUp" },
  { hasArgKey: "hasProxyProviderOverrideTfo", key: "tfo", valueKey: "proxyProviderOverrideTfo" },
  { hasArgKey: "hasProxyProviderOverrideMptcp", key: "mptcp", valueKey: "proxyProviderOverrideMptcp" },
  { hasArgKey: "hasProxyProviderOverrideSkipCertVerify", key: "skip-cert-verify", valueKey: "proxyProviderOverrideSkipCertVerify" },
  { hasArgKey: "hasProxyProviderOverrideDialerProxy", key: "dialer-proxy", valueKey: "proxyProviderOverrideDialerProxy" },
  { hasArgKey: "hasProxyProviderOverrideInterfaceName", key: "interface-name", valueKey: "proxyProviderOverrideInterfaceName" },
  { hasArgKey: "hasProxyProviderOverrideRoutingMark", key: "routing-mark", valueKey: "proxyProviderOverrideRoutingMark" },
  { hasArgKey: "hasProxyProviderOverrideIpVersion", key: "ip-version", valueKey: "proxyProviderOverrideIpVersion" },
  {
    hasArgKey: "hasProxyProviderOverrideProxyNameRules",
    key: "proxy-name",
    getValue: () => ARGS.proxyProviderOverrideProxyNameRules.map((rule) => ({ pattern: rule.pattern, target: rule.target }))
  }
]);

// health-check 接管字段也统一 definitions 化，和 override 一样保持“保留原对象 + 按配置覆写”的语义。
const PROXY_PROVIDER_HEALTH_CHECK_ASSIGNMENT_DEFINITIONS = Object.freeze([
  { hasArgKey: "hasProxyProviderHealthCheckEnable", key: "enable", valueKey: "proxyProviderHealthCheckEnable" },
  { hasArgKey: "hasProxyProviderHealthCheckUrl", key: "url", valueKey: "proxyProviderHealthCheckUrl" },
  { hasArgKey: "hasProxyProviderHealthCheckInterval", key: "interval", valueKey: "proxyProviderHealthCheckInterval" },
  { hasArgKey: "hasProxyProviderHealthCheckTimeout", key: "timeout", valueKey: "proxyProviderHealthCheckTimeout" },
  { hasArgKey: "hasProxyProviderHealthCheckLazy", key: "lazy", valueKey: "proxyProviderHealthCheckLazy" },
  { hasArgKey: "hasProxyProviderHealthCheckExpectedStatus", key: "expected-status", valueKey: "proxyProviderHealthCheckExpectedStatus" }
]);

// 统一预登记“本轮不会重写的 provider path”，避免 finalize 阶段每种 provider 再各写一遍 usedPaths 预扫描。
function buildReservedProviderPaths(providers, shouldReservePath) {
  const source = isObject(providers) ? providers : {};
  const reserved = Object.create(null);
  const resolveShouldReservePath = typeof shouldReservePath === "function" ? shouldReservePath : (() => false);
  for (const name of Object.keys(source)) {
    const provider = source[name];
    if (!isObject(provider)) {
      continue;
    }

    const currentPath = normalizeStringArg(provider.path).replace(/\\/g, "/");
    if (!currentPath || !resolveShouldReservePath(provider, name, currentPath) || reserved[currentPath]) {
      continue;
    }

    reserved[currentPath] = true;
  }

  return reserved;
}

// rule-provider header 合并规则单独收口，保持 finalizeRuleProviders 只关心“何时应用”，不关心“怎么拼 header”。
function buildFinalizedRuleProviderHeaders(baseHeaders) {
  return mergeProviderHeaders(
    baseHeaders,
    ARGS.hasRuleProviderUserAgent ? ARGS.ruleProviderUserAgent : "",
    ARGS.hasRuleProviderAuthorization ? ARGS.ruleProviderAuthorization : "",
    ARGS.hasRuleProviderHeader ? ARGS.ruleProviderHeader : {}
  );
}

// proxy-provider header 合并规则和 rule-provider 平行，但参数源不同，拆开后更容易单独维护。
function buildFinalizedProxyProviderHeaders(baseHeaders) {
  return mergeProviderHeaders(
    baseHeaders,
    ARGS.hasProxyProviderUserAgent ? ARGS.proxyProviderUserAgent : "",
    ARGS.hasProxyProviderAuthorization ? ARGS.proxyProviderAuthorization : "",
    ARGS.hasProxyProviderHeader ? ARGS.proxyProviderHeader : {}
  );
}

// override 始终在原 override 基础上浅合并，再按 definitions 覆写，保持旧行为不变。
function buildFinalizedProxyProviderOverride(baseOverride) {
  return applyProviderAssignmentDefinitions(
    mergeObjects(baseOverride, {}),
    PROXY_PROVIDER_OVERRIDE_ASSIGNMENT_DEFINITIONS
  );
}

// health-check 同理：保留原对象后再按脚本参数批量接管。
function buildFinalizedProxyProviderHealthCheck(baseHealthCheck) {
  return applyProviderAssignmentDefinitions(
    mergeObjects(baseHealthCheck, {}),
    PROXY_PROVIDER_HEALTH_CHECK_ASSIGNMENT_DEFINITIONS
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
  return analyzeProviderApplyStatsByDefinitions(proxyProviders, PROXY_PROVIDER_CAPABILITY_DEFINITIONS, "http");
}

// 把 proxy-provider 命中统计压成紧凑摘要，方便写入 full 日志与响应调试头。
function formatProxyProviderApplyStats(stats) {
  return formatProviderApplyStatsByDefinitions(stats, PROXY_PROVIDER_CAPABILITY_DEFINITIONS);
}

// 汇总 proxy-provider 实际命中的名称样本，便于快速定位具体 provider。
function analyzeProxyProviderApplyPreview(proxyProviders) {
  return analyzeProviderApplyPreviewByDefinitions(proxyProviders, PROXY_PROVIDER_CAPABILITY_DEFINITIONS, "http");
}

// 把 proxy-provider 命中样本预览压成紧凑摘要，便于响应调试头与 full 日志复用。
function formatProxyProviderApplyPreview(preview) {
  return formatProviderApplyPreviewByDefinitions(preview, PROXY_PROVIDER_CAPABILITY_DEFINITIONS);
}

// 统计 proxy-provider 参数最终是新增字段还是覆盖旧字段，帮助区分“补全”与“替换”。
function analyzeProxyProviderMutationStats(beforeProviders, afterProviders) {
  return analyzeProviderMutationStatsByDefinitions(
    beforeProviders,
    afterProviders,
    PROXY_PROVIDER_CAPABILITY_DEFINITIONS,
    "http"
  );
}

// 汇总 proxy-provider 的改动样本，便于快速定位哪些 provider 被新增写入、覆盖或保持不变。
function analyzeProxyProviderMutationPreview(beforeProviders, afterProviders) {
  return analyzeProviderMutationPreviewByDefinitions(
    beforeProviders,
    afterProviders,
    PROXY_PROVIDER_CAPABILITY_DEFINITIONS,
    "http"
  );
}

// 把 proxy-provider 改动统计压成紧凑摘要，便于写入 full 日志与响应调试头。
function formatProxyProviderMutationStats(stats) {
  return formatProviderMutationStatsByDefinitions(stats, PROXY_PROVIDER_CAPABILITY_DEFINITIONS);
}

// 把 proxy-provider 改动样本预览压成紧凑摘要，便于响应调试头与 full 日志复用。
function formatProxyProviderMutationPreview(preview) {
  return formatProviderMutationPreviewByDefinitions(preview, PROXY_PROVIDER_CAPABILITY_DEFINITIONS);
}

// 统一增强现有 proxy-providers，便于批量接入下载控制与 health-check 参数。
function finalizeProxyProviders(existingProviders) {
  const source = isObject(existingProviders) ? existingProviders : {};
  const result = {};
  const usedPaths = buildReservedProviderPaths(source, (provider) => {
    const type = normalizeStringArg(provider && provider.type).toLowerCase();
    return !(type === "http" && ARGS.hasProxyProviderPathDir);
  });
  const hasOverrideOptions = hasProxyProviderOverrideConfiguredOptions();
  const hasHealthCheckOptions = hasProxyProviderHealthCheckConfiguredOptions();

  for (const name of Object.keys(source)) {
    const currentProvider = source[name];
    if (!isObject(currentProvider)) {
      result[name] = currentProvider;
      continue;
    }

    const provider = Object.assign({}, currentProvider);
    const type = normalizeStringArg(provider.type).toLowerCase();
    const isHttpProvider = type === "http";

    // http provider 的缓存 path 可以由脚本统一接管；其余类型保留原状。
    if (isHttpProvider && ARGS.hasProxyProviderPathDir) {
      provider.path = buildProxyProviderPath(name, provider, usedPaths);
    }

    // payload/collection/override/health-check 这几类能力不完全依赖 http，因此可作用于更多 provider 类型。
    if (ARGS.hasProxyProviderPayload) {
      provider.payload = cloneJsonCompatibleValue(ARGS.proxyProviderPayload, []);
    }

    if (isHttpProvider) {
      applyProviderAssignmentDefinitions(provider, PROXY_PROVIDER_HTTP_ASSIGNMENT_DEFINITIONS);
    }

    if (isHttpProvider && (ARGS.hasProxyProviderHeader || ARGS.hasProxyProviderUserAgent || ARGS.hasProxyProviderAuthorization)) {
      const headers = buildFinalizedProxyProviderHeaders(provider.header);
      if (headers) {
        provider.header = headers;
      }
    }

    applyProviderAssignmentDefinitions(provider, PROXY_PROVIDER_COLLECTION_ASSIGNMENT_DEFINITIONS);

    if (hasOverrideOptions) {
      provider.override = buildFinalizedProxyProviderOverride(provider.override);
    }

    if (hasHealthCheckOptions) {
      provider["health-check"] = buildFinalizedProxyProviderHealthCheck(provider["health-check"]);
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

// 通用 blackmatrix7 Clash YAML 规则提供器；开发服务组与后续补充的社区细分组都复用它。
function createCommunityClashRuleProvider(name) {
  return createRuleProvider("classical", blackmatrix7ClashRule(name), "yaml");
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
  return createCommunityClashRuleProvider(name);
}

// 统一合并官方 `$options` 与 `$arguments`，并让显式 `$arguments` 保持更高优先级。
const RAW_OPTIONS = typeof $options !== "undefined" ? $options : {};
// 某些宿主会把用户参数挂到 `$arguments`，这里单独兜底读取。
const RAW_ARGUMENTS = typeof $arguments !== "undefined" ? $arguments : {};
// 查询字符串中的参数会额外影响下载链接语义与运行态诊断。
const RUNTIME_QUERY_ARGS = parseRuntimeQueryArgs(RAW_OPTIONS);
// 下载链接相关的官方查询参数单独抽出来，方便后面做语义摘要。
const RUNTIME_LINK_OPTIONS = resolveRuntimeLinkOptions(RAW_OPTIONS);
// `$options` 统一标准化成脚本内部使用的 kebab/camel 兼容参数对象。
const NORMALIZED_OPTION_ARGS = normalizeScriptArgs(RAW_OPTIONS);
// `$arguments` 同样走一遍标准化，保证两个入口合并前结构一致。
const NORMALIZED_ARGUMENT_ARGS = normalizeScriptArgs(RAW_ARGUMENTS);
// 最终参数按“查询参数 < `$options` < `$arguments`”优先级合并，供后续 ARGS 解析复用。
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
  // 本地开发补充规则，用来承接社区规则未完全覆盖的开发域名。
  // 这层本地补丁现在除了 GitLab / Docker / JetBrains 之外，也会继续吸收 Bun / JSR / NuGet / Composer / Dart / Flutter / Swift / CocoaPods / Hex 等包管理与语言生态域名。
  DevList: createRuleProvider("classical", ARGS.hasDevListUrl ? ARGS.devListUrl : DEV_LIST_URL, "text"),
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
  // Discord 社区/语音协作规则。
  Discord: createCommunityClashRuleProvider("Discord"),
  // Telegram 规则。
  Telegram: createRuleProvider("domain", metaGeoSite("telegram")),
  // WhatsApp 通讯规则。
  WhatsApp: createCommunityClashRuleProvider("Whatsapp"),
  // LINE 通讯规则。
  Line: createCommunityClashRuleProvider("Line"),
  // Instagram 社交规则。
  Instagram: createCommunityClashRuleProvider("Instagram"),
  // Facebook / Meta 社交规则。
  Facebook: createCommunityClashRuleProvider("Facebook"),
  // Twitter / X 社交规则。
  Twitter: createCommunityClashRuleProvider("Twitter"),
  // Reddit 社区规则。
  Reddit: createCommunityClashRuleProvider("Reddit"),
  // Threads 归并进 Facebook 组，避免和 Instagram / Facebook 再额外拆出一个低收益面板组。
  Threads: createCommunityClashRuleProvider("Threads"),
  // Pinterest 归并进 Instagram 组，统一视觉社交流量。
  Pinterest: createCommunityClashRuleProvider("Pinterest"),
  // Pixiv / FANBOX / Booth 归并进 Instagram 组，继续统一视觉创作者社区入口。
  Pixiv: createCommunityClashRuleProvider("Pixiv"),
  // Imgur 图片社区也并入 Instagram 组，继续收口图片/视觉社交流量。
  Imgur: createCommunityClashRuleProvider("Imgur"),
  // YouTube Music 归并进 YouTube 组，保持影音平台的面板数量稳定。
  YouTubeMusic: createCommunityClashRuleProvider("YouTubeMusic"),
  // Netflix 规则。
  Netflix: createRuleProvider("domain", metaGeoSite("netflix")),
  // Disney 规则。
  Disney: createRuleProvider("domain", metaGeoSite("disney")),
  // Spotify 规则。
  Spotify: createRuleProvider("domain", metaGeoSite("spotify")),
  // TikTok 规则。
  TikTok: createRuleProvider("domain", metaGeoSite("tiktok")),
  // BiliBili 国际版 / Bstar 统一并入流媒体组；规则仅覆盖 bilibili.tv，避免和国内站点混淆。
  BiliBiliIntl: createCommunityClashRuleProvider("BiliBiliIntl"),
  // All4 / Channel 4 规则归并到流媒体组，补上英国地区点播服务。
  All4: createCommunityClashRuleProvider("All4"),
  // 额外国际视频平台统一并入“流媒体”组，避免单服务继续膨胀面板。
  AmazonPrimeVideo: createCommunityClashRuleProvider("AmazonPrimeVideo"),
  PrimeVideo: createCommunityClashRuleProvider("PrimeVideo"),
  HBO: createCommunityClashRuleProvider("HBO"),
  HBOAsia: createCommunityClashRuleProvider("HBOAsia"),
  HBOHK: createCommunityClashRuleProvider("HBOHK"),
  HBOUSA: createCommunityClashRuleProvider("HBOUSA"),
  Hulu: createCommunityClashRuleProvider("Hulu"),
  HuluJP: createCommunityClashRuleProvider("HuluJP"),
  HuluUSA: createCommunityClashRuleProvider("HuluUSA"),
  ParamountPlus: createCommunityClashRuleProvider("ParamountPlus"),
  Peacock: createCommunityClashRuleProvider("Peacock"),
  DiscoveryPlus: createCommunityClashRuleProvider("DiscoveryPlus"),
  // 额外音乐流媒体统一并入通用流媒体组，Spotify 继续保持独立。
  SoundCloud: createCommunityClashRuleProvider("SoundCloud"),
  Deezer: createCommunityClashRuleProvider("Deezer"),
  KKBOX: createCommunityClashRuleProvider("KKBOX"),
  Pandora: createCommunityClashRuleProvider("Pandora"),
  // MetaCubeX 的 ProxyMedia geosite 用来补齐尚未单独列出的海外媒体站点。
  ProxyMedia: createRuleProvider("domain", metaGeoSite("proxymedia")),
  // AliPay / 支付宝及其跨境收银域名统一直连，避免国内支付链路误走代理。
  AliPay: createCommunityClashRuleProvider("AliPay"),
  // PayPal 支付规则。
  PayPal: createCommunityClashRuleProvider("PayPal"),
  // Patreon 创作者赞助 / 订阅规则并入 PayPal 组，不额外新增创作者经济面板。
  Patreon: createCommunityClashRuleProvider("Patreon"),
  // 交易/电商高频规则统一并入 PayPal 组，不额外拆购物面板。
  Stripe: createCommunityClashRuleProvider("Stripe"),
  Shopify: createCommunityClashRuleProvider("Shopify"),
  eBay: createCommunityClashRuleProvider("eBay"),
  Amazon: createCommunityClashRuleProvider("Amazon"),
  AmazonCN: createCommunityClashRuleProvider("AmazonCN"),
  AmazonTrust: createCommunityClashRuleProvider("AmazonTrust"),

  // LinkedIn 规则：归并到微软服务组，避免为职业社交场景单开一个面板组。
  LinkedIn: createCommunityClashRuleProvider("LinkedIn"),
  // Teams 规则：继续并入微软服务组，统一办公/协作类流量出口。
  Teams: createCommunityClashRuleProvider("Teams"),
  // 微软服务规则。
  Microsoft: createRuleProvider("domain", metaGeoSite("microsoft")),
  // Bing 规则。
  Bing: createRuleProvider("domain", metaGeoSite("bing")),
  // OneDrive 规则：默认走 Meta geosite；当启用 blackmatrix7 预设时自动切到社区 YAML。
  OneDrive: createPresetAwareRuleProvider("OneDrive", "domain", metaGeoSite("onedrive")),
  // Apple 规则。
  Apple: createRuleProvider("domain", metaGeoSite("apple")),
  // Apple Music 规则继续并入 Apple 组，不额外拆音乐面板。
  AppleMusic: createRuleProvider("domain", metaGeoSite("applemusic")),
  // TestFlight / beta 分发规则继续并入 Apple 组，不额外拆开发测试面板。
  TestFlight: createCommunityClashRuleProvider("TestFlight"),
  // Apple TV+ 规则。
  AppleTV: createRuleProvider("domain", metaGeoSite("apple-tvplus")),
  // Steam 之外的高频游戏平台统一补到“游戏加速”组，避免继续膨胀一排独立游戏面板。
  Riot: createCommunityClashRuleProvider("Riot"),
  Battle: createCommunityClashRuleProvider("Battle"),
  Blizzard: createCommunityClashRuleProvider("Blizzard"),
  EA: createCommunityClashRuleProvider("EA"),
  Nintendo: createCommunityClashRuleProvider("Nintendo"),
  PlayStation: createCommunityClashRuleProvider("PlayStation"),
  Xbox: createCommunityClashRuleProvider("Xbox"),
  Ubisoft: createCommunityClashRuleProvider("Ubisoft"),
  // Twitch 归并到游戏加速组，不再额外拆一个“直播平台”独立面板。
  Twitch: createCommunityClashRuleProvider("Twitch"),
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
  // YouTube Music 归并到 YouTube 组，避免继续新增一个低频影音独立面板。
  { provider: "YouTubeMusic", target: GROUPS.YOUTUBE },
  // Google 域名交给 Google 组。
  { provider: "Google", target: GROUPS.GOOGLE },
  // 本地开发补充规则流量交给开发服务组。
  { provider: "DevList", target: GROUPS.DEV, overrideKey: "devRuleTarget", overrideFlagKey: "hasDevRuleTarget", overrideLabel: "Dev" },
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

  // GitHub 流量必须放在 Microsoft 泛规则前面；否则 github.com / github.io 等域名可能会先命中 Microsoft。
  {
    provider: "GitHub",
    target: GROUPS.GITHUB,
    overrideKey: "githubRuleTarget",
    overrideFlagKey: "hasGithubRuleTarget",
    overrideLabel: "GitHub",
    ruleOrderAnchorKey: "githubRuleAnchor",
    ruleOrderPositionKey: "githubRulePosition"
  },
  // Discord 流量交给 Discord 组。
  { provider: "Discord", target: GROUPS.DISCORD },
  // Bing 流量交给 Bing 组。
  { provider: "Bing", target: GROUPS.BING },
  // OneDrive 流量交给 OneDrive 组。
  { provider: "OneDrive", target: GROUPS.ONEDRIVE },
  // LinkedIn 归并到微软服务组；不单拆职业社交组，避免和现有办公/微软生态分组重复。
  { provider: "LinkedIn", target: GROUPS.MICROSOFT },
  // Teams 归并到微软服务组，继续把办公协作流量收口到微软服务。
  { provider: "Teams", target: GROUPS.MICROSOFT },
  // 其他微软流量交给微软服务组；它比较泛，默认应排在 GitHub / OneDrive / Bing 等细分规则之后。
  { provider: "Microsoft", target: GROUPS.MICROSOFT },

  // Apple TV+ 流量交给 Apple 组。
  { provider: "AppleTV", target: GROUPS.APPLE },
  // Apple Music 继续交给 Apple 组，和其它苹果生态保持一致。
  { provider: "AppleMusic", target: GROUPS.APPLE },
  // TestFlight / beta.apple.com 继续交给 Apple 组，和苹果生态统一出口。
  { provider: "TestFlight", target: GROUPS.APPLE },
  // Apple 域名交给 Apple 组。
  { provider: "Apple", target: GROUPS.APPLE },
  // Apple IP 段交给 Apple 组，并关闭解析。
  { provider: "Apple_IP", target: GROUPS.APPLE, noResolve: true },

  // Telegram 域名交给 Telegram 组。
  { provider: "Telegram", target: GROUPS.TELEGRAM },
  // Telegram IP 段交给 Telegram 组，并关闭解析。
  { provider: "Telegram_IP", target: GROUPS.TELEGRAM, noResolve: true },
  // WhatsApp 规则必须放在 Facebook 前面；其规则里包含 graph.facebook.com，避免被更宽泛的 Meta/Facebook 规则提前吃掉。
  { provider: "WhatsApp", target: GROUPS.WHATSAPP },
  // LINE 流量交给 LINE 组。
  { provider: "Line", target: GROUPS.LINE },
  // Twitter / X 流量交给 Twitter 组。
  { provider: "Twitter", target: GROUPS.TWITTER },
  // Pinterest 归并到 Instagram 组，保持“视觉社交”统一入口。
  { provider: "Pinterest", target: GROUPS.INSTAGRAM },
  // Pixiv / FANBOX / Booth 也归并到 Instagram 组，统一视觉创作者社区流量。
  { provider: "Pixiv", target: GROUPS.INSTAGRAM },
  // Imgur 继续并到 Instagram 组，避免再拆独立图片社区面板。
  { provider: "Imgur", target: GROUPS.INSTAGRAM },
  // Instagram 规则默认也放在 Facebook 前面，避免更宽泛的 Meta 规则抢先命中。
  { provider: "Instagram", target: GROUPS.INSTAGRAM },
  // Threads 归并到 Facebook 组，避免为 Meta 生态再拆出一条低收益单独组。
  { provider: "Threads", target: GROUPS.FACEBOOK },
  // Facebook / Meta 生态流量交给 Facebook 组。
  { provider: "Facebook", target: GROUPS.FACEBOOK },
  // Reddit 社区流量交给 Reddit 组。
  { provider: "Reddit", target: GROUPS.REDDIT },
  // AliPay / 支付宝支付链路优先直连，避免被后面的 Geo_Not_CN 或其它泛规则接走。
  { provider: "AliPay", target: GROUPS.DIRECT },
  // PayPal 支付流量交给 PayPal 组。
  { provider: "PayPal", target: GROUPS.PAYPAL },
  // Patreon 创作者赞助 / 订阅流量也收口到 PayPal 组，统一处理支付类站点。
  { provider: "Patreon", target: GROUPS.PAYPAL },
  // Stripe / Shopify / eBay 统一交给 PayPal 组；这一批不会和 PrimeVideo 冲突，可以继续放在前面。
  { provider: "Stripe", target: GROUPS.PAYPAL },
  { provider: "Shopify", target: GROUPS.PAYPAL },
  { provider: "eBay", target: GROUPS.PAYPAL },
  // TikTok 流量交给 TikTok 组。
  { provider: "TikTok", target: GROUPS.TIKTOK },
  // BiliBili 国际版 / Bstar 归并到流媒体组，继续保持“补覆盖、不加面板”。
  { provider: "BiliBiliIntl", target: GROUPS.STREAMING },
  // All4 / Channel 4 归并到流媒体组，不额外拆英国电视面板。
  { provider: "All4", target: GROUPS.STREAMING },
  // 额外国际视频平台统一交给流媒体组，避免继续拆出 PrimeVideo/HBO/Hulu 等单独组。
  { provider: "AmazonPrimeVideo", target: GROUPS.STREAMING },
  { provider: "PrimeVideo", target: GROUPS.STREAMING },
  { provider: "HBO", target: GROUPS.STREAMING },
  { provider: "HBOAsia", target: GROUPS.STREAMING },
  { provider: "HBOHK", target: GROUPS.STREAMING },
  { provider: "HBOUSA", target: GROUPS.STREAMING },
  { provider: "Hulu", target: GROUPS.STREAMING },
  { provider: "HuluJP", target: GROUPS.STREAMING },
  { provider: "HuluUSA", target: GROUPS.STREAMING },
  { provider: "ParamountPlus", target: GROUPS.STREAMING },
  { provider: "Peacock", target: GROUPS.STREAMING },
  { provider: "DiscoveryPlus", target: GROUPS.STREAMING },
  { provider: "SoundCloud", target: GROUPS.STREAMING },
  { provider: "Deezer", target: GROUPS.STREAMING },
  { provider: "KKBOX", target: GROUPS.STREAMING },
  { provider: "Pandora", target: GROUPS.STREAMING },
  // Amazon 系交易规则放在 PrimeVideo / 流媒体块之后，避免更宽泛的 Amazon 规则抢先命中。
  { provider: "Amazon", target: GROUPS.PAYPAL },
  { provider: "AmazonCN", target: GROUPS.PAYPAL },
  { provider: "AmazonTrust", target: GROUPS.PAYPAL },

  // Netflix 域名交给 Netflix 组。
  { provider: "Netflix", target: GROUPS.NETFLIX },
  // Netflix IP 段交给 Netflix 组，并关闭解析。
  { provider: "Netflix_IP", target: GROUPS.NETFLIX, noResolve: true },
  // Disney+ 流量交给 Disney 组。
  { provider: "Disney", target: GROUPS.DISNEY },
  // Spotify 流量交给 Spotify 组。
  { provider: "Spotify", target: GROUPS.SPOTIFY },
  // ProxyMedia 作为通用海外媒体补充规则，统一并入流媒体组。
  { provider: "ProxyMedia", target: GROUPS.STREAMING },

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
  // Steam 之外的高频游戏平台统一归到游戏加速组，减少独立面板数量。
  { provider: "Riot", target: GROUPS.GAMES },
  { provider: "Battle", target: GROUPS.GAMES },
  { provider: "Blizzard", target: GROUPS.GAMES },
  { provider: "EA", target: GROUPS.GAMES },
  { provider: "Nintendo", target: GROUPS.GAMES },
  { provider: "PlayStation", target: GROUPS.GAMES },
  { provider: "Xbox", target: GROUPS.GAMES },
  { provider: "Ubisoft", target: GROUPS.GAMES },
  // Twitch 归并到游戏加速组，避免另外新增直播独立组。
  { provider: "Twitch", target: GROUPS.GAMES },
  // Epic Games 流量交给游戏组。
  { provider: "Epic", target: GROUPS.GAMES },
  // PT 下载流量交给 PT 组。
  { provider: "PT", target: GROUPS.PT },
  // Speedtest 流量交给测速组。
  { provider: "Speedtest", target: GROUPS.SPEEDTEST },
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
  { provider: "DevList", label: "DevList", expectedTarget: GROUPS.DEV },
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
  { provider: "Discord", label: "Discord", expectedTarget: GROUPS.DISCORD },
  { provider: "OneDrive", label: "OneDrive", expectedTarget: GROUPS.ONEDRIVE },
  { provider: "LinkedIn", label: "LinkedIn", expectedTarget: GROUPS.MICROSOFT },
  { provider: "Teams", label: "Teams", expectedTarget: GROUPS.MICROSOFT },
  { provider: "WhatsApp", label: "WhatsApp", expectedTarget: GROUPS.WHATSAPP },
  { provider: "Line", label: "LINE", expectedTarget: GROUPS.LINE },
  { provider: "Twitter", label: "Twitter", expectedTarget: GROUPS.TWITTER },
  { provider: "Pinterest", label: "Pinterest", expectedTarget: GROUPS.INSTAGRAM },
  { provider: "Pixiv", label: "Pixiv", expectedTarget: GROUPS.INSTAGRAM },
  { provider: "Imgur", label: "Imgur", expectedTarget: GROUPS.INSTAGRAM },
  { provider: "Instagram", label: "Instagram", expectedTarget: GROUPS.INSTAGRAM },
  { provider: "Threads", label: "Threads", expectedTarget: GROUPS.FACEBOOK },
  { provider: "Facebook", label: "Facebook", expectedTarget: GROUPS.FACEBOOK },
  { provider: "Reddit", label: "Reddit", expectedTarget: GROUPS.REDDIT },
  { provider: "AliPay", label: "AliPay", expectedTarget: GROUPS.DIRECT },
  { provider: "PayPal", label: "PayPal", expectedTarget: GROUPS.PAYPAL },
  { provider: "Patreon", label: "Patreon", expectedTarget: GROUPS.PAYPAL },
  { provider: "Stripe", label: "Stripe", expectedTarget: GROUPS.PAYPAL },
  { provider: "Shopify", label: "Shopify", expectedTarget: GROUPS.PAYPAL },
  { provider: "eBay", label: "eBay", expectedTarget: GROUPS.PAYPAL },
  { provider: "Amazon", label: "Amazon", expectedTarget: GROUPS.PAYPAL },
  { provider: "AmazonCN", label: "AmazonCN", expectedTarget: GROUPS.PAYPAL },
  { provider: "AmazonTrust", label: "AmazonTrust", expectedTarget: GROUPS.PAYPAL },
  { provider: "YouTube", label: "YouTube", expectedTarget: GROUPS.YOUTUBE },
  { provider: "YouTubeMusic", label: "YouTubeMusic", expectedTarget: GROUPS.YOUTUBE },
  { provider: "AppleMusic", label: "AppleMusic", expectedTarget: GROUPS.APPLE },
  { provider: "TestFlight", label: "TestFlight", expectedTarget: GROUPS.APPLE },
  { provider: "Netflix", label: "Netflix", expectedTarget: GROUPS.NETFLIX },
  { provider: "Disney", label: "Disney", expectedTarget: GROUPS.DISNEY },
  { provider: "Spotify", label: "Spotify", expectedTarget: GROUPS.SPOTIFY },
  { provider: "TikTok", label: "TikTok", expectedTarget: GROUPS.TIKTOK },
  { provider: "BiliBiliIntl", label: "BiliBiliIntl", expectedTarget: GROUPS.STREAMING },
  { provider: "All4", label: "All4", expectedTarget: GROUPS.STREAMING },
  { provider: "AmazonPrimeVideo", label: "AmazonPrimeVideo", expectedTarget: GROUPS.STREAMING },
  { provider: "PrimeVideo", label: "PrimeVideo", expectedTarget: GROUPS.STREAMING },
  { provider: "HBO", label: "HBO", expectedTarget: GROUPS.STREAMING },
  { provider: "HBOAsia", label: "HBOAsia", expectedTarget: GROUPS.STREAMING },
  { provider: "HBOHK", label: "HBOHK", expectedTarget: GROUPS.STREAMING },
  { provider: "HBOUSA", label: "HBOUSA", expectedTarget: GROUPS.STREAMING },
  { provider: "Hulu", label: "Hulu", expectedTarget: GROUPS.STREAMING },
  { provider: "HuluJP", label: "HuluJP", expectedTarget: GROUPS.STREAMING },
  { provider: "HuluUSA", label: "HuluUSA", expectedTarget: GROUPS.STREAMING },
  { provider: "ParamountPlus", label: "ParamountPlus", expectedTarget: GROUPS.STREAMING },
  { provider: "Peacock", label: "Peacock", expectedTarget: GROUPS.STREAMING },
  { provider: "DiscoveryPlus", label: "DiscoveryPlus", expectedTarget: GROUPS.STREAMING },
  { provider: "SoundCloud", label: "SoundCloud", expectedTarget: GROUPS.STREAMING },
  { provider: "Deezer", label: "Deezer", expectedTarget: GROUPS.STREAMING },
  { provider: "KKBOX", label: "KKBOX", expectedTarget: GROUPS.STREAMING },
  { provider: "Pandora", label: "Pandora", expectedTarget: GROUPS.STREAMING },
  { provider: "ProxyMedia", label: "ProxyMedia", expectedTarget: GROUPS.STREAMING },
  { provider: "Steam", label: "Steam", expectedTarget: GROUPS.STEAM },
  { provider: "SteamCN", label: "SteamCN", expectedTarget: GROUPS.STEAM },
  { provider: "Riot", label: "Riot", expectedTarget: GROUPS.GAMES },
  { provider: "Battle", label: "Battle", expectedTarget: GROUPS.GAMES },
  { provider: "Blizzard", label: "Blizzard", expectedTarget: GROUPS.GAMES },
  { provider: "EA", label: "EA", expectedTarget: GROUPS.GAMES },
  { provider: "Nintendo", label: "Nintendo", expectedTarget: GROUPS.GAMES },
  { provider: "PlayStation", label: "PlayStation", expectedTarget: GROUPS.GAMES },
  { provider: "Xbox", label: "Xbox", expectedTarget: GROUPS.GAMES },
  { provider: "Ubisoft", label: "Ubisoft", expectedTarget: GROUPS.GAMES },
  { provider: "Twitch", label: "Twitch", expectedTarget: GROUPS.GAMES },
  { provider: "Epic", label: "Epic", expectedTarget: GROUPS.GAMES },
  { provider: "AIExtra", label: "AIExtra", expectedTarget: GROUPS.AI },
  { provider: "Copilot", label: "Copilot", expectedTarget: GROUPS.AI },
  { provider: "Grok", label: "Grok", expectedTarget: GROUPS.AI },
  { provider: "AppleAI", label: "AppleAI", expectedTarget: GROUPS.AI },
  { provider: "AI", label: "AI", expectedTarget: GROUPS.AI },
  { provider: "Crypto", label: "Crypto", expectedTarget: GROUPS.CRYPTO }
];

// 统一维护 AI / Crypto / GitHub / Steam / Dev 的国家优先链配置，避免主流程、日志和响应头各写一套。
const SERVICE_PREFERRED_COUNTRY_DEFINITIONS = Object.freeze([
  { key: "ai", label: "AI", argKey: "aiPreferCountries", defaultMarkers: DEFAULT_AI_PREFERRED_COUNTRY_MARKERS, defaultSourceKey: "ai-default" },
  { key: "crypto", label: "Crypto", argKey: "cryptoPreferCountries", defaultMarkers: DEFAULT_CRYPTO_PREFERRED_COUNTRY_MARKERS, defaultSourceKey: "crypto-default" },
  { key: "github", label: "GitHub", argKey: "githubPreferCountries", hasArgKey: "hasGithubPreferCountries", defaultMarkers: [], defaultSourceKey: "github-default" },
  { key: "steam", label: "Steam", argKey: "steamPreferCountries", hasArgKey: "hasSteamPreferCountries", defaultMarkers: [], defaultSourceKey: "steam-default" },
  { key: "dev", label: "Dev", argKey: "devPreferCountries", hasArgKey: "hasDevPreferCountries", defaultMarkers: [], defaultSourceKey: "dev-default" }
]);
// 统一维护国家优先链的诊断字段后缀，避免 diagnostics / 响应头 / full 日志逐处手写。
const SERVICE_PREFERRED_COUNTRY_SUMMARY_FIELDS = Object.freeze([
  { key: "resolvedSummary", propertySuffix: "ResolvedSummary", headerSuffix: "Resolved" },
  { key: "traceSummary", propertySuffix: "TraceSummary", headerSuffix: "Trace" },
  { key: "explainSummary", propertySuffix: "ExplainSummary", headerSuffix: "Explain" },
  { key: "unmatchedSummary", propertySuffix: "UnmatchedSummary", headerSuffix: "Unmatched" }
]);
// 规则优先级风险采用数据表驱动，避免分析函数里重复堆一长串 addRisk 调用。
const RULE_PRIORITY_RISK_DEFINITIONS = Object.freeze([
  {
    category: "platform",
    blockerProvider: "Google",
    blockedProvider: "YouTube",
    message: "YouTube 规则当前排在 Google 之后；Google 是更宽泛的 Google 生态规则，YouTube 流量可能会先命中 Google 组而不是 YouTube 独立组"
  },
  {
    category: "platform",
    blockerProvider: "Apple",
    blockedProvider: "AppleTV",
    message: "AppleTV 规则当前排在 Apple 之后；Apple 是更宽泛的 Apple 生态规则，Apple TV+ 流量可能会先命中 Apple 组而不是 AppleTV 专属入口"
  },
  {
    category: "platform",
    blockerProvider: "Apple",
    blockedProvider: "TestFlight",
    message: "TestFlight 规则当前排在 Apple 之后；Apple 是更宽泛的 Apple 生态规则，TestFlight / beta.apple.com 流量可能会先命中 Apple 组而不是 TestFlight 专属入口"
  },
  {
    category: "platform",
    blockerProvider: "Microsoft",
    blockedProvider: "GitHub",
    message: "GitHub 规则当前排在 Microsoft 之后；Microsoft 是更宽泛的微软生态规则，GitHub 流量可能会先命中微软服务组而不是 GitHub 独立组"
  },
  {
    category: "platform",
    blockerProvider: "Microsoft",
    blockedProvider: "OneDrive",
    message: "OneDrive 规则当前排在 Microsoft 之后；Microsoft 是更宽泛的微软生态规则，OneDrive 流量可能会先命中微软服务组而不是 OneDrive 独立组"
  },
  {
    category: "platform",
    blockerProvider: "Microsoft",
    blockedProvider: "Bing",
    message: "Bing 规则当前排在 Microsoft 之后；Microsoft 是更宽泛的微软生态规则，Bing 流量可能会先命中微软服务组而不是 Bing 独立组"
  },
  {
    category: "platform",
    blockerProvider: "Facebook",
    blockedProvider: "WhatsApp",
    message: "WhatsApp 规则当前排在 Facebook 之后；WhatsApp 规则中包含 graph.facebook.com，而 Facebook 是更宽泛的 Meta 生态规则，相关流量可能会先命中 Facebook 组而不是 WhatsApp 独立组"
  },
  {
    category: "platform",
    blockerProvider: "Facebook",
    blockedProvider: "Instagram",
    message: "Instagram 规则当前排在 Facebook 之后；Facebook 是更宽泛的 Meta 生态规则，Instagram 流量可能会先命中 Facebook 组而不是 Instagram 独立组"
  },
  {
    category: "platform",
    blockerProvider: "Amazon",
    blockedProvider: "AmazonPrimeVideo",
    message: "AmazonPrimeVideo 规则当前排在 Amazon 之后；Amazon 是更宽泛的电商规则，Prime Video 流量可能会先命中 PayPal 组而不是流媒体组"
  },
  {
    category: "platform",
    blockerProvider: "Amazon",
    blockedProvider: "PrimeVideo",
    message: "PrimeVideo 规则当前排在 Amazon 之后；Amazon 是更宽泛的电商规则，Prime Video 流量可能会先命中 PayPal 组而不是流媒体组"
  },
  {
    category: "geo",
    blockerProvider: "Geo_Not_CN",
    blockedProvider: "GitHub",
    message: "GitHub 规则当前排在 Geo_Not_CN 之后；Geo_Not_CN 是更宽泛的海外规则，GitHub 流量可能会先命中节点选择而不是 GitHub 独立组"
  },
  {
    category: "geo",
    blockerProvider: "Geo_Not_CN",
    blockedProvider: "Steam",
    message: "Steam 规则当前排在 Geo_Not_CN 之后；Geo_Not_CN 是更宽泛的海外规则，Steam 全球流量可能会先命中节点选择而不是 Steam 独立组"
  },
  {
    category: "cn",
    blockerProvider: "CN",
    blockedProvider: "SteamCN",
    message: "SteamCN 规则当前排在 CN 之后；CN 是更宽泛的中国大陆规则，Steam 中国区流量可能会先命中全球直连而不是 Steam 独立组"
  },
  {
    category: "cn",
    blockerProvider: "CN_IP",
    blockedProvider: "SteamCN",
    message: "SteamCN 规则当前排在 CN_IP 之后；CN_IP 是更宽泛的中国大陆 IP 规则，Steam 中国区 IP 流量可能会先命中全球直连而不是 Steam 独立组"
  },
  {
    category: "directlist",
    blockerProvider: "DirectList",
    blockedProvider: "GitHub",
    message: "GitHub 规则当前排在 DirectList 之后；如果自定义直连列表与 GitHub 规则有重叠，相关流量会先命中全球直连而不是 GitHub 独立组"
  },
  {
    category: "directlist",
    blockerProvider: "DirectList",
    blockedProvider: "Steam",
    message: "Steam 规则当前排在 DirectList 之后；如果自定义直连列表与 Steam 规则有重叠，相关流量会先命中全球直连而不是 Steam 独立组"
  },
  {
    category: "directlist",
    blockerProvider: "DirectList",
    blockedProvider: "SteamCN",
    message: "SteamCN 规则当前排在 DirectList 之后；如果自定义直连列表与 SteamCN 规则有重叠，相关流量会先命中全球直连而不是 Steam 独立组"
  }
]);
// 规则优先级风险里的分类计数统一走映射，避免 addRisk 内重复 category 分支模板。
const RULE_PRIORITY_RISK_COUNT_FIELD_BY_CATEGORY = Object.freeze({
  platform: "platformOverrideCount",
  geo: "geoOverrideCount",
  cn: "cnOverrideCount",
  directlist: "directListOverrideCount"
});
// GitHub / Steam / Dev 三类独立组在响应头、校验、摘要等多个阶段都会复用相同的基础元信息，这里集中维护避免多份定义漂移。
const SERVICE_DEFINITIONS = Object.freeze([
  Object.freeze({
    key: "github",
    label: "GitHub",
    argToken: "Github",
    groupName: GROUPS.GITHUB,
    preferredGroupsContextKey: "githubPreferredGroups",
    modeBaseProxiesContextKey: "githubModeBaseProxies",
    // GitHub 组的 mode 分支保持“直连优先/代理优先/主选择优先”这三条基础链。
    resolveModeBaseProxyBranches: (context) => ({
      direct: context.directFirstProxies,
      proxy: context.baseProxies,
      default: context.selectFirstProxies
    }),
    // GitHub/Steam 的 direct + prefer-countries 默认都从 SELECT 头开始 prepend。
    resolveDirectPreferBaseProxies: (context) => context.selectFirstProxies
  }),
  Object.freeze({
    key: "steam",
    label: "Steam",
    argToken: "Steam",
    groupName: GROUPS.STEAM,
    preferredGroupsContextKey: "steamPreferredGroups",
    modeBaseProxiesContextKey: "steamModeBaseProxies",
    resolveModeBaseProxyBranches: (context) => ({
      direct: context.directFirstProxies,
      proxy: context.baseProxies,
      default: context.selectFirstProxies
    }),
    resolveDirectPreferBaseProxies: (context) => context.selectFirstProxies
  }),
  Object.freeze({
    key: "dev",
    label: "Dev",
    argToken: "Dev",
    groupName: GROUPS.DEV,
    preferredGroupsContextKey: "devPreferredGroups",
    modeBaseProxiesContextKey: "developerModeBaseProxies",
    // 开发服务组天然依赖 GitHub 组，所以三种 mode 基链都把 GitHub 预先揉进去。
    resolveModeBaseProxyBranches: (context) => ({
      direct: prependPreferredNames([GROUPS.GITHUB], context.selectFirstProxies, true),
      proxy: prependPreferredNames([GROUPS.GITHUB], context.baseProxies, false),
      default: prependPreferredNames([GROUPS.GITHUB], context.selectFirstProxies, false)
    }),
    resolveDirectPreferBaseProxies: (context) => uniqueStrings([GROUPS.GITHUB].concat(toStringArray(context.selectFirstProxies)))
  })
]);
// GitHub / Steam 会共用不少“仅面板独立组、不含 Dev”的摘要模板，这里预先缓存避免多处重复 filter。
const NON_DEV_SERVICE_DEFINITIONS = Object.freeze(
  SERVICE_DEFINITIONS.filter((service) => service.key !== "dev")
);
// 响应头/校验两个阶段都直接复用这份基础定义，避免 label/argToken/groupName 在多处手动保持一致。
const SERVICE_RESPONSE_HEADER_SERVICE_DEFINITIONS = SERVICE_DEFINITIONS;
// 资源校验阶段复用同一批服务定义，确保“谁需要校验”与“谁需要响应头展示”保持一致。
const SERVICE_RESOURCE_VALIDATION_DEFINITIONS = SERVICE_RESPONSE_HEADER_SERVICE_DEFINITIONS;
// 独立组响应头字段定义：configured-only 表示只关心“是否配置”，value 表示输出实际生效值，custom 走自定义计算。
const SERVICE_RESPONSE_HEADER_FIELD_DEFINITIONS = Object.freeze([
  { headerSuffix: "Mode", argSuffix: "Mode", valueType: "value", services: ["dev"] },
  { headerSuffix: "Type", argSuffix: "Type", valueType: "value", services: ["dev"] },
  { headerSuffix: "Test-Url", argSuffix: "TestUrl", valueType: "value", services: ["dev"] },
  { headerSuffix: "Group-Strategy", argSuffix: "GroupStrategy", valueType: "value" },
  { headerSuffix: "Hidden", argSuffix: "Hidden", valueType: "value" },
  { headerSuffix: "Disable-UDP", argSuffix: "DisableUdp", valueType: "value" },
  { headerSuffix: "Icon", argSuffix: "Icon", valueType: "value" },
  { headerSuffix: "Interface-Name", argSuffix: "InterfaceName", valueType: "value" },
  { headerSuffix: "Routing-Mark", argSuffix: "RoutingMark", valueType: "value" },
  { headerSuffix: "Prefer-Groups", argSuffix: "PreferGroups", valueType: "configured" },
  { headerSuffix: "Prefer-Countries", argSuffix: "PreferCountries", valueType: "configured" },
  { headerSuffix: "Prefer-Nodes", argSuffix: "PreferNodes", valueType: "configured" },
  { headerSuffix: "Use-Providers", argSuffix: "UseProviders", valueType: "configured" },
  { headerSuffix: "Include-All", argSuffix: "IncludeAll", valueType: "value" },
  { headerSuffix: "Include-All-Proxies", argSuffix: "IncludeAllProxies", valueType: "value" },
  { headerSuffix: "Include-All-Providers", argSuffix: "IncludeAllProviders", valueType: "value" },
  { headerSuffix: "Rule-Order", valueType: "custom", customValue: (service) => buildRuleOrderSummary(ARGS[buildServiceArgKey(service.argToken, "RuleAnchor")], ARGS[buildServiceArgKey(service.argToken, "RulePosition")]) },
  { headerSuffix: "Rule-Target", argSuffix: "RuleTarget", valueType: "value" },
  { headerSuffix: "Auto-Proxies", valueType: "custom", customValue: (service) => buildServiceAutoProxyHeaderValue(service.argToken) }
]);

// 解析单个独立组响应头字段的最终值，统一兼容 configured / value / custom 三种字段类型。
function resolveServiceResponseHeaderFieldValue(service, field) {
  const currentService = isObject(service) ? service : {};
  const currentField = isObject(field) ? field : {};

  if (currentField.valueType === "configured") {
    return ARGS[`has${currentService.argToken}${currentField.argSuffix}`] ? "configured" : "default";
  }
  if (currentField.valueType === "value") {
    const hasKey = `has${currentService.argToken}${currentField.argSuffix}`;
    const valueKey = buildServiceArgKey(currentService.argToken, currentField.argSuffix);
    return ARGS[hasKey] ? ARGS[valueKey] : "default";
  }

  return typeof currentField.customValue === "function" ? currentField.customValue(currentService) : "default";
}

// 把“服务 + 字段”适配成最终响应头 definition，供批量展开 helper 直接复用。
function createServiceResponseHeaderDefinition(service, field) {
  return {
    headerSuffix: `${service.label}-${field.headerSuffix}`,
    value: () => resolveServiceResponseHeaderFieldValue(service, field)
  };
}

// 独立组响应头字段有的只适用于部分服务（例如 Dev 独享 mode/type/test-url），这里统一做字段适用性判断。
function isServiceResponseHeaderFieldApplicable(service, field) {
  return !Array.isArray(field && field.services) || field.services.includes(service && service.key);
}

// 按“服务 × 字段”批量展开响应头 definitions，避免 definitions 区域再保留 reduce + filter 双层模板。
function buildServiceResponseHeaderDefinitions(services, fields) {
  const entries = [];

  for (const service of Array.isArray(services) ? services : []) {
    for (const field of Array.isArray(fields) ? fields : []) {
      if (!isServiceResponseHeaderFieldApplicable(service, field)) {
        continue;
      }

      entries.push(createServiceResponseHeaderDefinition(service, field));
    }
  }

  return entries;
}

// 所有独立组响应头 definitions 在这里一次性展开，后续 runtime response-header 直接消费成品。
const SERVICE_RESPONSE_HEADER_DEFINITIONS = Object.freeze(
  buildServiceResponseHeaderDefinitions(
    SERVICE_RESPONSE_HEADER_SERVICE_DEFINITIONS,
    SERVICE_RESPONSE_HEADER_FIELD_DEFINITIONS
  )
);

// 把 prefer-countries 的 diagnostics 摘要映射成具体响应头 definition。
function createServicePreferredCountryResponseHeaderDefinition(definition, field) {
  return {
    headerSuffix: `${definition.label}-Prefer-Countries-${field.headerSuffix}`,
    value: (current) => {
      const diagnostics = isObject(current) ? current : {};
      return diagnostics[`${definition.key}PreferCountry${field.propertySuffix}`] || "none";
    }
  };
}

// 各业务组 Prefer-Countries 相关响应头在这里统一展开，避免 definitions 区域继续手写 reduce 模板。
const SERVICE_PREFERRED_COUNTRY_RESPONSE_HEADER_DEFINITIONS = Object.freeze(
  SERVICE_PREFERRED_COUNTRY_DEFINITIONS.reduce((entries, definition) => {
    for (const field of SERVICE_PREFERRED_COUNTRY_SUMMARY_FIELDS) {
      entries.push(createServicePreferredCountryResponseHeaderDefinition(definition, field));
    }
    return entries;
  }, [])
);

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
  // orderedDefinitions 是不断被重排的工作副本；sourceDefinitions 保留原始遍历顺序，避免边遍历边改数组导致行为飘移。
  let orderedDefinitions = Array.isArray(ruleDefinitions) ? ruleDefinitions.slice() : RULE_SET_DEFINITIONS.slice();
  const sourceDefinitions = Array.isArray(ruleDefinitions) ? ruleDefinitions : RULE_SET_DEFINITIONS;

  for (const definition of sourceDefinitions) {
    if (!definition || !definition.ruleOrderAnchorKey || !ARGS[definition.ruleOrderAnchorKey]) {
      continue;
    }

    const anchorResult = inspectRuleProviderReference(orderedDefinitions, ARGS[definition.ruleOrderAnchorKey]);
    if (!anchorResult.match || anchorResult.match === definition.provider) {
      // 锚点不存在，或锚点恰好就是自己时，不做任何移动。
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

  // 用户自定义锚点应用完后，再统一跑一轮关键优先级护栏，避免宽泛规则重新压到专用规则前面。
  return applyRulePriorityGuardOrder(orderedDefinitions);
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

// 检查区域组是否真的生成、以及在最终面板里的可见位置，避免“脚本支持但面板里看不见”的情况只能靠人工猜。
function analyzeRegionGroupVisibility(proxyGroups, countryConfigs) {
  // 用户没有开启 region-groups 时，直接返回 disabled，避免输出一堆和当前订阅无关的提示。
  if (!ARGS.hasRegionGroups) {
    return {
      warnings: [],
      summary: "disabled",
      previewEntries: []
    };
  }

  // proxy-groups 可能混入外部 merge 进来的异常项，这里先只保留真正带名字的组。
  const groups = Array.isArray(proxyGroups) ? proxyGroups : [];
  // 把最终面板顺序压平成组名数组，后续就能直接用 indexOf 比较前后位置。
  const groupNames = collectNamedEntries(groups);
  // 区域组名称仍按“最终国家组结果 + 当前 regionGroupKeys”重新推导，确保诊断口径和真实产物一致。
  const regionGroupNames = buildRegionGroupConfigs(countryConfigs, ARGS.regionGroupKeys)
    .map((region) => region && region.name)
    .filter(Boolean);
  // 国家组位置也一并拉平，便于判断区域组是不是被国家组压到后面去了。
  const countryGroupNames = (Array.isArray(countryConfigs) ? countryConfigs : [])
    .map((country) => country && country.name)
    .filter(Boolean);
  // warnings 给 full 日志 / 响应头，previewEntries 专门用于显示“前几个区域组排在第几位”。
  const warnings = [];
  const previewEntries = [];

  // 一个区域组都没生成，通常说明国家组没命中、region token 太窄，或节点命名还没覆盖到对应区域。
  if (!regionGroupNames.length) {
    warnings.push("region-groups 已开启，但当前没有生成任何区域组；请确认节点是否先命中国家组，或改用 regionGroups=all / asia,europe,americas 这类更宽的区域集合");
    return {
      warnings,
      summary: `configured=${ARGS.regionGroupKeys.length},generated=0,first-region=0,first-country=0,visible=no`,
      previewEntries
    };
  }

  // 记录每个区域组在最终 proxy-groups 里的真实索引，后面才能判断“有没有生成”和“排在第几位”。
  const regionPositions = regionGroupNames
    .map((name) => ({ name, index: groupNames.indexOf(name) }))
    .filter((item) => item.index !== -1);
  // 同时记录国家组索引，用来比较区域组是不是排到了国家组后面。
  const countryPositions = countryGroupNames
    .map((name) => ({ name, index: groupNames.indexOf(name) }))
    .filter((item) => item.index !== -1);
  const firstRegion = regionPositions.length ? regionPositions[0] : null;
  const firstCountry = countryPositions.length ? countryPositions[0] : null;
  const lastRegion = regionPositions.length ? regionPositions[regionPositions.length - 1] : null;

  // 预览里只取前 4 个区域组，既足够看出排序，也不会把响应头挤得太长。
  for (const item of regionPositions.slice(0, 4)) {
    previewEntries.push(`${sanitizeProviderPreviewName(item.name)}@${item.index + 1}`);
  }

  // 配了 region-groups，但最终面板里完全没出现区域组，通常是外部配置覆盖或客户端缓存没刷新。
  if (!regionPositions.length) {
    warnings.push("region-groups 已开启，也解析到了区域标记，但这些区域组没有出现在最终 proxy-groups 中；请检查是否被外部配置覆盖或客户端没有刷新到最新产物");
  }

  // 第一个区域组反而排在第一个国家组后面时，Clash Verge 面板里看起来就很像“区域组没生成”。
  if (firstRegion && firstCountry && firstRegion.index > firstCountry.index) {
    warnings.push(`区域组已生成，但当前首个区域组 ${firstRegion.name} 排在首个国家组 ${firstCountry.name} 后面；在 Clash Verge 面板里可能不明显，建议加 groupOrderPreset=region-first 或 groupOrder=select,manual,fallback,regions,countries,other,extras`);
  }

  // 即使没落到国家组后面，只要位置太靠后，实际面板里依然需要下滑很久才能看到。
  if (firstRegion && firstRegion.index >= 12) {
    warnings.push(`区域组已生成，但首个区域组 ${firstRegion.name} 当前排在第 ${firstRegion.index + 1} 位；在 Clash Verge 面板里通常需要下滑才看得到，建议把 regions 提前`);
  }

  // 最后把核心指标压缩成单行摘要，方便 full 日志和响应调试头直接复用。
  return {
    warnings: uniqueStrings(warnings),
    summary: `configured=${ARGS.regionGroupKeys.length},generated=${regionGroupNames.length},first-region=${firstRegion ? firstRegion.index + 1 : 0},first-country=${firstCountry ? firstCountry.index + 1 : 0},visible=${firstRegion ? "yes" : "no"},tail-region=${lastRegion ? lastRegion.index + 1 : 0}`,
    previewEntries: uniqueStrings(previewEntries)
  };
}

// 把规则顺序参数格式化成单行摘要，便于日志与响应头快速观察实际启用的编排方式。
function buildRuleOrderSummary(anchor, position) {
  const marker = normalizeStringArg(anchor);

  if (!marker) {
    return "default";
  }

  return `${normalizeRuleOrderPosition(position, "before")}:${marker}`;
}

// 基于 ARGS 里的 anchor/position 键位读取规则顺序摘要，便于响应头 / full 日志共用同一套读取逻辑。
function buildRuleOrderArgSummary(anchorKey, positionKey) {
  return buildRuleOrderSummary(ARGS[anchorKey], ARGS[positionKey]);
}

// full 日志中的“规则顺序编排”只是 key 不同、读取的 anchor/position 不同，这里集中维护键位映射。
const BUILD_SUMMARY_RULE_ORDER_ENTRY_DEFINITIONS = Object.freeze([
  { key: "github", anchorKey: "githubRuleAnchor", positionKey: "githubRulePosition" },
  { key: "steam", anchorKey: "steamRuleAnchor", positionKey: "steamRulePosition" },
  { key: "steam-cn", anchorKey: "steamCnRuleAnchor", positionKey: "steamCnRulePosition" },
  { key: "dev", anchorKey: "devRuleAnchor", positionKey: "devRulePosition" }
]);

// 把规则顺序定义列表拼成统一摘要，避免 full 日志里继续手写长串模板。
function formatRuleOrderPresentationSummary(definitions) {
  return definitions
    .map((definition) => `${definition.key}=${buildRuleOrderArgSummary(definition.anchorKey, definition.positionKey)}`)
    .join(", ");
}

// 关键规则窗口的基础观测项常量，避免每次分析都重新构造同一份定义数组。
const KEY_RULE_WINDOW_BASE_DEFINITIONS = Object.freeze([
  { key: "Geo_Not_CN", label: "Geo_Not_CN", kind: "blocker" },
  { key: "DirectList", label: "DirectList", kind: "blocker" },
  { key: "CN", label: "CN", kind: "blocker" },
  { key: "CN_IP", label: "CN_IP", kind: "blocker" },
  { key: "GitHub", label: "GitHub", kind: "business" },
  { key: "Steam", label: "Steam", kind: "business" },
  { key: "SteamCN", label: "SteamCN", kind: "business" },
  { key: "MATCH", label: "MATCH", kind: "match" }
]);
// 业务规则窗口的观测项常量，避免业务诊断里重复分配大数组。
const SERVICE_RULE_WINDOW_DEFINITIONS = Object.freeze([
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
  { key: "DevList", label: "DevList", category: "dev" },
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
  { key: "LinkedIn", label: "LinkedIn", category: "dev" },
  { key: "Teams", label: "Teams", category: "dev" },
  { key: "Discord", label: "Discord", category: "social" },
  { key: "WhatsApp", label: "WhatsApp", category: "social" },
  { key: "Line", label: "LINE", category: "social" },
  { key: "Twitter", label: "Twitter", category: "social" },
  { key: "Pinterest", label: "Pinterest", category: "social" },
  { key: "Pixiv", label: "Pixiv", category: "social" },
  { key: "Imgur", label: "Imgur", category: "social" },
  { key: "Instagram", label: "Instagram", category: "social" },
  { key: "Threads", label: "Threads", category: "social" },
  { key: "Facebook", label: "Facebook", category: "social" },
  { key: "Reddit", label: "Reddit", category: "social" },
  { key: "AliPay", label: "AliPay", category: "trade" },
  { key: "PayPal", label: "PayPal", category: "trade" },
  { key: "Patreon", label: "Patreon", category: "trade" },
  { key: "Stripe", label: "Stripe", category: "trade" },
  { key: "Shopify", label: "Shopify", category: "trade" },
  { key: "eBay", label: "eBay", category: "trade" },
  { key: "Amazon", label: "Amazon", category: "trade" },
  { key: "AmazonCN", label: "AmazonCN", category: "trade" },
  { key: "AmazonTrust", label: "AmazonTrust", category: "trade" },
  { key: "YouTube", label: "YouTube", category: "media" },
  { key: "YouTubeMusic", label: "YouTubeMusic", category: "media" },
  { key: "AppleMusic", label: "AppleMusic", category: "media" },
  { key: "TestFlight", label: "TestFlight", category: "dev" },
  { key: "Netflix", label: "Netflix", category: "media" },
  { key: "Disney", label: "Disney", category: "media" },
  { key: "Spotify", label: "Spotify", category: "media" },
  { key: "TikTok", label: "TikTok", category: "media" },
  { key: "BiliBiliIntl", label: "BiliBiliIntl", category: "media" },
  { key: "All4", label: "All4", category: "media" },
  { key: "AmazonPrimeVideo", label: "AmazonPrimeVideo", category: "media" },
  { key: "PrimeVideo", label: "PrimeVideo", category: "media" },
  { key: "HBO", label: "HBO", category: "media" },
  { key: "HBOAsia", label: "HBOAsia", category: "media" },
  { key: "HBOHK", label: "HBOHK", category: "media" },
  { key: "HBOUSA", label: "HBOUSA", category: "media" },
  { key: "Hulu", label: "Hulu", category: "media" },
  { key: "HuluJP", label: "HuluJP", category: "media" },
  { key: "HuluUSA", label: "HuluUSA", category: "media" },
  { key: "ParamountPlus", label: "ParamountPlus", category: "media" },
  { key: "Peacock", label: "Peacock", category: "media" },
  { key: "DiscoveryPlus", label: "DiscoveryPlus", category: "media" },
  { key: "SoundCloud", label: "SoundCloud", category: "media" },
  { key: "Deezer", label: "Deezer", category: "media" },
  { key: "KKBOX", label: "KKBOX", category: "media" },
  { key: "Pandora", label: "Pandora", category: "media" },
  { key: "ProxyMedia", label: "ProxyMedia", category: "media" },
  { key: "Steam", label: "Steam", category: "game" },
  { key: "SteamCN", label: "SteamCN", category: "game" },
  { key: "Riot", label: "Riot", category: "game" },
  { key: "Battle", label: "Battle", category: "game" },
  { key: "Blizzard", label: "Blizzard", category: "game" },
  { key: "EA", label: "EA", category: "game" },
  { key: "Nintendo", label: "Nintendo", category: "game" },
  { key: "PlayStation", label: "PlayStation", category: "game" },
  { key: "Xbox", label: "Xbox", category: "game" },
  { key: "Ubisoft", label: "Ubisoft", category: "game" },
  { key: "Twitch", label: "Twitch", category: "game" },
  { key: "Epic", label: "Epic", category: "game" }
]);
// 业务规则窗口里的分类计数统一走映射，减少分析函数里重复 if-else 分支。
const SERVICE_RULE_WINDOW_COUNT_FIELD_BY_CATEGORY = Object.freeze({
  ai: "aiCount",
  dev: "devCount",
  social: "socialCount",
  media: "mediaCount",
  trade: "tradeCount",
  game: "gameCount"
});

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

  // 规则尾部可能带 no-resolve / src 这类修饰项，需要跳过后再取真正目标。
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
function buildTrafficPrioritySummary(rules, generatedRules, configuredRules, ruleAnalysis) {
  const currentRules = Array.isArray(rules) ? rules : [];
  const currentRuleAnalysis = getRuleAnalysis(currentRules, ruleAnalysis);
  const baseRules = Array.isArray(generatedRules) ? uniqueStrings(generatedRules) : [];
  const generatedBodyRules = baseRules.filter((rule) => !/^MATCH,/i.test(normalizeStringArg(rule)));
  const rawConfiguredRuleList = Array.isArray(configuredRules) ? uniqueStrings(configuredRules) : [];
  const effectiveExtraRules = rawConfiguredRuleList
    .filter((rule) => !/^MATCH,/i.test(normalizeStringArg(rule)))
    .filter((rule) => !generatedBodyRules.includes(rule));
  const head = currentRuleAnalysis.describedRules.slice(0, 6).filter(Boolean);
  const tail = currentRuleAnalysis.describedRules.slice(-4).filter(Boolean);
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
    // MATCH 永远是最后兜底层，单独拎出来最容易观察整体闭环。
    return "match";
  }

  if (type !== "RULE-SET") {
    // 非 RULE-SET 的其余条目（如 DOMAIN-SUFFIX / PROCESS-NAME 等）都归为 custom。
    return "custom";
  }

  const provider = normalizeStringArg(parts[1]);

  if (provider === "ADBlock") {
    // 广告类规则在语义上仍属于拦截层。
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
function analyzeRuleLayering(rules, ruleAnalysis) {
  const currentRules = Array.isArray(rules) ? rules : [];
  const currentRuleAnalysis = getRuleAnalysis(currentRules, ruleAnalysis);
  // layerEntries 记录“连续同层规则区间”；previewEntries 只保留每个区间的第一条样本。
  const layerEntries = [];
  const previewEntries = [];
  let customCount = 0;
  let matchIndex = -1;

  for (let index = 0; index < currentRuleAnalysis.entries.length; index += 1) {
    const entry = currentRuleAnalysis.entries[index];
    const layer = entry.layer;
    const tag = entry.tag;
    const desc = entry.described;

    if (layer === "custom") {
      customCount += 1;
    }

    if (layer === "match" && matchIndex === -1) {
      matchIndex = index;
    }

    let currentLayerEntry = layerEntries[layerEntries.length - 1];
    if (!currentLayerEntry || currentLayerEntry.layer !== layer) {
      // 只有层级切换时才新开一个区间块，这样更容易看出最终规则链是如何分段的。
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

// 把整条 rules 链预解析成可复用缓存，避免多个诊断函数反复 split / classify / describe 同一批规则。
function analyzeRuleCollection(rules) {
  const currentRules = Array.isArray(rules) ? rules : [];
  // entries 保存逐条解析结果；后两个 lookup 用于快速定位“某个 provider/某条原始规则第一次出现在哪”。
  const entries = [];
  const describedRules = [];
  const firstIndexByKey = Object.create(null);
  const normalizedIndexLookup = Object.create(null);

  for (let index = 0; index < currentRules.length; index += 1) {
    const rule = currentRules[index];
    const normalized = normalizeStringArg(rule);
    const described = describeTrafficRule(normalized);
    const layer = classifyTrafficRuleLayer(normalized);
    const tag = formatTrafficRuleLayerTag(layer);
    const shape = inspectTrafficRuleShape(normalized);
    const target = sanitizeProviderPreviewName(shape.target || "unknown");
    const key = /^MATCH->/i.test(described)
      ? "MATCH"
      : (described.includes("->") ? normalizeStringArg(described.split("->")[0]) : "");

    if (normalized && !hasOwn(normalizedIndexLookup, normalized)) {
      // 相同规则可能出现多次；这里只记录第一次出现的位置，方便判断实际插入点。
      normalizedIndexLookup[normalized] = index;
    }

    if (key && !hasOwn(firstIndexByKey, key)) {
      firstIndexByKey[key] = index;
    }

    entries.push({
      index,
      rule,
      normalized,
      described,
      layer,
      tag,
      shape,
      target,
      key
    });
    describedRules.push(described);
  }

  return {
    rules: currentRules,
    entries,
    describedRules,
    firstIndexByKey,
    normalizedIndexLookup
  };
}

// 优先复用主流程传入的规则缓存；若当前调用方没传，则按需现场构建一份。
function getRuleAnalysis(rules, precomputedAnalysis) {
  const currentRules = Array.isArray(rules) ? rules : [];
  return isObject(precomputedAnalysis)
    && precomputedAnalysis.rules === currentRules
    && Array.isArray(precomputedAnalysis.entries)
    ? precomputedAnalysis
    : analyzeRuleCollection(currentRules);
}

// 单独分析 config.rules 在最终规则链里的有效插入区间，便于快速判断外部自定义规则到底插进了哪里。
function analyzeCustomRuleWindow(generatedRules, configuredRules, finalRules, ruleAnalysis) {
  const baseRules = Array.isArray(generatedRules) ? uniqueStrings(generatedRules) : [];
  const currentFinalRules = Array.isArray(finalRules) ? finalRules : [];
  const finalRuleAnalysis = getRuleAnalysis(currentFinalRules, ruleAnalysis);
  // generatedBodyRules 代表脚本自身生成、且不含兜底 MATCH 的规则主体。
  const generatedBodyRules = baseRules.filter((rule) => !/^MATCH,/i.test(normalizeStringArg(rule)));
  const rawConfiguredRuleList = Array.isArray(configuredRules) ? configuredRules.slice() : [];
  const uniqueConfiguredRules = uniqueStrings(rawConfiguredRuleList);
  const rawMatchCount = rawConfiguredRuleList.filter((rule) => /^MATCH,/i.test(normalizeStringArg(rule))).length;
  // effectiveExtraRules 才是真正“新增插入最终链路”的规则：排除 MATCH、排除与脚本主体重复的项。
  const rawExtraRules = uniqueConfiguredRules.filter((rule) => !/^MATCH,/i.test(normalizeStringArg(rule)));
  const effectiveExtraRules = rawExtraRules.filter((rule) => !generatedBodyRules.includes(rule));
  const effectiveIndexes = effectiveExtraRules
    .map((rule) => {
      const normalizedRule = normalizeStringArg(rule);
      return hasOwn(finalRuleAnalysis.normalizedIndexLookup, normalizedRule)
        ? finalRuleAnalysis.normalizedIndexLookup[normalizedRule]
        : -1;
    })
    .filter((index) => index >= 0);
  const typeCounts = Object.create(null);
  const targetCounts = Object.create(null);

  for (const rule of effectiveExtraRules) {
    const shape = inspectTrafficRuleShape(rule);
    // 类型 / 目标组的 top 统计可以快速看出自定义规则主要在干什么。
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

// 统一把 category 映射到结果对象里的计数字段，减少多个分析函数里重复 if-else 累加模板。
function increaseCategorizedCounter(target, category, fieldLookup) {
  const current = isObject(target) ? target : null;
  const normalizedCategory = normalizeStringArg(category);
  const lookup = isObject(fieldLookup) ? fieldLookup : null;

  if (!current || !normalizedCategory || !lookup || !hasOwn(lookup, normalizedCategory)) {
    return;
  }

  const countField = normalizeStringArg(lookup[normalizedCategory]);
  if (!countField) {
    return;
  }

  current[countField] = (Number(current[countField]) || 0) + 1;
}

// 聚焦几条真正决定 GitHub / Steam / SteamCN 先后关系的关键规则窗口，便于直接看“谁卡在谁前面”。
function analyzeKeyRuleWindows(rules, ruleAnalysis) {
  const currentRules = Array.isArray(rules) ? rules : [];
  const currentRuleAnalysis = getRuleAnalysis(currentRules, ruleAnalysis);
  const describedRules = currentRuleAnalysis.describedRules;
  // SteamFix 只有开启时才纳入关键窗口；其余关键点使用固定常量定义。
  const definitions = []
    .concat(ARGS.steamFix ? [{ key: "SteamFix", label: "SteamFix", kind: "business" }] : [])
    .concat(KEY_RULE_WINDOW_BASE_DEFINITIONS);
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
    const index = hasOwn(currentRuleAnalysis.firstIndexByKey, definition.key)
      ? currentRuleAnalysis.firstIndexByKey[definition.key]
      : -1;

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

    // 预览里直接保留前后邻居，方便判断“宽泛规则是否挡在业务规则前面”。
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
function analyzeRuleLayerTargetMapping(rules, ruleAnalysis) {
  const currentRules = Array.isArray(rules) ? rules : [];
  const currentRuleAnalysis = getRuleAnalysis(currentRules, ruleAnalysis);
  // 三个计数字典分别观察“层级分布”“目标分布”“层级->目标交叉分布”。
  const layerCounts = Object.create(null);
  const targetCounts = Object.create(null);
  const crossCounts = Object.create(null);

  for (const entry of currentRuleAnalysis.entries) {
    const layer = entry.tag;
    const target = entry.target;
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
function analyzeServiceRuleWindows(rules, ruleAnalysis) {
  const currentRules = Array.isArray(rules) ? rules : [];
  const currentRuleAnalysis = getRuleAnalysis(currentRules, ruleAnalysis);
  const describedRules = currentRuleAnalysis.describedRules;
  const definitions = SERVICE_RULE_WINDOW_DEFINITIONS;
  // firstIndex/lastIndex 用于观察关键业务规则整体集中在哪个区间。
  const result = {
    tracked: definitions.length,
    foundCount: 0,
    aiCount: 0,
    devCount: 0,
    socialCount: 0,
    mediaCount: 0,
    tradeCount: 0,
    gameCount: 0,
    missingCount: 0,
    firstIndex: -1,
    lastIndex: -1,
    orderEntries: [],
    previewEntries: []
  };

  for (const definition of definitions) {
    const index = hasOwn(currentRuleAnalysis.firstIndexByKey, definition.key)
      ? currentRuleAnalysis.firstIndexByKey[definition.key]
      : -1;

    if (index === -1) {
      result.missingCount += 1;
      continue;
    }

    result.foundCount += 1;
    increaseCategorizedCounter(result, definition.category, SERVICE_RULE_WINDOW_COUNT_FIELD_BY_CATEGORY);

    result.firstIndex = result.firstIndex === -1 ? index : Math.min(result.firstIndex, index);
    result.lastIndex = result.lastIndex === -1 ? index : Math.max(result.lastIndex, index);

    const previousRules = describedRules.slice(Math.max(0, index - 2), index);
    const nextRules = describedRules.slice(index + 1, index + 3);
    // 每个业务规则保留前后各 2 跳窗口，足够观察“是谁把它包住了”。
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
  return `tracked=${Number(current.tracked) || 0},found=${Number(current.foundCount) || 0},ai=${Number(current.aiCount) || 0},dev=${Number(current.devCount) || 0},social=${Number(current.socialCount) || 0},media=${Number(current.mediaCount) || 0},trade=${Number(current.tradeCount) || 0},game=${Number(current.gameCount) || 0},missing=${Number(current.missingCount) || 0},span=${span},order=${formatProviderPreviewNames(current.orderEntries, 6, 14)}`;
}

// 把业务规则窗口样本压成预览字符串，便于直接看出这些业务规则的前后 2 跳邻居。
function formatServiceRuleWindowPreview(source) {
  const current = isObject(source) ? source : {};
  return formatProviderPreviewNames(current.previewEntries, 4, 64);
}

// 汇总规则入口最终会打到哪些目标组，并统计各目标组承接了多少条业务规则。
function analyzeRuleTargetMapping(ruleDefinitions, rules, ruleAnalysis) {
  const definitions = Array.isArray(ruleDefinitions) ? ruleDefinitions : [];
  const targetCounts = Object.create(null);
  const previewEntries = [];

  for (const definition of definitions) {
    if (!isObject(definition) || !normalizeStringArg(definition.provider) || !normalizeStringArg(definition.target)) {
      continue;
    }

    const provider = normalizeStringArg(definition.provider);
    const target = normalizeStringArg(definition.target);
    // 预览项直接保留 provider->target 关系，并附带 no-resolve 标记。
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
  const currentRuleAnalysis = getRuleAnalysis(currentRules, ruleAnalysis);
  const matchIndex = hasOwn(currentRuleAnalysis.firstIndexByKey, "MATCH")
    ? currentRuleAnalysis.firstIndexByKey.MATCH
    : -1;
  // matchTarget 单独取出来，可以快速判断其余未命中流量的最终归宿。
  const matchTarget = matchIndex >= 0
    ? normalizeStringArg((currentRuleAnalysis.describedRules[matchIndex] || "").replace(/^MATCH->/, "")) || GROUPS.SELECT
    : GROUPS.SELECT;

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

// 统一构建 provider -> value 查找表，避免 definition/index 两套查找表各自维护一份近似循环模板。
function buildRuleDefinitionProviderLookup(ruleDefinitions, valueBuilder) {
  const lookup = Object.create(null);
  const definitions = Array.isArray(ruleDefinitions) ? ruleDefinitions : [];
  const buildValue = typeof valueBuilder === "function" ? valueBuilder : ((definition) => definition);

  definitions.forEach((definition, index) => {
    const provider = isObject(definition) ? normalizeStringArg(definition.provider) : "";
    if (provider && !hasOwn(lookup, provider)) {
      lookup[provider] = buildValue(definition, index);
    }
  });

  return lookup;
}

// 把规则定义数组压成 provider -> definition 查找表，避免一轮诊断里反复 find。
function buildRuleDefinitionLookup(ruleDefinitions) {
  return buildRuleDefinitionProviderLookup(ruleDefinitions);
}

// 把规则定义数组压成 provider -> index 查找表，减少业务链路分析里的重复 findIndex。
function buildRuleDefinitionIndexLookup(ruleDefinitions) {
  return buildRuleDefinitionProviderLookup(ruleDefinitions, (_, index) => index);
}

// 分析宽泛规则是否排在特定业务规则前面，避免目标流量被更早的规则入口提前吃掉。
function analyzeRulePriorityRisks(ruleDefinitions) {
  const definitions = Array.isArray(ruleDefinitions) ? ruleDefinitions : [];
  const definitionIndexLookup = buildRuleDefinitionIndexLookup(definitions);
  // 各类覆盖风险分别对应：平台大类规则、Geo_Not_CN、CN/CN_IP、DirectList 抢在业务规则前面。
  const result = {
    total: 0,
    platformOverrideCount: 0,
    geoOverrideCount: 0,
    cnOverrideCount: 0,
    directListOverrideCount: 0,
    previewEntries: [],
    warnings: []
  };

  function addRisk(category, blockerProvider, blockedProvider, message) {
    const blockerIndex = hasOwn(definitionIndexLookup, blockerProvider) ? definitionIndexLookup[blockerProvider] : -1;
    const blockedIndex = hasOwn(definitionIndexLookup, blockedProvider) ? definitionIndexLookup[blockedProvider] : -1;

    // 只有“阻断者”真的排在“被阻断者”前面时才算风险。
    if (blockerIndex === -1 || blockedIndex === -1 || blockerIndex >= blockedIndex) {
      return;
    }

    result.total += 1;
    increaseCategorizedCounter(result, category, RULE_PRIORITY_RISK_COUNT_FIELD_BY_CATEGORY);

    result.previewEntries.push(`${sanitizeProviderPreviewName(blockerProvider)}>${sanitizeProviderPreviewName(blockedProvider)}`);
    result.warnings.push(message);
  }

  for (const item of RULE_PRIORITY_RISK_DEFINITIONS) {
    addRisk(item.category, item.blockerProvider, item.blockedProvider, item.message);
  }

  result.previewEntries = uniqueStrings(result.previewEntries);
  result.warnings = uniqueStrings(result.warnings);
  return result;
}

// 把规则优先级风险统计压成紧凑摘要，便于响应调试头与 full 日志直接复用。
function formatRulePriorityRiskSummary(source) {
  const current = isObject(source) ? source : {};
  return `total=${Number(current.total) || 0},platform-overrides=${Number(current.platformOverrideCount) || 0},geo-overrides=${Number(current.geoOverrideCount) || 0},cn-overrides=${Number(current.cnOverrideCount) || 0},directlist-overrides=${Number(current.directListOverrideCount) || 0}`;
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

// 把策略组数组压成 name -> group 查找表，便于顺序诊断与链路总览复用。
function buildProxyGroupLookup(proxyGroups) {
  const lookup = Object.create(null);

  for (const group of Array.isArray(proxyGroups) ? proxyGroups : []) {
    const name = isObject(group) ? normalizeStringArg(group.name) : "";
    if (name && !hasOwn(lookup, name)) {
      lookup[name] = group;
    }
  }

  return lookup;
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

  // include-all / use 这类额外标记也带进摘要，方便看出候选列表是静态的还是动态汇聚的。
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
  const proxyGroupLookup = buildProxyGroupLookup(proxyGroups);
  const keyNames = [GROUPS.SELECT, GROUPS.FALLBACK, GROUPS.AI, GROUPS.GITHUB, GROUPS.DEV, GROUPS.STEAM, GROUPS.DIRECT, GROUPS.ADS];
  const entries = keyNames
    .map((name) => formatProxyGroupPriorityEntry(proxyGroupLookup[name] || null))
    .filter(Boolean);

  return entries.length ? entries.join("; ") : "none";
}

// 查找某个候选在策略组 proxies 列表中的位置，找不到时返回 -1。
function findProxyGroupCandidateIndex(group, candidate) {
  const proxies = Array.isArray(isObject(group) ? group.proxies : null) ? group.proxies : [];
  return proxies.findIndex((item) => item === candidate);
}

// 策略组优先级风险里的分类计数统一走映射，避免 addRisk 内重复 category 分支模板。
const PROXY_GROUP_PRIORITY_RISK_COUNT_FIELD_BY_CATEGORY = Object.freeze({
  "direct-group": "directGroupCount",
  "ads-group": "adsGroupCount",
  "select-chain": "selectChainCount",
  "service-chain": "serviceChainCount",
  "mode-chain": "modeCount"
});

// 分析关键策略组的候选链顺序是否偏离脚本原本意图，避免 DIRECT / REJECT / FALLBACK / SELECT 排位异常。
function analyzeProxyGroupPriorityRisks(proxyGroups) {
  const proxyGroupLookup = buildProxyGroupLookup(proxyGroups);
  // 每一类风险都既计数也保留样本，便于 full 日志快速定位异常组。
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
    increaseCategorizedCounter(result, category, PROXY_GROUP_PRIORITY_RISK_COUNT_FIELD_BY_CATEGORY);

    result.previewEntries.push(`${sanitizeProviderPreviewName(groupName)}>${tag}`);
    result.warnings.push(message);
  }

  function inspectDirectFirstServiceGroup(name, label) {
    const group = proxyGroupLookup[name] || null;
    if (!group) {
      return;
    }

    // 这类服务组设计上偏向“直连优先，再考虑主选择”。
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
    const group = proxyGroupLookup[name] || null;
    if (!group) {
      return;
    }

    // 开发服务组希望和 GitHub 组联动，GitHub 不在前面通常意味着链路退化。
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
    const group = proxyGroupLookup[name] || null;
    if (!group) {
      return;
    }

    // direct/proxy 模式只关心 DIRECT 与 SELECT 的前后顺序是否符合模式语义。
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

  const directGroup = proxyGroupLookup[GROUPS.DIRECT] || null;
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

  const adsGroup = proxyGroupLookup[GROUPS.ADS] || null;
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

  const selectGroup = proxyGroupLookup[GROUPS.SELECT] || null;
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
function buildTrafficChainGroupEntry(group) {
  const current = isObject(group) ? group : null;

  if (!current) {
    return "";
  }

  const proxies = Array.isArray(current.proxies) ? current.proxies : [];
  return `${sanitizeProviderPreviewName(current.name)}=${formatProviderPreviewNames(proxies, 3, 14)}`;
}

// 统一按“用户显式优先链 > 脚本默认优先链”解析国家组，避免 AI / Crypto / 诊断逻辑各写一份。
function buildPreferredCountryGroups(countryConfigs, preferredCountries, defaultMarkersList) {
  return buildPreferredCountryResolution(countryConfigs, preferredCountries, defaultMarkersList).groups;
}

// 同时构造国家优先链的“最终命中组 + 来源追踪 + 摘要”，避免主流程里为每条链重复拼装。
function buildPreferredCountryResolution(countryConfigs, preferredCountries, defaultMarkersList, defaultSourceKey) {
  // 只要用户显式传了 prefer-countries，就优先走“逐 token 解析 + 来源追踪”这条详细链路。
  if (Array.isArray(preferredCountries) && preferredCountries.length) {
    // 先把每个 token 展开成“命中的国家组条目 + 未命中信息”，供后面的摘要和追踪统一复用。
    const markerResolutions = analyzePreferredCountryMarkerResolutions(countryConfigs, preferredCountries);
    // entries 保存展开后的线性候选链；同一个 token 展开成多个国家组时，也会按顺序摊平到这里。
    const entries = [];
    for (const item of markerResolutions) {
      // 只收集真正命中的条目，未命中的 token 会在 unmatched 里单独汇总。
      if (Array.isArray(item.entries) && item.entries.length) {
        entries.push.apply(entries, item.entries);
      }
    }
    // 再把条目压回“最终国家组候选链”；这里会顺带去重，避免 preset / region token 展开后重复插组。
    const groups = extractPreferredCountryGroupsFromEntries(entries);
    return {
      groups,
      entries,
      // summary 用来给 full 日志和响应头看一眼最终顺序。
      summary: formatPreferredCountryGroupSummary(groups),
      // trace 用来看每个组到底来自 preset / region / country 哪一路。
      trace: formatPreferredCountryGroupTrace(entries),
      // explain 会保留“原 token -> 展开结果”的解释文本，便于排查为什么某个 token 命中了这些国家组。
      explain: formatPreferredCountryMarkerResolutionSummary(markerResolutions),
      // unmatched 单独列出没命中的 token，避免 silently ignore。
      unmatched: formatPreferredCountryUnmatchedSummary(markerResolutions.filter((item) => !item.matched).map((item) => item.token))
    };
  }

  // 如果用户没传 prefer-countries，就退回脚本内置默认链。
  const groups = (Array.isArray(defaultMarkersList) ? defaultMarkersList : [])
    // 默认链是按一组组 marker 去找国家组，比如 AI 默认就是 新加坡 -> 日本 -> 美国 -> 香港。
    .map((markers) => findCountryGroup(countryConfigs, markers))
    // 没找到的默认项直接跳过，避免把空值混进候选链。
    .filter(Boolean);
  // 默认链也统一包装成 entries，后面 trace / explain / summary 就不需要写两套逻辑。
  const entries = createPreferredCountryGroupEntries(groups, "default", defaultSourceKey || "default", "auto");
  // explain 仍然维持和显式参数同样的结构，只是 token 固定写成 auto。
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

// 统一解析 AI / Crypto / GitHub / Steam / Dev 的国家优先链，避免主流程里拆成五段重复代码。
function resolveServicePreferredCountryStates(countryConfigs) {
  const result = Object.create(null);

  for (const definition of SERVICE_PREFERRED_COUNTRY_DEFINITIONS) {
    // 若该业务显式提供了 hasArgKey 且当前未开启，则视为“关闭优先国家链”，不再回落默认值。
    const preferredCountries = definition.hasArgKey && !ARGS[definition.hasArgKey]
      ? []
      : ARGS[definition.argKey];
    const resolution = buildPreferredCountryResolution(
      countryConfigs,
      preferredCountries,
      definition.defaultMarkers,
      definition.defaultSourceKey
    );

    // 各业务最终统一沉淀为 groups/entries/summary/trace/explain/unmatched 六类字段，便于 diagnostics/full/header 共用。
    result[definition.key] = {
      groups: Array.isArray(resolution.groups) ? resolution.groups : [],
      entries: Array.isArray(resolution.entries) ? resolution.entries : [],
      resolvedSummary: resolution.summary,
      traceSummary: resolution.trace,
      explainSummary: resolution.explain,
      unmatchedSummary: resolution.unmatched
    };
  }

  return result;
}

// 把国家优先链解析结果压平成 diagnostics/full 日志统一使用的字段集合。
function buildServicePreferredCountrySummaryPayload(states) {
  const payload = {};
  const currentStates = isObject(states) ? states : {};

  for (const definition of SERVICE_PREFERRED_COUNTRY_DEFINITIONS) {
    const state = isObject(currentStates[definition.key]) ? currentStates[definition.key] : {};

    for (const field of SERVICE_PREFERRED_COUNTRY_SUMMARY_FIELDS) {
      payload[`${definition.key}PreferCountry${field.propertySuffix}`] = state[field.key] || "";
    }
  }

  return payload;
}

// 把国家优先链的某一类摘要拼成单行文本，供 full 日志复用。
function formatServicePreferredCountrySummaryLine(source, propertySuffix) {
  const current = isObject(source) ? source : {};
  return SERVICE_PREFERRED_COUNTRY_DEFINITIONS
    .map((definition) => `${definition.label}=${current[`${definition.key}PreferCountry${propertySuffix}`] || "none"}`)
    .join(", ");
}

// 判断某类国家优先链摘要是否至少有一项非空，避免日志层每次都手写一遍 some + 模板字段。
function hasServicePreferredCountrySummary(source, propertySuffix) {
  const current = isObject(source) ? source : {};
  return SERVICE_PREFERRED_COUNTRY_DEFINITIONS.some((definition) => current[`${definition.key}PreferCountry${propertySuffix}`]);
}

// 把 Github / Steam / Dev 这类服务 token 统一转成 `githubPreferGroups` / `hasGithubPreferGroups` 这类参数键名。
function buildServiceArgKey(argToken, suffix) {
  return `${String(argToken || "").charAt(0).toLowerCase()}${String(argToken || "").slice(1)}${suffix}`;
}

// 统一按 key 读取服务定义，供 mode 基链定义与 service artifact 装配复用。
function findServiceDefinitionByKey(serviceKey) {
  const key = normalizeStringArg(serviceKey).toLowerCase();
  return SERVICE_DEFINITIONS.find((definition) => definition.key === key) || null;
}

// 独立组响应头里凡是“节点池自动筛选已配置”这类布尔摘要，都走统一 helper 计算。
function buildServiceAutoProxyHeaderValue(argToken) {
  return (
    ARGS[`has${argToken}NodeFilter`] ||
    ARGS[`has${argToken}NodeExcludeFilter`] ||
    ARGS[`has${argToken}NodeExcludeType`] ||
    ARGS[`has${argToken}IncludeAllProxies`]
  )
    ? "configured"
    : "default";
}

// GitHub / Steam / Dev 这类独立组的参数对象结构高度同构，这里统一定义字段映射，避免四五份对象模板并行漂移。
function createServiceArgPayloadFieldDefinition(key, argSuffix, options) {
  return Object.freeze(Object.assign({
    key,
    argSuffix: normalizeStringArg(argSuffix)
  }, isObject(options) ? options : {}));
}

// definition-driven service payload 在兜底数组/对象时要返回副本，避免不同服务组选项共享同一引用。
function cloneServiceArgPayloadDefaultValue(value) {
  return (Array.isArray(value) || isObject(value))
    ? cloneJsonCompatibleValue(value, Array.isArray(value) ? value.slice() : Object.assign({}, value))
    : value;
}

// service payload definition 既可能取 ARGS，也可能取运行期上下文（如 providerReferences），统一收口到这里解析。
function resolveServiceArgPayloadFieldValue(argToken, definition, runtimeContext) {
  const current = isObject(runtimeContext) ? runtimeContext : {};
  const fieldDefinition = isObject(definition) ? definition : {};

  if (typeof fieldDefinition.valueBuilder === "function") {
    return fieldDefinition.valueBuilder(argToken, current, fieldDefinition);
  }

  const contextKey = normalizeStringArg(fieldDefinition.contextKey);
  if (contextKey) {
    return hasOwn(current, contextKey)
      ? current[contextKey]
      : (hasOwn(fieldDefinition, "defaultValue") ? cloneServiceArgPayloadDefaultValue(fieldDefinition.defaultValue) : undefined);
  }

  const argSuffix = normalizeStringArg(fieldDefinition.argSuffix);
  if (argSuffix) {
    return fieldDefinition.hasArg
      ? ARGS[`has${argToken}${argSuffix}`]
      : ARGS[buildServiceArgKey(argToken, argSuffix)];
  }

  return hasOwn(fieldDefinition, "defaultValue")
    ? cloneServiceArgPayloadDefaultValue(fieldDefinition.defaultValue)
    : undefined;
}

// 独立组参数对象统一走 definitions -> payload 装配，后续再新增字段时只需扩表。
function buildServiceArgPayload(argToken, definitions, runtimeContext) {
  const payload = {};

  for (const definition of Array.isArray(definitions) ? definitions : []) {
    const key = normalizeStringArg(definition && definition.key);
    if (!key) {
      continue;
    }

    payload[key] = resolveServiceArgPayloadFieldValue(argToken, definition, runtimeContext);
  }

  return payload;
}

const SERVICE_LATENCY_OVERRIDE_FIELD_DEFINITIONS = Object.freeze([
  createServiceArgPayloadFieldDefinition("testUrl", "TestUrl"),
  createServiceArgPayloadFieldDefinition("hasTestUrl", "TestUrl", { hasArg: true }),
  createServiceArgPayloadFieldDefinition("groupInterval", "GroupInterval"),
  createServiceArgPayloadFieldDefinition("hasGroupInterval", "GroupInterval", { hasArg: true }),
  createServiceArgPayloadFieldDefinition("groupTolerance", "GroupTolerance"),
  createServiceArgPayloadFieldDefinition("hasGroupTolerance", "GroupTolerance", { hasArg: true }),
  createServiceArgPayloadFieldDefinition("groupTimeout", "GroupTimeout"),
  createServiceArgPayloadFieldDefinition("hasGroupTimeout", "GroupTimeout", { hasArg: true }),
  createServiceArgPayloadFieldDefinition("groupLazy", "GroupLazy"),
  createServiceArgPayloadFieldDefinition("hasGroupLazy", "GroupLazy", { hasArg: true }),
  createServiceArgPayloadFieldDefinition("groupMaxFailedTimes", "GroupMaxFailedTimes"),
  createServiceArgPayloadFieldDefinition("hasGroupMaxFailedTimes", "GroupMaxFailedTimes", { hasArg: true }),
  createServiceArgPayloadFieldDefinition("groupExpectedStatus", "GroupExpectedStatus"),
  createServiceArgPayloadFieldDefinition("hasGroupExpectedStatus", "GroupExpectedStatus", { hasArg: true }),
  createServiceArgPayloadFieldDefinition("groupStrategy", "GroupStrategy"),
  createServiceArgPayloadFieldDefinition("hasGroupStrategy", "GroupStrategy", { hasArg: true })
]);

const SERVICE_AUTO_COLLECTION_OPTION_FIELD_DEFINITIONS = Object.freeze([
  createServiceArgPayloadFieldDefinition("filter", "NodeFilter"),
  createServiceArgPayloadFieldDefinition("excludeFilter", "NodeExcludeFilter"),
  createServiceArgPayloadFieldDefinition("excludeType", "NodeExcludeType"),
  createServiceArgPayloadFieldDefinition("includeAllProxies", "IncludeAllProxies")
]);

const SERVICE_PROVIDER_COLLECTION_OPTION_FIELD_DEFINITIONS = Object.freeze([
  createServiceArgPayloadFieldDefinition("includeAll", "IncludeAll"),
  createServiceArgPayloadFieldDefinition("use", "", { contextKey: "providerReferences", defaultValue: [] }),
  createServiceArgPayloadFieldDefinition("includeAllProviders", "IncludeAllProviders")
]);

const SERVICE_ADVANCED_OPTION_FIELD_DEFINITIONS = Object.freeze([
  createServiceArgPayloadFieldDefinition("hidden", "Hidden"),
  createServiceArgPayloadFieldDefinition("hasHidden", "Hidden", { hasArg: true }),
  createServiceArgPayloadFieldDefinition("disableUdp", "DisableUdp"),
  createServiceArgPayloadFieldDefinition("hasDisableUdp", "DisableUdp", { hasArg: true }),
  createServiceArgPayloadFieldDefinition("icon", "Icon"),
  createServiceArgPayloadFieldDefinition("hasIcon", "Icon", { hasArg: true }),
  createServiceArgPayloadFieldDefinition("interfaceName", "InterfaceName"),
  createServiceArgPayloadFieldDefinition("hasInterfaceName", "InterfaceName", { hasArg: true }),
  createServiceArgPayloadFieldDefinition("routingMark", "RoutingMark"),
  createServiceArgPayloadFieldDefinition("hasRoutingMark", "RoutingMark", { hasArg: true })
]);

// GitHub / Steam / Dev 这类独立组的测速覆盖项结构一致，这里统一按参数 definitions 装配。
function buildServiceLatencyOverrides(argToken) {
  return buildServiceArgPayload(argToken, SERVICE_LATENCY_OVERRIDE_FIELD_DEFINITIONS);
}

// GitHub / Steam / Dev 的原始节点自动收集参数也完全同构，统一由 definitions 生成。
function buildServiceAutoCollectionOptions(argToken) {
  return buildServiceArgPayload(argToken, SERVICE_AUTO_COLLECTION_OPTION_FIELD_DEFINITIONS);
}

// GitHub / Steam / Dev 的 provider 池配置统一走 definitions + runtimeContext，调用方只需传入已解析好的 provider 引用列表。
function buildServiceProviderCollectionOptions(argToken, providerReferences) {
  return buildServiceArgPayload(argToken, SERVICE_PROVIDER_COLLECTION_OPTION_FIELD_DEFINITIONS, {
    providerReferences: Array.isArray(providerReferences) ? providerReferences : []
  });
}

// GitHub / Steam / Dev 的展示与网络高级项统一 definitions 化，避免 buildProxyGroups 里重复写 hidden/icon/udp/interface/routing-mark。
function buildServiceAdvancedOptions(argToken) {
  return buildServiceArgPayload(argToken, SERVICE_ADVANCED_OPTION_FIELD_DEFINITIONS);
}

// 统一解析 GitHub / Steam / Dev 的前置组、点名节点与 provider 引用，避免 buildProxyGroups 里重复写三组相同分支。
function resolveServicePreferredResources(argToken, availableGroupNames, proxyNames, providerNames, excludedGroupName) {
  return {
    // 前置组引用会排除自身组名，避免出现 “GitHub 组引用 GitHub 组自己” 的自循环。
    preferredReferences: ARGS[`has${argToken}PreferGroups`]
      ? resolvePreferredGroupReferences(
        availableGroupNames,
        ARGS[buildServiceArgKey(argToken, "PreferGroups")],
        [excludedGroupName]
      )
      : [],
    // 点名节点直接从最终节点名列表里解析，优先级高于模式默认链。
    preferredNodes: ARGS[`has${argToken}PreferNodes`]
      ? resolvePreferredProxyReferences(proxyNames, ARGS[buildServiceArgKey(argToken, "PreferNodes")])
      : [],
    // provider 引用交给后续 service group 的 provider collection 选项去消费。
    providerReferences: ARGS[`has${argToken}UseProviders`]
      ? resolvePreferredProxyProviderReferences(providerNames, ARGS[buildServiceArgKey(argToken, "UseProviders")])
      : []
  };
}

// 统一组装 GitHub / Steam / Dev 的最终候选链：国家优先 -> 前置组 -> 点名节点，并在 direct 模式下固定 DIRECT 第一位。
function buildServicePreferredProxies(options) {
  const current = isObject(options) ? options : {};
  const mode = normalizeStringArg(current.mode).toLowerCase();
  // direct 模式需要确保 DIRECT 被强制顶到最前；其余模式则只是在基础链前 prepend 偏好组。
  const keepDirectFirst = mode === "direct";
  const modeBaseProxies = Array.isArray(current.modeBaseProxies) ? current.modeBaseProxies : [];
  const directPreferBaseProxies = Array.isArray(current.directPreferBaseProxies) ? current.directPreferBaseProxies : modeBaseProxies;
  const preferredGroups = Array.isArray(current.preferredGroups) ? current.preferredGroups : [];
  const preferredReferences = Array.isArray(current.preferredReferences) ? current.preferredReferences : [];
  const preferredNodes = Array.isArray(current.preferredNodes) ? current.preferredNodes : [];

  // 先处理国家优先链，再叠加 prefer-groups，最后才叠加点名节点，形成最终优先顺序。
  const countryResolvedProxies = current.hasPreferredCountries
    ? (keepDirectFirst
      ? uniqueStrings([BUILTIN_DIRECT].concat(prependPreferredGroups(preferredGroups, directPreferBaseProxies)))
      : prependPreferredGroups(preferredGroups, modeBaseProxies))
    : modeBaseProxies;
  const structuredProxies = preferredReferences.length
    ? prependPreferredNames(preferredReferences, countryResolvedProxies, keepDirectFirst)
    : countryResolvedProxies;

  return preferredNodes.length
    ? prependPreferredNames(preferredNodes, structuredProxies, keepDirectFirst)
    : structuredProxies;
}

// 各服务组的 mode 分支虽然细节不同，但都统一挂在 SERVICE_DEFINITIONS 上，避免 mode 基链和最终组装各维护一份映射。
function buildServiceModeBaseProxyBranches(serviceDefinition, context) {
  const definition = isObject(serviceDefinition) ? serviceDefinition : {};
  const current = isObject(context) ? context : {};
  return typeof definition.resolveModeBaseProxyBranches === "function"
    ? definition.resolveModeBaseProxyBranches(current)
    : {
      direct: current.directFirstProxies,
      proxy: current.baseProxies,
      default: current.selectFirstProxies
    };
}

// 按服务定义统一解析当前业务的 mode 对应基础链，减少 mode key / mode arg 两套表之间的漂移风险。
function buildServiceModeBaseProxies(serviceDefinition, context) {
  const definition = isObject(serviceDefinition) ? serviceDefinition : {};
  return resolveServiceModeBaseProxies(
    ARGS[buildServiceArgKey(definition.argToken, "Mode")],
    buildServiceModeBaseProxyBranches(definition, context)
  );
}

// 把某个 SERVICE_DEFINITIONS 条目转换成 buildProxyGroups 运行期 context definition，统一生成 github/steam/dev 三套 mode 基链。
function createServiceModeBaseProxyDefinition(serviceDefinition) {
  const definition = isObject(serviceDefinition) ? serviceDefinition : null;
  if (!definition || !definition.modeBaseProxiesContextKey) {
    return null;
  }

  return {
    key: definition.modeBaseProxiesContextKey,
    value: (context) => buildServiceModeBaseProxies(definition, context)
  };
}

const PROXY_GROUP_SERVICE_ARTIFACT_PAYLOAD_DEFINITIONS = Object.freeze([
  { key: "argToken", value: (context, definition) => definition.argToken },
  { key: "groupName", value: (context, definition) => definition.groupName },
  { key: "type", value: (context, definition) => ARGS[buildServiceArgKey(definition.argToken, "Type")] },
  { key: "mode", value: (context, definition) => ARGS[buildServiceArgKey(definition.argToken, "Mode")] },
  { key: "hasPreferredCountries", value: (context, definition) => !!ARGS[`has${definition.argToken}PreferCountries`] },
  {
    key: "preferredGroups",
    value: (context, definition) => context[normalizeStringArg(definition.preferredGroupsContextKey)]
  },
  {
    key: "modeBaseProxies",
    value: (context, definition) => context[normalizeStringArg(definition.modeBaseProxiesContextKey)]
  },
  {
    key: "directPreferBaseProxies",
    value: (context, definition) => typeof definition.resolveDirectPreferBaseProxies === "function"
      ? definition.resolveDirectPreferBaseProxies(context)
      : context.selectFirstProxies
  },
  { key: "availableGroupNames", value: (context) => context.availableGroupNames },
  { key: "proxyNames", value: (context) => context.proxyNames },
  { key: "providerNames", value: (context) => context.existingProxyProviderNames }
]);

// service artifact 装配前先按统一定义把上下文拍平成 payload，后续 buildProxyGroupServiceArtifacts 就只关心“如何装配”，不再知道外部 key 名。
function buildProxyGroupServiceArtifactPayload(serviceDefinition, payload) {
  const definition = isObject(serviceDefinition) ? serviceDefinition : {};
  const current = isObject(payload) ? payload : {};
  return buildDefinitionDrivenPayload(PROXY_GROUP_SERVICE_ARTIFACT_PAYLOAD_DEFINITIONS, current, definition);
}

const PROXY_GROUP_SERVICE_ARTIFACT_DEFINITIONS = Object.freeze([
  { key: "groupName", value: (context) => context.groupName },
  { key: "type", value: (context) => context.type },
  { key: "preferredResources", value: (context, argToken, preferredResources) => preferredResources },
  {
    key: "proxies",
    value: (context, argToken, preferredResources) => buildServicePreferredProxies({
      mode: context.mode,
      hasPreferredCountries: context.hasPreferredCountries,
      preferredGroups: context.preferredGroups,
      modeBaseProxies: context.modeBaseProxies,
      directPreferBaseProxies: context.directPreferBaseProxies,
      preferredReferences: preferredResources.preferredReferences,
      preferredNodes: preferredResources.preferredNodes
    })
  },
  { key: "latencyOverrides", value: (context, argToken) => buildServiceLatencyOverrides(argToken) },
  { key: "autoCollectionOptions", value: (context, argToken) => buildServiceAutoCollectionOptions(argToken) },
  {
    key: "providerCollectionOptions",
    value: (context, argToken, preferredResources) => buildServiceProviderCollectionOptions(argToken, preferredResources.providerReferences)
  },
  { key: "advancedOptions", value: (context, argToken) => buildServiceAdvancedOptions(argToken) }
]);

// GitHub / Steam / Dev 三类独立组在 buildProxyGroups 里的资源解析、候选链与组选项构建模板完全一致，这里统一装配。
function buildProxyGroupServiceArtifacts(payload) {
  const context = isObject(payload) ? payload : {};
  const argToken = normalizeStringArg(context.argToken);
  // 先把 prefer-groups / prefer-nodes / use-providers 三类“显式资源偏好”统一解析出来。
  const preferredResources = resolveServicePreferredResources(
    argToken,
    context.availableGroupNames,
    context.proxyNames,
    context.providerNames,
    context.groupName
  );

  return buildDefinitionDrivenPayload(PROXY_GROUP_SERVICE_ARTIFACT_DEFINITIONS, context, argToken, preferredResources);
}

// 按统一计划批量构造 GitHub / Steam / Dev 的服务组中间产物；定义只保留在 SERVICE_DEFINITIONS 一处，避免 key/arg/context 映射漂移。
function buildProxyGroupServiceArtifactMap(payload) {
  const current = isObject(payload) ? payload : {};
  const artifacts = Object.create(null);
  for (const definition of SERVICE_DEFINITIONS) {
    artifacts[definition.key] = buildProxyGroupServiceArtifacts(
      buildProxyGroupServiceArtifactPayload(definition, current)
    );
  }

  return artifacts;
}

// 固定功能组里部分条目虽然组名不同，但最终都落到同一套 createSelectGroup/createServiceGroup 模板，这里统一收口。
function createProxyGroupServiceArtifactGroup(serviceArtifact) {
  const current = isObject(serviceArtifact) ? serviceArtifact : {};
  // serviceArtifact 已经预先算好候选链、测速覆盖、节点池筛选和高级项；这里仅负责落成最终 group 对象。
  return createServiceGroup(
    current.groupName,
    Array.isArray(current.proxies) ? current.proxies : [],
    current.type,
    current.latencyOverrides,
    current.autoCollectionOptions,
    current.advancedOptions,
    current.providerCollectionOptions
  );
}

// definitions 里这类 `build(current)` 循环在 buildProxyGroups 周边出现了“直接收集 / 拍平收集”两种形态，这里统一收口。
function buildDefinitionBuildList(definitions, context, options) {
  const source = Array.isArray(definitions) ? definitions : [];
  const current = isObject(context) ? context : {};
  const currentOptions = isObject(options) ? options : {};
  // flatten 控制是否打平 build 返回数组；filterFalsy 控制是否去掉 null/undefined/"" 这类空项。
  const flatten = !!currentOptions.flatten;
  const filterFalsy = !!currentOptions.filterFalsy;
  const items = [];

  for (const definition of source) {
    if (!definition || typeof definition.build !== "function") {
      continue;
    }

    const built = definition.build(current);

    if (flatten && Array.isArray(built)) {
      items.push.apply(items, filterFalsy ? built.filter(Boolean) : built);
      continue;
    }

    if (filterFalsy && !built) {
      continue;
    }

    items.push(built);
  }

  return items;
}

// buildProxyGroups 的 generatedGroups 最终都来自“固定组 + 追加组”这同一份生成计划；这里改成按调用时再拼接，避免读取到尚未初始化的 const。
function getProxyGroupGeneratedGroupDefinitions() {
  // 这里故意不做顶层 const 缓存：等真正执行到 buildProxyGroups 时，后面的 definitions 才已经全部完成初始化。
  // 返回的是一份“固定组 + 追加组”的临时拼接结果，后续 builder 只消费，不会反向修改原 definitions。
  return PROXY_GROUP_FIXED_GROUP_DEFINITIONS.concat(PROXY_GROUP_EXTRA_GROUP_DEFINITIONS);
}

// buildProxyGroups 的 generatedGroups 统一走单一生成计划，避免主函数尾段继续保留两段 definitions 的手工拼接。
function buildProxyGroupGeneratedGroups(payload) {
  const context = isObject(payload) ? payload : {};
  // definitions 在这里现取现用，既复用统一 builder，又规避顶层初始化顺序带来的 TDZ 风险。
  // flatten/filterFalsy 会把条件不成立返回的 null、空条目统一清理掉，避免最终 proxy-groups 混进无效占位项。
  return buildDefinitionBuildList(getProxyGroupGeneratedGroupDefinitions(), context, {
    flatten: true,
    filterFalsy: true
  });
}

// generatedGroups 最后总会经历 merge + resolve order 这两个固定收尾步骤，这里单独抽出便于继续收敛。
function finalizeProxyGroupGeneration(generatedGroups, existingGroups, countryGroupNames, regionGroupNames) {
  const mergedGroups = mergeProxyGroups(generatedGroups, existingGroups);
  return resolveConfiguredProxyGroupOrder(mergedGroups, countryGroupNames, regionGroupNames).groups;
}

// buildProxyGroups 开头那批 country/region/group/provider/name 提取都是无副作用派生值，这里统一裁成基础上下文。
function buildProxyGroupBaseContext(payload) {
  const context = isObject(payload) ? payload : {};
  const countries = Array.isArray(context.countryConfigs) ? context.countryConfigs : [];
  const regions = Array.isArray(context.regionConfigs) ? context.regionConfigs : [];
  const countryCoverage = analyzeCountryCoverage(context.proxies);
  return {
    countryGroupNames: countries.map((country) => country.name),
    resolvedRegionConfigs: regions,
    regionGroupNames: regions.map((region) => region.name),
    existingGroupNames: collectNamedEntries(context.existingGroups),
    existingProxyProviderNames: Object.keys(isObject(context.existingProxyProviders) ? context.existingProxyProviders : {}),
    proxyNames: collectNamedEntries(context.proxies),
    countryFilters: countries.map((country) => country.filter),
    countryCoverage,
    classifiedCountryProxyCount: countryCoverage.classified
  };
}

// GitHub / Steam / Dev 这类“显式开启才生效”的优先国家链都遵循同一套规则，这里统一收口。
function resolveOptionalPreferredCountryGroups(countryConfigs, enabled, markers) {
  return enabled ? resolvePreferredCountryGroups(countryConfigs, markers) : [];
}

// 服务组虽然名称不同，但 mode 只分 direct / proxy / default 三路，这里统一根据模式挑选基础候选链。
function resolveServiceModeBaseProxies(mode, branches) {
  const current = isObject(branches) ? branches : {};
  return mode === "direct"
    ? toStringArray(current.direct)
    : (mode === "proxy"
      ? toStringArray(current.proxy)
      : toStringArray(current.default));
}

// buildProxyGroups 前半段里 AI / Crypto / GitHub / Steam / Dev 的优先国家组解析模式固定，统一改成定义驱动。
const PROXY_GROUP_PREFERRED_COUNTRY_DEFINITIONS = Object.freeze([
  {
    key: "aiPreferredGroups",
    value: (context) => buildPreferredCountryGroups(context.countryConfigs, ARGS.aiPreferCountries, DEFAULT_AI_PREFERRED_COUNTRY_MARKERS)
  },
  {
    key: "cryptoPreferredGroups",
    value: (context) => buildPreferredCountryGroups(context.countryConfigs, ARGS.cryptoPreferCountries, DEFAULT_CRYPTO_PREFERRED_COUNTRY_MARKERS)
  },
  {
    key: "githubPreferredGroups",
    value: (context) => resolveOptionalPreferredCountryGroups(context.countryConfigs, ARGS.hasGithubPreferCountries, ARGS.githubPreferCountries)
  },
  {
    key: "steamPreferredGroups",
    value: (context) => resolveOptionalPreferredCountryGroups(context.countryConfigs, ARGS.hasSteamPreferCountries, ARGS.steamPreferCountries)
  },
  {
    key: "devPreferredGroups",
    value: (context) => resolveOptionalPreferredCountryGroups(context.countryConfigs, ARGS.hasDevPreferCountries, ARGS.devPreferCountries)
  }
]);

// GitHub / Steam / Dev 三类服务组的 mode 基链定义统一回收到 SERVICE_DEFINITIONS，避免 mode 规则与 artifact 装配维护两套独立映射。
const PROXY_GROUP_MODE_BASE_PROXY_DEFINITIONS = Object.freeze(
  ["dev", "github", "steam"]
    .map((serviceKey) => createServiceModeBaseProxyDefinition(findServiceDefinitionByKey(serviceKey)))
    .filter(Boolean)
);

// 把一组服务按统一格式拼成 `github=... , steam=...` 这种单行摘要，供 full 日志复用。
function formatServiceLogSummary(services, formatter) {
  const source = Array.isArray(services) ? services : [];
  const formatCurrent = typeof formatter === "function" ? formatter : (() => "default");
  return source
    .map((service) => `${service.key}=${formatCurrent(service)}`)
    .join(", ");
}

// 读取 GitHub / Steam / Dev 的通用参数值；未显式配置时统一回退到 default。
function getServiceArgLogValue(argToken, suffix, fallback) {
  const hasKey = `has${argToken}${suffix}`;
  const valueKey = buildServiceArgKey(argToken, suffix);
  if (!ARGS[hasKey]) {
    return typeof fallback === "undefined" ? "default" : fallback;
  }

  const value = ARGS[valueKey];
  if (Array.isArray(value)) {
    return value.length ? value.join(" > ") : "default";
  }

  return hasUsableArgValue(value) ? value : "default";
}

// 统一格式化独立组 provider 池日志：优先显示 include-all，其次 include-all-providers，再回退 use-providers。
function formatServiceProviderPoolLogValue(argToken) {
  if (ARGS[`has${argToken}IncludeAll`]) {
    return ARGS[buildServiceArgKey(argToken, "IncludeAll")] ? "include-all" : "off";
  }

  if (ARGS[`has${argToken}IncludeAllProviders`]) {
    return ARGS[buildServiceArgKey(argToken, "IncludeAllProviders")] ? "include-all-providers" : "off";
  }

  return getServiceArgLogValue(argToken, "UseProviders");
}

// 统一格式化独立组测速日志。
const SERVICE_LATENCY_LOG_FIELD_DEFINITIONS = Object.freeze([
  { label: "test-url", suffix: "TestUrl" },
  { label: "group-interval", suffix: "GroupInterval" },
  { label: "group-tolerance", suffix: "GroupTolerance" },
  { label: "group-timeout", suffix: "GroupTimeout" },
  { label: "group-lazy", suffix: "GroupLazy" },
  { label: "group-max-failed-times", suffix: "GroupMaxFailedTimes" },
  { label: "group-expected-status", suffix: "GroupExpectedStatus" },
  { label: "group-strategy", suffix: "GroupStrategy" }
]);
// 节点池相关日志字段统一收成 definitions，便于 GitHub / Steam / Dev 共用同一套输出模板。
const SERVICE_NODE_POOL_LOG_FIELD_DEFINITIONS = Object.freeze([
  { label: "include-all-proxies", suffix: "IncludeAllProxies" },
  { label: "filter", suffix: "NodeFilter" },
  { label: "exclude-filter", suffix: "NodeExcludeFilter" },
  { label: "exclude-type", suffix: "NodeExcludeType" }
]);
// Dev 组额外支持 mode/type/test-url 等高级项，所以这里单独维护它的专属日志字段集合。
const DEV_SERVICE_ADVANCED_LOG_FIELD_DEFINITIONS = Object.freeze([
  { label: "test-url", suffix: "TestUrl" },
  { label: "strategy", suffix: "GroupStrategy" },
  { label: "hidden", suffix: "Hidden" },
  { label: "disable-udp", suffix: "DisableUdp" },
  { label: "icon", suffix: "Icon" },
  { label: "interface-name", suffix: "InterfaceName" },
  { label: "routing-mark", suffix: "RoutingMark" }
]);

// 统一格式化独立组测速/健康检查相关参数摘要。
function formatServiceLatencyLogValue(argToken) {
  return formatServiceArgFieldsLogValue(argToken, SERVICE_LATENCY_LOG_FIELD_DEFINITIONS);
}

// 统一格式化独立组节点池日志。
function formatServiceNodePoolLogValue(argToken) {
  return formatServiceArgFieldsLogValue(argToken, SERVICE_NODE_POOL_LOG_FIELD_DEFINITIONS);
}

// 一组 `label + argSuffix` 型日志字段都统一走这套 formatter，避免测速/节点池/高级项各写一份 map 模板。
function formatServiceArgFieldsLogValue(argToken, fields) {
  return (Array.isArray(fields) ? fields : [])
    .map((field) => `${field.label}=${getServiceArgLogValue(argToken, field.suffix)}`)
    .join(", ");
}

// 这类“遍历一组定义 -> 拼装 warnings 数组”的模式在服务校验里多次出现，这里统一抽成 helper。
function collectDefinitionWarnings(definitions, context, collector) {
  const warnings = [];
  const source = Array.isArray(definitions) ? definitions : [];
  const collect = typeof collector === "function" ? collector : (() => []);

  for (const definition of source) {
    const currentWarnings = collect(definition, context);
    if (Array.isArray(currentWarnings) && currentWarnings.length) {
      warnings.push.apply(warnings, currentWarnings);
    }
  }

  return uniqueStrings(warnings);
}

// 汇总 AI / Crypto / GitHub / Steam / Dev 的 prefer-countries 校验告警，避免 validate 阶段把同一模式手写五遍。
function collectPreferredCountryWarnings(countryConfigs) {
  return collectDefinitionWarnings(
    SERVICE_PREFERRED_COUNTRY_DEFINITIONS,
    countryConfigs,
    (definition, currentCountryConfigs) => validatePreferredCountryMarkers(currentCountryConfigs, ARGS[definition.argKey], definition.label)
  );
}

// 汇总 GitHub / Steam / Dev 的前置组引用告警，避免每加一个独立组都要手动改 validate 拼接。
function collectPreferredGroupWarnings(availableGroupNames) {
  return collectDefinitionWarnings(
    SERVICE_RESOURCE_VALIDATION_DEFINITIONS,
    availableGroupNames,
    (definition, currentGroupNames) => validatePreferredGroupMarkers(
      currentGroupNames,
      ARGS[buildServiceArgKey(definition.argToken, "PreferGroups")],
      definition.label,
      [definition.groupName]
    )
  );
}

// 汇总 GitHub / Steam / Dev 的点名节点告警。
function collectPreferredNodeWarnings(proxyNames) {
  return collectDefinitionWarnings(
    SERVICE_RESOURCE_VALIDATION_DEFINITIONS,
    proxyNames,
    (definition, currentProxyNames) => validatePreferredProxyMarkers(
      currentProxyNames,
      ARGS[buildServiceArgKey(definition.argToken, "PreferNodes")],
      definition.label
    )
  );
}

// 汇总 GitHub / Steam / Dev 的 provider 池引用告警，同时兼容 include-all / include-all-providers 官方语义。
function collectPreferredProviderWarnings(availableProxyProviderNames) {
  return collectDefinitionWarnings(
    SERVICE_RESOURCE_VALIDATION_DEFINITIONS,
    availableProxyProviderNames,
    (definition, currentProviderNames) => validatePreferredProxyProviderMarkers(
      currentProviderNames,
      ARGS[buildServiceArgKey(definition.argToken, "UseProviders")],
      definition.label,
      ARGS[buildServiceArgKey(definition.argToken, "IncludeAllProviders")],
      ARGS[buildServiceArgKey(definition.argToken, "IncludeAll")]
    )
  );
}

// 汇总“请求 -> 规则 -> 目标组 -> 组内候选链”的关键链路，便于快速观察整条分流路径。
function analyzeRoutingChain(runtimeContext, queryArgs, rules, ruleDefinitions, proxyGroups) {
  const context = isObject(runtimeContext) ? runtimeContext : {};
  const currentRules = Array.isArray(rules) ? rules : [];
  const definitions = Array.isArray(ruleDefinitions) ? ruleDefinitions : [];
  // 先把规则与策略组都建成 lookup，后面按 provider/group 名检索会更轻。
  const definitionLookup = buildRuleDefinitionLookup(definitions);
  const proxyGroupLookup = buildProxyGroupLookup(proxyGroups);
  const query = isObject(queryArgs) ? queryArgs : {};
  // 这里只挑一批最关键的 provider 观察其规则落点，避免预览过长。
  const keyProviders = ["ADBlock"]
    .concat(ARGS.steamFix ? ["SteamFix"] : [])
    .concat(["GitHub", "GitLab", "Docker", "Npmjs", "Jetbrains", "Vercel", "Python", "Jfrog", "Heroku", "GitBook", "SourceForge", "DigitalOcean", "Anaconda", "Atlassian", "Notion", "Figma", "Slack", "Dropbox", "OneDrive", "Steam", "SteamCN", "Geo_Not_CN", "CN", "DirectList"]);
  const ruleEntries = keyProviders
    .map((provider) => {
      const definition = definitionLookup[provider];
      return definition ? `${sanitizeProviderPreviewName(provider)}->${sanitizeProviderPreviewName(definition.target)}${definition.noResolve ? ":NR" : ""}` : "";
    })
    .filter(Boolean);
  const groupEntries = [GROUPS.SELECT, GROUPS.GITHUB, GROUPS.DEV, GROUPS.STEAM, GROUPS.DIRECT, GROUPS.ADS]
    .map((groupName) => buildTrafficChainGroupEntry(proxyGroupLookup[groupName] || null))
    .filter(Boolean);
  const matchRule = currentRules.find((rule) => /^MATCH,/i.test(normalizeStringArg(rule)));
  // MATCH 是最后兜底规则，能直接看出“其余流量最终会被送到哪里”。
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
function analyzeServiceRoutingProfiles(ruleDefinitions, proxyGroups, countryConfigs, preferredCountryStates) {
  const definitions = Array.isArray(ruleDefinitions) ? ruleDefinitions : [];
  const countries = Array.isArray(countryConfigs) ? countryConfigs : [];
  const definitionLookup = buildRuleDefinitionLookup(definitions);
  const definitionIndexLookup = buildRuleDefinitionIndexLookup(definitions);
  const proxyGroupLookup = buildProxyGroupLookup(proxyGroups);
  const preferredStates = isObject(preferredCountryStates) ? preferredCountryStates : {};
  // Crypto / Dev 可能会引用“当前解析出的优先国家状态”，如果上游没传，就按 ARGS 即席重建。
  const cryptoPreferredGroups = isObject(preferredStates.crypto)
    ? preferredStates.crypto.groups
    : buildPreferredCountryGroups(countries, ARGS.cryptoPreferCountries, DEFAULT_CRYPTO_PREFERRED_COUNTRY_MARKERS);
  const devPreferredGroups = isObject(preferredStates.dev)
    ? preferredStates.dev.groups
    : (ARGS.hasDevPreferCountries ? resolvePreferredCountryGroups(countries, ARGS.devPreferCountries) : []);
  const cryptoPreferredGroupNames = cryptoPreferredGroups
    .map((group) => group && group.name)
    .filter(Boolean);
  const devPreferredGroupNames = devPreferredGroups
    .map((group) => group && group.name)
    .filter(Boolean);
  const cryptoPreferredGroupLookup = createLookup(cryptoPreferredGroupNames);
  const devPreferredGroupLookup = createLookup(devPreferredGroupNames);
  const hasDeveloperLeadingOverrides = !!(ARGS.hasDevPreferCountries || ARGS.hasDevPreferGroups || ARGS.hasDevPreferNodes);
  const expectedDeveloperFirstProxy = ARGS.devMode === "direct"
    ? BUILTIN_DIRECT
    : (hasDeveloperLeadingOverrides ? "" : GROUPS.GITHUB);
  // total/expected/... 是摘要计数；previewEntries/warnings 是排查具体问题的样本。
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
    const definition = definitionLookup[profile.provider];
    // 若规则缺失则退回 profile 自带的期望目标，便于同时观察“实际值”和“预期值”。
    const target = normalizeStringArg(definition && definition.target) || profile.expectedTarget;
    const targetGroup = proxyGroupLookup[target] || null;
    const groupType = targetGroup
      ? (normalizeStringArg(targetGroup.type) || "select")
      : (BUILTIN_POLICY_NAMES.includes(target) ? "builtin" : "missing");
    const groupProxies = Array.isArray(targetGroup && targetGroup.proxies) ? targetGroup.proxies : [];
    const firstProxy = groupProxies[0] || (target === BUILTIN_DIRECT ? BUILTIN_DIRECT : "");
    const ruleIndex = hasOwn(definitionIndexLookup, profile.provider) ? definitionIndexLookup[profile.provider] : -1;

    result.total += 1;
    // 下面这些计数是为了快速看出关键业务链路是否大量偏离预期。
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

    // 以下 warning 都是“虽然配置能跑，但流量行为可能偏离直觉”的高价值提示。
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
      devPreferredGroupNames.length &&
      firstProxy &&
      !devPreferredGroupLookup[firstProxy]
    ) {
      result.warnings.push(`${profile.label} 当前打到 ${GROUPS.DEV}，但 ${GROUPS.DEV} 第一个候选不是开发优先国家链 ${formatProviderPreviewNames(devPreferredGroupNames, 3, 12)} 中的组，而是 ${firstProxy}；相关流量可能不会先走偏好的国家节点`);
    }

    if (profile.provider === "SteamCN" && target === GROUPS.SELECT) {
      result.warnings.push(`SteamCN 规则当前直接打到 ${GROUPS.SELECT}；中国区流量会绕过 Steam 组内的直连优先链，相关请求可能不会先走 DIRECT`);
    }

    if (profile.provider === "AI" && firstProxy === BUILTIN_DIRECT) {
      result.warnings.push("AI 组当前第一个候选是 DIRECT；AIExtra / OpenAI / Anthropic / Gemini / Copilot / Grok / AppleAI 等流量可能会先走直连，而不是 AI 优先国家链");
    }

    if (profile.provider === "Crypto" && cryptoPreferredGroupNames.length && firstProxy && !cryptoPreferredGroupLookup[firstProxy]) {
      result.warnings.push(`Crypto 组当前第一个候选是 ${firstProxy}，而不是预设国家优先链 ${formatProviderPreviewNames(cryptoPreferredGroupNames, 3, 12)}；相关流量可能不会先走偏好的国家节点`);
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
    // 没有显式锚点时，默认仍然把自定义规则插在 MATCH 前。
    return rules.length;
  }

  const anchorResult = inspectRuleProviderReference(ruleDefinitions, ARGS.customRuleAnchor);
  if (!anchorResult.match) {
    // 锚点解析失败时回退默认行为，避免把 config.rules 丢失掉。
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

  // 这里把命中的规则定义重新拼成最终 RULE-SET 字符串，再去 bodyRules 中找实际索引。
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

// 顶层缓存策略组布局别名表；direct 这里特指脚本生成的“全球直连”组，而不是内置 DIRECT。
const PROXY_GROUP_ORDER_ALIAS_MAP = Object.freeze(Object.assign({
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
  discord: GROUPS.DISCORD,
  dc: GROUPS.DISCORD,
  telegram: GROUPS.TELEGRAM,
  whatsapp: GROUPS.WHATSAPP,
  wa: GROUPS.WHATSAPP,
  line: GROUPS.LINE,
  twitter: GROUPS.TWITTER,
  tweet: GROUPS.TWITTER,
  pinterest: GROUPS.INSTAGRAM,
  instagram: GROUPS.INSTAGRAM,
  ig: GROUPS.INSTAGRAM,
  facebook: GROUPS.FACEBOOK,
  fb: GROUPS.FACEBOOK,
  reddit: GROUPS.REDDIT,
  youtube: GROUPS.YOUTUBE,
  streaming: GROUPS.STREAMING,
  stream: GROUPS.STREAMING,
  vod: GROUPS.STREAMING,
  netflix: GROUPS.NETFLIX,
  disney: GROUPS.DISNEY,
  disneyplus: GROUPS.DISNEY,
  spotify: GROUPS.SPOTIFY,
  tiktok: GROUPS.TIKTOK,
  steam: GROUPS.STEAM,
  game: GROUPS.GAMES,
  games: GROUPS.GAMES,
  paypal: GROUPS.PAYPAL,
  pp: GROUPS.PAYPAL,
  pt: GROUPS.PT,
  speedtest: GROUPS.SPEEDTEST,
  ads: GROUPS.ADS,
  ad: GROUPS.ADS,
  other: GROUPS.OTHER,
  lowcost: GROUPS.LOW_COST,
  landing: GROUPS.LANDING
}, REGION_GROUP_ALIAS_MAP));

// 对外保留函数式入口，调用点继续按旧接口取值；内部实际直接复用缓存常量。
function createProxyGroupOrderAliasMap() {
  return PROXY_GROUP_ORDER_ALIAS_MAP;
}

// 解析策略组布局参数中的单个组引用：优先精确匹配，其次大小写无关，再尝试脚本别名，最后只接受唯一模糊命中。
function inspectProxyGroupOrderReference(availableNames, marker) {
  // 先把可用组名去重，避免后面大小写查表和模糊匹配出现重复结果。
  const names = uniqueStrings(availableNames);
  // marker 是用户传进来的 group-order token；这里统一先做 trim。
  const token = normalizeStringArg(marker);

  // 空 token 直接视为无效引用。
  if (!token) {
    return { match: "", recognized: false };
  }

  // 先尝试原样精确命中；这是优先级最高、也最不容易误判的一层。
  if (names.includes(token)) {
    return { match: token, recognized: true };
  }

  // 再建一份忽略大小写的查找表，兼容用户手写组名时大小写不一致。
  const lowerLookup = Object.create(null);
  for (const name of names) {
    const key = String(name || "").toLowerCase();
    if (key && !lowerLookup[key]) {
      lowerLookup[key] = name;
    }
  }

  // 第二层：忽略大小写的精确匹配。
  const exactIgnoreCase = lowerLookup[token.toLowerCase()];
  if (exactIgnoreCase) {
    return { match: exactIgnoreCase, recognized: true };
  }

  // 第三层：尝试脚本内置的常用别名，例如 select / manual / direct / games。
  const aliasTarget = createProxyGroupOrderAliasMap()[normalizeGroupMarkerToken(token)];
  if (aliasTarget) {
    return {
      match: names.includes(aliasTarget) ? aliasTarget : "",
      recognized: true
    };
  }

  // 最后一层：只有在模糊命中结果唯一时，才允许自动猜测，避免误把一个 token 打到多个组。
  const fuzzyMatches = names.filter((name) => String(name || "").toLowerCase().indexOf(token.toLowerCase()) !== -1);
  if (fuzzyMatches.length === 1) {
    return { match: fuzzyMatches[0], recognized: true };
  }

  // 既没命中，也没法安全猜到时，交给上层做 unresolved token 告警。
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
  // availableLookup 负责判断某个组名在最终配置里是否真实存在。
  const availableLookup = createLookup(groupNames);
  // scriptLookup 则用来识别“脚本自动生成”的那部分组，便于把用户原配置自带组归到 extras。
  const scriptLookup = createLookup(buildScriptManagedGroupNames(countryGroupNames, regionGroupNames));
  // pickAvailable 用来把候选名单裁成“当前真实存在且按原顺序保留”的组名子集。
  const pickAvailable = (names) => uniqueStrings(names).filter((name) => availableLookup[name]);
  // extraGroupNames 收集原配置里脚本并不直接管理的其他组，供 `extras` bucket 统一接住。
  const extraGroupNames = groupNames.filter((name) => !scriptLookup[name]);

  return {
    // core 是面板最顶层的主控组。
    core: pickAvailable([GROUPS.SELECT, GROUPS.MANUAL, GROUPS.FALLBACK, GROUPS.DIRECT]),
    // services 把高频业务组打包成一桶，方便 preset 用一个 token 拉整段。
    services: pickAvailable([GROUPS.AI, GROUPS.GITHUB, GROUPS.DEV, GROUPS.MICROSOFT, GROUPS.ONEDRIVE, GROUPS.GOOGLE, GROUPS.TELEGRAM, GROUPS.DISCORD, GROUPS.WHATSAPP, GROUPS.LINE, GROUPS.TWITTER, GROUPS.INSTAGRAM, GROUPS.FACEBOOK, GROUPS.REDDIT, GROUPS.STEAM, GROUPS.BING, GROUPS.APPLE, GROUPS.GAMES, GROUPS.PAYPAL, GROUPS.CRYPTO, GROUPS.PT, GROUPS.SPEEDTEST]),
    // media 单独收流媒体服务，避免和普通业务组混在一起。
    media: pickAvailable([GROUPS.YOUTUBE, GROUPS.NETFLIX, GROUPS.DISNEY, GROUPS.SPOTIFY, GROUPS.TIKTOK, GROUPS.STREAMING]),
    // regions / countries 则分别对应地理聚合组和国家组。
    regions: pickAvailable(regionGroupNames),
    countries: pickAvailable(countryGroupNames),
    // helpers 放直连、广告、低倍率、兜底这类辅助组。
    helpers: pickAvailable([GROUPS.ADS, GROUPS.DIRECT, GROUPS.LANDING, GROUPS.LOW_COST, GROUPS.OTHER]),
    // extras 最后兜住用户原配置里保留下来的自定义组。
    extras: pickAvailable(extraGroupNames)
  };
}

// 按 group-order / group-order-preset 计算最终策略组展示顺序；未命中的 token 会单独返回给告警层处理。
function resolveConfiguredProxyGroupOrder(proxyGroups, countryGroupNames, regionGroupNames) {
  // 先浅拷贝一份策略组，避免后续排序直接改写传入数组。
  const groups = Array.isArray(proxyGroups) ? proxyGroups.slice() : [];
  // 抽出所有实际存在的组名；后面无论是 bucket 展开还是 direct match 都基于这份清单。
  const groupNames = collectNamedEntries(groups);
  // 先把“主业务组 / 区域组 / 国家组 / helpers / extras”这些桶都算好，便于 preset 里的 bucket token 直接展开。
  const buckets = buildProxyGroupOrderBuckets(groupNames, countryGroupNames, regionGroupNames);
  // bucketAliasMap 负责把 region / country / services / helpers 这类 token 归一化到固定桶名。
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
  // 显式 group-order 永远优先于 preset；只有没传 group-order 时才回退到预设布局。
  const tokens = ARGS.hasGroupOrder ? ARGS.groupOrder : buildGroupOrderPresetTokens(ARGS.groupOrderPreset);
  // orderedNames 是布局展开后的“最终组名序列”；unresolvedTokens 则给告警层看哪些 token 根本没命中。
  const orderedNames = [];
  const unresolvedTokens = [];

  for (const token of tokens) {
    // 先尝试把 token 当成“具体组名 / 组名别名”来解析。
    const directMatch = inspectProxyGroupOrderReference(groupNames, token);
    if (directMatch.match) {
      orderedNames.push(directMatch.match);
      continue;
    }

    // 如果 token 已被识别成某个已知组，但当前并没有实际命中组名，就直接跳过，不再重复计入 unresolved。
    if (directMatch.recognized) {
      continue;
    }

    // 再尝试把 token 当成 bucket 名，例如 regions / countries / helpers。
    const bucketKey = bucketAliasMap[normalizeGroupMarkerToken(token)];
    if (bucketKey) {
      orderedNames.push(...(Array.isArray(buckets[bucketKey]) ? buckets[bucketKey] : []));
      continue;
    }

    // 走到这里说明 token 既不是实际组，也不是 bucket，留给后面的告警逻辑。
    unresolvedTokens.push(normalizeStringArg(token));
  }

  // 把用户显式命中的顺序放前面，剩余组按原顺序补尾；这样既能重排，也不会意外丢组。
  const finalNames = uniqueStrings(orderedNames.concat(groupNames));
  // 组名 -> 组对象查找表，最后再从名字映射回完整策略组对象。
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

// 顶层缓存 GitHub / Steam / Dev 等独立组“前置组”别名表，避免每次解析 prefer-groups 都临时造对象。
const PREFERRED_GROUP_ALIAS_MAP = Object.freeze(Object.assign({
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
  discord: GROUPS.DISCORD,
  dc: GROUPS.DISCORD,
  telegram: GROUPS.TELEGRAM,
  whatsapp: GROUPS.WHATSAPP,
  wa: GROUPS.WHATSAPP,
  line: GROUPS.LINE,
  twitter: GROUPS.TWITTER,
  tweet: GROUPS.TWITTER,
  instagram: GROUPS.INSTAGRAM,
  ig: GROUPS.INSTAGRAM,
  facebook: GROUPS.FACEBOOK,
  fb: GROUPS.FACEBOOK,
  reddit: GROUPS.REDDIT,
  youtube: GROUPS.YOUTUBE,
  streaming: GROUPS.STREAMING,
  stream: GROUPS.STREAMING,
  vod: GROUPS.STREAMING,
  netflix: GROUPS.NETFLIX,
  disney: GROUPS.DISNEY,
  disneyplus: GROUPS.DISNEY,
  spotify: GROUPS.SPOTIFY,
  tiktok: GROUPS.TIKTOK,
  steam: GROUPS.STEAM,
  game: GROUPS.GAMES,
  games: GROUPS.GAMES,
  paypal: GROUPS.PAYPAL,
  pp: GROUPS.PAYPAL,
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
}, REGION_GROUP_ALIAS_MAP));

// 对外保留旧 helper 名称，确保已有解析逻辑不需要改结构。
function createPreferredGroupAliasMap() {
  return PREFERRED_GROUP_ALIAS_MAP;
}

// 顶层缓存规则入口锚点别名表，避免每次 resolveRuleOrderMarker 都重新创建整份映射。
const RULE_PROVIDER_ALIAS_MAP = Object.freeze({
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
  // dev / developer / development 明确保留给整块开发规则补丁，不再被 GitLab 单项别名覆盖。
  dev: "DevList",
  developer: "DevList",
  development: "DevList",
  devlist: "DevList",
  devextra: "DevList",
  developers: "DevList",
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
  applemusic: "AppleMusic",
  proxymedia: "ProxyMedia",
  google: "Google",
  googleip: "Google_IP",
  discord: "Discord",
  bing: "Bing",
  onedrive: "OneDrive",
  sharepoint: "OneDrive",
  skydrive: "OneDrive",
  "1drv": "OneDrive",
  microsoft: "Microsoft",
  ms: "Microsoft",
  appletv: "AppleTV",
  testflight: "TestFlight",
  apple: "Apple",
  appleip: "Apple_IP",
  telegram: "Telegram",
  telegramip: "Telegram_IP",
  whatsapp: "WhatsApp",
  wa: "WhatsApp",
  line: "Line",
  twitter: "Twitter",
  tweet: "Twitter",
  pinterest: "Pinterest",
  pixiv: "Pixiv",
  fanbox: "Pixiv",
  imgur: "Imgur",
  instagram: "Instagram",
  ig: "Instagram",
  facebook: "Facebook",
  fb: "Facebook",
  reddit: "Reddit",
  threads: "Threads",
  youtubemusic: "YouTubeMusic",
  ytmusic: "YouTubeMusic",
  amazonprimevideo: "AmazonPrimeVideo",
  primevideo: "PrimeVideo",
  hbo: "HBO",
  hboasia: "HBOAsia",
  hbohk: "HBOHK",
  hbousa: "HBOUSA",
  hulu: "Hulu",
  hulujp: "HuluJP",
  huluusa: "HuluUSA",
  paramountplus: "ParamountPlus",
  peacock: "Peacock",
  discoveryplus: "DiscoveryPlus",
  alipay: "AliPay",
  stripe: "Stripe",
  patreon: "Patreon",
  shopify: "Shopify",
  ebay: "eBay",
  amazon: "Amazon",
  amazoncn: "AmazonCN",
  amazontrust: "AmazonTrust",
  soundcloud: "SoundCloud",
  deezer: "Deezer",
  kkbox: "KKBOX",
  pandora: "Pandora",
  linkedin: "LinkedIn",
  teams: "Teams",
  riot: "Riot",
  battle: "Battle",
  battlenet: "Battle",
  blizzard: "Blizzard",
  ea: "EA",
  nintendo: "Nintendo",
  playstation: "PlayStation",
  psn: "PlayStation",
  xbox: "Xbox",
  ubisoft: "Ubisoft",
  twitch: "Twitch",
  tiktok: "TikTok",
  bilibiliintl: "BiliBiliIntl",
  bstar: "BiliBiliIntl",
  all4: "All4",
  channel4: "All4",
  netflix: "Netflix",
  netflixip: "Netflix_IP",
  disney: "Disney",
  disneyplus: "Disney",
  spotify: "Spotify",
  paypal: "PayPal",
  pp: "PayPal",
  steamfix: "SteamFix",
  steam: "Steam",
  steamcn: "SteamCN",
  epic: "Epic",
  pt: "PT",
  speedtest: "Speedtest",
  github: "GitHub",
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
});

// 对外保留旧 helper 名称，调用点继续按函数拿映射；内部改为复用缓存常量。
function createRuleProviderAliasMap() {
  return RULE_PROVIDER_ALIAS_MAP;
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

  // 第二层：大小写无关的精确匹配，兼容 github / GitHub 这类写法。
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

  // 第三层：脚本内置 alias，如 top/start/end/cn/cnip 之类缩写标记。
  const aliasTarget = createRuleProviderAliasMap()[normalizeGroupMarkerToken(token)];
  if (aliasTarget === RULE_ORDER_START || aliasTarget === RULE_ORDER_END) {
    return { match: aliasTarget, reason: "alias" };
  }

  if (aliasTarget && providers.includes(aliasTarget)) {
    return { match: aliasTarget, reason: "alias" };
  }

  // 最后一层只接受“唯一模糊命中”；多个模糊命中会返回 ambiguous，交给上游报错。
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

// 对关键“专用规则必须排在宽泛规则前面”的关系加一层自动护栏，避免用户重排后再次被大类规则抢先命中。
function applyRulePriorityGuardOrder(ruleDefinitions) {
  let definitions = Array.isArray(ruleDefinitions) ? ruleDefinitions.slice() : [];

  for (const item of RULE_PRIORITY_RISK_DEFINITIONS) {
    const blockerProvider = normalizeStringArg(item && item.blockerProvider);
    const blockedProvider = normalizeStringArg(item && item.blockedProvider);
    if (!blockerProvider || !blockedProvider) {
      continue;
    }

    const blockerIndex = definitions.findIndex((definition) => definition && definition.provider === blockerProvider);
    const blockedIndex = definitions.findIndex((definition) => definition && definition.provider === blockedProvider);

    // 只有在“宽泛规则真的排在专用规则前面”时，才把专用规则提到它前面。
    if (blockerIndex === -1 || blockedIndex === -1 || blockerIndex > blockedIndex) {
      continue;
    }

    definitions = moveRuleDefinitionByAnchor(definitions, blockedProvider, blockerProvider, "before");
  }

  return definitions;
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
  // 先把候选节点名去重，避免同名节点重复参与后续匹配统计。
  const names = uniqueStrings(proxyNames);
  // 把用户输入的 marker 做同一套节点名规范化，减少大小写/空格差异的影响。
  const token = normalizeProxyName(marker);

  // 空 token 直接返回 empty，后面的校验层会决定是否提示用户。
  if (!token) {
    return { match: "", reason: "empty" };
  }

  // 为每个节点预先缓存“原名 / 规范化名 / 小写规范化名”，避免后面每轮匹配都重复计算。
  const entries = names.map((name) => ({
    name,
    normalized: normalizeProxyName(name),
    lower: normalizeProxyName(name).toLowerCase()
  }));

  // 第一层：完全按规范化后的名字精确匹配；只接受唯一命中。
  const exactMatches = entries.filter((item) => item.normalized === token);
  if (exactMatches.length === 1) {
    return { match: exactMatches[0].name, reason: "exact" };
  }

  // 第二层：忽略大小写后再做精确匹配，兼容用户手动输入大小写不一致。
  const ignoreCaseMatches = entries.filter((item) => item.lower === token.toLowerCase());
  if (ignoreCaseMatches.length === 1) {
    return { match: ignoreCaseMatches[0].name, reason: "ignore-case" };
  }

  // 忽略大小写后如果出现多个同名候选，就明确标成 ambiguous，避免误点进错节点。
  if (ignoreCaseMatches.length > 1) {
    return { match: "", reason: "ambiguous" };
  }

  // 第三层：只在模糊包含也唯一命中时才接受，尽量兼顾容错和安全。
  const fuzzyMatches = entries.filter((item) => item.lower.indexOf(token.toLowerCase()) !== -1);
  if (fuzzyMatches.length === 1) {
    return { match: fuzzyMatches[0].name, reason: "fuzzy" };
  }

  // 最后统一返回“歧义”或“未找到”，交给上层告警逻辑拼成更易懂的提示。
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
  // 先把 marker 折叠到内置区域定义；没命中区域 token 就直接返回空数组。
  const definition = findRegionGroupDefinitionByToken(marker);
  if (!definition) {
    return [];
  }

  // 区域定义里维护的是 country key，这里先转成查找表，后面按 O(1) 判断每个国家组是否属于该区域。
  const countryKeyLookup = createLookup(uniqueStrings(definition.countryKeys || []));
  // 只从“当前已生成”的国家组里筛选，保证 prefer-countries 的展开结果和当前国家组面板保持一致。
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
  // 先把单个 marker 标准化成字符串 token；空白输入不参与任何展开。
  const token = String(marker || "").trim();
  if (!token) {
    return [];
  }

  // 继承来源信息只在 preset 递归展开时存在；普通直接输入则按当前命中类型补来源。
  const sourceInfo = isObject(inheritedSource) ? inheritedSource : null;
  // 第一优先级：先尝试把 token 当成 preset，便于继续递归展开成区域/国家。
  const presetDefinition = findPreferredCountryPresetDefinitionByToken(token);
  if (presetDefinition) {
    // 用规范化后的 preset key 做访问标记，避免 alias 指向同一 preset 时重复递归。
    const presetKey = normalizeGroupMarkerToken(presetDefinition.key);
    const currentVisited = isObject(visitedPresets) ? visitedPresets : Object.create(null);
    // 如果当前 preset 已经在递归链里出现过，直接返回空结果，阻止循环引用。
    if (currentVisited[presetKey]) {
      return [];
    }

    // 复制一份 visited 集合，把当前 preset 标记进去，再继续向下展开它的 markers。
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

  // 第二优先级：把 token 当作国家/别名/旗帜去找国家定义，再映射回当前已生成的国家组。
  let matchedGroup = null;
  const countryDefinition = findCountryDefinitionByMarker(token);
  if (countryDefinition) {
    matchedGroup = findCountryGroup(countryConfigs, getCountryDefinitionMarkers(countryDefinition));
  }

  // 命中国家组后立刻返回，并把来源类型标成 country 或继承自上层 preset。
  if (matchedGroup) {
    return createPreferredCountryGroupEntries(
      [matchedGroup],
      sourceInfo ? sourceInfo.sourceType : "country",
      sourceInfo ? sourceInfo.sourceKey : countryDefinition.name,
      sourceInfo ? sourceInfo.sourceToken : token
    );
  }

  // 第三优先级：把 token 当作区域/子区域，展开成当前已生成的多个国家组。
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

  // 最后一层兜底：允许用户直接写“已经生成出来的国家组名”，兼容旧参数和自定义命名习惯。
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

// main 入口的配置守卫统一收口到这里，避免“非对象 / 缺 proxies / 空 proxies”这三段早退分支散落在主流程里。
function validateMainConfigInput(config) {
  if (!isObject(config)) {
    console.error("❌ 错误: 配置对象不存在");
    return { ok: false, value: {} };
  }

  if (!Array.isArray(config.proxies)) {
    emitWarning("⚠️ 警告: 配置文件中未找到代理节点数组");
    return { ok: false, value: config };
  }

  if (config.proxies.length === 0) {
    emitWarning("⚠️ 警告: 代理节点数组为空，无法生成完整配置");
    return { ok: false, value: config };
  }

  return { ok: true, value: config };
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
  // 这里保持纯函数语义：没有节点时直接回空数组，由 main 入口统一负责告警。
  if (!Array.isArray(proxies) || proxies.length === 0) {
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
  // 拷贝一份，确保排序不会污染调用方原数组。
  const current = Array.isArray(configs) ? configs.slice() : [];
  // 统一把 count / asc / alpha 这类别名折叠成固定模式。
  const normalizedMode = normalizeGeoGroupSortMode(mode, "definition");

  // definition 代表完全按脚本声明顺序走，不做任何重排。
  if (normalizedMode === "definition") {
    return current;
  }

  return current
    // 先把原始索引带上，便于在同分时稳定回退到原顺序。
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      // count 用于“按节点数排序”，name 用于“按显示名排序”。
      const leftCount = Number(left.item && left.item.count) || 0;
      const rightCount = Number(right.item && right.item.count) || 0;
      const leftName = normalizeGeoGroupSortName(left.item && left.item.name);
      const rightName = normalizeGeoGroupSortName(right.item && right.item.name);

      if (normalizedMode === "count-desc") {
        // 节点数多的排前；同节点数时再按名称和原顺序稳定排序。
        if (rightCount !== leftCount) {
          return rightCount - leftCount;
        }

        const nameDiff = leftName.localeCompare(rightName);
        return nameDiff || (left.index - right.index);
      }

      if (normalizedMode === "count-asc") {
        // 节点数少的排前；适合把冷门小国家/小区域提到前面手动挑选。
        if (leftCount !== rightCount) {
          return leftCount - rightCount;
        }

        const nameDiff = leftName.localeCompare(rightName);
        return nameDiff || (left.index - right.index);
      }

      if (normalizedMode === "name") {
        // 按去掉 emoji 后的显示名正序排；同名时再看节点数和原顺序。
        const nameDiff = leftName.localeCompare(rightName);
        if (nameDiff) {
          return nameDiff;
        }

        return (rightCount - leftCount) || (left.index - right.index);
      }

      if (normalizedMode === "name-desc") {
        // 反向名称排序；同名时依旧优先节点数多的组。
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
  // 只接收本轮实际生成出来的国家组；没生成的国家就算在区域定义里，也不会硬造空区域。
  const availableCountries = Array.isArray(countryConfigs) ? countryConfigs : [];
  // regionKeys 是用户最终开启的区域 key 列表；这里先去重，避免重复生成同名区域组。
  const availableRegionKeys = uniqueStrings(Array.isArray(regionKeys) ? regionKeys : []);
  // 先建国家 key -> 国家组配置的查找表，后面区域聚合时就能 O(1) 拿到国家组对象。
  const countryLookup = Object.create(null);

  for (const country of availableCountries) {
    if (!country || typeof country.key !== "string" || !country.key || typeof country.name !== "string" || !country.name) {
      continue;
    }

    countryLookup[country.key] = country;
  }

  const matchedRegions = availableRegionKeys
    .map((regionKey) => {
      // 先从静态区域定义表里找到这条 key 的声明。
      const definition = REGION_GROUP_DEFINITIONS.find((item) => item.key === regionKey);
      if (!definition) {
        return null;
      }

      // 只保留“当前确实生成了国家组”的国家，避免用户开了区域但机场里一个对应国家都没有时生成空壳组。
      const matchedCountries = uniqueStrings(definition.countryKeys || [])
        .map((countryKey) => countryLookup[countryKey])
        .filter(Boolean);
      // 区域组最终引用的是国家组名，而不是原始节点名。
      const proxies = uniqueStrings(matchedCountries.map((country) => country.name));
      if (!proxies.length) {
        return null;
      }

      return {
        key: definition.key,
        name: definition.name,
        proxies,
        // count 是这片区域累计吸收的节点数，供区域排序和日志摘要使用。
        count: matchedCountries.reduce((total, country) => total + (Number(country.count) || 0), 0),
        // countryCount 则是“本轮实际命中的国家组数量”，便于看某个区域是不是只吸到 1-2 个国家。
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
function sanitizeProxyGroups(groups, options) {
  const currentOptions = isObject(options) ? options : {};
  const warnOnEmptyGroup = currentOptions.warnOnEmptyGroup !== false;
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
        if (warnOnEmptyGroup) {
          emitWarning(`⚠️ 警告: 策略组 ${group.name} 无可用候选，已跳过`);
        }
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
  // 脚本内部生成的空组多半只是“当前场景无需生成”，这里静默跳过，避免和用户显式配置错误混在一起。
  const baseGroups = sanitizeProxyGroups(generatedGroups, { warnOnEmptyGroup: false });
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

  // 最终结果 = 脚本组 + 用户不冲突组，再统一清洗一遍；此阶段保留对用户显式空组的告警。
  return sanitizeProxyGroups(baseGroups.concat(extras), { warnOnEmptyGroup: true });
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

// http/file/inline 这类 provider 在 url / interval / size-limit 上的基础校验完全同构，这里统一收口。
function collectHttpProviderCoreWarnings(name, provider) {
  const warnings = [];
  const current = isObject(provider) ? provider : {};
  const url = normalizeStringArg(current.url);

  if (!url) {
    warnings.push(`${name}: type=http 时必须配置 url`);
  } else if (!looksLikeHttpUrl(url)) {
    warnings.push(`${name}: url=${current.url} 看起来不像合法 http(s) 地址`);
  }

  if (hasOwn(current, "interval")) {
    const interval = Number(current.interval);
    if (!isFinite(interval) || interval < 1) {
      warnings.push(`${name}: interval 必须为大于等于 1 的数字`);
    }
  }

  if (hasOwn(current, "size-limit")) {
    const sizeLimit = Number(current["size-limit"]);
    if (!isFinite(sizeLimit) || sizeLimit < 0) {
      warnings.push(`${name}: size-limit 必须为大于等于 0 的数字`);
    }
  }

  return warnings;
}

// 非 http provider 面对“仅 http 生效”的脚本参数时，提示文案完全一致，这里统一拼装。
function collectNonHttpProviderConfiguredOptionWarnings(name, providerType, skippedOptions) {
  const options = (Array.isArray(skippedOptions) ? skippedOptions : []).filter(Boolean);
  return options.length
    ? [`${name}: type=${providerType || "unknown"} 不是 http，${options.join("、")} 不会生效`]
    : [];
}

// provider header 校验在 rule-provider / proxy-provider 两条链路里一模一样，这里统一复用。
function collectProviderHeaderWarnings(name, headers) {
  const warnings = [];
  const currentHeaders = isObject(headers) ? headers : null;
  if (!currentHeaders) {
    return [`${name}: header 必须为对象`];
  }

  for (const headerName of Object.keys(currentHeaders)) {
    const rawHeaderValues = Array.isArray(currentHeaders[headerName]) ? currentHeaders[headerName] : [currentHeaders[headerName]];
    const headerValues = rawHeaderValues.map((item) => normalizeStringArg(item)).filter(Boolean);

    if (!isValidRequestHeaderName(headerName)) {
      warnings.push(`${name}: header 名称无效: ${headerName}`);
    }

    if (!headerValues.length) {
      warnings.push(`${name}: header.${headerName} 不能为空`);
    }
  }

  return warnings;
}

// rule-provider payload 必须是字符串规则列表；inline provider 还要额外检查 payload/url 的搭配关系。
function collectRuleProviderPayloadWarnings(name, provider, type, hasPayloadConfiguredOption) {
  const warnings = [];
  const current = isObject(provider) ? provider : {};
  const url = normalizeStringArg(current.url);

  if (type === "inline") {
    if (!Array.isArray(current.payload) || !current.payload.length) {
      warnings.push(`${name}: type=inline 时建议提供有效 payload`);
    }
    if (url) {
      warnings.push(`${name}: type=inline 时通常不需要 url`);
    }
  }

  if (hasOwn(current, "payload")) {
    if (!Array.isArray(current.payload)) {
      warnings.push(`${name}: payload 必须为数组`);
    } else if (!current.payload.length) {
      warnings.push(`${name}: payload 不能为空数组`);
    } else {
      for (let index = 0; index < current.payload.length; index += 1) {
        const item = current.payload[index];
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
      warnings.push(`${name}: 按 Mihomo 官方语义，payload 只对 type=inline 生效；当前 type=${current.type || "unknown"} 时通常不会生效`);
    }
  } else if (type === "inline" && hasPayloadConfiguredOption) {
    warnings.push(`${name}: 已配置 rule-provider-payload，但当前 payload 仍未生成`);
  }

  return warnings;
}

// proxy-provider payload 必须是完整节点对象数组；inline provider 仍然建议至少给出一个有效节点。
function collectProxyProviderPayloadWarnings(name, provider, type, hasPayloadConfiguredOption) {
  const warnings = [];
  const current = isObject(provider) ? provider : {};

  if (type === "inline" && (!Array.isArray(current.payload) || !current.payload.length)) {
    warnings.push(`${name}: type=inline 时建议提供有效 payload`);
  }

  if (hasOwn(current, "payload")) {
    if (!Array.isArray(current.payload)) {
      warnings.push(`${name}: payload 必须为数组`);
    } else if (!current.payload.length) {
      warnings.push(`${name}: payload 不能为空数组`);
    } else {
      for (let index = 0; index < current.payload.length; index += 1) {
        const item = current.payload[index];
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

  return warnings;
}

// proxy-provider 的 filter / exclude-filter / exclude-type 三类节点池字段放在一起校验，避免主函数里穿插三段重复 try/catch。
function collectProxyProviderCollectionWarnings(name, provider) {
  const warnings = [];
  const current = isObject(provider) ? provider : {};

  for (const field of ["filter", "exclude-filter"]) {
    if (!hasOwn(current, field)) {
      continue;
    }

    const value = normalizeStringArg(current[field]);
    if (!value) {
      warnings.push(`${name}: ${field} 不能为空字符串`);
      continue;
    }

    try {
      compilePatternRegExp(value);
    } catch (error) {
      warnings.push(`${name}: ${field} 正则无效: ${error.message}`);
    }
  }

  if (hasOwn(current, "exclude-type")) {
    const excludeTypeSource = normalizeStringArg(current["exclude-type"]);
    const excludeTypes = parseTypeList(current["exclude-type"]);
    if (/[()[\]{}*+?^$\\]/.test(excludeTypeSource)) {
      warnings.push(`${name}: exclude-type 不支持正则，请只保留类型名并使用 | 分隔`);
    }
    if (excludeTypeSource && !excludeTypes.length) {
      warnings.push(`${name}: exclude-type 不能为空列表`);
    }
  }

  return warnings;
}

// override 语义复杂，拆成独立 helper 后 validateProxyProviderOptions 就只负责调度。
function collectProxyProviderOverrideWarnings(name, override) {
  const warnings = [];
  if (!isObject(override)) {
    return [`${name}: override 必须为对象`];
  }

  if (hasOwn(override, "additional-prefix") && !normalizeStringArg(override["additional-prefix"])) {
    warnings.push(`${name}: override.additional-prefix 不能为空字符串`);
  }

  if (hasOwn(override, "additional-suffix") && !normalizeStringArg(override["additional-suffix"])) {
    warnings.push(`${name}: override.additional-suffix 不能为空字符串`);
  }

  for (const field of ["udp", "udp-over-tcp", "tfo", "mptcp", "skip-cert-verify"]) {
    if (hasOwn(override, field) && !isBooleanLike(override[field])) {
      warnings.push(`${name}: override.${field} 仅支持布尔值`);
    }
  }

  for (const field of ["down", "up", "dialer-proxy"]) {
    if (hasOwn(override, field) && !normalizeStringArg(override[field])) {
      warnings.push(`${name}: override.${field} 不能为空字符串`);
    }
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

  return warnings;
}

// health-check 的字段校验与测速组十分类似，拆出来后主函数更容易看出“先校验 provider，再校验 health-check 子对象”。
function collectProxyProviderHealthCheckWarnings(name, healthCheck) {
  const warnings = [];
  if (!isObject(healthCheck)) {
    return [`${name}: health-check 必须为对象`];
  }

  if (hasOwn(healthCheck, "url") && !looksLikeHttpUrl(healthCheck.url)) {
    warnings.push(`${name}: health-check.url=${healthCheck.url} 看起来不像合法 http(s) 地址`);
  }

  for (const field of ["interval", "timeout"]) {
    if (!hasOwn(healthCheck, field)) {
      continue;
    }

    const value = Number(healthCheck[field]);
    if (!isFinite(value) || value < 1) {
      warnings.push(`${name}: health-check.${field} 必须为大于等于 1 的数字`);
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

  return warnings;
}

// 校验 rule-provider 的官方 type/behavior/format/path/payload 语义，避免“能生成但不符合 Mihomo 官方要求”。
function validateRuleProviderOptions(providers) {
  const source = isObject(providers) ? providers : {};
  const warnings = [];
  const hasPathConfiguredOption = ARGS.hasRuleProviderPathDir;
  const hasPayloadConfiguredOption = ARGS.hasRuleProviderPayload;
  const hasDownloadConfiguredOptions = hasRuleProviderDownloadConfiguredOptions();
  // 用于在循环结束后判断“虽然配置了 payload 参数，但当前根本没有 inline provider 可以承接”。
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
    const path = normalizeStringArg(provider.path).replace(/\\/g, "/");

    // 先校验 type/behavior/format 这些官方枚举语义。
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
      // http provider 重点检查 url、interval、size-limit 等下载侧字段。
      warnings.push.apply(warnings, collectHttpProviderCoreWarnings(name, provider));
    } else {
      const skippedHttpOnlyOptions = [];

      // 对非 http provider，明确提示哪些脚本参数不会生效。
      if (hasPathConfiguredOption) {
        skippedHttpOnlyOptions.push("rule-provider-path-dir");
      }

      if (hasDownloadConfiguredOptions) {
        skippedHttpOnlyOptions.push("interval/proxy/size-limit/header");
      }

      warnings.push.apply(warnings, collectNonHttpProviderConfiguredOptionWarnings(name, provider.type, skippedHttpOnlyOptions));
    }

    if (type === "file" && !path) {
      warnings.push(`${name}: type=file 时通常需要有效 path 来定位本地 rule-provider 文件`);
    }

    if (type === "inline") {
      inlineProviderCount += 1;
    }

    warnings.push.apply(warnings, collectRuleProviderPayloadWarnings(name, provider, type, hasPayloadConfiguredOption));

    if (format === "mrs" && behavior === "classical") {
      warnings.push(`${name}: 按 Mihomo 官方语义，format=mrs 仅支持 domain/ipcidr，不支持 classical`);
    }

    if (hasOwn(provider, "header")) {
      // header 允许单值或数组值，但最终都要能归一化成非空 header 列表。
      warnings.push.apply(warnings, collectProviderHeaderWarnings(name, provider.header));
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

  // 用户配了大量 proxy-provider 参数，但当前根本没有 provider 时，直接给总提示。
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
    const path = normalizeStringArg(provider.path).replace(/\\/g, "/");

    // 先校验最基础的官方 type/url/path 语义。
    if (!isOfficialProxyProviderType(type)) {
      warnings.push(`${name}: type=${provider.type || "unknown"} 不在 Mihomo 官方 proxy-provider 类型范围内，仅支持 http/file/inline`);
    }

    if (type === "http") {
      warnings.push.apply(warnings, collectHttpProviderCoreWarnings(name, provider));
    } else {
      const skippedHttpOnlyOptions = [];

      // 非 http provider 对下载控制/缓存目录参数不敏感，这里统一提醒。
      if (hasPathConfiguredOption) {
        skippedHttpOnlyOptions.push("proxy-provider-path-dir");
      }

      if (hasDownloadConfiguredOptions) {
        skippedHttpOnlyOptions.push("interval/proxy/size-limit/header");
      }

      warnings.push.apply(warnings, collectNonHttpProviderConfiguredOptionWarnings(name, provider.type, skippedHttpOnlyOptions));
    }

    if (type === "file" && !path) {
      warnings.push(`${name}: type=file 时通常需要有效 path 来定位本地 provider 文件`);
    }

    warnings.push.apply(warnings, collectProxyProviderPayloadWarnings(name, provider, type, hasPayloadConfiguredOption));

    if (hasOwn(provider, "header")) {
      warnings.push.apply(warnings, collectProviderHeaderWarnings(name, provider.header));
    } else if (type === "http" && ARGS.hasProxyProviderHeader) {
      warnings.push(`${name}: 已配置 proxy-provider-header，但当前 header 仍未生成`);
    }

    if (hasOwn(provider, "path")) {
      // path 既要合法，也要避免多个 provider 撞到同一个缓存文件。
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

    warnings.push.apply(warnings, collectProxyProviderCollectionWarnings(name, provider));

    if (hasOwn(provider, "override")) {
      // override 属于代理节点级别的二次改写，字段种类多，独立 helper 负责逐项语义校验。
      warnings.push.apply(warnings, collectProxyProviderOverrideWarnings(name, provider.override));
    }

    if (!hasOwn(provider, "health-check")) {
      continue;
    }

    warnings.push.apply(warnings, collectProxyProviderHealthCheckWarnings(name, provider["health-check"]));
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

  // 先校验枚举型高级项，避免明显超出官方常见取值。
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

  // rule 模式下建议显式以 MATCH,fake-ip 收尾，否则 fake-ip-filter 语义通常不完整。
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

    // 测速组三件套：url、interval、timeout 必须完整且数值合法。
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
      // expected-status 复用统一语法校验，兼容 * / 单码 / 范围表达式。
      const expectedStatus = normalizeExpectedStatusArg(group["expected-status"]);
      if (!expectedStatus) {
        warnings.push(`${name}: expected-status 不能为空字符串`);
      } else if (!isValidExpectedStatusValue(expectedStatus)) {
        warnings.push(`${name}: expected-status 仅支持 *、单个状态码，或 200/302/400-503 这类官方语法`);
      }
    }

    if (type === "load-balance" && hasOwn(group, "strategy")) {
      // 只有 load-balance 组才需要额外检查 strategy。
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
  const groupNames = collectNamedEntries(proxyGroups);
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
  const groupNames = collectNamedEntries(proxyGroups);
  // 收集所有节点名称。
  const proxyNames = collectNamedEntries(proxies);
  // 建立统一查找表。
  const validReferenceLookup = createLookup(buildBuiltinAwareNameList(groupNames, proxyNames));
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
function validateGeneratedArtifacts(proxies, proxyGroups, providers, config, dns, countryConfigs, ruleDefinitions, configuredRules, analysisCache) {
  // 允许主流程把已经算过一次的诊断结果传进来，避免同一轮构建里反复遍历相同数据。
  const precomputedAnalysis = isObject(analysisCache) ? analysisCache : {};
  // 先跑自动分组可用性校验。
  const autoGroupValidation = validateAutoGroups(proxyGroups, proxies);
  // 提前抽出最终可见节点名称，给 GitHub / Steam 点名节点参数校验复用。
  const proxyNames = collectNamedEntries(proxies);
  // 收集最终可用的策略组名称与内置策略，给 GitHub / Steam 前置组参数校验复用。
  const availableGroupNames = buildBuiltinAwareNameList(collectNamedEntries(proxyGroups));
  // 收集当前可用 proxy-provider 名称，给 GitHub / Steam provider 池参数校验复用。
  const availableProxyProviderNames = Object.keys(isObject(config && config["proxy-providers"]) ? config["proxy-providers"] : {});
  const ruleProviderApplyStats = analyzeRuleProviderApplyStats(providers);
  const proxyProviderApplyStats = analyzeProxyProviderApplyStats(config && config["proxy-providers"]);
  const ruleProviderApplyPreview = analyzeRuleProviderApplyPreview(providers);
  const proxyProviderApplyPreview = analyzeProxyProviderApplyPreview(config && config["proxy-providers"]);
  // 区域可见性、规则优先级风险、策略组优先级风险都会同时写进日志/响应头，优先复用主流程预计算结果。
  const regionVisibility = isObject(precomputedAnalysis.regionVisibility)
    ? precomputedAnalysis.regionVisibility
    : analyzeRegionGroupVisibility(proxyGroups, countryConfigs);
  const rulePriorityRiskAnalysis = isObject(precomputedAnalysis.rulePriorityRisks)
    ? precomputedAnalysis.rulePriorityRisks
    : analyzeRulePriorityRisks(ruleDefinitions);
  const proxyGroupPriorityRiskAnalysis = isObject(precomputedAnalysis.proxyGroupPriorityRisks)
    ? precomputedAnalysis.proxyGroupPriorityRisks
    : analyzeProxyGroupPriorityRisks(proxyGroups);
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
    preferredCountryWarnings: collectPreferredCountryWarnings(countryConfigs),
    preferredGroupWarnings: collectPreferredGroupWarnings(availableGroupNames),
    preferredNodeWarnings: collectPreferredNodeWarnings(proxyNames),
    preferredProviderWarnings: collectPreferredProviderWarnings(availableProxyProviderNames),
    regionVisibilityWarnings: regionVisibility.warnings,
    regionVisibilitySummary: regionVisibility.summary,
    regionVisibilityPreview: regionVisibility.previewEntries,
    groupOrderWarnings: validateGroupOrderTokens(proxyGroups, countryConfigs),
    ruleOrderWarnings: uniqueStrings(validateRuleOrderMarkers(ruleDefinitions).concat(
      validateDevRuleOrderMarker(ruleDefinitions)
    )),
    customRuleOrderWarnings: validateCustomRuleOrderMarker(ruleDefinitions, configuredRules),
    ruleTargetWarnings: validateRuleTargetMarkers(availableGroupNames, ruleDefinitions),
    rulePriorityWarnings: rulePriorityRiskAnalysis.warnings,
    proxyGroupPriorityWarnings: proxyGroupPriorityRiskAnalysis.warnings,
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
  return countDiagnosticIssueDefinitions(diagnostics, DIAGNOSTIC_WARNING_BLOCK_DEFINITIONS)
    + countDiagnosticIssueDefinitions(diagnostics, DIAGNOSTIC_SPECIAL_WARNING_DEFINITIONS);
}

// full 日志里的核心数量指标统一走定义表，避免 logBuildSummary 里堆大量近似 console.log。
const BUILD_SUMMARY_PRIMARY_METRIC_DEFINITIONS = Object.freeze([
  { key: "totalProxies", label: "代理节点", unit: "个" },
  { key: "validProxies", label: "有效节点", unit: "个" },
  { key: "lowCostProxies", label: "低倍率节点", unit: "个" },
  { key: "landingProxies", label: "落地节点", unit: "个" },
  { key: "countryGroups", label: "国家分组", unit: "个" },
  { key: "regionGroups", label: "区域分组", unit: "个" },
  { key: "proxyGroups", label: "策略组", unit: "个" },
  { key: "rules", label: "规则数", unit: "条" },
  { key: "classifiedCountryProxies", label: "国家识别节点", unit: "个" },
  { key: "unclassifiedCountryProxies", label: "国家未识别节点", unit: "个" },
  { key: "renamedProxies", label: "自动改名节点", unit: "个" }
]);
// full 日志里的各类告警/提醒计数也统一走定义表，减少新增诊断项时的维护面。
const BUILD_SUMMARY_WARNING_METRIC_DEFINITIONS = Object.freeze([
  { key: "missingProviders", label: "Provider告警" },
  { key: "invalidRuleProviderUrls", label: "Provider链接告警" },
  { key: "ruleProviderWarnings", label: "规则源语义告警" },
  { key: "proxyProviderWarnings", label: "代理集合告警" },
  { key: "deprecatedSettings", label: "弃用项告警" },
  { key: "dnsRiskWarnings", label: "DNS风险告警" },
  { key: "dnsOptionWarnings", label: "DNS选项告警" },
  { key: "latencyGroupWarnings", label: "测速组告警" },
  { key: "providerHealthWarnings", label: "Provider健康提醒" },
  { key: "preferredCountryWarnings", label: "优先链告警" },
  { key: "preferredGroupWarnings", label: "前置组告警" },
  { key: "preferredNodeWarnings", label: "点名节点告警" },
  { key: "preferredProviderWarnings", label: "Provider池告警" },
  { key: "regionVisibilityWarnings", label: "区域可见性提醒" },
  { key: "groupOrderWarnings", label: "策略组布局告警" },
  { key: "ruleOrderWarnings", label: "规则顺序告警" },
  { key: "customRuleOrderWarnings", label: "自定义规则编排告警" },
  { key: "ruleTargetWarnings", label: "规则入口告警" },
  { key: "rulePriorityWarnings", label: "规则优先级风险" },
  { key: "proxyGroupPriorityWarnings", label: "候选链风险" },
  { key: "customRuleWarnings", label: "自定义规则提醒" },
  { key: "serviceRoutingWarnings", label: "业务链路提醒" },
  { key: "targetPlatformWarnings", label: "平台提醒" },
  { key: "runtimeArgWarnings", label: "参数诊断提醒" },
  { key: "runtimeResponseWarnings", label: "响应头提醒" },
  { key: "runtimeLinkWarnings", label: "链路参数提醒" },
  { key: "geoConfigWarnings", label: "GEO风险告警" },
  { key: "kernelOptionWarnings", label: "核心项告警" },
  { key: "duplicateRuleProviderPaths", label: "Provider路径告警" },
  { key: "missingRuleTargets", label: "规则目标告警" },
  { key: "unresolvedGroupReferences", label: "引用异常告警" },
  { key: "unresolvedProviderReferences", label: "Provider引用告警" },
  { key: "invalidGroupPatterns", label: "分组正则告警" },
  { key: "emptyAutoGroups", label: "空自动分组告警" }
]);
// full 日志数量指标也拆成 section 计划：先打核心数量，再打告警数量，避免主流程里写两轮几乎相同的循环。
const BUILD_SUMMARY_METRIC_SECTION_DEFINITIONS = Object.freeze([
  { definitions: BUILD_SUMMARY_PRIMARY_METRIC_DEFINITIONS, defaultUnit: "" },
  { definitions: BUILD_SUMMARY_WARNING_METRIC_DEFINITIONS, defaultUnit: "条" }
]);
// 这批规则/链路摘要会同时写进 full 日志和响应头，统一定义可避免两边字段逐步漂移。
const BUILD_SUMMARY_DIAGNOSTIC_LINE_DEFINITIONS = Object.freeze([
  { label: "策略组顺序", summaryKey: "proxyGroupOrderSummary", headerSuffix: "Proxy-Group-Order" },
  { label: "策略组优先级", summaryKey: "proxyGroupPrioritySummary", headerSuffix: "Proxy-Group-Priority" },
  { label: "流量优先级", summaryKey: "trafficPrioritySummary", headerSuffix: "Traffic-Priority-Summary" },
  { label: "规则层级总览", summaryKey: "ruleLayerSummary", previewKey: "ruleLayerPreview", headerSuffix: "Rule-Layer-Summary", previewHeaderSuffix: "Rule-Layer-Preview" },
  { label: "自定义规则区间", summaryKey: "customRuleSummary", previewKey: "customRulePreview", headerSuffix: "Custom-Rule-Summary", previewHeaderSuffix: "Custom-Rule-Preview" },
  { label: "关键命中窗口", summaryKey: "keyRuleWindowSummary", previewKey: "keyRuleWindowPreview", headerSuffix: "Key-Rule-Window-Summary", previewHeaderSuffix: "Key-Rule-Window-Preview" },
  { label: "规则层级目标映射", summaryKey: "ruleLayerTargetSummary", previewKey: "ruleLayerTargetPreview", headerSuffix: "Rule-Layer-Target-Summary", previewHeaderSuffix: "Rule-Layer-Target-Preview" },
  { label: "业务规则窗口", summaryKey: "serviceRuleWindowSummary", previewKey: "serviceRuleWindowPreview", headerSuffix: "Service-Rule-Window-Summary", previewHeaderSuffix: "Service-Rule-Window-Preview" },
  { label: "规则入口映射", summaryKey: "ruleTargetMappingSummary", previewKey: "ruleTargetMappingPreview", headerSuffix: "Rule-Target-Summary", previewHeaderSuffix: "Rule-Target-Preview" },
  { label: "规则优先级风险", summaryKey: "rulePriorityRiskSummary", previewKey: "rulePriorityRiskPreview", headerSuffix: "Rule-Priority-Risk-Summary", previewHeaderSuffix: "Rule-Priority-Risk-Preview" },
  { label: "策略组候选链风险", summaryKey: "proxyGroupPriorityRiskSummary", previewKey: "proxyGroupPriorityRiskPreview", headerSuffix: "Proxy-Group-Priority-Risk-Summary", previewHeaderSuffix: "Proxy-Group-Priority-Risk-Preview" },
  { label: "业务链路总览", summaryKey: "serviceRoutingSummary", previewKey: "serviceRoutingPreview", headerSuffix: "Service-Routing-Summary", previewHeaderSuffix: "Service-Routing-Preview" },
  { label: "分流链路总览", summaryKey: "routingChainSummary", previewKey: "routingChainPreview", headerSuffix: "Routing-Chain-Summary", previewHeaderSuffix: "Routing-Chain-Preview" }
]);
// full 日志里很多参数行只是 label 不同、entries 结构完全一致，这里统一成构造 helper，便于继续扩展更多参数摘要。
function createBuildSummaryArgLineDefinition(label, entries) {
  return { label, entries };
}

// full 日志里多处服务参数项都遵循 `service + argSuffix -> hasKey/valueKey` 的同一模板，这里统一构造。
function createServiceBuildSummaryArgEntries(services, fields, options) {
  const entries = [];
  const source = Array.isArray(services) ? services : [];
  const fieldDefinitions = Array.isArray(fields) ? fields : [];
  const currentOptions = isObject(options) ? options : {};
  const keyBuilder = typeof currentOptions.keyBuilder === "function"
    ? currentOptions.keyBuilder
    : ((service, field) => `${service.key}-${field.keySuffix}`);

  for (const service of source) {
    for (const field of fieldDefinitions) {
      entries.push({
        key: keyBuilder(service, field),
        hasKey: `has${service.argToken}${field.argSuffix}`,
        valueKey: buildServiceArgKey(service.argToken, field.argSuffix)
      });
    }
  }

  return entries;
}

// 独立组展示参数摘要字段：当前只关心 hidden / icon 这两类面板展示项。
const BUILD_SUMMARY_SERVICE_DISPLAY_FIELD_DEFINITIONS = Object.freeze([
  { keySuffix: "hidden", argSuffix: "Hidden" },
  { keySuffix: "icon", argSuffix: "Icon" }
]);
// 独立组 UDP 参数摘要字段：目前只需要输出 disable-udp。
const BUILD_SUMMARY_SERVICE_UDP_FIELD_DEFINITIONS = Object.freeze([
  { keySuffix: "disable-udp", argSuffix: "DisableUdp" }
]);
// 独立组网络参数摘要字段：统一输出 interface-name / routing-mark 这两类网络绑定配置。
const BUILD_SUMMARY_SERVICE_NETWORK_FIELD_DEFINITIONS = Object.freeze([
  { keySuffix: "interface-name", argSuffix: "InterfaceName" },
  { keySuffix: "routing-mark", argSuffix: "RoutingMark" }
]);

// full 日志中剩余的服务参数摘要也统一收敛，避免每行都手写 `hasX ? X : default`。
const BUILD_SUMMARY_SERVICE_ARG_LINE_DEFINITIONS = Object.freeze([
  createBuildSummaryArgLineDefinition(
    "规则入口目标",
    createServiceBuildSummaryArgEntries(
      SERVICE_RESOURCE_VALIDATION_DEFINITIONS,
      [{ argSuffix: "RuleTarget" }],
      { keyBuilder: (service) => service.key }
    ).concat([{ key: "steam-cn", hasKey: "hasSteamCnRuleTarget", valueKey: "steamCnRuleTarget" }])
  ),
  createBuildSummaryArgLineDefinition(
    "独立组展示",
    createServiceBuildSummaryArgEntries(
      NON_DEV_SERVICE_DEFINITIONS,
      BUILD_SUMMARY_SERVICE_DISPLAY_FIELD_DEFINITIONS
    )
  ),
  createBuildSummaryArgLineDefinition(
    "独立组UDP",
    createServiceBuildSummaryArgEntries(
      NON_DEV_SERVICE_DEFINITIONS,
      BUILD_SUMMARY_SERVICE_UDP_FIELD_DEFINITIONS
    )
  ),
  createBuildSummaryArgLineDefinition("独立组网络", [
    { key: "group-interface-name", hasKey: "hasGroupInterfaceName", valueKey: "groupInterfaceName" },
    { key: "group-routing-mark", hasKey: "hasGroupRoutingMark", valueKey: "groupRoutingMark" },
    ...createServiceBuildSummaryArgEntries(
      NON_DEV_SERVICE_DEFINITIONS,
      BUILD_SUMMARY_SERVICE_NETWORK_FIELD_DEFINITIONS
    )
  ])
]);
// rule-provider 响应头字段定义；统一收敛后，响应头与日志里引用的统计摘要更容易保持一致。
const RULE_PROVIDER_RESPONSE_HEADER_DEFINITIONS = Object.freeze([
  { headerSuffix: "Rule-Provider-Path-Dir", value: () => ARGS.ruleProviderPathDir },
  { headerSuffix: "Rule-Provider-Interval", value: () => ARGS.hasRuleProviderInterval ? ARGS.ruleProviderInterval : RULE_INTERVAL },
  { headerSuffix: "Rule-Provider-Proxy", value: () => ARGS.hasRuleProviderProxy ? ARGS.ruleProviderProxy : "default" },
  { headerSuffix: "Rule-Provider-Size-Limit", value: () => ARGS.hasRuleProviderSizeLimit ? ARGS.ruleProviderSizeLimit : "default" },
  { headerSuffix: "Rule-Provider-UA", value: () => ARGS.hasRuleProviderUserAgent ? ARGS.ruleProviderUserAgent : "default" },
  { headerSuffix: "Rule-Provider-Authorization", value: () => ARGS.hasRuleProviderAuthorization ? "configured" : "default" },
  { headerSuffix: "Rule-Provider-Header", value: () => ARGS.hasRuleProviderHeader ? `configured:${ARGS.ruleProviderHeaderEntryCount}` : "default" },
  { headerSuffix: "Rule-Provider-Payload", value: () => ARGS.hasRuleProviderPayload ? `configured:${ARGS.ruleProviderPayloadCount}` : "default" },
  { headerSuffix: "Rule-Provider-Apply-Scope", value: () => (ARGS.hasRuleProviderPathDir || hasRuleProviderDownloadConfiguredOptions()) ? "all-http" : "default" },
  { headerSuffix: "Rule-Provider-Apply-Scope-Detail", value: () => buildRuleProviderApplyScopeSummary() },
  { headerSuffix: "Rule-Provider-Apply-Stats", value: (diagnostics) => formatRuleProviderApplyStats(diagnostics.ruleProviderApplyStats) },
  { headerSuffix: "Rule-Provider-Apply-Preview", value: (diagnostics) => formatRuleProviderApplyPreview(diagnostics.ruleProviderApplyPreview) },
  { headerSuffix: "Rule-Provider-Mutation-Stats", value: (diagnostics) => formatRuleProviderMutationStats(diagnostics.ruleProviderMutationStats) },
  { headerSuffix: "Rule-Provider-Mutation-Preview", value: (diagnostics) => formatRuleProviderMutationPreview(diagnostics.ruleProviderMutationPreview) },
  { headerSuffix: "Rule-Provider-Payload-Apply-Scope", value: () => ARGS.hasRuleProviderPayload ? "inline-only" : "default" },
  { headerSuffix: "Rule-Provider-Semantic-Check", value: () => "enabled" }
]);
// proxy-provider 响应头字段定义；过滤、Override、health-check 也统一归档，避免 buildRuntimeResponseHeaders 继续拉长。
const PROXY_PROVIDER_RESPONSE_HEADER_DEFINITIONS = Object.freeze([
  { headerSuffix: "Proxy-Provider-Interval", value: () => ARGS.hasProxyProviderInterval ? ARGS.proxyProviderInterval : "default" },
  { headerSuffix: "Proxy-Provider-Proxy", value: () => ARGS.hasProxyProviderProxy ? ARGS.proxyProviderProxy : "default" },
  { headerSuffix: "Proxy-Provider-Size-Limit", value: () => ARGS.hasProxyProviderSizeLimit ? ARGS.proxyProviderSizeLimit : "default" },
  { headerSuffix: "Proxy-Provider-UA", value: () => ARGS.hasProxyProviderUserAgent ? ARGS.proxyProviderUserAgent : "default" },
  { headerSuffix: "Proxy-Provider-Authorization", value: () => ARGS.hasProxyProviderAuthorization ? "configured" : "default" },
  { headerSuffix: "Proxy-Provider-Header", value: () => ARGS.hasProxyProviderHeader ? `configured:${ARGS.proxyProviderHeaderEntryCount}` : "default" },
  { headerSuffix: "Proxy-Provider-Payload", value: () => ARGS.hasProxyProviderPayload ? `configured:${ARGS.proxyProviderPayloadCount}` : "default" },
  { headerSuffix: "Proxy-Provider-Path-Dir", value: () => ARGS.hasProxyProviderPathDir ? ARGS.proxyProviderPathDir : "unchanged" },
  { headerSuffix: "Proxy-Provider-Apply-Scope", value: () => buildProxyProviderApplyScopeSummary() },
  { headerSuffix: "Proxy-Provider-Apply-Stats", value: (diagnostics) => formatProxyProviderApplyStats(diagnostics.proxyProviderApplyStats) },
  { headerSuffix: "Proxy-Provider-Apply-Preview", value: (diagnostics) => formatProxyProviderApplyPreview(diagnostics.proxyProviderApplyPreview) },
  { headerSuffix: "Proxy-Provider-Mutation-Stats", value: (diagnostics) => formatProxyProviderMutationStats(diagnostics.proxyProviderMutationStats) },
  { headerSuffix: "Proxy-Provider-Mutation-Preview", value: (diagnostics) => formatProxyProviderMutationPreview(diagnostics.proxyProviderMutationPreview) },
  { headerSuffix: "Proxy-Provider-Semantic-Check", value: () => "enabled" },
  { headerSuffix: "Proxy-Provider-Filter", value: () => ARGS.hasProxyProviderFilter ? ARGS.proxyProviderFilter : "default" },
  { headerSuffix: "Proxy-Provider-Exclude-Filter", value: () => ARGS.hasProxyProviderExcludeFilter ? ARGS.proxyProviderExcludeFilter : "default" },
  { headerSuffix: "Proxy-Provider-Exclude-Type", value: () => ARGS.hasProxyProviderExcludeType ? ARGS.proxyProviderExcludeType : "default" },
  { headerSuffix: "Proxy-Provider-Override-Prefix", value: () => ARGS.hasProxyProviderOverrideAdditionalPrefix ? ARGS.proxyProviderOverrideAdditionalPrefix : "default" },
  { headerSuffix: "Proxy-Provider-Override-Suffix", value: () => ARGS.hasProxyProviderOverrideAdditionalSuffix ? ARGS.proxyProviderOverrideAdditionalSuffix : "default" },
  { headerSuffix: "Proxy-Provider-Override-UDP", value: () => ARGS.hasProxyProviderOverrideUdp ? ARGS.proxyProviderOverrideUdp : "default" },
  { headerSuffix: "Proxy-Provider-Override-UDP-Over-TCP", value: () => ARGS.hasProxyProviderOverrideUdpOverTcp ? ARGS.proxyProviderOverrideUdpOverTcp : "default" },
  { headerSuffix: "Proxy-Provider-Override-Down", value: () => ARGS.hasProxyProviderOverrideDown ? ARGS.proxyProviderOverrideDown : "default" },
  { headerSuffix: "Proxy-Provider-Override-Up", value: () => ARGS.hasProxyProviderOverrideUp ? ARGS.proxyProviderOverrideUp : "default" },
  { headerSuffix: "Proxy-Provider-Override-TFO", value: () => ARGS.hasProxyProviderOverrideTfo ? ARGS.proxyProviderOverrideTfo : "default" },
  { headerSuffix: "Proxy-Provider-Override-MPTCP", value: () => ARGS.hasProxyProviderOverrideMptcp ? ARGS.proxyProviderOverrideMptcp : "default" },
  { headerSuffix: "Proxy-Provider-Override-Skip-Cert-Verify", value: () => ARGS.hasProxyProviderOverrideSkipCertVerify ? ARGS.proxyProviderOverrideSkipCertVerify : "default" },
  { headerSuffix: "Proxy-Provider-Override-Dialer-Proxy", value: () => ARGS.hasProxyProviderOverrideDialerProxy ? ARGS.proxyProviderOverrideDialerProxy : "default" },
  { headerSuffix: "Proxy-Provider-Override-Interface-Name", value: () => ARGS.hasProxyProviderOverrideInterfaceName ? ARGS.proxyProviderOverrideInterfaceName : "default" },
  { headerSuffix: "Proxy-Provider-Override-Routing-Mark", value: () => ARGS.hasProxyProviderOverrideRoutingMark ? ARGS.proxyProviderOverrideRoutingMark : "default" },
  { headerSuffix: "Proxy-Provider-Override-IP-Version", value: () => ARGS.hasProxyProviderOverrideIpVersion ? ARGS.proxyProviderOverrideIpVersion : "default" },
  { headerSuffix: "Proxy-Provider-Override-Proxy-Name", value: () => ARGS.hasProxyProviderOverrideProxyNameRules ? `configured:${ARGS.proxyProviderOverrideProxyNameRules.length}` : "default" },
  { headerSuffix: "Proxy-Provider-HC-Enable", value: () => ARGS.hasProxyProviderHealthCheckEnable ? ARGS.proxyProviderHealthCheckEnable : "default" },
  { headerSuffix: "Proxy-Provider-HC-Url", value: () => ARGS.hasProxyProviderHealthCheckUrl ? ARGS.proxyProviderHealthCheckUrl : "default" },
  { headerSuffix: "Proxy-Provider-HC-Interval", value: () => ARGS.hasProxyProviderHealthCheckInterval ? ARGS.proxyProviderHealthCheckInterval : "default" },
  { headerSuffix: "Proxy-Provider-HC-Timeout", value: () => ARGS.hasProxyProviderHealthCheckTimeout ? ARGS.proxyProviderHealthCheckTimeout : "default" },
  { headerSuffix: "Proxy-Provider-HC-Lazy", value: () => ARGS.hasProxyProviderHealthCheckLazy ? ARGS.proxyProviderHealthCheckLazy : "default" },
  { headerSuffix: "Proxy-Provider-HC-Expected-Status", value: () => ARGS.hasProxyProviderHealthCheckExpectedStatus ? ARGS.proxyProviderHealthCheckExpectedStatus : "default" }
]);
// full 日志里 provider 与下载链路参数的模板同样很长，继续用定义表压缩，减少后续新增参数时的重复修改点。
const BUILD_SUMMARY_PROVIDER_ARG_LINE_DEFINITIONS = Object.freeze([
  {
    label: "规则源参数",
    entries: [
      { key: "preset", value: () => ARGS.hasRuleSourcePreset ? ARGS.ruleSourcePreset : DEFAULT_RULE_SOURCE_PRESET },
      { key: "steam-fix", value: () => ARGS.hasSteamFix ? ARGS.steamFix : false },
      { key: "steam-fix-url", value: () => ARGS.steamFix ? (ARGS.hasSteamFixUrl ? ARGS.steamFixUrl : STEAM_FIX_LIST_URL) : "disabled" },
      { key: "direct-list-url", value: () => ARGS.hasDirectListUrl ? ARGS.directListUrl : "default" },
      { key: "crypto-list-url", value: () => ARGS.hasCryptoListUrl ? ARGS.cryptoListUrl : "default" },
      { key: "chatgpt-list-url", value: () => ARGS.hasChatGptListUrl ? ARGS.chatGptListUrl : "default" },
      { key: "ai-extra-list-url", value: () => ARGS.hasAiExtraListUrl ? ARGS.aiExtraListUrl : "default" },
      { key: "dev-list-url", value: () => ARGS.hasDevListUrl ? ARGS.devListUrl : "default" },
      { key: "grok-rule-url", value: () => accademiaAdditionalRule("Grok") },
      { key: "apple-ai-rule-url", value: () => accademiaAdditionalRule("AppleAI") },
      { key: "provider-path-dir", value: () => ARGS.ruleProviderPathDir },
      { key: "provider-interval", value: () => ARGS.hasRuleProviderInterval ? ARGS.ruleProviderInterval : RULE_INTERVAL },
      { key: "provider-proxy", value: () => ARGS.hasRuleProviderProxy ? ARGS.ruleProviderProxy : "default" },
      { key: "provider-size-limit", value: () => ARGS.hasRuleProviderSizeLimit ? ARGS.ruleProviderSizeLimit : "default" },
      { key: "provider-ua", value: () => ARGS.hasRuleProviderUserAgent ? ARGS.ruleProviderUserAgent : "default" },
      { key: "provider-auth", value: () => ARGS.hasRuleProviderAuthorization ? "configured" : "default" },
      { key: "provider-headers", value: () => ARGS.hasRuleProviderHeader ? ARGS.ruleProviderHeaderEntryCount : "default" },
      { key: "provider-payload", value: () => ARGS.hasRuleProviderPayload ? ARGS.ruleProviderPayloadCount : "default" },
      { key: "scope", value: () => (ARGS.hasRuleProviderPathDir || hasRuleProviderDownloadConfiguredOptions()) ? "all-http" : "generated/default" },
      { key: "payload-scope", value: () => ARGS.hasRuleProviderPayload ? "inline-only" : "default" },
      { key: "apply-scope", value: () => buildRuleProviderApplyScopeSummary() },
      // value 回调会由 getBuildSummaryArgEntryValue(stats) 注入 stats；这里必须显式接参，不能闭包引用不存在的局部变量。
      { key: "apply-stats", value: (stats) => stats.ruleProviderApplyStatsSummary },
      { key: "apply-preview", value: (stats) => stats.ruleProviderApplyPreviewSummary },
      { key: "mutation-stats", value: (stats) => stats.ruleProviderMutationStatsSummary },
      { key: "mutation-preview", value: (stats) => stats.ruleProviderMutationPreviewSummary }
    ]
  },
  {
    label: "代理集合参数",
    entries: [
      { key: "interval", value: () => ARGS.hasProxyProviderInterval ? ARGS.proxyProviderInterval : "default" },
      { key: "proxy", value: () => ARGS.hasProxyProviderProxy ? ARGS.proxyProviderProxy : "default" },
      { key: "size-limit", value: () => ARGS.hasProxyProviderSizeLimit ? ARGS.proxyProviderSizeLimit : "default" },
      { key: "ua", value: () => ARGS.hasProxyProviderUserAgent ? ARGS.proxyProviderUserAgent : "default" },
      { key: "auth", value: () => ARGS.hasProxyProviderAuthorization ? "configured" : "default" },
      { key: "headers", value: () => ARGS.hasProxyProviderHeader ? ARGS.proxyProviderHeaderEntryCount : "default" },
      { key: "payload", value: () => ARGS.hasProxyProviderPayload ? ARGS.proxyProviderPayloadCount : "default" },
      { key: "path-dir", value: () => ARGS.hasProxyProviderPathDir ? ARGS.proxyProviderPathDir : "unchanged" },
      { key: "filter", value: () => ARGS.hasProxyProviderFilter ? ARGS.proxyProviderFilter : "default" },
      { key: "exclude-filter", value: () => ARGS.hasProxyProviderExcludeFilter ? ARGS.proxyProviderExcludeFilter : "default" },
      { key: "exclude-type", value: () => ARGS.hasProxyProviderExcludeType ? ARGS.proxyProviderExcludeType : "default" },
      { key: "hc-enable", value: () => ARGS.hasProxyProviderHealthCheckEnable ? ARGS.proxyProviderHealthCheckEnable : "default" },
      { key: "hc-url", value: () => ARGS.hasProxyProviderHealthCheckUrl ? ARGS.proxyProviderHealthCheckUrl : "default" },
      { key: "hc-interval", value: () => ARGS.hasProxyProviderHealthCheckInterval ? ARGS.proxyProviderHealthCheckInterval : "default" },
      { key: "hc-timeout", value: () => ARGS.hasProxyProviderHealthCheckTimeout ? ARGS.proxyProviderHealthCheckTimeout : "default" },
      { key: "hc-lazy", value: () => ARGS.hasProxyProviderHealthCheckLazy ? ARGS.proxyProviderHealthCheckLazy : "default" },
      { key: "hc-expected-status", value: () => ARGS.hasProxyProviderHealthCheckExpectedStatus ? ARGS.proxyProviderHealthCheckExpectedStatus : "default" },
      { key: "apply-scope", value: () => buildProxyProviderApplyScopeSummary() },
      // 这里同样直接消费 full-summary 统计对象，避免 full 模式下引用未定义的 stats 局部变量。
      { key: "apply-stats", value: (stats) => stats.proxyProviderApplyStatsSummary },
      { key: "apply-preview", value: (stats) => stats.proxyProviderApplyPreviewSummary },
      { key: "mutation-stats", value: (stats) => stats.proxyProviderMutationStatsSummary },
      { key: "mutation-preview", value: (stats) => stats.proxyProviderMutationPreviewSummary }
    ]
  },
  {
    label: "代理集合Override",
    entries: [
      { key: "prefix", value: () => ARGS.hasProxyProviderOverrideAdditionalPrefix ? ARGS.proxyProviderOverrideAdditionalPrefix : "default" },
      { key: "suffix", value: () => ARGS.hasProxyProviderOverrideAdditionalSuffix ? ARGS.proxyProviderOverrideAdditionalSuffix : "default" },
      { key: "udp", value: () => ARGS.hasProxyProviderOverrideUdp ? ARGS.proxyProviderOverrideUdp : "default" },
      { key: "udp-over-tcp", value: () => ARGS.hasProxyProviderOverrideUdpOverTcp ? ARGS.proxyProviderOverrideUdpOverTcp : "default" },
      { key: "down", value: () => ARGS.hasProxyProviderOverrideDown ? ARGS.proxyProviderOverrideDown : "default" },
      { key: "up", value: () => ARGS.hasProxyProviderOverrideUp ? ARGS.proxyProviderOverrideUp : "default" },
      { key: "tfo", value: () => ARGS.hasProxyProviderOverrideTfo ? ARGS.proxyProviderOverrideTfo : "default" },
      { key: "mptcp", value: () => ARGS.hasProxyProviderOverrideMptcp ? ARGS.proxyProviderOverrideMptcp : "default" },
      { key: "skip-cert-verify", value: () => ARGS.hasProxyProviderOverrideSkipCertVerify ? ARGS.proxyProviderOverrideSkipCertVerify : "default" },
      { key: "dialer-proxy", value: () => ARGS.hasProxyProviderOverrideDialerProxy ? ARGS.proxyProviderOverrideDialerProxy : "default" },
      { key: "interface-name", value: () => ARGS.hasProxyProviderOverrideInterfaceName ? ARGS.proxyProviderOverrideInterfaceName : "default" },
      { key: "routing-mark", value: () => ARGS.hasProxyProviderOverrideRoutingMark ? ARGS.proxyProviderOverrideRoutingMark : "default" },
      { key: "ip-version", value: () => ARGS.hasProxyProviderOverrideIpVersion ? ARGS.proxyProviderOverrideIpVersion : "default" },
      { key: "proxy-name-rules", value: () => ARGS.hasProxyProviderOverrideProxyNameRules ? ARGS.proxyProviderOverrideProxyNameRules.length : "default" }
    ]
  },
  {
    label: "下载链路",
    entries: [
      { key: "route-kind", value: () => RUNTIME_CONTEXT.routeKind || "unknown" },
      { key: "route-name", value: () => RUNTIME_CONTEXT.routeName || "unknown" },
      { key: "no-cache", value: () => RUNTIME_LINK_OPTIONS.hasNoCache ? RUNTIME_LINK_OPTIONS.noCache : "default" },
      { key: "include-unsupported", value: () => RUNTIME_LINK_OPTIONS.hasIncludeUnsupportedProxy ? RUNTIME_LINK_OPTIONS.includeUnsupportedProxy : "default" },
      { key: "ignore-failed", value: () => RUNTIME_LINK_OPTIONS.hasIgnoreFailedRemoteSub ? RUNTIME_LINK_OPTIONS.ignoreFailedRemoteSub : "default" },
      { key: "merge-sources", value: () => RUNTIME_LINK_OPTIONS.hasMergeSources ? RUNTIME_LINK_OPTIONS.mergeSources : "default" },
      { key: "produce-type", value: () => RUNTIME_LINK_OPTIONS.hasProduceType ? RUNTIME_LINK_OPTIONS.produceType : "default" },
      { key: "url", value: () => RUNTIME_LINK_OPTIONS.hasUrl ? "yes" : "no" },
      { key: "url-kind", value: () => RUNTIME_LINK_OPTIONS.urlKind || "none" },
      { key: "content", value: () => RUNTIME_LINK_OPTIONS.hasContent ? "yes" : "no" },
      { key: "ua", value: () => RUNTIME_LINK_OPTIONS.hasUa ? "yes" : "no" },
      { key: "proxy", value: () => RUNTIME_LINK_OPTIONS.hasProxy ? "yes" : "no" }
    ]
  }
]);
// full 日志里的全局参数/测速/Sniffer/DNS 池这几类都属于 `key=value` 串，统一定义后新增参数时更集中。
const BUILD_SUMMARY_CORE_ARG_LINE_DEFINITIONS = Object.freeze([
  {
    label: "参数",
    entries: [
      { key: "ipv6", value: () => ARGS.ipv6 },
      { key: "landing", value: () => ARGS.landing },
      { key: "hidden", value: () => ARGS.hidden },
      { key: "load-balance", value: () => ARGS.lb },
      { key: "fakeip", value: () => ARGS.fakeip },
      { key: "quic", value: () => ARGS.quic },
      { key: "unified-delay", value: () => ARGS.hasUnifiedDelay ? ARGS.unifiedDelay : "config" },
      { key: "tcp-concurrent", value: () => ARGS.hasTcpConcurrent ? ARGS.tcpConcurrent : "config" },
      { key: "dns-respect-rules", value: () => ARGS.hasDnsRespectRules ? ARGS.dnsRespectRules : "config" },
      { key: "dns-prefer-h3", value: () => ARGS.hasDnsPreferH3 ? ARGS.dnsPreferH3 : "config" },
      { key: "profile-cache", value: () => ARGS.hasProfileCache ? ARGS.profileCache : "auto" },
      { key: "geo-auto-update", value: () => ARGS.hasGeoAutoUpdate ? ARGS.geoAutoUpdate : "config" },
      { key: "geo-update-interval", value: () => ARGS.hasGeoUpdateInterval ? ARGS.geoUpdateInterval : "config" },
      { key: "threshold", value: () => ARGS.threshold }
    ]
  },
  {
    label: "测速参数",
    entries: [
      { key: "test-url", value: () => ARGS.hasTestUrl ? ARGS.testUrl : "default" },
      { key: "group-interval", value: () => ARGS.hasGroupInterval ? ARGS.groupInterval : "default" },
      { key: "group-tolerance", value: () => ARGS.hasGroupTolerance ? ARGS.groupTolerance : "default" },
      { key: "group-timeout", value: () => ARGS.hasGroupTimeout ? ARGS.groupTimeout : "default" },
      { key: "group-max-failed-times", value: () => ARGS.hasGroupMaxFailedTimes ? ARGS.groupMaxFailedTimes : "default" },
      { key: "group-expected-status", value: () => ARGS.hasGroupExpectedStatus ? ARGS.groupExpectedStatus : "default" },
      { key: "group-lazy", value: () => ARGS.hasGroupLazy ? ARGS.groupLazy : "default" },
      { key: "group-strategy", value: () => ARGS.hasGroupStrategy ? ARGS.groupStrategy : "default" }
    ]
  },
  {
    label: "Sniffer参数",
    entries: [
      { key: "force-dns-mapping", value: () => ARGS.hasSnifferForceDnsMapping ? ARGS.snifferForceDnsMapping : "default" },
      { key: "parse-pure-ip", value: () => ARGS.hasSnifferParsePureIp ? ARGS.snifferParsePureIp : "default" },
      { key: "override-destination", value: () => ARGS.hasSnifferOverrideDestination ? ARGS.snifferOverrideDestination : "default" },
      { key: "http-override-destination", value: () => ARGS.hasSnifferHttpOverrideDestination ? ARGS.snifferHttpOverrideDestination : "default" }
    ]
  },
  {
    label: "Sniffer域名",
    entries: [
      { key: "force-domain+", value: () => ARGS.hasSnifferForceDomains ? ARGS.snifferForceDomains.join(" | ") : "default" },
      { key: "skip-domain+", value: () => ARGS.hasSnifferSkipDomains ? ARGS.snifferSkipDomains.join(" | ") : "default" }
    ]
  },
  {
    label: "DNS池参数",
    entries: [
      { key: "listen", value: () => ARGS.hasDnsListen ? ARGS.dnsListen : "config/default" },
      { key: "fake-ip-range", value: () => ARGS.hasFakeIpRange ? ARGS.fakeIpRange : "config/default" },
      { key: "fake-ip-range6", value: () => ARGS.hasFakeIpRange6 ? ARGS.fakeIpRange6 : (ARGS.ipv6 ? "auto/default" : "off") }
    ]
  },
  {
    label: "开发服务组",
    entries: [
      { key: "mode", value: () => getServiceArgLogValue("Dev", "Mode") },
      { key: "type", value: () => getServiceArgLogValue("Dev", "Type") },
      { key: "prefer-groups", value: () => getServiceArgLogValue("Dev", "PreferGroups") },
      { key: "prefer-nodes", value: () => getServiceArgLogValue("Dev", "PreferNodes") }
    ]
  }
]);
// full 日志里一部分摘要只有在存在内容时才输出，统一定义后可以避免 `if (...) console.log(...)` 连着堆很多段。
const BUILD_SUMMARY_OPTIONAL_VALUE_LINE_DEFINITIONS = Object.freeze([
  {
    label: "国家统计",
    shouldLog: (stats) => !!stats.countrySummary,
    value: (stats) => stats.countrySummary
  },
  {
    label: "区域统计",
    shouldLog: (stats) => !!stats.regionGroupSummary,
    value: (stats) => stats.regionGroupSummary
  },
  {
    label: "国家优先链来源",
    shouldLog: (stats) => hasServicePreferredCountrySummary(stats, "TraceSummary"),
    value: (stats) => formatServicePreferredCountrySummaryLine(stats, "TraceSummary")
  },
  {
    label: "国家优先链解析",
    shouldLog: (stats) => hasServicePreferredCountrySummary(stats, "ExplainSummary"),
    value: (stats) => formatServicePreferredCountrySummaryLine(stats, "ExplainSummary")
  },
  {
    label: "国家优先链未命中",
    shouldLog: (stats) => hasServicePreferredCountrySummary(stats, "UnmatchedSummary"),
    value: (stats) => formatServicePreferredCountrySummaryLine(stats, "UnmatchedSummary")
  }
]);
// 这类 definitions 只是在同一批 summary/preview 键上派生不同 entry shape，这里统一抽成 helper，减少多处 flatMap 模板。
function mapSummaryPreviewDefinitionEntries(definitions, builder) {
  const source = Array.isArray(definitions) ? definitions : [];
  const buildCurrent = typeof builder === "function" ? builder : (() => []);

  return source.flatMap((definition) => {
    const summaryKey = normalizeStringArg(definition && definition.summaryKey);
    const previewKey = normalizeStringArg(definition && definition.previewKey);
    return []
      .concat(summaryKey ? buildCurrent(summaryKey, "summary", definition) : [])
      .concat(previewKey ? buildCurrent(previewKey, "preview", definition) : []);
  });
}

// diagnostics supplement 里这些字段都是主流程派生摘要，统一定义后便于新增观测项时同时维护默认值策略。
const BUILD_DIAGNOSTICS_SUPPLEMENT_FIELD_DEFINITIONS = Object.freeze([]
  .concat([
    { key: "renamedProxies", type: "array" },
    { key: "ruleProviderMutationStats", type: "raw" },
    { key: "proxyProviderMutationStats", type: "raw" },
    { key: "ruleProviderMutationPreview", type: "raw" },
    { key: "proxyProviderMutationPreview", type: "raw" },
    { key: "classifiedCountryProxies", type: "number" },
    { key: "unclassifiedCountryProxies", type: "number" },
    { key: "unclassifiedCountryExamples", type: "array" },
    { key: "countrySummary", type: "string" },
    { key: "serviceRoutingWarnings", type: "array" },
    { key: "regionGroupSummary", type: "string" },
    { key: "customRuleWarnings", type: "array" }
  ])
  .concat(mapSummaryPreviewDefinitionEntries(
    BUILD_SUMMARY_DIAGNOSTIC_LINE_DEFINITIONS,
    (key) => [{ key, type: "string" }]
  ))
);
// main 里传给 diagnostics supplement 的上游上下文也用定义表统一描述，避免再维护一大段对象字面量。
const BUILD_DIAGNOSTICS_SUPPLEMENT_PAYLOAD_DEFINITIONS = Object.freeze([
  { key: "renamedProxies", value: (context) => context.normalizedProxyState.renamed },
  { key: "ruleProviderMutationStats", value: (context) => context.ruleProviderMutationStats },
  { key: "proxyProviderMutationStats", value: (context) => context.proxyProviderMutationStats },
  { key: "ruleProviderMutationPreview", value: (context) => context.ruleProviderMutationPreview },
  { key: "proxyProviderMutationPreview", value: (context) => context.proxyProviderMutationPreview },
  { key: "classifiedCountryProxies", value: (context) => context.countryCoverage.classified },
  { key: "unclassifiedCountryProxies", value: (context) => context.countryCoverage.unclassified },
  { key: "unclassifiedCountryExamples", value: (context) => context.countryCoverage.unclassifiedExamples },
  { key: "countrySummary", value: (context) => context.countrySummary },
  { key: "serviceRoutingWarnings", value: (context) => context.serviceRoutingProfiles.warnings },
  { key: "regionGroupSummary", value: (context) => context.regionGroupSummary },
  { key: "customRuleWarnings", value: (context) => context.customRuleWindow.warnings }
].concat(mapSummaryPreviewDefinitionEntries(
  BUILD_SUMMARY_DIAGNOSTIC_LINE_DEFINITIONS,
  (key) => [{ key, value: (context) => context[key] }]
)));
// main 里很多分析结果都会再派生出 summary/preview，统一定义后可避免平行的 format 调用散落一大片。
const MAIN_ANALYSIS_SUMMARY_PREVIEW_DEFINITIONS = Object.freeze([
  { sourceKey: "routingChain", summaryKey: "routingChainSummary", previewKey: "routingChainPreview", summaryFormatter: formatRoutingChainSummary, previewFormatter: formatRoutingChainPreview },
  { sourceKey: "serviceRoutingProfiles", summaryKey: "serviceRoutingSummary", previewKey: "serviceRoutingPreview", summaryFormatter: formatServiceRoutingProfilesSummary, previewFormatter: formatServiceRoutingProfilesPreview },
  { sourceKey: "proxyGroupPriorityRisks", summaryKey: "proxyGroupPriorityRiskSummary", previewKey: "proxyGroupPriorityRiskPreview", summaryFormatter: formatProxyGroupPriorityRiskSummary, previewFormatter: formatProxyGroupPriorityRiskPreview },
  { sourceKey: "rulePriorityRisks", summaryKey: "rulePriorityRiskSummary", previewKey: "rulePriorityRiskPreview", summaryFormatter: formatRulePriorityRiskSummary, previewFormatter: formatRulePriorityRiskPreview },
  { sourceKey: "ruleTargetMapping", summaryKey: "ruleTargetMappingSummary", previewKey: "ruleTargetMappingPreview", summaryFormatter: formatRuleTargetMappingSummary, previewFormatter: formatRuleTargetMappingPreview },
  { sourceKey: "ruleLayering", summaryKey: "ruleLayerSummary", previewKey: "ruleLayerPreview", summaryFormatter: formatRuleLayeringSummary, previewFormatter: formatRuleLayeringPreview },
  { sourceKey: "customRuleWindow", summaryKey: "customRuleSummary", previewKey: "customRulePreview", summaryFormatter: formatCustomRuleWindowSummary, previewFormatter: formatCustomRuleWindowPreview },
  { sourceKey: "keyRuleWindows", summaryKey: "keyRuleWindowSummary", previewKey: "keyRuleWindowPreview", summaryFormatter: formatKeyRuleWindowSummary, previewFormatter: formatKeyRuleWindowPreview },
  { sourceKey: "ruleLayerTargetMapping", summaryKey: "ruleLayerTargetSummary", previewKey: "ruleLayerTargetPreview", summaryFormatter: formatRuleLayerTargetMappingSummary, previewFormatter: formatRuleLayerTargetMappingPreview },
  { sourceKey: "serviceRuleWindows", summaryKey: "serviceRuleWindowSummary", previewKey: "serviceRuleWindowPreview", summaryFormatter: formatServiceRuleWindowSummary, previewFormatter: formatServiceRuleWindowPreview }
]);
// 还有几项只产出单个 summary 值，也放进同一套装配体系，便于 diagnostics/full-summary 共用。
const MAIN_ANALYSIS_SINGLE_VALUE_DEFINITIONS = Object.freeze([
  { key: "proxyGroupOrderSummary", value: (context) => buildProxyGroupOrderSummary(context.proxyGroups) },
  { key: "proxyGroupPrioritySummary", value: (context) => buildProxyGroupPrioritySummary(context.proxyGroups) },
  { key: "trafficPrioritySummary", value: (context) => buildTrafficPrioritySummary(context.rules, context.generatedRules, context.configuredRules, context.ruleAnalysis) }
]);
// 分析阶段主产物本身也统一定义，避免 buildMainAnalysisArtifacts 再平铺十来段 analyzeX 调用。
const MAIN_ANALYSIS_ARTIFACT_DEFINITIONS = Object.freeze([
  { key: "routingChain", value: (context) => analyzeRoutingChain(RUNTIME_CONTEXT, RUNTIME_QUERY_ARGS, context.rules, context.finalRuleDefinitions, context.proxyGroups) },
  { key: "serviceRoutingProfiles", value: (context) => analyzeServiceRoutingProfiles(context.finalRuleDefinitions, context.proxyGroups, context.countryConfigs, context.preferredCountryStates) },
  { key: "regionVisibility", value: (context) => analyzeRegionGroupVisibility(context.proxyGroups, context.countryConfigs) },
  { key: "proxyGroupPriorityRisks", value: (context) => analyzeProxyGroupPriorityRisks(context.proxyGroups) },
  { key: "rulePriorityRisks", value: (context) => analyzeRulePriorityRisks(context.finalRuleDefinitions) },
  { key: "ruleTargetMapping", value: (context) => analyzeRuleTargetMapping(context.finalRuleDefinitions, context.rules, context.ruleAnalysis) },
  { key: "ruleLayering", value: (context) => analyzeRuleLayering(context.rules, context.ruleAnalysis) },
  { key: "customRuleWindow", value: (context) => analyzeCustomRuleWindow(context.generatedRules, context.configuredRules, context.rules, context.ruleAnalysis) },
  { key: "keyRuleWindows", value: (context) => analyzeKeyRuleWindows(context.rules, context.ruleAnalysis) },
  { key: "ruleLayerTargetMapping", value: (context) => analyzeRuleLayerTargetMapping(context.rules, context.ruleAnalysis) },
  { key: "serviceRuleWindows", value: (context) => analyzeServiceRuleWindows(context.rules, context.ruleAnalysis) }
]);
// full 日志统计对象里这批基础字段来自主流程上下文，统一定义后可避免 main 中重复手写长对象。
const BUILD_FULL_SUMMARY_PAYLOAD_DEFINITIONS = Object.freeze([
  { key: "totalProxies", value: (context) => context.proxyStats.total },
  { key: "validProxies", value: (context) => context.proxyStats.valid },
  { key: "lowCostProxies", value: (context) => context.proxyStats.lowCost },
  { key: "landingProxies", value: (context) => context.proxyStats.landing },
  { key: "countryGroups", value: (context) => context.countryConfigs.length },
  { key: "countrySummary", value: (context) => context.countrySummary },
  { key: "regionGroups", value: (context) => context.regionConfigs.length },
  { key: "regionGroupSummary", value: (context) => context.regionGroupSummary },
  { key: "regionVisibilitySummary", value: (context) => context.diagnostics.regionVisibilitySummary },
  { key: "regionVisibilityPreview", value: (context) => formatProviderPreviewNames(context.diagnostics.regionVisibilityPreview, 6, 18) },
  { key: "proxyGroups", value: (context) => context.proxyGroups.length },
  { key: "rules", value: (context) => context.rules.length },
  { key: "classifiedCountryProxies", value: (context) => context.countryCoverage.classified },
  { key: "unclassifiedCountryProxies", value: (context) => context.countryCoverage.unclassified },
  { key: "responseHeadersApplied", value: (context) => context.responseHeadersApplied }
].concat(mapSummaryPreviewDefinitionEntries(
  BUILD_SUMMARY_DIAGNOSTIC_LINE_DEFINITIONS,
  (key) => [{ key, value: (context) => context[key] }]
)));
// full 日志 diagnostics 指标里这一批额外统计都来自 diagnostics 对象，单独定义后减少 buildFullSummaryDiagnosticMetrics 内平铺模板。
const FULL_SUMMARY_DIAGNOSTIC_EXTRA_METRIC_DEFINITIONS = Object.freeze([
  { key: "renamedProxies", value: (context) => Array.isArray(context.renamedProxies) ? context.renamedProxies.length : 0 },
  { key: "ruleProviderApplyStatsSummary", value: (context) => formatRuleProviderApplyStats(context.ruleProviderApplyStats) },
  { key: "ruleProviderApplyPreviewSummary", value: (context) => formatRuleProviderApplyPreview(context.ruleProviderApplyPreview) },
  { key: "proxyProviderApplyStatsSummary", value: (context) => formatProxyProviderApplyStats(context.proxyProviderApplyStats) },
  { key: "proxyProviderApplyPreviewSummary", value: (context) => formatProxyProviderApplyPreview(context.proxyProviderApplyPreview) },
  { key: "ruleProviderMutationStatsSummary", value: (context) => formatRuleProviderMutationStats(context.ruleProviderMutationStats) },
  { key: "ruleProviderMutationPreviewSummary", value: (context) => formatRuleProviderMutationPreview(context.ruleProviderMutationPreview) },
  { key: "proxyProviderMutationStatsSummary", value: (context) => formatProxyProviderMutationStats(context.proxyProviderMutationStats) },
  { key: "proxyProviderMutationPreviewSummary", value: (context) => formatProxyProviderMutationPreview(context.proxyProviderMutationPreview) }
]);
// lookup section 只是 lookup/logger/labels 组合不同，这里抽成轻量 helper，避免定义表继续平铺同构对象。
function createBuildSummaryLookupSectionDefinition(lookupKey, loggerKey, labels) {
  return { lookupKey, loggerKey, labels };
}

// full 日志里按 label 批量输出的区块也整理成计划表，避免 logBuildSummary 主体继续出现多段近似调用。
const BUILD_SUMMARY_LOG_LOOKUP_SECTION_DEFINITIONS = Object.freeze([
  createBuildSummaryLookupSectionDefinition("value", "value", ["分组排序"]),
  createBuildSummaryLookupSectionDefinition("providerArg", "arg", ["规则源参数"]),
  createBuildSummaryLookupSectionDefinition("value", "value", ["规则源语义"]),
  createBuildSummaryLookupSectionDefinition("providerArg", "arg", ["代理集合参数"]),
  createBuildSummaryLookupSectionDefinition("value", "value", ["代理集合语义"]),
  createBuildSummaryLookupSectionDefinition("providerArg", "arg", ["代理集合Override"]),
  createBuildSummaryLookupSectionDefinition("value", "value", ["国家优先链", "国家优先链命中", "国家附加别名", "区域分组参数", "区域可见性", "分组排序参数"]),
  createBuildSummaryLookupSectionDefinition("coreArg", "arg", ["开发服务组"]),
  createBuildSummaryLookupSectionDefinition("value", "value", ["开发服务组高级项", "独立组前置组", "独立组点名节点", "独立组Provider池", "策略组编排", "规则顺序编排", "自定义规则编排"]),
  createBuildSummaryLookupSectionDefinition("value", "value", ["独立组测速", "独立组节点池", "响应头参数"]),
  createBuildSummaryLookupSectionDefinition("providerArg", "arg", ["下载链路"]),
  createBuildSummaryLookupSectionDefinition("value", "value", ["下载链路语义", "参数来源", "参数生效来源", "未消费参数", "运行环境"])
]);
// 下载响应头前半段主要由运行时上下文和链接参数组成，统一定义后更容易继续扩展新观测项。
const RUNTIME_CONTEXT_RESPONSE_HEADER_DEFINITIONS = Object.freeze([
  { headerSuffix: "Script-Version", value: () => SCRIPT_VERSION },
  { headerSuffix: "Target", value: () => RUNTIME_CONTEXT.target || "unknown" },
  { headerSuffix: "Route-Kind", value: () => RUNTIME_CONTEXT.routeKind || "unknown" },
  { headerSuffix: "Route-Name", value: () => RUNTIME_CONTEXT.routeName || "unknown" },
  { headerSuffix: "Route-Target", value: () => RUNTIME_CONTEXT.routeTarget || "none" },
  { headerSuffix: "Query-Target", value: () => RUNTIME_CONTEXT.queryTarget || "none" },
  { headerSuffix: "Request-Params-Target", value: () => RUNTIME_CONTEXT.requestParamsTarget || "none" },
  { headerSuffix: "Arg-Source-Summary", value: () => formatRuntimeArgSourceSummary(RUNTIME_ARG_SOURCES) },
  { headerSuffix: "Arg-Effective-Summary", value: () => formatRuntimeArgEffectiveSummary(RUNTIME_ARG_EFFECTIVE) },
  { headerSuffix: "Arg-Effective-Preview", value: () => formatRuntimeArgEffectivePreview(RUNTIME_ARG_EFFECTIVE) },
  { headerSuffix: "Unused-Arg-Summary", value: () => formatUnusedScriptArgsSummary(RUNTIME_UNUSED_ARGS) },
  { headerSuffix: "Unused-Arg-Preview", value: () => formatUnusedScriptArgsPreview(RUNTIME_UNUSED_ARGS) },
  { headerSuffix: "Route-Target-Source", value: () => RUNTIME_ARG_SOURCES.routeTargetSource || "none" },
  { headerSuffix: "Route-Info-Source", value: () => RUNTIME_ARG_SOURCES.routeInfoSource || "none" },
  { headerSuffix: "Merge-Sources", value: () => RUNTIME_LINK_OPTIONS.hasMergeSources ? RUNTIME_LINK_OPTIONS.mergeSources : "default" },
  { headerSuffix: "No-Cache", value: () => RUNTIME_LINK_OPTIONS.hasNoCache ? RUNTIME_LINK_OPTIONS.noCache : "default" },
  { headerSuffix: "Include-Unsupported", value: () => RUNTIME_LINK_OPTIONS.hasIncludeUnsupportedProxy ? RUNTIME_LINK_OPTIONS.includeUnsupportedProxy : "default" },
  { headerSuffix: "Link-Url-Kind", value: () => RUNTIME_LINK_OPTIONS.urlKind || "none" },
  { headerSuffix: "Link-Semantic-Summary", value: () => buildRuntimeLinkSemanticSummary(RUNTIME_LINK_OPTIONS) },
  { headerSuffix: "Link-Semantic-Check", value: () => "enabled" }
]);
// 规则源 URL/预设相关响应头也统一定义，避免 buildRuntimeResponseHeaders 再平铺十几行近似三元表达式。
const RULE_SOURCE_RESPONSE_HEADER_DEFINITIONS = Object.freeze([
  { headerSuffix: "Rule-Source-Preset", value: () => ARGS.hasRuleSourcePreset ? ARGS.ruleSourcePreset : DEFAULT_RULE_SOURCE_PRESET },
  { headerSuffix: "Steam-Fix", value: () => ARGS.hasSteamFix ? ARGS.steamFix : false },
  { headerSuffix: "Steam-Fix-Url", value: () => ARGS.steamFix ? (ARGS.hasSteamFixUrl ? ARGS.steamFixUrl : STEAM_FIX_LIST_URL) : "disabled" },
  { headerSuffix: "Direct-List-Url", value: () => ARGS.hasDirectListUrl ? ARGS.directListUrl : "default" },
  { headerSuffix: "Crypto-List-Url", value: () => ARGS.hasCryptoListUrl ? ARGS.cryptoListUrl : "default" },
  { headerSuffix: "ChatGPT-List-Url", value: () => ARGS.hasChatGptListUrl ? ARGS.chatGptListUrl : "default" },
  { headerSuffix: "AI-Extra-List-Url", value: () => ARGS.hasAiExtraListUrl ? ARGS.aiExtraListUrl : "default" },
  { headerSuffix: "Dev-List-Url", value: () => ARGS.hasDevListUrl ? ARGS.devListUrl : "default" },
  { headerSuffix: "Grok-Rule-Url", value: () => accademiaAdditionalRule("Grok") },
  { headerSuffix: "Apple-AI-Rule-Url", value: () => accademiaAdditionalRule("AppleAI") }
]);
// group/region 相关响应头集中定义，方便后续继续扩展面板布局/区域显示调试项。
const GEO_RUNTIME_RESPONSE_HEADER_DEFINITIONS = Object.freeze([
  createArgConfiguredResponseHeaderDefinition("Group-Strategy", "hasGroupStrategy", "groupStrategy", "default"),
  createArgConfiguredResponseHeaderDefinition("Group-Interface-Name", "hasGroupInterfaceName", "groupInterfaceName", "default"),
  createArgConfiguredResponseHeaderDefinition("Group-Routing-Mark", "hasGroupRoutingMark", "groupRoutingMark", "default"),
  { headerSuffix: "Group-Order-Preset", value: () => ARGS.hasGroupOrder ? "custom" : (ARGS.hasGroupOrderPreset ? ARGS.groupOrderPreset : DEFAULT_GROUP_ORDER_PRESET) },
  { headerSuffix: "Group-Order-Config", value: () => ARGS.hasGroupOrder ? formatProviderPreviewNames(ARGS.groupOrder, 8, 12) : "preset-only" },
  createArgConfiguredResponseHeaderDefinition("Country-Group-Sort", "hasCountryGroupSort", "countryGroupSort", "definition/default"),
  { headerSuffix: "Country-Group-Summary", value: (diagnostics) => diagnostics.countrySummary || "none" },
  createArgConfiguredResponseHeaderDefinition("Region-Group-Sort", "hasRegionGroupSort", "regionGroupSort", "definition/default"),
  { headerSuffix: "Region-Groups", value: () => ARGS.hasRegionGroups ? `configured:${ARGS.regionGroupKeys.length}` : (ARGS.hasRegionGroupsArg ? "configured:off" : "default/off") },
  { headerSuffix: "Region-Group-Preview", value: () => ARGS.hasRegionGroups ? ARGS.regionGroupPreview : (ARGS.hasRegionGroupsArg ? "off" : "none") },
  { headerSuffix: "Region-Group-Summary", value: (diagnostics) => diagnostics.regionGroupSummary || "none" },
  { headerSuffix: "Region-Visibility", value: (diagnostics) => diagnostics.regionVisibilitySummary || "none" },
  { headerSuffix: "Region-Visibility-Preview", value: (diagnostics) => formatProviderPreviewNames(diagnostics.regionVisibilityPreview, 6, 18) }
]);

// 这类“同一开关控制启用/禁用值”的响应头定义模板高度一致，这里统一构造，减少 definitions 平铺重复。
function createConditionalResponseHeaderDefinition(headerSuffix, enabled, enabledValue, disabledValue) {
  return {
    headerSuffix,
    value: () => enabled
      ? (typeof enabledValue === "function" ? enabledValue() : enabledValue)
      : (typeof disabledValue === "function" ? disabledValue() : disabledValue)
  };
}

// 这类 header 只是读取某组 `ARGS.hasX / ARGS.x`，这里再包一层轻量构造，减少 definitions 中成片重复模板。
function createArgConfiguredResponseHeaderDefinition(headerSuffix, hasKey, valueKey, fallbackValue) {
  return {
    headerSuffix,
    value: () => ARGS[hasKey] ? ARGS[valueKey] : fallbackValue
  };
}

// country-extra-aliases 一组响应头同构程度很高，也单独抽成定义表，避免主响应头函数再拉长。
const COUNTRY_EXTRA_ALIAS_RESPONSE_HEADER_DEFINITIONS = Object.freeze([
  createConditionalResponseHeaderDefinition("Country-Extra-Aliases", ARGS.hasCountryExtraAliases, "configured", "default"),
  createConditionalResponseHeaderDefinition("Country-Extra-Alias-Countries", ARGS.hasCountryExtraAliases, () => ARGS.countryExtraAliasCountryCount, 0),
  createConditionalResponseHeaderDefinition("Country-Extra-Alias-Entries", ARGS.hasCountryExtraAliases, () => ARGS.countryExtraAliasEntryCount, 0),
  createConditionalResponseHeaderDefinition("Country-Extra-Alias-Preview", ARGS.hasCountryExtraAliases, () => ARGS.countryExtraAliasPreview, "none"),
  createConditionalResponseHeaderDefinition("Country-Extra-Alias-Conflicts", ARGS.hasCountryExtraAliases, () => ARGS.countryExtraAliasConflictCount, 0),
  createConditionalResponseHeaderDefinition("Country-Extra-Alias-Conflict-Preview", ARGS.hasCountryExtraAliases, () => ARGS.countryExtraAliasConflictPreview, "none")
]);

// 几个规则顺序响应头只是 anchor/position 参数不同，统一构造后更容易继续扩展更多服务规则入口。
function createRuleOrderResponseHeaderDefinition(headerSuffix, anchorKey, positionKey) {
  return {
    headerSuffix,
    value: () => buildRuleOrderArgSummary(anchorKey, positionKey)
  };
}

// 规则编排相关响应头单独归档，方便后面继续补更多 order/anchor 调试项。
const ORDER_RUNTIME_RESPONSE_HEADER_DEFINITIONS = Object.freeze([
  createRuleOrderResponseHeaderDefinition("SteamCN-Rule-Order", "steamCnRuleAnchor", "steamCnRulePosition"),
  createRuleOrderResponseHeaderDefinition("Custom-Rule-Order", "customRuleAnchor", "customRulePosition"),
  createArgConfiguredResponseHeaderDefinition("SteamCN-Rule-Target", "hasSteamCnRuleTarget", "steamCnRuleTarget", "default")
]);
// full 日志里有些行是“标签 + 一段动态摘要”，不适合 `key=value,key=value` 风格，这里也统一成计算定义。
function createServiceSummaryValueLineDefinition(label, services, formatter) {
  return {
    label,
    value: () => formatServiceLogSummary(services, formatter)
  };
}

// 独立组资源摘要行的差异只剩“标签 / 服务集合 / formatter”，这里改成定义驱动，后续扩展新摘要只需补一项配置。
const BUILD_SUMMARY_SERVICE_RESOURCE_VALUE_LINE_DEFINITIONS = Object.freeze([
  {
    label: "独立组前置组",
    services: SERVICE_RESOURCE_VALIDATION_DEFINITIONS,
    formatter: (service) => getServiceArgLogValue(service.argToken, "PreferGroups")
  },
  {
    label: "独立组点名节点",
    services: SERVICE_RESOURCE_VALIDATION_DEFINITIONS,
    formatter: (service) => getServiceArgLogValue(service.argToken, "PreferNodes")
  },
  {
    label: "独立组Provider池",
    services: SERVICE_RESOURCE_VALIDATION_DEFINITIONS,
    formatter: (service) => formatServiceProviderPoolLogValue(service.argToken)
  },
  {
    label: "独立组测速",
    services: NON_DEV_SERVICE_DEFINITIONS,
    formatter: (service) => formatServiceLatencyLogValue(service.argToken)
  },
  {
    label: "独立组节点池",
    services: SERVICE_RESOURCE_VALIDATION_DEFINITIONS,
    formatter: (service) => formatServiceNodePoolLogValue(service.argToken)
  }
]);

// 把“服务资源摘要定义”统一转成 build summary 可直接消费的 value-line 定义表。
function buildServiceSummaryValueLines(definitions) {
  return (Array.isArray(definitions) ? definitions : [])
    .map((definition) => createServiceSummaryValueLineDefinition(definition.label, definition.services, definition.formatter));
}

// 预先把服务资源摘要定义映射成固定 value-line，减少 full summary 阶段重复构造。
const BUILD_SUMMARY_SERVICE_RESOURCE_VALUE_LINES = Object.freeze(
  buildServiceSummaryValueLines(BUILD_SUMMARY_SERVICE_RESOURCE_VALUE_LINE_DEFINITIONS)
);

// 这里集中定义 full build summary 中的“值类”输出项，便于统一检索、复用与响应头映射。
const BUILD_SUMMARY_VALUE_LINE_DEFINITIONS = Object.freeze([
  {
    label: "国家附加别名",
    value: () => ARGS.hasCountryExtraAliases
      ? `configured,countries=${ARGS.countryExtraAliasCountryCount},aliases=${ARGS.countryExtraAliasEntryCount},conflicts=${ARGS.countryExtraAliasConflictCount},preview=${ARGS.countryExtraAliasPreview},conflict-preview=${ARGS.countryExtraAliasConflictPreview}`
      : "default"
  },
  {
    label: "区域分组参数",
    value: (stats) => ARGS.hasRegionGroups
      ? `configured,preview=${ARGS.regionGroupPreview},generated=${stats.regionGroups},summary=${stats.regionGroupSummary || "none"}`
      : (ARGS.hasRegionGroupsArg ? "configured:off" : "default/off")
  },
  {
    label: "分组排序参数",
    value: () => `country-sort=${ARGS.hasCountryGroupSort ? ARGS.countryGroupSort : "definition/default"}, region-sort=${ARGS.hasRegionGroupSort ? ARGS.regionGroupSort : "definition/default"}`
  },
  {
    label: "策略组编排",
    value: () => `preset=${ARGS.hasGroupOrder ? "custom" : (ARGS.hasGroupOrderPreset ? ARGS.groupOrderPreset : DEFAULT_GROUP_ORDER_PRESET)}, order=${ARGS.hasGroupOrder ? ARGS.groupOrder.join(" > ") : "preset-only"}`
  },
  {
    label: "规则顺序编排",
    value: () => formatRuleOrderPresentationSummary(BUILD_SUMMARY_RULE_ORDER_ENTRY_DEFINITIONS)
  },
  {
    label: "自定义规则编排",
    value: () => buildRuleOrderArgSummary("customRuleAnchor", "customRulePosition")
  },
  {
    label: "响应头参数",
    value: (stats) => `enabled=${ARGS.hasResponseHeaders ? ARGS.responseHeaders : false}, prefix=${ARGS.responseHeaderPrefix}, applied=${stats.responseHeadersApplied ? "yes" : "no"}`
  },
  {
    label: "参数来源",
    value: () => formatRuntimeArgSourceSummary(RUNTIME_ARG_SOURCES)
  },
  {
    label: "参数生效来源",
    value: () => `${formatRuntimeArgEffectiveSummary(RUNTIME_ARG_EFFECTIVE)}, preview=${formatRuntimeArgEffectivePreview(RUNTIME_ARG_EFFECTIVE)}`
  },
  {
    label: "未消费参数",
    value: () => `${formatUnusedScriptArgsSummary(RUNTIME_UNUSED_ARGS)}, preview=${formatUnusedScriptArgsPreview(RUNTIME_UNUSED_ARGS)}`
  },
  {
    label: "国家优先链",
    value: () => `ai=${ARGS.hasAiPreferCountries ? ARGS.aiPreferCountries.join(" > ") : "default"}, crypto=${ARGS.hasCryptoPreferCountries ? ARGS.cryptoPreferCountries.join(" > ") : "default"}, github=${ARGS.hasGithubPreferCountries ? ARGS.githubPreferCountries.join(" > ") : "default"} (${ARGS.githubMode}, ${ARGS.githubType}), steam=${ARGS.hasSteamPreferCountries ? ARGS.steamPreferCountries.join(" > ") : "default"} (${ARGS.steamMode}, ${ARGS.steamType}), dev=${ARGS.hasDevPreferCountries ? ARGS.devPreferCountries.join(" > ") : "default"} (${ARGS.devMode}, ${ARGS.devType})`
  },
  {
    label: "开发服务组高级项",
    value: () => formatServiceArgFieldsLogValue("Dev", DEV_SERVICE_ADVANCED_LOG_FIELD_DEFINITIONS)
  },
  ...BUILD_SUMMARY_SERVICE_RESOURCE_VALUE_LINES,
  {
    label: "分组排序",
    value: () => `countries=${ARGS.countryGroupSort}${ARGS.hasCountryGroupSort ? "" : " (default)"}, regions=${ARGS.regionGroupSort}${ARGS.hasRegionGroupSort ? "" : " (default)"}`
  },
  {
    label: "国家优先链命中",
    value: (stats) => formatServicePreferredCountrySummaryLine(stats, "ResolvedSummary")
  },
  {
    label: "区域可见性",
    value: (stats) => `${stats.regionVisibilitySummary || "disabled"}, preview=${stats.regionVisibilityPreview || "none"}`
  },
  {
    label: "规则源语义",
    value: () => "official-type/behavior/format/path/payload-check=on, safe-path-hint=on"
  },
  {
    label: "代理集合语义",
    value: () => "official-type/url/path/payload-check=on, safe-path-hint=on"
  },
  {
    label: "下载链路语义",
    value: () => `official-link-params-check=on, summary=${buildRuntimeLinkSemanticSummary(RUNTIME_LINK_OPTIONS)}`
  },
  {
    label: "运行环境",
    value: () => `target=${RUNTIME_CONTEXT.target || "unknown"}, route-target=${RUNTIME_CONTEXT.routeTarget || "none"}, query-target=${RUNTIME_CONTEXT.queryTarget || "none"}, request-url=${RUNTIME_CONTEXT.requestUrl || "unknown"}, request-path=${RUNTIME_CONTEXT.requestPath || "unknown"}, route-path=${RUNTIME_CONTEXT.routePath || "unknown"}, request-params-target=${RUNTIME_CONTEXT.requestParamsTarget || "none"}, ua=${RUNTIME_CONTEXT.userAgent || "unknown"}, query-args=${Object.keys(RUNTIME_QUERY_ARGS).length}`
  }
]);

// 把数量型指标按定义表批量输出，避免 logBuildSummary 里重复写几十行格式完全相同的 console.log。
function emitBuildSummaryMetricLine(definition, stats, defaultUnit) {
  const label = normalizeStringArg(definition && definition.label);
  const key = normalizeStringArg(definition && definition.key);
  if (!label || !key) {
    return;
  }

  const current = isObject(stats) ? stats : {};
  const unit = normalizeStringArg(definition.unit || defaultUnit);
  const value = Number(current[key]) || 0;
  console.log(`   ✓ ${label}: ${value}${unit ? ` ${unit}` : ""}`);
}

// 按定义表顺序输出某一节中的全部数量型指标。
function logBuildSummaryMetricLines(stats, definitions, defaultUnit) {
  for (const definition of Array.isArray(definitions) ? definitions : []) {
    emitBuildSummaryMetricLine(definition, stats, defaultUnit);
  }
}

// 顺序遍历所有指标节定义，并逐节输出统计摘要。
function logBuildSummaryMetricSections(stats, sections) {
  for (const section of Array.isArray(sections) ? sections : BUILD_SUMMARY_METRIC_SECTION_DEFINITIONS) {
    logBuildSummaryMetricLines(stats, section.definitions, section.defaultUnit);
  }
}

// 把定义表预编成按 label 查找的字典，避免同一轮 full 日志里反复线性扫描同一批定义。
function buildBuildSummaryDefinitionLookup(definitions) {
  const lookup = Object.create(null);

  for (const definition of Array.isArray(definitions) ? definitions : []) {
    const label = normalizeStringArg(definition && definition.label);
    if (!label || hasOwn(lookup, label)) {
      continue;
    }

    lookup[label] = definition;
  }

  return lookup;
}

// lookup registry 也整理成定义表，避免 logBuildSummary 每次手写同构的 buildBuildSummaryDefinitionLookup 组合。
const BUILD_SUMMARY_LOOKUP_REGISTRY_DEFINITIONS = Object.freeze([
  { key: "value", definitions: BUILD_SUMMARY_VALUE_LINE_DEFINITIONS },
  { key: "coreArg", definitions: BUILD_SUMMARY_CORE_ARG_LINE_DEFINITIONS },
  { key: "providerArg", definitions: BUILD_SUMMARY_PROVIDER_ARG_LINE_DEFINITIONS }
]);

// build summary lookup registry 当前只依赖 definitions 数组，这里单独解析方便 registry builder 与 source payload 共享同一入口。
function resolveBuildSummaryLookupRegistryDefinitions(definitions) {
  return Array.isArray(definitions) ? definitions : [];
}

// registry 中的单个 lookup 项本质上只是“标准化 key + 预编译后的 label lookup”，这里抽成 entry builder 便于继续收敛 registry 主体。
function buildBuildSummaryLookupRegistryEntry(definition) {
  const key = normalizeStringArg(definition && definition.key);
  if (!key) {
    return null;
  }

  return {
    key,
    lookup: buildBuildSummaryDefinitionLookup(definition && definition.definitions)
  };
}

// 把多套 summary 定义表预编译成 lookup registry，供 full 模式按标签快速检索。
function buildBuildSummaryLookupRegistry(definitions) {
  const registry = Object.create(null);

  for (const definition of resolveBuildSummaryLookupRegistryDefinitions(definitions)) {
    const entry = buildBuildSummaryLookupRegistryEntry(definition);
    if (!isObject(entry) || hasOwn(registry, entry.key)) {
      continue;
    }

    registry[entry.key] = entry.lookup;
  }

  return registry;
}

// 按标签列表批量输出摘要行，减少 logBuildSummary 里一长串重复的 find+log 调用。
function logBuildSummaryDefinitionLabels(stats, lookup, labels, loggerKind) {
  const currentLookup = isObject(lookup) ? lookup : {};
  const currentLoggerKind = resolveKindRegistryValue(BUILD_SUMMARY_LOOKUP_LOGGER_MAP, loggerKind);
  if (!currentLoggerKind) {
    return;
  }

  for (const label of Array.isArray(labels) ? labels : []) {
    const normalizedLabel = normalizeStringArg(label);
    if (!normalizedLabel || !hasOwn(currentLookup, normalizedLabel)) {
      continue;
    }

    logBuildSummaryLineByKind(currentLoggerKind, currentLookup[normalizedLabel], stats);
  }
}

// 不同 lookup 分区对应不同的行日志协议 kind，这里固定映射，避免调用方再写条件分派。
const BUILD_SUMMARY_LOOKUP_LOGGER_MAP = Object.freeze({
  arg: "arg",
  value: "value"
});

// lookup section 当前真正依赖的外部上下文只有 stats/lookups，这里先统一打包，减少 section runner 之间的参数位耦合。
function buildBuildSummaryLookupSectionContext(payload) {
  const context = isObject(payload) ? payload : {};
  return {
    stats: isObject(context.stats) ? context.stats : {},
    lookups: isObject(context.lookups) ? context.lookups : {}
  };
}

// lookup section 的执行载荷固定由 lookupKey/loggerKind/labels/lookup/stats 五项组成，这里统一 definitions 化，避免 runner 再手写取值模板。
const BUILD_SUMMARY_LOOKUP_SECTION_PAYLOAD_DEFINITIONS = Object.freeze([
  { key: "lookupKey", value: (section) => normalizeStringArg(section && section.lookupKey) },
  { key: "loggerKind", value: (section) => resolveKindRegistryValue(BUILD_SUMMARY_LOOKUP_LOGGER_MAP, section && section.loggerKey) || "" },
  { key: "labels", value: (section) => Array.isArray(section && section.labels) ? section.labels : [] },
  {
    key: "lookup",
    value: (section, context) => {
      const lookupKey = normalizeStringArg(section && section.lookupKey);
      return lookupKey && hasOwn(context.lookups, lookupKey) ? context.lookups[lookupKey] : null;
    }
  },
  { key: "stats", value: (section, context) => context.stats }
]);

// 单个 lookup section 统一先裁成标准 payload，后续是否跳过/如何执行都只看这份 payload。
function buildBuildSummaryLookupSectionPayload(section, context) {
  return buildDefinitionDrivenPayload(
    BUILD_SUMMARY_LOOKUP_SECTION_PAYLOAD_DEFINITIONS,
    isObject(section) ? section : {},
    buildBuildSummaryLookupSectionContext(context)
  );
}

// lookup section 的执行条件统一收敛：loggerKind、lookup 与 labels 三者缺一就直接跳过。
function shouldExecuteBuildSummaryLookupSection(payload) {
  const current = isObject(payload) ? payload : {};
  return !!normalizeStringArg(current.loggerKind)
    && isObject(current.lookup)
    && Array.isArray(current.labels)
    && current.labels.length > 0;
}

// 单个 lookup section 的执行统一走标准 payload，减少主 runner 里重复的 normalize + hasOwn 防御代码。
function executeBuildSummaryLookupSection(section, context) {
  const payload = buildBuildSummaryLookupSectionPayload(section, context);
  if (!shouldExecuteBuildSummaryLookupSection(payload)) {
    return;
  }

  logBuildSummaryDefinitionLabels(payload.stats, payload.lookup, payload.labels, payload.loggerKind);
}

// lookup section 计划按顺序统一执行，保持原输出顺序不变，同时把上下文参数收紧成一份 context 对象。
function runBuildSummaryLookupSections(context, sections) {
  const currentContext = buildBuildSummaryLookupSectionContext(context);
  for (const section of Array.isArray(sections) ? sections : []) {
    executeBuildSummaryLookupSection(section, currentContext);
  }
}

// 按计划表批量执行 full 日志中的 lookup 区块，减少 logBuildSummary 里重复声明 logger/lookup/labels 组合。
function logBuildSummaryLookupSections(stats, lookups, sections) {
  runBuildSummaryLookupSections({ stats, lookups }, sections);
}

// 统一解析 full 日志里的单个参数项；未配置时回退为 default，避免每条日志都手写三元表达式。
function getBuildSummaryArgEntryValue(entry, stats) {
  const current = isObject(entry) ? entry : {};
  if (typeof current.value === "function") {
    // 动态 value 统一收到当前 stats，这样 definitions 里既能读取 ARGS，也能安全读取 full-summary 派生统计。
    return current.value(isObject(stats) ? stats : {});
  }

  if (current.hasKey && !ARGS[current.hasKey]) {
    return typeof current.fallback === "undefined" ? "default" : current.fallback;
  }

  if (!current.valueKey) {
    return typeof current.fallback === "undefined" ? "default" : current.fallback;
  }

  const value = ARGS[current.valueKey];
  if (Array.isArray(value)) {
    return value.length ? value.join(" > ") : "default";
  }

  return hasUsableArgValue(value) ? value : "default";
}

// full 日志里大量条目最终都落成“✓ 标签: 内容”，这里统一输出，减少壳层 logger 的重复 console.log 模板。
function emitBuildSummaryLine(label, content) {
  const normalizedLabel = normalizeStringArg(label);
  if (!normalizedLabel) {
    return;
  }

  console.log(`   ✓ ${normalizedLabel}: ${content}`);
}

// 把一组参数项按 `key=value` 形式压成单行摘要，供规则入口目标/独立组网络等日志复用。
function formatBuildSummaryArgEntries(entries, stats) {
  return (Array.isArray(entries) ? entries : [])
    // 这里把 stats 原样透传给单条 entry，确保 provider apply/mutation 这类“依赖 full 统计”的字段能拿到上下文。
    .map((entry) => `${entry.key}=${getBuildSummaryArgEntryValue(entry, stats)}`)
    .join(", ");
}

// build-summary 里的 arg/value/optional/diagnostic 四类行最终都可归一成 { label, content, shouldLog } 协议，这里统一注册各类 payload builder。
const BUILD_SUMMARY_LINE_LOG_PAYLOAD_BUILDERS = Object.freeze({
  arg: (definition, stats) => {
    const label = normalizeStringArg(definition && definition.label);
    if (!label) {
      return null;
    }

    return {
      label,
      content: formatBuildSummaryArgEntries(definition.entries, stats),
      shouldLog: true
    };
  },
  value: (definition, stats) => {
    const label = normalizeStringArg(definition && definition.label);
    if (!label || typeof (definition && definition.value) !== "function") {
      return null;
    }

    return {
      label,
      content: definition.value(isObject(stats) ? stats : {}),
      shouldLog: true
    };
  },
  "optional-value": (definition, stats) => {
    const current = isObject(stats) ? stats : {};
    const shouldLog = definition && typeof definition.shouldLog === "function"
      ? definition.shouldLog(current)
      : false;

    if (!shouldLog) {
      return null;
    }

    return buildBuildSummaryLineLogPayload("value", definition, current);
  },
  diagnostic: (definition, stats) => {
    const current = isObject(stats) ? stats : {};
    const label = normalizeStringArg(definition && definition.label);
    const summaryKey = normalizeStringArg(definition && definition.summaryKey);
    const previewKey = normalizeStringArg(definition && definition.previewKey);

    if (!label || !summaryKey) {
      return null;
    }

    const summary = current[summaryKey] || "none";
    const preview = previewKey ? (current[previewKey] || "none") : "";

    return {
      label,
      content: `${summary}${previewKey ? `, preview=${preview}` : ""}`,
      shouldLog: true
    };
  }
});

// 统一解析 build-summary 单行日志 payload，避免 arg/value/optional/diagnostic 四类行各自维护一套标签/内容兜底逻辑。
function buildBuildSummaryLineLogPayload(kind, definition, stats) {
  const payload = executeKindRegistryHandler(
    BUILD_SUMMARY_LINE_LOG_PAYLOAD_BUILDERS,
    kind,
    definition,
    isObject(stats) ? stats : {}
  );
  return typeof payload === "undefined" ? null : payload;
}

// 单行日志最终只需要按 payload 协议输出；无 payload 或 shouldLog=false 时直接跳过。
function emitBuildSummaryLinePayload(payload) {
  if (!isObject(payload) || payload.shouldLog === false) {
    return;
  }

  emitBuildSummaryLine(payload.label, payload.content);
}

// build-summary 各类单行 logger 统一走 kind -> payload -> emit 这条链路，减少平行 logger 的重复模板。
function logBuildSummaryLineByKind(kind, definition, stats) {
  emitBuildSummaryLinePayload(buildBuildSummaryLineLogPayload(kind, definition, stats));
}

// full 日志里这类“摘要 + 可选 preview”格式也走统一模板，减少多段近似 console.log。
function logBuildSummaryDiagnosticLines(stats, definitions) {
  for (const definition of Array.isArray(definitions) ? definitions : []) {
    logBuildSummaryLineByKind("diagnostic", definition, stats);
  }
}

// 统一输出 full 日志里的服务参数摘要块。
function logBuildSummaryArgLine(definition, stats) {
  logBuildSummaryLineByKind("arg", definition, stats);
}

// 统一输出“标签 + 动态摘要”型日志，适合国家附加别名、区域分组参数这类不规则摘要行。
function logBuildSummaryValueLine(definition, stats) {
  logBuildSummaryLineByKind("value", definition, stats);
}

// 统一输出“满足条件才打印”的摘要行，适合国家统计/区域统计/国家优先链 trace 这类可选项。
function logBuildSummaryOptionalValueLine(definition, stats) {
  logBuildSummaryLineByKind("optional-value", definition, stats);
}

// 把 diagnostics 里的摘要字段批量转成响应头，避免 buildRuntimeResponseHeaders 底部长串近似赋值。
function buildPrefixedHeaderEntryPayload(prefix, entries) {
  const headers = {};

  for (const entry of Array.isArray(entries) ? entries : []) {
    if (!entry || !entry.suffix) {
      continue;
    }

    headers[`${prefix}${entry.suffix}`] = entry.value;
  }

  return headers;
}

// 这一层只负责“definitions -> entries”映射，再把最终 emit 委托给纯 header payload helper。
function buildPrefixedHeaderPayload(prefix, definitions, entryBuilder) {
  const entries = [];

  for (const definition of Array.isArray(definitions) ? definitions : []) {
    // 一个 definition 可能展开成 0~N 个头字段，所以这里统一按数组接口收集。
    const mappedEntries = typeof entryBuilder === "function" ? entryBuilder(definition) : [];
    entries.push.apply(entries, Array.isArray(mappedEntries) ? mappedEntries : []);
  }

  return buildPrefixedHeaderEntryPayload(prefix, entries);
}

// 两类 runtime response-header builder 都只是“definitions + diagnostics -> entries”的轻量适配，这里统一收口。
function buildMappedResponseHeaders(prefix, diagnostics, definitions, entryBuilder) {
  const current = isObject(diagnostics) ? diagnostics : {};
  const mapper = typeof entryBuilder === "function" ? entryBuilder : (() => []);
  return buildPrefixedHeaderPayload(prefix, definitions, (definition) => normalizeResponseHeaderEntries(mapper(definition, current)));
}

// response-header 适配层里最终都落成 `{ suffix, value }` 结构，这里统一构造 shape，本身不做额外规范化。
function createResponseHeaderEntry(suffix, value) {
  return { suffix, value };
}

// 把 mapper 产出的 entry 列表统一规范化到中间层，避免底层 payload emitter 和上层 builder 各自重复校验 suffix。
function normalizeResponseHeaderEntries(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => {
      const suffix = normalizeStringArg(entry && entry.suffix);
      return suffix ? createResponseHeaderEntry(suffix, entry && entry.value) : null;
    })
    .filter(Boolean);
}

// 大多数响应头定义最终只产出单个 entry，这里统一返回单项数组，减少单值路径反复手写 `[entry].filter(Boolean)`。
function buildSingleResponseHeaderEntryList(suffix, value) {
  return [createResponseHeaderEntry(suffix, value)];
}

// 把 diagnostics 里的摘要字段批量转成响应头，避免 buildRuntimeResponseHeaders 底部长串近似赋值。
function buildDiagnosticSummaryResponseHeaderEntryList(definition, diagnostics) {
  const current = isObject(diagnostics) ? diagnostics : {};
  const summaryKey = normalizeStringArg(definition && definition.summaryKey);
  const summaryHeaderSuffix = normalizeStringArg(definition && definition.headerSuffix);
  const previewKey = normalizeStringArg(definition && definition.previewKey);
  const previewHeaderSuffix = normalizeStringArg(definition && definition.previewHeaderSuffix);

  return []
    .concat(summaryKey && summaryHeaderSuffix ? buildSingleResponseHeaderEntryList(summaryHeaderSuffix, current[summaryKey] || "none") : [])
    .concat(previewKey && previewHeaderSuffix ? buildSingleResponseHeaderEntryList(previewHeaderSuffix, current[previewKey] || "none") : []);
}

// diagnostics 中“summary + preview”结构的字段统一借由该 helper 生成响应头。
function buildDiagnosticSummaryResponseHeaders(prefix, diagnostics, definitions) {
  return buildMappedResponseHeaders(prefix, diagnostics, definitions, buildDiagnosticSummaryResponseHeaderEntryList);
}

// 把定义表批量转成响应头，字段值可按需读取 diagnostics，减少 provider 响应头的大块平行模板。
function buildRuntimeResponseHeaderDefinitionEntryList(definition, diagnostics) {
  const current = isObject(diagnostics) ? diagnostics : {};
  const headerSuffix = normalizeStringArg(definition && definition.headerSuffix);
  if (!headerSuffix) {
    return [];
  }

  return buildSingleResponseHeaderEntryList(
    headerSuffix,
    typeof (definition && definition.value) === "function"
      ? definition.value(current)
      : "default"
  );
}

// 普通 definitions 形式的运行时响应头走这条批量装配通路。
function buildRuntimeResponseHeaderEntries(prefix, definitions, diagnostics) {
  return buildMappedResponseHeaders(prefix, diagnostics, definitions, buildRuntimeResponseHeaderDefinitionEntryList);
}

// runtime 响应头由多段固定 section 构成；现在统一只保留 kind + definitions 协议，避免遗留 custom 分支继续扩散。
function createRuntimeResponseHeaderSection(kind, payload) {
  return typeof payload === "undefined"
    ? { kind }
    : { kind, definitions: payload };
}

// mapped section 只是对 createRuntimeResponseHeaderSection 的语义化包装。
function createRuntimeResponseHeaderMappedSection(kind, definitions) {
  return createRuntimeResponseHeaderSection(kind, definitions);
}

// 最常见的 definitions section 直接用该 helper 包装成标准 section 结构。
function createRuntimeResponseHeaderDefinitionSection(definitions) {
  return createRuntimeResponseHeaderMappedSection("definition", definitions);
}

// diagnostics summary 这类 section 也收成显式协议，避免和普通 definitions section 混在同一套 definitions builder 里。
function createRuntimeResponseHeaderDiagnosticSummarySection(definitions) {
  return createRuntimeResponseHeaderMappedSection("diagnostic-summary", definitions);
}

// runtime 响应头末尾还有一小批固定统计项，也整理成定义表，并继续纳入统一 section 计划执行。
const RUNTIME_RESPONSE_HEADER_TRAILING_DEFINITIONS = Object.freeze([
  { headerSuffix: "Query-Args", value: () => Object.keys(RUNTIME_QUERY_ARGS).length },
  { headerSuffix: "Diagnostic-Issues", value: (diagnostics) => countDiagnosticIssues(diagnostics) }
]);

// 运行时响应头的完整装配顺序定义；各 section 会按这里的次序依次展开。
const RUNTIME_RESPONSE_HEADER_SECTION_DEFINITIONS = Object.freeze([
  createRuntimeResponseHeaderDefinitionSection(RUNTIME_CONTEXT_RESPONSE_HEADER_DEFINITIONS),
  createRuntimeResponseHeaderDefinitionSection(RULE_SOURCE_RESPONSE_HEADER_DEFINITIONS),
  createRuntimeResponseHeaderDefinitionSection(RULE_PROVIDER_RESPONSE_HEADER_DEFINITIONS),
  createRuntimeResponseHeaderDefinitionSection(PROXY_PROVIDER_RESPONSE_HEADER_DEFINITIONS),
  createRuntimeResponseHeaderDefinitionSection(GEO_RUNTIME_RESPONSE_HEADER_DEFINITIONS),
  createRuntimeResponseHeaderDefinitionSection(SERVICE_RESPONSE_HEADER_DEFINITIONS),
  createRuntimeResponseHeaderDefinitionSection(SERVICE_PREFERRED_COUNTRY_RESPONSE_HEADER_DEFINITIONS),
  createRuntimeResponseHeaderDefinitionSection(COUNTRY_EXTRA_ALIAS_RESPONSE_HEADER_DEFINITIONS),
  createRuntimeResponseHeaderDefinitionSection(ORDER_RUNTIME_RESPONSE_HEADER_DEFINITIONS),
  createRuntimeResponseHeaderDiagnosticSummarySection(BUILD_SUMMARY_DIAGNOSTIC_LINE_DEFINITIONS),
  createRuntimeResponseHeaderDefinitionSection(RUNTIME_RESPONSE_HEADER_TRAILING_DEFINITIONS)
]);

// runtime response-header 运行期只需要 prefix/diagnostics 这两个上下文字段，这里单独打包，收紧 buildRuntimeResponseHeaders 的职责。
function buildRuntimeResponseHeaderContext(diagnostics) {
  return {
    prefix: ARGS.responseHeaderPrefix,
    diagnostics
  };
}

// runtime response-header 各 section 当前都只是消费 definitions，这里统一抽出读取逻辑，避免 section builder 各自重复兜底。
function resolveRuntimeResponseHeaderSectionDefinitions(section) {
  return Array.isArray(section && section.definitions) ? section.definitions : [];
}

// definition / diagnostics-summary 两类 section 最终都只是“definitions + context -> headers”，这里统一收敛映射壳层。
function buildRuntimeResponseHeaderMappedSectionPayload(section, context, payloadBuilder) {
  const currentContext = isObject(context) ? context : {};
  const definitions = resolveRuntimeResponseHeaderSectionDefinitions(section);
  return definitions.length && typeof payloadBuilder === "function"
    ? payloadBuilder(currentContext.prefix, currentContext.diagnostics, definitions)
    : {};
}

// runtime response-header 的 section 目前只分 definitions / diagnostics-summary 两类；注册表化后更容易继续扩展新 section 类型。
const RUNTIME_RESPONSE_HEADER_SECTION_PAYLOAD_BUILDERS = Object.freeze({
  definition: (section, context) => buildRuntimeResponseHeaderMappedSectionPayload(
    section,
    context,
    buildRuntimeResponseHeaderEntries
  ),
  "diagnostic-summary": (section, context) => buildRuntimeResponseHeaderMappedSectionPayload(
    section,
    context,
    buildDiagnosticSummaryResponseHeaders
  )
});

// 按 section 计划批量装配运行时响应头，减少 buildRuntimeResponseHeaders 内平行展开多段 helper 调用。
function buildRuntimeResponseHeaderSectionPayload(section, context) {
  const currentContext = isObject(context) ? context : {};
  const payload = executeKindRegistryHandler(
    RUNTIME_RESPONSE_HEADER_SECTION_PAYLOAD_BUILDERS,
    section && section.kind,
    section,
    currentContext
  );
  return isObject(payload) ? payload : {};
}

// 把 section 计划表依次归并成最终响应头对象。
function buildRuntimeResponseHeaderSections(context, sections) {
  const headers = {};
  const runtimeContext = isObject(context) ? context : {};

  for (const definition of Array.isArray(sections) ? sections : []) {
    // 后面的 section 若产出同名头，会按 Object.assign 语义覆盖前面的值。
    Object.assign(headers, buildRuntimeResponseHeaderSectionPayload(definition, runtimeContext));
  }

  return headers;
}

// 按字段定义统一补齐 diagnostics supplement 的默认值，避免主流程里继续堆一长串同构赋值。
function normalizeDiagnosticsSupplementFieldValue(current, definition) {
  const key = normalizeStringArg(definition && definition.key);
  const type = normalizeStringArg(definition && definition.type);

  if (!key) {
    return undefined;
  }

  if (type === "array") {
    return Array.isArray(current[key]) ? current[key] : [];
  }

  if (type === "number") {
    return Number(current[key]) || 0;
  }

  if (type === "string") {
    return current[key] || "";
  }

  return current[key];
}

// 这类“遍历定义并按自定义规则归一化字段”的装配在 diagnostics 等阶段会重复出现，这里抽成共享 helper。
function buildNormalizedDefinitionPayload(definitions, context, normalizer) {
  const source = Array.isArray(definitions) ? definitions : [];
  const current = isObject(context) ? context : {};
  const payload = {};

  for (const definition of source) {
    const key = normalizeStringArg(definition && definition.key);
    if (!key || typeof normalizer !== "function") {
      continue;
    }

    // normalizer 决定每个字段的默认值/归一化策略，这里只负责按定义表驱动装配。
    payload[key] = normalizer(current, definition);
  }

  return payload;
}

// 这类“一个 source 同时产出 summary/preview 两个派生字段”的定义也抽成共享 helper，减少平行格式化循环。
function buildSummaryPreviewDefinitionPayload(definitions, context) {
  const source = Array.isArray(definitions) ? definitions : [];
  const current = isObject(context) ? context : {};
  const payload = {};

  for (const definition of source) {
    const sourceKey = normalizeStringArg(definition && definition.sourceKey);
    const summaryKey = normalizeStringArg(definition && definition.summaryKey);
    const previewKey = normalizeStringArg(definition && definition.previewKey);
    const value = sourceKey ? current[sourceKey] : undefined;

    if (summaryKey && typeof (definition && definition.summaryFormatter) === "function") {
      payload[summaryKey] = definition.summaryFormatter(value);
    }

    if (previewKey && typeof (definition && definition.previewFormatter) === "function") {
      payload[previewKey] = definition.previewFormatter(value);
    }
  }

  return payload;
}

// 统一补齐主流程里派生出来的 diagnostics 字段，避免 main 中一长串逐项赋值难维护。
function buildDiagnosticsSupplement(payload) {
  return buildNormalizedDefinitionPayload(
    BUILD_DIAGNOSTICS_SUPPLEMENT_FIELD_DEFINITIONS,
    payload,
    normalizeDiagnosticsSupplementFieldValue
  );
}

// 按统一定义从主流程上下文提取 diagnostics supplement 的原始 payload，减少 main 中同构的键值拼装。
function buildDiagnosticsSupplementPayload(payload) {
  return buildDefinitionDrivenPayload(BUILD_DIAGNOSTICS_SUPPLEMENT_PAYLOAD_DEFINITIONS, payload);
}

// 从一组分析结果批量派生 summary/preview 字段，避免 main 中平行的 formatSummary/formatPreview 调用。
function buildMainAnalysisSummaryPreviewPayload(payload) {
  return buildSummaryPreviewDefinitionPayload(MAIN_ANALYSIS_SUMMARY_PREVIEW_DEFINITIONS, payload);
}

// 同时补齐只产出单个 summary 的分析字段，继续减少 main 中零散的 build/format 调用。
function buildMainAnalysisSingleValuePayload(payload) {
  return buildDefinitionDrivenPayload(MAIN_ANALYSIS_SINGLE_VALUE_DEFINITIONS, payload);
}

// 分析阶段里“单值摘要”只需要这几项字段，这里统一裁剪后再喂给单值 definitions，避免 buildMainAnalysisArtifacts 手写对象模板。
const MAIN_ANALYSIS_SINGLE_VALUE_SOURCE_DEFINITIONS = Object.freeze([
  { key: "proxyGroups", value: (context) => context.proxyGroups },
  { key: "rules", value: (context) => context.rules },
  { key: "generatedRules", value: (context) => context.generatedRules },
  { key: "configuredRules", value: (context) => context.configuredRules },
  { key: "ruleAnalysis", value: (context) => context.ruleAnalysis }
]);

// 单值分析摘要在多个收尾点都可能复用这一裁剪后的输入，这里单独收口。
function buildMainAnalysisSingleValueSourcePayload(payload) {
  return buildDefinitionDrivenPayload(MAIN_ANALYSIS_SINGLE_VALUE_SOURCE_DEFINITIONS, payload);
}

// analysis 阶段继续整理成顺序产物：主分析 -> summary/preview -> 单值摘要 -> 最终合并结果。
const MAIN_ANALYSIS_EXECUTION_ARTIFACT_DEFINITIONS = Object.freeze([
  {
    key: "analysisPayload",
    value: (context) => buildDefinitionDrivenPayload(MAIN_ANALYSIS_ARTIFACT_DEFINITIONS, context)
  },
  {
    key: "analysisSummaryPayload",
    value: (context) => buildMainAnalysisSummaryPreviewPayload(context.analysisPayload)
  },
  {
    key: "analysisSingleValueSourcePayload",
    value: (context) => buildMainAnalysisSingleValueSourcePayload(context)
  },
  {
    key: "analysisSingleValuePayload",
    value: (context) => buildMainAnalysisSingleValuePayload(context.analysisSingleValueSourcePayload)
  },
  {
    key: "finalAnalysisArtifacts",
    value: (context) => Object.assign(
      {},
      isObject(context.analysisPayload) ? context.analysisPayload : {},
      {
        analysisSummaryPayload: isObject(context.analysisSummaryPayload) ? context.analysisSummaryPayload : {},
        analysisSingleValuePayload: isObject(context.analysisSingleValuePayload) ? context.analysisSingleValuePayload : {}
      }
    )
  }
]);

// 主流程里一批顺序/链路分析高度相关，这里统一走顺序执行器，避免 main 中堆连续二三十行平行变量。
function buildMainAnalysisExecutionArtifacts(payload) {
  return buildSequentialDefinitionPayload(
    MAIN_ANALYSIS_EXECUTION_ARTIFACT_DEFINITIONS,
    isObject(payload) ? payload : {},
    buildSequentialStageExecutionContext
  );
}

// 分析阶段最终只暴露合并后的 artifacts，顺序执行细节由单独 helper 负责。
function buildMainAnalysisArtifacts(payload) {
  return buildMainAnalysisExecutionArtifacts(payload).finalAnalysisArtifacts;
}

// analysis 派生摘要固定只暴露这两个字段，统一定义后后续若新增派生摘要可直接扩表。
const MAIN_ANALYSIS_PAYLOAD_ARTIFACT_DEFINITIONS = Object.freeze([
  { key: "analysisSummaryPayload", value: (context) => isObject(context.analysisSummaryPayload) ? context.analysisSummaryPayload : {} },
  { key: "analysisSingleValuePayload", value: (context) => isObject(context.analysisSingleValuePayload) ? context.analysisSingleValuePayload : {} }
]);

// 从 analysisArtifacts 中统一抽取两份派生摘要，避免 main 与后续阶段各自手写取值和兜底。
function buildMainAnalysisPayloadArtifacts(analysisArtifacts) {
  return buildDefinitionDrivenPayload(MAIN_ANALYSIS_PAYLOAD_ARTIFACT_DEFINITIONS, analysisArtifacts);
}

// geo 阶段复用字段固定，统一定义后便于继续和 summary/pipeline 等下游保持同步。
const MAIN_GEO_PAYLOAD_ARTIFACT_DEFINITIONS = Object.freeze([
  { key: "proxyStats", value: (context) => context.proxyStats },
  { key: "countryCoverage", value: (context) => context.countryCoverage },
  { key: "countryConfigs", value: (context) => context.countryConfigs },
  { key: "countrySummary", value: (context) => context.countrySummary },
  { key: "preferredCountryStates", value: (context) => context.preferredCountryStates },
  { key: "preferredCountrySummaryPayload", value: (context) => context.preferredCountrySummaryPayload },
  { key: "regionConfigs", value: (context) => context.regionConfigs },
  { key: "regionGroupSummary", value: (context) => context.regionGroupSummary },
  { key: "proxyGroups", value: (context) => Array.isArray(context.proxyGroups) ? context.proxyGroups : [] }
]);

// geo 阶段产物会被 analysis/result/diagnostics/finalize 多处复用，这里统一做一次字段裁剪和基础兜底。
function buildMainGeoPayloadArtifacts(geoArtifacts) {
  return buildDefinitionDrivenPayload(MAIN_GEO_PAYLOAD_ARTIFACT_DEFINITIONS, geoArtifacts);
}

// rule 阶段复用字段也统一定义，避免后续更多 payload builder 接入时重复写同一套裁剪逻辑。
const MAIN_RULE_PAYLOAD_ARTIFACT_DEFINITIONS = Object.freeze([
  { key: "finalRuleDefinitions", value: (context) => context.finalRuleDefinitions },
  { key: "generatedRules", value: (context) => Array.isArray(context.generatedRules) ? context.generatedRules : [] },
  { key: "rules", value: (context) => Array.isArray(context.rules) ? context.rules : [] },
  { key: "ruleAnalysis", value: (context) => context.ruleAnalysis }
]);

// rule 阶段产物同样会被多段 payload builder 复用，这里统一裁剪，减少每处重复解构。
function buildMainRulePayloadArtifacts(ruleArtifacts) {
  return buildDefinitionDrivenPayload(MAIN_RULE_PAYLOAD_ARTIFACT_DEFINITIONS, ruleArtifacts);
}

// analysis-stage 只消费这几项 geo/rule/configuredRules 字段，统一定义后便于继续扩展而不回到平铺对象。
const MAIN_ANALYSIS_STAGE_PAYLOAD_DEFINITIONS = Object.freeze([
  { key: "proxyGroups", value: (context, geoPayloadArtifacts) => geoPayloadArtifacts.proxyGroups },
  { key: "countryConfigs", value: (context, geoPayloadArtifacts) => geoPayloadArtifacts.countryConfigs },
  { key: "preferredCountryStates", value: (context, geoPayloadArtifacts) => geoPayloadArtifacts.preferredCountryStates },
  { key: "finalRuleDefinitions", value: (context, geoPayloadArtifacts, rulePayloadArtifacts) => rulePayloadArtifacts.finalRuleDefinitions },
  { key: "rules", value: (context, geoPayloadArtifacts, rulePayloadArtifacts) => rulePayloadArtifacts.rules },
  { key: "generatedRules", value: (context, geoPayloadArtifacts, rulePayloadArtifacts) => rulePayloadArtifacts.generatedRules },
  { key: "configuredRules", value: (context) => Array.isArray(context.configuredRules) ? context.configuredRules : [] },
  { key: "ruleAnalysis", value: (context, geoPayloadArtifacts, rulePayloadArtifacts) => rulePayloadArtifacts.ruleAnalysis }
]);

// 分析阶段只消费 geo/rule 两批产物中的少数字段，这里统一装配，减少 main 中的跨阶段解构噪音。
function buildMainAnalysisStagePayload(payload) {
  const context = isObject(payload) ? payload : {};
  const geoPayloadArtifacts = buildMainGeoPayloadArtifacts(context.geoArtifacts);
  const rulePayloadArtifacts = buildMainRulePayloadArtifacts(context.ruleArtifacts);

  return buildDefinitionDrivenPayload(
    MAIN_ANALYSIS_STAGE_PAYLOAD_DEFINITIONS,
    context,
    geoPayloadArtifacts,
    rulePayloadArtifacts
  );
}

// validate 阶段只复用这几个分析结果，统一定义后后续若新增缓存字段可直接扩表。
const VALIDATION_ANALYSIS_CACHE_DEFINITIONS = Object.freeze([
  { key: "regionVisibility", value: (context) => context.regionVisibility },
  { key: "rulePriorityRisks", value: (context) => context.rulePriorityRisks },
  { key: "proxyGroupPriorityRisks", value: (context) => context.proxyGroupPriorityRisks }
]);

// validate 阶段只需要复用少数几个预计算分析结果，这里单独裁剪成 cache，避免 main 里手写挑字段。
function buildValidationAnalysisCache(payload) {
  return buildDefinitionDrivenPayload(VALIDATION_ANALYSIS_CACHE_DEFINITIONS, payload);
}

// diagnostics supplement 额外依赖的 provider mutation / normalized state 字段也整理成定义表，避免再平铺展开。
const MAIN_DIAGNOSTICS_SUPPLEMENT_CONTEXT_DEFINITIONS = Object.freeze([
  { key: "normalizedProxyState", value: (context) => context.normalizedProxyState },
  { key: "ruleProviderMutationStats", value: (context, providerArtifacts) => providerArtifacts.ruleProviderMutationStats },
  { key: "proxyProviderMutationStats", value: (context, providerArtifacts) => providerArtifacts.proxyProviderMutationStats },
  { key: "ruleProviderMutationPreview", value: (context, providerArtifacts) => providerArtifacts.ruleProviderMutationPreview },
  { key: "proxyProviderMutationPreview", value: (context, providerArtifacts) => providerArtifacts.proxyProviderMutationPreview }
]);

// diagnostics supplement 还需要 provider mutation / analysis 原始对象等额外上下文，这里统一装配，避免后面重复展开。
function buildMainDiagnosticsSupplementContext(payload) {
  const context = isObject(payload) ? payload : {};
  const assemblyContext = buildMainPayloadAssemblyContext(context);
  const providerArtifacts = isObject(context.providerArtifacts)
    ? context.providerArtifacts
    : assemblyContext.providerArtifacts;

  return Object.assign(
    buildDefinitionDrivenPayload(MAIN_DIAGNOSTICS_SUPPLEMENT_CONTEXT_DEFINITIONS, context, providerArtifacts),
    assemblyContext.summaryPayloadContext,
    isObject(context.analysisArtifacts) ? context.analysisArtifacts : {}
  );
}

// diagnostics 补字段最终会合并 supplement 与国家优先链摘要，这里统一装配，避免 buildMainDiagnosticsArtifacts 再写一段 Object.assign。
function buildMainDiagnosticsSupplementArtifacts(payload) {
  const context = isObject(payload) ? payload : {};
  return Object.assign(
    buildDiagnosticsSupplement(
      buildDiagnosticsSupplementPayload(buildMainDiagnosticsSupplementContext(context))
    ),
    isObject(context.preferredCountrySummaryPayload) ? context.preferredCountrySummaryPayload : {}
  );
}

// diagnostics 校验阶段真正喂给 validateGeneratedArtifacts 的字段也固定成一份 definitions，避免继续手写长参数列表。
const MAIN_DIAGNOSTICS_VALIDATION_PAYLOAD_DEFINITIONS = Object.freeze([
  { key: "proxies", value: (context) => Array.isArray(context.proxies) ? context.proxies : [] },
  { key: "proxyGroups", value: (context) => Array.isArray(context.proxyGroups) ? context.proxyGroups : [] },
  { key: "resultRuleProviders", value: (context) => context.result && context.result["rule-providers"] },
  { key: "result", value: (context) => context.result },
  { key: "dns", value: (context) => context.dns },
  { key: "countryConfigs", value: (context) => context.countryConfigs },
  { key: "finalRuleDefinitions", value: (context) => context.finalRuleDefinitions },
  { key: "configuredRules", value: (context) => context.configuredRules },
  { key: "analysisCache", value: (context) => buildValidationAnalysisCache(context.analysisArtifacts) }
]);

// 把 diagnostics 校验输入裁成固定 payload，后续不管 validate helper 还是阶段执行器都统一只认这一份结构。
function buildMainDiagnosticsValidationPayload(payload) {
  return buildDefinitionDrivenPayload(MAIN_DIAGNOSTICS_VALIDATION_PAYLOAD_DEFINITIONS, payload);
}

// validateGeneratedArtifacts 参数很多，这里单独收口成 helper，减少 diagnostics 阶段里那串长参数调用。
function runMainDiagnosticsValidation(payload) {
  const context = isObject(payload) ? payload : {};
  return validateGeneratedArtifacts(
    context.proxies,
    context.proxyGroups,
    context.resultRuleProviders,
    context.result,
    context.dns,
    context.countryConfigs,
    context.finalRuleDefinitions,
    context.configuredRules,
    context.analysisCache
  );
}

// diagnostics 最终都会经历“原始校验结果 + supplement”这一步，这里单独收口，便于继续扩展后处理字段。
function finalizeMainDiagnosticsArtifacts(diagnostics, supplementArtifacts) {
  return Object.assign(
    isObject(diagnostics) ? diagnostics : {},
    isObject(supplementArtifacts) ? supplementArtifacts : {}
  );
}

// diagnostics 阶段也整理成顺序定义：校验输入 -> 原始 diagnostics -> supplement -> 最终合并结果。
const MAIN_DIAGNOSTICS_ARTIFACT_DEFINITIONS = Object.freeze([
  {
    key: "validationPayload",
    value: (context) => buildMainDiagnosticsValidationPayload(context)
  },
  {
    key: "diagnostics",
    value: (context) => runMainDiagnosticsValidation(context.validationPayload)
  },
  {
    key: "supplementArtifacts",
    value: (context) => buildMainDiagnosticsSupplementArtifacts(context)
  },
  {
    key: "finalDiagnostics",
    value: (context) => finalizeMainDiagnosticsArtifacts(context.diagnostics, context.supplementArtifacts)
  }
]);

// diagnostics 阶段顺序产物统一在这里执行，保持 buildMainDiagnosticsArtifacts 本体只做返回值收口。
function buildMainDiagnosticsExecutionArtifacts(payload) {
  return buildSequentialDefinitionPayload(
    MAIN_DIAGNOSTICS_ARTIFACT_DEFINITIONS,
    isObject(payload) ? payload : {},
    buildSequentialStageExecutionContext
  );
}

// 主流程里的 diagnostics 阶段：统一完成最终产物校验、补齐派生 diagnostics 字段与国家优先链摘要。
function buildMainDiagnosticsArtifacts(payload) {
  return buildMainDiagnosticsExecutionArtifacts(payload).finalDiagnostics;
}

// diagnostics 副作用里“是否回写响应头”有固定判断逻辑，这里单独收口，避免 finalizeMainDiagnostics 内联三元模板。
function resolveMainDiagnosticsResponseHeadersApplied(diagnostics) {
  if (!(ARGS.hasResponseHeaders ? ARGS.responseHeaders : false)) {
    return false;
  }

  return setRuntimeResponseHeaders(RAW_OPTIONS, buildRuntimeResponseHeaders(diagnostics));
}

// diagnostics 副作用也继续 definitions 化：目前只有响应头回写结果和日志输出两项，后续扩展不必回到 finalizeMainDiagnostics 里平铺。
const MAIN_DIAGNOSTICS_SIDE_EFFECT_DEFINITIONS = Object.freeze([
  {
    key: "responseHeadersApplied",
    value: (context) => resolveMainDiagnosticsResponseHeadersApplied(context.diagnostics)
  },
  {
    key: "logged",
    value: (context) => {
      logDiagnostics(context.diagnostics);
      return true;
    }
  }
]);

// diagnostics 副作用集中在这里执行，调用方只消费真正有意义的响应头回写结果。
function buildMainDiagnosticsSideEffectArtifacts(payload) {
  return buildDefinitionDrivenPayload(MAIN_DIAGNOSTICS_SIDE_EFFECT_DEFINITIONS, {
    diagnostics: isObject(payload) ? payload : {}
  });
}

// diagnostics 阶段的副作用统一收敛：响应头回写 + 诊断日志输出。
function finalizeMainDiagnostics(diagnostics) {
  return buildMainDiagnosticsSideEffectArtifacts(diagnostics).responseHeadersApplied;
}

// pipeline / diagnostics 等阶段都只需要“规范化后的 config.rules”，这里统一收口避免重复 Array.isArray 判断。
function buildMainConfiguredRules(config) {
  const currentConfig = isObject(config) ? config : {};
  return Array.isArray(currentConfig.rules) ? currentConfig.rules : [];
}

// 主流程里的 DNS / Sniffer / 通用内核默认项统一归到同一阶段，减少 main 里分散的三段构建调用。
const MAIN_CORE_CONFIG_ARTIFACT_DEFINITIONS = Object.freeze([
  { key: "dns", value: (context, currentConfig) => buildDnsConfig(currentConfig.dns) },
  { key: "sniffer", value: (context, currentConfig) => buildSnifferConfig(currentConfig.sniffer) },
  { key: "kernelDefaults", value: (context, currentConfig) => buildKernelDefaults(currentConfig) }
]);

// core config 阶段只依赖 currentConfig，这里也改成 definitions 驱动，和 pipeline 其它阶段保持一致。
function buildMainCoreConfigArtifacts(payload) {
  const context = isObject(payload) ? payload : {};
  const currentConfig = isObject(context.config) ? context.config : {};
  return buildDefinitionDrivenPayload(MAIN_CORE_CONFIG_ARTIFACT_DEFINITIONS, context, currentConfig);
}

// provider 阶段除了最终 providers 外，其余 mutation 统计/预览都遵循同一装配模式，统一定义后避免重复模板。
const MAIN_PROVIDER_MUTATION_ARTIFACT_DEFINITIONS = Object.freeze([
  { key: "ruleProviderMutationStats", value: (context) => analyzeRuleProviderMutationStats(context.existingRuleProviders, context.finalRuleProviders) },
  { key: "proxyProviderMutationStats", value: (context) => analyzeProxyProviderMutationStats(context.existingProxyProviders, context.proxyProviders) },
  { key: "ruleProviderMutationPreview", value: (context) => analyzeRuleProviderMutationPreview(context.existingRuleProviders, context.finalRuleProviders) },
  { key: "proxyProviderMutationPreview", value: (context) => analyzeProxyProviderMutationPreview(context.existingProxyProviders, context.proxyProviders) }
]);

// provider 阶段真正依赖的输入源统一先裁剪出来，后续 result/mutation 都只消费这份 source payload。
const MAIN_PROVIDER_SOURCE_DEFINITIONS = Object.freeze([
  { key: "currentConfig", value: (context) => isObject(context.config) ? context.config : {} },
  {
    key: "existingProxyProviders",
    value: (context, currentConfig) => currentConfig["proxy-providers"]
  },
  {
    key: "existingRuleProviders",
    value: (context, currentConfig) => currentConfig["rule-providers"]
  },
  {
    key: "generatedRuleProviders",
    value: (context) => isObject(context.generatedRuleProviders) ? context.generatedRuleProviders : {}
  }
]);

// provider 阶段的核心结果字段也单独 definitions 化，避免 buildMainProviderArtifacts 继续手写两段结果对象。
const MAIN_PROVIDER_RESULT_DEFINITIONS = Object.freeze([
  { key: "proxyProviders", value: (context) => finalizeProxyProviders(context.existingProxyProviders) },
  { key: "finalRuleProviders", value: (context) => mergeRuleProviders(context.existingRuleProviders, context.generatedRuleProviders) }
]);

// provider 阶段也整理成顺序产物：source -> result -> mutation -> final merge。
const MAIN_PROVIDER_EXECUTION_ARTIFACT_DEFINITIONS = Object.freeze([
  {
    key: "providerSourcePayload",
    value: (context) => buildMainProviderSourcePayload(context)
  },
  {
    key: "providerResultPayload",
    value: (context) => buildDefinitionDrivenPayload(
      MAIN_PROVIDER_RESULT_DEFINITIONS,
      context.providerSourcePayload
    )
  },
  {
    key: "providerMutationArtifacts",
    value: (context) => buildDefinitionDrivenPayload(
      MAIN_PROVIDER_MUTATION_ARTIFACT_DEFINITIONS,
      Object.assign(
        {},
        isObject(context.providerSourcePayload) ? context.providerSourcePayload : {},
        isObject(context.providerResultPayload) ? context.providerResultPayload : {}
      )
    )
  },
  {
    key: "finalProviderArtifacts",
    value: (context) => Object.assign(
      {},
      isObject(context.providerResultPayload) ? context.providerResultPayload : {},
      isObject(context.providerMutationArtifacts) ? context.providerMutationArtifacts : {}
    )
  }
]);

// provider source payload 统一在这里装配，减少后续多个 builder 各自解构 config/generator。
function buildMainProviderSourcePayload(payload) {
  const context = isObject(payload) ? payload : {};
  const currentConfig = isObject(context.config) ? context.config : {};
  return buildDefinitionDrivenPayload(MAIN_PROVIDER_SOURCE_DEFINITIONS, context, currentConfig);
}

// pipeline 真正需要的输入源目前只有 config/proxies，两项统一收口后，后续若继续插入 stage source 就不必回到 buildMainPipelineArtifacts。
const MAIN_PIPELINE_SOURCE_DEFINITIONS = Object.freeze([
  { key: "currentConfig", value: (context) => isObject(context.config) ? context.config : {} },
  { key: "proxies", value: (context) => Array.isArray(context.proxies) ? context.proxies : [] }
]);

// pipeline stageContext 也继续定义化：基础输入 + 规则配置 + rule-provider 生成器，避免 buildMainPipelineArtifacts 再手写局部对象。
const MAIN_PIPELINE_STAGE_CONTEXT_DEFINITIONS = Object.freeze([
  { key: "currentConfig", value: (context, sourcePayload) => sourcePayload.currentConfig },
  { key: "proxies", value: (context, sourcePayload) => sourcePayload.proxies },
  { key: "configuredRules", value: (context, sourcePayload) => buildMainConfiguredRules(sourcePayload.currentConfig) },
  { key: "generatedRuleProviders", value: () => ruleProviders }
]);

// pipeline 源输入先统一裁成固定结构，减少后续 stageContext/执行器重复处理 config/proxies。
function buildMainPipelineSourcePayload(payload) {
  return buildDefinitionDrivenPayload(MAIN_PIPELINE_SOURCE_DEFINITIONS, payload);
}

// pipeline 顺序阶段共用同一个 stageContext，这里提前定义化，避免 buildMainPipelineArtifacts 继续维护字面量模板。
function buildMainPipelineStageContext(payload) {
  const context = isObject(payload) ? payload : {};
  const sourcePayload = buildMainPipelineSourcePayload(context);
  return buildDefinitionDrivenPayload(
    MAIN_PIPELINE_STAGE_CONTEXT_DEFINITIONS,
    context,
    sourcePayload
  );
}

// pipeline 前半段的阶段顺序固定，统一定义后便于继续扩展而不把 buildMainPipelineArtifacts 拉成长模板。
const MAIN_PIPELINE_STAGE_DEFINITIONS = Object.freeze([
  {
    key: "geoArtifacts",
    value: (context) => buildMainGeoArtifacts({
      proxies: context.proxies,
      config: context.currentConfig
    })
  },
  {
    key: "ruleArtifacts",
    value: (context) => buildMainRuleArtifacts({
      proxyGroups: context.geoArtifacts && context.geoArtifacts.proxyGroups,
      configuredRules: context.configuredRules
    })
  },
  {
    key: "analysisArtifacts",
    value: (context) => buildMainAnalysisArtifacts(buildMainAnalysisStagePayload({
      geoArtifacts: context.geoArtifacts,
      ruleArtifacts: context.ruleArtifacts,
      configuredRules: context.configuredRules
    }))
  },
  {
    key: "coreConfigArtifacts",
    value: (context) => buildMainCoreConfigArtifacts({
      config: context.currentConfig
    })
  },
  {
    key: "providerArtifacts",
    value: (context) => buildMainProviderArtifacts({
      config: context.currentConfig,
      generatedRuleProviders: context.generatedRuleProviders
    })
  }
]);

// 顺序阶段大多都遵循“初始上下文 + 已产出的前序结果”浅合并的模式，这里抽成通用 helper，供主流程/策略组等单文件模块共用。
function buildSequentialStageExecutionContext(baseContext, stageArtifacts) {
  return Object.assign({}, isObject(baseContext) ? baseContext : {}, isObject(stageArtifacts) ? stageArtifacts : {});
}

// 主流程前半段的顺序产物统一在这里串起来，避免 main 中逐阶段展开太多中间变量。
function buildMainPipelineArtifacts(payload) {
  return buildSequentialDefinitionPayload(
    MAIN_PIPELINE_STAGE_DEFINITIONS,
    buildMainPipelineStageContext(payload),
    buildSequentialStageExecutionContext
  );
}

// 统一完成 provider 阶段：proxy-provider 补强、rule-provider 合并，以及两者 mutation 统计/预览。
function buildMainProviderExecutionArtifacts(payload) {
  return buildSequentialDefinitionPayload(
    MAIN_PROVIDER_EXECUTION_ARTIFACT_DEFINITIONS,
    isObject(payload) ? payload : {},
    buildSequentialStageExecutionContext
  );
}

// 统一完成 provider 阶段：proxy-provider 补强、rule-provider 合并，以及两者 mutation 统计/预览。
function buildMainProviderArtifacts(payload) {
  return buildMainProviderExecutionArtifacts(payload).finalProviderArtifacts;
}

// diagnostics 阶段需要的上下文较多，这里按阶段产物统一装配，避免 main 中维护长对象字面量。
const MAIN_DIAGNOSTICS_PAYLOAD_DEFINITIONS = Object.freeze([
  { key: "proxies", value: (context, assemblyContext) => assemblyContext.proxies },
  { key: "result", value: (context) => context.result },
  { key: "dns", value: (context, assemblyContext) => assemblyContext.coreConfigArtifacts.dns },
  { key: "finalRuleDefinitions", value: (context, assemblyContext) => assemblyContext.rulePayloadArtifacts.finalRuleDefinitions },
  { key: "configuredRules", value: (context, assemblyContext) => assemblyContext.configuredRules },
  { key: "analysisArtifacts", value: (context) => context.analysisArtifacts },
  { key: "normalizedProxyState", value: (context) => context.normalizedProxyState },
  {
    key: "providerArtifacts",
    value: (context, assemblyContext) => isObject(context.providerArtifacts)
      ? context.providerArtifacts
      : assemblyContext.providerArtifacts
  }
]);

// diagnostics 阶段需要的上下文较多，这里按阶段产物统一装配，避免 main 中维护长对象字面量。
function buildMainDiagnosticsPayload(payload) {
  return buildMainSummaryScopedPayload(payload, MAIN_DIAGNOSTICS_PAYLOAD_DEFINITIONS, {
    includeAssemblyContext: true,
    includeSummaryPayloadContext: true
  });
}

// geo 阶段本身也是顺序产物：后面的 countrySummary/regionConfigs/proxyGroups 依赖前序结果，这里统一定义执行顺序。
const MAIN_GEO_ARTIFACT_DEFINITIONS = Object.freeze([
  { key: "proxyStats", value: (context) => analyzeProxies(context.proxies) },
  { key: "countryCoverage", value: (context) => analyzeCountryCoverage(context.proxies) },
  { key: "countryConfigs", value: (context) => parseCountries(context.proxies) },
  { key: "countrySummary", value: (context) => buildCountrySummary(context.countryConfigs) },
  { key: "preferredCountryStates", value: (context) => resolveServicePreferredCountryStates(context.countryConfigs) },
  { key: "preferredCountrySummaryPayload", value: (context) => buildServicePreferredCountrySummaryPayload(context.preferredCountryStates) },
  { key: "regionConfigs", value: (context) => buildRegionGroupConfigs(context.countryConfigs, ARGS.regionGroupKeys) },
  { key: "regionGroupSummary", value: (context) => buildRegionGroupSummary(context.regionConfigs) },
  {
    key: "proxyGroups",
    value: (context) => buildProxyGroups(
      context.proxies,
      context.countryConfigs,
      context.regionConfigs,
      context.proxyStats.lowCost > 0,
      context.currentConfig["proxy-groups"],
      context.currentConfig["proxy-providers"]
    )
  }
]);

// 主流程里的国家/区域/策略组准备阶段：统一完成节点统计、国家识别、区域聚合与策略组生成。
function buildMainGeoArtifacts(payload) {
  const context = isObject(payload) ? payload : {};
  return buildSequentialDefinitionPayload(MAIN_GEO_ARTIFACT_DEFINITIONS, {
    proxies: Array.isArray(context.proxies) ? context.proxies : [],
    currentConfig: isObject(context.config) ? context.config : {}
  });
}

// rule 阶段同样是顺序产物：availableTargets -> resolved definitions -> final rules -> analysis，统一定义后更便于扩展。
const MAIN_RULE_ARTIFACT_DEFINITIONS = Object.freeze([
  {
    key: "availableTargets",
    value: (context) => buildBuiltinAwareNameList(collectNamedEntries(context.proxyGroups))
  },
  { key: "resolvedRuleDefinitions", value: (context) => resolveRuleSetDefinitions(context.availableTargets) },
  { key: "finalRuleDefinitions", value: (context) => applyRuleSetDefinitionOrder(context.resolvedRuleDefinitions) },
  { key: "generatedRules", value: (context) => buildRules(ARGS.quic, context.finalRuleDefinitions) },
  { key: "rules", value: (context) => mergeRules(context.generatedRules, context.configuredRules, context.finalRuleDefinitions) },
  { key: "ruleAnalysis", value: (context) => analyzeRuleCollection(context.rules) }
]);

// 主流程里的规则准备阶段：统一完成规则入口目标解析、顺序重排、RULE-SET 生成、规则合并与规则缓存。
function buildMainRuleArtifacts(payload) {
  const context = isObject(payload) ? payload : {};
  const ruleArtifacts = buildSequentialDefinitionPayload(MAIN_RULE_ARTIFACT_DEFINITIONS, {
    proxyGroups: Array.isArray(context.proxyGroups) ? context.proxyGroups : [],
    configuredRules: Array.isArray(context.configuredRules) ? context.configuredRules : []
  });

  return {
    finalRuleDefinitions: ruleArtifacts.finalRuleDefinitions,
    generatedRules: ruleArtifacts.generatedRules,
    rules: ruleArtifacts.rules,
    ruleAnalysis: ruleArtifacts.ruleAnalysis
  };
}

// assemblyContext 里的字段本身也遵循固定裁剪模板，这里继续定义化，方便后续新增复用字段时不用回到平铺对象。
const MAIN_PAYLOAD_ASSEMBLY_CONTEXT_DEFINITIONS = Object.freeze([
  { key: "currentConfig", value: (context, currentConfig) => currentConfig },
  { key: "proxies", value: (context) => Array.isArray(context.proxies) ? context.proxies : [] },
  { key: "configuredRules", value: (context, currentConfig) => buildMainConfiguredRules(currentConfig) },
  { key: "rulePayloadArtifacts", value: (context) => buildMainRulePayloadArtifacts(context.ruleArtifacts) },
  { key: "coreConfigArtifacts", value: (context) => isObject(context.coreConfigArtifacts) ? context.coreConfigArtifacts : {} },
  { key: "providerArtifacts", value: (context) => isObject(context.providerArtifacts) ? context.providerArtifacts : {} },
  { key: "summaryPayloadContext", value: (context, currentConfig, summaryPayloadContext) => summaryPayloadContext }
]);

// assemblyContext 真正依赖的“外部输入源”目前只有 currentConfig 与 summaryPayloadContext，两项先统一装成 source payload。
const MAIN_PAYLOAD_ASSEMBLY_CONTEXT_SOURCE_DEFINITIONS = Object.freeze([
  { key: "currentConfig", value: (context) => isObject(context.config) ? context.config : {} },
  {
    key: "summaryPayloadContext",
    value: (context) => isObject(context.summaryPayloadContext)
      ? context.summaryPayloadContext
      : buildMainSummaryPayloadContext(context)
  }
]);

// result / diagnostics / finalize 都会先依赖这两项 assembly source，这里单独收口避免重复写两段局部变量。
function buildMainPayloadAssemblyContextSourcePayload(payload) {
  return buildDefinitionDrivenPayload(MAIN_PAYLOAD_ASSEMBLY_CONTEXT_SOURCE_DEFINITIONS, payload);
}

// result / diagnostics / finalize 三段都会消费同一批规范化输入，这里统一装配，减少多处重复取值。
function buildMainPayloadAssemblyContext(payload) {
  const context = isObject(payload) ? payload : {};
  // 若上游已经预先装配过 assemblyContext，就直接复用，避免 result/diagnostics/finalize 三段重复裁剪同一批阶段产物。
  if (isObject(context.assemblyContext)) {
    return context.assemblyContext;
  }

  const sourcePayload = buildMainPayloadAssemblyContextSourcePayload(context);

  return buildDefinitionDrivenPayload(
    MAIN_PAYLOAD_ASSEMBLY_CONTEXT_DEFINITIONS,
    context,
    sourcePayload.currentConfig,
    sourcePayload.summaryPayloadContext
  );
}

// result 阶段真正消费的字段也固定成一份 definitions，便于继续扩展而不用回到对象模板。
const MAIN_RESULT_PAYLOAD_DEFINITIONS = Object.freeze([
  { key: "config", value: (context) => context.config },
  { key: "kernelDefaults", value: (context, assemblyContext) => assemblyContext.coreConfigArtifacts.kernelDefaults },
  { key: "proxies", value: (context, assemblyContext) => assemblyContext.proxies },
  { key: "proxyGroups", value: (context, assemblyContext) => assemblyContext.summaryPayloadContext.proxyGroups },
  { key: "proxyProviders", value: (context, assemblyContext) => assemblyContext.providerArtifacts.proxyProviders },
  { key: "finalRuleProviders", value: (context, assemblyContext) => assemblyContext.providerArtifacts.finalRuleProviders },
  { key: "rules", value: (context, assemblyContext) => assemblyContext.rulePayloadArtifacts.rules },
  { key: "dns", value: (context, assemblyContext) => assemblyContext.coreConfigArtifacts.dns },
  { key: "sniffer", value: (context, assemblyContext) => assemblyContext.coreConfigArtifacts.sniffer }
]);

// result 阶段真正需要的是规则、策略组以及 core/provider 两批产物，这里统一装配，避免 main 里平铺长对象。
function buildMainResultPayload(payload) {
  const context = isObject(payload) ? payload : {};
  return buildDefinitionDrivenPayload(MAIN_RESULT_PAYLOAD_DEFINITIONS, context, buildMainPayloadAssemblyContext(context));
}

// 主流程最终结果里这批运行时字段都遵循“参数优先 / 保留原值 / 回落默认”的同类策略，统一收成定义表。
const MAIN_RESULT_RUNTIME_FIELD_DEFINITIONS = Object.freeze([
  {
    key: "mixed-port",
    value: (config) => hasOwn(config, "mixed-port") ? config["mixed-port"] : DEFAULT_MIXED_PORT
  },
  {
    key: "ipv6",
    value: () => ARGS.ipv6
  },
  {
    key: "allow-lan",
    value: (config) => hasOwn(config, "allow-lan") ? config["allow-lan"] : true
  },
  {
    key: "unified-delay",
    value: (config) => ARGS.hasUnifiedDelay ? ARGS.unifiedDelay : (hasOwn(config, "unified-delay") ? config["unified-delay"] : true)
  },
  {
    key: "tcp-concurrent",
    value: (config) => ARGS.hasTcpConcurrent ? ARGS.tcpConcurrent : (hasOwn(config, "tcp-concurrent") ? config["tcp-concurrent"] : true)
  }
]);

// 按统一定义装配主流程最终结果的运行时字段，避免 buildMainResultConfig 中散落多段同类优先级逻辑。
function buildDefinitionDrivenPayload(definitions, context) {
  const source = Array.isArray(definitions) ? definitions : [];
  const payload = {};
  // 从第三个实参开始都视为透传给 definition.value 的附加上下文。
  const args = Array.prototype.slice.call(arguments, 2);

  for (const definition of source) {
    const key = normalizeStringArg(definition && definition.key);
    if (!key || typeof (definition && definition.value) !== "function") {
      continue;
    }

    // 后续附加参数按顺序透传给 definition.value，供 geo/rule/summary 这类多阶段 builder 共享同一套装配器。
    payload[key] = definition.value.apply(null, [context].concat(args));
  }

  return payload;
}

// 这类按 kind 从注册表里取值的逻辑在 diagnostics/build-summary/response-header 多处复用，这里统一收成共享 helper。
function resolveKindRegistryValue(registry, kind) {
  const currentRegistry = isObject(registry) ? registry : {};
  const currentKind = normalizeStringArg(kind);
  return currentKind && hasOwn(currentRegistry, currentKind)
    ? currentRegistry[currentKind]
    : undefined;
}

// 若注册表项是函数，则统一按“kind -> handler(...args)”执行；不存在或不是函数时返回 undefined，调用方自行决定回退策略。
function executeKindRegistryHandler(registry, kind) {
  const handler = resolveKindRegistryValue(registry, kind);
  if (typeof handler !== "function") {
    return undefined;
  }

  return handler.apply(null, Array.prototype.slice.call(arguments, 2));
}

// 很多 builder 都先按 definitions 生成若干 object section，再按定义顺序浅合并成最终 payload，这里统一抽成共享 helper。
function mergeDefinitionDrivenSectionPayload(definitions, sections) {
  const source = Array.isArray(definitions) ? definitions : [];
  const currentSections = isObject(sections) ? sections : {};
  const payload = {};

  for (const definition of source) {
    const key = normalizeStringArg(definition && definition.key);
    if (!key || !isObject(currentSections[key])) {
      continue;
    }

    Object.assign(payload, currentSections[key]);
  }

  return payload;
}

// 对于存在前后依赖的阶段产物，按定义顺序逐个求值并把前序结果回灌上下文，减少顺序 builder 的平铺模板。
function buildSequentialDefinitionPayload(definitions, baseContext, contextBuilder) {
  const source = Array.isArray(definitions) ? definitions : [];
  const currentBaseContext = isObject(baseContext) ? baseContext : {};
  // 默认上下文构造器会把“基础上下文 + 已生成 payload”浅合并，适合大多数串行派生场景。
  const buildContext = typeof contextBuilder === "function"
    ? contextBuilder
    : ((context, payload) => Object.assign({}, context, payload));
  const payload = {};

  for (const definition of source) {
    const key = normalizeStringArg(definition && definition.key);
    if (!key || typeof (definition && definition.value) !== "function") {
      continue;
    }

    // 每一步都能读到前序已产出的字段，因此 definitions 的顺序本身就是依赖顺序。
    payload[key] = definition.value(buildContext(currentBaseContext, payload));
  }

  return payload;
}

// 按统一定义装配主流程最终结果的运行时字段，避免 buildMainResultConfig 中散落多段同类优先级逻辑。
function buildMainResultRuntimeFields(config) {
  const currentConfig = isObject(config) ? config : {};
  return buildDefinitionDrivenPayload(MAIN_RESULT_RUNTIME_FIELD_DEFINITIONS, currentConfig);
}

// proxy-providers 只有在原配置存在或补强后非空时才注入结果，这里单独抽出避免 buildMainResultConfig 内联条件模板。
function buildMainResultProviderFields(config, proxyProviders) {
  const currentConfig = isObject(config) ? config : {};
  const currentProxyProviders = isObject(proxyProviders) ? proxyProviders : {};

  if (!hasOwn(currentConfig, "proxy-providers") && Object.keys(currentProxyProviders).length === 0) {
    return {};
  }

  return {
    "proxy-providers": currentProxyProviders
  };
}

// result 阶段这批核心产物字段都直接来自主流程阶段输出，统一定义后便于继续扩展/裁剪。
const MAIN_RESULT_ARTIFACT_FIELD_DEFINITIONS = Object.freeze([
  { key: "proxies", value: (context) => Array.isArray(context.proxies) ? context.proxies : [] },
  { key: "proxy-groups", value: (context) => Array.isArray(context.proxyGroups) ? context.proxyGroups : [] },
  { key: "rule-providers", value: (context) => context.finalRuleProviders },
  { key: "rules", value: (context) => Array.isArray(context.rules) ? context.rules : [] },
  { key: "dns", value: (context) => context.dns },
  { key: "sniffer", value: (context) => context.sniffer }
]);

// 结果对象里除运行时字段外，这批核心产物字段始终来自主流程阶段产物，统一收成 helper 便于继续扩展。
function buildMainResultArtifactFields(payload) {
  return buildDefinitionDrivenPayload(MAIN_RESULT_ARTIFACT_FIELD_DEFINITIONS, payload);
}

// buildMainResultConfig 最终只是顺序合并几段固定 section，这里也定义化，避免后续继续回到大对象 spread 模板。
const MAIN_RESULT_CONFIG_SECTION_DEFINITIONS = Object.freeze([
  { key: "baseConfig", value: (context, currentConfig) => currentConfig },
  { key: "kernelDefaults", value: (context, currentConfig, currentKernelDefaults) => currentKernelDefaults },
  { key: "providerFields", value: (context, currentConfig) => buildMainResultProviderFields(currentConfig, context.proxyProviders) },
  { key: "artifactFields", value: (context) => buildMainResultArtifactFields(context) },
  { key: "runtimeFields", value: (context, currentConfig) => buildMainResultRuntimeFields(currentConfig) }
]);

// result config 各 section 的装配顺序是稳定的，这里集中生成，便于继续插入新的收尾 section。
function buildMainResultConfigSections(payload) {
  const context = isObject(payload) ? payload : {};
  const currentConfig = isObject(context.config) ? context.config : {};
  const currentKernelDefaults = isObject(context.kernelDefaults) ? context.kernelDefaults : {};
  return buildDefinitionDrivenPayload(
    MAIN_RESULT_CONFIG_SECTION_DEFINITIONS,
    context,
    currentConfig,
    currentKernelDefaults
  );
}

// 统一组装主流程最终输出的配置对象，集中管理 mixed-port / allow-lan / unified-delay / tcp-concurrent 等默认值策略。
function buildMainResultConfig(payload) {
  return mergeDefinitionDrivenSectionPayload(
    MAIN_RESULT_CONFIG_SECTION_DEFINITIONS,
    buildMainResultConfigSections(payload)
  );
}

// 根据参数与 full 模式决定是否需要注入 profile 缓存配置；不需要时返回 null，调用方可直接跳过。
function shouldApplyMainProfileConfig() {
  return ARGS.hasProfileCache
    ? ARGS.profileCache
    : (ARGS.hasProfileSelected || ARGS.hasProfileFakeIp || ARGS.full);
}

// profile 注入阶段只有两项脚本默认值，这里也整理成定义表，避免后续若新增 profile 字段时回到对象模板。
const MAIN_PROFILE_RUNTIME_FIELD_DEFINITIONS = Object.freeze([
  { key: "store-selected", value: () => ARGS.hasProfileSelected ? ARGS.profileSelected : true },
  { key: "store-fake-ip", value: () => ARGS.hasProfileFakeIp ? ARGS.profileFakeIp : true }
]);

// profile 注入阶段只有两项脚本默认值，这里统一收口，减少 buildMainProfileConfig 内内联模板。
function buildMainProfileRuntimeFields() {
  return buildDefinitionDrivenPayload(MAIN_PROFILE_RUNTIME_FIELD_DEFINITIONS, {});
}

// 根据参数与 full 模式决定是否需要注入 profile 缓存配置；不需要时返回 null，调用方可直接跳过。
function buildMainProfileConfig(payload) {
  const context = isObject(payload) ? payload : {};
  const currentConfig = isObject(context.config) ? context.config : {};

  if (!shouldApplyMainProfileConfig()) {
    return null;
  }

  // profile 字段采用“脚本默认值在前，原配置 profile 在后”的 merge 方式，让用户显式配置优先。
  return mergeObjects(buildMainProfileRuntimeFields(), currentConfig.profile);
}

// finalize / full-summary 这类收尾 builder 都要复用 assemblyContext + summaryPayloadContext，这里统一成单文件内的共享装配壳层。
function buildMainSummaryScopedPayload(payload, definitions, options) {
  const context = isObject(payload) ? payload : {};
  const currentOptions = isObject(options) ? options : {};
  const assemblyContext = isObject(currentOptions.assemblyContext)
    ? currentOptions.assemblyContext
    : buildMainPayloadAssemblyContext(context);
  const scopedPayload = {};

  if (currentOptions.includeAssemblyContext) {
    scopedPayload.assemblyContext = assemblyContext;
  }

  if (currentOptions.includeSummaryPayloadContext) {
    Object.assign(scopedPayload, assemblyContext.summaryPayloadContext);
  }

  return Object.assign(
    scopedPayload,
    buildDefinitionDrivenPayload(
      Array.isArray(definitions) ? definitions : [],
      context,
      assemblyContext
    )
  );
}

// summary payload 会同时消费 geo/rule/analysis 三批轻量 artifacts，这里统一先装成一个 sourceArtifacts 对象，避免多实参 builder 继续膨胀。
const MAIN_SUMMARY_SOURCE_ARTIFACT_DEFINITIONS = Object.freeze([
  { key: "geoPayloadArtifacts", value: (context) => buildMainGeoPayloadArtifacts(context.geoArtifacts) },
  { key: "rulePayloadArtifacts", value: (context) => buildMainRulePayloadArtifacts(context.ruleArtifacts) },
  { key: "analysisPayloadArtifacts", value: (context) => buildMainAnalysisPayloadArtifacts(context.analysisArtifacts) }
]);

// 收尾类 builder 只需要一份“geo/rule/analysis 轻量摘要”上下文，这里统一装配，避免每个调用点各自重复裁剪三次。
function buildMainSummarySourceArtifacts(payload) {
  return buildDefinitionDrivenPayload(MAIN_SUMMARY_SOURCE_ARTIFACT_DEFINITIONS, payload);
}

// 从 summary sourceArtifacts 中统一读取某个 artifact 字段，避免 definitions 里反复手写 `artifacts.xxx && artifacts.xxx.yyy`。
function resolveMainSummarySourceArtifactField(sourceArtifacts, artifactKey, fieldKey) {
  const currentArtifacts = isObject(sourceArtifacts) ? sourceArtifacts : {};
  const currentArtifact = isObject(artifactKey && currentArtifacts[artifactKey]) ? currentArtifacts[artifactKey] : {};
  return currentArtifact[normalizeStringArg(fieldKey)];
}

// summary payload 大部分字段都是“若 context 已显式给值就优先，否则回落到某个 artifact 字段”，这里统一成工厂减少重复模板。
function createMainSummaryPayloadContextDefinition(key, artifactKey, options) {
  const currentOptions = isObject(options) ? options : {};
  const outputKey = normalizeStringArg(key);
  const sourceKey = normalizeStringArg(currentOptions.sourceKey) || outputKey;
  const valueType = normalizeStringArg(currentOptions.valueType) || "own";

  return Object.freeze({
    key: outputKey,
    value: (context, sourceArtifacts) => {
      const current = isObject(context) ? context : {};
      const currentValue = current[outputKey];

      if (valueType === "array") {
        return Array.isArray(currentValue)
          ? currentValue
          : resolveMainSummarySourceArtifactField(sourceArtifacts, artifactKey, sourceKey);
      }

      if (valueType === "object") {
        return isObject(currentValue)
          ? currentValue
          : resolveMainSummarySourceArtifactField(sourceArtifacts, artifactKey, sourceKey);
      }

      return hasOwn(current, outputKey)
        ? currentValue
        : resolveMainSummarySourceArtifactField(sourceArtifacts, artifactKey, sourceKey);
    }
  });
}

// 收尾阶段与 diagnostics/full 日志会共同消费这批 geo/rule/analysis 摘要字段，统一改成工厂定义后更便于继续扩展。
const MAIN_SUMMARY_PAYLOAD_CONTEXT_DEFINITIONS = Object.freeze([
  createMainSummaryPayloadContextDefinition("proxyStats", "geoPayloadArtifacts"),
  createMainSummaryPayloadContextDefinition("countryConfigs", "geoPayloadArtifacts"),
  createMainSummaryPayloadContextDefinition("countrySummary", "geoPayloadArtifacts"),
  createMainSummaryPayloadContextDefinition("preferredCountrySummaryPayload", "geoPayloadArtifacts"),
  createMainSummaryPayloadContextDefinition("regionConfigs", "geoPayloadArtifacts"),
  createMainSummaryPayloadContextDefinition("regionGroupSummary", "geoPayloadArtifacts"),
  createMainSummaryPayloadContextDefinition("proxyGroups", "geoPayloadArtifacts", { valueType: "array" }),
  createMainSummaryPayloadContextDefinition("rules", "rulePayloadArtifacts", { valueType: "array" }),
  createMainSummaryPayloadContextDefinition("countryCoverage", "geoPayloadArtifacts"),
  createMainSummaryPayloadContextDefinition("analysisSummaryPayload", "analysisPayloadArtifacts", { valueType: "object" }),
  createMainSummaryPayloadContextDefinition("analysisSingleValuePayload", "analysisPayloadArtifacts", { valueType: "object" })
]);

// 收尾阶段与 full 日志都会复用同一批 geo/rule/analysis 摘要字段，这里统一裁剪，减少重复装配。
function buildMainSummaryPayloadContext(payload) {
  const context = isObject(payload) ? payload : {};
  // 允许调用方直接在 context 上覆盖某些摘要字段；definitions 会优先取显式传入值，再回落 summary sourceArtifacts。
  return buildDefinitionDrivenPayload(
    MAIN_SUMMARY_PAYLOAD_CONTEXT_DEFINITIONS,
    context,
    buildMainSummarySourceArtifacts(context)
  );
}

// finalize 阶段除 summaryPayloadContext 外只额外依赖这三项字段，统一成 definitions 后更便于复用。
const MAIN_FINALIZATION_PAYLOAD_DEFINITIONS = Object.freeze([
  { key: "config", value: (context) => context.config },
  { key: "diagnostics", value: (context) => context.diagnostics },
  { key: "responseHeadersApplied", value: (context) => context.responseHeadersApplied }
]);

// 主流程收尾阶段只需要 geo 摘要 + analysis 派生摘要，这里统一裁剪成最终日志/注入所需上下文。
function buildMainFinalizationPayload(payload) {
  return buildMainSummaryScopedPayload(payload, MAIN_FINALIZATION_PAYLOAD_DEFINITIONS, {
    includeAssemblyContext: true,
    includeSummaryPayloadContext: true
  });
}

// full 模式下的 log-level 解析也遵循“保留原值，否则回落默认”的固定策略，这里单独抽出便于复用。
function resolveMainFullLogLevel(config) {
  const currentConfig = isObject(config) ? config : {};
  return typeof currentConfig["log-level"] === "string" && currentConfig["log-level"]
    ? currentConfig["log-level"]
    : "info";
}

// full-summary 日志在 summaryPayloadContext 之外只额外依赖这三项字段，这里统一定义化以减少尾段对象模板。
const MAIN_FULL_SUMMARY_LOG_PAYLOAD_DEFINITIONS = Object.freeze([
  { key: "diagnostics", value: (context) => context.diagnostics },
  // 诊断摘要指标依赖 diagnostics 的派生统计；保持 definitions 化后，full 日志与响应头就能共享同一批上游产物。
  { key: "diagnosticsSummaryMetrics", value: (context) => buildFullSummaryDiagnosticMetrics(context.diagnostics) },
  // 响应头是否成功写回也一并塞进 full-summary，方便排查“日志有了但调试头没回写”的链路差异。
  { key: "responseHeadersApplied", value: (context) => context.responseHeadersApplied }
]);

// finalize 阶段写 full 日志前，统一把需要的上下文裁成 buildFullSummaryPayload 可直接消费的结构。
function buildMainFullSummaryLogPayload(payload) {
  return buildMainSummaryScopedPayload(payload, MAIN_FULL_SUMMARY_LOG_PAYLOAD_DEFINITIONS, {
    includeSummaryPayloadContext: true
  });
}

// full 模式收尾最终只产出 log-level 和 summary payload，定义化后便于继续扩展其它 full-only 字段。
const MAIN_FULL_RESULT_ARTIFACT_DEFINITIONS = Object.freeze([
  { key: "logLevel", value: (context) => resolveMainFullLogLevel(context.config) },
  { key: "fullSummaryPayload", value: (context) => buildFullSummaryPayload(buildMainFullSummaryLogPayload(context)) }
]);

// full 模式收尾只关心 log-level 与 summary payload，两项都集中在这里装配，避免 finalize 再各自拼接。
function buildMainFullResultArtifacts(payload) {
  return buildDefinitionDrivenPayload(MAIN_FULL_RESULT_ARTIFACT_DEFINITIONS, payload);
}

// result 收尾阶段只有 profile 注入与 full 日志收尾两条固定支线，这里也定义化，避免 finalizeMainResultArtifacts 再堆条件模板。
const MAIN_RESULT_FINALIZATION_ARTIFACT_DEFINITIONS = Object.freeze([
  {
    key: "profileConfig",
    value: (context) => buildMainProfileConfig({ config: context.config })
  },
  {
    key: "fullResultArtifacts",
    value: (context) => ARGS.full ? buildMainFullResultArtifacts(context) : null
  }
]);

// result 收尾统一在这里装配 profile/full 两批产物，后续若继续加收尾步骤只需扩 definitions。
function buildMainResultFinalizationArtifacts(payload) {
  return buildDefinitionDrivenPayload(MAIN_RESULT_FINALIZATION_ARTIFACT_DEFINITIONS, payload);
}

// profile 收尾单独抽出，避免 finalizeMainResultArtifacts 中内联 if + 赋值模板。
function applyMainResultProfileConfig(result, profileConfig) {
  const currentResult = isObject(result) ? result : {};
  if (profileConfig) {
    currentResult.profile = profileConfig;
  }
  return currentResult;
}

// full 模式收尾只负责 log-level 与 summary 日志输出；非 full 模式直接透传结果对象。
function applyMainFullResultArtifacts(result, fullResultArtifacts) {
  const currentResult = isObject(result) ? result : {};
  if (!ARGS.full || !isObject(fullResultArtifacts)) {
    return currentResult;
  }

  currentResult["log-level"] = fullResultArtifacts.logLevel;
  logBuildSummary(fullResultArtifacts.fullSummaryPayload);
  return currentResult;
}

// 统一处理主流程尾部的 profile 注入与 full 模式日志输出，减少 main 末尾的条件分支堆叠。
function finalizeMainResultArtifacts(result, payload) {
  const currentResult = isObject(result) ? result : {};
  const context = isObject(payload) ? payload : {};
  const finalizationArtifacts = buildMainResultFinalizationArtifacts(context);

  applyMainResultProfileConfig(currentResult, finalizationArtifacts.profileConfig);
  if (!ARGS.full) {
    return currentResult;
  }

  return applyMainFullResultArtifacts(currentResult, finalizationArtifacts.fullResultArtifacts);
}

// 主执行链的基础输入固定只有 config/proxies/normalizedProxyState，这里先单独定义化，便于后续 stage payload 复用。
const MAIN_EXECUTION_STAGE_BASE_FIELD_DEFINITIONS = Object.freeze([
  { key: "config", value: (context) => context.config },
  { key: "proxies", value: (context) => Array.isArray(context.proxies) ? context.proxies : [] },
  { key: "normalizedProxyState", value: (context) => isObject(context.normalizedProxyState) ? context.normalizedProxyState : {} }
]);

// 主执行链的 stage payload 始终由“基础输入 + pipelineArtifacts + 针对当前阶段的补充字段”三段组成，这里统一定义 section。
const MAIN_EXECUTION_STAGE_PAYLOAD_SECTION_DEFINITIONS = Object.freeze([
  { key: "baseFields", value: (context) => buildDefinitionDrivenPayload(MAIN_EXECUTION_STAGE_BASE_FIELD_DEFINITIONS, context) },
  { key: "pipelineFields", value: (context) => isObject(context.pipelineArtifacts) ? context.pipelineArtifacts : {} },
  { key: "extraFields", value: (context, currentExtraFields) => currentExtraFields }
]);

// 主执行链不同阶段都要共享同一份基础输入，这里先裁成 base payload，避免 result/diagnostics/finalize 各自重复处理。
function buildMainExecutionStageBasePayload(payload) {
  return buildDefinitionDrivenPayload(MAIN_EXECUTION_STAGE_BASE_FIELD_DEFINITIONS, isObject(payload) ? payload : {});
}

// 主执行链的 payload section 统一在这里装配，便于后续新增 result-only/diagnostics-only section 时继续扩展 definitions。
function buildMainExecutionStagePayloadSections(payload, extraFields) {
  const context = isObject(payload) ? payload : {};
  return buildDefinitionDrivenPayload(
    MAIN_EXECUTION_STAGE_PAYLOAD_SECTION_DEFINITIONS,
    context,
    isObject(extraFields) ? extraFields : {}
  );
}

// 某些执行阶段只是在基础 payload 之上补几项字段，这里统一按 definitions 构造 extraFields，避免每个阶段手写对象字面量。
function buildMainExecutionScopedPayload(payload, definitions) {
  const context = isObject(payload) ? payload : {};
  return buildMainExecutionStagePayload(
    context,
    buildDefinitionDrivenPayload(Array.isArray(definitions) ? definitions : [], context)
  );
}

// 主执行链在单文件内也统一走“基础载荷 + 已完成阶段产物”的装配方式，避免 main 末尾继续手写多段 Object.assign。
function buildMainExecutionStagePayload(payload, extraFields) {
  return mergeDefinitionDrivenSectionPayload(
    MAIN_EXECUTION_STAGE_PAYLOAD_SECTION_DEFINITIONS,
    buildMainExecutionStagePayloadSections(payload, extraFields)
  );
}

// result 阶段只需要在执行链基础载荷上补入 assemblyContext，一次定义后就不用在 MAIN_EXECUTION_ARTIFACT_DEFINITIONS 里重复写模板。
const MAIN_EXECUTION_RESULT_STAGE_EXTRA_FIELD_DEFINITIONS = Object.freeze([
  { key: "assemblyContext", value: (context) => context.assemblyContext }
]);

// diagnostics 阶段只额外依赖 result + assemblyContext，这里单独定义方便与 finalize 共享同一类 scoped payload 装配器。
const MAIN_EXECUTION_DIAGNOSTICS_STAGE_EXTRA_FIELD_DEFINITIONS = Object.freeze([
  { key: "result", value: (context) => context.result },
  { key: "assemblyContext", value: (context) => context.assemblyContext }
]);

// finalize 阶段只额外依赖 diagnostics/responseHeadersApplied/assemblyContext，这里定义化后可直接复用到最终收尾 helper。
const MAIN_EXECUTION_FINALIZATION_STAGE_EXTRA_FIELD_DEFINITIONS = Object.freeze([
  { key: "diagnostics", value: (context) => context.diagnostics },
  { key: "responseHeadersApplied", value: (context) => context.responseHeadersApplied },
  { key: "assemblyContext", value: (context) => context.assemblyContext }
]);

// 主入口在节点规范化之后还会经过 pipeline/result/diagnostics/finalize 这几段固定流程，这里也改成顺序定义驱动。
const MAIN_EXECUTION_ARTIFACT_DEFINITIONS = Object.freeze([
  {
    key: "pipelineArtifacts",
    value: (context) => buildMainPipelineArtifacts(buildMainExecutionStagePayload(context))
  },
  {
    key: "assemblyContext",
    value: (context) => buildMainPayloadAssemblyContext(buildMainExecutionStagePayload(context))
  },
  {
    key: "result",
    value: (context) => buildMainResultConfig(
      buildMainResultPayload(buildMainExecutionScopedPayload(
        context,
        MAIN_EXECUTION_RESULT_STAGE_EXTRA_FIELD_DEFINITIONS
      ))
    )
  },
  {
    key: "diagnostics",
    value: (context) => buildMainDiagnosticsArtifacts(
      buildMainDiagnosticsPayload(buildMainExecutionScopedPayload(
        context,
        MAIN_EXECUTION_DIAGNOSTICS_STAGE_EXTRA_FIELD_DEFINITIONS
      ))
    )
  },
  {
    key: "responseHeadersApplied",
    value: (context) => finalizeMainDiagnostics(context.diagnostics)
  }
]);

// 节点规范化完成后，剩余主流程统一由这组阶段产物驱动，保持单文件内的 main 入口更短、更聚焦。
function buildMainExecutionArtifacts(payload) {
  return buildSequentialDefinitionPayload(
    MAIN_EXECUTION_ARTIFACT_DEFINITIONS,
    buildMainExecutionStageBasePayload(payload),
    buildSequentialStageExecutionContext
  );
}

// 主执行链最终收尾只需要 result 本体与 finalize payload，这两项继续定义化后，finalizeMainExecutionResult 就只负责调用收尾器。
const MAIN_EXECUTION_FINALIZATION_SOURCE_DEFINITIONS = Object.freeze([
  { key: "result", value: (context) => isObject(context.result) ? context.result : {} },
  {
    key: "finalizationPayload",
    value: (context) => buildMainFinalizationPayload(buildMainExecutionScopedPayload(
      context,
      MAIN_EXECUTION_FINALIZATION_STAGE_EXTRA_FIELD_DEFINITIONS
    ))
  }
]);

// 主执行链的最终收尾 source payload 统一在这里装配，避免 finalizeMainExecutionResult 回到手动局部变量 + 内联 payload 模板。
function buildMainExecutionFinalizationSourcePayload(payload) {
  return buildDefinitionDrivenPayload(MAIN_EXECUTION_FINALIZATION_SOURCE_DEFINITIONS, isObject(payload) ? payload : {});
}

// 主流程最终返回值统一在这里收尾：复用已产出的 result/diagnostics/assemblyContext，避免 main 再手拼 finalize 载荷。
function finalizeMainExecutionResult(payload) {
  const sourcePayload = buildMainExecutionFinalizationSourcePayload(payload);
  finalizeMainResultArtifacts(sourcePayload.result, sourcePayload.finalizationPayload);
  return sourcePayload.result;
}

// full-summary 最终对象也由“基础摘要 + 国家优先链摘要 + diagnostics 指标”三段组成，这里统一成 section 定义便于继续扩展。
const FULL_SUMMARY_PAYLOAD_SECTION_DEFINITIONS = Object.freeze([
  { key: "summaryFields", value: (context) => buildDefinitionDrivenPayload(BUILD_FULL_SUMMARY_PAYLOAD_DEFINITIONS, context) },
  {
    key: "preferredCountrySummaryPayload",
    value: (context) => isObject(context.preferredCountrySummaryPayload) ? context.preferredCountrySummaryPayload : {}
  },
  {
    key: "diagnosticsSummaryMetrics",
    value: (context) => isObject(context.diagnosticsSummaryMetrics) ? context.diagnosticsSummaryMetrics : {}
  }
]);

// full-summary sections 统一在这里装配，避免 buildFullSummaryPayload 再手写多段 merge 顺序。
function buildFullSummaryPayloadSections(payload) {
  return buildDefinitionDrivenPayload(FULL_SUMMARY_PAYLOAD_SECTION_DEFINITIONS, isObject(payload) ? payload : {});
}

// 按统一定义从主流程上下文装配 full 日志 payload，减少 main 中那段长对象字面量的维护负担。
function buildFullSummaryPayload(payload) {
  return mergeDefinitionDrivenSectionPayload(
    FULL_SUMMARY_PAYLOAD_SECTION_DEFINITIONS,
    buildFullSummaryPayloadSections(payload)
  );
}

// 把 diagnostics 里的数量/Provider 摘要打平成 full 日志统计对象，减少 main 中对 length/format 的重复手写。
function buildMetricCountDefinitionPayload(definitions, context) {
  const source = Array.isArray(definitions) ? definitions : [];
  const current = isObject(context) ? context : {};
  const metrics = {};

  for (const definition of source) {
    const key = normalizeStringArg(definition && definition.key);
    if (!key) {
      continue;
    }

    metrics[key] = Array.isArray(current[key]) ? current[key].length : (Number(current[key]) || 0);
  }

  return metrics;
}

// buildProxyGroups 里这批固定功能组的构造完全由当前上下文决定，统一定义后减少大段平行 createXxxGroup 模板。
function createContextSelectGroupBuildDefinition(groupName, contextKey) {
  return {
    build: (context) => createSelectGroup(groupName, context[contextKey])
  };
}

// 静态 select 组直接复用预先给定的代理列表，不再读取运行时 context。
function createStaticSelectGroupBuildDefinition(groupName, proxies) {
  return {
    build: () => createSelectGroup(groupName, proxies)
  };
}

// latency 组从 context 读取指定代理列表，再包装成 URLTest/Fallback 风格策略组。
function createContextLatencyGroupBuildDefinition(groupName, contextKey) {
  return {
    build: (context) => createProxyListLatencyGroup(groupName, context[contextKey])
  };
}

// 服务型策略组直接消费前面生成好的 service artifact，避免这里重复解析服务参数。
function createServiceArtifactGroupBuildDefinition(serviceKey) {
  return {
    build: (context) => createProxyGroupServiceArtifactGroup(isObject(context.serviceArtifacts) ? context.serviceArtifacts[serviceKey] : null)
  };
}

// 条件策略组只有在 predicate 命中时才真正生成，适合开关型/按需型分组。
function createConditionalProxyGroupBuildDefinition(predicate, builder) {
  return {
    build: (context) => {
      const current = isObject(context) ? context : {};
      return typeof predicate === "function" && predicate(current)
        ? (typeof builder === "function" ? builder(current) : null)
        : null;
    }
  };
}

// 某些策略组需要对 context 中的一组条目逐个映射生成，这里统一封装批量映射逻辑。
function createMappedContextProxyGroupBuildDefinition(contextKey, builder) {
  return {
    build: (context) => {
      const current = isObject(context) ? context : {};
      return (Array.isArray(current[contextKey]) ? current[contextKey] : [])
        .map((item) => typeof builder === "function" ? builder(item, current) : null);
    }
  };
}

// 这批 definitions 会被分成几个显式 section 来维护顺序；最终仍会拍平成旧的扁平数组，保证运行期行为不变。
function flattenBuildDefinitionSections(sections) {
  const items = [];
  for (const section of Array.isArray(sections) ? sections : []) {
    if (Array.isArray(section)) {
      items.push.apply(items, section);
    }
  }
  return items;
}

// 固定策略组生成计划按“主链 -> 业务服务 -> 流媒体 -> 兜底/内置”拆成 section，后续调顺序时不用再在一个超长数组里找位置。
const PROXY_GROUP_FIXED_GROUP_DEFINITION_SECTIONS = Object.freeze([
  Object.freeze([
    createContextSelectGroupBuildDefinition(GROUPS.SELECT, "baseProxies"),
    { build: () => createIncludeAllSelectGroup(GROUPS.MANUAL) },
    createContextLatencyGroupBuildDefinition(GROUPS.FALLBACK, "fallbackProxies")
  ]),
  Object.freeze([
    createContextSelectGroupBuildDefinition(GROUPS.AI, "aiProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.TELEGRAM, "baseProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.DISCORD, "baseProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.WHATSAPP, "baseProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.LINE, "baseProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.TWITTER, "baseProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.INSTAGRAM, "baseProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.FACEBOOK, "baseProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.REDDIT, "baseProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.GOOGLE, "baseProxies"),
    createServiceArtifactGroupBuildDefinition("github"),
    createServiceArtifactGroupBuildDefinition("dev"),
    createContextSelectGroupBuildDefinition(GROUPS.MICROSOFT, "baseProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.ONEDRIVE, "baseProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.GAMES, "baseProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.PAYPAL, "baseProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.BING, "directFirstProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.APPLE, "directFirstProxies"),
    createServiceArtifactGroupBuildDefinition("steam"),
    createContextSelectGroupBuildDefinition(GROUPS.PT, "directFirstProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.SPEEDTEST, "directFirstProxies")
  ]),
  Object.freeze([
    createContextSelectGroupBuildDefinition(GROUPS.YOUTUBE, "mediaProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.NETFLIX, "mediaProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.DISNEY, "mediaProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.SPOTIFY, "mediaProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.TIKTOK, "mediaProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.STREAMING, "mediaProxies"),
    createContextSelectGroupBuildDefinition(GROUPS.CRYPTO, "cryptoProxies")
  ]),
  Object.freeze([
    createStaticSelectGroupBuildDefinition(GROUPS.ADS, ["REJECT", "REJECT-DROP", GROUPS.DIRECT]),
    createStaticSelectGroupBuildDefinition(GROUPS.DIRECT, [BUILTIN_DIRECT, GROUPS.SELECT])
  ])
]);
const PROXY_GROUP_FIXED_GROUP_DEFINITIONS = Object.freeze(
  flattenBuildDefinitionSections(PROXY_GROUP_FIXED_GROUP_DEFINITION_SECTIONS)
);
// fixed group 之后还有一批“按条件/按国家/按区域追加”的组，也按 section 管理，后续调试国家/区域/兜底顺序时更直观。
const PROXY_GROUP_EXTRA_GROUP_DEFINITION_SECTIONS = Object.freeze([
  Object.freeze([
    createConditionalProxyGroupBuildDefinition(
      (context) => context.landingEnabled,
      () => createIncludeAllSelectGroup(GROUPS.LANDING, composeCaseInsensitivePattern([REGEX_LANDING_ISOLATE.source]))
    ),
    createConditionalProxyGroupBuildDefinition(
      (context) => context.hasLowCost,
      () => createIncludeAllLatencyGroup(GROUPS.LOW_COST, composeCaseInsensitivePattern([REGEX_LOW_COST.source]), "", "url-test")
    )
  ]),
  Object.freeze([
    createMappedContextProxyGroupBuildDefinition("countryConfigs", (country, context) => createIncludeAllLatencyGroup(
        country.name,
        country.filter,
        context.countryExcludeFilter,
        context.countryGroupType
      )
    ),
    createMappedContextProxyGroupBuildDefinition("resolvedRegionConfigs", (region) => createSelectGroup(region.name, region.proxies))
  ]),
  Object.freeze([
    {
      build: (context) => createIncludeAllSelectGroup(GROUPS.OTHER, "", context.otherExcludeFilter)
    }
  ])
]);
const PROXY_GROUP_EXTRA_GROUP_DEFINITIONS = Object.freeze(
  flattenBuildDefinitionSections(PROXY_GROUP_EXTRA_GROUP_DEFINITION_SECTIONS)
);

// diagnostics summary metrics 同样由“计数类指标 + 额外格式化指标”两段组成，改成 section 后可继续复用共享 merge helper。
const FULL_SUMMARY_DIAGNOSTIC_METRIC_SECTION_DEFINITIONS = Object.freeze([
  {
    key: "warningMetrics",
    value: (context) => buildMetricCountDefinitionPayload(BUILD_SUMMARY_WARNING_METRIC_DEFINITIONS, context)
  },
  {
    key: "extraMetrics",
    value: (context) => buildDefinitionDrivenPayload(FULL_SUMMARY_DIAGNOSTIC_EXTRA_METRIC_DEFINITIONS, context)
  }
]);

// diagnostics summary metrics 的各 section 统一在这里装配，便于后续新增其它 full-only 指标段。
function buildFullSummaryDiagnosticMetricSections(diagnostics) {
  return buildDefinitionDrivenPayload(
    FULL_SUMMARY_DIAGNOSTIC_METRIC_SECTION_DEFINITIONS,
    isObject(diagnostics) ? diagnostics : {}
  );
}

// 把 diagnostics 里的数量/Provider 摘要打平成 full 日志统计对象，减少 main 中对 length/format 的重复手写。
function buildFullSummaryDiagnosticMetrics(diagnostics) {
  return mergeDefinitionDrivenSectionPayload(
    FULL_SUMMARY_DIAGNOSTIC_METRIC_SECTION_DEFINITIONS,
    buildFullSummaryDiagnosticMetricSections(diagnostics)
  );
}

// buildProxyGroups 前半段这批“基础候选链 / 优先国家链 / 服务组中间产物”本质上是串行派生值，这里统一定义化以减少函数体中的平行模板。
const PROXY_GROUP_RUNTIME_CONTEXT_DEFINITIONS = Object.freeze([
  {
    key: "countryExcludeFilter",
    value: () => composeCaseInsensitivePattern([
      REGEX_LOW_COST.source,
      ARGS.landing ? REGEX_LANDING_ISOLATE.source : ""
    ])
  },
  {
    key: "otherExcludeFilter",
    value: (context) => composeCaseInsensitivePattern([
      context.hasLowCost ? REGEX_LOW_COST.source : "",
      ARGS.landing ? REGEX_LANDING_ISOLATE.source : "",
      ...(Array.isArray(context.countryFilters) ? context.countryFilters : [])
    ])
  },
  {
    key: "functionalPool",
    value: (context) => uniqueStrings([
      ARGS.landing ? GROUPS.LANDING : "",
      ...(Array.isArray(context.countryGroupNames) ? context.countryGroupNames : []),
      GROUPS.OTHER,
      context.hasLowCost ? GROUPS.LOW_COST : ""
    ])
  },
  {
    key: "baseProxies",
    value: (context) => uniqueStrings([
      GROUPS.FALLBACK,
      ...(Array.isArray(context.functionalPool) ? context.functionalPool : []),
      GROUPS.MANUAL,
      BUILTIN_DIRECT
    ])
  },
  {
    key: "fallbackProxies",
    value: (context) => uniqueStrings(
      Array.isArray(context.functionalPool) && context.functionalPool.length
        ? context.functionalPool
        : [BUILTIN_DIRECT]
    )
  },
  {
    key: "directFirstProxies",
    value: (context) => uniqueStrings([BUILTIN_DIRECT, GROUPS.SELECT].concat(toStringArray(context.baseProxies)))
  },
  {
    key: "selectFirstProxies",
    value: (context) => uniqueStrings([GROUPS.SELECT].concat(toStringArray(context.baseProxies)))
  },
  {
    key: "mediaProxies",
    value: (context) => uniqueStrings([GROUPS.SELECT].concat(
      toStringArray(context.countryGroupNames),
      [GROUPS.OTHER, GROUPS.MANUAL]
    ))
  },
  {
    key: "preferredCountryGroups",
    value: (context) => buildDefinitionDrivenPayload(PROXY_GROUP_PREFERRED_COUNTRY_DEFINITIONS, {
      countryConfigs: context.countryConfigs
    })
  },
  {
    key: "availableGroupNames",
    value: (context) => buildBuiltinAwareNameList(
      context.countryGroupNames,
      context.regionGroupNames,
      PROXY_GROUP_ALWAYS_GENERATED_NAMES,
      ARGS.landing ? [GROUPS.LANDING] : [],
      context.hasLowCost ? [GROUPS.LOW_COST] : [],
      context.existingGroupNames
    )
  },
  {
    key: "modeBaseProxies",
    value: (context) => buildDefinitionDrivenPayload(PROXY_GROUP_MODE_BASE_PROXY_DEFINITIONS, {
      baseProxies: context.baseProxies,
      directFirstProxies: context.directFirstProxies,
      selectFirstProxies: context.selectFirstProxies
    })
  },
  {
    key: "cryptoProxies",
    value: (context) => prependPreferredGroups(
      context.preferredCountryGroups && context.preferredCountryGroups.cryptoPreferredGroups,
      context.baseProxies
    )
  },
  {
    key: "aiProxies",
    value: (context) => prependPreferredGroups(
      context.preferredCountryGroups && context.preferredCountryGroups.aiPreferredGroups,
      context.baseProxies
    )
  },
  {
    key: "serviceArtifacts",
    // buildProxyGroupServiceArtifactMap 已经改成只接收一个 payload 对象；
    // 这里直接传命名字段，避免继续引用已不存在的 definitions 变量。
    value: (context) => buildProxyGroupServiceArtifactMap({
      // preferredGroups / modeBaseProxies / providerNames 会在内部统一组装成 GitHub/Steam/Dev 三套独立组中间产物。
      // 这里提前把三套服务组需要的原料一次性喂齐，后面 generatedGroups 就只管消费 serviceArtifacts 成品。
      githubPreferredGroups: context.preferredCountryGroups && context.preferredCountryGroups.githubPreferredGroups,
      steamPreferredGroups: context.preferredCountryGroups && context.preferredCountryGroups.steamPreferredGroups,
      devPreferredGroups: context.preferredCountryGroups && context.preferredCountryGroups.devPreferredGroups,
      githubModeBaseProxies: context.modeBaseProxies && context.modeBaseProxies.githubModeBaseProxies,
      steamModeBaseProxies: context.modeBaseProxies && context.modeBaseProxies.steamModeBaseProxies,
      developerModeBaseProxies: context.modeBaseProxies && context.modeBaseProxies.developerModeBaseProxies,
      selectFirstProxies: context.selectFirstProxies,
      availableGroupNames: context.availableGroupNames,
      proxyNames: context.proxyNames,
      existingProxyProviderNames: context.existingProxyProviderNames
    })
  },
  {
    key: "generatedGroups",
    value: (context) => buildProxyGroupGeneratedGroups({
      baseProxies: context.baseProxies,
      fallbackProxies: context.fallbackProxies,
      aiProxies: context.aiProxies,
      directFirstProxies: context.directFirstProxies,
      mediaProxies: context.mediaProxies,
      cryptoProxies: context.cryptoProxies,
      serviceArtifacts: context.serviceArtifacts,
      landingEnabled: ARGS.landing,
      hasLowCost: context.hasLowCost,
      countryConfigs: context.countryConfigs,
      countryExcludeFilter: context.countryExcludeFilter,
      countryGroupType: ARGS.lb ? "load-balance" : "url-test",
      resolvedRegionConfigs: context.resolvedRegionConfigs,
      otherExcludeFilter: context.otherExcludeFilter
    })
  }
]);

// buildProxyGroups 运行期上下文里的派生值前后依赖明显，这里统一串行装配，减少主函数前半段的大段平行局部变量。
function buildProxyGroupRuntimeContext(payload) {
  // 这里必须走 sequential builder：后面的 serviceArtifacts / generatedGroups 会依赖前面已经算好的候选链与优先链上下文。
  return buildSequentialDefinitionPayload(PROXY_GROUP_RUNTIME_CONTEXT_DEFINITIONS, isObject(payload) ? payload : {});
}

// 单文件内的 proxy-group 构建也整理成“阶段产物 + 收尾结果”的执行计划，保持 buildProxyGroups 主体只负责守卫与调度。
function buildProxyGroupExecutionPayload(payload, extraFields) {
  const context = isObject(payload) ? payload : {};
  const proxyGroupBaseContext = isObject(context.proxyGroupBaseContext) ? context.proxyGroupBaseContext : {};

  return Object.assign({
    proxies: Array.isArray(context.proxies) ? context.proxies : [],
    countryConfigs: Array.isArray(context.countryConfigs) ? context.countryConfigs : [],
    regionConfigs: Array.isArray(context.regionConfigs) ? context.regionConfigs : [],
    hasLowCost: !!context.hasLowCost,
    existingGroups: Array.isArray(context.existingGroups) ? context.existingGroups : [],
    existingProxyProviders: isObject(context.existingProxyProviders) ? context.existingProxyProviders : {}
  }, proxyGroupBaseContext, isObject(extraFields) ? extraFields : {});
}

const PROXY_GROUP_EXECUTION_ARTIFACT_DEFINITIONS = Object.freeze([
  {
    key: "proxyGroupBaseContext",
    value: (context) => buildProxyGroupBaseContext({
      proxies: context.proxies,
      countryConfigs: context.countryConfigs,
      regionConfigs: context.regionConfigs,
      existingGroups: context.existingGroups,
      existingProxyProviders: context.existingProxyProviders
    })
  },
  {
    key: "proxyGroupRuntimeContext",
    value: (context) => buildProxyGroupRuntimeContext(buildProxyGroupExecutionPayload(context))
  },
  {
    key: "orderedGroups",
    value: (context) => finalizeProxyGroupGeneration(
      context.proxyGroupRuntimeContext && context.proxyGroupRuntimeContext.generatedGroups,
      context.existingGroups,
      context.proxyGroupBaseContext && context.proxyGroupBaseContext.countryGroupNames,
      context.proxyGroupBaseContext && context.proxyGroupBaseContext.regionGroupNames
    )
  }
]);

// 独立抽出 buildProxyGroups 的阶段执行器，让国家/区域/服务组上下文可以在单文件里继续按模块维度演进。
function buildProxyGroupArtifacts(payload) {
  const context = isObject(payload) ? payload : {};
  return buildSequentialDefinitionPayload(
    PROXY_GROUP_EXECUTION_ARTIFACT_DEFINITIONS,
    buildProxyGroupExecutionPayload(context),
    buildSequentialStageExecutionContext
  );
}

// 一个国家组都没识别出来时统一在这里告警，避免 buildProxyGroups 主体继续堆叠细碎条件。
function warnMissingProxyGroupCountries(proxyGroupBaseContext) {
  const current = isObject(proxyGroupBaseContext) ? proxyGroupBaseContext : {};

  if (Array.isArray(current.countryGroupNames) && current.countryGroupNames.length) {
    return;
  }

  // 完全没有国家命中时，兜底组本就是预期行为；这里不再额外打“缺国家组”告警，避免和未识别统计重复轰炸。
  if (!(typeof current.classifiedCountryProxyCount === "number" && current.classifiedCountryProxyCount > 0)) {
    return;
  }

  emitWarning("⚠️ 警告: 未检测到有效的国家分组，将使用兜底节点组");
}

// 构建写入 `_res.headers` 的调试头，便于直接在下载响应中查看关键运行信息。
function buildRuntimeResponseHeaders(diagnostics) {
  return buildRuntimeResponseHeaderSections(
    buildRuntimeResponseHeaderContext(diagnostics),
    RUNTIME_RESPONSE_HEADER_SECTION_DEFINITIONS
  );
}

// 构建完整的策略组列表。
// 这里会把国家组、功能组、优先级组、兜底组全部拼出来。
function buildProxyGroups(proxies, countryConfigs, regionConfigs, hasLowCost, existingGroups, existingProxyProviders) {
  // full 模式下统计构建耗时，方便后续优化。
  // 部分脚本运行环境只提供 log/warn/error，没有 time/timeEnd，所以这里先做能力检测再调用。
  if (ARGS.full && typeof console.time === "function") {
    console.time("buildProxyGroups");
  }

  const proxyGroupArtifacts = buildProxyGroupArtifacts({
    proxies,
    countryConfigs,
    regionConfigs,
    hasLowCost,
    existingGroups,
    existingProxyProviders
  });
  const proxyGroupBaseContext = proxyGroupArtifacts.proxyGroupBaseContext;
  warnMissingProxyGroupCountries(proxyGroupBaseContext);
  // orderedGroups 已经是“基础上下文 -> 候选链/服务组 -> merge/order”整套执行计划的最终产物。
  const orderedGroups = proxyGroupArtifacts.orderedGroups;

  // full 模式下输出构建耗时。
  // 同样兼容缺少 console.timeEnd 的运行环境，避免 full 模式只因日志能力不足而中断主流程。
  if (ARGS.full && typeof console.timeEnd === "function") {
    console.timeEnd("buildProxyGroups");
  }

  // 返回最终策略组数组。
  return orderedGroups;
}

// 构建 DNS 配置，同时尽量保留用户原配置中的扩展项。
function buildDnsConfig(existingDns) {
  const dnsRuntimeContext = buildDnsRuntimeContext(existingDns);
  const currentDns = dnsRuntimeContext.currentDns;
  const scalarOptions = dnsRuntimeContext.scalarOptions;
  const optionalScalarOptions = dnsRuntimeContext.optionalScalarOptions;
  const domesticNameservers = dnsRuntimeContext.domesticNameservers;
  const fallbackNameservers = dnsRuntimeContext.fallbackNameservers;
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

  // 先合并基础 DNS 开关和全局行为。
  const dns = mergeObjects(currentDns, {
    // 强制启用 DNS 模块。
    enable: true,
    // 是否启用 IPv6 跟随脚本参数。
    ipv6: ARGS.ipv6,
    // 显式启用更适合长时间运行场景的 ARC 缓存算法。
    "cache-algorithm": scalarOptions.cacheAlgorithm,
    // prefer-h3 允许用户显式打开，但默认仍保守关闭。
    "prefer-h3": scalarOptions.preferH3,
    // 按参数决定走 fake-ip 还是 redir-host。
    "enhanced-mode": ARGS.fakeip ? "fake-ip" : "redir-host",
    // listen 支持参数化，没传参数时优先保留原配置。
    listen: scalarOptions.listen,
    // 保留 hosts 支持。
    "use-hosts": scalarOptions.useHosts,
    // 额外启用系统 hosts，方便桌面端/路由端把静态 hosts 一并纳入解析流程。
    "use-system-hosts": scalarOptions.useSystemHosts,
    // fake-ip-filter-mode 支持 blacklist / whitelist / rule，默认仍为 blacklist。
    "fake-ip-filter-mode": scalarOptions.fakeIpFilterMode,
    // 若用户自己开启 respect-rules，则这里沿用用户配置；否则默认关闭，减少 DNS 自身依赖规则造成的复杂度。
    "respect-rules": scalarOptions.respectRules,
    // fake-ip 地址池优先保留用户原值，否则回落到标准保留网段。
    "fake-ip-range": scalarOptions.fakeIpRange
  });

  Object.assign(dns, optionalScalarOptions);
  // nameserver / fallback / direct / proxy-server 这批默认列表统一按 definitions 批量装配。
  Object.assign(dns, buildDnsDefaultStringListPayload({
    currentDns,
    domesticNameservers,
    fallbackNameservers
  }));
  // 允许 direct-nameserver 跟随 nameserver-policy，兼顾国内直连与自定义策略。
  dns["direct-nameserver-follow-policy"] = scalarOptions.directNameserverFollowPolicy;
  // fake-ip-filter：按当前 fake-ip-filter-mode 生成；rule 模式下会自动转为规则语法。
  dns["fake-ip-filter"] = buildFakeIpFilter(fakeIpFilter, currentDns["fake-ip-filter"], scalarOptions.fakeIpFilterMode);

  // fallback-filter：先给默认值，再按 geosite/domain/ipcidr 三段补齐默认数组。
  dns["fallback-filter"] = buildDnsFallbackFilter(currentDns["fallback-filter"]);

  // 两组 policy 也统一走 definitions 批量装配，保持默认 policy 优先、用户 policy 追加合并的顺序不变。
  Object.assign(dns, buildDnsPolicyPayload(dnsRuntimeContext));
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

// Sniffer 协议段只是协议名与默认协议体不同，这里收成 definitions，方便继续扩展更多协议类型。
const SNIFFER_PROTOCOL_DEFINITIONS = Object.freeze([
  { key: "TLS", value: (currentSniff) => mergeSniffProtocol({ ports: [443, 8443] }, currentSniff.TLS) },
  { key: "HTTP", value: (currentSniff) => mergeSniffProtocol({ ports: [80, 8080, 8880], "override-destination": true }, currentSniff.HTTP) },
  { key: "QUIC", value: (currentSniff) => mergeSniffProtocol({ ports: [443, 8443] }, currentSniff.QUIC) }
]);

// 构造 sniff 协议表，并保留 HTTP 的后置 override 逻辑，避免 buildSnifferConfig 里继续平铺三段近似模板。
function buildSnifferProtocolTable(currentSniff) {
  const protocols = mergeObjects(currentSniff, buildDefinitionDrivenPayload(SNIFFER_PROTOCOL_DEFINITIONS, currentSniff));

  if (ARGS.hasSnifferHttpOverrideDestination) {
    protocols.HTTP["override-destination"] = ARGS.snifferHttpOverrideDestination;
  }

  return protocols;
}

// 统一判断配置值是否是 string / string[]，便于 Sniffer 这类列表字段按条件保留用户原值。
function hasStringArrayLikeValue(value) {
  return Array.isArray(value) || typeof value === "string";
}

// Sniffer 列表字段统一按“默认值 + 原配置 + 参数”合并，避免每个字段都手写 uniqueStrings 模板。
function buildSnifferMergedStringList(defaultEntries, currentEntries, argEntries) {
  return uniqueStrings(toStringArray(defaultEntries).concat(toStringArray(currentEntries), toStringArray(argEntries)));
}

// Sniffer 这些字符串列表字段只是默认值 / 参数来源 / 是否写回条件不同，这里集中维护。
const SNIFFER_STRING_LIST_OPTION_DEFINITIONS = Object.freeze([
  {
    key: "skip-domain",
    defaultEntries: ["Mijia Cloud", "+.push.apple.com"],
    argKey: "snifferSkipDomains",
    shouldAssign: () => true
  },
  {
    key: "force-domain",
    defaultEntries: ["+.openai.com", "+.anthropic.com"],
    argKey: "snifferForceDomains",
    shouldAssign: (currentSniffer, definition) => hasStringArrayLikeValue(currentSniffer["force-domain"]) || toStringArray(definition.defaultEntries).length > 0
  },
  {
    key: "skip-src-address",
    defaultEntries: [],
    shouldAssign: (currentSniffer) => hasStringArrayLikeValue(currentSniffer["skip-src-address"])
  },
  {
    key: "skip-dst-address",
    defaultEntries: [],
    shouldAssign: (currentSniffer) => hasStringArrayLikeValue(currentSniffer["skip-dst-address"])
  }
]);

// 按 definitions 批量写回 Sniffer 字符串列表字段，只在满足条件时输出对应字段。
function applySnifferStringListOptions(sniffer, currentSniffer) {
  const target = isObject(sniffer) ? sniffer : {};
  const source = isObject(currentSniffer) ? currentSniffer : {};

  for (const definition of SNIFFER_STRING_LIST_OPTION_DEFINITIONS) {
    const key = normalizeStringArg(definition && definition.key);
    const shouldAssign = definition && typeof definition.shouldAssign === "function"
      ? definition.shouldAssign(source, definition)
      : false;

    if (!key || !shouldAssign) {
      continue;
    }

    const argEntries = definition && definition.argKey ? ARGS[definition.argKey] : [];
    target[key] = buildSnifferMergedStringList(definition && definition.defaultEntries, source[key], argEntries);
  }

  return target;
}

// 构建 Mihomo 通用内核默认项，尽量给出稳妥默认值，同时保留用户显式配置。
function buildKernelDefaults(config) {
  const currentConfig = isObject(config) ? config : {};
  const currentGeoxUrl = isObject(currentConfig["geox-url"]) ? currentConfig["geox-url"] : {};
  const geoxUrl = mergeObjects(GEOX_URLS, currentGeoxUrl);
  const scalarOptions = buildKernelDefaultScalarOptions(currentConfig);
  return buildKernelDefaultOutputPayload(mergeObjects(scalarOptions, { geoxUrl }));
}

// 构建 Sniffer 配置，同时保留用户原有的扩展设置。
function buildSnifferConfig(existingSniffer) {
  // 规范化原 Sniffer 配置。
  const currentSniffer = isObject(existingSniffer) ? existingSniffer : {};
  // 规范化 sniff 子对象。
  const currentSniff = isObject(currentSniffer.sniff) ? currentSniffer.sniff : {};
  const scalarOptions = buildSnifferScalarOptions(currentSniffer);

  // 先合并全局 Sniffer 开关和默认行为。
  const sniffer = mergeObjects(currentSniffer, {
    enable: true,
    "force-dns-mapping": scalarOptions.forceDnsMapping,
    "parse-pure-ip": scalarOptions.parsePureIp,
    "override-destination": scalarOptions.overrideDestination
  });

  // 把协议表挂回 sniffer。
  sniffer.sniff = buildSnifferProtocolTable(currentSniff);
  // 其余列表字段按统一 definitions 批量写回，保留默认值、原配置和参数追加顺序。
  applySnifferStringListOptions(sniffer, currentSniffer);

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

// logDiagnostics 里的大部分告警都遵循“统计数量 + full 模式输出前 N 条样本”的模板，这里抽成统一定义表。
const DIAGNOSTIC_WARNING_BLOCK_DEFINITIONS = Object.freeze([
  {
    key: "renamedProxies",
    message: (items) => `⚠️ 检测到 ${items.length} 个节点名称被自动规范化或重命名`,
    previewLimit: 8,
    formatItem: (item) => `${item.from} => ${item.to}`
  },
  { key: "deprecatedSettings", message: (items) => `⚠️ 检测到 ${items.length} 个已弃用配置项`, previewLimit: 10 },
  { key: "invalidRuleProviderUrls", message: (items) => `⚠️ 检测到 ${items.length} 个 rule-provider URL 异常`, previewLimit: 10 },
  { key: "ruleProviderWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个 rule-provider 语义异常`, previewLimit: 10 },
  { key: "proxyProviderWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个 proxy-provider 参数异常`, previewLimit: 10 },
  { key: "dnsRiskWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个 DNS 风险组合`, previewLimit: 10 },
  { key: "dnsOptionWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个 DNS 选项风险`, previewLimit: 10 },
  { key: "latencyGroupWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个测速组参数异常`, previewLimit: 10 },
  { key: "providerHealthWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个 provider 型健康检查提醒`, previewLimit: 10 },
  { key: "preferredCountryWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个国家优先链标记未命中`, previewLimit: 10 },
  { key: "preferredGroupWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个独立组前置组标记异常`, previewLimit: 10 },
  { key: "preferredNodeWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个独立组点名节点标记异常`, previewLimit: 10 },
  { key: "preferredProviderWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个独立组 provider 池参数异常`, previewLimit: 10 },
  { key: "regionVisibilityWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个区域组可见性提醒`, previewLimit: 10 },
  { key: "groupOrderWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个策略组布局参数异常`, previewLimit: 10 },
  { key: "ruleOrderWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个规则顺序参数异常`, previewLimit: 10 },
  { key: "customRuleOrderWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个自定义规则编排异常`, previewLimit: 10 },
  { key: "ruleTargetWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个规则入口目标参数异常`, previewLimit: 10 },
  { key: "rulePriorityWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个规则优先级风险`, previewLimit: 10 },
  { key: "proxyGroupPriorityWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个策略组候选链风险`, previewLimit: 10 },
  { key: "customRuleWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个自定义规则提醒`, previewLimit: 10 },
  { key: "serviceRoutingWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个业务链路提醒`, previewLimit: 10 },
  { key: "targetPlatformWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个目标平台兼容性提醒`, previewLimit: 5 },
  { key: "runtimeArgWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个参数诊断提醒`, previewLimit: 5 },
  { key: "runtimeResponseWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个响应调试链路提醒`, previewLimit: 5 },
  { key: "runtimeLinkWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个下载链路参数提醒`, previewLimit: 5 },
  { key: "geoConfigWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个 GEO 配置风险`, previewLimit: 10 },
  { key: "kernelOptionWarnings", message: (items) => `⚠️ 检测到 ${items.length} 个核心内核项风险`, previewLimit: 10 },
  { key: "duplicateRuleProviderPaths", message: (items) => `⚠️ 检测到 ${items.length} 个 rule-provider path 冲突`, previewLimit: 10 },
  { key: "unresolvedGroupReferences", message: (items) => `⚠️ 检测到 ${items.length} 个策略组引用无法解析`, previewLimit: 10 },
  { key: "unresolvedProviderReferences", message: (items) => `⚠️ 检测到 ${items.length} 个 proxy-provider 引用无法解析`, previewLimit: 10 },
  { key: "invalidGroupPatterns", message: (items) => `⚠️ 检测到 ${items.length} 个自动分组的过滤正则无效`, previewLimit: 10 },
  { key: "emptyAutoGroups", message: (items) => `⚠️ 检测到 ${items.length} 个自动分组当前为空`, previewLimit: 12 }
]);
// 剩余少量 diagnostics 告警不完全符合“数组数量 + 样本预览”模板，这里也补成定义表，避免 logDiagnostics 里残留零散 if。
function createDiagnosticSpecialWarningDefinition(countKey, options) {
  return Object.assign({ countKey }, isObject(options) ? options : {});
}

// “有部分命中、也有部分漏掉”才算真正值得提示的国家识别覆盖率风险；全量未命中时默认视为订阅命名风格不同。
function shouldWarnUnclassifiedCountryProxies(diagnostics) {
  const current = isObject(diagnostics) ? diagnostics : {};
  const unclassified = Number(current.unclassifiedCountryProxies) || 0;
  if (unclassified <= 0) {
    return false;
  }

  if (!hasOwn(current, "classifiedCountryProxies")) {
    return true;
  }

  return (Number(current.classifiedCountryProxies) || 0) > 0;
}

// 非通用模板类 diagnostics 告警统一登记在此，方便 logDiagnostics 按定义表逐项输出。
const DIAGNOSTIC_SPECIAL_WARNING_DEFINITIONS = Object.freeze([
  createDiagnosticSpecialWarningDefinition("missingProviders", {
    shouldLog: (diagnostics) => Array.isArray(diagnostics.missingProviders) && diagnostics.missingProviders.length > 0,
    message: (diagnostics) => `⚠️ 规则定义引用了不存在的 rule-provider: ${diagnostics.missingProviders.join(", ")}`
  }),
  createDiagnosticSpecialWarningDefinition("missingRuleTargets", {
    shouldLog: (diagnostics) => Array.isArray(diagnostics.missingRuleTargets) && diagnostics.missingRuleTargets.length > 0,
    message: (diagnostics) => `⚠️ 规则目标策略组缺失: ${diagnostics.missingRuleTargets.join(", ")}`
  }),
  createDiagnosticSpecialWarningDefinition("unclassifiedCountryProxies", {
    countType: "number",
    shouldLog: shouldWarnUnclassifiedCountryProxies,
    message: (diagnostics) => `⚠️ 检测到 ${diagnostics.unclassifiedCountryProxies} 个节点未命中任何国家识别规则`,
    previewItems: (diagnostics) => Array.isArray(diagnostics.unclassifiedCountryExamples) ? diagnostics.unclassifiedCountryExamples : [],
    previewLimit: 10
  })
]);

// diagnostics issue 计数统一从 definitions 派生，避免响应头里的总数和 logDiagnostics 实际处理的条目逐步漂移。
function countDiagnosticIssueDefinitions(diagnostics, definitions) {
  const current = isObject(diagnostics) ? diagnostics : {};
  let total = 0;

  for (const definition of Array.isArray(definitions) ? definitions : []) {
    if (definition && typeof definition.shouldLog === "function" && !definition.shouldLog(current)) {
      continue;
    }

    const countKey = normalizeStringArg((definition && definition.countKey) || (definition && definition.key));
    const countType = normalizeStringArg((definition && definition.countType) || "array");

    if (!countKey) {
      continue;
    }

    // 少数 special warning 直接用数字计数，其余 warning 默认按数组长度统计。
    if (countType === "number") {
      total += typeof current[countKey] === "number" && current[countKey] > 0
        ? current[countKey]
        : 0;
      continue;
    }

    if (Array.isArray(current[countKey])) {
      total += current[countKey].length;
    }
  }

  return total;
}

// diagnostics warning/special-warning 的运行态解析都遵循同一套默认值回退，这里统一收敛成单一 state resolver。
function resolveDiagnosticLogState(definition, diagnostics, payload) {
  const current = isObject(diagnostics) ? diagnostics : {};
  const context = isObject(payload) ? payload : {};
  const items = Array.isArray(context.items) ? context.items : [];
  // 这里把 preview 上限、格式化器、message builder、shouldLog 全部一次解析好，后面 handler 只管执行。
  return {
    items,
    previewLimit: clampNumber(Number(definition && definition.previewLimit) || 10, 1, 20),
    formatItem: definition && typeof definition.formatItem === "function"
      ? definition.formatItem
      : (item) => `${item}`,
    messageBuilder: definition && typeof definition.message === "function"
      ? definition.message
      : null,
    shouldLog: definition && typeof definition.shouldLog === "function"
      ? definition.shouldLog(current)
      : !!context.defaultShouldLog
  };
}

// diagnostics 在 full 模式下的样本预览都遵循同一套 limit/format/打印模板，这里统一收口。
function logDiagnosticPreviewItems(logState, diagnostics) {
  const current = isObject(diagnostics) ? diagnostics : {};
  const state = isObject(logState) ? logState : {};
  if (!ARGS.full || !Array.isArray(state.items) || !state.items.length) {
    return;
  }

  emitWarningList(
    state.items.slice(0, state.previewLimit),
    (item) => `   · ${state.formatItem(item, current)}`,
    { once: false }
  );
}

// diagnostics 各类告警最终都落成“可选 message + 可选 preview”两步，这里统一执行壳层，避免 warning/special-warning 各写一遍。
function emitDiagnosticLogState(logState, diagnostics, message) {
  if (message) {
    emitWarning(message);
  }

  logDiagnosticPreviewItems(logState, diagnostics);
}

// diagnostics 现在也显式区分 warning-block / special-warning 两类执行协议，后续若继续新增日志类型只需扩这个注册表。
const DIAGNOSTIC_LOG_PAYLOAD_BUILDERS = Object.freeze({
  "warning-block": (diagnostics, definition) => {
    const current = isObject(diagnostics) ? diagnostics : {};
    const key = normalizeStringArg(definition && definition.key);
    if (!key) {
      return null;
    }

    const items = Array.isArray(current[key]) ? current[key] : [];
    if (!items.length) {
      return null;
    }

    const logState = resolveDiagnosticLogState(definition, current, {
      items,
      defaultShouldLog: true
    });
    return {
      diagnostics: current,
      logState,
      message: (logState.messageBuilder || ((list) => `⚠️ 检测到 ${list.length} 个 ${key} 告警`))(items, current)
    };
  },
  "special-warning": (diagnostics, definition) => {
    const current = isObject(diagnostics) ? diagnostics : {};
    const previewItems = definition && typeof definition.previewItems === "function"
      ? definition.previewItems(current)
      : [];
    const logState = resolveDiagnosticLogState(definition, current, {
      items: previewItems
    });

    if (!logState.shouldLog) {
      return null;
    }

    return {
      diagnostics: current,
      logState,
      message: logState.messageBuilder
        ? logState.messageBuilder(current)
        : ""
    };
  }
});

// diagnostics definition 未显式标 kind 时，默认按是否存在 key 来区分 warning-block 与 special-warning，保持旧行为不变。
function resolveDiagnosticLogPayloadKind(definition, kind) {
  const currentKind = normalizeStringArg(kind);
  if (currentKind) {
    return currentKind;
  }

  return normalizeStringArg(definition && definition.key)
    ? "warning-block"
    : "special-warning";
}

// warning/special-warning 最终都能收敛成“kind + definition -> log payload”这一层，这里统一生成执行载荷。
function buildDiagnosticDefinitionLogPayload(diagnostics, definition, kind) {
  const payloadKind = resolveDiagnosticLogPayloadKind(definition, kind);
  const payload = executeKindRegistryHandler(
    DIAGNOSTIC_LOG_PAYLOAD_BUILDERS,
    payloadKind,
    diagnostics,
    definition
  );
  return typeof payload === "undefined" ? null : payload;
}

// diagnostics 输出最终只需要按 payload 协议执行共享壳层；无 payload 时直接跳过。
function emitDiagnosticLogPayload(payload) {
  if (!isObject(payload)) {
    return;
  }

  emitDiagnosticLogState(payload.logState, payload.diagnostics, payload.message);
}

// diagnostics 两类 definition 现在统一走 kind -> payload -> emit 这条链路，减少 warning/special-warning 的并行壳层。
function logDiagnosticDefinition(diagnostics, definition, kind) {
  emitDiagnosticLogPayload(buildDiagnosticDefinitionLogPayload(diagnostics, definition, kind));
}

// diagnostics / build-summary 的 definition-handler section 都共享同一套“definitions + handler + 可选 phase”壳层，这里统一抽成基础工厂。
function createDefinitionHandlerSection(definitions, handler, options) {
  const currentOptions = isObject(options) ? options : {};
  const phase = normalizeStringArg(currentOptions.phase);
  const section = {
    definitions: Array.isArray(definitions) ? definitions : [],
    handler: typeof handler === "function" ? handler : (() => {})
  };

  if (phase) {
    section.phase = phase;
  }

  return section;
}

// 很多 handler section 都只是把一个 kind 绑定给统一 handler，这里继续抽成共享 helper，减少 diagnostics/build-summary 两边的重复模板。
function createKindBoundDefinitionHandlerSection(definitions, kind, handler, options) {
  const currentOptions = isObject(options) ? options : {};
  const currentKind = normalizeStringArg(kind);
  const kindPosition = normalizeStringArg(currentOptions.kindPosition) || "last";
  return createDefinitionHandlerSection(
    definitions,
    (context, definition) => typeof handler === "function"
      ? (kindPosition === "first"
        ? handler(currentKind, definition, context)
        : handler(context, definition, currentKind))
      : undefined,
    currentOptions
  );
}

// diagnostics handler section 目前只是在 definitions/kind 两项上不同，这里也抽成轻量工厂，减少计划表模板。
function createDiagnosticLogHandlerSection(kind, definitions) {
  return createKindBoundDefinitionHandlerSection(definitions, kind, logDiagnosticDefinition);
}

// diagnostics 各类 handler 当前只是在固定顺序下批量执行，这里也整理成计划表，避免 logDiagnostics 主体再保留平铺调用。
const DIAGNOSTIC_LOG_HANDLER_SECTIONS = Object.freeze([
  createDiagnosticLogHandlerSection("warning-block", DIAGNOSTIC_WARNING_BLOCK_DEFINITIONS),
  createDiagnosticLogHandlerSection("special-warning", DIAGNOSTIC_SPECIAL_WARNING_DEFINITIONS)
]);

// definition-handler section 的 definitions 统一走这层读取，便于 runDefinitionHandlerSections 与各类工厂共享同一套兜底逻辑。
function resolveDefinitionHandlerSectionDefinitions(section) {
  return Array.isArray(section && section.definitions) ? section.definitions : [];
}

// 指定 phase 时，只执行 phase 匹配的 section；未指定时全部执行，这里抽成 helper 让 runner 主体更聚焦。
function shouldRunDefinitionHandlerSection(section, phase) {
  const currentPhase = normalizeStringArg(phase);
  return !currentPhase || normalizeStringArg(section && section.phase) === currentPhase;
}

// diagnostics / build-summary 都有“section -> definitions -> handler”的同构调度层，这里统一 section runner。
function runDefinitionHandlerSections(sections, context, phase) {
  const source = Array.isArray(sections) ? sections : [];

  for (const section of source) {
    if (!shouldRunDefinitionHandlerSection(section, phase)) {
      continue;
    }

    const handler = section && section.handler;
    if (typeof handler !== "function") {
      continue;
    }

    for (const definition of resolveDefinitionHandlerSectionDefinitions(section)) {
      handler(context, definition);
    }
  }
}

// build-summary definition-handler section 目前只是在 phase/definitions/kind 三项上不同，这里抽成 helper 避免平铺重复 handler 模板。
function createBuildSummaryDefinitionHandlerSection(phase, definitions, lineKind) {
  return createKindBoundDefinitionHandlerSection(
    definitions,
    lineKind,
    logBuildSummaryLineByKind,
    { phase, kindPosition: "first" }
  );
}

// logBuildSummary 里这几段“遍历 definitions -> 调不同 logger”也整理成计划表，避免主体继续出现多段近似循环。
const BUILD_SUMMARY_DEFINITION_HANDLER_SECTIONS = Object.freeze([
  createBuildSummaryDefinitionHandlerSection("pre-lookup", BUILD_SUMMARY_OPTIONAL_VALUE_LINE_DEFINITIONS, "optional-value"),
  createBuildSummaryDefinitionHandlerSection("pre-lookup", BUILD_SUMMARY_CORE_ARG_LINE_DEFINITIONS, "arg"),
  createBuildSummaryDefinitionHandlerSection("post-lookup", BUILD_SUMMARY_SERVICE_ARG_LINE_DEFINITIONS, "arg")
]);

// build-summary 日志真正依赖的上下文只有 stats 与 lookupRegistry，这里先统一裁成 source payload，便于后续继续扩展其它日志阶段输入。
const BUILD_SUMMARY_LOG_SOURCE_DEFINITIONS = Object.freeze([
  { key: "stats", value: (context) => isObject(context.stats) ? context.stats : {} },
  {
    key: "lookupRegistry",
    value: (context) => isObject(context.lookupRegistry)
      ? context.lookupRegistry
      : buildBuildSummaryLookupRegistry(BUILD_SUMMARY_LOOKUP_REGISTRY_DEFINITIONS)
  }
]);

// build-summary 日志 source payload 统一在这里装配，避免 logBuildSummary 回到手写局部变量。
function buildBuildSummaryLogSourcePayload(payload) {
  return buildDefinitionDrivenPayload(BUILD_SUMMARY_LOG_SOURCE_DEFINITIONS, isObject(payload) ? payload : {});
}

// build-summary 日志 section 大多只是 kind + 少量配置项不同，这里先抽成轻量工厂，减少计划表里的对象模板样板。
function createBuildSummaryLogSectionDefinition(kind, options) {
  return Object.assign({ kind }, isObject(options) ? options : {});
}

// build-summary 日志阶段同样改成 section 协议：标题 / 指标 / definition-handler / lookup / diagnostic-line 都按计划顺序执行。
const BUILD_SUMMARY_LOG_SECTION_DEFINITIONS = Object.freeze([
  createBuildSummaryLogSectionDefinition("title"),
  createBuildSummaryLogSectionDefinition("metric-sections", {
    sections: BUILD_SUMMARY_METRIC_SECTION_DEFINITIONS
  }),
  createBuildSummaryLogSectionDefinition("definition-handler-sections", {
    sections: BUILD_SUMMARY_DEFINITION_HANDLER_SECTIONS,
    phase: "pre-lookup"
  }),
  createBuildSummaryLogSectionDefinition("lookup-sections", {
    sections: BUILD_SUMMARY_LOG_LOOKUP_SECTION_DEFINITIONS
  }),
  createBuildSummaryLogSectionDefinition("diagnostic-lines", {
    definitions: BUILD_SUMMARY_DIAGNOSTIC_LINE_DEFINITIONS
  }),
  createBuildSummaryLogSectionDefinition("definition-handler-sections", {
    sections: BUILD_SUMMARY_DEFINITION_HANDLER_SECTIONS,
    phase: "post-lookup"
  })
]);

// build-summary section payload 里有一批字段只是从 source payload 透传，这里抽成工厂，避免各 kind 重复写 context.stats/lookupRegistry 模板。
function createBuildSummaryLogSectionSourceFieldDefinition(key) {
  const currentKey = normalizeStringArg(key);
  return Object.freeze({
    key: currentKey,
    value: (section, sourcePayload) => sourcePayload && sourcePayload[currentKey]
  });
}

// build-summary section payload 里的数组字段都遵循同一兜底规则：读取 section[key]，不是数组就回退空数组。
function createBuildSummaryLogSectionArrayFieldDefinition(key) {
  const currentKey = normalizeStringArg(key);
  return Object.freeze({
    key: currentKey,
    value: (section) => Array.isArray(section && section[currentKey]) ? section[currentKey] : []
  });
}

// build-summary section payload 里的 phase/kind 这类字符串字段统一做 normalize，避免各 kind 自己重复调用 normalizeStringArg。
function createBuildSummaryLogSectionNormalizedFieldDefinition(key) {
  const currentKey = normalizeStringArg(key);
  return Object.freeze({
    key: currentKey,
    value: (section) => normalizeStringArg(section && section[currentKey])
  });
}

// 每个 build-summary section 都会共享 kind/stats/lookupRegistry 这三项基础字段，这里统一成 base definitions。
const BUILD_SUMMARY_LOG_SECTION_BASE_PAYLOAD_DEFINITIONS = Object.freeze([
  createBuildSummaryLogSectionNormalizedFieldDefinition("kind"),
  createBuildSummaryLogSectionSourceFieldDefinition("stats"),
  createBuildSummaryLogSectionSourceFieldDefinition("lookupRegistry")
]);

// build-summary 各类 section 在执行前都先裁成标准 payload；这里按 kind 注册仅属于该 kind 的补充字段。
const BUILD_SUMMARY_LOG_SECTION_SPECIFIC_PAYLOAD_DEFINITION_MAP = Object.freeze({
  "metric-sections": Object.freeze([
    createBuildSummaryLogSectionArrayFieldDefinition("sections")
  ]),
  "definition-handler-sections": Object.freeze([
    createBuildSummaryLogSectionArrayFieldDefinition("sections"),
    createBuildSummaryLogSectionNormalizedFieldDefinition("phase")
  ]),
  "lookup-sections": Object.freeze([
    createBuildSummaryLogSectionArrayFieldDefinition("sections")
  ]),
  "diagnostic-lines": Object.freeze([
    createBuildSummaryLogSectionArrayFieldDefinition("definitions")
  ])
});

// 单个 section 实际需要的 payload definitions = 基础字段 + kind 对应的补充字段，这里统一解析避免 buildBuildSummaryLogSectionPayload 再内联分支。
function resolveBuildSummaryLogSectionPayloadDefinitions(section) {
  return BUILD_SUMMARY_LOG_SECTION_BASE_PAYLOAD_DEFINITIONS.concat(
    resolveKindRegistryValue(BUILD_SUMMARY_LOG_SECTION_SPECIFIC_PAYLOAD_DEFINITION_MAP, section && section.kind) || []
  );
}

// 单个 build-summary section 统一先标准化成 payload，后续执行器只消费 payload，避免执行层继续关心 section 原始字段名。
function buildBuildSummaryLogSectionPayload(section, context) {
  const currentSection = isObject(section) ? section : {};
  return buildDefinitionDrivenPayload(
    resolveBuildSummaryLogSectionPayloadDefinitions(currentSection),
    currentSection,
    buildBuildSummaryLogSourcePayload(context)
  );
}

// build-summary 日志 section 的各类执行器集中注册，后续若新增新的日志区块类型只需扩这里。
const BUILD_SUMMARY_LOG_SECTION_EXECUTORS = Object.freeze({
  title: () => {
    console.log(`📊 配置生成完毕 (Sub-Store.js v${SCRIPT_VERSION})`);
  },
  "metric-sections": (payload) => {
    logBuildSummaryMetricSections(payload.stats, payload.sections);
  },
  "definition-handler-sections": (payload) => {
    runDefinitionHandlerSections(
      payload.sections,
      payload.stats,
      payload.phase
    );
  },
  "lookup-sections": (payload) => {
    logBuildSummaryLookupSections(
      payload.stats,
      payload.lookupRegistry,
      payload.sections
    );
  },
  "diagnostic-lines": (payload) => {
    logBuildSummaryDiagnosticLines(payload.stats, payload.definitions);
  }
});

// 单个 build-summary 日志 section 的执行统一走注册表，避免 buildBuildSummaryLogSideEffectArtifacts 内继续手写多段调用。
function executeBuildSummaryLogSection(section, context) {
  const payload = buildBuildSummaryLogSectionPayload(section, context);
  executeKindRegistryHandler(BUILD_SUMMARY_LOG_SECTION_EXECUTORS, payload && payload.kind, payload);
}

// 按计划顺序依次执行 build-summary 日志 section，保持原日志顺序不变，同时收紧 logBuildSummary 的职责。
function runBuildSummaryLogSections(context, sections) {
  const source = Array.isArray(sections) ? sections : [];
  const currentContext = isObject(context) ? context : {};
  for (const section of source) {
    executeBuildSummaryLogSection(section, currentContext);
  }
}

// build-summary 日志副作用统一在这里执行，当前只暴露“已执行日志计划”这一项结果，避免外层关心内部步骤细节。
const BUILD_SUMMARY_LOG_SIDE_EFFECT_DEFINITIONS = Object.freeze([
  {
    key: "logged",
    value: (context) => {
      runBuildSummaryLogSections(context, BUILD_SUMMARY_LOG_SECTION_DEFINITIONS);
      return true;
    }
  }
]);

// build-summary 日志副作用统一在这里执行，logBuildSummary 只负责把 stats 交给这套计划表。
function buildBuildSummaryLogSideEffectArtifacts(payload) {
  return buildDefinitionDrivenPayload(
    BUILD_SUMMARY_LOG_SIDE_EFFECT_DEFINITIONS,
    buildBuildSummaryLogSourcePayload(payload)
  );
}

// 输出构建过程中的诊断信息，例如自动重命名和一致性校验告警。
function logDiagnostics(diagnostics) {
  // 没有诊断对象就直接跳过。
  if (!isObject(diagnostics)) {
    return;
  }

  // diagnostics 各类输出按计划批量执行，保持原顺序不变，同时减少主函数里的平铺 handler 调用。
  runDefinitionHandlerSections(DIAGNOSTIC_LOG_HANDLER_SECTIONS, diagnostics);
}

// 输出 full 模式下的构建统计信息。
function logBuildSummary(stats) {
  buildBuildSummaryLogSideEffectArtifacts({ stats });
}

// 主入口函数。
// Sub-Store 在运行脚本时会把配置对象传进来，我们在这里做二次加工。
function main(config) {
  resetRuntimeWarningState();
  const inputState = validateMainConfigInput(config);
  if (!inputState.ok) {
    return inputState.value;
  }

  // 用 try/catch 包住主流程，确保脚本出错时不会把整个配置弄坏。
  try {
    // 先清洗并规范节点名称，处理空格和重复名称问题。
    const normalizedProxyState = normalizeProxies(inputState.value.proxies);
    // 取出规范化后的有效节点列表。
    const proxies = normalizedProxyState.proxies;
    // 如果清洗完一个有效节点都没有，则回退原配置。
    if (proxies.length === 0) {
      emitWarning("⚠️ 警告: 有效代理节点为空，已返回原配置");
      return inputState.value;
    }
    // 节点规范化之后，剩余主流程统一走单文件内的阶段执行器，main 本体只保留输入守卫与异常兜底。
    const mainExecutionArtifacts = buildMainExecutionArtifacts({
      config: inputState.value,
      proxies,
      normalizedProxyState
    });
    // result / diagnostics / finalize 统一从阶段产物收尾，避免 main 继续维护长对象模板。
    return finalizeMainExecutionResult(mainExecutionArtifacts);
  } catch (error) {
    // 打印异常主信息。
    console.error(`❌ 配置生成失败: ${error.message}`);
    // 如果有堆栈也打印出来，方便定位。
    if (error && error.stack) {
      console.error(error.stack);
    }
    // 出错时回退原配置，保证用户至少还能继续使用原订阅。
    return inputState.value;
  }
}
