/**
 * ==================================================================================
 * Sub-Store 终极策略增强脚本 V5.9.3 (Landing Optional)
 * ==================================================================================
 *
 * [版本特性]
 * 1. ⚙️ 灵活落地：恢复落地识别逻辑，但默认不隔离。落地节点默认会进入地区分组。
 * 2. 🎛️ 参数控制：可通过 landing=true 开启强制隔离模式 (将落地节点移出地区组)。
 * 3. 🛡️ 核心逻辑：保留 V5.9 的所有特性 (Crypto日本 / Apple直连 / 兜底防断)。
 *
 * [使用参数 (Arguments)]
 * ipv6=true          // [默认开启] 强制开启 IPv6 解析
 * loadbalance=false  // [默认关闭] 负载均衡 (建议 false)
 * landing=false      // [默认关闭] 是否隔离落地节点 (False=不隔离, True=隔离)
 * fakeip=true        // [默认开启] 开启 Fake-IP 模式
 * threshold=0        // [默认 0]  地区节点数量阈值
 */

// ============================================================================
// 1. 全局常量定义 (Constants)
// ============================================================================

const NODE_SUFFIX = "节点";

// [正则] 匹配低倍率、公益或实验性节点
const REGEX_LOW_COST = /0\.[0-5]|低倍率|省流|大流量|实验性|公益/i;

// [正则] 匹配明确标记为“落地”、“中转”或“Relay”的节点
const REGEX_LANDING_ISOLATE = /落地|Relay|To-user/i;

// 策略组名称映射表 (全 Emoji 化)
const GROUPS = {
  // --- 基础控制组 ---
  SELECT:     "🚀 节点选择", // 主入口
  MANUAL:     "🎯 手动切换", // 备用手动
  FALLBACK:   "⚡ 自动切换", // 自动优选
  DIRECT:     "🎯 全球直连", // 强制直连
  LANDING:    "🏳️‍🌈 落地节点", // [可选] 仅在 landing=true 时生成
  LOW_COST:   "🐢 低倍率",   // 低倍率/公益节点
  OTHER:      "🐟 兜底节点", // [防断网] 当无地区分组时显示

  // --- 业务策略组 ---
  AI:         "🤖 AI服务",
  CRYPTO:     "💰 加密货币",    // 特性：优先日本
  APPLE:      "🍎 Apple",       // 特性：默认直连
  MICROSOFT:  "Ⓜ️ 微软服务",
  GOOGLE:     "🇬 Google",
  BING:       "🔍 Bing",        // 特性：默认直连
  ONEDRIVE:   "☁️ OneDrive",

  TELEGRAM:   "✈️ Telegram",
  YOUTUBE:    "📹 YouTube",
  NETFLIX:    "🎥 Netflix",
  DISNEY:     "🏰 Disney+",
  SPOTIFY:    "🎧 Spotify",
  TIKTOK:     "🎵 TikTok",

  STEAM:      "🚂 Steam",
  GAMES:      "🎮 游戏加速",
  PT:         "📦 PT下载",      // 特性：默认直连
  SPEEDTEST:  "📈 网络测速",    // 特性：默认直连
  ADS:        "🛑 广告拦截"
};

// ============================================================================
// 2. 工具与参数解析 (Utils)
// ============================================================================

function parseBool(val, def = false) {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
  return def;
}

function parseNumber(val, def = 0) {
  const num = parseInt(val, 10);
  return isNaN(num) ? def : num;
}

// 解析参数 (landing 默认为 false)
const ARGS = ((args) => ({
  ipv6:      parseBool(args.ipv6Enabled, true),
  lb:        parseBool(args.loadBalance, false),
  landing:   parseBool(args.landing, false), // [变更] 默认为 False，不隔离
  full:      parseBool(args.fullConfig, false),
  fakeip:    parseBool(args.fakeIPEnabled, true),
  quic:      parseBool(args.quicEnabled, false),
  threshold: parseNumber(args.threshold, 0)
}))(typeof $arguments !== 'undefined' ? $arguments : {});


// ============================================================================
// 3. 规则集配置 (Rule Providers)
// ============================================================================

const META_URL = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo";

