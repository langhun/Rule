/**
 * Powerfullz Sub-Store 订阅转换脚本 (IPv6 增强版)
 *
 * [本次更新 - IPv6 专项优化]
 * 1. 默认开启 IPv6：无需手动传参，脚本默认启用 ipv6=true。
 * 2. DNS 策略调整：强制 DNS 模块查询 AAAA 记录，解决开启代理后 IPv6 消失的问题。
 * 3. 内存与连接优化：保持了之前的极致优化（关闭并发、Lazy 模式）。
 *
 * [推荐参数 Arguments]
 * ipv6=true          // (默认开启) 强制开启 IPv6 支持
 * loadbalance=false  // 负载均衡 (建议 false)
 * landing=true       // 识别落地/家宽节点
 * fakeip=true        // 开启 Fake-IP (强烈建议开启)
 * keepalive=false    // 关闭长连接
 * quic=false         // 屏蔽 QUIC
 */

// ============================================================================
// 1. 全局常量与正则定义 (预编译以提升性能)
// ============================================================================

const NODE_SUFFIX = "节点";

// [性能优化] 正则表达式常量
const REGEX_LOW_COST = /0\.[0-5]|低倍率|省流|大流量|实验性/i;
const REGEX_LANDING = /(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地/;

// 策略组名称常量映射
const PROXY_GROUPS = {
  SELECT:   "节点选择", // 主手动选择
  MANUAL:   "手动切换", // 二级手动选择
  FALLBACK: "自动切换", // 自动测试延迟最低
  DIRECT:   "全球直连", // 不走代理
  LANDING:  "落地节点", // 家宽/ISP 专用组
  LOW_COST: "低倍率节点", // 0.x 倍率专用组
};

// ============================================================================
// 2. 参数解析工具
// ============================================================================

function parseBool(value, defaultValue = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return defaultValue;
}

function parseNumber(value, defaultValue = 0) {
  if (value === null || typeof value === 'undefined') return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 解析 Sub-Store 传递的参数
 * [优化] IPv6 默认值改为 true
 */
function buildFeatureFlags(args) {
  // 从 args 中获取参数，如果没有传，则使用默认值
  const ipv6Enabled = parseBool(args.ipv6Enabled, true); // [修改] 默认为 true，优先开启 IPv6

  const spec = {
    loadbalance: "loadBalance",       // 是否启用负载均衡
    landing:     "landing",           // 是否启用落地节点分组
    full:        "fullConfig",        // 是否生成完整配置文件
    keepalive:   "keepAliveEnabled",  // 是否启用 TCP Keep-Alive
    fakeip:      "fakeIPEnabled",     // 是否启用 Fake-IP DNS 模式
    quic:        "quicEnabled"        // 是否允许 QUIC (UDP)
  };

  const flags = Object.entries(spec).reduce((acc, [sourceKey, targetKey]) => {
    acc[targetKey] = parseBool(args[sourceKey], false);
    return acc;
  }, {});
  
  // 手动赋值 ipv6
  flags.ipv6Enabled = ipv6Enabled;
  flags.countryThreshold = parseNumber(args.threshold, 0);
  return flags;
}

// 获取参数
const rawArgs = typeof $arguments !== 'undefined' ? $arguments : {};
const {
  loadBalance, landing, ipv6Enabled, fullConfig, 
  keepAliveEnabled, fakeIPEnabled, quicEnabled, countryThreshold
} = buildFeatureFlags(rawArgs);


// ============================================================================
// 3. 核心逻辑工具
// ============================================================================

const buildList = (...elements) => elements.flat().filter(Boolean);

function getCountryGroupNames(countryInfo, minCount) {
  return countryInfo
    .filter(item => item.count >= minCount)
    .map(item => item.country + NODE_SUFFIX);
}

function stripNodeSuffix(groupNames) {
  const suffixPattern = new RegExp(`${NODE_SUFFIX}$`);
  return groupNames.map(name => name.replace(suffixPattern, ""));
}

/**
 * 构建基础候选节点列表
 */
function buildBaseLists({ landing, lowCost, countryGroupNames }) {
  // 1. 通用列表
  const defaultSelector = buildList(
    PROXY_GROUPS.FALLBACK,
    landing && PROXY_GROUPS.LANDING,
    countryGroupNames,
    lowCost && PROXY_GROUPS.LOW_COST,
    PROXY_GROUPS.MANUAL,
    "DIRECT"
  );

  // 2. 默认代理列表
  const defaultProxies = buildList(
    PROXY_GROUPS.SELECT,
    countryGroupNames,
    lowCost && PROXY_GROUPS.LOW_COST,
    PROXY_GROUPS.MANUAL,
    PROXY_GROUPS.DIRECT
  );

  // 3. 媒体专用列表
  const mediaProxies = buildList(
    PROXY_GROUPS.SELECT,
    countryGroupNames,
    PROXY_GROUPS.MANUAL
  );

  // 4. 直连优先列表
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
// 4. 规则集配置 (Rule Providers)
// ============================================================================

const ruleProviders = {
  // --- 基础规则 ---
  "LocalAreaNetwork": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/LocalAreaNetwork.list",
    path: "./ruleset/ACL4SSR/LocalAreaNetwork.list"
  },
  "ADBlock": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: "https://adrules.top/adrules-mihomo.mrs",
    path: "./ruleset/ADBlock.mrs"
  },
  "BanAD": {
    type: "http", behavior: "domain", format: "text", interval: 86400, 
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/BanAD.list",
    path: "./ruleset/ACL4SSR/BanAD.list"
  },
  "BanProgramAD": {
    type: "http", behavior: "domain", format: "text", interval: 86400, 
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/BanProgramAD.list",
    path: "./ruleset/ACL4SSR/BanProgramAD.list"
  },
  "AdditionalFilter": {
    type: "http", behavior: "domain", format: "text", interval: 86400, 
    url: "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/AdditionalFilter.list",
    path: "./ruleset/powerfullz/AdditionalFilter.list"
  },

  // --- 国内与下载 ---
  "ChinaDomain": {
    type: "http", behavior: "domain", format: "text", interval: 86400, 
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
    type: "http", behavior: "domain", format: "text", interval: 86400, 
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ProxyGFWlist.list",
    path: "./ruleset/ACL4SSR/ProxyGFWlist.list"
  },

  // --- AI 服务 ---
  "OpenAI": {
    type: "http", behavior: "domain", format: "text", interval: 86400, 
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/openai.yaml",
    path: "./ruleset/MetaCubeX/OpenAI.yaml"
  },
  "Gemini": {
    type: "http", behavior: "domain", format: "text", interval: 86400, 
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/google-gemini.yaml",
    path: "./ruleset/MetaCubeX/Gemini.yaml"
  },
  "AI": {
    type: "http", behavior: "domain", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/AI.list",
    path: "./ruleset/ACL4SSR/AI.list"
  },

  // --- 社交与流媒体 ---
  "Telegram": {
    type: "http", behavior: "classical", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list",
    path: "./ruleset/ACL4SSR/Telegram.list"
  },
  "TikTok": {
    type: "http", behavior: "domain", format: "text", interval: 86400,
    url: "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/TikTok.list",
    path: "./ruleset/powerfullz/TikTok.list"
  },
  "Disney": {
    type: "http", behavior: "domain", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/DisneyPlus.list",
    path: "./ruleset/ACL4SSR/DisneyPlus.list"
  },
  "Discord": {
    type: "http", behavior: "domain", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Discord.list",
    path: "./ruleset/ACL4SSR/Discord.list"
  },

  // --- 游戏与厂商 ---
  "SteamCN": {
    type: "http", behavior: "domain", format: "text", interval: 86400, 
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/SteamCN.list",
    path: "./ruleset/ACL4SSR/SteamCN.list"
  },
  "SteamFix": {
    type: "http", behavior: "domain", format: "text", interval: 86400,
    url: "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/SteamFix.list",
    path: "./ruleset/powerfullz/SteamFix.list"
  },
  "Epic": {
    type: "http", behavior: "domain", format: "text", interval: 86400,
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Epic.list",
    path: "./ruleset/ACL4SSR/Epic.list"
  },
  "GoogleFCM": {
    type: "http", behavior: "domain", format: "text", interval: 86400, 
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/GoogleFCM.list",
    path: "./ruleset/ACL4SSR/GoogleFCM.list"
  },
  "GoogleCN": {
    type: "http", behavior: "domain", format: "text", interval: 86400, 
    url: "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/GoogleCN.list",
    path: "./ruleset/ACL4SSR/GoogleCN.list"
  },
  "Crypto": {
    type: "http", behavior: "domain", format: "text", interval: 86400,
    url: "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/Crypto.list",
    path: "./ruleset/powerfullz/Crypto.list"
  },
  "Bing": {
    type: "http", behavior: "domain", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Bing.list",
    path: "./ruleset/ACL4SSR/Bing.list"
  },
  "OneDrive": {
    type: "http", behavior: "domain", format: "text", interval: 86400,
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/OneDrive.list",
    path: "./ruleset/ACL4SSR/OneDrive.list"
  },
  "Microsoft": {
    type: "http", behavior: "domain", format: "text", interval: 86400, 
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list",
    path: "./ruleset/ACL4SSR/Microsoft.list"
  },
  "Apple": {
    type: "http", behavior: "domain", format: "text", interval: 86400, 
    url: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list",
    path: "./ruleset/ACL4SSR/Apple.list"
  }
};


// ============================================================================
// 5. 规则匹配逻辑 (Rules)
// ============================================================================

const baseRules = [
  // 1. 广告拦截
  `RULE-SET,ADBlock,广告拦截`,
  `RULE-SET,AdditionalFilter,广告拦截`,
  `RULE-SET,BanAD,广告拦截`,
  `RULE-SET,BanProgramAD,广告拦截`,

  // 2. AI 服务
  `RULE-SET,OpenAI,AI服务`,
  `RULE-SET,Gemini,AI服务`,
  `GEOSITE,CATEGORY-AI-!CN,AI服务`,

  // 3. 金融
  `RULE-SET,Crypto,Crypto`,

  // 4. 应用分流
  `RULE-SET,Disney,Disney+`,
  `RULE-SET,TikTok,TikTok`,
  `RULE-SET,Telegram,Telegram`,
  `RULE-SET,Discord,Discord`,
  `RULE-SET,Bing,Bing`,
  `RULE-SET,OneDrive,OneDrive`,
  `RULE-SET,Microsoft,Microsoft`,
  `RULE-SET,Apple,Apple`,
  `RULE-SET,Epic,Games`,

  // 5. GeoSite 通用匹配
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

  // 6. GeoIP 规则
  `GEOIP,Netflix,Netflix,no-resolve`,
  `GEOIP,Telegram,Telegram,no-resolve`,

  // 7. 国内直连与局域网
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

  // 8. 兜底策略
  `DOMAIN,services.googleapis.cn,${PROXY_GROUPS.SELECT}`,
  `GEOSITE,GFW,${PROXY_GROUPS.SELECT}`,
  `RULE-SET,ProxyGFWlist,${PROXY_GROUPS.SELECT}`,
  `MATCH,${PROXY_GROUPS.SELECT}`,
];

/**
 * 构建最终规则链 (含 QUIC 控制)
 */
function buildRules({ quicEnabled }) {
  const ruleList = [...baseRules];
  if (!quicEnabled) {
    ruleList.unshift("AND,((DST-PORT,443),(NETWORK,UDP)),REJECT");
  }
  return ruleList;
}


// ============================================================================
// 6. 嗅探与 DNS 配置 (IPv6 核心优化点)
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
    "Mijia Cloud", "dlg.io.mi.com", "+.push.apple.com", "+.apple.com"
  ]
};

