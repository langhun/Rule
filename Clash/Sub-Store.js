/**
 * Powerfullz Sub-Store 订阅转换脚本 (注释增强版)
 * * [脚本功能]
 * 1. 自动节点分组：根据节点名称自动识别国家（香港、日本、美国等）并分组。
 * 2. 智能 DNS 策略：配置 Nameserver Policy，国内域名走国内 DNS，国外走 1.1.1.1，防止 DNS 污染。
 * 3. 深度应用分流：
 * - AI 服务：独立分流 Claude、ChatGPT、Gemini。
 * - 流媒体：独立分流 Disney+、Netflix、Prime Video、巴哈姆特（自动优选台湾）。
 * - 生产力：独立分流 Discord、Figma (Design)。
 * 4. 规则集增强：内置去广告、隐私保护和 TCP Keep-Alive 优化。
 * * [推荐参数 (Arguments)]
 * loadbalance=false  // 是否开启负载均衡 (建议 false 以保持 IP 稳定)
 * landing=true       // 是否识别落地/家宽节点
 * fakeip=true        // 是否开启 Fake-IP 模式 (建议开启，速度更快)
 * keepalive=true     // 是否开启 TCP Keep-Alive (减少断连)
 */

// ============================================================================
// 1. 全局常量与参数解析 (Constants & Arguments)
// ============================================================================

const NODE_SUFFIX = "节点"; // 生成的分组名称后缀，例如 "香港节点"

// 策略组名称常量映射，方便统一修改
const PROXY_GROUPS = {
  SELECT:   "节点选择", // 主手动选择
  MANUAL:   "手动切换", // 二级手动选择
  FALLBACK: "自动切换", // 自动测试延迟最低
  DIRECT:   "全球直连", // 不走代理
  LANDING:  "落地节点", // 家宽/ISP 专用组
  LOW_COST: "低倍率节点", // 0.x 倍率专用组
};

/**
 * 辅助函数：将字符串或数字转换为布尔值
 * 例如：parseBool("true") -> true, parseBool("1") -> true
 */
function parseBool(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return false;
}

/**
 * 辅助函数：解析数字参数，失败则返回默认值
 */