const ruleProviders = {
  // --- 基础规则 ---
  "Private":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/private.mrs` },
  "CN":           { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/cn.mrs` },
  "ADBlock":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: "https://adrules.top/adrules-mihomo.mrs" },
  "Geo_Not_CN":   { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/geolocation-!cn.mrs` },

  // --- 应用分流 ---
  "AI":           { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/category-ai-!cn.mrs` },
  // [定制] Crypto 规则
  "Crypto":       { type: "http", behavior: "classical", format: "text", interval: 86400, url: "https://raw.githubusercontent.com/langhun/Rule/refs/heads/main/Clash/Ruleset/Crypto.list" },

  "YouTube":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/youtube.mrs` },
  "Google":       { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/google.mrs` },
  "GitHub":       { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/github.mrs` },
  "Telegram":     { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/telegram.mrs` },
  "Netflix":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/netflix.mrs` },
  "Disney":       { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/disney.mrs` },
  "Spotify":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/spotify.mrs` },
  "TikTok":       { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/tiktok.mrs` },
  
  // --- 厂商服务 ---
  "Microsoft":    { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/microsoft.mrs` },
  "Bing":         { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/bing.mrs` },
  "OneDrive":     { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/onedrive.mrs` },
  "Apple":        { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/apple.mrs` },
  "AppleTV":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/apple-tvplus.mrs` },
  "SteamCN":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/steam@cn.mrs` },
  "Epic":         { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/epicgames.mrs` },
  
  // --- 工具类 ---
  "Speedtest":    { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/ookla-speedtest.mrs` },
  "PT":           { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/category-pt.mrs` },
  "DirectList":   { type: "http", behavior: "domain", format: "text", interval: 86400, url: "https://raw.githubusercontent.com/Simondler/Surge/refs/heads/main/Direct.list" },

  // --- IP 规则 ---
  "CN_IP":        { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo/geoip/cn.mrs` },
  "Private_IP":   { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo/geoip/private.mrs` },
  "Binance_IP":   { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo/geoip/binance.mrs` },
  "Google_IP":    { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo/geoip/google.mrs` },
  "Telegram_IP":  { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo/geoip/telegram.mrs` },
  "Netflix_IP":   { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo/geoip/netflix.mrs` },
  "Apple_IP":     { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo-lite/geoip/apple.mrs` }
};


// ============================================================================
// 4. 规则匹配逻辑 (Rules Construction)
// ============================================================================

const buildRules = (quicEnabled) => {
  const rules = [
    // [协议控制]
    !quicEnabled ? "AND,((DST-PORT,443),(NETWORK,UDP)),REJECT" : null,

    // [基础拦截]
    `RULE-SET,ADBlock,${GROUPS.ADS}`,
    `RULE-SET,Private,${GROUPS.DIRECT}`,
    `RULE-SET,Private_IP,${GROUPS.DIRECT},no-resolve`,

    // [业务分流]
    `RULE-SET,AI,${GROUPS.AI}`,
    `RULE-SET,Crypto,${GROUPS.CRYPTO}`, // 指向自定义 Crypto 组

    `RULE-SET,YouTube,${GROUPS.YOUTUBE}`,
    `RULE-SET,Google,${GROUPS.GOOGLE}`,
    `RULE-SET,Google_IP,${GROUPS.GOOGLE},no-resolve`,
    
    `RULE-SET,Bing,${GROUPS.BING}`,
    `RULE-SET,OneDrive,${GROUPS.ONEDRIVE}`,
    `RULE-SET,Microsoft,${GROUPS.MICROSOFT}`,
    
    `RULE-SET,AppleTV,${GROUPS.APPLE}`,
    `RULE-SET,Apple,${GROUPS.APPLE}`,
    `RULE-SET,Apple_IP,${GROUPS.APPLE},no-resolve`,

    `RULE-SET,Telegram,${GROUPS.TELEGRAM}`,
    `RULE-SET,Telegram_IP,${GROUPS.TELEGRAM},no-resolve`,
    `RULE-SET,TikTok,${GROUPS.TIKTOK}`,
    
    `RULE-SET,Netflix,${GROUPS.NETFLIX}`,
    `RULE-SET,Netflix_IP,${GROUPS.NETFLIX},no-resolve`,
    `RULE-SET,Disney,${GROUPS.DISNEY}`,
    `RULE-SET,Spotify,${GROUPS.SPOTIFY}`,
    
    `RULE-SET,SteamCN,${GROUPS.DIRECT}`,
    `RULE-SET,Epic,${GROUPS.GAMES}`,
    `RULE-SET,PT,${GROUPS.PT}`,
    `RULE-SET,Speedtest,${GROUPS.SPEEDTEST}`,
    `RULE-SET,GitHub,${GROUPS.SELECT}`,

    // [兜底]
    `RULE-SET,Geo_Not_CN,${GROUPS.SELECT}`,
    `RULE-SET,CN,${GROUPS.DIRECT}`,
    `RULE-SET,DirectList,${GROUPS.DIRECT}`,
    `RULE-SET,CN_IP,${GROUPS.DIRECT},no-resolve`,
    `MATCH,${GROUPS.SELECT}`
  ];
  return rules.filter(Boolean);
};