// 增强版 Fake-IP 过滤列表
const enhancedFakeIpFilter = [
  "geosite:private", "geosite:connectivity-check", "geosite:cn",
  "Mijia Cloud", "dlg.io.mi.com", "localhost.ptlogin2.qq.com",
  "*.icloud.com", "*.stun.*.*", "*.stun.*.*.*",
  "*.msftconnecttest.com", "*.msftncsi.com",
  "time.*.com", "ntp.*.com", "+.nflxvideo.net",
  "+.media.dssott.com", "lens.l.google.com"
];

/**
 * 构建 DNS 配置
 * [IPv6 修复关键]: 必须显式开启 ipv6: true
 */
function buildDnsConfig({ mode, fakeIpFilter }) {
  return {
    "enable": true,
    "ipv6": ipv6Enabled, // [关键] 跟随全局设置，确保 DNS 请求 AAAA 记录
    "prefer-h3": false,
    "enhanced-mode": mode,
    "listen": ":1053",
    "use-hosts": true,

    // 1. 引导 DNS
    "default-nameserver": [
      "223.5.5.5",
      "119.29.29.29"
    ],

    // 2. 国内 DNS
    "nameserver": [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query"
    ],

    // 3. Fallback DNS
    "fallback": [
      "https://1.1.1.1/dns-query",
      "https://8.8.8.8/dns-query"
    ],

    // 4. Fallback 过滤器
    "fallback-filter": {
      "geoip": true,
      "geoip-code": "CN",
      "ipcidr": ["240.0.0.0/4"],
      "domain": ["+.google.com", "+.facebook.com", "+.twitter.com", "+.youtube.com", "+.netflix.com"]
    },

    // 5. 指定分流策略
    "nameserver-policy": {
      "geosite:cn,private,apple,steam,microsoft@cn": [
        "https://dns.alidns.com/dns-query",
        "https://doh.pub/dns-query"
      ],
      "geosite:geolocation-!cn,gfw,google": [
        "https://1.1.1.1/dns-query",
        "https://8.8.8.8/dns-query"
      ]
    },

    "proxy-server-nameserver": [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query"
    ],

    ...(fakeIpFilter && { "fake-ip-filter": fakeIpFilter })
  };
}