function parseNumber(value, defaultValue = 0) {
  if (value === null || typeof value === 'undefined') return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 核心：解析用户传入的参数 (Arguments)
 * 将 URL 参数转换为内部配置对象
 */
function buildFeatureFlags(args) {
  const spec = {
    loadbalance: "loadBalance",      // 是否启用负载均衡
    landing:     "landing",          // 是否启用落地节点分组
    ipv6:        "ipv6Enabled",      // 是否启用 IPv6
    full:        "fullConfig",       // 是否生成完整配置文件(包含 inbound 等)
    keepalive:   "keepAliveEnabled", // 是否启用 TCP Keep-Alive
    fakeip:      "fakeIPEnabled",    // 是否启用 Fake-IP DNS 模式
    quic:        "quicEnabled"       // 是否允许 QUIC (UDP) 流量
  };

  const flags = Object.entries(spec).reduce((acc, [sourceKey, targetKey]) => {
    acc[targetKey] = parseBool(args[sourceKey]) || false;
    return acc;
  }, {});

  flags.countryThreshold = parseNumber(args.threshold, 0); // 国家分组的最小节点数量阈值
  return flags;
}

// 获取 Sub-Store 传入的参数
const rawArgs = typeof $arguments !== 'undefined' ? $arguments : {};
const {
  loadBalance,
  landing,
  ipv6Enabled,
  fullConfig,
  keepAliveEnabled,
  fakeIPEnabled,
  quicEnabled,
  countryThreshold
} = buildFeatureFlags(rawArgs);


// ============================================================================
// 2. 核心逻辑工具 (Core Logic Helpers)
// ============================================================================

// 数组扁平化并过滤空值
const buildList = (...elements) => elements.flat().filter(Boolean);

// 获取满足数量要求的国家分组名
function getCountryGroupNames(countryInfo, minCount) {
  return countryInfo
    .filter(item => item.count >= minCount)
    .map(item => item.country + NODE_SUFFIX);
}

// 去除分组名称后缀，用于正则匹配
function stripNodeSuffix(groupNames) {
  const suffixPattern = new RegExp(`${NODE_SUFFIX}$`);
  return groupNames.map(name => name.replace(suffixPattern, ""));
}

/**
 * 构建基础候选节点列表
 * 这里定义了大多数策略组（如 OpenAI, YouTube）默认可以选哪些节点
 */
function buildBaseLists({ landing, lowCost, countryGroupNames }) {
  // 1. 通用列表：包含自动切换、落地、国家分组、手动
  const defaultSelector = buildList(
    PROXY_GROUPS.FALLBACK,
    landing && PROXY_GROUPS.LANDING,
    countryGroupNames,
    lowCost && PROXY_GROUPS.LOW_COST,
    PROXY_GROUPS.MANUAL,
    "DIRECT"
  );

  // 2. 默认代理列表：不包含“自动切换”，用于 AI 等需要稳定 IP 的场景
  const defaultProxies = buildList(
    PROXY_GROUPS.SELECT,
    countryGroupNames,
    lowCost && PROXY_GROUPS.LOW_COST,
    PROXY_GROUPS.MANUAL,
    PROXY_GROUPS.DIRECT
  );

  // 3. 媒体专用列表：[优化] 移除了低倍率和直连，确保流媒体不会因为误选导致无法观看
  const mediaProxies = buildList(
    PROXY_GROUPS.SELECT,
    countryGroupNames,
    PROXY_GROUPS.MANUAL
  );

  // 4. 直连优先列表：用于 PT 下载等，优先直连，其次代理
  const defaultProxiesDirect = buildList(
    PROXY_GROUPS.DIRECT,
    countryGroupNames,
    lowCost && PROXY_GROUPS.LOW_COST,
    PROXY_GROUPS.SELECT,
    PROXY_GROUPS.MANUAL
  );

  // 5. 故障转移列表
  const defaultFallback = buildList(
    landing && PROXY_GROUPS.LANDING,
    countryGroupNames,
    lowCost && PROXY_GROUPS.LOW_COST,
    PROXY_GROUPS.MANUAL,
    "DIRECT"
  );

  return { defaultProxies, defaultProxiesDirect, defaultSelector, defaultFallback, mediaProxies };
}


// ============================================================================
// 3. 规则集配置 (Rule Providers)
// 定义外部规则资源的下载地址、更新间隔等
// ============================================================================

const ruleProviders = {
  // --- 基础：局域网与去广告 ---
  "LocalAreaNetwork": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/LocalAreaNetwork.list",
    path: "./ruleset/ACL4SSR/LocalAreaNetwork.list"
  },
  "ADBlock": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: "https://adrules.top/adrules-mihomo.mrs", // 使用高性能 MRS 格式
    path: "./ruleset/ADBlock.mrs"
  },
  "BanAD": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/BanAD.list",
    path: "./ruleset/ACL4SSR/BanAD.list"
  },
  "BanProgramAD": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/BanProgramAD.list",
    path: "./ruleset/ACL4SSR/BanProgramAD.list"
  },
  "AdditionalFilter": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/AdditionalFilter.list",
    path: "./ruleset/powerfullz/AdditionalFilter.list"
  },

  // --- 国内规则 ---
  "ChinaDomain": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list",
    path: "./ruleset/ACL4SSR/ChinaDomain.list"
  },
  "ChinaCompanyIp": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ChinaCompanyIp.list",
    path: "./ruleset/ACL4SSR/ChinaCompanyIp.list"
  },
  "Download": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Download.list",
    path: "./ruleset/ACL4SSR/Download.list"
  },
  "ProxyGFWlist": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ProxyGFWlist.list",
    path: "./ruleset/ACL4SSR/ProxyGFWlist.list"
  },

  // --- AI 服务 (增强版) ---
  "OpenAI": { // ChatGPT
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/openai.yaml",
    path: "./ruleset/MetaCubeX/OpenAI.yaml"
  },
  "Gemini": { // Google Gemini
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/google-gemini.yaml",
    path: "./ruleset/MetaCubeX/Gemini.yaml"
  },
  "Copilot": { // Microsoft Copilot
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Copilot.list",
    path: "./ruleset/ACL4SSR/Copilot.list"
  },
  "AI": { // 其他 AI 聚合
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/AI.list",
    path: "./ruleset/ACL4SSR/AI.list"
  },

  // --- 社交与流媒体 (增强版) ---
  "Telegram": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list",
    path: "./ruleset/ACL4SSR/Telegram.list"
  },
  "TikTok": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/TikTok.list",
    path: "./ruleset/powerfullz/TikTok.list"
  },
  "Emby": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Emby.list",
    path: "./ruleset/ACL4SSR/Emby.list"
  },
  "Disney": { // Disney+
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/DisneyPlus.list",
    path: "./ruleset/ACL4SSR/DisneyPlus.list"
  },
  "PrimeVideo": { // Amazon Prime Video
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/PrimeVideo.list",
    path: "./ruleset/ACL4SSR/PrimeVideo.list"
  },
  "Bahamut": { // 巴哈姆特动画疯 (仅限台湾 IP)
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Bahamut.list",
    path: "./ruleset/ACL4SSR/Bahamut.list"
  },
  "Discord": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Discord.list",
    path: "./ruleset/ACL4SSR/Discord.list"
  },

  // --- 游戏与厂商 ---
  "SteamCN": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/SteamCN.list",
    path: "./ruleset/ACL4SSR/SteamCN.list"
  },
  "SteamFix": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/SteamFix.list",
    path: "./ruleset/powerfullz/SteamFix.list"
  },
  "Epic": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Epic.list",
    path: "./ruleset/ACL4SSR/Epic.list"
  },
  "GoogleFCM": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/GoogleFCM.list",
    path: "./ruleset/ACL4SSR/GoogleFCM.list"
  },
  "GoogleCN": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/GoogleCN.list",
    path: "./ruleset/ACL4SSR/GoogleCN.list"
  },
  "Crypto": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/Crypto.list",
    path: "./ruleset/powerfullz/Crypto.list"
  },
  "Bing": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Bing.list",
    path: "./ruleset/ACL4SSR/Bing.list"
  },
  "OneDrive": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/OneDrive.list",
    path: "./ruleset/ACL4SSR/OneDrive.list"
  },
  "Microsoft": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list",
    path: "./ruleset/ACL4SSR/Microsoft.list"
  },
  "Apple": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list",
    path: "./ruleset/ACL4SSR/Apple.list"
  }
};


