# Clash / Sub-Store 配置说明

## 概览

- 脚本文件：`Clash/Sub-Store.js`
- 当前版本：`V8.87.0`
- 适用内核：Mihomo / Clash.Meta / OpenClash
- 当前重点：国家分组、区域分组增强、区域布局增强、国家别名扩充、国家缩写安全优化、自定义国家别名参数化、自定义国家别名预览、自定义国家别名冲突检测、节点命名兼容增强、业务分流、AI 专项增强、Copilot AI 分流、Grok / AppleAI 社区规则、AIExtra 补充规则、DNS / Sniffer 增强、Sub-Store 官方参数与运行环境兼容、请求链路回退解析、下载响应调试、链接诊断摘要、官方链接参数语义自检、参数来源追踪、参数生效来源追踪、未消费参数追踪、策略组顺序观测、策略组布局编排、流量优先级观测、自定义规则锚点插入、GitHub 社区规则源预设、OneDrive 社区规则源切换、SteamFix 补丁规则、开发服务组、开发服务组参数化、开发服务组国家优先链、开发服务组高级项、开发服务组原始节点筛选与协议排除、开发服务组 proxy-providers 池、开发服务组 include-all 全量池、开发服务组 include-all-proxies 显式参数、开发规则统一改写、GitLab/Docker/NPM/JetBrains/Vercel/Python/JFrog/Heroku/GitBook/SourceForge/DigitalOcean/Anaconda/Atlassian/Notion/Figma/Slack/Dropbox 分流、规则层级总览观测、自定义规则区间观测、关键命中窗口观测、规则层级目标映射观测、业务规则窗口观测、规则入口映射观测、规则优先级风险观测、策略组候选链风险观测、业务链路总览观测、OneDrive 业务链路观测、整条分流链路总览、provider 缓存隔离、provider 下载控制、provider 请求头控制、现有 rule-providers 官方 type/behavior/format/path/payload 语义自检、rule-provider `payload` 作用域与 `mrs` 兼容性校验、现有 + 内置 http rule-providers 统一下载控制与请求头接管、现有 inline rule-providers 统一 payload 接管、现有 rule-providers 参数作用范围摘要、现有 rule-providers 参数命中统计、现有 rule-providers 参数命中样本预览、现有 rule-providers 参数改动统计、现有 rule-providers 参数改动样本预览、现有 rule-providers 参数无变化统计、现有 proxy-providers 统一缓存路径目录、现有 proxy-providers 通用自定义请求头、现有 proxy-providers 统一 payload 后备/inline 节点池、现有 proxy-providers 官方 type/url/path/payload 语义自检、现有 proxy-providers 下载控制与 health-check 参数化、现有 proxy-providers 节点池筛选参数化、现有 proxy-providers override 前后缀/网络/传输参数化、现有 proxy-providers override.proxy-name 正则改名参数化、现有 proxy-providers 参数作用范围摘要、现有 proxy-providers 参数命中统计、现有 proxy-providers 参数命中样本预览、现有 proxy-providers 参数改动统计、现有 proxy-providers 参数改动样本预览、现有 proxy-providers 参数无变化统计、GitHub/Steam 独立组优选链、GitHub/Steam 独立组模式、GitHub/Steam 独立组类型、GitHub/Steam 独立组专属测速、GitHub/Steam 独立组专属健康检查、GitHub/Steam 独立组原始节点筛选与协议排除、GitHub/Steam 独立组任意前置组编排、GitHub/Steam 独立组点名节点优先、GitHub/Steam/SteamCN 规则入口改写、GitHub/Steam/SteamCN 规则入口顺序编排、开发规则入口目标改写、开发规则块顺序编排、开发服务组专属测速、开发服务组专属健康检查、开发服务组 hidden/icon/disable-udp、开发服务组 `interface-name / routing-mark`、GitHub/Steam 独立组 hidden/icon/disable-udp、load-balance strategy、GitHub/Steam 独立组 proxy-providers 池、GitHub/Steam 独立组 include-all 全量池、GitHub/Steam 独立组 include-all-proxies 显式参数、expected-status 官方语法校验、全局/GitHub/Steam proxy-group `interface-name / routing-mark`

---

## V8.87.0 这一轮新增了什么

这一轮继续按你前面一直在强调的 **GitHub 社区高级玩法** 往下收，重点不是再加一个会改变分流逻辑的大开关，而是把社区里常见的 **区域聚合面板** 做成一个默认关闭、按需启用的安全增强：

1. **新增可选区域分组参数**
   - 新增参数：
     - `regionGroups`
     - `region-groups`
     - `regionalGroups`
     - `regional-groups`
     - `continentGroups`
     - `continent-groups`
   - 支持区域 token：
     - `asia`
     - `europe`
     - `americas`
     - `middleeast`
     - `oceania`
     - `africa`

2. **支持一键全开 / 显式关闭**
   - 你现在可以直接写：
     - `regionGroups=all`
     - `regionGroups=auto`
     - `regionGroups=default`
   - 也可以显式关闭：
     - `regionGroups=none`
     - `regionGroups=off`
     - `regionGroups=false`

3. **区域组只聚合“已经生成出来的国家组”**
   - 这一点是这轮最关键的行为约束：
     - 它不会跳过国家层直接去抓原始节点
     - 也不会额外改动 AI / GitHub / Steam / Dev 这些业务组的基础候选链
   - 也就是说：
     - `🌏 亚洲节点`
     - `🌍 欧洲节点`
     - `🌎 美洲节点`
     - `🕌 中东节点`
     - `🦘 大洋洲节点`
     - `🌍 非洲节点`
   - 本质上都是 **现有国家组的二次聚合层**

4. **布局系统同步接入区域桶**
   - 这轮之后：
     - `groupOrderPreset=region`
     - `groupOrder=regions,countries,...`
   - 都会真的把区域组当成独立 bucket 处理
   - 不再只是把 `region` 当成国家组别名

5. **`group-order` / `PreferGroups` 现在都能直接引用区域**
   - 例如：
     - `groupOrder=select,regions,countries,other`
     - `groupOrder=select,asia,europe,americas,other`
     - `githubPreferGroups=asia,manual`
     - `steamPreferGroups=oceania,direct`
     - `devPreferGroups=europe,lowcost`
   - 前提仍然是：
     - 这些区域组当前这轮确实已经生成出来

6. **日志与响应调试头同步补齐**
   - `full` 日志现在会新增：
     - `区域分组`
     - `区域统计`
     - `区域分组参数`
   - 打开 `responseHeaders=true` 时会新增：
     - `Region-Groups`
     - `Region-Group-Preview`
     - `Region-Group-Summary`

7. **这轮参考的 GitHub 社区思路**
   - 重点参考：
     - `chen08209/FlClash` 里关于“按当前真实节点动态生成策略组”的讨论
     - 一些社区按国家组继续聚合成区域面板的现成配置思路
   - 这一轮脚本采用的是更保守的落地方式：
     - **只聚合已生成国家组**
     - **默认关闭**
     - **不把区域组塞进主功能候选池**

8. **直接可抄的示例**

```text
...?target=ClashMeta&full&regionGroups=asia,europe,americas&groupOrder=select,ai,github,steam,regions,countries,other,extras
```

## V8.86.0 这一轮新增了什么

这一轮继续顺着你现在的玩法往下做，两块一起补：

1. **继续扩一批常见机场国家**
   - 新增：
     - `卢森堡`
     - `爱沙尼亚`
     - `拉脱维亚`
     - `立陶宛`
     - `保加利亚`
     - `克罗地亚`
     - `斯洛伐克`
     - `斯洛文尼亚`
     - `卡塔尔`
     - `科威特`

2. **继续补城市 / 机房命名**
   - 例如：
     - `Luxembourg / Tallinn / Riga / Vilnius`
     - `Sofia / Zagreb / Bratislava / Ljubljana`
     - `Doha / Kuwait City`
   - 中文也同步补了：
     - `卢森堡市 / 塔林 / 里加 / 维尔纽斯`
     - `索菲亚 / 萨格勒布 / 布拉迪斯拉发 / 卢布尔雅那`
     - `多哈 / 科威特城`

3. **继续保持“安全缩写”思路**
   - 这轮新增国家里，部分两位缩写继续偏保守：
     - `立陶宛` 不主打 `LT`
     - `保加利亚` 不主打 `BG`
   - 还是优先依赖：
     - 中文名
     - 三位缩写
     - 英文全名
     - 城市名

4. **`countryExtraAliases` 新增冲突检测**
   - 现在如果你把：
     - 同一个别名绑给多个国家
     - 或者把一个别名绑到了会撞上别的内置国家标记的写法
   - 脚本会直接给出显式警告

5. **冲突检测覆盖的两类问题**
   - **同别名多国家**
     - 例如：`日本:TYO;狮城:TYO`
     - 这种会提示该别名同时指向多个国家
   - **撞内置国家标记**
     - 例如把一个原本已明显属于别国的标记，硬绑到另一个国家
     - 会提示可能造成国家识别或优先链歧义

6. **日志 / 响应头同步补齐**
   - `full` 日志里的：
     - `国家附加别名`
   - 现在会额外带：
     - `conflicts=...`
     - `conflict-preview=...`
   - 打开 `responseHeaders=true` 时会新增：
     - `Country-Extra-Alias-Conflicts`
     - `Country-Extra-Alias-Conflict-Preview`

7. **一个直接可抄的冲突示例**

```text
...?target=ClashMeta&full&countryExtraAliases=日本:TYO;狮城:TYO;日本:London
```

   - 这类配置现在会明确提示：
     - `TYO` 同时指向多个国家
     - `London` 会撞到 `英国` 的内置国家标记

## V8.85.0 这一轮新增了什么

这一轮继续沿着你现在的命名风格往下补，两件事一起做：

1. **继续扩充一批常见机场国家**
   - 新增：
     - `捷克`
     - `匈牙利`
     - `罗马尼亚`
     - `希腊`
     - `乌克兰`
     - `冰岛`
     - `埃及`
     - `智利`
     - `哥伦比亚`
     - `秘鲁`

2. **继续补常见城市 / 机房命名**
   - 例如：
     - `Prague / Budapest / Bucharest / Athens / Kyiv / Kiev`
     - `Reykjavik / Cairo`
     - `Santiago / Bogota / Bogotá / Lima`
   - 对应中文也补了：
     - `布拉格 / 布达佩斯 / 布加勒斯特 / 雅典 / 基辅`
     - `雷克雅未克 / 开罗`
     - `圣地亚哥 / 波哥大 / 利马`

3. **继续保持“安全缩写”思路**
   - 这轮新增国家里，部分两位缩写继续偏保守处理：
     - `罗马尼亚` 不主打 `RO`
     - `冰岛` 不主打 `IS`
     - `埃及` 不主打 `EG`
     - `智利` 不主打 `CL`
     - `哥伦比亚` 不主打 `CO`
     - `秘鲁` 不主打 `PE`
   - 依旧优先依赖：
     - 中文名
     - 三位缩写
     - 英文全名
     - 常见城市名

4. **`countryExtraAliases` 新增预览摘要**
   - 现在除了统计数量，还会额外输出简短预览
   - `full` 日志里会看到：
     - `国家附加别名: configured,countries=...,aliases=...,preview=...`
   - 打开 `responseHeaders=true` 时会新增：
     - `Country-Extra-Alias-Preview`

5. **预览能解决什么**
   - 以前只能知道你有没有开 `countryExtraAliases`
   - 现在还能直接看见脚本大概把哪些别名绑到了哪些国家
   - 更适合排查：
     - 写错国家名
     - 写错别名
     - 传了值但没按预期命中优先链

6. **一个示例**

```text
...?target=ClashMeta&full&countryExtraAliases=日本:TYO|东京家宽;狮城:SG-Home|新加坡住宅;捷克:Prague-Home|布拉格家宽
```

   - 这时日志 / 响应头里会看到类似预览：
   - `日本=TYO/东京家宽;狮城=SG-Home/新加坡住宅;捷克=Prague-Home/布拉格家宽`

## V8.84.0 这一轮新增了什么

这一轮继续把 **国家识别** 做成可参数化扩展，不用每次都回头改脚本源码：

1. **新增 `countryExtraAliases` 参数**
   - 兼容这些名字：
     - `countryExtraAliases`
     - `country-extra-aliases`
     - `countryAliases`
     - `country-aliases`
     - `countryAliasMap`
     - `country-alias-map`
   - 作用：
     - 给内置国家定义继续追加你自己的节点命名别名
     - 适合机场自定义风格，比如 `TYO / SG-Home / 东京家宽 / 新加坡住宅`

2. **支持多种输入格式**
   - 字符串写法支持：
     - `国家:别名1|别名2;国家2:别名3|别名4`
     - 分隔符兼容：`;` / `；` / 换行 / `||`
     - 键值分隔兼容：`:` / `：` / `=`
   - 也支持 JSON / 对象风格：

```json
{
  "countryExtraAliases": {
    "日本": ["TYO", "东京家宽"],
    "狮城": ["SG-Home", "新加坡住宅"],
    "大马": ["MY-Home", "吉隆坡家宽"]
  }
}
```

3. **别名不只是识别国家，还会同步参与优先链匹配**
   - `countryExtraAliases` 追加进去的别名会同时参与：
     - 节点国家识别
     - `aiPreferCountries`
     - `cryptoPreferCountries`
     - `githubPreferCountries`
     - `steamPreferCountries`
     - `devPreferCountries`
   - 也就是说你可以继续按你自己的节点命名直接喂给优先链，但前提是这些标记先通过 `countryExtraAliases` 绑定到了内置国家

4. **日志 / 响应头同步补齐**
   - `full` 日志会新增：
     - `国家附加别名`
   - 打开 `responseHeaders=true` 时会新增：
     - `Country-Extra-Aliases`
     - `Country-Extra-Alias-Countries`
     - `Country-Extra-Alias-Entries`

5. **错误写法不会静默失效**
   - 如果条目格式不对，脚本会输出显式警告
   - 如果国家标记没命中内置国家定义，也会输出显式警告
   - 例如把一个不存在的国家名塞进去，不会悄悄吞掉不提示

6. **直接可抄的示例**

```text
...?target=ClashMeta&full&countryExtraAliases=日本:TYO|东京家宽;狮城:SG-Home|新加坡住宅;大马:MY-Home|吉隆坡家宽
```

   - 这类别名追加后：
     - 节点名里出现 `TYO / 东京家宽` 时，会按 `日本` 归组
     - 节点名里出现 `SG-Home / 新加坡住宅` 时，会按 `狮城` 归组
     - 同时也能直接拿去喂给各类 `PreferCountries`

## V8.83.0 这一轮新增了什么

这一轮继续往下补 **国家识别**，同时做一层 **别名安全优化**：

1. **继续扩充更多常见机场国家**
   - 新增：
     - `瑞士`
     - `瑞典`
     - `挪威`
     - `芬兰`
     - `丹麦`
     - `葡萄牙`
     - `爱尔兰`
     - `比利时`
     - `奥地利`
     - `波兰`
     - `南非`
     - `以色列`
     - `新西兰`

2. **继续补常见城市别名**
   - 例如：
     - `Zurich / Geneva`
     - `Stockholm / Oslo / Helsinki / Copenhagen`
     - `Lisbon / Dublin / Brussels / Vienna / Warsaw`
     - `Johannesburg / Cape Town`
     - `Tel Aviv / Jerusalem`
     - `Auckland`

3. **缩写误判继续收紧**
   - 为了避免普通英文单词误伤节点名，这一轮对部分两位缩写做了保守处理：
     - `IT`
     - `IN`
     - `MY`
     - `CH`
     - `NO`
     - `PT`
     - `IE`
     - `IL`
   - 这些国家现在更依赖：
     - 中文名
     - 三位缩写
     - 英文全名
     - 常见城市名

4. **国家显示名速查**
   - 当前常见内置显示名包括：
     - `香港 / 澳门 / 台湾 / 日本 / 狮城 / 韩国 / 美国 / 阿根廷 / 巴西 / 枫叶`
     - `英国 / 德国 / 法国 / 荷兰 / 意大利 / 西班牙 / 瑞士 / 瑞典 / 挪威 / 芬兰 / 丹麦`
     - `葡萄牙 / 爱尔兰 / 比利时 / 奥地利 / 波兰 / 土耳其 / 印度 / 大马 / 泰国 / 越南 / 菲律宾 / 印尼`
     - `阿联酋 / 沙特 / 墨西哥 / 南非 / 以色列 / 新西兰 / 袋鼠 / 毛熊`
   - 这些名字也都可以直接用于：
     - `aiPreferCountries`
     - `cryptoPreferCountries`
     - `githubPreferCountries`
     - `steamPreferCountries`
     - `devPreferCountries`

## V8.82.0 这一轮新增了什么

这一轮继续按你当前脚本的 **国家命名方式** 往下补：

1. **继续扩充国家/地区识别**
   - 新增常见机场节点识别：
     - `澳门`
     - `荷兰`
     - `意大利`
     - `西班牙`
     - `印度`
     - `大马`
     - `泰国`
     - `越南`
     - `菲律宾`
     - `印尼`
     - `阿联酋`
     - `沙特`
     - `墨西哥`

2. **继续沿用你现在的显示风格**
   - 保持：
     - `狮城`
     - `枫叶`
     - `袋鼠`
     - `毛熊`
   - 新增里也继续按这个思路处理：
     - `马来西亚` 显示为 `大马`
     - `印度尼西亚` 显示为 `印尼`

3. **国家别名继续补足**
   - 每个国家都继续补了：
     - 中文名
     - 常见英文名
     - 两位/三位缩写
     - 常见城市名
   - 这样更适合机场常见节点命名：
     - `Kuala Lumpur / Penang / Johor`
     - `Amsterdam / Rotterdam`
     - `Dubai / Abu Dhabi`
     - `Mumbai / Delhi / Bangalore`
     - `Hanoi / Ho Chi Minh`

4. **效果**
   - 现在这些节点更容易直接归入对应国家组
   - AI / Crypto / GitHub / Steam / Dev 的国家优先链也能直接复用这些新增国家组

## V8.81.0 这一轮新增了什么

这一轮继续去 **GitHub 检索相关项目**，重点看两件事：

1. 有没有现成、稳定、颗粒度合适的社区规则可直接复用
2. 社区成熟配置到底是怎么处理“**哪些流量先走**”这件事

1. **OneDrive 社区规则源接管继续补齐**
   - GitHub 检索确认：
     - `blackmatrix7/ios_rule_script` 当前提供稳定的 `OneDrive.yaml`
   - 现在脚本会保持：
     - 默认仍使用 MetaCubeX `onedrive` geosite
     - 当设置 `ruleSourcePreset=blackmatrix7` 时：
       - `OneDrive` 也会自动切到 `blackmatrix7` 的 Clash YAML 规则

2. **OneDrive 纳入业务链路观测**
   - 已同步补齐的位置：
     - `业务链路总览`
     - `规则顺序锚点别名`
   - 现在排查 OneDrive / SharePoint 文件同步类流量时：
     - 可以直接看到它最终进了哪个组
     - 也能直接把它当成规则顺序锚点来调前后位置

3. **OneDrive 规则锚点别名继续扩展**
   - 现在规则顺序锚点还支持直接写：
     - `onedrive`
     - `sharepoint`
     - `skydrive`
     - `1drv`

4. **GitHub 项目检索后的顺序结论同步写清**
   - 这轮额外参考了：
     - `powerfullz/override-rules`
     - `mihomo-party-org/override-hub`
   - 结论仍然非常一致：
     - 真正决定“哪些流量先走”的第一优先级，还是 `rules` 顺序
     - 规则命中之后，才会进入目标策略组，再按组内候选链决定最终出口

## V8.80.0 这一轮新增了什么

这一轮继续把 **文件协作规则** 接进现有 `🧑‍💻 开发服务`：

1. **新增开发生态规则入口**
   - 新增内置规则提供器：
     - `Dropbox`
   - 当前实现：
     - 直接复用 `blackmatrix7/ios_rule_script` 的 Clash YAML 规则

2. **默认统一进入开发服务组**
   - 当前行为：
     - `Dropbox -> 🧑‍💻 开发服务`
   - 当前覆盖：
     - `dropbox.com`
     - `dropboxapi.com`
     - `dropboxusercontent.com`
     - `dropboxbusiness.com`
     - `db.tt`

3. **开发链路观测继续补齐**
   - 已同步纳入：
     - `业务规则窗口`
     - `业务链路总览`
     - `分流链路总览`
     - `规则顺序锚点别名`

4. **现有开发参数继续自动复用**
   - 不新增新参数
   - 但以下现有参数现在会继续同时影响新规则：
     - `devRuleTarget`
     - `devRuleAnchor`
     - `devRulePosition`
     - `devPreferCountries`
     - `devPreferGroups`
     - `devPreferNodes`
     - `devUseProviders`
     - `devIncludeAll / devIncludeAllProviders / devIncludeAllProxies`

5. **规则锚点别名继续补齐**
   - 现在还支持直接写：
     - `dropbox`
     - `dbtt`

6. **GitHub 检索补充结论**
   - 这轮继续去 GitHub 检索了：
     - `Netlify`
     - `Supabase`
     - `Railway`
     - `Render`
   - 当前在已检索的社区项目里，还**没有找到稳定可直接接入的现成规则**
   - 所以这一轮先不硬接，继续保持谨慎

## V8.79.0 这一轮新增了什么

这一轮继续把 **研发协作工具规则** 接进现有 `🧑‍💻 开发服务`：

1. **新增开发生态规则入口**
   - 新增内置规则提供器：
     - `Notion`
     - `Figma`
     - `Slack`
   - 当前实现：
     - 三者都直接复用 `blackmatrix7/ios_rule_script` 的 Clash YAML 规则

2. **默认统一进入开发服务组**
   - 当前行为：
     - `Notion -> 🧑‍💻 开发服务`
     - `Figma -> 🧑‍💻 开发服务`
     - `Slack -> 🧑‍💻 开发服务`
   - 也就是说：
     - `notion / notion.so / notion.site`
     - `figma.com`
     - `slack.com / slack-files.com / slack-edge.com`
     - 都会沿用现有 `devMode / devType / devPreferCountries / devUseProviders` 这一整套开发链路参数体系

3. **开发链路观测继续补齐**
   - 已同步纳入：
     - `业务规则窗口`
     - `业务链路总览`
     - `分流链路总览`
     - `规则顺序锚点别名`

4. **现有开发参数继续自动复用**
   - 不新增新参数
   - 但以下现有参数现在会继续同时影响新规则：
     - `devRuleTarget`
     - `devRuleAnchor`
     - `devRulePosition`
     - `devPreferCountries`
     - `devPreferGroups`
     - `devPreferNodes`
     - `devUseProviders`
     - `devIncludeAll / devIncludeAllProviders / devIncludeAllProxies`

5. **规则锚点别名继续补齐**
   - 现在还支持直接写：
     - `notion`
     - `figma`
     - `slack`

6. **这一轮的策略说明**
   - 在 `V8.79.0` 这一轮里，`Dropbox / Discord` 还只做了 GitHub 规则存在性确认
   - 当时暂时没直接并进 `🧑‍💻 开发服务`；后续版本里 `Dropbox` 已正式接入，而 `Discord` 仍保持保守观察

## V8.78.0 这一轮新增了什么

这一轮继续把 **协作平台开发规则** 接进现有 `🧑‍💻 开发服务`：

1. **新增开发生态规则入口**
   - 新增内置规则提供器：
     - `Atlassian`
   - 当前实现：
     - 直接复用 `blackmatrix7/ios_rule_script` 的 Clash YAML 规则

2. **默认统一进入开发服务组**
   - 当前行为：
     - `Atlassian -> 🧑‍💻 开发服务`
   - 当前覆盖：
     - `atlassian.com`
     - `bitbucket.org`
     - `statuspage.io`
     - `trello.com`
     - `trellocdn.com`

3. **开发链路观测继续补齐**
   - 已同步纳入：
     - `业务规则窗口`
     - `业务链路总览`
     - `分流链路总览`
     - `规则顺序锚点别名`

4. **现有开发参数继续自动复用**
   - 不新增新参数
   - 但以下现有参数现在会继续同时影响新规则：
     - `devRuleTarget`
     - `devRuleAnchor`
     - `devRulePosition`
     - `devPreferCountries`
     - `devPreferGroups`
     - `devPreferNodes`
     - `devUseProviders`
     - `devIncludeAll / devIncludeAllProviders / devIncludeAllProxies`

5. **规则锚点别名继续补齐**
   - 现在还支持直接写：
     - `atlassian`
     - `bitbucket`
     - `trello`
     - `statuspage`

6. **这一轮的策略说明**
   - 这次虽然继续接入了 `Atlassian`，但 README 里也明确写清了它当前覆盖范围
   - 如果后面你想把 `Bitbucket / Trello / Statuspage` 再拆成更细分的组，我下一轮可以继续拆

## V8.77.0 这一轮新增了什么

这一轮继续把 **开发云平台与数据科学常见规则** 接进现有 `🧑‍💻 开发服务`：

1. **新增开发生态规则入口**
   - 新增内置规则提供器：
     - `DigitalOcean`
     - `Anaconda`
   - 当前实现：
     - 两者都直接复用 `blackmatrix7/ios_rule_script` 的 Clash YAML 规则

2. **默认统一进入开发服务组**
   - 当前行为：
     - `DigitalOcean -> 🧑‍💻 开发服务`
     - `Anaconda -> 🧑‍💻 开发服务`
   - 也就是说：
     - `digitalocean / digitaloceanspaces / do.co`
     - `anaconda / conda.io`
     - 都会沿用现有 `devMode / devType / devPreferCountries / devUseProviders` 这一整套开发链路参数体系

3. **开发链路观测继续补齐**
   - 已同步纳入：
     - `业务规则窗口`
     - `业务链路总览`
     - `分流链路总览`
     - `规则顺序锚点别名`

4. **现有开发参数继续自动复用**
   - 不新增新参数
   - 但以下现有参数现在会继续同时影响新规则：
     - `devRuleTarget`
     - `devRuleAnchor`
     - `devRulePosition`
     - `devPreferCountries`
     - `devPreferGroups`
     - `devPreferNodes`
     - `devUseProviders`
     - `devIncludeAll / devIncludeAllProviders / devIncludeAllProxies`

5. **规则锚点别名继续补齐**
   - 现在还支持直接写：
     - `digitalocean`
     - `digitaloceanspaces`
     - `doco`
     - `anaconda`
     - `conda`

## V8.76.0 这一轮新增了什么

这一轮继续把 **GitHub 社区里稳定的开发平台规则** 接进现有 `🧑‍💻 开发服务`：

1. **新增开发生态规则入口**
   - 新增内置规则提供器：
     - `Heroku`
     - `GitBook`
     - `SourceForge`
   - 当前实现：
     - 三者都直接复用 `blackmatrix7/ios_rule_script` 的 Clash YAML 规则