// ============================================================================
// 5. 策略组生成逻辑 (Proxy Groups - Optional Landing)
// ============================================================================

const countriesMeta = {
  "香港": { pattern: "(?i)香港|港|HK|Hong Kong|🇭🇰", flag: "🇭🇰" },
  "台湾": { pattern: "(?i)台湾|台|TW|Taiwan|🇹🇼",    flag: "🇹🇼" },
  "日本": { pattern: "(?i)日本|东京|大阪|JP|Japan|🇯🇵", flag: "🇯🇵" },
  "新加坡": { pattern: "(?i)新加坡|坡|狮城|SG|Singapore|🇸🇬", flag: "🇸🇬" },
  "美国": { pattern: "(?i)美国|美|US|United States|🇺🇸", flag: "🇺🇸" },
  "韩国": { pattern: "(?i)韩国|KR|Korea|🇰🇷", flag: "🇰🇷" },
  "英国": { pattern: "(?i)英国|UK|United Kingdom|🇬🇧", flag: "🇬🇧" },
  "德国": { pattern: "(?i)德国|DE|Germany|🇩🇪", flag: "🇩🇪" },
  "法国": { pattern: "(?i)法国|FR|France|🇫🇷", flag: "🇫🇷" },
  "土耳其": { pattern: "(?i)土耳其|TR|Turkey|🇹🇷", flag: "🇹🇷" },
  "阿根廷": { pattern: "(?i)阿根廷|AR|Argentina|🇦🇷", flag: "🇦🇷" },
  "巴西": { pattern: "(?i)巴西|BR|Brazil|🇧🇷", flag: "🇧🇷" },
  "澳大利亚": { pattern: "(?i)澳洲|AU|Australia|🇦🇺", flag: "🇦🇺" },
  "加拿大": { pattern: "(?i)加拿大|CA|Canada|🇨🇦", flag: "🇨🇦" },
  
  // 别称映射
  "狮城": { pattern: "(?i)新加坡|坡|狮城|SG|Singapore|🇸🇬", flag: "🇸🇬" },
  "枫叶": { pattern: "(?i)加拿大|CA|Canada|🇨🇦", flag: "🇨🇦" },
  "袋鼠": { pattern: "(?i)澳大利亚|澳洲|AU|Australia|🇦🇺", flag: "🇦🇺" },
  "花旗": { pattern: "(?i)美国|美|US|United States|🇺🇸", flag: "🇺🇸" },
  "霓虹": { pattern: "(?i)日本|东京|大阪|JP|Japan|🇯🇵", flag: "🇯🇵" },
  "英伦": { pattern: "(?i)英国|UK|United Kingdom|🇬🇧", flag: "🇬🇧" },
  "毛熊": { pattern: "(?i)俄罗斯|俄|RU|Russia|🇷🇺", flag: "🇷🇺" },
  "高丽": { pattern: "(?i)韩国|KR|Korea|🇰🇷", flag: "🇰🇷" },
  "战车": { pattern: "(?i)德国|DE|Germany|🇩🇪", flag: "🇩🇪" },
  "高卢": { pattern: "(?i)法国|FR|France|🇫🇷", flag: "🇫🇷" }
};

/**
 * 解析节点列表，生成结构化国家配置
 */
function parseCountries(proxies) {
  const countryCounts = {};
  const { landing } = ARGS;
  
  const compiledMeta = Object.entries(countriesMeta).map(([key, meta]) => ({
    key,
    flag: meta.flag,
    outputPattern: meta.pattern.replace(/^\(\?i\)/, ''), 
    regex: new RegExp(meta.pattern.replace(/^\(\?i\)/, ''), 'i')
  }));

  for (const proxy of proxies) {
    const name = proxy.name || '';
    
    // [关键] 只有当开启 landing 参数时，才在国家统计中跳过落地节点
    if (landing && REGEX_LANDING_ISOLATE.test(name)) continue;
    
    for (const meta of compiledMeta) {
      if (meta.regex.test(name)) {
        countryCounts[meta.key] = (countryCounts[meta.key] || 0) + 1;
        break;
      }
    }
  }

  return Object.entries(countryCounts)
    .filter(([, count]) => count > ARGS.threshold)
    .map(([key]) => {
      const meta = compiledMeta.find(m => m.key === key);
      return {
        name: `${meta.flag} ${key}${NODE_SUFFIX}`,
        filter: meta.outputPattern
      };
    });
}