// ============================================================================
// 4. 规则匹配逻辑 (Rules Logic)
// 决定流量如何匹配到对应的策略组
// ============================================================================

const baseRules = [
  // 1. 广告拦截 (最高优先级，直接拒绝)
  `RULE-SET,ADBlock,广告拦截`,
  `RULE-SET,AdditionalFilter,广告拦截`,
  `RULE-SET,BanAD,广告拦截`,
  `RULE-SET,BanProgramAD,广告拦截`,

  // 2. AI 服务 (防止被后续国内规则误杀，优先匹配)
  `RULE-SET,OpenAI,AI服务`,
  `RULE-SET,Gemini,AI服务`,
  `RULE-SET,Copilot,AI服务`,
  `GEOSITE,CATEGORY-AI-!CN,AI服务`, // 匹配非国内 AI 域名

  // 3. 金融与加密货币
  `RULE-SET,Crypto,Crypto`,

  // 4. 核心媒体与应用服务 (精确规则匹配)
  `RULE-SET,Emby,Emby`, 
  `RULE-SET,Bahamut,Bahamut`,     // 巴哈姆特
  `RULE-SET,Disney,Disney+`,      // Disney+
  `RULE-SET,PrimeVideo,Prime Video`,
  `RULE-SET,TikTok,TikTok`,
  `RULE-SET,Telegram,Telegram`,
  `RULE-SET,Discord,Discord`,
  
  // 5. 微软与苹果服务
  `RULE-SET,Bing,Bing`,
  `RULE-SET,OneDrive,OneDrive`,
  `RULE-SET,Microsoft,Microsoft`,
  `RULE-SET,Apple,Apple`,
  `RULE-SET,Epic,Games`,

  // 6. GeoSite 通用匹配 (使用 mihomo 内置数据库)
  `GEOSITE,Category-Games,Games`,
  `GEOSITE,Steam,Steam`,
  `GEOSITE,GitHub,GitHub`,
  `GEOSITE,Telegram,Telegram`,
  `GEOSITE,YouTube,YouTube`,
  `GEOSITE,Google,Google`,
  `GEOSITE,Netflix,Netflix`,
  `GEOSITE,Disney,Disney+`,
  `GEOSITE,Spotify,Spotify`,
  `GEOSITE,Bilibili,Bilibili`,
  `GEOSITE,category-pt,PT站点`,

  // 7. GeoIP 规则 (no-resolve 避免 DNS 污染)
  `GEOIP,Netflix,Netflix,no-resolve`,
  `GEOIP,Telegram,Telegram,no-resolve`,

  // 8. 国内直连与局域网 (白名单)
  `RULE-SET,LocalAreaNetwork,${PROXY_GROUPS.DIRECT}`,
  `RULE-SET,SteamCN,${PROXY_GROUPS.DIRECT}`,
  `RULE-SET,SteamFix,${PROXY_GROUPS.DIRECT}`,
  `RULE-SET,GoogleFCM,${PROXY_GROUPS.DIRECT}`,
  `RULE-SET,ChinaDomain,${PROXY_GROUPS.DIRECT}`,
  `RULE-SET,ChinaCompanyIp,${PROXY_GROUPS.DIRECT}`,
  `RULE-SET,Download,${PROXY_GROUPS.DIRECT}`,
  `GEOSITE,GOOGLE-PLAY@CN,${PROXY_GROUPS.DIRECT}`,
  `GEOSITE,CN,${PROXY_GROUPS.DIRECT}`,
  `GEOSITE,PRIVATE,${PROXY_GROUPS.DIRECT}`,
  `GEOSITE,Microsoft@CN,${PROXY_GROUPS.DIRECT}`,
  `GEOIP,CN,${PROXY_GROUPS.DIRECT}`,
  `GEOIP,PRIVATE,${PROXY_GROUPS.DIRECT}`,
  `RULE-SET,GoogleCN,${PROXY_GROUPS.DIRECT}`,

  // 9. 兜底策略 (其余所有流量走节点选择)
  `DOMAIN,services.googleapis.cn,${PROXY_GROUPS.SELECT}`, // 谷歌中国服务走代理
  `GEOSITE,GFW,${PROXY_GROUPS.SELECT}`,
  `RULE-SET,ProxyGFWlist,${PROXY_GROUPS.SELECT}`,
  `MATCH,${PROXY_GROUPS.SELECT}`,
];