2. **默认统一进入开发服务组**
   - 当前行为：
     - `Heroku -> 🧑‍💻 开发服务`
     - `GitBook -> 🧑‍💻 开发服务`
     - `SourceForge -> 🧑‍💻 开发服务`
   - 也就是说：
     - `heroku / herokuapp / herokussl`
     - `gitbook / gitbook.io`
     - `sourceforge / sf.net / fsdn`
     - 都会沿用现有 `devMode / devType / devPreferCountries / devUseProviders` 这一整套开发链路参数体系

3. **开发链路观测继续补齐**
   - 已同步纳入：
     - `业务规则窗口`
     - `业务链路总览`
     - `分流链路总览`
     - `规则顺序锚点别名`
   - 这样排查开发流量时，现在可以继续一起看：
     - `GitLab / Docker / Npmjs / JetBrains / Vercel / Python / Jfrog / Heroku / GitBook / SourceForge`

4. **现有开发参数继续自动复用**
   - 不新增新参数
   - 但以下现有参数现在会继续同时影响新规则：
     - `devRuleTarget`
     - `devRuleAnchor`
     - `devRulePosition`
     - `devPreferCountries`
     - `devPreferGroups`
     - `devPreferNodes`
     - `devUseProviders`
     - `devIncludeAll / devIncludeAllProviders / devIncludeAllProxies`

5. **规则锚点别名继续补齐**
   - 现在还支持直接写：
     - `heroku`
     - `herokuapp`
     - `gitbook`
     - `sourceforge`
     - `sf`
     - `fsdn`

## V8.75.0 这一轮新增了什么

这一轮继续把 **GitHub 社区里更常见的开发生态规则** 接进现有 `🧑‍💻 开发服务`：

1. **新增开发生态规则入口**
   - 新增内置规则提供器：
     - `Vercel`
     - `Python`
     - `Jfrog`
   - 当前实现：
     - 三者都直接复用 `blackmatrix7/ios_rule_script` 的 Clash YAML 规则

2. **默认统一进入开发服务组**
   - 当前行为：
     - `Vercel -> 🧑‍💻 开发服务`
     - `Python -> 🧑‍💻 开发服务`
     - `Jfrog -> 🧑‍💻 开发服务`
   - 也就是说：
     - `vercel.com / vercel.app / nextjs.org / turborepo.org`
     - `python.org / pypi.org / pypi.io / pypa.io`
     - `jfrog.com / bintray.com`
     - 都会直接沿用现有 `devMode / devType / devPreferCountries / devUseProviders` 这套开发链路参数体系

3. **开发链路观测继续补齐**
   - 已同步纳入：
     - `业务规则窗口`
     - `业务链路总览`
     - `分流链路总览`
     - `规则顺序锚点别名`
   - 这样排查开发流量时，不再只看 `GitLab / Docker / Npmjs / JetBrains`，而是能一起看 `Vercel / Python / Jfrog`

4. **现有开发参数自动复用**
   - 不新增新参数
   - 但以下现有参数现在会同时影响新规则：
     - `devRuleTarget`
     - `devRuleAnchor`
     - `devRulePosition`
     - `devPreferCountries`
     - `devPreferGroups`
     - `devPreferNodes`
     - `devUseProviders`
     - `devIncludeAll / devIncludeAllProviders / devIncludeAllProxies`

5. **规则锚点别名继续补齐**
   - 现在还支持直接写：
     - `vercel`
     - `nextjs`
     - `turborepo`
     - `python`
     - `pypi`
     - `pypa`
     - `jfrog`
     - `bintray`
     - `artifactory`

## V8.74.0 这一轮新增了什么

这一轮继续把 **GitHub 社区里常见、但主规则库未必完整覆盖的 AI 服务** 接进脚本：

1. **新增 Grok / AppleAI 社区规则**
   - 新增内置规则提供器：
     - `Grok`
     - `AppleAI`
   - 当前实现：
     - `Grok` 复用 `Accademia/Additional_Rule_For_Clash` 里的 `Grok.yaml`
     - `AppleAI` 复用 `Accademia/Additional_Rule_For_Clash` 里的 `AppleAI.yaml`

2. **默认继续并入 AI 链路**
   - 当前行为：
     - `Grok -> 🤖 AI`
     - `AppleAI -> 🤖 AI`
   - 也就是说：
     - `x.ai / grok.com` 这类 Grok 相关流量会先进入 AI 组
     - `Apple Intelligence / PCC / Siri AI` 相关流量也会优先沿用 AI 组的代理优先链，而不是误落到普通 Apple 直连链

3. **AI 观测链路继续补齐**
   - 这一轮继续把下面这些入口一起纳入：
     - `AIExtra`
     - `Grok`
     - `AppleAI`
   - 已同步补齐的位置：
     - `业务规则窗口`
     - `业务链路总览`
     - `规则顺序锚点别名`
     - `AI 首位 DIRECT 风险提醒`

4. **规则锚点别名继续扩展**
   - 现在规则顺序锚点还支持直接写：
     - `grok`
     - `xai`
     - `appleai`
     - `appleintelligence`
     - `privatecloudcompute`
     - `pcc`

5. **来源排查继续补齐**
   - 响应调试头新增：
     - `Grok-Rule-Url`
     - `Apple-AI-Rule-Url`
   - `full` 日志里的 `规则源参数` 也会继续直接显示：
     - `grok-rule-url`
     - `apple-ai-rule-url`

## V8.73.0 这一轮新增了什么

这一轮继续把 **GitHub 社区里常见的 AI 补充规则** 做进脚本：

1. **新增 AIExtra 规则源**
   - 新增内置规则提供器：
     - `AIExtra`
   - 默认规则文件：
     - `Clash/Ruleset/AIExtra.list`
   - 当前默认补充的社区常见域名包括：
     - `Perplexity`
     - `Cursor`
     - `HuggingFace`

2. **开放 AIExtra 规则源 URL 参数**
   - 新增参数：
     - `aiExtraListUrl`
   - 作用：
     - 可以直接把 `AIExtra` 的规则地址切到你自己 GitHub 上维护的 AI 补充列表
     - 适合继续吸收社区里新的 AI 服务域名，而不必改脚本主体

3. **AIExtra 默认进入 AI 组**
   - 当前行为：
     - `AIExtra -> 🤖 AI`
   - 也就是说：
     - `Perplexity / Cursor / HuggingFace` 这类补充规则会先进入 AI 链路
     - 再由 AI 组内部优先链继续决定走向

4. **规则锚点别名继续补齐**
   - 现在规则顺序锚点也支持直接写：
     - `AIExtra`
     - `perplexity`
     - `pplx`
     - `cursor`
     - `huggingface`
     - `hf`

5. **日志与响应头同步补齐**
   - `full` 日志里的 `规则源参数` 现已补充：
     - `ai-extra-list-url`
   - 响应调试头新增：
     - `AI-Extra-List-Url`

## V8.72.0 这一轮新增了什么

这一轮继续修正 **GitHub 社区规则源预设** 的一个实际兼容问题：

1. **校正 Anthropic 社区规则源路径**
   - 当设置 `ruleSourcePreset=blackmatrix7` 时：
     - 脚本当前会把 `Anthropic` 对应到 `blackmatrix7` 仓库里的 `Claude.yaml`
   - 原因：
     - blackmatrix7 社区当前对应 Anthropic / Claude 服务的目录命名是 `Claude`
     - 不是 `Anthropic`

2. **避免 blackmatrix7 预设取错路径**
   - 这次修正后：
     - `ruleSourcePreset=blackmatrix7` 不会再去拼错误的 `Anthropic/Anthropic.yaml`
     - 会直接走正确的 `Claude/Claude.yaml`

3. **行为与现有分流逻辑保持不变**
   - 这轮只是修正：
     - 社区规则源路径
   - 不会改变：
     - `Anthropic -> 🤖 AI`
     - `Copilot -> 🤖 AI`
     - 现有 GitHub / Steam / Dev 分流结构

4. **README 说明同步补齐**
   - 文档里关于 `ruleSourcePreset=blackmatrix7` 的描述，现已同步注明：
     - `Anthropic` 在社区规则源下实际取的是 `Claude.yaml`

## V8.71.0 这一轮新增了什么

这一轮继续把 **GitHub 社区里常见的 Copilot 规则** 接进现有 AI 分流链路：

1. **新增 Copilot 规则入口**
   - 新增内置规则提供器：
     - `Copilot`
   - 当前实现：
     - 复用 `blackmatrix7/ios_rule_script` 里的 `Copilot.yaml`
   - 默认行为：
     - `Copilot -> 🤖 AI`

2. **Copilot 纳入 AI 观测链路**
   - `业务规则窗口`
   - `业务链路总览`
   - `规则顺序锚点别名`
   - 现在都会继续把 `Copilot` 一起纳入统计与预览

3. **AI 风险提醒同步增强**
   - 当 `🤖 AI` 组当前第一个候选是 `DIRECT` 时：
     - 提醒文案现在会把 `Copilot` 一起纳入
   - 这样在排查 AI / Copilot 请求为什么没先进代理时，会更直观

4. **blackmatrix7 规则源说明同步更新**
   - 当设置 `ruleSourcePreset=blackmatrix7` 时：
     - 文档里的“已接管规则源”说明现在也会继续包含 `Copilot`
   - 同时：
     - `Copilot` 当前本身就是社区规则源能力，便于直接和现有 AI 链路一起使用

5. **默认行为继续保持兼容**
   - 不需要传新参数：
     - 只是在现有 AI 分流里继续补齐一条社区常见服务规则
   - 也就是说：
     - 这轮补的是 `Copilot -> AI`
     - 不会破坏现有 GitHub / Steam / Dev 的分流结构

## V8.70.0 这一轮新增了什么

这一轮继续把 **开发服务组** 往 GitHub / Steam 独立组的“国家优先链 + 候选顺序”补齐：

1. **开放开发服务组国家优先链**
   - 新增参数：
     - `devPreferCountries`
   - 作用：
     - 可以给 `🧑‍💻 开发服务` 单独指定国家优先链
     - 让 GitLab / Docker / Npmjs / Jetbrains / Vercel / Python / Jfrog / Heroku / GitBook / SourceForge / DigitalOcean / Anaconda / Atlassian / Notion / Figma / Slack / Dropbox 流量不只沿用 `🐙 GitHub`，也能优先尝试你指定的国家组

2. **开发服务组候选顺序继续细化**
   - 当前顺序关系为：
     - `PreferNodes`
     - `PreferGroups`
     - `devPreferCountries`
     - `devMode` 基础链
   - 也就是说：
     - 你可以先点名某几个开发专线节点
     - 再插入自定义开发组
     - 再补国家优先链
     - 最后才回落到 GitHub / 节点选择 / DIRECT 的基础顺序

3. **direct 模式继续保持兼容**
   - 当 `devMode=direct` 时：
     - `DIRECT` 仍然固定第一位
     - `devPreferCountries` 会插到 `DIRECT` 后面、`GitHub` 前面
   - 这样可以兼顾：
     - 直连优先
     - 开发国家优先链
     - GitHub 独立组兜底

4. **业务链路诊断同步修正**
   - 开发服务组现在开启：
     - `devPreferCountries`
     - `devPreferGroups`
     - `devPreferNodes`
     时，不再沿用旧版“默认 GitHub 第一位”的误判逻辑
   - 同时：
     - 如果你只设置了 `devPreferCountries`，但开发组头部仍然没有进入优先国家链，脚本会显式提醒

5. **full 日志与响应调试头同步补齐**
   - `full` 日志里的：
     - `国家优先链`
     - 现在会继续输出 `dev=...`
   - 响应调试头新增：
     - `GitHub-Prefer-Countries`
     - `Steam-Prefer-Countries`
     - `Dev-Prefer-Countries`

6. **默认行为继续保持兼容**
   - 不传 `devPreferCountries` 时：
     - `🧑‍💻 开发服务` 仍然默认优先沿用 `🐙 GitHub`
   - 也就是说：
     - 这轮补的是“开发服务组国家优先链”
     - 默认不会改变你现有配置的分流结果

## V8.69.0 这一轮新增了什么

这一轮继续把 **开发服务组** 往 GitHub / Steam 独立组的“节点池 + Provider 池”玩法补齐：

1. **开放开发服务组 proxy-providers 池**
   - 新增参数：
     - `devUseProviders`
     - `devIncludeAllProviders`
     - `devIncludeAll`
   - 作用：
     - `devUseProviders` 会把命中的 `proxy-providers` 写进 `🧑‍💻 开发服务` 的 `use`
     - `devIncludeAllProviders=true` 会给开发服务组挂上 `include-all-providers`
     - `devIncludeAll=true` 会给开发服务组挂上 Mihomo 官方 `include-all`

2. **开放开发服务组原始节点池**
   - 新增参数：
     - `devNodeFilter`
     - `devNodeExcludeFilter`
     - `devNodeExcludeType`
     - `devIncludeAllProxies`
   - 作用：
     - 可以让 `🧑‍💻 开发服务` 在显式候选链之外，继续自动吸收匹配到的原始节点
     - 适合把 `IEPL / 家宽 / GitHub 专线 / Docker 专线` 这类节点单独并进开发服务组

3. **支持混合池玩法**
   - 开发服务组现在支持同时组合：
     - 显式候选链
     - `PreferGroups / PreferNodes`
     - 原始节点池
     - `proxy-providers` 池
   - 也就是说：
     - 可以让开发流量先走你手工编排的开发专线
     - 后面再补一层自动筛选原始节点
     - 最后继续挂上指定 provider 池做兜底

4. **优先级关系与行为说明同步补齐**
   - 优先级仍然保持和 GitHub / Steam 独立组一致：
     - `include-all` 高于 `include-all-providers`
     - `include-all-providers` 高于 `use`
   - 同时：
     - `include-all / use / include-all-providers` 仍然可以和 `NodeFilter / NodeExcludeFilter / NodeExcludeType` 叠加使用
     - 真正决定“哪些流量先走”的第一优先级仍然是 `rules` 顺序；规则命中后，才会进入 `🧑‍💻 开发服务` 组内按候选链继续选择

5. **响应头、full 日志、README 全部同步**
   - `_res.headers` 新增：
     - `Dev-Use-Providers`
     - `Dev-Include-All`
     - `Dev-Include-All-Proxies`
     - `Dev-Include-All-Providers`
     - `Dev-Auto-Proxies`
   - `full` 日志补齐：
     - `独立组Provider池` 中的 `dev=...`
     - `独立组节点池` 中的 `dev-...`

6. **默认行为继续保持兼容**
   - 不传这些新参数时：
     - `🧑‍💻 开发服务` 仍然默认优先沿用 `🐙 GitHub`
     - GitLab / Docker / Npmjs / Jetbrains / Vercel / Python / Jfrog / Heroku / GitBook / SourceForge / DigitalOcean / Anaconda / Atlassian / Notion / Figma / Slack / Dropbox 仍然默认进入开发服务组
   - 也就是说：
     - 这轮补的是“节点池与 Provider 池深度”
     - 默认不会改变你现有配置的分流结果

## V8.68.0 这一轮新增了什么

这一轮继续把 **开发服务组高级项** 补齐到更接近 GitHub / Steam 独立组的深度：

1. **开发服务组补齐专属测速参数**
   - 新增参数：
     - `devTestUrl`
     - `devGroupInterval`
   - 作用：
     - 当 `devType=url-test / fallback / load-balance` 时
     - 可以给 `🧑‍💻 开发服务` 单独指定测速地址与间隔

2. **开发服务组补齐专属健康检查参数**
   - 新增参数：
     - `devGroupTolerance`
     - `devGroupTimeout`
     - `devGroupLazy`
     - `devGroupMaxFailedTimes`
     - `devGroupExpectedStatus`
   - 作用：
     - 允许单独调开发服务组的延迟容差、超时、lazy、失败次数与 expected-status

3. **开发服务组补齐 load-balance strategy**
   - 新增参数：
     - `devGroupStrategy`
   - 作用：
     - 当 `devType=load-balance` 时
     - 可以单独给开发服务组设置 `round-robin / consistent-hashing / sticky-sessions`

4. **开发服务组补齐展示与网络高级项**
   - 新增参数：
     - `devHidden`
     - `devDisableUdp`
     - `devIcon`
     - `devInterfaceName`
     - `devRoutingMark`
   - 作用：
     - 让开发服务组也能像 GitHub / Steam 独立组一样支持隐藏、图标、关闭 UDP，以及专属网络字段

5. **诊断、响应头、full 日志继续同步补齐**
   - `_res.headers` 新增：
     - `Dev-Test-Url`
     - `Dev-Group-Strategy`
     - `Dev-Hidden`
     - `Dev-Disable-UDP`
     - `Dev-Icon`
     - `Dev-Interface-Name`
     - `Dev-Routing-Mark`
   - `full` 日志新增：
     - `开发服务组高级项`

6. **默认行为仍然保持兼容**
   - 不传这些新参数时：
     - 开发服务组继续复用脚本原本的全局测速参数和默认展示行为
   - 也就是说：
     - 这轮只是把开发服务组调优深度补齐
     - 默认不会改变你现有配置的分流结果

## V8.67.0 这一轮新增了什么

这一轮把 **开发服务组** 继续往“可独立编排、可独立改写、可独立调优先级”推进：

1. **开发服务组升级为可独立参数化**
   - 新增参数：
     - `devMode`
     - `devType`
   - 可选值：
     - `devMode`: `select / direct / proxy`
     - `devType`: `select / url-test / fallback / load-balance`
   - 默认行为：
     - `devMode=select`
     - `devType=select`
   - 作用：
     - 让 `🧑‍💻 开发服务` 不再只能固定写死为 “GitHub -> 节点选择”
     - 现在可以切成直连优先、纯代理优先，或者直接改成测速/故障转移/负载均衡型组

2. **开发服务组新增前置组与点名节点能力**
   - 新增参数：
     - `devPreferGroups`
     - `devPreferNodes`
   - 作用：
     - `devPreferGroups` 负责把已有策略组 / 内置策略插到开发服务组最前面
     - `devPreferNodes` 负责把明确节点名直接顶到开发服务组头部
   - 规则：
     - `devPreferNodes` 优先级高于 `devPreferGroups`
     - `devMode=direct` 时仍会强制保持 `DIRECT` 第一位

3. **开发规则入口支持统一改写**
   - 新增参数：
     - `devRuleTarget`
   - 作用：
     - 一次性同时改写 `GitLab / Docker / Npmjs / Jetbrains / Vercel / Python / Jfrog / Heroku / GitBook / SourceForge / DigitalOcean / Anaconda / Atlassian / Notion / Figma / Slack / Dropbox` 这十七条开发规则的目标组
     - 适合把整组开发流量临时切到 `manual / DIRECT / 节点选择 / 你自己的自定义组`

4. **开发规则块支持统一顺序编排**
   - 新增参数：
     - `devRuleAnchor`
     - `devRulePosition`
   - 作用：
     - 把整块开发规则一起移动到指定锚点前后
     - 便于直接控制“开发流量”是在 `GitHub` 前命中、`Steam` 前命中，还是继续留在 `Geo_Not_CN` 后
   - 特点：
     - 会保持 `GitLab -> Docker -> Npmjs -> Jetbrains` 的内部相对顺序
     - 不允许把锚点写成开发规则块自己

5. **诊断、日志、响应头同步补齐**
   - `_res.headers` 新增：
     - `Dev-Mode`
     - `Dev-Type`
     - `Dev-Prefer-Groups`
     - `Dev-Prefer-Nodes`
     - `Dev-Rule-Order`
     - `Dev-Rule-Target`
   - `full` 日志也会新增：
     - `开发服务组`
     - `规则顺序编排` 中的 `dev=...`
     - `规则入口目标` 中的 `dev=...`

6. **默认行为继续保持兼容**
   - 不传任何 `dev*` 参数时：
     - `🧑‍💻 开发服务` 仍然默认优先走 `🐙 GitHub`
     - GitLab / Docker / NPM / JetBrains / Vercel / Python / JFrog / Heroku / GitBook / SourceForge / DigitalOcean / Anaconda / Atlassian / Notion / Figma / Slack / Dropbox 仍然默认进入 `🧑‍💻 开发服务`
   - 也就是说：
     - 这轮增强默认不会改你现在已有的分流结果
     - 只有显式传参时才改变开发流量的优先级和入口位置

## V8.66.0 这一轮新增了什么

这一轮继续把 **开发生态流量** 独立出来：

1. **新增开发服务组**
   - 新增脚本内置组：
     - `🧑‍💻 开发服务`
   - 默认候选链：
     - `GitHub` 独立组优先
     - 再回落到主选择链

2. **新增开发生态规则**
   - 新增内置规则：
     - `GitLab`
     - `Docker`
     - `Npmjs`
     - `Jetbrains`
   - 默认行为：
     - 全部进入 `🧑‍💻 开发服务`

3. **业务观测同步扩展**
   - `业务规则窗口`
   - `业务链路总览`
   - `分流链路总览`
   - 现在都会继续把开发生态规则纳入统计

4. **规则源策略**
   - 这几条新开发生态规则当前统一采用 blackmatrix7 的 Clash YAML 规则
   - 这样能直接利用 GitHub 社区里更细的开发服务规则颗粒度

5. **默认行为保持兼容**
   - 这轮不新增强制参数
   - 不会破坏你现有 GitHub / Steam / AI / Crypto 的逻辑
   - 只是额外把开发生态流量单独拎出来

## V8.65.0 这一轮新增了什么

这一轮继续把 **GitHub 社区高级玩法** 往下收敛：不是直接抄别人的整份配置，而是把社区里最有价值的规则源和补丁玩法做成脚本参数。

1. **新增社区规则源预设**
   - 新增参数：
     - `ruleSourcePreset`
   - 当前支持：
     - `meta`
     - `blackmatrix7`
   - 作用：
     - 默认 `meta` 继续使用 MetaCubeX 内置 geosite/geoip 规则
      - 切到 `blackmatrix7` 后，会把内置的 `GitHub / Steam / SteamCN / OpenAI / Anthropic / Gemini / Copilot / OneDrive` 规则切到 `blackmatrix7/ios_rule_script` 的 Clash YAML 规则

2. **新增 SteamFix 补丁开关**
   - 新增参数：
     - `steamFix`
     - `steamFixUrl`
   - 作用：
     - `steamFix=true` 时，会额外挂一个 `SteamFix` 规则
     - 默认把这条补丁规则放在 `Steam / SteamCN` 前面，并直连处理
     - 适合想减少 Steam 商店、下载、CDN 类流量被误送进代理组的场景

3. **顺序观测继续补齐**
   - `SteamFix` 开启后：
     - `关键命中窗口`
     - `分流链路总览`
   - 都会一起观察到这条规则

4. **响应头与 full 日志同步补齐**
   - `_res.headers` 新增：
     - `Rule-Source-Preset`
     - `Steam-Fix`
     - `Steam-Fix-Url`
   - `full` 日志里的 `规则源参数` 也会直接显示当前社区规则源预设与 SteamFix 状态

5. **默认行为保持稳妥**
   - 不传 `ruleSourcePreset`
     - 继续走默认 `meta`
   - 不传 `steamFix`
     - 不启用 SteamFix
   - 也就是说：
     - 这轮增强默认不改你现有配置的分流行为
     - 只有显式开启时才接管到 GitHub 社区规则玩法

## V8.64.0 这一轮新增了什么

这一轮继续把 **顺序控制** 从“只看不改”推进到“直接编排”：

1. **新增策略组布局参数**
   - 新增参数：
     - `groupOrderPreset`
     - `groupOrder`
   - 作用：
     - `groupOrderPreset` 用预设整体重排 `proxy-groups`
     - `groupOrder` 用显式 token 顺序强行指定面板展示顺序

2. **新增自定义规则锚点参数**
   - 新增参数：
     - `customRuleAnchor`
     - `customRulePosition`
   - 作用：
     - 把 `config.rules` 插到指定 `RULE-SET` 锚点前后
     - 真正控制自定义规则到底是先于 `Geo_Not_CN`、`Steam`、`GitHub`，还是继续留在 `MATCH` 前

3. **策略组布局支持预设 + 显式 token**
   - `groupOrderPreset` 当前支持：
     - `balanced`
     - `core`
     - `service`
     - `media`
     - `region`
   - `groupOrder` 当前支持：
     - 单个组别名，如 `select / ai / github / steam / direct / ads`
     - 分组桶，如 `media / countries / extras / core / services`

4. **顺序参数不命中时不会静默失效**
   - 如果 `groupOrder` 里的 token 没匹配到任何策略组/分组桶
   - 或者 `customRuleAnchor` 没命中任何规则入口
   - 脚本会：
     - 输出显式告警
     - 保持可回退的默认顺序

5. **日志与响应头同步补齐**
   - `full` 日志新增：
     - `策略组编排`
     - `自定义规则编排`
     - `策略组布局告警`
     - `自定义规则编排告警`
   - 响应调试头新增：
     - `Group-Order-Preset`
     - `Group-Order-Config`
     - `Custom-Rule-Order`

## V8.63.0 这一轮新增了什么

这一轮继续把 **业务规则前后关系** 往下补：现在不只知道关键规则窗口，还能继续把 `AI / Crypto / GitHub / 开发服务 / Steam` 以及 `AIExtra / Copilot / Grok / AppleAI` 这些业务规则各自前后 2 跳一起拉平。

1. **新增业务规则窗口摘要**
   - 不新增新参数
   - 但会额外输出：
     - `Service-Rule-Window-Summary`
     - `Service-Rule-Window-Preview`
   - 会直接告诉你：
     - 当前跟踪了多少条业务规则
     - 成功找到多少条
     - 其中 AI / 开发 / 交易 / 游戏分别多少条
     - 有没有缺失
     - 这些业务规则整体跨越了哪一段区间

2. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Service-Rule-Window-Summary`
     - `Service-Rule-Window-Preview`

3. **full 日志继续补齐**
   - 新增：
     - `业务规则窗口`
   - 日志字段形如：`业务规则窗口: tracked=30,found=30,ai=9,dev=18,trade=1,game=2,missing=0,span=5-51,order=ChatGPT@5|AIExtra@6|OpenAI@7|...|SteamCN@51, preview=Slack@41[prev=Figma->🧑‍💻 开发服务,curr=Slack->🧑‍💻 开发服务,next=Dropbox->🧑‍💻 开发服务|Steam->🚂 Steam]`

## V8.62.0 这一轮新增了什么

这一轮继续把 **规则层级与目标组的关系** 往下补：现在不只知道分层顺序，还能继续看出每一层主要把流量送进了哪些目标组。

1. **新增规则层级目标映射摘要**
   - 不新增新参数
   - 但会额外输出：
     - `Rule-Layer-Target-Summary`
     - `Rule-Layer-Target-Preview`
   - 会直接告诉你：
     - 当前总规则数
     - 当前一共涉及多少层
     - 当前一共涉及多少目标组
     - 哪几层规则最多
     - 哪几个目标组承接规则最多

2. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Rule-Layer-Target-Summary`
     - `Rule-Layer-Target-Preview`

3. **full 日志继续补齐**
   - 新增：
     - `规则层级目标映射`
   - 日志字段形如：`规则层级目标映射: total=35,layers=9,targets=14,top-layers=service:14|ai:5|block:2,top-targets=🎯 全球直连:6|🚀 节点选择:4|🤖 AI服务:5, preview=service->🍎 Apple:2|ai->🤖 AI服务:5...`