/**
 * 构建策略组
 */
function buildProxyGroups(proxies, countryConfigs, hasLowCost) {
  const { lb, landing } = ARGS;
  const countryGroupNames = countryConfigs.map(c => c.name);

  // [兜底组]
  const fallbackAllGroup = [{ 
    name: GROUPS.OTHER, 
    type: "select", 
    "include-all": true 
  }];
  
  // [基础候选列表]
  // 包含所有国家组、兜底组
  // 如果 landing=true，则额外包含 LANDING 组
  const baseProxies = [
    GROUPS.FALLBACK,
    landing ? GROUPS.LANDING : null,
    ...countryGroupNames,
    GROUPS.OTHER, 
    hasLowCost ? GROUPS.LOW_COST : null,
    GROUPS.MANUAL,
    "DIRECT"
  ].filter(Boolean);

  const directFirstProxies = ["DIRECT", GROUPS.SELECT, ...baseProxies.filter(p => p !== "DIRECT" && p !== GROUPS.SELECT)];
  
  // [Crypto 优先日本]
  const japanGroup = countryConfigs.find(c => c.name.includes("🇯🇵") || c.name.includes("日本") || c.name.includes("霓虹"));
  const cryptoProxies = japanGroup 
    ? [japanGroup.name, ...baseProxies.filter(n => n !== japanGroup.name)] 
    : [...baseProxies];

  const mediaProxies = [GROUPS.SELECT, ...countryGroupNames, GROUPS.MANUAL];

  // --- 1. 生成国家分组 ---
  const countryGroups = countryConfigs.map(config => {
    // 如果 landing=true，则过滤掉落地节点；始终过滤低倍率
    const excludeFilter = landing 
      ? `(?i)${REGEX_LANDING_ISOLATE.source}|${REGEX_LOW_COST.source}` 
      : `(?i)${REGEX_LOW_COST.source}`;

    return {
      name: config.name,
      type: lb ? "load-balance" : "url-test",
      "include-all": true,
      filter: config.filter, 
      "exclude-filter": excludeFilter,
      interval: 600, tolerance: 100, lazy: true, 
      url: "https://cp.cloudflare.com/generate_204"
    };
  });

  // --- 2. 生成功能分组 ---
  const functionalGroups = [
    // 基础控制
    { 
      name: GROUPS.SELECT, type: "select", 
      proxies: [GROUPS.FALLBACK, ...countryGroupNames, GROUPS.OTHER, GROUPS.MANUAL, "DIRECT"] 
    },
    { name: GROUPS.MANUAL, type: "select", "include-all": true },
    { 
      name: GROUPS.FALLBACK, type: "url-test", 
      proxies: [landing ? GROUPS.LANDING : null, ...countryGroupNames, GROUPS.OTHER].filter(Boolean), 
      url: "https://cp.cloudflare.com/generate_204", 
      interval: 600, tolerance: 100, lazy: true 
    },
    
    // 业务应用
    { name: GROUPS.AI,        type: "select", proxies: baseProxies },
    { name: GROUPS.TELEGRAM,  type: "select", proxies: baseProxies },
    { name: GROUPS.GOOGLE,    type: "select", proxies: baseProxies },
    { name: GROUPS.MICROSOFT, type: "select", proxies: baseProxies },
    { name: GROUPS.BING,      type: "select", proxies: directFirstProxies },
    { name: GROUPS.ONEDRIVE,  type: "select", proxies: baseProxies },
    { name: GROUPS.APPLE,     type: "select", proxies: directFirstProxies },
    
    // 媒体娱乐
    { name: GROUPS.YOUTUBE,   type: "select", proxies: mediaProxies },
    { name: GROUPS.NETFLIX,   type: "select", proxies: mediaProxies },
    { name: GROUPS.DISNEY,    type: "select", proxies: mediaProxies },
    { name: GROUPS.SPOTIFY,   type: "select", proxies: mediaProxies },
    { name: GROUPS.TIKTOK,    type: "select", proxies: mediaProxies },
    
    // 其他
    { name: GROUPS.GAMES,     type: "select", proxies: baseProxies },
    { name: GROUPS.CRYPTO,    type: "select", proxies: cryptoProxies },
    { name: GROUPS.PT,        type: "select", proxies: directFirstProxies },
    { name: GROUPS.SPEEDTEST, type: "select", proxies: directFirstProxies },

    // 拦截与直连
    { name: GROUPS.ADS,       type: "select", proxies: ["REJECT", "REJECT-DROP", GROUPS.DIRECT] },
    { name: GROUPS.DIRECT,    type: "select", proxies: ["DIRECT", GROUPS.SELECT] }
  ];

  // 仅在 landing=true 时生成隔离组
  if (landing) {
    functionalGroups.push({
      name: GROUPS.LANDING, type: "select", "include-all": true,
      filter: REGEX_LANDING_ISOLATE.source 
    });
  }
  
  if (hasLowCost) {
    functionalGroups.push({
      name: GROUPS.LOW_COST, type: "url-test", "include-all": true,
      filter: REGEX_LOW_COST.source, 
      interval: 600, tolerance: 100, lazy: true
    });
  }

  return [...functionalGroups, ...countryGroups, ...fallbackAllGroup];
}