const dnsConfig = buildDnsConfig({ mode: "redir-host" });
const dnsConfigFakeIp = buildDnsConfig({ mode: "fake-ip", fakeIpFilter: enhancedFakeIpFilter });


// ============================================================================
// 7. 地理数据库与国家元数据
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

// 检查是否包含低倍率节点
function hasLowCost(config) {
  return (config.proxies || []).some(proxy => proxy.name && REGEX_LOW_COST.test(proxy.name));
}

// 统计各国家/地区节点数量
function parseCountries(config) {
  const proxies = config.proxies || [];
  const countryCounts = Object.create(null);
  
  const compiledRegex = {};
  for (const [country, meta] of Object.entries(countriesMeta)) {
    compiledRegex[country] = new RegExp(meta.pattern.replace(/^\(\?i\)/, ''), 'i');
  }

  for (const proxy of proxies) {
    const name = proxy.name || '';
    if (REGEX_LANDING.test(name)) continue; 
    for (const [country, regex] of Object.entries(compiledRegex)) {
      if (regex.test(name)) {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
        break;
      }
    }
  }

  const result = [];
  for (const [country, count] of Object.entries(countryCounts)) {
    result.push({ country, count });
  }
  return result;
}

// 构建国家策略组
function buildCountryProxyGroups({ countries, landing, loadBalance }) {
  const groups = [];
  const groupType = loadBalance ? "load-balance" : "url-test";
  
  for (const country of countries) {
    const meta = countriesMeta[country];
    if (!meta) continue;

    const groupConfig = {
      "name": `${country}${NODE_SUFFIX}`,
      "icon": meta.icon,
      "include-all": true,
      "filter": meta.pattern,
      "exclude-filter": landing 
        ? `${REGEX_LANDING.source}|${REGEX_LOW_COST.source}` 
        : REGEX_LOW_COST.source,
      "type": groupType
    };

    if (!loadBalance) {
      Object.assign(groupConfig, {
        "url": "https://cp.cloudflare.com/generate_204",
        "interval": 300,
        "tolerance": 50,
        "lazy": true
      });
    }
    groups.push(groupConfig);
  }
  return groups;
}