## V8.61.0 这一轮新增了什么

这一轮继续把 **关键规则前后顺序** 往下补：现在不只知道有无风险，也能继续把 `Geo_Not_CN / DirectList / CN / CN_IP / GitHub / Steam / SteamCN / MATCH` 的实际位置和前后邻居一起拉平输出。

1. **新增关键命中窗口摘要**
   - 不新增新参数
   - 但会额外输出：
     - `Key-Rule-Window-Summary`
     - `Key-Rule-Window-Preview`
   - 会直接告诉你：
     - 关键规则一共找到多少条
     - 其中 blocker 类找到多少条
     - 其中业务类找到多少条
     - 有没有缺失
     - `MATCH` 最终落在第几条
     - 各关键规则分别排在第几条

2. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Key-Rule-Window-Summary`
     - `Key-Rule-Window-Preview`

3. **full 日志继续补齐**
   - 新增：
     - `关键命中窗口`
   - 日志字段形如：`关键命中窗口: found=8,blockers=4,business=3,missing=0,match=35,order=Geo_Not_CN@28|GitHub@29|Steam@30..., preview=GitHub@29[Geo_Not_CN->🚀 节点选择 < GitHub->🐙 GitHub < Steam->🚂 Steam]`

## V8.60.0 这一轮新增了什么

这一轮继续把 **外部自定义规则观测** 往下补：现在不只知道最终规则分层，也能继续把 `config.rules` 这段单独拆出来看原始条数、有效插入条数、所在区间、主要类型和目标组。

1. **新增自定义规则区间摘要**
   - 不新增新参数
   - 但会额外输出：
     - `Custom-Rule-Summary`
     - `Custom-Rule-Preview`
   - 会直接告诉你：
     - `config.rules` 里去掉 `MATCH` 后原始有多少条
     - 去重后实际插进最终 `rules` 的有多少条
     - 这些规则实际落在第几条到第几条
     - 主要是什么规则类型
     - 主要打到哪些目标组

2. **自定义规则提醒继续补齐**
   - `full=true` 时，如果 `config.rules` 自己带了 `MATCH`，或去重后没有任何新规则真正插入，会额外进入：
     - `自定义规则提醒`

3. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Custom-Rule-Summary`
     - `Custom-Rule-Preview`

4. **full 日志继续补齐**
   - 新增：
     - `自定义规则区间`
   - 日志字段形如：`自定义规则区间: raw=8,effective=6,match-stripped=1,start=29,end=34,types=DOMAIN-SUFFIX:3|RULE-SET:2,targets=🚀 节点选择:4|DIRECT:2, preview=DOMAIN-SUFFIX->🚀 节点选择...`

## V8.59.0 这一轮新增了什么

这一轮继续把 **规则顺序观测** 往下补：现在不只看头尾几条规则，也能继续把整条 `rules` 按 **拦截层 / 本地直连层 / AI-Crypto 层 / 通用业务层 / 地区层 / 自定义层 / 兜底层** 拆开看。

1. **新增规则层级总览摘要**
   - 不新增新参数
   - 但会额外输出：
     - `Rule-Layer-Summary`
     - `Rule-Layer-Preview`
   - 会直接告诉你：
     - 当前总规则数
     - 一共拆成了多少层
     - 当前是否存在自定义规则层
     - `MATCH` 最后落在第几条
     - 每一层对应的区间范围，例如 `ai:6@5-10`

2. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Rule-Layer-Summary`
     - `Rule-Layer-Preview`

3. **full 日志继续补齐**
   - 新增：
     - `规则层级总览`
   - 日志字段形如：`规则层级总览: total=29,layers=8,custom=0,match=29,order=block:2@1-2|local:2@3-4|ai:6@5-10..., preview=block@1=QUIC-REJECT|local@2=Private->🎯 全球直连...`

## V8.58.0 这一轮新增了什么

这一轮继续把 **局部业务链路观测** 往下补：现在不只知道整条链怎么走，还能继续把 **GitHub / OneDrive / 开发服务 / Steam / AI / Crypto** 以及 **AIExtra / Copilot / Grok / AppleAI** 单独拆出来看规则入口、目标组、组类型和头部候选链。

1. **新增业务链路总览摘要**
   - 不新增新参数
   - 但会额外输出：
     - `Service-Routing-Summary`
     - `Service-Routing-Preview`
   - 会直接告诉你：
     - 关键业务一共跟踪了多少条
     - 其中有多少条仍然命中预期专属组
     - 有没有被直接打到 `DIRECT / 🎯 全球直连 / 🚀 节点选择`
     - 当前有多少业务组已经切到 `url-test / fallback / load-balance`
     - 哪些业务组头部已经变成 `DIRECT`

2. **业务链路提醒继续补齐**
   - `full=true` 时，除了摘要外，还会额外进入：
     - `业务链路提醒`
   - 当前重点提醒：
     - `GitHub` 被直接改写到直连组
     - `SteamCN` 被直接改写到 `🚀 节点选择`
     - `AI` 组头部变成 `DIRECT`
     - `Crypto` 组头部偏离预设国家优先链

3. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Service-Routing-Summary`
     - `Service-Routing-Preview`

4. **full 日志继续补齐**
   - 新增：
     - `业务链路总览`
   - 日志字段形如：`业务链路总览: total=27,expected=27,direct-target=0,select-target=0,latency-type=0,direct-first=1,missing=0, preview=GitHub@45->🐙 GitHub[select]=...|OneDrive@48->☁️ OneDrive[select]=...|Slack@41->🧑‍💻 开发服务[select]=...`

## V8.57.0 这一轮新增了什么

这一轮继续把 **整条分流链路** 往下补：现在不只看单点摘要，而是把 **请求入口、关键规则入口、目标组、关键组候选链** 一起串成统一总览。

1. **新增分流链路总览摘要**
   - 不新增新参数
   - 但会额外输出：
     - `Routing-Chain-Summary`
     - `Routing-Chain-Preview`
   - 会直接告诉你：
     - 当前请求路由类型/名称
     - 当前目标平台/路由目标
     - 当前 query 参数数量
     - 第一条规则是什么
     - 最终 `MATCH` 兜底到哪个组
     - 关键规则入口与关键策略组候选链摘要

2. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Routing-Chain-Summary`
     - `Routing-Chain-Preview`

3. **full 日志继续补齐**
   - 新增：
     - `分流链路总览`
   - 日志字段形如：`分流链路总览: route=download:xxx,target=ClashMeta,query=8,rules=29,first=QUIC-REJECT,match=🚀 节点选择, preview=rules=... , groups=...`

## V8.56.0 这一轮新增了什么

这一轮继续把 **策略组内部顺序诊断** 往下补：现在不只看规则谁先吃流量，也会继续检查 **关键策略组内部的候选链顺序是不是偏离了脚本原本意图**。

1. **新增策略组候选链风险摘要**
   - 不新增新参数
   - 但会额外输出：
     - `Proxy-Group-Priority-Risk-Summary`
     - `Proxy-Group-Priority-Risk-Preview`
   - 当前重点识别：
     - `🎯 全球直连` 里 `DIRECT` 没排第一
     - `🛑 广告拦截` 里 `REJECT / REJECT-DROP` 没排前面
     - `🚀 节点选择` 里 `FALLBACK / MANUAL / DIRECT` 排位异常
     - `Bing / Apple / PT / Speedtest` 这类直连优先组不再直连优先
     - `GitHub / Steam` 在不同 mode 下的候选链顺序异常

2. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Proxy-Group-Priority-Risk-Summary`
     - `Proxy-Group-Priority-Risk-Preview`

3. **full 日志继续补齐**
   - 新增：
     - `策略组候选链风险`
   - 日志字段形如：`策略组候选链风险: total=2,direct-group=1,ads-group=0,select-chain=1,..., preview=🎯 全球直连>DIRECT-not-first|🚀 节点选择>DIRECT-before-FALLBACK`

## V8.55.0 这一轮新增了什么

这一轮继续把 **规则顺序诊断** 往下补：现在不只知道规则排在前后哪里，还能继续识别 **哪些更宽泛的规则可能会抢先命中特定业务流量**。

1. **新增规则优先级风险摘要**
   - 不新增新参数
   - 但会额外输出：
     - `Rule-Priority-Risk-Summary`
     - `Rule-Priority-Risk-Preview`
   - 当前重点识别：
     - `Geo_Not_CN` 抢先 `GitHub / Steam`
     - `CN / CN_IP` 抢先 `SteamCN`
     - `DirectList` 抢先 `GitHub / Steam / SteamCN`

2. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Rule-Priority-Risk-Summary`
     - `Rule-Priority-Risk-Preview`

3. **full 日志继续补齐**
   - 新增：
     - `规则优先级风险`
   - 日志字段形如：`规则优先级风险: total=2,geo-overrides=1,cn-overrides=1,directlist-overrides=0, preview=Geo_Not_CN>GitHub|CN>SteamCN`

## V8.54.0 这一轮新增了什么

这一轮继续把 **规则链可观测性** 往下补：现在不只知道“谁先匹配”，还能直接看到 **每条规则入口最终打到哪个策略组**，以及 **哪些组承接了最多业务规则**。

1. **新增规则入口映射摘要**
   - 不新增新参数
   - 但会额外输出：
     - `Rule-Target-Summary`
     - `Rule-Target-Preview`
   - 会直接统计：
     - 规则入口总数
     - 目标组总数
     - 打到直连组的条数
     - 打到主选择组的条数
     - `MATCH` 最终兜底目标

2. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Rule-Target-Summary`
     - `Rule-Target-Preview`

3. **full 日志继续补齐**
   - 新增：
     - `规则入口映射`
   - 日志字段形如：`规则入口映射: total=27,targets=15,direct=5,select=1,match=🚀 节点选择,..., preview=ADBlock->🛑 广告拦截|Private->🎯 全球直连...`

## V8.53.0 这一轮新增了什么

这一轮继续把 **顺序可观测性** 往下补：不只看参数怎么生效，还把 **策略组在配置里的排列顺序**、**关键策略组内谁排在前面**、以及 **最终规则链到底谁先匹配流量** 一次性打平输出。

1. **新增策略组顺序 / 优先级摘要**
   - 不新增新参数
   - 但会额外输出：
     - `Proxy-Group-Order`
     - `Proxy-Group-Priority`
   - 用来区分：
     - 配置里的策略组排列顺序
     - 关键业务组内部候选的优先级顺序

2. **新增流量优先级摘要**
   - `_res.headers` 现在会额外输出：
     - `Traffic-Priority-Summary`
   - 会显式告诉你：
     - `rules` 按顺序匹配
     - 当前脚本采用 `script > config.rules > MATCH` 的合并顺序
     - 最前几条和最后几条规则分别是什么

3. **full 日志继续补齐**
   - 新增：
     - `策略组顺序`
     - `策略组优先级`
     - `流量优先级`
   - 方便直接看出：
     - 哪些组只是排在面板前面
     - 哪些业务组内部是 `DIRECT` 优先还是 `主选择` 优先
     - 哪些规则会先命中流量、最后由谁 `MATCH` 兜底

## V8.52.0 这一轮新增了什么

这一轮继续把 **参数诊断** 往下补：现在不只知道参数从哪来、最后谁赢了，还能继续看出 **哪些参数根本没有被脚本识别/消费**，方便快速排查拼写错误、别名写错，或者当前版本暂未支持的字段。

1. **新增未消费参数摘要**
   - 不新增新参数
   - 但会额外统计：
     - `total`
     - `recognized`
     - `unused`
   - 并会额外输出未消费参数名预览

2. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Unused-Arg-Summary`
     - `Unused-Arg-Preview`

3. **full 日志继续补齐**
   - 新增：
     - `未消费参数`
   - 日志字段形如：`未消费参数: total=12,recognized=10,unused=2, preview=foo|bar`
   - 当 `unused > 0` 时，还会进入 `参数诊断提醒`

## V8.51.0 这一轮新增了什么

这一轮继续把 **参数来源调试** 往下补：上一轮已经能看出参数是从哪几路进来的，这轮再补上 **最终生效来源**，直接告诉你同名参数冲突时到底是 `query / $options / $arguments` 哪一路赢了。

1. **新增参数生效来源摘要**
   - 不新增新参数
   - 但会额外统计：
     - `query-win`
     - `options-win`
     - `arguments-win`
     - `options>query`
     - `arguments>query`
     - `arguments>options`

2. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Arg-Effective-Summary`
     - `Arg-Effective-Preview`

3. **full 日志继续补齐**
   - 新增：
     - `参数生效来源`
   - 日志字段形如：`参数生效来源: total=8,query-win=2,options-win=3,arguments-win=3,...`
   - 并会额外带一段 `preview=query=... , options=... , arguments=...`

## V8.50.0 这一轮新增了什么

这一轮继续把 **运行环境可观测性** 往下补：不只看最终拿到了什么参数，还能直接看到这些参数到底是从 `$arguments`、`$options`、`_req.query`、`_req.url`、`_req.path` 还是 `_req.params` 进来的。

1. **新增参数来源摘要**
   - 不新增新参数
   - 但会额外统计：
     - `query-direct`
     - `query-options`
     - `options-top`
     - `options-nested`
     - `arguments-top`
     - `arguments-nested`
     - `req-query / req-url / req-path`
     - `route-target / route-info`
     - `merged`

2. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Arg-Source-Summary`
     - `Route-Target-Source`
     - `Route-Info-Source`

3. **full 日志继续补齐**
   - 新增：
     - `参数来源`
   - 日志字段形如：`参数来源: query-direct=2,query-options=1,options-top=0,...`
   - 会直接把当前运行时参数来源压成一行摘要，方便排查不同后端实现的差异

## V8.49.0 这一轮新增了什么

这一轮继续把 **Sub-Store 官方链接参数语义** 往下补：不只是记录当前链路里有没有 `url / content / mergeSources / produceType`，还会按官方文档直接判断这些保留参数是不是写对了、有没有真正生效。

1. **新增官方下载链接语义校验**
   - 不新增新参数
   - 但会额外校验：
     - `mergeSources` 仅支持 `localFirst / remoteFirst`
     - `produceType` 仅支持 `internal / raw`
     - `url` 不是 `http(s)` 时，按官方语义会被视为单条本地节点内容
     - `noCache / proxy / ua / ignoreFailedRemoteSub` 主要只对远程订阅 `url` 生效

2. **响应调试头继续补齐**
   - `_res.headers` 现在会额外输出：
     - `Link-Url-Kind`
     - `Link-Semantic-Summary`
     - `Link-Semantic-Check`

3. **full 日志继续补齐**
   - `下载链路` 现在会额外输出：
     - `url-kind`
   - 并新增：
     - `下载链路语义`
   - 日志摘要会直接告诉你当前这条官方下载链接到底是在走：
     - `remote-http`
     - `local-node`
     - `none`

## V8.48.0 这一轮新增了什么

这一轮继续把 **provider 改动调试** 往下补：上一轮已经能看出“哪些 provider 命中了参数”，这轮再补上 **改动样本预览**，直接告诉你哪些 provider 是新增写入、哪些是覆盖旧值、哪些其实没变化。

1. **新增 provider 改动样本预览摘要**
   - 不新增新参数
   - 但会额外输出：
     - `Rule-Provider-Mutation-Preview`
     - `Proxy-Provider-Mutation-Preview`
   - 每类状态最多展示前 `2` 个 provider 名称样本
   - 超出的剩余数量会用 `(+N)` 表示

2. **full 日志继续补齐**
   - `规则源参数` 现在会额外输出：
     - `mutation-preview`
   - `代理集合参数` 现在也会额外输出：
     - `mutation-preview`
   - 日志字段形如：`mutation-preview=path=added:CN|AI/overrode:OpenAI/noop:none,...`

3. **预览值语义统一**
   - 对应功能没开启时显示 `off`
   - 对应功能开启但某个状态没有命中时显示 `none`
   - 命中时显示 `added:.../overrode:.../noop:...` 形式的样本摘要

## V8.47.0 这一轮新增了什么

这一轮继续把 **provider 调试可观测性** 往下补：前面已经能看出“命中了多少”和“改了多少”，这轮再补上 **命中样本预览**，让你直接看到到底是哪些 provider 吃到了参数。

1. **新增 provider 命中样本预览摘要**
   - 不新增新参数
   - 但会额外输出：
     - `Rule-Provider-Apply-Preview`
     - `Proxy-Provider-Apply-Preview`
   - 每类命中最多展示前 `3` 个 provider 名称样本
   - 超出的剩余数量会用 `(+N)` 表示

2. **full 日志继续补齐**
   - `规则源参数` 现在会额外输出：
     - `apply-preview`
   - `代理集合参数` 现在也会额外输出：
     - `apply-preview`
   - 日志字段形如：`apply-preview=path=CN|AI|OpenAI(+3),download=...`

3. **预览值语义统一**
   - 对应功能没开启时显示 `off`
   - 功能开启但当前没有命中 provider 时显示 `none`
   - 命中时显示 `name1|name2|name3(+N)` 形式的样本摘要

## V8.46.0 这一轮新增了什么

这一轮继续把 **provider 改动统计** 往下补齐：上一轮已经能看出“新增写入”和“覆盖旧值”，这轮再把 **noop 无变化** 也补出来，方便你判断某类参数虽然命中了 provider，但其实原值已经和目标值一致。

1. **`Mutation-Stats` 继续补上 noop 统计**
   - 不新增新响应头名
   - 直接把现有 `Mutation-Stats` 扩展为：
     - `path-noop`
     - `download-noop`
     - `payload-noop`
     - `collection-noop`
     - `override-noop`
     - `health-check-noop`

2. **更容易区分三种状态**
   - 现在同一类字段可以直接分出：
     - `added`
     - `overrode`
     - `noop`
   - 也就是：
     - 新增补上
     - 覆盖旧值
     - 命中但无需改动

3. **full 日志与调试头自动同步**
   - `规则源参数` / `代理集合参数` 里的 `mutation-stats`
   - 以及响应调试头里的：
     - `Rule-Provider-Mutation-Stats`
     - `Proxy-Provider-Mutation-Stats`
   - 都会直接带上新的 `*-noop` 计数

## V8.45.0 这一轮新增了什么

这一轮继续把 **provider 参数调试** 往下补：上一轮已经告诉你“命中了多少个 provider”，这轮再进一步，把 **新增写入** 和 **覆盖旧值** 拆开统计，让你能直接看出脚本是在补字段，还是把原配置里的值改掉了。

1. **新增 provider 改动统计摘要**
   - 不新增新参数
   - 但会继续统计：
     - `path-added / path-overrode`
     - `download-added / download-overrode`
     - `payload-added / payload-overrode`
     - `collection-added / collection-overrode`
     - `override-added / override-overrode`
     - `health-check-added / health-check-overrode`

2. **响应调试头继续补齐**
   - `_res.headers` 会新增：
     - `Rule-Provider-Mutation-Stats`
     - `Proxy-Provider-Mutation-Stats`
   - 值会直接告诉你这轮到底是“补字段”多，还是“覆盖原值”多

3. **full 日志继续补齐**
   - `规则源参数` 现在会额外输出：
     - `mutation-stats`
   - `代理集合参数` 现在也会额外输出：
     - `mutation-stats`

## V8.44.0 这一轮新增了什么

这一轮继续把 **provider 调试可观测性** 往下补：前两轮已经告诉你“作用范围”，这轮再进一步，把 **实际命中数量** 也直接打出来，让你不用再手动数当前配置里到底有几个 `http / inline / file` provider 真正吃到了参数。

1. **新增 rule-provider / proxy-provider 命中统计摘要**
   - 不新增新参数
   - 但会额外统计：
     - `total`
     - `http`
     - `file`
     - `inline`
     - `other`
     - `invalid`
   - 以及各类参数实际命中数：
     - `path-hit`
     - `download-hit`
     - `payload-hit`
     - `collection-hit`
     - `override-hit`
     - `health-check-hit`

2. **响应调试头继续补齐**
   - `_res.headers` 会新增：
     - `Rule-Provider-Apply-Stats`
     - `Proxy-Provider-Apply-Stats`
   - 值会直接给出紧凑的计数字符串，适合在真实下载请求里快速核对

3. **full 日志继续补齐**
   - `规则源参数` 现在会额外输出：
     - `apply-stats`
   - `代理集合参数` 现在也会额外输出：
     - `apply-stats`

## V8.43.0 这一轮新增了什么

这一轮继续把 **rule-provider 作用范围摘要** 也统一成和 proxy-provider 同一套实现方式，不再靠日志里手写两段散落判断，而是抽成可复用 helper，并在保持老调试头兼容的前提下补一个更细的详细摘要。

1. **统一 rule-provider 作用范围摘要 helper**
   - 不新增新参数
   - 把规则源侧的接管范围统一汇总为：
     - `path=http-only`
     - `download=http-only`
     - `payload=inline-only`

2. **保留旧摘要，补一个更细的新响应头**
   - 旧头保持不变：
     - `Rule-Provider-Apply-Scope`
     - `Rule-Provider-Payload-Apply-Scope`
   - 这一轮新增：
     - `Rule-Provider-Apply-Scope-Detail`
   - 这样老链路继续兼容，新链路可以直接读取更细粒度摘要

3. **full 日志继续补齐**
   - `full` 日志里的 `规则源参数` 现在会额外输出：
     - `apply-scope`
   - 便于直接对照 proxy-provider 那边的 `apply-scope` 看两侧口径

## V8.42.0 这一轮新增了什么

这一轮不继续加新参数，而是把 **proxy-provider 这一整条参数链的实际作用范围** 直接显式打出来，避免你传了一堆 `proxyProvider*` 参数以后，还要自己去猜到底哪些只对 `http` 生效、哪些会写进所有 provider。

1. **补齐 proxy-provider 作用范围摘要**
   - 不新增新参数
   - 但会把当前脚本的实际接管范围按类别总结为：
     - `path=http-only`
     - `download=http-only`
     - `payload=all-provider-types`
     - `collection=all-provider-types`
     - `override=all-provider-types`
     - `health-check=all-provider-types`

2. **full 日志继续补齐**
   - `full` 日志里的 `代理集合参数` 现在会额外输出：
     - `apply-scope`
   - 这样你一眼就能看出这轮传的 `proxyProvider*` 参数到底打到了哪一类 provider

3. **响应调试头继续补齐**
   - `_res.headers` 会新增：
     - `Proxy-Provider-Apply-Scope`
   - 方便你在真实下载链路里直接看见这轮 proxy-provider 参数的接管范围摘要

## V8.41.0 这一轮新增了什么

这一轮继续把 **rule-provider** 侧往 `payload` 补齐，重点是让最终配置里已有的 `inline rule-providers` 也能统一吃到脚本参数，而不再只能靠手写静态 `payload`。

1. **新增 `ruleProviderPayload` 参数**
   - 支持写法：
     - JSON 数组
     - JSON 字符串数组
     - 多行规则列表
     - `||` 分隔规则列表
   - 作用范围：
     - 最终配置里的全部 `type=inline` 的 `rule-providers`
   - 每一项都会被规范成非空规则字符串后再写入 `payload`

2. **显式标记 payload 只对 inline 生效**
   - 这轮不会把 `ruleProviderPayload` 写进：
     - `type=http`
     - `type=file`
   - 如果当前配置里根本没有 `inline rule-providers`
   - 脚本会显式提醒这一轮 `ruleProviderPayload` 没有实际生效

3. **full 日志与响应调试头继续同步**
   - `full` 日志里的 `规则源参数` 现在会额外输出：
     - `provider-payload`
     - `payload-scope`
   - `_res.headers` 会新增：
     - `Rule-Provider-Payload`
     - `Rule-Provider-Payload-Apply-Scope`

## V8.40.0 这一轮新增了什么

这一轮继续把 **ruleProviderPathDir / ruleProviderInterval / ruleProviderProxy / ruleProviderSizeLimit / ruleProviderUserAgent / ruleProviderAuthorization / ruleProviderHeader** 往“统一接管”方向推进，不再只作用于脚本内置规则源，而是扩展到最终配置里的全部 `http` 类型 `rule-providers`。

1. **现有 + 内置 http rule-providers 统一接管**
   - 不新增新参数
   - 但现有这些参数的作用范围升级为：
     - 脚本内置生成的 `rule-providers`
     - 当前配置里已有的 `http` 类型 `rule-providers`
   - 可统一接管的字段包括：
     - `path`
     - `interval`
     - `proxy`
     - `size-limit`
     - `header`

2. **非 http 规则源会显式提醒不生效**
   - 如果某个已有 rule-provider 是：
     - `file`
     - `inline`
   - 而你又传了上述下载控制 / 缓存目录 / 请求头参数
   - 脚本会显式提醒这些参数对它不会生效

3. **full 日志与响应调试头继续同步**
   - `full` 日志里的 `规则源参数` 现在会额外输出：
     - `scope`
     - 开启统一接管时会显示 `all-http`
   - `_res.headers` 会新增：
     - `Rule-Provider-Apply-Scope`
     - 开启统一接管时值为 `all-http`

## V8.39.0 这一轮新增了什么

这一轮继续沿着 **Mihomo rule-providers 官方语义细节** 往下补，把前一轮已经接入的 `规则源语义告警` 再收紧两条最容易踩坑的官方限制。

1. **补充 payload 作用域告警**
   - 按 Mihomo 官方语义：
     - `payload` 只对 `type=inline` 生效
   - 所以如果你在：
     - `type=http`
     - `type=file`
     的 `rule-provider` 上写了 `payload`
   - 脚本现在会显式提醒这项通常不会生效

2. **补充 mrs / behavior 兼容性告警**
   - 按 Mihomo 官方语义：
     - `format=mrs` 仅支持 `domain / ipcidr`
   - 所以如果某个 `rule-provider` 是：
     - `behavior=classical`
     - `format=mrs`
   - 脚本现在会显式提示这是不兼容组合

3. **这一轮仍然归入现有规则源语义诊断链**
   - 不新增新参数
   - 会继续进入：
     - `规则源语义告警`
     - `full=true` 统计
     - `_res.headers` 的 `Rule-Provider-Semantic-Check`

## V8.38.0 这一轮新增了什么

这一轮继续沿着 **Mihomo rule-providers 官方 `header` 字段** 往下补，把脚本内置生成的 `rule-providers` 也开放成可统一下发任意请求头，而不再只限 `User-Agent / Authorization` 两个固定头。

1. **开放脚本内置 rule-providers 的通用请求头参数**
   - 新增参数：
     - `ruleProviderHeader`
   - 支持写法：
     - `Header: value`
     - `Header: value||Header2: value2`
     - 多行写法
     - 也兼容 `Header=>value`
   - 行为：
     - 仅作用于脚本内置生成的 `rule-providers`
     - 会统一写入 provider 的 `header`
     - 如果和 `ruleProviderUserAgent / ruleProviderAuthorization` 同时使用，则专用参数优先级更高

2. **补充 rule-provider header 自检**
   - Header 名只接受常见 `A-Za-z0-9-`
   - 无法解析的条目会逐条忽略并显式提醒
   - 如果最终 `header` 不是对象、Header 名非法或值为空，也会进入 `规则源语义告警`

3. **full 日志与响应调试头继续同步**
   - `full` 日志里的 `规则源参数` 现在会额外输出：
     - `provider-headers`
   - `_res.headers` 会新增：
     - `Rule-Provider-Header`

## V8.37.0 这一轮新增了什么

这一轮继续沿着 **Mihomo rule-providers 官方 type / behavior / format / path / payload 语义** 往下补，把脚本当前合并后的 `rule-providers` 也纳入显式结构自检。

1. **补强 rule-providers 官方结构自检**
   - 会显式校验 `type` 是否落在 Mihomo 官方支持的：
     - `http`
     - `file`
     - `inline`
   - 还会补充校验：
     - `behavior` 是否落在 `domain / ipcidr / classical`
     - `format` 是否落在 `yaml / text / mrs`
     - `type=http` 时是否真的带了可用 `url`
     - `type=file` 时是否具备有效 `path`
     - `type=inline` 时是否具备有效 `payload`

2. **补充 rule-provider 的 HomeDir / SAFE_PATHS 路径提醒**
   - 如果 rule-provider `path` 看起来像绝对路径，或者带明显的 `../` 越级路径
   - 脚本会按 Mihomo 官方语义提醒：
     - 如果目标路径不在 HomeDir 下，通常需要额外配置 `SAFE_PATHS`

3. **full 日志与响应调试头继续同步**
   - `full` 日志会新增：
     - `规则源语义`
     - `规则源语义告警`
   - `_res.headers` 会新增：
     - `Rule-Provider-Semantic-Check`

## V8.36.0 这一轮新增了什么

这一轮继续沿着 **Mihomo proxy-providers 官方 type / url / path / payload 语义** 往下补，不过重点不再是加新参数，而是把“官方要求但容易写错”的结构关系做成显式自检。

1. **补强 proxy-providers 官方结构自检**
   - 会显式校验 `type` 是否落在 Mihomo 官方支持的：
     - `http`
     - `file`
     - `inline`
   - 还会补充校验：
     - `type=http` 时是否真的带了可用 `url`
     - `type=file` 时是否具备有效 `path`
     - `type=inline` 时是否具备有效 `payload`

2. **补充 HomeDir / SAFE_PATHS 路径提醒**
   - 如果 provider `path` 看起来像绝对路径，或者带明显的 `../` 越级路径
   - 脚本会按 Mihomo 官方语义提醒：
     - 如果目标路径不在 HomeDir 下，通常需要额外配置 `SAFE_PATHS`

3. **full 日志与响应调试头继续同步**
   - `full` 日志会新增：
     - `代理集合语义`
   - `_res.headers` 会新增：
     - `Proxy-Provider-Semantic-Check`

## V8.35.0 这一轮新增了什么

这一轮继续沿着 **Mihomo proxy-providers 官方 `payload` 字段** 往下补，把现有 `proxy-providers` 的 payload 也开放成参数。按官方文档语义，它既可作为 `inline` provider 的节点池，也能在 `http/file` 解析失败时充当后备节点。

1. **开放现有 proxy-providers 的 payload 参数**
   - 新增参数：
     - `proxyProviderPayload`
   - 支持写法：
     - JSON 对象
     - JSON 数组
     - 通过 Sub-Store `$options` / 链接参数传入 JSON 字符串
   - 行为：
     - 会统一写入现有 `proxy-providers` 的 `payload`
     - 对 `inline` provider 可直接作为节点池内容
     - 对 `http/file` provider 可作为解析失败时的后备节点池

2. **补充 payload 自检**
   - `payload` 必须是数组
   - 每个条目都必须是对象，且至少带有效的 `name / type`
   - 如果整条参数没解析出有效节点，或者某些条目缺字段，会显式提醒

3. **full 日志与响应调试头继续同步**
   - `full` 日志里的 `代理集合参数` 现在会额外输出：
     - `payload`
   - `_res.headers` 会新增：
     - `Proxy-Provider-Payload`

## V8.34.0 这一轮新增了什么

这一轮继续沿着 **Mihomo proxy-providers 官方 `header` 字段** 往下补，把现有 `proxy-providers` 的通用自定义请求头也统一开放成参数，这样就不只限于 `User-Agent / Authorization` 两个固定头。

1. **开放现有 proxy-providers 的通用请求头参数**
   - 新增参数：
     - `proxyProviderHeader`
   - 支持写法：
     - `Header: value`
     - `Header: value||Header2: value2`
     - 多行写法
     - 也兼容 `Header=>value`
   - 行为：
     - 仅作用于当前配置里已经存在的 `type=http` 的 `proxy-providers`
     - 会统一写入 provider 的 `header`
     - 如果和 `proxyProviderUserAgent / proxyProviderAuthorization` 同时使用，则专用参数优先级更高

2. **补充 proxy-provider header 自检**
   - Header 名只接受常见 `A-Za-z0-9-`
   - 无法解析的条目会逐条忽略并显式提醒
   - 如果整个 `proxyProviderHeader` 都没解析出有效项，也会显式提示
   - 如果最终 `header` 不是对象、Header 名非法或值为空，也会进入 `代理集合告警`

3. **full 日志与响应调试头继续同步**
   - `full` 日志里的 `代理集合参数` 现在会额外输出：
     - `headers`
   - `_res.headers` 会新增：
     - `Proxy-Provider-Header`

## V8.33.0 这一轮新增了什么

这一轮继续沿着 **Mihomo proxy-providers 官方 `path` 语义** 往下补，把现有 `proxy-providers` 的本地缓存目录也统一开放成参数，方便你把多个 provider 缓存稳定隔离到独立目录。

1. **开放现有 proxy-providers 的缓存目录参数**
   - 新增参数：
     - `proxyProviderPathDir`
   - 行为：
     - 仅作用于当前配置里已经存在的 `type=http` 的 `proxy-providers`
     - 会统一生成稳定 `path`，并落到你指定的目录下
     - 生成文件名优先按 provider 名命名，并自动避开重名冲突
     - 如果原 provider 已经写了 `path`，这一轮也会改写到新目录，便于统一隔离缓存

2. **补充 proxy-provider path 自检**
   - 非 `http` 类型会显式提醒 `proxyProviderPathDir` 不生效
   - 如果生成后的 `path` 为空、未落在目标目录下，或多个 provider `path` 冲突，都会进入 `代理集合告警`
   - 没传 `proxyProviderPathDir` 时，脚本会继续保留原配置里的 `path`；如果原本就没写 `path`，则继续保持 Mihomo 默认缓存行为

3. **full 日志与响应调试头继续同步**
   - `full` 日志里的 `代理集合参数` 现在会额外输出：
     - `path-dir`
   - `_res.headers` 会新增：
     - `Proxy-Provider-Path-Dir`

## V8.32.0 这一轮新增了什么

这一轮继续沿着 **Mihomo proxy-providers override.proxy-name 官方写法** 往下补，把现有 `proxy-providers` 的正则改名规则也统一开放成参数。

1. **开放现有 proxy-providers 的 proxy-name 正则改名参数**
   - 新增参数：
     - `proxyProviderOverrideProxyName`
   - 支持写法：
     - `pattern=>target`
     - `pattern=>target||pattern2=>target2`
     - 多行写法
   - 行为：
     - 统一写入 provider 的 `override.proxy-name`
     - 最终生成 Mihomo 需要的 `{ pattern, target }[]`

2. **补充 proxy-name 规则自检**
   - `pattern` 会做正则可编译校验
   - 没有 `pattern` / `target` 的条目会自动忽略
   - 整条参数完全无法解析时会显式提醒

3. **full 日志与响应调试头继续同步**
   - `full` 日志里的 `代理集合Override` 现在会额外输出：
     - `proxy-name-rules`
   - `_res.headers` 会新增：
     - `Proxy-Provider-Override-Proxy-Name`

## V8.31.0 这一轮新增了什么

这一轮继续沿着 **Mihomo proxy-providers override 官方字段** 往下补，把现有 `proxy-providers` 的 `override` 里最常用的一组“节点名 + 传输层 + 网络层”字段也统一开放成参数。

1. **开放现有 proxy-providers override 前后缀参数**
   - 新增参数：
     - `proxyProviderOverrideAdditionalPrefix`
     - `proxyProviderOverrideAdditionalSuffix`
   - 行为：
     - 统一写入 provider 的 `override.additional-prefix / additional-suffix`
     - 适合批量给某个 provider 池里的节点补机场标记、线路标记、用途标记

2. **开放现有 proxy-providers override 传输 / 网络参数**
   - 新增参数：
     - `proxyProviderOverrideUdp`
     - `proxyProviderOverrideUdpOverTcp`
     - `proxyProviderOverrideDown`
     - `proxyProviderOverrideUp`
     - `proxyProviderOverrideTfo`
     - `proxyProviderOverrideMptcp`
     - `proxyProviderOverrideSkipCertVerify`
     - `proxyProviderOverrideDialerProxy`
     - `proxyProviderOverrideInterfaceName`
     - `proxyProviderOverrideRoutingMark`
     - `proxyProviderOverrideIpVersion`
   - 行为：
     - 统一写入 provider 的 `override`
     - `ip-version` 支持：`dual / ipv4 / ipv6 / ipv4-prefer / ipv6-prefer`
     - `routing-mark` 只接受大于等于 `0` 的整数

3. **补充 override 自检**
   - `udp / tfo / mptcp / skip-cert-verify` 会做布尔量校验
   - `interface-name / routing-mark / ip-version` 会做合法值校验
   - `exclude-type` 继续补一条官方语义提醒：这里只支持类型名列表，不支持正则

4. **full 日志与响应调试头继续同步**
   - `full` 日志新增：
     - `代理集合Override`
   - `_res.headers` 会新增：
     - `Proxy-Provider-Override-Prefix`
     - `Proxy-Provider-Override-Suffix`
     - `Proxy-Provider-Override-UDP`
     - `Proxy-Provider-Override-UDP-Over-TCP`
     - `Proxy-Provider-Override-Down`
     - `Proxy-Provider-Override-Up`
     - `Proxy-Provider-Override-TFO`
     - `Proxy-Provider-Override-MPTCP`
     - `Proxy-Provider-Override-Skip-Cert-Verify`
     - `Proxy-Provider-Override-Dialer-Proxy`
     - `Proxy-Provider-Override-Interface-Name`
     - `Proxy-Provider-Override-Routing-Mark`
     - `Proxy-Provider-Override-IP-Version`

## V8.30.0 这一轮新增了什么

这一轮继续沿着 **Mihomo proxy-providers 节点池字段** 往下补，把现有 `proxy-providers` 的 `filter / exclude-filter / exclude-type` 也开放成统一参数，方便你批量裁剪 provider 内节点。

1. **开放现有 proxy-providers 节点筛选参数**
   - 新增参数：
     - `proxyProviderFilter`
     - `proxyProviderExcludeFilter`
     - `proxyProviderExcludeType`
   - 行为：
     - 仍然只作用于当前配置里已经存在的 `proxy-providers`
     - `filter / exclude-filter` 直接写入 provider 本身
     - `exclude-type` 兼容逗号、竖线、换行输入，最终统一成 Mihomo `A|B|C` 形式

2. **补充代理集合节点池自检**
   - `filter / exclude-filter` 会做正则可编译校验
   - `exclude-type` 清洗后为空时会显式提醒已忽略
   - 这些校验和上一轮下载控制 / health-check 一起归入 `代理集合告警`

3. **full 日志与响应调试头继续同步**
   - `full` 日志里的 `代理集合参数` 现在会继续输出：
     - `filter`
     - `exclude-filter`
     - `exclude-type`
   - `_res.headers` 会新增：
     - `Proxy-Provider-Filter`
     - `Proxy-Provider-Exclude-Filter`
     - `Proxy-Provider-Exclude-Type`

## V8.29.0 这一轮新增了什么

这一轮继续沿着 **Mihomo proxy-providers 官方字段** 往下补，把现有 `proxy-providers` 的下载控制和 `health-check` 也开放成统一参数，方便你直接批量接管原配置里已经存在的 provider 集合。

1. **开放现有 proxy-providers 下载控制参数**
   - 新增参数：
     - `proxyProviderInterval`
     - `proxyProviderProxy`
     - `proxyProviderSizeLimit`
     - `proxyProviderUserAgent`
     - `proxyProviderAuthorization`
   - 行为：
     - 仅作用于当前配置里已经存在的 `proxy-providers`
     - `interval / proxy / size-limit / header` 只对 `type=http` 的 provider 生效
     - 认证信息在日志与响应调试头里仍只显示 `configured`

2. **开放现有 proxy-providers health-check 参数**
   - 新增参数：
     - `proxyProviderHealthCheckEnable`
     - `proxyProviderHealthCheckUrl`
     - `proxyProviderHealthCheckInterval`
     - `proxyProviderHealthCheckTimeout`
     - `proxyProviderHealthCheckLazy`
     - `proxyProviderHealthCheckExpectedStatus`
   - 行为：
     - 会合并进 provider 原有的 `health-check`
     - 原来没写 `health-check` 的 provider 也会自动补齐
     - `expected-status` 按 Mihomo 官方语法校验，非法值会忽略并显式告警

3. **补充代理集合自检**
   - 如果当前配置里根本没有 `proxy-providers`，但你又传了这些参数，脚本会显式提醒本轮参数未生效
   - 如果 provider / health-check 的 URL 看起来不像合法 `http(s)` 地址，也会进入代理集合告警
   - 非 `http` 类型 provider 会显式提示下载控制项不会生效，避免误以为已经接管成功

4. **full 日志与响应调试头同步补齐**
   - `full` 日志新增：
     - `代理集合参数`
     - `代理集合告警`
   - `_res.headers` 会新增：
     - `Proxy-Provider-Interval`
     - `Proxy-Provider-Proxy`
     - `Proxy-Provider-Size-Limit`
     - `Proxy-Provider-UA`
     - `Proxy-Provider-Authorization`
     - `Proxy-Provider-HC-*`

## V8.28.0 这一轮新增了什么

这一轮继续沿着 **Mihomo proxy-group 节点池玩法** 往下补，把 `include-all-proxies` 也开放成 GitHub / Steam 独立组的显式参数，不再要求你一定得先写 `NodeFilter / NodeExcludeFilter / NodeExcludeType` 才能启用原始节点自动收集。

1. **开放 GitHub / Steam 独立组 include-all-proxies 参数**
   - 新增参数：
     - `githubIncludeAllProxies`
     - `steamIncludeAllProxies`
   - 作用：
     - 给对应独立组显式挂上 Mihomo `include-all-proxies`
     - 即使没有任何筛选条件，也能直接吸收全部原始节点

2. **可继续叠加现有筛选参数**
   - 仍然可以继续叠加：
     - `githubNodeFilter / steamNodeFilter`
     - `githubNodeExcludeFilter / steamNodeExcludeFilter`
     - `githubNodeExcludeType / steamNodeExcludeType`
   - 也就是说：
     - `include-all-proxies=true` 负责“打开原始节点自动池”
     - `NodeFilter / Exclude*` 负责“继续缩小池子”

3. **与 include-all 的优先级关系补齐**
   - 如果同时设置：
     - `githubIncludeAll=true` + `githubIncludeAllProxies=true`
     - `steamIncludeAll=true` + `steamIncludeAllProxies=true`
   - 脚本会：
     - 输出显式提醒
     - 最终以更高优先级的 `include-all` 为准

4. **日志与响应调试头同步补齐**
   - `full` 日志里的 `独立组节点池` 摘要现在会明确输出：
     - `github-include-all-proxies`
     - `steam-include-all-proxies`
   - `_res.headers` 也会新增：
     - `GitHub-Include-All-Proxies`
     - `Steam-Include-All-Proxies`

## V8.27.0 这一轮新增了什么

这一轮继续沿着 **Mihomo proxy-group 官方网络字段** 往下补，把 `interface-name / routing-mark` 也参数化进脚本，同时把官方 deprecated 提醒补进日志、诊断和响应头摘要。

1. **开放全局 proxy-group 网络参数**
   - 新增参数：
     - `groupInterfaceName`
     - `groupRoutingMark`
   - 作用：
     - 给所有脚本生成的策略组统一挂上 `interface-name / routing-mark`

2. **GitHub / Steam 独立组支持专属覆盖**
   - 新增参数：
     - `githubInterfaceName`
     - `steamInterfaceName`
     - `githubRoutingMark`
     - `steamRoutingMark`
   - 优先级：
     - GitHub / Steam 专属参数
     - 高于全局 `groupInterfaceName / groupRoutingMark`

3. **输入会做基础校验**
   - `interface-name`
     - 只接受非空字符串
   - `routing-mark`
     - 只接受大于等于 `0` 的整数
   - 非法值会：
     - 输出显式告警
     - 自动忽略

4. **同步写入日志与响应调试头**
   - `full` 日志会新增 `独立组网络` 摘要
   - `_res.headers` 会新增：
     - `Group-Interface-Name`
     - `Group-Routing-Mark`
     - `GitHub-Interface-Name`
     - `GitHub-Routing-Mark`
     - `Steam-Interface-Name`
     - `Steam-Routing-Mark`

5. **补上官方 deprecated 提醒**
   - Mihomo Proxy Groups 文档已将 `interface-name / routing-mark` 标记为 deprecated
   - 脚本会在你启用这些参数时显式提醒，避免后续升级时误判

## V8.26.0 这一轮新增了什么

这一轮继续沿着 **Mihomo 健康检查官方语法** 往下补，把 `expected-status` 从“只要非空就放行”升级成“按官方语法校验后再写入配置”。

1. **expected-status 现在按官方语法校验**
   - 支持：
     - `*`
     - `204`
     - `200/302`
     - `200/302/400-503`
   - 不支持：
     - 空片段
     - 反向范围
     - 非数字状态码

2. **全局与 GitHub / Steam 独立组一起生效**
   - 会校验：
     - `groupExpectedStatus`
     - `githubGroupExpectedStatus`
     - `steamGroupExpectedStatus`

3. **非法值自动回退**
   - 如果你传了不符合 Mihomo 官方语法的 expected-status
   - 脚本会：
     - 输出显式告警
     - 自动回退默认值 / 上层默认逻辑

4. **已有配置里的测速组也会一起校验**
   - 不只是脚本参数
   - 连最终生成出来的 `url-test / fallback / load-balance` 组里的 `expected-status`
   - 现在都会走同一套语法自检

5. **兼容 JSON 数字输入**
   - 如果你通过 `$options` JSON 传：
     - `204`
   - 脚本也会自动转成合法字符串处理

## V8.25.0 这一轮新增了什么

这一轮继续沿着 **Mihomo proxy-groups 官方 `include-all`** 往下做，让 GitHub / Steam 独立组可以直接吸收“全部出站代理 + 全部 proxy-providers”，并把官方文档里那个健康检查盲区做成显式提醒。

1. **开放 GitHub / Steam 独立组 include-all 参数**
   - 新增参数：
     - `githubIncludeAll`
     - `steamIncludeAll`
   - 作用：
     - 给对应独立组挂上 Mihomo `include-all`
     - 一次性吸收全部出站代理和全部代理集合

2. **优先级高于 use / include-all-providers**
   - 如果同时设置：
     - `githubIncludeAll=true` + `githubUseProviders`
     - `githubIncludeAll=true` + `githubIncludeAllProviders=true`
     - `steamIncludeAll=true` + 同类参数
   - 脚本会：
     - 显式提醒这些较低优先级参数被忽略
     - 最终只保留 `include-all`

3. **可继续叠加过滤规则**
   - 即使开启 `include-all`
   - 现有这些参数仍然能继续过滤被引入的节点：
     - `NodeFilter`
     - `NodeExcludeFilter`
     - `NodeExcludeType`

4. **补上 Mihomo 官方健康检查提醒**
   - 对 `url-test / fallback / load-balance`
   - 如果主要通过：
     - `use`
     - `include-all-providers`
     - `include-all`
     引入 provider 池
   - 脚本会提醒：
     - 按 Mihomo 官方语义，健康检查只检查 `proxies` 字段，不检查 provider 内节点

5. **日志与响应头同步补齐**
   - `full` 日志新增：
     - `Provider健康提醒`
   - 响应调试头新增：
     - `GitHub-Include-All`
     - `Steam-Include-All`

## V8.24.0 这一轮新增了什么

这一轮继续把 GitHub / Steam 独立组往 **Mihomo proxy-providers 官方玩法** 推进：现在不只是能引用当前配置里的节点和脚本组，还能直接把原配置里的 `proxy-providers` 池并进 GitHub / Steam 独立组。

1. **开放 GitHub / Steam 独立组 use 参数**
   - 新增参数：
     - `githubUseProviders`
     - `steamUseProviders`
   - 作用：
     - 把指定 `proxy-providers` 通过 Mihomo `use` 字段挂到对应独立组

2. **开放 GitHub / Steam 独立组 include-all-providers 参数**
   - 新增参数：
     - `githubIncludeAllProviders`
     - `steamIncludeAllProviders`
   - 作用：
     - 让对应独立组自动吸收当前配置里的全部 `proxy-providers`

3. **和现有节点池筛选能力可以叠加**
   - `githubNodeFilter / steamNodeFilter`
   - `githubNodeExcludeFilter / steamNodeExcludeFilter`
   - `githubNodeExcludeType / steamNodeExcludeType`
   - 这些规则仍会继续挂在独立组上
   - 也就是说现在可以同时筛：
     - 显式候选链
     - 原始节点池
     - proxy-providers 池

4. **include-all-providers 优先级更高**
   - 如果同时设置：
     - `githubUseProviders` + `githubIncludeAllProviders=true`
     - `steamUseProviders` + `steamIncludeAllProviders=true`
   - 脚本会：
     - 显式提醒 `useProviders` 被忽略
     - 实际只保留 `include-all-providers`

5. **日志与响应头同步补齐**
   - `full` 日志新增：
     - `独立组Provider池`
     - `Provider池告警`
     - `Provider引用告警`
   - 响应调试头新增：
     - `GitHub-Use-Providers`
     - `Steam-Use-Providers`
     - `GitHub-Include-All-Providers`
     - `Steam-Include-All-Providers`

## V8.23.0 这一轮新增了什么

这一轮继续沿着 **Mihomo load-balance 官方能力** 往下做，把 `strategy` 正式接进脚本。现在不光能把某个组切成 `load-balance`，还能继续指定它到底按哪种官方策略分配流量。

1. **开放全局 load-balance strategy 参数**
   - 新增参数：
     - `groupStrategy`
   - 作用：
     - 给脚本生成的所有 `load-balance` 组统一补 `strategy`
     - 包括国家组、低倍率组，以及其他走到 `load-balance` 的测速类组

2. **开放 GitHub / Steam 独立组专属 strategy 参数**
   - 新增参数：
     - `githubGroupStrategy`
     - `steamGroupStrategy`
   - 作用：
     - 当 GitHub / Steam 独立组切到 `load-balance` 时，优先使用各自专属 strategy

3. **支持 Mihomo 官方常见策略**
   - 支持：
     - `round-robin`
     - `consistent-hashing`
     - `sticky-sessions`
   - 也兼容常见写法：
     - `roundRobin`
     - `consistentHashing`
     - `sticky`

4. **只在 load-balance 组上生效**
   - `groupStrategy`
     - 只会写进类型为 `load-balance` 的组
   - `githubGroupStrategy / steamGroupStrategy`
     - 只有对应独立组类型切到 `load-balance` 时才会真正生效

5. **日志与响应头同步补齐**
   - `full` 日志新增：
     - `group-strategy`
     - `github-group-strategy`
     - `steam-group-strategy`
   - 响应调试头新增：
     - `Group-Strategy`
     - `GitHub-Group-Strategy`
     - `Steam-Group-Strategy`

## V8.22.0 这一轮新增了什么

这一轮继续按 **Mihomo Proxy-Groups 官方字段** 往 GitHub / Steam 独立组里补“展示层 + 传输层”能力：现在不仅能调顺序、调目标、调节点池，还能单独控制这两个独立组是否隐藏、是否挂图标、是否关闭 UDP。

1. **开放 GitHub / Steam 独立组 hidden 参数**
   - 新增参数：
     - `githubHidden`
     - `steamHidden`
   - 作用：
     - 只隐藏 GitHub / Steam 独立组本身
     - 不影响其他脚本组

2. **开放 GitHub / Steam 独立组 icon 参数**
   - 新增参数：
     - `githubIcon`
     - `steamIcon`
   - 作用：
     - 把 Mihomo `icon` 字段原样挂到对应独立组
     - 便于前端面板显示独立图标

3. **开放 GitHub / Steam 独立组 disable-udp 参数**
   - 新增参数：
     - `githubDisableUdp`
     - `steamDisableUdp`
   - 作用：
     - 把 Mihomo `disable-udp` 字段挂到对应独立组
     - 适合你想让某个独立组明确只走 TCP / 不走 UDP 的场景

4. **这些能力只作用于独立组本身**
   - `githubHidden / steamHidden`
     - 只控制显示层
   - `githubIcon / steamIcon`
     - 只补图标字段
   - `githubDisableUdp / steamDisableUdp`
     - 只控制该组出站时的 UDP 行为

5. **日志与响应头同步补齐**
   - `full` 日志新增：
     - `独立组展示`
     - `独立组UDP`
   - 响应调试头新增：
     - `GitHub-Hidden`
     - `Steam-Hidden`
     - `GitHub-Disable-UDP`
     - `Steam-Disable-UDP`
     - `GitHub-Icon`
     - `Steam-Icon`

## V8.21.0 这一轮新增了什么

这一轮继续把 GitHub / Steam / SteamCN 的玩法从“规则打到哪里”再推进到“规则排在前后哪里”：现在不仅能改规则入口目标，还能改这几条规则在整条 `RULE-SET` 链里的顺序。

1. **开放 GitHub / Steam / SteamCN 规则顺序参数**
   - 新增参数：
     - `githubRuleAnchor`
     - `githubRulePosition`
     - `steamRuleAnchor`
     - `steamRulePosition`
     - `steamCnRuleAnchor`
     - `steamCnRulePosition`
   - 作用：
     - 把对应规则入口移动到指定锚点的前面或后面

2. **默认就是 before，可继续显式切 after**
   - 只传 `RuleAnchor`
     - 默认按 `before` 处理
   - 也可以配合：
     - `githubRulePosition=after`
     - `steamRulePosition=after`
     - `steamCnRulePosition=after`

3. **锚点支持 provider 名、常用别名、特殊位置**
   - 可直接传：
     - `ChatGPT`
     - `AI`
     - `Steam`
     - `SteamCN`
     - `Geo_Not_CN`
     - `DirectList`
     - `CN`
   - 也支持：
     - `top / start / first`
     - `end / match / final`

4. **顺序未命中时不会把规则写坏**
   - 如果锚点没命中任何规则入口
   - 或者错误把锚点写成自己
   - 脚本会：
     - 输出显式告警
     - 保持默认顺序

5. **日志与响应头同步补齐**
   - `full` 日志新增：
     - `规则顺序编排`
     - `规则顺序告警`
   - 响应调试头新增：
     - `GitHub-Rule-Order`
     - `Steam-Rule-Order`
     - `SteamCN-Rule-Order`

## V8.20.0 这一轮新增了什么

这一轮继续把 GitHub / Steam 玩法从“组内顺序”扩展到“规则入口”层：现在不仅独立组里谁优先可以调，连 GitHub / Steam / SteamCN 规则最终打进哪个组也能直接参数化。

1. **开放 GitHub / Steam / SteamCN 规则目标参数**
   - 新增参数：
     - `githubRuleTarget`
     - `steamRuleTarget`
     - `steamCnRuleTarget`
   - 作用：
     - 把对应规则入口直接改写到任意已有组或内置策略

2. **支持打到脚本组、用户自定义组、内置策略**
   - 可直接传：
     - `🐙 GitHub`
     - `🚂 Steam`
     - `🎯 手动切换`
     - `DIRECT`
     - 原配置里的自定义组名
   - 同样支持常用别名：
     - `select`
     - `manual`
     - `fallback`
     - `direct`
     - `games`

3. **规则入口和独立组内部顺序是两层能力**
   - `githubRuleTarget / steamRuleTarget / steamCnRuleTarget`
     - 控制“规则命中后先进入哪个组/策略”
   - `PreferNodes / PreferGroups / PreferCountries / Mode / Type`
     - 控制“进入该组之后如何选节点/子组”

4. **匹配不到时自动回退默认目标**
   - 如果规则目标参数没命中任何可用组
   - 脚本会：
     - 输出显式告警
     - 自动回退默认目标
   - 不会因为参数写错直接把规则写坏

5. **日志与响应头同步补齐**
   - `full` 日志新增：
     - `规则入口目标`
     - `规则入口告警`
   - 响应调试头新增：
     - `GitHub-Rule-Target`
     - `Steam-Rule-Target`
     - `SteamCN-Rule-Target`

## V8.19.0 上一轮新增了什么

这一轮继续把 GitHub / Steam 独立组往“精确控制”推进，重点是除了国家、前置组、自动节点池以外，还能直接点名某几个具体节点：

1. **开放 GitHub / Steam 独立组点名节点优先参数**
   - 新增参数：
     - `githubPreferNodes`
     - `steamPreferNodes`
   - 作用：
     - 把你指定的真实节点名，直接固定插到独立组最前面
   - 适合：
     - 想把某条家宽、某条低延迟专线、某个固定出口优先给 GitHub / Steam 用

2. **顺序比前置组更高**
   - 当前独立组候选顺序变成：
     - 点名节点
     - 前置组
     - 国家优先链
     - mode 基础链
   - 这样可以做到：
     - 先指定某几个固定节点
     - 再让其余流量回落到已有分组体系

3. **支持精确匹配、忽略大小写匹配、唯一模糊匹配**
   - 脚本会按顺序尝试：
     - 精确节点名
     - 忽略大小写精确匹配
     - 唯一模糊包含匹配
   - 如果一个标记命中多个节点：
     - 会进入告警
     - 不会盲目选一个

4. **分隔规则专门避开节点名里的 `|`**
   - `PreferNodes` 只把这些当分隔符：
     - 逗号
     - 分号
     - 换行
   - 不把 `|` 当分隔符
   - 原因：
     - 很多机场节点名本身就带 `|`，不能误切开

5. **诊断、日志、响应头同步补齐**
   - 新增告警：
     - 点名节点未命中
     - 点名节点匹配歧义
   - `full` 日志新增：
     - `独立组点名节点`
   - 响应调试头新增：
     - `GitHub-Prefer-Nodes`
     - `Steam-Prefer-Nodes`

## V8.18.0 上一轮新增了什么

这一轮继续把 GitHub / Steam 独立组往“可编排”推进，重点不是再加一个测速参数，而是让独立组可以额外引用任意已有策略组作为前置候选：

1. **开放 GitHub / Steam 独立组额外前置组参数**
   - 新增参数：
     - `githubPreferGroups`
     - `steamPreferGroups`
   - 作用：
     - 在独立组原有候选链之前，额外插入你指定的策略组/内置策略
   - 适合：
     - 想把 `手动切换 / 自动切换 / 低倍率 / 自定义组 / 某个国家组` 直接塞进 GitHub / Steam 组最前面

2. **支持引用脚本内置组、内置策略、用户自定义组**
   - 可直接传：
     - 已生成组名
     - 内置策略，如 `DIRECT`
     - 你原配置里的自定义策略组名
   - 同时支持常用别名：
     - `select`
     - `manual`
     - `fallback`
     - `direct`
     - `lowcost`
     - `landing`
     - `games`
     - `speedtest`

3. **和 `PreferCountries` / `Mode` / `Type` 叠加，而不是互相覆盖**
   - `githubPreferCountries / steamPreferCountries` 继续解决“国家优先”
   - `githubPreferGroups / steamPreferGroups` 继续解决“结构编排”
   - `githubMode / steamMode`、`githubType / steamType`、专属测速/健康检查参数仍然照常生效

4. **`direct` 模式下仍然固定 `DIRECT` 在最前**
   - 即使额外设置了 `PreferGroups`
   - 只要独立组当前是 `direct` 模式
   - 脚本仍会保证 `DIRECT` 保持在第一个候选位

5. **诊断、日志、响应头同步补齐**
   - 如果 `PreferGroups` 标记没命中任何可用组，会进入显式告警
   - 如果错误引用了独立组自己，也会给出提醒
   - `full` 日志里会额外输出：
     - `独立组前置组`
   - 响应调试头里也会额外标记：
     - `GitHub-Prefer-Groups`
     - `Steam-Prefer-Groups`

## V8.17.0 上一轮新增了什么

这一轮继续按 **Mihomo Proxy Groups 官方文档** 往 GitHub / Steam 独立组里补“高级玩法”，重点是让独立组除了保留原有的国家组 / 主选择 / DIRECT 候选链之外，还能直接自动吸收满足条件的原始节点：

1. **开放 GitHub / Steam 独立组原始节点筛选参数**
   - 新增参数：
     - `githubNodeFilter`
     - `steamNodeFilter`
   - 作用：
     - 对应独立组会自动开启 `include-all-proxies`
     - 并按 `filter` 只吸收命中的原始节点
   - 适合：
     - 只想把 `IEPL / IPLC / 家宽 / 游戏专线` 这类节点塞进 GitHub / Steam 专用池

2. **开放 GitHub / Steam 独立组原始节点排除筛选参数**
   - 新增参数：
     - `githubNodeExcludeFilter`
     - `steamNodeExcludeFilter`
   - 作用：
     - 对应独立组会额外挂上 Mihomo `exclude-filter`
     - 可把 `0.5x / 实验 / 公益 / 中转` 等节点从独立组自动池里剔除

3. **开放 GitHub / Steam 独立组协议排除参数**
   - 新增参数：
     - `githubNodeExcludeType`
     - `steamNodeExcludeType`
   - 作用：
      - 对应独立组会挂上 Mihomo `exclude-type`
      - 支持按协议类型排除，例如 `Http | Socks5 | Shadowsocks`
      - 也兼容常见短写法，例如 `http | socks5 | ss`
   - 输入兼容：
     - 逗号
     - 竖线
     - 换行

4. **显式候选链与原始节点自动池同时生效**
   - GitHub / Steam 独立组不会因为开启 `NodeFilter` 就丢掉原有的：
     - 国家优先链
     - `githubMode / steamMode`
     - `githubType / steamType`
     - 专属测速与健康检查参数
   - 现在是：
     - 一边保留原本的显式候选组顺序
     - 一边额外通过 `include-all-proxies + filter / exclude-filter / exclude-type` 吸收原始节点

5. **自动分组校验同步增强**
   - 新增节点池参数后：
     - 无效正则会继续进入自动分组告警
     - 匹配结果为空也会继续进入自动分组为空告警
     - `exclude-type` 现在也会参与自动分组命中统计，诊断结果更接近真实行为

## V8.16.0 上一轮新增了什么

这一轮继续按 **Sub-Store 官方 Wiki / demo.js** 做“真实下载链路兼容”，重点是把下载请求里可能出现的参数来源尽量都接住：

1. **统一兼容 `_req.query / _req.url / _req.path` 三路来源**
   - 现在不仅支持：
     - `$arguments`
     - `$options`
     - `$options.$options`
   - 还支持从官方请求上下文恢复：
     - `$options._req.query`
     - `$options._req.url`
     - `$options._req.path`

2. **无值旗标参数自动视作 `true`**
   - 现在以下写法都会识别为真值：
     - `?full`
     - `?hidden`
     - `#noCache`
     - `#full&hidden`
   - 不再强制要求每个开关都写成 `=true`