/**
 * 构建最终规则链
 * 根据开关决定是否拦截 QUIC
 */
function buildRules({ quicEnabled }) {
  const ruleList = [...baseRules];
  if (!quicEnabled) {
    // 如果关闭 QUIC，则在最前面插入拦截 UDP 443 的规则，强制 YouTube 等回落 TCP
    ruleList.unshift("AND,((DST-PORT,443),(NETWORK,UDP)),REJECT");
  }
  return ruleList;
}


// ============================================================================
// 5. 嗅探与 DNS 配置 (Sniffer & DNS)
// 解决 DNS 污染，提升连接速度
// ============================================================================

const snifferConfig = {
  "enable": true,
  "override-destination": false,
  "force-dns-mapping": true,
  "sniff": {
    "TLS":  { "ports": [443, 8443] },
    "HTTP": { "ports": [80, 8080, 8880] },
    "QUIC": { "ports": [443, 8443] }
  },
  "skip-domain": [
    "Mijia Cloud",
    "dlg.io.mi.com",
    "+.push.apple.com",
    "+.apple.com"
  ]
};

// 增强版 Fake-IP 过滤列表 (这些域名必须返回真实 IP)
const enhancedFakeIpFilter = [
  "geosite:private",
  "geosite:connectivity-check",
  "geosite:cn",
  "Mijia Cloud",
  "dlg.io.mi.com",
  "localhost.ptlogin2.qq.com",
  "*.icloud.com",
  "*.stun.*.*",
  "*.stun.*.*.*",
  "*.msftconnecttest.com",
  "*.msftncsi.com",
  "time.*.com",
  "ntp.*.com",
  "+.nflxvideo.net",
  "+.media.dssott.com",
  "lens.l.google.com"
];

