/**
 * ==================================================================================
 * Sub-Store 终极策略增强脚本 V5.5 (Pure Emoji Edition)
 * ==================================================================================
 *
 * [版本特性]
 * 1. 纯净无图：移除所有外部图片资源引用，加载更滑丝，零网络依赖。
 * 2. 全局图标：
 * - 功能组使用 Emoji 标识 (🚀/💰/🍎)。
 * - 地区组自动匹配国旗 Emoji (🇭🇰/🇯🇵/🇺🇸)。
 * 3. 核心逻辑保持 V5.4 的高水准：
 * - 智能分流 (Crypto->日本 / Apple->直连)。
 * - 性能优化 (Lazy加载 / 关闭并发 / 内存优化)。
 * - 落地隔离 (自动识别并隔离中转/落地节点)。
 *
 * [使用参数 (Arguments)]
 * ipv6=true          // [默认开启] 强制开启 IPv6 解析
 * loadbalance=false  // [默认关闭] 负载均衡
 * landing=true       // [默认开启] 自动隔离 落地/家宽/高倍率 节点
 * fakeip=true        // [默认开启] 开启 Fake-IP 模式
 * threshold=0        // [默认 0]  地区节点数量阈值
 */

// ============================================================================
// 1. 全局常量定义 (Constants)
// ============================================================================

const NODE_SUFFIX = "节点";

// [正则定义]
// 1. 低倍率/公益节点正则
const REGEX_LOW_COST = /0\.[0-5]|低倍率|省流|大流量|实验性|公益/i;

// 2. 落地/中转节点正则 (仅隔离明确标注的，不误杀家宽)
const REGEX_LANDING_ISOLATE = /落地|Relay|To-user/i;

// 策略组名称映射表 (全 Emoji 化)
const GROUPS = {
  // --- 基础控制组 ---
  SELECT:     "🚀 节点选择",
  MANUAL:     "🎯 手动切换",
  FALLBACK:   "⚡ 自动切换",
  DIRECT:     "🎯 全球直连",
  LANDING:    "🏳️‍🌈 落地节点",
  LOW_COST:   "🐢 低倍率",
  
  // --- 业务策略组 ---
  AI:         "🤖 AI服务",
  CRYPTO:     "💰 金融服务",    // 优先日本
  APPLE:      "🍎 Apple",       // 默认直连
  MICROSOFT:  "Ⓜ️ 微软服务",
  GOOGLE:     "🇬 Google",
  BING:       "🔍 Bing",        // 默认直连
  ONEDRIVE:   "☁️ OneDrive",
  
  TELEGRAM:   "✈️ Telegram",
  YOUTUBE:    "📹 YouTube",
  NETFLIX:    "🎥 Netflix",
  DISNEY:     "🏰 Disney+",
  SPOTIFY:    "🎧 Spotify",
  TIKTOK:     "🎵 TikTok",
  
  STEAM:      "🚂 Steam",
  GAMES:      "🎮 游戏加速",
  PT:         "📦 PT下载",      // 默认直连
  SPEEDTEST:  "📈 网络测速",    // 默认直连
  ADS:        "🛑 广告拦截"
};

// ============================================================================
// 2. 参数解析工具 (Utilities)
// ============================================================================

function parseBool(val, def = false) {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
  return def;
}

function parseNumber(val, def = 0) {
  if (val == null) return def;
  const num = parseInt(val, 10);
  return isNaN(num) ? def : num;
}

function buildConfig(args) {
  return {
    ipv6:      parseBool(args.ipv6Enabled, true),
    lb:        parseBool(args.loadBalance, false),
    landing:   parseBool(args.landing, true),
    full:      parseBool(args.fullConfig, false),
    fakeip:    parseBool(args.fakeIPEnabled, true),
    quic:      parseBool(args.quicEnabled, false),
    threshold: parseNumber(args.threshold, 0)
  };
}

const ARGS = buildConfig(typeof $arguments !== 'undefined' ? $arguments : {});


// ============================================================================
// 3. 规则集配置 (Rule Providers)
// ============================================================================

// 使用 MetaCubeX 维护的 MRS 二进制规则集
const META_URL = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo";