// 组装所有策略组
function buildProxyGroups({ landing, countries, countryProxyGroups, lowCost, defaultSelector, defaultFallback, defaultProxies, defaultProxiesDirect, mediaProxies }) {
  const hasTW = countries.includes("台湾");
  const hasHK = countries.includes("香港");
  
  const frontProxySelector = landing 
    ? defaultSelector.filter(name => name !== PROXY_GROUPS.LANDING && name !== PROXY_GROUPS.FALLBACK) 
    : [];
    
  const bilibiliProxies = (hasTW && hasHK) 
    ? [PROXY_GROUPS.DIRECT, "台湾节点", "香港节点"] 
    : defaultProxiesDirect;

  return [
    { "name": PROXY_GROUPS.SELECT, "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png", "type": "select", "proxies": defaultSelector },
    { "name": PROXY_GROUPS.MANUAL, "icon": "https://gcore.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/select.png", "include-all": true, "type": "select" },
    
    (landing) ? { 
      "name": "前置代理", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Area.png", "type": "select", "include-all": true, 
      "exclude-filter": REGEX_LANDING.source, "proxies": frontProxySelector 
    } : null,
    (landing) ? { 
      "name": PROXY_GROUPS.LANDING, "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Airport.png", "type": "select", "include-all": true, 
      "filter": REGEX_LANDING.source, 
    } : null,
    
    { 
      "name": PROXY_GROUPS.FALLBACK, "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bypass.png", "type": "fallback", "url": "https://cp.cloudflare.com/generate_204", 
      "proxies": defaultFallback, "interval": 300, "tolerance": 50, "lazy": true 
    },

    { "name": "AI服务", "icon": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/icons/chatgpt.png", "type": "select", "proxies": defaultProxies },
    { "name": "Discord", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Discord.png", "type": "select", "proxies": defaultProxies },
    { "name": "YouTube", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png", "type": "select", "proxies": mediaProxies },
    { "name": "Netflix", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png", "type": "select", "proxies": mediaProxies },
    { "name": "Disney+", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Disney.png", "type": "select", "proxies": mediaProxies },
    { "name": "Bilibili", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/bilibili.png", "type": "select", "proxies": bilibiliProxies },
    { "name": "Spotify", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Spotify.png", "type": "select", "proxies": mediaProxies },
    { "name": "Telegram", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png", "type": "select", "proxies": defaultProxies },
    { "name": "TikTok", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/TikTok.png", "type": "select", "proxies": defaultProxies },
    
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
    
    { "name": "广告拦截", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/AdBlack.png", "type": "select", "proxies": ["REJECT", "REJECT-DROP", PROXY_GROUPS.DIRECT] },
    { "name": PROXY_GROUPS.DIRECT, "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Direct.png", "type": "select", "proxies": ["DIRECT", PROXY_GROUPS.SELECT] },
    
    (lowCost) ? { 
      "name": PROXY_GROUPS.LOW_COST, "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Lab.png", "type": "url-test", "url": "https://cp.cloudflare.com/generate_204", 
      "include-all": true, "filter": REGEX_LOW_COST.source, 
      "interval": 300, "lazy": true 
    } : null,

    ...countryProxyGroups
  ].filter(Boolean);
}


// ============================================================================
// 8. 主程序入口 (Main)
// ============================================================================

function main(config) {
  // 1. 安全检查
  if (!config || !config.proxies) { 
    console.log("Error: Config is empty or no proxies found."); 
    return config || {}; 
  }

  const resultConfig = { proxies: config.proxies };

  // 2. 预处理
  const countryInfo = parseCountries(resultConfig);
  const lowCost = hasLowCost(resultConfig);
  const countryGroupNames = getCountryGroupNames(countryInfo, countryThreshold);
  const countries = stripNodeSuffix(countryGroupNames);

  // 3. 构建列表
  const { defaultProxies, defaultProxiesDirect, defaultSelector, defaultFallback, mediaProxies } = buildBaseLists({ landing, lowCost, countryGroupNames });
  
  // 4. 构建策略组
  const countryProxyGroups = buildCountryProxyGroups({ countries, landing, loadBalance });
  const proxyGroups = buildProxyGroups({ landing, countries, countryProxyGroups, lowCost, defaultProxies, defaultProxiesDirect, defaultSelector, defaultFallback, mediaProxies });
  
  // 5. 生成规则
  const finalRules = buildRules({ quicEnabled });

  // 6. 注入完整配置 (Full Config)
  if (fullConfig) Object.assign(resultConfig, {
    "mixed-port": 7890,
    "redir-port": 7892,
    "tproxy-port": 7893,
    "routing-mark": 7894,
    "allow-lan": true,
    "ipv6": ipv6Enabled, // [IPv6] 全局开启
    "mode": "rule",
    "unified-delay": true, 
    
    // [关键性能优化]
    "tcp-concurrent": false,          // [必须关闭] 否则连接数爆炸
    "disable-keep-alive": !keepAliveEnabled, 
    "keep-alive-interval": 1800,      // 30分钟一次心跳
    
    "find-process-mode": "off",
    "log-level": "info",
    "geodata-loader": "standard",
    "external-controller": ":9090",
    "global-client-fingerprint": "chrome",
    "profile": { "store-selected": true }
  });

  // 7. 组装最终对象
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