function buildDnsConfig({ mode, fakeIpFilter }) {
  const config = {
    "enable": true,
    "ipv6": ipv6Enabled,
    "prefer-h3": true, // 开启 DoH/H3 优化
    "enhanced-mode": mode,
    "default-nameserver": [
      "223.5.5.5",
      "119.29.29.29"
    ],
    "nameserver": [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query"
    ],
    // [Core] 核心增强：Nameserver Policy 分流
    // 指定国内域名走阿里/腾讯 DNS，国外大厂走 Cloudflare/Google DNS
    "nameserver-policy": {
      "geosite:cn,private": [
        "https://dns.alidns.com/dns-query",
        "https://doh.pub/dns-query"
      ],
      "geosite:google,youtube,telegram,gfw,netflix": [
        "https://1.1.1.1/dns-query",
        "https://8.8.8.8/dns-query"
      ]
    },
    "fallback": [
      "https://1.1.1.1/dns-query",
      "https://8.8.8.8/dns-query",
      "https://dns.sb/dns-query",
      "tcp://208.67.222.222"
    ],
    "proxy-server-nameserver": [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query"
    ]
  };

  if (fakeIpFilter) {
    config["fake-ip-filter"] = fakeIpFilter;
  }
  return config;
}

const dnsConfig = buildDnsConfig({ mode: "redir-host" });
const dnsConfigFakeIp = buildDnsConfig({
  mode: "fake-ip",
  fakeIpFilter: enhancedFakeIpFilter
});


// ============================================================================
// 6. 地理数据库与国家元数据 (Geo & Meta)
// 定义如何识别节点名称中的国家标识
// ============================================================================

const geoxURL = {
  "geoip":   "https://gcore.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geoip.dat",
  "geosite": "https://gcore.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat",
  "mmdb":    "https://gcore.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb",
  "asn":     "https://gcore.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb"
};