3. **请求参数做智能合并**
   - 当前运行时参数优先级为：
     1. `_req.path` 恢复结果
     2. `_req.url` 恢复结果
     3. `_req.query`
   - 同名参数冲突时：
     - 更明确的来源优先
     - 空值不会覆盖已有有效值

4. **多一级路由 target 继续增强**
   - 自动识别：
     - `/download/xxx/ClashMeta`
     - `/download/xxx/Mihomo`
   - 现在会同时尝试从以下位置提取路由目标：
     - 请求 `params.target`
     - 请求 `params.platform`
     - 请求 `url / path`

5. **支持借助 `_res.headers` 写回调试响应头**
   - 可通过参数开启：
     - `responseHeaders=true`
   - 可自定义响应头前缀：
     - `responseHeaderPrefix=X-Debug-`
   - 响应里会回写：
     - 脚本版本
     - target / route-target / query-target
     - request-params-target
     - query 参数命中数
     - 诊断项总数

6. **补充官方链接诊断摘要**
   - 现在会额外识别：
     - `route-kind`
     - `route-name`
     - `route-path`
   - 会汇总官方保留参数状态：
     - `url`
     - `content`
     - `ua`
     - `proxy`
     - `mergeSources`
     - `noCache`
     - `ignoreFailedRemoteSub`
     - `includeUnsupportedProxy`
     - `produceType`
   - 如果同时出现 `url` 和 `content`，但未显式声明 `mergeSources`，会给出链路提醒

7. **开放 rule-provider 本地缓存目录与刷新间隔参数化**
   - 新增参数：
     - `ruleProviderPathDir`
     - `ruleProviderInterval`
   - 默认目录仍然是：
     - `./providers/rules`
   - 默认刷新间隔仍然是：
     - `86400`
   - 适合：
     - 多份配置共存
     - 多脚本共存
     - 想隔离 rule-provider 本地缓存文件时使用

8. **开放 rule-provider 下载代理 / 大小限制 / 常用请求头参数化**
   - 新增参数：
     - `ruleProviderProxy`
     - `ruleProviderSizeLimit`
     - `ruleProviderUserAgent`
     - `ruleProviderAuthorization`
   - 适合：
     - 规则下载必须走指定策略时
     - 想限制规则文件大小时
     - 某些规则源对默认请求头不友好时
     - 某些规则源需要认证头时

9. **开放 GitHub / Steam 独立组国家优先链参数化**
   - 新增参数：
     - `githubPreferCountries`
     - `steamPreferCountries`
   - 默认行为不变：
     - GitHub 仍然主选择优先
     - Steam 仍然直连优先
   - 只有显式传参时，才会把对应国家组插到独立组候选前列

10. **开放 GitHub / Steam 独立组模式参数化**
   - 新增参数：
     - `githubMode`
     - `steamMode`
   - 可选值：
     - `select`
     - `direct`
     - `proxy`
   - 默认值：
     - GitHub = `select`
     - Steam = `direct`
   - 作用：
     - `select`：主选择优先
     - `direct`：直连优先
     - `proxy`：去掉直连前置，走纯代理候选顺序

11. **开放 GitHub / Steam 独立组类型参数化**
   - 新增参数：
     - `githubType`
     - `steamType`
   - 可选值：
     - `select`
     - `url-test`
     - `fallback`
     - `load-balance`
   - 默认值：
     - GitHub = `select`
     - Steam = `select`
   - 作用：
     - 让独立组不仅能手动切换，也能直接变成测速优选/故障转移/负载均衡组

12. **开放 GitHub / Steam 独立组专属测速参数**
   - 新增参数：
     - `githubTestUrl`
     - `githubGroupInterval`
     - `steamTestUrl`
     - `steamGroupInterval`
   - 作用：
     - 当 GitHub / Steam 独立组切成 `url-test / fallback / load-balance` 时，可单独指定测速地址和测速间隔
   - 默认行为：
     - 不传参数时继续沿用全局 `testUrl / groupInterval`

13. **开放 GitHub / Steam 独立组专属健康检查参数**
   - 新增参数：
     - `githubGroupTolerance`
     - `githubGroupTimeout`
     - `githubGroupLazy`
     - `githubGroupMaxFailedTimes`
     - `githubGroupExpectedStatus`
     - `steamGroupTolerance`
     - `steamGroupTimeout`
     - `steamGroupLazy`
     - `steamGroupMaxFailedTimes`
     - `steamGroupExpectedStatus`
   - 作用：
     - 当 GitHub / Steam 独立组切成测速类组时，可单独控制容差、超时、lazy、失败次数和预期状态码
   - 默认行为：
     - 不传参数时继续沿用全局 `groupTolerance / groupTimeout / groupLazy / groupMaxFailedTimes / groupExpectedStatus`

14. **`full` 日志继续增强**
   - 新增运行环境字段：
     - `request-path`
     - `request-params-target`
     - `route-kind`
     - `route-name`
     - `route-path`
   - 保留并继续输出：
     - `route-target`
     - `query-target`
     - `query-args`
   - 新增调试输出：
     - 响应头开关
     - 响应头前缀
     - 是否成功写入 `_res.headers`
     - 下载链路参数摘要
     - provider 缓存目录 / 刷新间隔 / 下载控制 / 请求头控制

---

## 当前主要能力

### 基础策略组

- `🚀 节点选择`
- `⚡ 自动切换`
- `🎯 手动切换`
- `🎯 全球直连`
- `🐟 兜底节点`
- `🏳️‍🌈 落地节点`
- `🐢 低倍率`

### 业务策略组

- `🤖 AI服务`
- `💰 加密货币`
- `🐙 GitHub`
- `🚂 Steam`
- `🍎 Apple`
- `🔍 Bing`
- `☁️ OneDrive`
- `Ⓜ️ 微软服务`
- `🇬 Google`
- `✈️ Telegram`
- `📹 YouTube`
- `🎥 Netflix`
- `🏰 Disney+`
- `🎧 Spotify`
- `🎵 TikTok`
- `🎮 游戏加速`
- `📦 PT下载`
- `📈 网络测速`
- `🛑 广告拦截`

### AI 增强

`🤖 AI服务` 会同时命中：

- `ChatGPT.list`
- `AIExtra.list`
- `OpenAI` 官方规则
- `Anthropic` 官方规则
- `Gemini` 官方规则
- `Copilot` 社区规则
- `Grok` 社区规则
- `AppleAI` 社区规则
- `category-ai-!cn`

其中：

- `Grok` 主要承接 `x.ai / grok.com`
- `AppleAI` 主要承接 `Apple Intelligence / PCC / Siri AI` 相关域名
- `AppleAI` 默认仍走 `🤖 AI服务`，避免被普通 `🍎 Apple` 直连链提前接住

默认优先链：

- `🇸🇬 狮城节点`
- `🇯🇵 日本节点`
- `🇺🇸 美国节点`
- `🇭🇰 香港节点`

### Crypto 增强

`💰 加密货币` 默认优先链：

- `🇯🇵 日本节点`
- `🇸🇬 狮城节点`
- `🇭🇰 香港节点`

### 开发增强

`🧑‍💻 开发服务` 目前会统一承接：

- `GitLab`
- `Docker`
- `Npmjs`
- `JetBrains`
- `Vercel`
- `Python`
- `Jfrog`
- `Heroku`
- `GitBook`
- `SourceForge`
- `DigitalOcean`
- `Anaconda`
- `Atlassian`
- `Notion`
- `Figma`
- `Slack`

其中：

- `Vercel` 主要覆盖 `vercel / nextjs / turborepo` 相关域名
- `Python` 主要覆盖 `python / pypi / pypa` 相关域名
- `Jfrog` 主要覆盖 `jfrog / bintray` 制品仓库域名
- `Heroku` 主要覆盖 `heroku / herokuapp / herokussl` 部署平台域名
- `GitBook` 主要覆盖 `gitbook / gitbook.io` 文档平台域名
- `SourceForge` 主要覆盖 `sourceforge / sf.net / fsdn` 开源下载分发域名
- `DigitalOcean` 主要覆盖 `digitalocean / digitaloceanspaces / do.co` 云平台域名
- `Anaconda` 主要覆盖 `anaconda / conda.io` 数据科学与 Python 包分发域名
- `Atlassian` 目前覆盖 `atlassian / bitbucket / trello / statuspage` 协作平台域名
- `Notion` 主要覆盖 `notion / notion.so / notion.site` 知识库与文档协作域名
- `Figma` 主要覆盖 `figma.com` 设计协作域名
- `Slack` 主要覆盖 `slack / slack-files / slack-edge` 团队协作域名
- 这些规则默认都会直接复用现有 `dev*` 参数体系，不单独新增新的组参数

---

## Sub-Store 参数兼容

当前脚本兼容以下参数输入来源：

### 1. `$arguments`

传统脚本参数对象。

### 2. `$options`

官方运行环境扩展对象。

### 3. `$options` 字符串负载

支持：

- `a=1&b=2`
- `?a=1&b=2`
- `#a=1&b=2`
- `#full&hidden`
- JSON 字符串

### 4. `$options._req.query / _req.url / _req.path / _req.params`

官方请求上下文里的下载链接参数来源。

### 5. `$options._res.headers`

官方响应上下文字段。

当前脚本在你显式开启：

- `responseHeaders=true`

时，会把关键调试摘要写回下载响应头。

### 6. 官方保留下载参数摘要

当前脚本会额外汇总并输出以下官方链接参数状态：

- `url`
- `content`
- `ua`
- `proxy`
- `mergeSources`
- `ignoreFailedRemoteSub`
- `produceType`
- `noCache`
- `includeUnsupportedProxy`

### 7. 裸旗标兼容

以下写法都会当成 `true`：

- `?full`
- `?hidden`
- `#noCache`
- `#full&hidden`

### 8. 多源优先级

当前优先级从低到高：

1. 请求 `path` 里恢复出的参数
2. 请求 `url` 里恢复出的参数
3. 请求 `query` 里的脚本参数
4. `$options`
5. `$arguments`

说明：

- 显式 `$arguments` 最高
- 同名参数冲突时：
  - 运行时 `query` 优先于 `url/path`
  - 但空值不会覆盖已有有效值
  - `$options` 继续覆盖运行时参数

---

## 官方参数示例

### 1. querystring

```text
$options=full=true&hidden=true&aiPreferCountries=新加坡,日本,美国,香港
```

### 2. `#` 前缀

```text
$options=#full&hidden&groupInterval=300
```

### 3. JSON 字符串

```json
{"full":true,"hidden":true,"groupInterval":300}
```

### 4. 直接放进下载链接 query

```text
...?target=ClashMeta&full&groupInterval=300&snifferForceDomains=+.openai.com,+.anthropic.com
```

### 5. 多一级路由 target

```text
/download/订阅名/ClashMeta?full&groupInterval=300
```

### 6. 开启下载响应调试头

```text
...?target=ClashMeta&full&responseHeaders=true&responseHeaderPrefix=X-Debug-
```

### 7. 自定义 rule-provider 缓存目录

```text
...?target=ClashMeta&full&ruleProviderPathDir=./providers/rules/sub-store-v89
```

### 8. 自定义 rule-provider 刷新间隔

```text
...?target=ClashMeta&full&ruleProviderInterval=43200
```

### 9. 自定义 rule-provider 下载控制

```text
...?target=ClashMeta&full&ruleProviderProxy=🚀%20节点选择&ruleProviderSizeLimit=10485760&ruleProviderUserAgent=clash.meta
```

### 10. 自定义 rule-provider 认证头

```text
...?target=ClashMeta&full&ruleProviderAuthorization=Bearer%20your-token
```

### 10.1 自定义 rule-provider 通用请求头

```text
...?target=ClashMeta&full&ruleProviderHeader=X-Env:%20prod||X-Device:%20router01&ruleProviderUserAgent=clash.meta
```

### 10.2 统一接管现有 http rule-providers

```text
...?target=ClashMeta&full&ruleProviderPathDir=./providers/rules/all&ruleProviderInterval=43200&ruleProviderHeader=X-Env:%20prod
```

### 10.3 统一下发现有 inline rule-providers payload

```text
...?target=ClashMeta&full&ruleProviderPayload=DOMAIN-SUFFIX,internal.example,DIRECT||DOMAIN,router.local,DIRECT
```

### 11. 自定义 GitHub / Steam 独立组优先链

```text
...?target=ClashMeta&full&githubPreferCountries=美国,日本,新加坡&steamPreferCountries=香港,日本
```

### 12. 自定义 GitHub / Steam 独立组模式

```text
...?target=ClashMeta&full&githubMode=proxy&steamMode=select
```

### 13. 自定义 GitHub / Steam 独立组类型

```text
...?target=ClashMeta&full&githubType=url-test&steamType=fallback
```

### 14. 自定义 GitHub / Steam 独立组专属测速

```text
...?target=ClashMeta&full&githubType=url-test&githubTestUrl=https://github.com&githubGroupInterval=300&steamType=fallback&steamTestUrl=https://store.steampowered.com&steamGroupInterval=180
```

### 15. 自定义 GitHub / Steam 独立组专属健康检查

```text
...?target=ClashMeta&full&githubType=url-test&githubGroupTolerance=50&githubGroupTimeout=3000&githubGroupLazy=false&githubGroupMaxFailedTimes=2&githubGroupExpectedStatus=200&steamType=fallback&steamGroupTolerance=80&steamGroupTimeout=4000&steamGroupLazy=true&steamGroupMaxFailedTimes=3&steamGroupExpectedStatus=200
```

### 16. 自定义 GitHub / Steam 独立组原始节点筛选

```text
...?target=ClashMeta&full&githubNodeFilter=IEPL|IPLC|家宽&githubNodeExcludeFilter=0\\.5x|实验|公益&steamNodeFilter=游戏|Game|Steam&steamNodeExcludeFilter=中转|落地
```

### 17. 自定义 GitHub / Steam 独立组协议排除

```text
...?target=ClashMeta&full&githubNodeExcludeType=Http,Socks5&steamNodeExcludeType=Http|Socks5
```

### 18. 自定义 GitHub / Steam 独立组额外前置组

```text
...?target=ClashMeta&full&githubPreferGroups=manual,lowcost,direct&steamPreferGroups=select,my-game-group
```

### 19. 自定义 GitHub / Steam 独立组点名节点优先

```text
...?target=ClashMeta&full&githubPreferNodes=家宽A,GitHub专线01&steamPreferNodes=Steam专线A;家宽B
```

### 20. 自定义 GitHub / Steam / SteamCN 规则入口目标

```text
...?target=ClashMeta&full&githubRuleTarget=manual&steamRuleTarget=🚂%20Steam&steamCnRuleTarget=DIRECT
```

### 21. 自定义 GitHub / Steam / SteamCN 规则入口顺序

```text
...?target=ClashMeta&full&githubRuleAnchor=Geo_Not_CN&githubRulePosition=before&steamRuleAnchor=DirectList&steamRulePosition=before&steamCnRuleAnchor=match
```

### 21A. 自定义策略组布局与 config.rules 锚点

```text
...?target=ClashMeta&full&groupOrderPreset=service&groupOrder=select,ai,github,steam,media,countries,other,extras&customRuleAnchor=Geo_Not_CN&customRulePosition=before
```

### 21AA. 启用区域分组并把区域桶排到国家组前面

```text
...?target=ClashMeta&full&regionGroups=asia,europe,americas&groupOrder=select,github,steam,regions,countries,other,extras
```

### 21B. 切换 blackmatrix7 规则源并启用 SteamFix

```text
...?target=ClashMeta&full&ruleSourcePreset=blackmatrix7&steamFix=true
```

### 21C. 观察开发生态流量分流

```text
...?target=ClashMeta&full&ruleSourcePreset=blackmatrix7
```

### 21D. 自定义开发服务组模式、前置组与开发规则块顺序

```text
...?target=ClashMeta&full&devMode=direct&devType=fallback&devPreferGroups=manual,lowcost&devPreferNodes=GitHub专线01&devRuleTarget=manual&devRuleAnchor=Steam&devRulePosition=before
```

### 21E. 自定义开发服务组专属测速、健康检查与展示高级项

```text
...?target=ClashMeta&full&devType=load-balance&devTestUrl=https://github.com&devGroupInterval=300&devGroupTolerance=50&devGroupTimeout=3000&devGroupLazy=false&devGroupMaxFailedTimes=2&devGroupExpectedStatus=200-299&devGroupStrategy=sticky-sessions&devHidden=false&devDisableUdp=true&devIcon=https://example.com/dev.png
```

### 21F. 自定义开发服务组节点池与 Provider 池

```text
...?target=ClashMeta&full&devUseProviders=airport-a,airport-b&devNodeFilter=IEPL|家宽|GitHub&devNodeExcludeType=Http,Socks5&devIncludeAllProxies=true
```

### 21G. 自定义开发服务组 include-all 全量池

```text
...?target=ClashMeta&full&devIncludeAll=true&devNodeFilter=IEPL|IPLC|家宽&devNodeExcludeFilter=中转|落地&devRuleAnchor=GitHub&devRulePosition=after
```

### 21H. 自定义开发服务组国家优先链

```text
...?target=ClashMeta&full&devPreferCountries=新加坡,日本,美国&devMode=proxy&devType=fallback&devUseProviders=airport-dev
```

### 21I. 自定义 AIExtra 补充规则源

```text
...?target=ClashMeta&full&aiExtraListUrl=https://raw.githubusercontent.com/example/repo/main/AIExtra.list
```

### 22. 自定义 GitHub / Steam 独立组 hidden / icon / disable-udp

```text
...?target=ClashMeta&full&githubHidden=true&githubDisableUdp=true&githubIcon=https://example.com/github.png&steamHidden=false&steamDisableUdp=false&steamIcon=https://example.com/steam.png
```

### 23. 自定义 load-balance strategy

```text
...?target=ClashMeta&full&loadbalance=true&groupStrategy=consistent-hashing&githubType=load-balance&githubGroupStrategy=sticky-sessions&steamType=load-balance&steamGroupStrategy=round-robin
```

### 24. 自定义 GitHub / Steam 独立组 proxy-providers 池

```text
...?target=ClashMeta&full&githubUseProviders=airport-a,airport-b&steamIncludeAllProviders=true&steamNodeFilter=Game|Steam
```

### 25. 自定义 GitHub / Steam 独立组 include-all 全量池

```text
...?target=ClashMeta&full&githubIncludeAll=true&githubNodeFilter=IEPL|IPLC|GitHub&steamIncludeAll=true&steamNodeExcludeFilter=中转|落地
```

### 26. 自定义 expected-status 官方语法

```text
...?target=ClashMeta&full&groupExpectedStatus=200/204/301-302&githubGroupExpectedStatus=200-299&steamGroupExpectedStatus=*
```

### 27. 自定义 proxy-group 网络字段