const ruleProviders = {
  // 核心
  "Private":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/private.mrs` },
  "CN":           { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/cn.mrs` },
  "ADBlock":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: "https://adrules.top/adrules-mihomo.mrs" },
  "Geo_Not_CN":   { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/geolocation-!cn.mrs` },

  // 应用
  "AI":           { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/category-ai-!cn.mrs` },
  "Binance":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/binance.mrs` },
  "YouTube":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/youtube.mrs` },
  "Google":       { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/google.mrs` },
  "GitHub":       { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/github.mrs` },
  "Telegram":     { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/telegram.mrs` },
  "Netflix":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/netflix.mrs` },
  "Disney":       { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/disney.mrs` },
  "Spotify":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/spotify.mrs` },
  "TikTok":       { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/tiktok.mrs` },
  
  // 厂商
  "Microsoft":    { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/microsoft.mrs` },
  "Bing":         { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/bing.mrs` },
  "OneDrive":     { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/onedrive.mrs` },
  "Apple":        { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/apple.mrs` },
  "AppleTV":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/apple-tvplus.mrs` },
  "SteamCN":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/steam@cn.mrs` },
  "Epic":         { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/epicgames.mrs` },
  
  // 工具
  "Speedtest":    { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/ookla-speedtest.mrs` },
  "PT":           { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/category-pt.mrs` },
  "DirectList":   { type: "http", behavior: "domain", format: "text", interval: 86400, url: "https://raw.githubusercontent.com/Simondler/Surge/refs/heads/main/Direct.list" },

  // IP 规则
  "CN_IP":        { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo/geoip/cn.mrs` },
  "Private_IP":   { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo/geoip/private.mrs` },
  "Binance_IP":   { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo/geoip/binance.mrs` },
  "Google_IP":    { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo/geoip/google.mrs` },
  "Telegram_IP":  { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo/geoip/telegram.mrs` },
  "Netflix_IP":   { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo/geoip/netflix.mrs` },
  "Apple_IP":     { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geo-lite/geoip/apple.mrs` }
};


// ============================================================================
// 4. 规则匹配逻辑 (Rules Logic)
// ============================================================================

const buildRules = (quicEnabled) => {
  const rules = [
    // 1. 协议控制
    !quicEnabled ? "AND,((DST-PORT,443),(NETWORK,UDP)),REJECT" : null,

    // 2. 基础拦截
    `RULE-SET,ADBlock,${GROUPS.ADS}`,
    `RULE-SET,Private,${GROUPS.DIRECT}`,
    `RULE-SET,Private_IP,${GROUPS.DIRECT},no-resolve`,

    // 3. 核心分流
    `RULE-SET,AI,${GROUPS.AI}`,
    `RULE-SET,Binance,${GROUPS.CRYPTO}`,
    `RULE-SET,Binance_IP,${GROUPS.CRYPTO},no-resolve`,

    // 4. Google & YouTube (顺序已修正)
    `RULE-SET,YouTube,${GROUPS.YOUTUBE}`,
    `RULE-SET,Google,${GROUPS.GOOGLE}`,
    `RULE-SET,Google_IP,${GROUPS.GOOGLE},no-resolve`,
    
    // 5. 微软系
    `RULE-SET,Bing,${GROUPS.BING}`,
    `RULE-SET,OneDrive,${GROUPS.ONEDRIVE}`,
    `RULE-SET,Microsoft,${GROUPS.MICROSOFT}`,
    
    // 6. 苹果系
    `RULE-SET,AppleTV,${GROUPS.APPLE}`,
    `RULE-SET,Apple,${GROUPS.APPLE}`,
    `RULE-SET,Apple_IP,${GROUPS.APPLE},no-resolve`,

    // 7. 社交与流媒体
    `RULE-SET,Telegram,${GROUPS.TELEGRAM}`,
    `RULE-SET,Telegram_IP,${GROUPS.TELEGRAM},no-resolve`,
    `RULE-SET,TikTok,${GROUPS.TIKTOK}`,
    `RULE-SET,Netflix,${GROUPS.NETFLIX}`,
    `RULE-SET,Netflix_IP,${GROUPS.NETFLIX},no-resolve`,
    `RULE-SET,Disney,${GROUPS.DISNEY}`,
    `RULE-SET,Spotify,${GROUPS.SPOTIFY}`,
    
    // 8. 其他
    `RULE-SET,SteamCN,${GROUPS.DIRECT}`,
    `RULE-SET,Epic,${GROUPS.GAMES}`,
    `RULE-SET,PT,${GROUPS.PT}`,
    `RULE-SET,Speedtest,${GROUPS.SPEEDTEST}`,
    `RULE-SET,GitHub,${GROUPS.SELECT}`,

    // 9. 地区分流
    `RULE-SET,Geo_Not_CN,${GROUPS.SELECT}`,
    `RULE-SET,CN,${GROUPS.DIRECT}`,
    `RULE-SET,DirectList,${GROUPS.DIRECT}`,
    `RULE-SET,CN_IP,${GROUPS.DIRECT},no-resolve`,

    // 10. 兜底
    `MATCH,${GROUPS.SELECT}`
  ];

  return rules.filter(Boolean);
};


// ============================================================================
// 5. 策略组生成逻辑 (Proxy Groups - All Emoji)
// ============================================================================

// 国家与地区元数据：正则匹配 + 对应国旗
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
  "加拿大": { pattern: "(?i)加拿大|CA|Canada|🇨🇦", flag: "🇨🇦" }
};

/**
 * 解析节点，生成带 Emoji 的国家组名列表
 * 返回示例: ["🇭🇰 香港节点", "🇺🇸 美国节点"]
 */
function parseCountries(proxies) {
  const countryCounts = {};
  const compiledRegex = {};
  
  // 预编译正则
  for (const [country, meta] of Object.entries(countriesMeta)) {
    const cleanPattern = meta.pattern.replace(/^\(\?i\)/, '');
    compiledRegex[country] = new RegExp(cleanPattern, 'i');
  }

  for (const proxy of proxies) {
    const name = proxy.name || '';
    if (REGEX_LANDING_ISOLATE.test(name)) continue;
    
    for (const [country, regex] of Object.entries(compiledRegex)) {
      if (regex.test(name)) {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
        break;
      }
    }
  }

  // 1. 过滤阈值 2. 添加 Emoji 前缀
  return Object.entries(countryCounts)
    .filter(([, count]) => count > ARGS.threshold)
    .map(([country]) => {
      const flag = countriesMeta[country].flag;
      return `${flag} ${country}${NODE_SUFFIX}`;
    });
}

/**
 * 构建所有策略组 (移除所有 icon 字段)
 */
function buildProxyGroups(proxies, countryGroupNames, hasLowCost) {
  const { landing, lb } = ARGS;
  
  // 1. [基础候选]
  const allProxies = [
    GROUPS.FALLBACK,
    landing ? GROUPS.LANDING : null,
    ...countryGroupNames,
    hasLowCost ? GROUPS.LOW_COST : null,
    GROUPS.MANUAL,
    "DIRECT"
  ].filter(Boolean);

  // 2. [直连优先]
  const directFirstProxies = [
    "DIRECT", 
    GROUPS.SELECT, 
    ...allProxies.filter(p => p !== "DIRECT" && p !== GROUPS.SELECT)
  ];

  // 3. [日本优先] (Crypto)
  // 匹配带国旗的日本组名 (例如 "🇯🇵 日本节点")
  const japanGroupName = countryGroupNames.find(n => n.includes("日本") || n.includes("🇯🇵"));
  const cryptoProxies = japanGroupName 
    ? [japanGroupName, ...allProxies.filter(n => n !== japanGroupName)] 
    : [...allProxies];

  // 4. [媒体专用]
  const mediaProxies = [GROUPS.SELECT, ...countryGroupNames, GROUPS.MANUAL];

  // --- 动态生成国家策略组 ---
  const countryGroups = countryGroupNames.map(groupName => {
    // groupName 现在是 "🇭🇰 香港节点"，我们需要提取 "香港" 来找正则
    // 简单粗暴方法：遍历 meta 找 flag
    let filterPattern = undefined;
    for (const [key, meta] of Object.entries(countriesMeta)) {
        if (groupName.includes(meta.flag)) {
            filterPattern = meta.pattern;
            break;
        }
    }

    const excludeFilter = landing 
      ? `(?i)${REGEX_LANDING_ISOLATE.source}|${REGEX_LOW_COST.source}` 
      : `(?i)${REGEX_LOW_COST.source}`;

    return {
      name: groupName,
      type: lb ? "load-balance" : "url-test",
      "include-all": true,
      filter: filterPattern,
      "exclude-filter": excludeFilter,
      interval: 300, tolerance: 50, lazy: true, 
      url: "https://cp.cloudflare.com/generate_204"
    };
  });

  // --- 生成固定功能策略组 (无 icon 字段) ---
  const functionalGroups = [
    // 基础控制
    { 
      name: GROUPS.SELECT, type: "select", 
      proxies: [GROUPS.FALLBACK, ...countryGroupNames, GROUPS.MANUAL, "DIRECT"] 
    },
    { 
      name: GROUPS.MANUAL, type: "select", "include-all": true 
    },
    { 
      name: GROUPS.FALLBACK, type: "fallback", 
      proxies: [landing ? GROUPS.LANDING : null, ...countryGroupNames, GROUPS.MANUAL].filter(Boolean),
      url: "https://cp.cloudflare.com/generate_204", interval: 300, tolerance: 50, lazy: true
    },
    
    // 核心业务
    { name: GROUPS.AI,        type: "select", proxies: allProxies },
    { name: GROUPS.TELEGRAM,  type: "select", proxies: allProxies },
    { name: GROUPS.GOOGLE,    type: "select", proxies: allProxies },
    { name: GROUPS.MICROSOFT, type: "select", proxies: allProxies },
    { name: GROUPS.BING,      type: "select", proxies: directFirstProxies },
    { name: GROUPS.ONEDRIVE,  type: "select", proxies: allProxies },
    { name: GROUPS.APPLE,     type: "select", proxies: directFirstProxies },
    
    // 流媒体
    { name: GROUPS.YOUTUBE,   type: "select", proxies: mediaProxies },
    { name: GROUPS.NETFLIX,   type: "select", proxies: mediaProxies },
    { name: GROUPS.DISNEY,    type: "select", proxies: mediaProxies },
    { name: GROUPS.SPOTIFY,   type: "select", proxies: mediaProxies },
    { name: GROUPS.TIKTOK,    type: "select", proxies: mediaProxies },
    
    // 其他
    { name: GROUPS.GAMES,     type: "select", proxies: allProxies },
    { name: GROUPS.CRYPTO,    type: "select", proxies: cryptoProxies },
    { name: GROUPS.PT,        type: "select", proxies: directFirstProxies },
    { name: GROUPS.SPEEDTEST, type: "select", proxies: directFirstProxies },

    // 广告与直连
    { name: GROUPS.ADS,       type: "select", proxies: ["REJECT", "REJECT-DROP", GROUPS.DIRECT] },
    { name: GROUPS.DIRECT,    type: "select", proxies: ["DIRECT", GROUPS.SELECT] }
  ];

  if (landing) {
    functionalGroups.push({
      name: GROUPS.LANDING, type: "select", "include-all": true,
      filter: `(?i)${REGEX_LANDING_ISOLATE.source}`
    });
  }
  
  if (hasLowCost) {
    functionalGroups.push({
      name: GROUPS.LOW_COST, type: "url-test", "include-all": true,
      filter: `(?i)${REGEX_LOW_COST.source}`,
      interval: 300, lazy: true
    });
  }

  return [...functionalGroups, ...countryGroups];
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
    
    "fake-ip-filter": [
      "dns.msftncsi.com",
      "www.msftncsi.com",
      "www.msftconnecttest.com",
      "connectivitycheck.gstatic.com",
      "*.xboxlive.com",
      "*.nintendo.net",
      "*.sonyentertainmentnetwork.com"
    ],
    "fallback-filter": { geoip: true, "geoip-code": "CN", ipcidr: ["240.0.0.0/4"] },
    
    "nameserver-policy": {
      "private,apple,steam,microsoft@cn": ["https://dns.alidns.com/dns-query", "https://doh.pub/dns-query"],
      "geosite:geolocation-!cn,gfw,google,youtube,telegram": ["https://1.1.1.1/dns-query", "https://8.8.8.8/dns-query"]
    }
  };
}


// ============================================================================
// 7. 主程序入口 (Main)
// ============================================================================

function main(config) {
  if (!config || !config.proxies) {
    console.log("⚠️ 错误: 配置文件为空或未找到代理节点。");
    return config || {};
  }

  const proxies = config.proxies;
  
  // 1. 计算是否包含低倍率节点
  const hasLowCost = proxies.some(p => REGEX_LOW_COST.test(p.name));
  
  // 2. 解析节点，生成带 Emoji 的地区组名 (如: "🇭🇰 香港节点")
  const countryGroupNames = parseCountries(proxies);
  
  // 3. 构建策略组
  const proxyGroups = buildProxyGroups(proxies, countryGroupNames, hasLowCost);
  
  // 4. 构建规则
  const rules = buildRules(ARGS.quic);
  
  // 5. 构建 DNS
  const dns = buildDnsConfig();

  // 6. 组装结果
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