const countriesMeta = {
  "香港": { pattern: "(?i)香港|港|HK|hk|Hong Kong|HongKong|hongkong|🇭🇰", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png" },
  "澳门": { pattern: "(?i)澳门|MO|Macau|🇲🇴", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Macao.png" },
  "台湾": { pattern: "(?i)台|新北|彰化|TW|Taiwan|🇹🇼", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png" },
  "狮城": { pattern: "(?i)新加坡|坡|狮城|SG|Singapore|🇸🇬", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png" },
  "日本": { pattern: "(?i)日本|川日|东京|大阪|泉日|埼玉|沪日|深日|JP|Japan|🇯🇵", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png" },
  "韩国": { pattern: "(?i)KR|Korea|KOR|首尔|韩|韓|🇰🇷", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Korea.png" },
  "美国": { pattern: "(?i)美国|美|US|United States|🇺🇸", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png" },
  "枫叶": { pattern: "(?i)加拿大|Canada|CA|🇨🇦", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Canada.png" },
  "英国": { pattern: "(?i)英国|United Kingdom|UK|伦敦|London|🇬🇧", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_Kingdom.png" },
  "袋鼠": { pattern: "(?i)澳洲|澳大利亚|AU|Australia|🇦🇺", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Australia.png" },
  "德国": { pattern: "(?i)德国|德|DE|Germany|🇩🇪", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Germany.png" },
  "法国": { pattern: "(?i)法国|法|FR|France|🇫🇷", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/France.png" },
  "毛子": { pattern: "(?i)俄罗斯|俄|RU|Russia|🇷🇺", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Russia.png" },
  "泰国": { pattern: "(?i)泰国|泰|TH|Thailand|🇹🇭", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Thailand.png" },
  "印度": { pattern: "(?i)印度|IN|India|🇮🇳", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/India.png" },
  "大马": { pattern: "(?i)马来西亚|马来|MY|Malaysia|🇲🇾", icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Malaysia.png" },
};

/**
 * 检查是否存在低倍率节点
 */
function hasLowCost(config) {
  const lowCostRegex = /0\.[0-5]|低倍率|省流|大流量|实验性/i;
  return (config.proxies || []).some(proxy => proxy.name && lowCostRegex.test(proxy.name));
}

/**
 * 遍历节点，统计各地区数量
 * 使用预编译正则提高性能
 */
function parseCountries(config) {
  const proxies = config.proxies || [];
  const ispRegex = /家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地/i;
  const countryCounts = Object.create(null);

  // 1. 预编译所有国家的正则表达式
  const compiledRegex = {};
  for (const [country, meta] of Object.entries(countriesMeta)) {
    compiledRegex[country] = new RegExp(meta.pattern.replace(/^\(\?i\)/, ''), 'i');
  }

  // 2. 遍历节点进行匹配
  for (const proxy of proxies) {
    const name = proxy.name || '';
    if (ispRegex.test(name)) continue; // 跳过家宽节点
    for (const [country, regex] of Object.entries(compiledRegex)) {
      if (regex.test(name)) {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
        break; // 匹配到一个国家后停止
      }
    }
  }

  // 3. 格式化结果
  const result = [];
  for (const [country, count] of Object.entries(countryCounts)) {
    result.push({ country, count });
  }
  return result;
}

/**
 * 构建国家代理组配置 (例如 "香港节点", "美国节点")
 */
function buildCountryProxyGroups({ countries, landing, loadBalance }) {
  const groups = [];
  const baseExcludeFilter = "0\\.[0-5]|低倍率|省流|大流量|实验性"; // 排除低倍率
  const landingExcludeFilter = "(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地"; // 排除家宽
  const groupType = loadBalance ? "load-balance" : "url-test"; // 负载均衡或自动测速

  for (const country of countries) {
    const meta = countriesMeta[country];
    if (!meta) continue;

    const groupConfig = {
      "name": `${country}${NODE_SUFFIX}`,
      "icon": meta.icon,
      "include-all": true,
      "filter": meta.pattern,
      "exclude-filter": landing ? `${landingExcludeFilter}|${baseExcludeFilter}` : baseExcludeFilter,
      "type": groupType
    };

    if (!loadBalance) {
      Object.assign(groupConfig, {
        "url": "https://cp.cloudflare.com/generate_204",
        "interval": 60,
        "tolerance": 20,
        "lazy": false
      });
    }
    groups.push(groupConfig);
  }
  return groups;
}

/**
 * 组装所有代理策略组 (Proxy Groups)
 * 决定 UI 上显示哪些按钮
 */
function buildProxyGroups({
  landing, countries, countryProxyGroups, lowCost,
  defaultSelector, defaultFallback, defaultProxies, defaultProxiesDirect, mediaProxies
}) {
  const hasTW = countries.includes("台湾");
  const hasHK = countries.includes("香港");

  // 前置代理选择器 (仅当开启落地模式时)
  const frontProxySelector = landing
    ? defaultSelector.filter(name => name !== PROXY_GROUPS.LANDING && name !== PROXY_GROUPS.FALLBACK)
    : [];

  // Bilibili 优化：如果有港台节点，则优先使用直连、台湾或香港
  const bilibiliProxies = (hasTW && hasHK)
    ? [PROXY_GROUPS.DIRECT, "台湾节点", "香港节点"]
    : defaultProxiesDirect;
  
  // Bahamut 优化：巴哈姆特仅限台湾 IP，如果存在台湾分组，则强行置顶
  const bahamutProxies = hasTW 
    ? ["台湾节点", ...mediaProxies]
    : mediaProxies;

  return [
    // --- 核心策略组 ---
    { "name": PROXY_GROUPS.SELECT, "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png", "type": "select", "proxies": defaultSelector },
    { "name": PROXY_GROUPS.MANUAL, "icon": "https://gcore.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/select.png", "include-all": true, "type": "select" },

    // --- 落地/前置分组 (可选) ---
    (landing) ? {
      "name": "前置代理", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Area.png", "type": "select", "include-all": true,
      "exclude-filter": "(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地", "proxies": frontProxySelector
    } : null,
    (landing) ? {
      "name": PROXY_GROUPS.LANDING, "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Airport.png", "type": "select", "include-all": true,
      "filter": "(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地",
    } : null,

    // --- 自动故障转移 ---
    {
      "name": PROXY_GROUPS.FALLBACK, "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bypass.png", "type": "fallback", "url": "https://cp.cloudflare.com/generate_204",
      "proxies": defaultFallback, "interval": 180, "tolerance": 20, "lazy": false
    },

    // --- AI 与 生产力 (独立分流) ---
    { "name": "AI服务", "icon": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/icons/chatgpt.png", "type": "select", "proxies": defaultProxies },
    { "name": "Discord", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Discord.png", "type": "select", "proxies": defaultProxies },

    // --- 媒体与流媒体 (独立分流) ---
    { "name": "YouTube", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png", "type": "select", "proxies": mediaProxies },
    { "name": "Netflix", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png", "type": "select", "proxies": mediaProxies },
    { "name": "Disney+", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Disney.png", "type": "select", "proxies": mediaProxies },
    { "name": "Prime Video", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Prime_Video.png", "type": "select", "proxies": mediaProxies },
    { "name": "Bahamut", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bahamut.png", "type": "select", "proxies": bahamutProxies },
    { "name": "Bilibili", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/bilibili.png", "type": "select", "proxies": bilibiliProxies },
    { "name": "Spotify", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Spotify.png", "type": "select", "proxies": mediaProxies },
    { "name": "Emby", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Emby.png", "type": "select", "proxies": mediaProxies },
    { "name": "Telegram", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png", "type": "select", "proxies": defaultProxies },
    { "name": "TikTok", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/TikTok.png", "type": "select", "proxies": defaultProxies },
    
    // --- 其他服务 ---
    { "name": "Crypto", "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Cryptocurrency_3.png", "type": "select", "proxies": defaultProxies },
    { "name": "GitHub", "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/GitHub.png", "type": "select", "proxies": defaultProxies },
    { "name": "Bing", "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Microsoft.png", "type": "select", "proxies": defaultProxies },
    { "name": "OneDrive", "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/OneDrive.png", "type": "select", "proxies": defaultProxies },
    { "name": "Microsoft", "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Microsoft.png", "type": "select", "proxies": defaultProxies },
    { "name": "Apple", "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Apple.png", "type": "select", "proxies": defaultProxies },
    { "name": "Google", "icon": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/icons/Google.png", "type": "select", "proxies": defaultProxies },
    { "name": "Steam", "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Steam.png", "type": "select", "proxies": defaultProxies },
    { "name": "Games", "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Game.png", "type": "select", "proxies": defaultProxies },
    { "name": "PT站点", "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Download.png", "type": "select", "proxies": defaultProxiesDirect },

    // --- 拦截与直连 ---
    { "name": "广告拦截", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/AdBlack.png", "type": "select", "proxies": ["REJECT", "REJECT-DROP", PROXY_GROUPS.DIRECT] },
    { "name": PROXY_GROUPS.DIRECT, "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Direct.png", "type": "select", "proxies": ["DIRECT", PROXY_GROUPS.SELECT] },

    // --- 自动生成的低倍率分组 ---
    (lowCost) ? {
      "name": PROXY_GROUPS.LOW_COST, "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Lab.png", "type": "url-test", "url": "https://cp.cloudflare.com/generate_204",
      "include-all": true, "filter": "(?i)0\\.[0-5]|低倍率|省流|大流量|实验性"
    } : null,
    
    // --- 自动生成的国家分组 ---
    ...countryProxyGroups
  ].filter(Boolean);
}


// ============================================================================
// 7. 主程序入口 (Main)
// ============================================================================

function main(config) {
  // 1. 安全检查：防止空配置导致脚本崩溃
  if (!config || !config.proxies) {
    console.log("Error: Config is empty or no proxies found.");
    return config || {};
  }
  const resultConfig = { proxies: config.proxies };

  // 2. 预处理：统计国家节点数量与类型
  const countryInfo = parseCountries(resultConfig);
  const lowCost = hasLowCost(resultConfig);
  const countryGroupNames = getCountryGroupNames(countryInfo, countryThreshold);
  const countries = stripNodeSuffix(countryGroupNames);

  // 3. 准备基础节点列表 (defaultProxies, mediaProxies 等)
  const {
    defaultProxies, defaultProxiesDirect, defaultSelector, defaultFallback, mediaProxies
  } = buildBaseLists({ landing, lowCost, countryGroupNames });

  // 4. 构建所有策略组
  const countryProxyGroups = buildCountryProxyGroups({ countries, landing, loadBalance });
  const proxyGroups = buildProxyGroups({
    landing, countries, countryProxyGroups, lowCost,
    defaultProxies, defaultProxiesDirect, defaultSelector, defaultFallback, mediaProxies
  });

  // 5. 添加兼容性 GLOBAL 组
  const globalProxies = proxyGroups.map(item => item.name);
  proxyGroups.push({
    "name": "GLOBAL",
    "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png",
    "include-all": true,
    "type": "select",
    "proxies": globalProxies
  });

  // 6. 生成分流规则 (含 QUIC 阻断逻辑)
  const finalRules = buildRules({ quicEnabled });

  // 7. 注入完整配置文件 (Full Config Mode)
  // 当参数 full=true 时，生成包含 inbound/tproxy 等的完整配置，不仅限于 rule/proxy
  if (fullConfig) Object.assign(resultConfig, {
    "mixed-port": 7890,
    "redir-port": 7892,
    "tproxy-port": 7893,
    "routing-mark": 7894,
    "allow-lan": true,
    "ipv6": ipv6Enabled,
    "mode": "rule",
    "unified-delay": true,
    "tcp-concurrent": true,
    "find-process-mode": "off",
    "log-level": "info",
    "geodata-loader": "standard",
    "external-controller": ":9999",
    "disable-keep-alive": !keepAliveEnabled,
    "profile": { "store-selected": true }
  });

  // 8. 组装最终对象
  Object.assign(resultConfig, {
    "proxy-groups": proxyGroups,
    "rule-providers": ruleProviders,
    "rules": finalRules,
    "sniffer": snifferConfig,
    "dns": fakeIPEnabled ? dnsConfigFakeIp : dnsConfig,
    "geodata-mode": true,
    "geox-url": geoxURL,
  });

  return resultConfig;
}