```text
...?target=ClashMeta&full&groupInterfaceName=eth0&groupRoutingMark=6666&githubInterfaceName=tailscale0&steamRoutingMark=7777
```

### 28. 自定义 GitHub / Steam 独立组 include-all-proxies

```text
...?target=ClashMeta&full&githubIncludeAllProxies=true&steamIncludeAllProxies=true&steamNodeExcludeFilter=中转|落地
```

说明：

- 如果路由 target 与 query target 冲突
- 当前脚本以 **路由 target** 为准
- 并输出显式提醒
- 如果 `_req.query` 缺失，也会继续尝试从 `_req.url / _req.path` 恢复参数
- 如果路由 target 不在 URL 里，也会继续尝试从 `_req.params.target / platform` 恢复
- 如果开启 `responseHeaders=true`，会尝试把调试摘要写入 `_res.headers`
- `full=true` 时会额外输出 `route-kind / route-name / mergeSources / noCache` 等链路摘要
- `full=true` 时，现在还会额外输出 `下载链路语义`
- `full=true` 时，现在还会额外输出 `参数来源`
- `full=true` 时，现在还会额外输出 `参数生效来源`
- `full=true` 时，现在还会额外输出 `未消费参数`
- `full=true` 时，现在还会额外输出 `策略组顺序`
- `full=true` 时，现在还会额外输出 `策略组优先级`
- `full=true` 时，现在还会额外输出 `流量优先级`
- `full=true` 时，现在还会额外输出 `规则层级总览`
- `full=true` 时，现在还会额外输出 `自定义规则区间`
- `full=true` 时，现在还会额外输出 `关键命中窗口`
- `full=true` 时，现在还会额外输出 `规则层级目标映射`
- `full=true` 时，现在还会额外输出 `业务规则窗口`
- `full=true` 时，现在还会额外输出 `规则入口映射`
- `full=true` 时，现在还会额外输出 `规则优先级风险`
- `full=true` 时，现在还会额外输出 `策略组候选链风险`
- `full=true` 时，现在还会额外输出 `业务链路总览`
- `full=true` 时，现在还会额外输出 `分流链路总览`
- `参数来源` 会额外统计 `query-direct / query-options / options-top / options-nested / arguments-top / arguments-nested`
- `参数来源` 还会额外统计 `req-query / req-url / req-path / route-target / route-info / merged`
- `参数生效来源` 会额外统计 `query-win / options-win / arguments-win`
- `参数生效来源` 还会额外统计 `options>query / arguments>query / arguments>options`
- 当前脚本的参数优先级顺序是：`query < $options < $arguments`
- 也就是：同名参数冲突时，`$arguments` 会覆盖 `$options`，`$options` 会覆盖 query
- `参数生效来源` 还会额外输出 `preview=query=... , options=... , arguments=...`
- `未消费参数` 会额外统计 `total / recognized / unused`
- `未消费参数` 还会额外输出 `preview=foo|bar(+N)` 这样的参数名样本
- 如果 `unused > 0`，脚本会额外进入 `参数诊断提醒`
- `策略组顺序` 用来观察最终 `proxy-groups` 在配置中的排列顺序，主要影响面板展示与手动切换时的显示位置
- `策略组优先级` 用来观察关键策略组内部候选项的先后顺序，比如 `DIRECT` 是否在 `GitHub / Steam / Bing / Apple / PT / Speedtest` 之前
- `流量优先级` 用来观察最终 `rules` 的匹配先后；当前脚本按 `script > config.rules > MATCH` 合并
- Mihomo / Clash 的规则匹配核心仍是 **按顺序命中，命中即停止**
- 也就是：真正决定“哪些流量先走”的第一优先级是 `rules` 顺序，不是 `proxy-groups` 数组本身的展示顺序
- `规则层级总览` 会继续把最终 `rules` 按层拆成 `block / local / ai / service / direct / overseas / cn / custom / match`
- 适合在排查“到底是哪一层先吃流量”时，先看分层区间，再回头看具体某条规则
- `order=ai:6@5-10` 这种片段表示 `AI-Crypto` 层共有 6 条，排在第 5~10 条规则
- `preview=block@1=QUIC-REJECT` 这种片段表示该层第一条样本规则是什么
- `自定义规则区间` 会继续把 `config.rules` 这段单独拆出来看
- `raw` 表示自定义规则原始条数（已去掉 `MATCH`）
- `effective` 表示去重后真正插进最终 `rules` 的条数
- `start/end` 表示这些自定义规则最终落在第几条到第几条
- 如果 `config.rules` 自己带了 `MATCH`，脚本会继续进入 `自定义规则提醒`，因为最终仍然只保留一个兜底 `MATCH`
- `关键命中窗口` 会继续把 `Geo_Not_CN / DirectList / CN / CN_IP / GitHub / Steam / SteamCN / MATCH` 这些关键规则单独抽出来看
- 它会同时给出每条关键规则的实际序号，以及它前一条/后一条相邻规则
- 适合在排查“为什么 GitHub / Steam 明明有独立规则，却还是被前面的大规则卡住”时直接看窗口
- `Geo_Not_CN@28[DirectList->🎯 全球直连 < Geo_Not_CN->🚀 节点选择 < GitHub->🐙 GitHub]` 这类片段就表示关键规则的前后邻居是谁
- `规则层级目标映射` 会继续把 `规则层级` 和 `目标组` 做交叉统计
- 适合在排查“为什么某一层的规则几乎都送进了某个组”时直接看这份交叉摘要
- `preview=service->🍎 Apple:2|ai->🤖 AI服务:5` 这类片段表示对应层里有多少条规则最终指向这个目标组
- `业务规则窗口` 会继续把 `ChatGPT / AIExtra / OpenAI / Anthropic / Gemini / Copilot / Grok / AppleAI / AI / Crypto / GitHub / GitLab / Docker / Npmjs / JetBrains / Vercel / Python / Jfrog / Heroku / GitBook / SourceForge / DigitalOcean / Anaconda / Atlassian / Notion / Figma / Slack / Dropbox / Steam / SteamCN` 这些业务规则单独抽出来看
- 它会给每条业务规则附上前 2 条和后 2 条邻居，适合排查某条业务规则是不是正好被夹在宽泛规则和地区规则之间
- `prev=... , curr=... , next=...` 会直接展示该业务规则前后的局部链路
- `规则入口映射` 用来观察 `RULE-SET provider -> target` 的最终映射结果
- `规则入口映射` 里的 `top=组名:数量` 用来表示哪些目标组承接了最多业务规则
- `规则入口映射` 里的 `preview=provider->group` 会按最终规则顺序展示前几条入口样本
- `规则优先级风险` 用来观察是否有更宽泛的规则排在特定业务规则前面
- 当前脚本重点检查 `Geo_Not_CN / CN / CN_IP / DirectList` 是否抢先 `GitHub / Steam / SteamCN`
- 一旦命中这类风险，相关流量可能会先进入更宽泛规则的目标组，后面的业务规则就不一定还能吃到
- `策略组候选链风险` 用来观察关键策略组内部的候选顺序是否异常
- 当前脚本重点检查 `DIRECT / REJECT / FALLBACK / SELECT` 这些关键候选是不是被排错位
- 一旦命中这类风险，即便规则已经把流量送进正确的组，组内实际选路结果也可能和预期不一致
- `业务链路总览` 会单独聚焦 `GitHub / GitLab / Docker / Npmjs / JetBrains / Vercel / Python / Jfrog / Heroku / GitBook / SourceForge / DigitalOcean / Anaconda / Atlassian / Notion / Figma / Slack / Dropbox / OneDrive / Steam / SteamCN / AIExtra / Copilot / Grok / AppleAI / AI / Crypto` 这些关键业务
- 它会把 `规则入口 -> 目标组 -> 组类型 -> 头部候选链` 压成单独摘要
- 适合在排查“某一类业务为什么没有按预期组走”时，直接先看局部业务链，而不是先翻整条大链
- 如果出现 `GitHub -> 直连组`、`SteamCN -> 节点选择`、`AI 首位 DIRECT`、`Crypto 首位偏离国家优先链`，脚本会额外进入 `业务链路提醒`
- `分流链路总览` 会把 `请求入口 -> 关键规则入口 -> 目标组 -> 关键组候选链` 串成一条摘要
- 适合在排查“为什么这个流量没有走预期组”时，先快速看整条链，再回头看局部风险摘要
- `route-target=params/url/path/none` 用来表示最终路由目标是从哪一路识别出来的
- `route-info=path/url/none` 用来表示当前 `download/share/file` 路由信息是从 `path` 还是 `url` 识别出来的
- `merged` 表示当前脚本最终合并后的参数键数量
- `下载链路` 摘要里现在还会额外输出 `url-kind`
- `url-kind=remote-http` 表示当前 `url` 会被当作远程订阅地址拉取
- `url-kind=local-node` 表示当前 `url` 不是 `http(s)`，按 Sub-Store 官方语义会被当作单条本地节点内容
- `url-kind=none` 表示当前链接里没有传 `url`
- `mergeSources` 仅支持 `localFirst / remoteFirst`
- `produceType` 仅支持 `internal / raw`
- 如果 `mergeSources` 传了其他值，脚本会进入下载链路参数提醒
- 如果 `produceType` 传了其他值，脚本也会进入下载链路参数提醒
- 如果同时传了 `url` 与 `content` 却没写 `mergeSources`，脚本会继续显式提醒
- 如果 `url` 不是 `http(s)`，脚本会显式提醒它会被当成本地节点内容，而不是远程订阅地址
- 如果设置了 `noCache / proxy / ua / ignoreFailedRemoteSub`，但当前没有可识别的远程订阅 `url`，脚本会显式提醒这些保留参数大概率不会生效
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Arg-Source-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Arg-Effective-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Arg-Effective-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Unused-Arg-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Unused-Arg-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Rule-Target-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Rule-Target-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Rule-Priority-Risk-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Rule-Priority-Risk-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Proxy-Group-Priority-Risk-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Proxy-Group-Priority-Risk-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Proxy-Group-Order`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Proxy-Group-Priority`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Traffic-Priority-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Rule-Layer-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Rule-Layer-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Custom-Rule-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Custom-Rule-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Key-Rule-Window-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Key-Rule-Window-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Rule-Layer-Target-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Rule-Layer-Target-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Service-Rule-Window-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Service-Rule-Window-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Service-Routing-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Service-Routing-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Routing-Chain-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Routing-Chain-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Route-Target-Source`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Route-Info-Source`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Link-Url-Kind`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Link-Semantic-Summary`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Link-Semantic-Check`
- 如果设置 `ruleProviderPathDir`，最终配置里的全部 `http` 类型 `rule-providers` 会统一切到该目录
- 如果设置 `ruleProviderInterval`，最终配置里的全部 `http` 类型 `rule-providers` 刷新间隔会统一切到该值
- 如果设置 `ruleProviderProxy / ruleProviderSizeLimit / ruleProviderUserAgent`，最终配置里的全部 `http` 类型 `rule-providers` 会统一带上这些下载控制项
- 如果设置 `ruleProviderAuthorization`，最终配置里的全部 `http` 类型 `rule-providers` 会统一补上 `Authorization` 请求头
- 如果设置 `ruleProviderHeader`，最终配置里的全部 `http` 类型 `rule-providers` 会统一写入通用自定义请求头
- `ruleProviderHeader` 支持 `Header: value||Header2: value2`、多行写法，以及 `Header=>value`
- 如果同时设置 `ruleProviderHeader` 与 `ruleProviderUserAgent / ruleProviderAuthorization`，则后者优先级更高
- 如果设置 `ruleProviderPayload`，最终配置里的全部 `inline` 类型 `rule-providers` 会统一写入 `payload`
- `ruleProviderPayload` 支持 JSON 数组、JSON 字符串数组，以及直接用换行 / `||` 分隔规则列表
- `ruleProviderPayload` 只对 `type=inline` 生效；如果当前配置没有 `inline rule-providers`，脚本会显式提醒未生效
- `full=true` 时，`规则源参数` 会额外输出 `apply-scope`
- `full=true` 时，`规则源参数` 还会额外输出 `apply-stats`
- `full=true` 时，`规则源参数` 现在还会额外输出 `apply-preview`
- `full=true` 时，`规则源参数` 现在还会额外输出 `mutation-stats`
- `full=true` 时，`规则源参数` 现在还会额外输出 `mutation-preview`
- 如果开启 `responseHeaders=true`，响应调试头会额外输出 `Rule-Provider-Apply-Scope-Detail`
- 如果开启 `responseHeaders=true`，响应调试头还会额外输出 `Rule-Provider-Apply-Stats`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Rule-Provider-Apply-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Rule-Provider-Mutation-Stats`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Rule-Provider-Mutation-Preview`
- 当前脚本里的 rule-provider 参数接管范围摘要口径为：`path / download = http-only`，`payload = inline-only`
- `Rule-Provider-Apply-Stats` 会额外统计 `total/http/file/inline/other/invalid/path-hit/download-hit/payload-hit`
- `Rule-Provider-Apply-Preview` 会额外输出 `path/download/payload` 各自命中的 provider 名称样本
- `Rule-Provider-Mutation-Stats` 会额外统计 `path-added/path-overrode/path-noop/download-added/download-overrode/download-noop/payload-added/payload-overrode/payload-noop`
- `Rule-Provider-Mutation-Preview` 会额外输出 `path/download/payload` 各自的 `added/overrode/noop` provider 名称样本
- `rule-provider` 路径接管、下载控制与请求头接管只对 `type=http` 生效；`file / inline` 会显式提醒未生效
- 出于安全考虑，日志与响应调试头里只会显示 `configured`，不会直接回显认证内容
- 如果设置 `proxyProviderPathDir`，当前配置里已有的 `type=http` 的 `proxy-providers` 会统一改写到该目录下
- `proxyProviderPathDir` 生成的 `path` 会按 provider 名稳定命名，并自动避开重名冲突
- 如果没设置 `proxyProviderPathDir`，脚本会继续保留原 `path`；原本就没写 `path` 时，继续保持 Mihomo 默认缓存行为
- 如果设置 `proxyProviderHeader`，当前配置里已有的 `type=http` 的 `proxy-providers` 会统一写入通用自定义请求头
- `proxyProviderHeader` 支持 `Header: value||Header2: value2`、多行写法，以及 `Header=>value`
- 如果同时设置 `proxyProviderHeader` 与 `proxyProviderUserAgent / proxyProviderAuthorization`，则后者优先级更高
- 如果设置 `proxyProviderPayload`，脚本会统一写入现有 `proxy-providers` 的 `payload`
- `proxyProviderPayload` 支持 JSON 对象、JSON 数组，以及通过 Sub-Store `$options` / 链接参数传入 JSON 字符串
- `proxyProviderPayload` 对 `inline` provider 可直接作为节点池；对 `http/file` provider 可作为解析失败时的后备节点池
- 如果设置 `proxyProviderInterval / proxyProviderProxy / proxyProviderSizeLimit / proxyProviderUserAgent / proxyProviderAuthorization`，当前配置里已有的 `proxy-providers` 会统一接管下载控制
- `proxy-provider` 路径接管与下载控制只对 `type=http` 的 provider 生效；非 `http` 类型会显式提醒未生效
- `full=true` 时，`代理集合参数` 会额外输出 `apply-scope`
- `full=true` 时，`代理集合参数` 还会额外输出 `apply-stats`
- `full=true` 时，`代理集合参数` 现在还会额外输出 `apply-preview`
- `full=true` 时，`代理集合参数` 现在还会额外输出 `mutation-stats`
- `full=true` 时，`代理集合参数` 现在还会额外输出 `mutation-preview`
- 如果开启 `responseHeaders=true`，响应调试头会额外输出 `Proxy-Provider-Apply-Scope`
- 如果开启 `responseHeaders=true`，响应调试头还会额外输出 `Proxy-Provider-Apply-Stats`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Proxy-Provider-Apply-Preview`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Proxy-Provider-Mutation-Stats`
- 如果开启 `responseHeaders=true`，响应调试头现在还会额外输出 `Proxy-Provider-Mutation-Preview`
- 当前脚本里的 proxy-provider 参数接管范围摘要口径为：`path / download = http-only`，`payload / collection / override / health-check = all-provider-types`
- `Proxy-Provider-Apply-Stats` 会额外统计 `total/http/file/inline/other/invalid/path-hit/download-hit/payload-hit/collection-hit/override-hit/health-check-hit`
- `Proxy-Provider-Apply-Preview` 会额外输出 `path/download/payload/collection/override/health-check` 各自命中的 provider 名称样本
- `Proxy-Provider-Mutation-Stats` 会额外统计 `path-added/path-overrode/path-noop/download-added/download-overrode/download-noop/payload-added/payload-overrode/payload-noop/collection-added/collection-overrode/collection-noop/override-added/override-overrode/override-noop/health-check-added/health-check-overrode/health-check-noop`
- `Proxy-Provider-Mutation-Preview` 会额外输出 `path/download/payload/collection/override/health-check` 各自的 `added/overrode/noop` provider 名称样本
- `Apply-Preview` 样本摘要统一最多展示前 `3` 个 provider 名称，超出部分会折叠成 `(+N)`
- `Apply-Preview` 在未开启对应功能时显示 `off`，开启但无命中时显示 `none`
- `Mutation-Preview` 样本摘要统一最多展示前 `2` 个 provider 名称，超出部分会折叠成 `(+N)`
- `Mutation-Preview` 在未开启对应功能时显示 `off`，开启后某个状态没有命中时显示 `none`
- 这一轮额外会按 Mihomo 官方语义检查 `rule-providers` 的 `type / behavior / format / path / payload` 搭配是否合理
- 如果 rule-provider `path` 看起来像绝对路径或明显越级路径，脚本会提醒它可能超出 HomeDir，需要额外 `SAFE_PATHS`
- 这一轮额外会按 Mihomo 官方语义检查 `type / url / path / payload` 的搭配是否合理
- 如果 provider `path` 看起来像绝对路径或明显越级路径，脚本会提醒它可能超出 HomeDir，需要额外 `SAFE_PATHS`
- 如果设置 `proxyProviderFilter / proxyProviderExcludeFilter / proxyProviderExcludeType`，脚本会把这些值统一写进现有 `proxy-providers` 的节点池筛选字段
- `proxyProviderExcludeType` 支持逗号、竖线、换行三种写法，最终会统一规范成 Mihomo `A|B|C` 形式
- `proxyProviderExcludeType` 不是正则字段，请只写类型名并用 `|` 分隔
- 如果 `proxyProviderFilter / proxyProviderExcludeFilter` 正则无法编译，会进入代理集合告警
- 如果 `proxyProviderExcludeType` 清洗后为空，脚本会忽略该值并显式告警
- 如果设置 `proxyProviderOverrideAdditionalPrefix / proxyProviderOverrideAdditionalSuffix`，脚本会统一写入现有 `proxy-providers` 的 `override` 前后缀
- 如果设置 `proxyProviderOverrideUdp / proxyProviderOverrideUdpOverTcp / proxyProviderOverrideDown / proxyProviderOverrideUp / proxyProviderOverrideTfo / proxyProviderOverrideMptcp / proxyProviderOverrideSkipCertVerify / proxyProviderOverrideDialerProxy / proxyProviderOverrideInterfaceName / proxyProviderOverrideRoutingMark / proxyProviderOverrideIpVersion`，脚本会统一写入现有 `proxy-providers` 的 `override`
- 如果设置 `proxyProviderOverrideProxyName`，脚本会把它解析成现有 `proxy-providers` 的 `override.proxy-name`
- `proxyProviderOverrideProxyName` 支持 `pattern=>target||pattern2=>target2` 与多行写法
- `proxyProviderOverrideProxyName` 的 `pattern` 会做正则可编译校验
- `proxyProviderOverrideIpVersion` 仅支持 `dual / ipv4 / ipv6 / ipv4-prefer / ipv6-prefer`
- `proxyProviderOverrideRoutingMark` 仅支持大于等于 `0` 的整数
- `proxyProviderOverrideUdp / proxyProviderOverrideUdpOverTcp / proxyProviderOverrideTfo / proxyProviderOverrideMptcp / proxyProviderOverrideSkipCertVerify` 仅支持布尔值
- 如果设置 `proxyProviderHealthCheckEnable / proxyProviderHealthCheckUrl / proxyProviderHealthCheckInterval / proxyProviderHealthCheckTimeout / proxyProviderHealthCheckLazy / proxyProviderHealthCheckExpectedStatus`，脚本会把这些值合并进现有 `proxy-providers` 的 `health-check`
- 如果当前配置里根本没有 `proxy-providers`，但你传了 `proxyProvider*` 参数，脚本会显式告警
- `proxyProviderHealthCheckExpectedStatus` 按 Mihomo 官方 expected-status 语法校验，支持 `*`、单个状态码，以及 `200/302/400-503` 这类多状态/范围写法
- 如果 `proxyProviderHealthCheckExpectedStatus` 语法非法，脚本会忽略该值并显式告警
- 如果 `proxyProviderHealthCheckUrl` 看起来不像合法 `http(s)` 地址，也会进入代理集合告警
- 如果设置 `githubPreferCountries / steamPreferCountries`，对应独立组会优先插入这些国家组
- 如果设置 `devPreferCountries`，开发服务组也会优先插入这些国家组
- Steam 组即使设置了优先链，`DIRECT` 仍然保持在最前面
- 开发服务组在 `devMode=direct` 时同样会保持 `DIRECT` 第一位，再把 `devPreferCountries` 插到 `GitHub` 前面
- 如果设置 `githubMode / steamMode`，可以切换独立组是 `select / direct / proxy` 哪种候选顺序
- GitHub 默认 `select`，Steam 默认 `direct`
- 如果设置 `githubType / steamType`，可以把独立组切成 `select / url-test / fallback / load-balance`
- 切成测速类组后，会自动复用脚本现有的 `testUrl / groupInterval / groupTolerance / groupTimeout` 等测速参数
- 如果设置 `githubTestUrl / githubGroupInterval / steamTestUrl / steamGroupInterval`，则 GitHub / Steam 独立组会优先使用各自专属测速参数
- 如果设置 `githubGroupTolerance / githubGroupTimeout / githubGroupLazy / githubGroupMaxFailedTimes / githubGroupExpectedStatus` 等参数，则 GitHub / Steam 独立组会优先使用各自专属健康检查参数
- 如果设置 `githubNodeFilter / steamNodeFilter`，对应独立组会在原有显式候选链之外，额外挂上 `include-all-proxies` 自动收集匹配到的原始节点
- 如果设置 `githubIncludeAllProxies / steamIncludeAllProxies`，即使不写任何筛选条件，也会显式开启对应独立组的 `include-all-proxies`
- 如果设置 `githubNodeExcludeFilter / steamNodeExcludeFilter`，对应独立组会进一步使用 Mihomo `exclude-filter` 剔除命中的原始节点
- 如果设置 `githubNodeExcludeType / steamNodeExcludeType`，对应独立组会进一步使用 Mihomo `exclude-type` 排除指定协议类型
- `githubIncludeAllProxies / steamIncludeAllProxies` 可以和 `NodeFilter / NodeExcludeFilter / NodeExcludeType` 继续叠加使用
- 如果同时设置 `include-all=true` 与 `include-all-proxies=true`，脚本会提示后者被忽略，并以 `include-all` 为准
- `githubNodeExcludeType / steamNodeExcludeType` 支持逗号、竖线、换行三种写法，最终会统一规范成 Mihomo `A|B|C` 形式
- `exclude-type` 自检会兼容 `Shadowsocks / Socks5 / Http` 这类文档写法，以及 `ss / socks5 / http` 这类常见短写法
- 如果设置 `githubPreferGroups / steamPreferGroups`，对应独立组会在现有候选链最前面额外插入这些策略组/内置策略
- `githubPreferGroups / steamPreferGroups` 和 `githubPreferCountries / steamPreferCountries` 可以同时使用：前者管“组编排”，后者管“国家优先”
- 如果已经启用了 `regionGroups`，则 `githubPreferGroups / steamPreferGroups / devPreferGroups` 也可以直接写区域别名：
  - `asia / europe / americas / middleeast / oceania / africa`
- 如果设置 `devPreferGroups`，开发服务组也会在现有候选链最前面额外插入这些策略组/内置策略
- `devPreferGroups` 适合把 `manual / lowcost / 你自己的开发专线组` 插到开发服务组最前面
- `devPreferGroups` 和 `devPreferCountries` 可以同时使用：前者管“组编排”，后者管“国家优先”
- `PreferGroups` 支持直接引用：
  - 已生成组名
  - `DIRECT`
  - 原配置里的自定义策略组名
  - 常用别名如 `select / manual / fallback / direct / lowcost / landing / games`
- 如果独立组当前是 `direct` 模式，脚本仍会强制让 `DIRECT` 保持在最前
- 如果 `PreferGroups` 标记没命中任何组，或错误引用了独立组自己，会进入独立组前置组告警
- 如果设置 `githubPreferNodes / steamPreferNodes`，对应独立组会在前置组之前，直接插入这些真实节点
- 如果设置 `devPreferNodes`，开发服务组也会在前置组之前，直接插入这些真实节点
- `PreferNodes` 的优先级高于 `PreferGroups`，也高于国家优先链
- 开发服务组当前候选顺序可以理解为：`PreferNodes > PreferGroups > devPreferCountries > devMode 基础链`
- `PreferNodes` 会按“精确匹配 -> 忽略大小写精确匹配 -> 唯一模糊匹配”依次尝试
- 如果某个 `PreferNodes` 标记同时命中多个节点，脚本会给出歧义告警，不会随便选一个
- `PreferNodes` 只支持逗号、分号、换行分隔；不会把 `|` 当分隔符，因为很多节点名本身就带 `|`
- 如果 `PreferNodes` 标记没命中任何节点，会进入独立组点名节点告警
- 如果设置 `devMode`，可以切换开发服务组是 `select / direct / proxy` 哪种候选顺序
- 开发服务组默认 `devMode=select`，也就是 `GitHub -> 节点选择 -> 自动切换...`
- 如果设置 `devPreferCountries`，这些国家组会插到开发服务组基础链前面；在 `devMode=direct` 时则插到 `DIRECT` 后、`GitHub` 前
- 如果设置 `devType`，开发服务组也可以切到 `select / url-test / fallback / load-balance`
- 当 `devType` 不是 `select` 时，会复用脚本现有的 `testUrl / groupInterval / groupTolerance / groupTimeout` 等测速参数
- 如果设置 `devTestUrl / devGroupInterval`，开发服务组会优先使用自己的测速地址与测速间隔
- 如果设置 `devGroupTolerance / devGroupTimeout / devGroupLazy / devGroupMaxFailedTimes / devGroupExpectedStatus`，开发服务组会优先使用自己的健康检查参数
- 如果设置 `devGroupStrategy`，则开发服务组会在 `devType=load-balance` 时优先使用自己的 load-balance strategy
- 如果 `devGroupStrategy` 传了值但 `devType` 不是 `load-balance`，脚本会显式提醒该参数当前不生效
- 如果设置 `devHidden / devDisableUdp / devIcon`，开发服务组也会像 GitHub / Steam 独立组一样写入对应 proxy-group 字段
- 如果设置 `devInterfaceName / devRoutingMark`，开发服务组会优先使用自己的专属网络字段
- 如果设置 `devNodeFilter`，开发服务组会在原有显式候选链之外，额外挂上 `include-all-proxies` 自动收集匹配到的原始节点
- 如果设置 `devIncludeAllProxies=true`，即使不写任何筛选条件，也会显式开启开发服务组的 `include-all-proxies`
- 如果设置 `devNodeExcludeFilter / devNodeExcludeType`，开发服务组会进一步使用 Mihomo `exclude-filter / exclude-type` 剔除不想要的节点
- `devNodeExcludeType` 同样支持逗号、竖线、换行三种写法，最终统一规范成 Mihomo `A|B|C` 形式
- 如果设置 `devUseProviders`，脚本会把命中的 `proxy-providers` 写入开发服务组的 `use`
- 如果设置 `devIncludeAllProviders=true`，脚本会给开发服务组挂上 `include-all-providers`
- 如果设置 `devIncludeAll=true`，脚本会给开发服务组挂上 Mihomo 官方 `include-all`
- `devUseProviders / devIncludeAllProviders / devIncludeAll` 可以继续和 `devNodeFilter / devNodeExcludeFilter / devNodeExcludeType` 叠加使用
- 如果同时设置 `devUseProviders` 和 `devIncludeAllProviders=true`，脚本会提示前者被忽略，并以 `include-all-providers` 为准
- 如果同时设置 `devIncludeAll=true` 与 `devUseProviders / devIncludeAllProviders`，脚本会提示后两者被忽略，并以 `include-all` 为准
- 开发服务组现在也支持“显式候选链 + 原始节点池 + proxy-providers 池”混合模式
- 如果设置 `devRuleTarget`，会把 `GitLab / Docker / Npmjs / Jetbrains / Vercel / Python / Jfrog / Heroku / GitBook / SourceForge / DigitalOcean / Anaconda / Atlassian / Notion / Figma / Slack / Dropbox` 十七条开发规则一起改写到同一个目标组/内置策略
- 如果设置 `githubRuleTarget / steamRuleTarget / steamCnRuleTarget`，会直接改写对应规则命中的入口目标
- 规则入口目标支持：
  - 已生成组名
  - 原配置里的自定义策略组名
  - `DIRECT / REJECT / GLOBAL / COMPATIBLE` 等内置策略
  - 常用别名如 `select / manual / fallback / direct / games`
- 规则入口目标参数和独立组内部顺序参数是两层能力：一个决定“先进哪个组”，一个决定“进组后怎么选”
- 如果规则入口目标参数没命中任何可用组/内置策略，脚本会显式告警并自动回退默认目标
- 如果设置 `devRuleAnchor / devRulePosition`，会把整块开发规则一起移动到指定锚点前后
- 开发规则块移动时会保持 `GitLab -> Docker -> Npmjs -> Jetbrains -> Vercel -> Python -> Jfrog -> Heroku -> GitBook -> SourceForge -> DigitalOcean -> Anaconda -> Atlassian -> Notion -> Figma -> Slack` 的内部相对顺序
- `devRuleAnchor` 同样支持 provider 名、常用别名，以及 `top / start / end / match`
- `devRuleAnchor` 不能引用开发规则块自身；例如 `dev / gitlab / docker / npmjs / jetbrains / vercel / python / jfrog / heroku / gitbook / sourceforge / digitalocean / anaconda / atlassian / bitbucket / trello / statuspage / notion / figma / slack` 会进入显式告警
- 如果设置 `githubRuleAnchor / steamRuleAnchor / steamCnRuleAnchor`，会按锚点重排对应规则入口在整条 `RULE-SET` 链里的位置
- `RulePosition` 只支持 `before / after`；如果不传，默认按 `before` 处理
- 规则顺序锚点支持 provider 名、常用别名，以及特殊位置别名 `top / start / first / end / match / final`
- 常用规则顺序锚点可直接写：`ChatGPT / AIExtra / Copilot / Grok / AppleAI / Vercel / Python / Jfrog / Heroku / GitBook / SourceForge / DigitalOcean / Anaconda / Atlassian / Notion / Figma / Slack / Dropbox / OneDrive / AI / Steam / SteamCN / Geo_Not_CN / DirectList / CN`
- `OneDrive` 规则锚点还支持常见别名：`sharepoint / skydrive / 1drv`
- 如果规则顺序锚点未命中任何规则入口，或错误引用了自己，脚本会显式告警并保持默认顺序
- 如果设置 `customRuleAnchor / customRulePosition`，会把 `config.rules` 整段插到指定锚点前后，而不再固定只放在 `MATCH` 前
- `customRuleAnchor` 复用和 `githubRuleAnchor` 一样的锚点体系：既支持 provider 名，也支持 `top / start / end / match`
- 如果 `customRuleAnchor` 没命中任何规则入口，脚本会显式告警并回退到默认“脚本规则后、MATCH 前”
- 如果设置 `groupOrderPreset`，脚本会按预设重排最终 `proxy-groups` 展示顺序
- `groupOrderPreset` 支持 `balanced / core / service / media / region`
- 如果设置 `groupOrder`，脚本会优先使用显式 token 顺序；此时 `groupOrderPreset` 只作为 fallback / 说明项
- 如果设置 `regionGroups`，脚本会在国家组之上额外挂一层可选区域组；默认关闭
- `regionGroups` 支持：
  - `asia / europe / americas / middleeast / oceania / africa`
  - `all / auto / default`
  - `none / off / false`
- 区域组只聚合这一轮已经生成出来的国家组，不会直接去抓原始节点
- 区域组默认只用于面板切换、布局编排和独立组前置引用，不会加入主功能候选池
- `groupOrder` 支持：
  - 单个组别名，如 `select / ai / github / steam / direct / ads`
  - 分组桶，如 `core / services / media / regions / countries / extras`
- 如果已经启用了 `regionGroups`，`groupOrder` 还支持直接写区域别名：
  - `asia / europe / americas / middleeast / oceania / africa`
- 如果 `groupOrder` 里的某个 token 没命中任何策略组或分组桶，脚本会显式告警，不会静默吞掉
- `full=true` 时，日志会额外输出：
  - `区域分组`
  - `区域统计`
  - `区域分组参数`
- 如果开启 `responseHeaders=true`，响应调试头会额外输出：
  - `Region-Groups`
  - `Region-Group-Preview`
  - `Region-Group-Summary`
- 如果设置 `aiExtraListUrl`，脚本会把 `AIExtra` 规则源切到你自定义的 GitHub AI 补充列表
- 如果设置 `ruleSourcePreset=blackmatrix7`，当前会接管内置的 `GitHub / Steam / SteamCN / OpenAI / Anthropic / Gemini / Copilot / OneDrive` 规则源
- `Grok / AppleAI` 当前走的是 `Accademia/Additional_Rule_For_Clash` 社区补充规则，不受 `ruleSourcePreset=blackmatrix7` 影响
- 另外，新增的 `GitLab / Docker / Npmjs / Jetbrains / Vercel / Python / Jfrog / Heroku / GitBook / SourceForge / DigitalOcean / Anaconda / Atlassian / Notion / Figma / Slack / Dropbox` 开发生态规则当前也统一采用 blackmatrix7 的 Clash YAML 规则
- `OneDrive` 默认仍走 MetaCubeX geosite；当切到 `ruleSourcePreset=blackmatrix7` 时，也会改走 `blackmatrix7/ios_rule_script` 的 `OneDrive.yaml`
- `ruleSourcePreset` 不会改动 `DirectList / Crypto / ChatGPT / AIExtra` 这些本地 classical 规则源
- 如果设置 `steamFix=true`，脚本会插入一条 `SteamFix -> DIRECT` 规则到 `Steam / SteamCN` 前面
- 如果继续设置 `steamFixUrl`，脚本会优先使用自定义 URL；未设置时回退内置默认 SteamFix 规则地址
- `steamFix` 默认关闭，属于显式启用的补丁能力，不会默认改你的原始分流行为
- 新增的 `🧑‍💻 开发服务` 组当前默认把 `🐙 GitHub` 放在最前面，因此 GitLab / Docker / NPM / JetBrains / Vercel / Python / JFrog / Heroku / GitBook / SourceForge / DigitalOcean / Anaconda / Atlassian / Notion / Figma / Slack 流量会优先沿用 GitHub / 开发链路
- 如果设置 `githubHidden / steamHidden`，只会隐藏 GitHub / Steam 独立组本身，不影响其他脚本组
- 如果设置 `githubIcon / steamIcon`，脚本会把对应值原样写入独立组 `icon` 字段
- 如果设置 `githubDisableUdp / steamDisableUdp`，脚本会把对应值写入独立组 `disable-udp` 字段
- 如果设置 `groupInterfaceName / groupRoutingMark`，脚本会把对应值写入所有脚本生成的 proxy-group
- 如果继续设置 `githubInterfaceName / steamInterfaceName / githubRoutingMark / steamRoutingMark`，则 GitHub / Steam 独立组会优先使用各自专属值
- `routing-mark` 只接受大于等于 `0` 的整数；`interface-name` 传空值时会被忽略并显式提醒
- Mihomo Proxy Groups 官方文档已将 `interface-name / routing-mark` 标记为 deprecated；脚本会在启用时给出显式提醒
- `hidden / icon` 的最终展示效果取决于你正在使用的 Mihomo 前端是否支持这些字段
- 如果 `githubIcon / steamIcon` 传的是空值，脚本会忽略并给出显式提醒
- 如果设置 `groupStrategy`，脚本会把它写入所有生成出来的 `load-balance` 组
- `groupStrategy` 支持 `round-robin / consistent-hashing / sticky-sessions`
- 如果设置 `githubGroupStrategy / steamGroupStrategy`，则 GitHub / Steam 独立组会优先使用各自专属 strategy
- `githubGroupStrategy / steamGroupStrategy` 只在对应独立组类型为 `load-balance` 时生效；否则脚本会显式提醒
- strategy 非法时会自动回退默认值，并输出显式告警
- 如果设置 `githubUseProviders / steamUseProviders`，脚本会把命中的 `proxy-providers` 写入对应独立组的 `use`
- `UseProviders` 支持精确匹配、忽略大小写精确匹配、唯一模糊匹配
- 如果设置 `githubIncludeAllProviders / steamIncludeAllProviders`，脚本会给对应独立组挂上 `include-all-providers`
- 如果设置 `githubIncludeAll / steamIncludeAll`，脚本会给对应独立组挂上 `include-all`
- `UseProviders` 和 `include-all-providers` 可以和现有 `NodeFilter / NodeExcludeFilter / NodeExcludeType` 继续叠加使用
- `include-all` 同样可以和 `NodeFilter / NodeExcludeFilter / NodeExcludeType` 继续叠加使用
- 如果 provider 标记未命中、命中歧义，或者当前根本没有 `proxy-providers`，脚本会显式告警
- 如果同时设置 `UseProviders` 和 `include-all-providers=true`，脚本会提示 `UseProviders` 被忽略，并以 `include-all-providers` 为准
- 如果同时设置 `include-all=true` 与 `UseProviders / include-all-providers`，脚本会提示后两者被忽略，并以 `include-all` 为准
- 对于主要通过 `use / include-all-providers / include-all` 引入 provider 池的 `url-test / fallback / load-balance` 组，脚本会追加官方语义提醒：健康检查只检查 `proxies` 字段，不检查 provider 内节点
- `groupExpectedStatus / githubGroupExpectedStatus / steamGroupExpectedStatus` 现在会按 Mihomo 官方语法校验
- 支持 `*`、单个状态码，以及 `200/302/400-503` 这类多状态/范围写法
- 如果 expected-status 语法非法，脚本会显式告警并自动回退默认值
- 新增节点池参数后，日志里会额外输出 `独立组节点池` 摘要，响应调试头里也会标记 GitHub / Steam 是否启用了自动收集原始节点
- 如果 `NodeFilter / NodeExcludeFilter` 正则写错，仍然会进入自动分组正则告警；如果筛完一个节点都没有，也会进入自动分组为空告警

---

## 参数说明

### 基础参数

- `ipv6`
- `loadbalance`
- `landing`
- `hidden`
- `fakeip`
- `threshold`
- `quic`
- `full`

### 规则源参数

- `directListUrl`
- `cryptoListUrl`
- `chatgptListUrl`
- `aiExtraListUrl`
- `ruleProviderPathDir`
- `ruleProviderInterval`
- `ruleProviderProxy`
- `ruleProviderSizeLimit`
- `ruleProviderUserAgent`
- `ruleProviderAuthorization`
- `ruleProviderHeader`
- `ruleProviderPayload`

### 代理集合参数

- `proxyProviderPathDir`
- `proxyProviderInterval`
- `proxyProviderProxy`
- `proxyProviderSizeLimit`
- `proxyProviderUserAgent`
- `proxyProviderAuthorization`
- `proxyProviderHeader`
- `proxyProviderPayload`
- `proxyProviderFilter`
- `proxyProviderExcludeFilter`
- `proxyProviderExcludeType`
- `proxyProviderOverrideAdditionalPrefix`
- `proxyProviderOverrideAdditionalSuffix`
- `proxyProviderOverrideUdp`
- `proxyProviderOverrideUdpOverTcp`
- `proxyProviderOverrideDown`
- `proxyProviderOverrideUp`
- `proxyProviderOverrideTfo`
- `proxyProviderOverrideMptcp`
- `proxyProviderOverrideSkipCertVerify`
- `proxyProviderOverrideDialerProxy`
- `proxyProviderOverrideInterfaceName`
- `proxyProviderOverrideRoutingMark`
- `proxyProviderOverrideIpVersion`
- `proxyProviderOverrideProxyName`
- `proxyProviderHealthCheckEnable`
- `proxyProviderHealthCheckUrl`
- `proxyProviderHealthCheckInterval`
- `proxyProviderHealthCheckTimeout`
- `proxyProviderHealthCheckLazy`
- `proxyProviderHealthCheckExpectedStatus`

### 业务优先链参数

- `aiPreferCountries`
- `cryptoPreferCountries`
- `githubPreferCountries`
- `steamPreferCountries`
- `devPreferCountries`
- `githubPreferGroups`
- `steamPreferGroups`
- `devPreferGroups`
- `githubPreferNodes`
- `steamPreferNodes`
- `devPreferNodes`
- `devRuleTarget`
- `githubRuleTarget`
- `steamRuleTarget`
- `steamCnRuleTarget`
- `devRuleAnchor`
- `devRulePosition`
- `githubRuleAnchor`
- `githubRulePosition`
- `steamRuleAnchor`
- `steamRulePosition`
- `steamCnRuleAnchor`
- `steamCnRulePosition`
- `customRuleAnchor`
- `customRulePosition`
- `groupOrderPreset`
- `groupOrder`
- `regionGroups`
- `ruleSourcePreset`
- `steamFix`
- `steamFixUrl`
- `devHidden`
- `githubHidden`
- `steamHidden`
- `devDisableUdp`
- `githubDisableUdp`
- `steamDisableUdp`
- `devIcon`
- `githubIcon`
- `steamIcon`
- `groupInterfaceName`
- `groupRoutingMark`
- `devInterfaceName`
- `githubInterfaceName`
- `steamInterfaceName`
- `devRoutingMark`
- `githubRoutingMark`
- `steamRoutingMark`
- `groupStrategy`
- `devGroupStrategy`
- `githubGroupStrategy`
- `steamGroupStrategy`
- `githubUseProviders`
- `steamUseProviders`
- `devUseProviders`
- `githubIncludeAll`
- `steamIncludeAll`
- `devIncludeAll`
- `githubIncludeAllProxies`
- `steamIncludeAllProxies`
- `devIncludeAllProxies`
- `githubIncludeAllProviders`
- `steamIncludeAllProviders`
- `devIncludeAllProviders`
- `devMode`
- `githubMode`
- `steamMode`
- `devType`
- `githubType`
- `steamType`
- `devTestUrl`
- `githubTestUrl`
- `githubGroupInterval`
- `devGroupInterval`
- `steamTestUrl`
- `steamGroupInterval`
- `devGroupTolerance`
- `githubGroupTolerance`
- `githubGroupTimeout`
- `devGroupTimeout`
- `githubGroupLazy`
- `devGroupLazy`
- `githubGroupMaxFailedTimes`
- `devGroupMaxFailedTimes`
- `devGroupExpectedStatus`
- `githubGroupExpectedStatus`
- `githubNodeFilter`
- `githubNodeExcludeFilter`
- `githubNodeExcludeType`
- `devNodeFilter`
- `devNodeExcludeFilter`
- `devNodeExcludeType`
- `steamGroupTolerance`
- `steamGroupTimeout`
- `steamGroupLazy`
- `steamGroupMaxFailedTimes`
- `steamGroupExpectedStatus`
- `steamNodeFilter`
- `steamNodeExcludeFilter`
- `steamNodeExcludeType`

### 内核 / GEO / Profile 参数

- `profileCache`
- `profileSelected`
- `profileFakeIP`
- `unifiedDelay`
- `tcpConcurrent`
- `processMode`
- `geodataLoader`
- `geodataMode`
- `geoAutoUpdate`
- `geoUpdateInterval`
- `globalUA`

### 调试 / 响应头参数

- `responseHeaders`
- `responseHeaderPrefix`

### 测速组参数

- `testUrl`
- `groupInterval`
- `groupTolerance`
- `groupTimeout`
- `groupMaxFailedTimes`
- `groupExpectedStatus`
- `groupLazy`

### DNS 参数

- `dnsPreferH3`
- `dnsRespectRules`
- `dnsCacheAlgorithm`
- `dnsUseSystemHosts`
- `dnsListen`
- `fakeIpFilterMode`
- `fakeIpTTL`
- `fakeIpRange`
- `fakeIpRange6`

### Sniffer 参数

- `snifferForceDnsMapping`
- `snifferParsePureIp`
- `snifferOverrideDestination`
- `snifferHttpOverrideDestination`
- `snifferForceDomains`
- `snifferSkipDomains`

---

## DNS / Sniffer 重点增强

### AI DNS policy

以下 geosite 已显式走国际 DNS：

- `openai`
- `anthropic`
- `google-gemini`

作用位置：

- `nameserver-policy`
- `proxy-server-nameserver-policy`

### Sniffer 默认增强

默认 `force-domain`：

- `+.openai.com`
- `+.anthropic.com`

默认 `skip-domain`：

- `Mijia Cloud`
- `+.push.apple.com`

支持参数继续追加：

- `snifferForceDomains`
- `snifferSkipDomains`

---

## 新增诊断说明

### 规则源语义告警

如果当前配置里的 `rule-providers` 出现：

- `type / behavior / format` 不在 Mihomo 官方范围内
- `http/file/inline` 和 `url/path/payload` 搭配不合理
- `payload` 写在非 `inline` 类型上
- `classical + mrs` 组合不符合 Mihomo 官方限制
- `header` 不是对象，或者 Header 名 / Header 值不合法
- `path` 看起来可能超出 HomeDir

脚本会显式输出 `规则源语义告警`，帮助你尽早发现“配置能生成，但内核未必按预期读取”的问题。

如果你额外传了 `ruleProviderPayload`，但当前配置没有 `inline rule-providers`、或者传入内容不是合法的规则字符串数组 / 多行规则列表，脚本也会显式提醒这一轮规则源参数没有按预期生效。

### 代理集合参数告警

如果你传了 `proxyProvider*` 参数，但当前配置没有 `proxy-providers`、现有 provider 不是 `http` 类型、`proxyProviderPathDir` 生成出的 `path` 发生冲突或未落在目标目录下、`proxyProviderHeader` 条目语法非法或 Header 名/值不合法、`proxyProviderPayload` 不是合法 JSON 节点对象/数组、provider 本身的 `type / url / path / payload` 搭配不符合 Mihomo 官方语义、`filter / exclude-filter` 正则本身非法，或者 `override` 的布尔 / 网络字段不合法，脚本都会显式提醒这一轮代理集合参数没有按预期生效。

### 优先链未命中告警

如果写了：

```ini
aiPreferCountries=法国,火星
```

但当前没有生成对应国家组，脚本会明确告警。

### 目标平台兼容性提醒

如果检测到当前 target 看起来不是 Clash / Mihomo 体系，脚本会提醒本脚本更适合 Clash / Mihomo / OpenClash 输出。

### 路由 target / query target 冲突提醒

如果：

- 请求 params / URL / path 里带了路由 target
- query 里也带了 `target`
- 两者不一致

脚本会输出提示，并说明当前以路由 target 为准。

### 响应头调试提醒

如果你开启了：

```ini
responseHeaders=true
```

但当前运行环境里的 `$options` 不是对象，脚本会明确提醒当前无法写入 `_res.headers`。

### 下载链路参数提醒

如果当前链接同时带了：

- `url`
- `content`

但没有显式带：

- `mergeSources`

脚本会提醒你当前链路存在潜在歧义。

---

## `full=true` 时额外输出

除了原有统计，现在还会输出：

- 平台提醒数量
- 优先链告警数量
- 规则顺序告警数量
- 规则源参数摘要
- 规则源语义摘要
- 规则源语义告警数量
- 国家优先链摘要
- 规则顺序编排摘要
- 独立组展示摘要
- 独立组 UDP 摘要
- 独立组网络摘要
- 负载均衡策略摘要
- 代理集合参数摘要
- 代理集合语义摘要
- 代理集合 Override 摘要
- 代理集合告警数量
- 独立组 Provider 池摘要
- Provider 健康检查提醒
- Sniffer 域名摘要
- 运行环境摘要：
  - `target`
  - `route-kind`
  - `route-name`
  - `route-target`
  - `query-target`
  - `request-url`
  - `request-path`
  - `route-path`
  - `request-params-target`
  - `user-agent`
  - `query-args`
- 响应头调试摘要：
  - `enabled`
  - `prefix`
  - `applied`
- 下载链路摘要：
  - `merge-sources`
  - `no-cache`
  - `include-unsupported`
  - `url/content/ua/proxy`

---

## 推荐参数组合

### 1. 默认稳妥

```ini
ipv6=true&fakeip=true&full
```

### 2. AI 优先链

```ini
aiPreferCountries=新加坡,日本,美国,香港
```

### 3. Crypto 优先链

```ini
cryptoPreferCountries=日本,新加坡,香港
```

### 4. 追加 Sniffer force-domain

```ini
snifferForceDomains=+.openai.com,+.anthropic.com
```

### 5. 直接在下载链接里传脚本参数

```text
...?target=ClashMeta&full&groupInterval=300&snifferForceDomains=+.openai.com,+.anthropic.com
```

### 6. 多一级路由 target 示例

```text
/download/订阅名/ClashMeta?full&groupInterval=300
```

### 7. 开启下载响应调试头

```ini
responseHeaders=true&responseHeaderPrefix=X-Debug-
```

### 8. GitHub / Steam 精筛原始节点池

```ini
githubNodeFilter=IEPL|IPLC|家宽&githubNodeExcludeType=Http,Socks5&steamNodeFilter=游戏|Game|Steam&steamNodeExcludeFilter=中转|落地
```

### 9. GitHub / Steam 独立组前置组编排

```ini
githubPreferGroups=manual,lowcost,direct&steamPreferGroups=select,my-game-group
```

### 9A. 区域分组面板

```ini
regionGroups=asia,europe,americas&groupOrder=select,github,steam,regions,countries,other,extras
```

### 10. GitHub / Steam 独立组点名节点

```ini
githubPreferNodes=家宽A,GitHub专线01&steamPreferNodes=Steam专线A;家宽B
```

### 11. GitHub / Steam / SteamCN 规则入口改写

```ini
githubRuleTarget=manual&steamRuleTarget=🚂 Steam&steamCnRuleTarget=DIRECT
```

### 12. GitHub / Steam / SteamCN 规则入口顺序编排

```ini
githubRuleAnchor=Geo_Not_CN&githubRulePosition=before&steamRuleAnchor=DirectList&steamRulePosition=before&steamCnRuleAnchor=match
```

### 13. GitHub / Steam 独立组显示与 UDP 控制

```ini
githubHidden=true&githubDisableUdp=true&steamHidden=false&steamDisableUdp=false
```

### 14. load-balance 策略

```ini
loadbalance=true&groupStrategy=consistent-hashing&githubType=load-balance&githubGroupStrategy=sticky-sessions&steamType=load-balance&steamGroupStrategy=round-robin
```

### 14A. 开发服务组编排与规则优先级

```ini
devMode=direct&devType=fallback&devPreferGroups=manual,lowcost&devPreferNodes=GitHub专线01&devRuleTarget=manual&devRuleAnchor=Steam&devRulePosition=before
```

### 14B. 开发服务组专属测速与展示高级项

```ini
devType=load-balance&devTestUrl=https://github.com&devGroupInterval=300&devGroupTolerance=50&devGroupTimeout=3000&devGroupLazy=false&devGroupMaxFailedTimes=2&devGroupExpectedStatus=200-299&devGroupStrategy=sticky-sessions&devHidden=false&devDisableUdp=true&devIcon=https://example.com/dev.png
```

### 14C. 开发服务组节点池与 Provider 池

```ini
devUseProviders=airport-a,airport-b&devNodeFilter=IEPL|家宽|GitHub&devNodeExcludeType=Http,Socks5&devIncludeAllProxies=true
```

### 14D. 开发服务组 include-all 全量池

```ini
devIncludeAll=true&devNodeFilter=IEPL|IPLC|家宽&devNodeExcludeFilter=中转|落地&devRuleAnchor=GitHub&devRulePosition=after
```

### 14E. 开发服务组国家优先链

```ini
devPreferCountries=新加坡,日本,美国&devMode=proxy&devType=fallback&devUseProviders=airport-dev
```

### 14F. AIExtra 补充规则源

```ini
aiExtraListUrl=https://raw.githubusercontent.com/example/repo/main/AIExtra.list
```

### 15. GitHub / Steam 独立组 proxy-providers 池

```ini
githubUseProviders=airport-a,airport-b&steamIncludeAllProviders=true&steamNodeFilter=Game|Steam
```

### 16. GitHub / Steam 独立组 include-all 全量池

```ini
githubIncludeAll=true&githubNodeFilter=IEPL|IPLC|GitHub&steamIncludeAll=true&steamNodeExcludeFilter=中转|落地
```

### 17. expected-status 官方语法

```ini
groupExpectedStatus=200/204/301-302&githubGroupExpectedStatus=200-299&steamGroupExpectedStatus=*
```

### 18. proxy-group 网络字段

```ini
groupInterfaceName=eth0&groupRoutingMark=6666&githubInterfaceName=tailscale0&steamRoutingMark=7777
```

### 19. GitHub / Steam 独立组 include-all-proxies

```ini
githubIncludeAllProxies=true&steamIncludeAllProxies=true&steamNodeExcludeFilter=中转|落地
```

### 20. 统一接管现有 proxy-providers

```ini
proxyProviderInterval=3600&proxyProviderProxy=🚀 节点选择&proxyProviderUserAgent=Clash.Meta&proxyProviderHealthCheckEnable=true&proxyProviderHealthCheckUrl=https://cp.cloudflare.com/generate_204&proxyProviderHealthCheckInterval=300&proxyProviderHealthCheckTimeout=5000&proxyProviderHealthCheckLazy=true&proxyProviderHealthCheckExpectedStatus=204
```

### 21. 统一裁剪现有 proxy-providers 节点池

```ini
proxyProviderFilter=IEPL|IPLC|家宽&proxyProviderExcludeFilter=0\\.5x|实验|公益&proxyProviderExcludeType=Http,Socks5
```

### 22. 统一改写现有 proxy-providers override

```ini
proxyProviderOverrideAdditionalPrefix=[A场]&proxyProviderOverrideAdditionalSuffix=[游戏池]&proxyProviderOverrideUdp=true&proxyProviderOverrideUdpOverTcp=false&proxyProviderOverrideDown=50 Mbps&proxyProviderOverrideUp=10 Mbps&proxyProviderOverrideTfo=true&proxyProviderOverrideMptcp=false&proxyProviderOverrideSkipCertVerify=false&proxyProviderOverrideDialerProxy=🚀 节点选择&proxyProviderOverrideInterfaceName=eth0&proxyProviderOverrideRoutingMark=6666&proxyProviderOverrideIpVersion=ipv4-prefer
```

### 23. 统一改写现有 proxy-providers 节点名

```ini
proxyProviderOverrideProxyName=^(?:IEPL|IPLC)\\s*(.*)$=>专线 $1||香港\\s*(.*)=>HK $1
```

### 24. 统一切换现有 proxy-providers 缓存目录

```ini
proxyProviderPathDir=./providers/proxy&proxyProviderInterval=3600&proxyProviderHealthCheckEnable=true
```

### 25. 统一下发现有 proxy-providers 自定义请求头

```ini
proxyProviderHeader=X-Device-Id: abc123||X-Env: prod&proxyProviderUserAgent=Clash.Meta
```

### 26. 统一下发现有 proxy-providers payload

```ini
proxyProviderPayload=[{"name":"备用节点1","type":"ss","server":"1.2.3.4","port":443,"cipher":"aes-128-gcm","password":"demo"}]
```

### 26.1 统一下发现有 inline rule-providers payload

```ini
ruleProviderPayload=DOMAIN-SUFFIX,internal.example,DIRECT||DOMAIN,router.local,DIRECT
```

---

## 当前 README 与代码同步结论

当前 README 已同步：

- V8.63.0 业务规则窗口摘要已补齐
- V8.63.0 `Service-Rule-Window-Summary / Service-Rule-Window-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.62.0 规则层级目标映射摘要已补齐
- V8.62.0 `Rule-Layer-Target-Summary / Rule-Layer-Target-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.61.0 关键命中窗口摘要已补齐
- V8.61.0 `Key-Rule-Window-Summary / Key-Rule-Window-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.60.0 自定义规则区间摘要已补齐
- V8.60.0 `Custom-Rule-Summary / Custom-Rule-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.59.0 规则层级总览摘要已补齐
- V8.59.0 `Rule-Layer-Summary / Rule-Layer-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.58.0 业务链路总览摘要已补齐
- V8.58.0 `Service-Routing-Summary / Service-Routing-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.57.0 分流链路总览摘要已补齐
- V8.57.0 `Routing-Chain-Summary / Routing-Chain-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.56.0 策略组候选链风险摘要已补齐
- V8.56.0 `Proxy-Group-Priority-Risk-Summary / Proxy-Group-Priority-Risk-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.55.0 规则优先级风险摘要已补齐
- V8.55.0 `Rule-Priority-Risk-Summary / Rule-Priority-Risk-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.54.0 规则入口映射与目标分布摘要已补齐
- V8.54.0 `Rule-Target-Summary / Rule-Target-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.53.0 策略组顺序与流量优先级摘要已补齐
- V8.53.0 `Proxy-Group-Order / Proxy-Group-Priority / Traffic-Priority-Summary` 响应调试头与 full 日志摘要已同步补齐
- V8.52.0 未消费参数追踪摘要已补齐
- V8.52.0 `Unused-Arg-Summary / Unused-Arg-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.7.0 `_res.headers` 下载响应调试增强
- V8.7.0 `responseHeaders / responseHeaderPrefix` 新参数
- V8.51.0 参数生效来源追踪摘要已补齐
- V8.51.0 `Arg-Effective-Summary / Arg-Effective-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.50.0 参数来源追踪摘要已补齐
- V8.50.0 `Arg-Source-Summary / Route-Target-Source / Route-Info-Source` 响应调试头与 full 日志摘要已同步补齐
- V8.49.0 官方链接参数语义校验已补齐
- V8.49.0 `Link-Url-Kind / Link-Semantic-Summary / Link-Semantic-Check` 响应调试头与 full 日志摘要已同步补齐
- V8.48.0 provider 参数改动样本预览已补齐
- V8.48.0 `Rule-Provider-Mutation-Preview / Proxy-Provider-Mutation-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.47.0 provider 参数命中样本预览已补齐
- V8.47.0 `Rule-Provider-Apply-Preview / Proxy-Provider-Apply-Preview` 响应调试头与 full 日志摘要已同步补齐
- V8.46.0 provider 参数无变化统计已补齐
- V8.46.0 `Mutation-Stats` 已补上 `*-noop` 计数
- V8.45.0 provider 参数改动统计已补齐
- V8.45.0 `Rule-Provider-Mutation-Stats / Proxy-Provider-Mutation-Stats` 响应调试头与 full 日志摘要已同步补齐
- V8.44.0 provider 参数命中统计已补齐
- V8.44.0 `Rule-Provider-Apply-Stats / Proxy-Provider-Apply-Stats` 响应调试头与 full 日志摘要已同步补齐
- V8.43.0 rule-provider 参数作用范围摘要已统一 helper 化
- V8.43.0 `Rule-Provider-Apply-Scope-Detail` 响应调试头与 full 日志摘要已同步补齐
- V8.42.0 proxy-provider 参数作用范围摘要已补齐
- V8.42.0 `Proxy-Provider-Apply-Scope` 响应调试头与 full 日志摘要已同步补齐
- V8.41.0 `ruleProviderPayload` 参数化现有 `inline rule-providers` payload
- V8.41.0 inline-only 作用范围、full 日志摘要与响应调试头已同步补齐
- V8.40.0 现有 + 内置 `http rule-providers` 统一吃到 `path / interval / proxy / size-limit / header` 参数
- V8.40.0 rule-provider 作用范围摘要、full 日志与响应调试头已同步补齐
- V8.39.0 rule-provider `payload` 作用域与 `mrs` 兼容性官方语义告警已补齐
- V8.39.0 规则源语义诊断链、full 日志摘要与响应调试头已同步补齐
- V8.38.0 `ruleProviderHeader` 参数化脚本内置 `rule-providers` 通用自定义请求头
- V8.38.0 rule-provider header 语法校验、full 日志摘要与响应调试头已同步补齐
- V8.37.0 Mihomo 官方 `rule-provider type / behavior / format / path / payload` 语义自检已补齐
- V8.37.0 rule-provider HomeDir / SAFE_PATHS 路径提醒、full 日志摘要与响应调试头已同步补齐
- V8.36.0 Mihomo 官方 `type / url / path / payload` 语义自检已补齐
- V8.36.0 HomeDir / SAFE_PATHS 路径提醒、full 日志摘要与响应调试头已同步补齐
- V8.35.0 `proxyProviderPayload` 参数化现有 `proxy-providers` payload
- V8.35.0 payload 节点校验、full 日志摘要与响应调试头已同步补齐
- V8.34.0 `proxyProviderHeader` 参数化现有 `proxy-providers` 通用自定义请求头
- V8.34.0 header 语法校验、full 日志摘要与响应调试头已同步补齐
- V8.33.0 `proxyProviderPathDir` 参数化现有 `proxy-providers` 本地缓存目录
- V8.33.0 proxy-provider path 冲突自检、full 日志摘要与响应调试头已同步补齐
- V8.32.0 `proxyProviderOverrideProxyName` 参数化现有 `proxy-providers` override.proxy-name
- V8.32.0 proxy-name 正则校验、full 日志摘要与响应调试头已同步补齐
- V8.31.0 `proxyProviderOverrideAdditionalPrefix / proxyProviderOverrideAdditionalSuffix` 参数化现有 `proxy-providers` override 前后缀
- V8.31.0 `proxyProviderOverrideUdp / proxyProviderOverrideUdpOverTcp / proxyProviderOverrideDown / proxyProviderOverrideUp / proxyProviderOverrideTfo / proxyProviderOverrideMptcp / proxyProviderOverrideSkipCertVerify / proxyProviderOverrideDialerProxy / proxyProviderOverrideInterfaceName / proxyProviderOverrideRoutingMark / proxyProviderOverrideIpVersion` 参数化现有 `proxy-providers` override
- V8.31.0 代理集合 override 自检、full 日志摘要与响应调试头已同步补齐
- V8.30.0 `proxyProviderFilter / proxyProviderExcludeFilter / proxyProviderExcludeType` 参数化现有 `proxy-providers` 节点池筛选
- V8.30.0 代理集合节点池正则校验、full 日志摘要与响应调试头已同步补齐
- V8.29.0 `proxyProviderInterval / proxyProviderProxy / proxyProviderSizeLimit / proxyProviderUserAgent / proxyProviderAuthorization` 参数化现有 `proxy-providers` 下载控制
- V8.29.0 `proxyProviderHealthCheckEnable / proxyProviderHealthCheckUrl / proxyProviderHealthCheckInterval / proxyProviderHealthCheckTimeout / proxyProviderHealthCheckLazy / proxyProviderHealthCheckExpectedStatus` 参数化现有 `proxy-providers` health-check
- V8.29.0 代理集合自检、full 日志摘要与响应调试头已同步补齐
- V8.28.0 `githubIncludeAllProxies / steamIncludeAllProxies` 参数化 GitHub / Steam 独立组 `include-all-proxies`
- V8.28.0 `include-all-proxies` 现在可在无 `NodeFilter` 条件时显式开启原始节点自动池
- V8.28.0 `include-all` 与 `include-all-proxies` 的优先级冲突提醒、full 日志摘要与响应调试头已同步补齐
- V8.27.0 `groupInterfaceName / groupRoutingMark / githubInterfaceName / steamInterfaceName / githubRoutingMark / steamRoutingMark` 参数化 proxy-group `interface-name / routing-mark`
- V8.27.0 GitHub / Steam 专属网络字段优先级高于全局 group 网络字段
- V8.27.0 `interface-name / routing-mark` 已补充 Mihomo 官方 deprecated 提醒、full 日志摘要与响应调试头摘要
- V8.26.0 `groupExpectedStatus / githubGroupExpectedStatus / steamGroupExpectedStatus` 按 Mihomo 官方 expected-status 语法校验
- V8.26.0 expected-status 非法时自动回退默认值并输出显式告警
- V8.26.0 兼容 `$options` JSON 数字形式的 expected-status 输入
- V8.25.0 `githubIncludeAll / steamIncludeAll` 参数化 GitHub / Steam 独立组 `include-all`
- V8.25.0 `include-all` 优先级高于 `UseProviders / include-all-providers`
- V8.25.0 provider 池型 latency/load-balance 组会追加官方健康检查提醒
- V8.83.0 国家识别已继续扩充到 `瑞士 / 瑞典 / 挪威 / 芬兰 / 丹麦 / 葡萄牙 / 爱尔兰 / 比利时 / 奥地利 / 波兰 / 南非 / 以色列 / 新西兰`
- V8.83.0 对 `IT / IN / MY / CH / NO / PT / IE / IL` 这类更容易误判的两位缩写做了保守收紧
- V8.82.0 国家识别已继续扩充到 `澳门 / 荷兰 / 意大利 / 西班牙 / 印度 / 大马 / 泰国 / 越南 / 菲律宾 / 印尼 / 阿联酋 / 沙特 / 墨西哥`
- V8.82.0 国家别名已继续补齐英文名、缩写与常见城市名，便于机场节点命名直接归组
- V8.81.0 GitHub 检索确认 `blackmatrix7/ios_rule_script` 提供稳定 `OneDrive.yaml`，`ruleSourcePreset=blackmatrix7` 已可接管 `OneDrive`
- V8.81.0 `业务链路总览` 与规则锚点别名已同步纳入 `OneDrive / SharePoint / SkyDrive`
- V8.80.0 新增 `Dropbox` 社区规则，并默认接入 `🧑‍💻 开发服务`
- V8.80.0 `Dropbox` 已同步纳入业务规则窗口、业务链路总览、分流链路总览与规则锚点别名
- V8.79.0 新增 `Notion / Figma / Slack` 社区规则，并默认接入 `🧑‍💻 开发服务`
- V8.79.0 `Notion / Figma / Slack` 已同步纳入业务规则窗口、业务链路总览、分流链路总览与规则锚点别名
- V8.78.0 新增 `Atlassian` 社区规则，并默认接入 `🧑‍💻 开发服务`
- V8.78.0 `Atlassian` 已同步纳入业务规则窗口、业务链路总览、分流链路总览与规则锚点别名
- V8.77.0 新增 `DigitalOcean / Anaconda` 社区规则，并默认接入 `🧑‍💻 开发服务`
- V8.77.0 `DigitalOcean / Anaconda` 已同步纳入业务规则窗口、业务链路总览、分流链路总览与规则锚点别名
- V8.76.0 新增 `Heroku / GitBook / SourceForge` 社区规则，并默认接入 `🧑‍💻 开发服务`
- V8.76.0 `Heroku / GitBook / SourceForge` 已同步纳入业务规则窗口、业务链路总览、分流链路总览与规则锚点别名
- V8.75.0 新增 `Vercel / Python / Jfrog` 社区规则，并默认接入 `🧑‍💻 开发服务`
- V8.75.0 `Vercel / Python / Jfrog` 已同步纳入业务规则窗口、业务链路总览、分流链路总览与规则锚点别名
- V8.74.0 新增 `Grok / AppleAI` 社区规则，并默认接入 `🤖 AI`
- V8.74.0 `AIExtra / Grok / AppleAI` 已同步纳入业务规则窗口、业务链路总览与 AI 风险提醒
- V8.74.0 响应调试头与 `规则源参数` full 日志已同步补齐 `Grok-Rule-Url / Apple-AI-Rule-Url`
- V8.73.0 新增 `AIExtra.list` 与 `aiExtraListUrl`，用于承接 GitHub 社区常见的 AI 补充域名
- V8.73.0 `AIExtra` 已默认接入 `🤖 AI`，并补齐 `perplexity / cursor / huggingface` 等规则锚点别名
- V8.73.0 `规则源参数` full 日志与响应调试头已同步补齐 `AI-Extra-List-Url`
- V8.71.0 新增 `Copilot` 社区规则，并默认接入 `🤖 AI`
- V8.71.0 `Copilot` 已同步纳入业务规则窗口、业务链路总览与规则锚点别名
- V8.71.0 `ruleSourcePreset=blackmatrix7` 的接管说明已同步扩展到 `Copilot`
- V8.70.0 `devPreferCountries` 参数化开发服务组国家优先链
- V8.70.0 开发服务组候选顺序升级为“点名节点 > 前置组 > 国家优先链 > devMode 基础链”
- V8.70.0 开发服务组国家优先链诊断、full 日志与响应调试头已同步补齐
- V8.69.0 `devUseProviders / devIncludeAll / devIncludeAllProviders` 参数化开发服务组 proxy-providers 池
- V8.69.0 `devNodeFilter / devNodeExcludeFilter / devNodeExcludeType / devIncludeAllProxies` 参数化开发服务组原始节点池
- V8.69.0 开发服务组现已支持“显式候选链 + 原始节点池 + proxy-providers 池”混合模式
- V8.69.0 开发服务组节点池 / Provider 池参数已同步写入 full 日志与响应调试头
- V8.68.0 `devTestUrl / devGroupInterval / devGroupTolerance / devGroupTimeout / devGroupLazy / devGroupMaxFailedTimes / devGroupExpectedStatus / devGroupStrategy` 参数化开发服务组专属测速与健康检查
- V8.68.0 `devHidden / devDisableUdp / devIcon / devInterfaceName / devRoutingMark` 参数化开发服务组展示层与网络高级项
- V8.68.0 开发服务组高级项已同步写入 full 日志与响应调试头
- V8.67.0 `devMode / devType / devPreferGroups / devPreferNodes` 参数化开发服务组候选链与组类型
- V8.67.0 `devRuleTarget / devRuleAnchor / devRulePosition` 统一改写开发规则入口目标与规则块顺序
- V8.67.0 开发规则块会整体移动并保持开发规则块的内部相对顺序
- V8.66.0 新增 `🧑‍💻 开发服务` 组，并接入核心开发生态分流
- V8.66.0 开发生态流量默认优先沿用 GitHub 独立组，再回落到主选择链
- V8.66.0 开发生态规则已同步纳入业务规则窗口、业务链路总览与分流链路总览
- V8.65.0 `ruleSourcePreset / steamFix / steamFixUrl` 参数化 GitHub 社区规则源预设与 SteamFix 补丁规则
- V8.65.0 `ruleSourcePreset=blackmatrix7` 当前可接管 GitHub / Steam / SteamCN / OpenAI / Anthropic / Gemini / Copilot 内置规则源
- V8.65.0 `SteamFix` 命中结果已同步补进关键命中窗口与分流链路总览
- V8.64.0 `groupOrderPreset / groupOrder / customRuleAnchor / customRulePosition` 参数化策略组布局与 `config.rules` 锚点插入
- V8.64.0 `groupOrder` 支持单组别名与 `core / services / media / countries / extras` 这类分组桶
- V8.64.0 顺序参数命中结果已同步补进 full 日志与响应调试头
- V8.24.0 `githubUseProviders / steamUseProviders / githubIncludeAllProviders / steamIncludeAllProviders` 参数化 GitHub / Steam 独立组 proxy-providers 池
- V8.24.0 GitHub / Steam 独立组支持同时引用显式候选链、原始节点池与 proxy-providers 池
- V8.24.0 `include-all-providers` 优先级高于 `UseProviders`，冲突时会显式提醒
- V8.23.0 `groupStrategy / githubGroupStrategy / steamGroupStrategy` 参数化 load-balance strategy
- V8.23.0 strategy 支持 `round-robin / consistent-hashing / sticky-sessions`
- V8.23.0 GitHub / Steam 专属 strategy 仅在对应独立组类型为 `load-balance` 时生效
- V8.22.0 `githubHidden / steamHidden / githubDisableUdp / steamDisableUdp / githubIcon / steamIcon` 参数化 GitHub / Steam 独立组 hidden / disable-udp / icon
- V8.22.0 GitHub / Steam 独立组展示层与传输层高级项已同步写入 full 日志与响应调试头
- V8.22.0 `icon` 为空时会显式忽略并输出提醒
- V8.21.0 `githubRuleAnchor / githubRulePosition / steamRuleAnchor / steamRulePosition / steamCnRuleAnchor / steamCnRulePosition` 参数化 GitHub / Steam / SteamCN 规则入口顺序
- V8.21.0 规则顺序锚点支持 provider 名、常用别名与 `top/start/end/match` 这类特殊位置
- V8.21.0 规则顺序锚点未命中或引用自身时，会显式告警并保持默认顺序
- V8.20.0 `githubRuleTarget / steamRuleTarget / steamCnRuleTarget` 参数化 GitHub / Steam / SteamCN 规则入口目标
- V8.20.0 规则入口目标可指向脚本组、用户自定义组、内置策略
- V8.20.0 规则入口目标未命中时自动回退默认值并输出显式告警
- V8.20.0 独立组内部顺序控制与规则入口控制拆成两层
- V8.19.0 `githubPreferNodes / steamPreferNodes` 参数化 GitHub / Steam 独立组点名节点优先
- V8.19.0 独立组候选顺序升级为“点名节点 > 前置组 > 国家优先链 > mode 基础链”
- V8.19.0 点名节点支持精确匹配、忽略大小写精确匹配、唯一模糊匹配
- V8.19.0 点名节点歧义/未命中会进入显式告警
- V8.19.0 `PreferNodes` 不把 `|` 当分隔符，避免把节点名误拆开
- V8.18.0 `githubPreferGroups / steamPreferGroups` 参数化 GitHub / Steam 独立组额外前置组
- V8.18.0 GitHub / Steam 独立组可直接引用已生成策略组、内置策略与用户自定义组
- V8.18.0 `PreferGroups` 与 `PreferCountries / Mode / Type` 可叠加使用
- V8.18.0 `direct` 模式下即使设置额外前置组，`DIRECT` 仍固定在最前
- V8.17.0 `githubNodeFilter / githubNodeExcludeFilter / githubNodeExcludeType / steamNodeFilter / steamNodeExcludeFilter / steamNodeExcludeType` 参数化 GitHub / Steam 独立组原始节点池
- V8.17.0 GitHub / Steam 独立组支持“显式候选链 + include-all-proxies 自动收集原始节点”混合模式
- V8.17.0 自动分组统计已纳入 `exclude-type`，空组/正则告警更接近真实行为
- V8.16.0 GitHub / Steam 独立组专属健康检查参数化
- V8.16.0 GitHub / Steam 专属健康检查优先于全局健康检查参数
- V8.15.0 `githubTestUrl / githubGroupInterval / steamTestUrl / steamGroupInterval` 参数化 GitHub 与 Steam 独立组专属测速
- V8.15.0 GitHub / Steam 专属测速优先于全局测速参数
- V8.14.0 `githubType / steamType` 参数化 GitHub 与 Steam 独立组类型
- V8.14.0 GitHub / Steam 可切换 `select / url-test / fallback / load-balance`
- V8.13.0 `githubMode / steamMode` 参数化 GitHub 与 Steam 独立组模式
- V8.13.0 GitHub / Steam 可切换 `select / direct / proxy` 候选顺序
- V8.12.0 `githubPreferCountries / steamPreferCountries` 参数化 GitHub 与 Steam 独立组优先链
- V8.12.0 GitHub / Steam 默认顺序保持不变，仅在显式传参时插入优先国家组
- V8.11.0 `ruleProviderAuthorization` 参数化 provider 认证头
- V8.11.0 provider 认证头仅以 `configured` 形式出现在日志与响应调试头
- V8.10.0 `ruleProviderProxy / ruleProviderSizeLimit / ruleProviderUserAgent` 参数化 provider 下载控制
- V8.10.0 provider 下载控制写入 full 日志与响应调试头
- V8.9.0 `ruleProviderPathDir / ruleProviderInterval` 参数化 provider 缓存目录与刷新间隔
- V8.9.0 provider 缓存目录与刷新间隔写入 full 日志与响应调试头
- V8.8.0 `route-kind / route-name / route-path` 链接诊断增强
- V8.8.0 官方保留下载参数摘要与 `url + content` 歧义提醒
- V8.6.0 `_req.query / _req.url / _req.path / _req.params` 兼容增强
- V8.6.0 `request-params-target` 运行时日志补充
- V8.5.0 `_req.query / _req.url / _req.path` 三路参数恢复
- V8.5.0 裸旗标参数自动视作 `true`
- V8.5.0 `request-path` 运行时日志补充
- V8.3.0 直接读取请求 query 脚本参数
- 多一级路由 target 识别
- 路由 target / query target 冲突提醒
- V8.2.0 全局 `$options + $arguments` 合并
- 官方 `target / targetPlatform` 读取
- 目标平台兼容性提醒
- V8.1.0 `#a=1&b=2` 参数兼容
- 优先链未命中显式告警
- 官方 `$options` querystring / JSON 兼容
- GitHub / Steam 独立策略组
- `ChatGPT.list` 接入 AI 链路
- `AIExtra.list` 承接社区 AI 补充域名
- `OpenAI / Anthropic / Gemini` 官方规则
- `Copilot / Grok / AppleAI` 社区规则接入 AI 链路
- `Vercel / Python / Jfrog / Heroku / GitBook / SourceForge / DigitalOcean / Anaconda / Atlassian / Notion / Figma / Slack / Dropbox` 社区规则接入开发链路
- `OneDrive` 在 `ruleSourcePreset=blackmatrix7` 下可切换到社区 YAML 规则，并纳入业务链路观测
- AI / Crypto 多国家优先链
- AI DNS policy 增强
- Sniffer 域名追加参数
- 规则源 URL 参数化
- DNS / Sniffer / 测速组高级参数化
- rule-provider URL 轻量校验
- 节点自动规范化与重命名