// ============================================================================
// 6. DNS 配置 (DNS Configuration)
// ============================================================================

function buildDnsConfig() {
  const { fakeip, ipv6 } = ARGS;
  
  return {
    enable: true,
    ipv6: ipv6,
    "prefer-h3": false, 
    "enhanced-mode": fakeip ? "fake-ip" : "redir-host",
    listen: ":1053",
    "use-hosts": true,
    "fake-ip-range": "198.18.0.1/16",
    
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    nameserver: ["https://dns.alidns.com/dns-query", "https://doh.pub/dns-query"],
    fallback: ["https://1.1.1.1/dns-query", "https://8.8.8.8/dns-query"],
    
    // [Fake-IP 过滤] 
    "fake-ip-filter": [
      // 微软/安卓网络检测
      "dns.msftncsi.com",
      "www.msftncsi.com",
      "www.msftconnecttest.com",
      "connectivitycheck.gstatic.com",
      // 游戏主机
      "*.xboxlive.com",
      "*.nintendo.net",
      "*.sonyentertainmentnetwork.com",
      // 强制直连的服务
      "geosite:cn",
      "geosite:apple",
      "geosite:microsoft",
      "geosite:steam@cn"
    ],
    "fallback-filter": { geoip: true, "geoip-code": "CN", ipcidr: ["240.0.0.0/4"] },
    
    "nameserver-policy": {
      "geosite:cn,private,apple,steam,microsoft@cn": ["https://dns.alidns.com/dns-query", "https://doh.pub/dns-query"],
      "geosite:geolocation-!cn,gfw,google,youtube,telegram": ["https://1.1.1.1/dns-query", "https://8.8.8.8/dns-query"]
    }
  };
}


// ============================================================================
// 7. 主程序入口 (Main Entry)
// ============================================================================

function main(config) {
  if (!config || !config.proxies) {
    console.log("⚠️ 错误: 配置文件为空或未找到代理节点。");
    return config || {};
  }

  const proxies = config.proxies;
  const hasLowCost = proxies.some(p => REGEX_LOW_COST.test(p.name));
  
  const countryConfigs = parseCountries(proxies);
  const proxyGroups = buildProxyGroups(proxies, countryConfigs, hasLowCost);
  const rules = buildRules(ARGS.quic);
  const dns = buildDnsConfig();

  const result = {
    ...config,
    "proxy-groups": proxyGroups,
    "rule-providers": ruleProviders,
    rules: rules,
    dns: dns,
    
    "mixed-port": 7890,
    ipv6: ARGS.ipv6,
    "allow-lan": true,
    "unified-delay": true,
    "tcp-concurrent": false,
    
    sniffer: {
      enable: true,
      "force-dns-mapping": true,
      "parse-pure-ip": true,
      "override-destination": false,
      sniff: {
        TLS: { ports: [443, 8443] },
        HTTP: { ports: [80, 8080, 8880] },
        QUIC: { ports: [443, 8443] }
      }
    },
  };

  if (ARGS.full) {
    result["log-level"] = "info";
  }

  return result;
}