---

## 官方参考

本轮在线学习主要参考官方文档：

- Sub-Store Wiki《链接参数说明》  
  https://github.com/sub-store-org/Sub-Store/wiki/%E9%93%BE%E6%8E%A5%E5%8F%82%E6%95%B0%E8%AF%B4%E6%98%8E
- Sub-Store 官方 `demo.js`  
  https://github.com/sub-store-org/Sub-Store/blob/master/scripts/demo.js
- Mihomo Proxy Groups  
  https://wiki.metacubex.one/en/config/proxy-groups/
- Mihomo Route Rules  
  https://wiki.metacubex.one/en/config/rules/
- Mihomo Proxy Providers  
  https://wiki.metacubex.one/en/config/proxy-providers/
- Mihomo Proxies  
  https://wiki.metacubex.one/en/config/proxies/
- Mihomo DNS  
  https://wiki.metacubex.one/en/config/dns/
- Mihomo Sniffer  
  https://wiki.metacubex.one/en/config/sniff/

## 社区参考

本轮继续参考了 GitHub 社区里比较常见的规则项目与覆写思路：

- blackmatrix7 / ios_rule_script  
  https://github.com/blackmatrix7/ios_rule_script
- Accademia / Additional_Rule_For_Clash  
  https://github.com/Accademia/Additional_Rule_For_Clash
- powerfullz / override-rules  
  https://github.com/powerfullz/override-rules
- mihomo-party-org / override-hub  
  https://github.com/mihomo-party-org/override-hub
- DustinWin / ruleset_geodata  
  https://github.com/DustinWin/ruleset_geodata

本轮直接吸收的开发生态规则源还包括：

- blackmatrix7 / ios_rule_script / Vercel  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Vercel/Vercel.yaml
- blackmatrix7 / ios_rule_script / Python  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Python/Python.yaml
- blackmatrix7 / ios_rule_script / Jfrog  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Jfrog/Jfrog.yaml
- blackmatrix7 / ios_rule_script / Heroku  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Heroku/Heroku.yaml
- blackmatrix7 / ios_rule_script / GitBook  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/GitBook/GitBook.yaml
- blackmatrix7 / ios_rule_script / SourceForge  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/SourceForge/SourceForge.yaml
- blackmatrix7 / ios_rule_script / DigitalOcean  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/DigitalOcean/DigitalOcean.yaml
- blackmatrix7 / ios_rule_script / Anaconda  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Anaconda/Anaconda.yaml
- blackmatrix7 / ios_rule_script / Atlassian  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Atlassian/Atlassian.yaml
- blackmatrix7 / ios_rule_script / Notion  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Notion/Notion.yaml
- blackmatrix7 / ios_rule_script / Figma  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Figma/Figma.yaml
- blackmatrix7 / ios_rule_script / Slack  
  https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Slack/Slack.yaml
