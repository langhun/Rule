/**
 * ==================================================================================
 * Sub-Store 终极策略增强脚本 V5.9 (完美注释 & 格式化版)
 * ==================================================================================
 *
 * [版本亮点]
 * 1. 🛡️ 策略链保活：针对"全落地/全中转"机场，强制 Fallback 组包含兜底节点，防止断网。
 * 2. 🛡️ 兼容性修复：自动剥离正则中的 (?i) 标志，防止部分旧版 Clash 核心解析报错。
 * 3. ♻️ 养老级参数：测速间隔设为 600s，容差 100ms，大幅降低电量消耗和节点跳变频率。
 * 4. 🚀 性能优化：关闭 TCP 并发，关闭 DNS H3，开启全链路 Lazy 懒加载。
 *
 * [核心路由逻辑]
 * - 💰 加密货币 -> 优先锁定 [🇯🇵 日本节点] (低延迟交易)。
 * - 🍎 Apple/Bing/PT -> 默认 [🎯 全球直连] (提升下载速度/防误杀)。
 * - 📹 YouTube/Netflix -> 走 [🚀 节点选择] 或 [自动选择]。
 *
 * [使用参数 (Arguments)]
 * ipv6=true          // 强制开启 IPv6 解析 (默认开启)
 * loadbalance=false  // 负载均衡 (默认关闭，家用推荐 url-test)
 * landing=true       // 隔离落地节点 (默认开启，保持地区组纯净)
 * fakeip=true        // Fake-IP 模式 (默认开启，提升响应速度)
 * threshold=0        // 地区节点阈值 (默认 0，即有一个节点就生成地区组)
 */

// ============================================================================
// 1. 全局常量定义 (Constants)
// ============================================================================

// 自动生成的地区分组名称后缀 (例如: "🇭🇰 香港节点")
const NODE_SUFFIX = "节点";

// [正则] 匹配低倍率、公益或实验性节点
// 用于将其从优质地区组中剔除，放入单独的 "🐢 低倍率" 组
const REGEX_LOW_COST = /0\.[0-5]|低倍率|省流|大流量|实验性|公益/i;

// [正则] 匹配明确标记为“落地”、“中转”或“Relay”的节点
// 用于将其从地区组中隔离。注意：不包含"家宽"，以免误杀优质解锁节点。
const REGEX_LANDING_ISOLATE = /落地|Relay|To-user/i;

// 策略组名称映射表 (修改此处可一键变更 UI 显示名称)
const GROUPS = {
  // --- 基础控制组 ---
  SELECT:     "🚀 节点选择", // 主入口，日常使用
  MANUAL:     "🎯 手动切换", // 备用手动选择
  FALLBACK:   "⚡ 自动切换", // 自动优选低延迟
  DIRECT:     "🎯 全球直连", // 强制不走代理
  LANDING:    "🏳️‍🌈 落地节点", // 被隔离的落地/中转节点
  LOW_COST:   "🐢 低倍率",   // 被隔离的低倍率节点
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

/**
 * 将字符串参数转换为布尔值
 * @param {any} val 输入值
 * @param {boolean} def 默认值
 */
function parseBool(val, def = false) {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
  return def;
}

/**
 * 将字符串参数转换为整数
 */
function parseNumber(val, def = 0) {
  const num = parseInt(val, 10);
  return isNaN(num) ? def : num;
}

// 解析 Sub-Store 传入的参数并构建全局配置对象 ARGS
const ARGS = ((args) => ({
  ipv6:      parseBool(args.ipv6Enabled, true),      // IPv6 开关
  lb:        parseBool(args.loadBalance, false),     // 负载均衡开关
  landing:   parseBool(args.landing, true),          // 落地隔离开关
  full:      parseBool(args.fullConfig, false),      // 完整配置输出
  fakeip:    parseBool(args.fakeIPEnabled, true),    // FakeIP 开关
  quic:      parseBool(args.quicEnabled, false),     // QUIC 开关 (建议关闭)
  threshold: parseNumber(args.threshold, 0)          // 地区阈值
}))(typeof $arguments !== 'undefined' ? $arguments : {});


// ============================================================================
// 3. 规则集配置 (Rule Providers)
// ============================================================================

// 

// 统一的基础 URL，使用 MetaCubeX 优化的 MRS 二进制规则 (内存占用极低)
const META_URL = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo";

const ruleProviders = {
  // --- 基础规则 ---
  "Private":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/private.mrs` },
  "CN":           { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/cn.mrs` },
  "ADBlock":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: "https://adrules.top/adrules-mihomo.mrs" },
  "Geo_Not_CN":   { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/geolocation-!cn.mrs` },

  // --- 应用分流 ---
  "AI":           { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/category-ai-!cn.mrs` },
  
  // [定制] Crypto 规则：使用用户指定的 langhun 列表 (text格式)
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
  // 补充直连列表
  "DirectList":   { type: "http", behavior: "domain", format: "text", interval: 86400, url: "https://raw.githubusercontent.com/Simondler/Surge/refs/heads/main/Direct.list" },

  // --- IP 规则 (用于解决 DNS 污染或纯 IP 访问) ---
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
    // [协议控制] 阻断 UDP 443 (QUIC)，防止运营商 QoS 限速导致流媒体卡顿
    !quicEnabled ? "AND,((DST-PORT,443),(NETWORK,UDP)),REJECT" : null,

    // [基础拦截] 广告与局域网
    `RULE-SET,ADBlock,${GROUPS.ADS}`,
    `RULE-SET,Private,${GROUPS.DIRECT}`,
    `RULE-SET,Private_IP,${GROUPS.DIRECT},no-resolve`,

    // [核心业务] AI
    `RULE-SET,AI,${GROUPS.AI}`,
    
    // [Crypto] 定制规则 -> 指向优先日本的策略组
    `RULE-SET,Crypto,${GROUPS.CRYPTO}`,

    // [关键排序] YouTube 必须在 Google 之前，否则会被 Google 的泛域名规则拦截
    `RULE-SET,YouTube,${GROUPS.YOUTUBE}`,
    `RULE-SET,Google,${GROUPS.GOOGLE}`,
    `RULE-SET,Google_IP,${GROUPS.GOOGLE},no-resolve`,
    
    // [微软服务] Bing 和 OneDrive 分离
    `RULE-SET,Bing,${GROUPS.BING}`,
    `RULE-SET,OneDrive,${GROUPS.ONEDRIVE}`,
    `RULE-SET,Microsoft,${GROUPS.MICROSOFT}`,
    
    // [苹果服务] 默认直连以优化 App Store 体验
    `RULE-SET,AppleTV,${GROUPS.APPLE}`,
    `RULE-SET,Apple,${GROUPS.APPLE}`,
    `RULE-SET,Apple_IP,${GROUPS.APPLE},no-resolve`,

    // [社交媒体]
    `RULE-SET,Telegram,${GROUPS.TELEGRAM}`,
    `RULE-SET,Telegram_IP,${GROUPS.TELEGRAM},no-resolve`,
    `RULE-SET,TikTok,${GROUPS.TIKTOK}`,
    
    // [流媒体]
    `RULE-SET,Netflix,${GROUPS.NETFLIX}`,
    `RULE-SET,Netflix_IP,${GROUPS.NETFLIX},no-resolve`,
    `RULE-SET,Disney,${GROUPS.DISNEY}`,
    `RULE-SET,Spotify,${GROUPS.SPOTIFY}`,
    
    // [游戏/下载/测速]
    `RULE-SET,SteamCN,${GROUPS.DIRECT}`,
    `RULE-SET,Epic,${GROUPS.GAMES}`,
    `RULE-SET,PT,${GROUPS.PT}`,           // PT 必须直连，禁止走代理
    `RULE-SET,Speedtest,${GROUPS.SPEEDTEST}`,
    `RULE-SET,GitHub,${GROUPS.SELECT}`,

    // [地区兜底] 非 CN 走代理，CN 走直连
    `RULE-SET,Geo_Not_CN,${GROUPS.SELECT}`,
    `RULE-SET,CN,${GROUPS.DIRECT}`,
    `RULE-SET,DirectList,${GROUPS.DIRECT}`,
    `RULE-SET,CN_IP,${GROUPS.DIRECT},no-resolve`,

    // [最终兜底]
    `MATCH,${GROUPS.SELECT}`
  ];
  return rules.filter(Boolean);
};


// ============================================================================
// 5. 策略组生成逻辑 (Proxy Groups)
// ============================================================================

// 国家与地区元数据配置 (正则 + Emoji)
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
 * 解析节点列表，生成结构化国家配置
 * [优化] 自动剥离 (?i) 前缀，确保 regex 兼容性
 */
function parseCountries(proxies) {
  const countryCounts = {};
  
  // 预编译正则对象
  const compiledMeta = Object.entries(countriesMeta).map(([key, meta]) => ({
    key,
    flag: meta.flag,
    // 输出给 Clash 配置的字符串 (去除 (?i))
    outputPattern: meta.pattern.replace(/^\(\?i\)/, ''), 
    // 脚本内部使用的正则对象
    regex: new RegExp(meta.pattern.replace(/^\(\?i\)/, ''), 'i')
  }));

  // 遍历节点统计
  for (const proxy of proxies) {
    const name = proxy.name || '';
    // 跳过明确标记为落地的节点
    if (REGEX_LANDING_ISOLATE.test(name)) continue;
    
    for (const meta of compiledMeta) {
      if (meta.regex.test(name)) {
        countryCounts[meta.key] = (countryCounts[meta.key] || 0) + 1;
        break; // 匹配到一个国家即停止
      }
    }
  }

  // 返回满足阈值的国家配置
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
 * 构建所有策略组
 * [优化] 包含兜底组逻辑，防止断网
 */
function buildProxyGroups(proxies, countryConfigs, hasLowCost) {
  const { landing, lb } = ARGS;
  const countryGroupNames = countryConfigs.map(c => c.name);

  // [兜底组] 如果无任何国家组生成，必须有此组兜底
  const fallbackAllGroup = [{ 
    name: GROUPS.OTHER, 
    type: "select", 
    "include-all": true 
  }];
  
  // [基础候选列表]
  const baseProxies = [
    GROUPS.FALLBACK,
    landing ? GROUPS.LANDING : null,
    ...countryGroupNames,
    GROUPS.OTHER, // 始终加入兜底组
    hasLowCost ? GROUPS.LOW_COST : null,
    GROUPS.MANUAL,
    "DIRECT"
  ].filter(Boolean);

  // [直连优先候选]
  const directFirstProxies = ["DIRECT", GROUPS.SELECT, ...baseProxies.filter(p => p !== "DIRECT" && p !== GROUPS.SELECT)];
  
  // [日本优先候选] (Crypto 专用)
  // 查找包含 🇯🇵 或 日本 的分组
  const japanGroup = countryConfigs.find(c => c.name.includes("🇯🇵") || c.name.includes("日本"));
  const cryptoProxies = japanGroup 
    ? [japanGroup.name, ...baseProxies.filter(n => n !== japanGroup.name)] 
    : [...baseProxies];

  // [媒体专用候选] (不含直连)
  const mediaProxies = [GROUPS.SELECT, ...countryGroupNames, GROUPS.MANUAL];

  // --- 1. 生成国家分组 ---
  const countryGroups = countryConfigs.map(config => {
    // 排除被隔离的节点
    const excludeFilter = landing 
      ? `(?i)${REGEX_LANDING_ISOLATE.source}|${REGEX_LOW_COST.source}` 
      : `(?i)${REGEX_LOW_COST.source}`;

    return {
      name: config.name,
      type: lb ? "load-balance" : "url-test",
      "include-all": true,
      filter: config.filter, 
      "exclude-filter": excludeFilter,
      interval: 600, tolerance: 100, lazy: true, // 600s 养老测速
      url: "https://cp.cloudflare.com/generate_204"
    };
  });

  // --- 2. 生成功能分组 ---
  const functionalGroups = [
    // [入口]
    { 
      name: GROUPS.SELECT, 
      type: "select", 
      proxies: [GROUPS.FALLBACK, ...countryGroupNames, GROUPS.OTHER, GROUPS.MANUAL, "DIRECT"] 
    },
    { name: GROUPS.MANUAL, type: "select", "include-all": true },
    // [自动优选]
    { 
      name: GROUPS.FALLBACK, 
      type: "url-test", 
      proxies: [landing ? GROUPS.LANDING : null, ...countryGroupNames, GROUPS.OTHER].filter(Boolean), 
      url: "https://cp.cloudflare.com/generate_204", 
      interval: 600, tolerance: 100, lazy: true 
    },
    
    // [业务应用]
    { name: GROUPS.AI,        type: "select", proxies: baseProxies },
    { name: GROUPS.TELEGRAM,  type: "select", proxies: baseProxies },
    { name: GROUPS.GOOGLE,    type: "select", proxies: baseProxies },
    { name: GROUPS.MICROSOFT, type: "select", proxies: baseProxies },
    { name: GROUPS.BING,      type: "select", proxies: directFirstProxies },
    { name: GROUPS.ONEDRIVE,  type: "select", proxies: baseProxies },
    { name: GROUPS.APPLE,     type: "select", proxies: directFirstProxies },
    
    // [媒体娱乐]
    { name: GROUPS.YOUTUBE,   type: "select", proxies: mediaProxies },
    { name: GROUPS.NETFLIX,   type: "select", proxies: mediaProxies },
    { name: GROUPS.DISNEY,    type: "select", proxies: mediaProxies },
    { name: GROUPS.SPOTIFY,   type: "select", proxies: mediaProxies },
    { name: GROUPS.TIKTOK,    type: "select", proxies: mediaProxies },
    
    // [其他]
    { name: GROUPS.GAMES,     type: "select", proxies: baseProxies },
    { name: GROUPS.CRYPTO,    type: "select", proxies: cryptoProxies },
    { name: GROUPS.PT,        type: "select", proxies: directFirstProxies },
    { name: GROUPS.SPEEDTEST, type: "select", proxies: directFirstProxies },

    // [广告与直连]
    { name: GROUPS.ADS,       type: "select", proxies: ["REJECT", "REJECT-DROP", GROUPS.DIRECT] },
    { name: GROUPS.DIRECT,    type: "select", proxies: ["DIRECT", GROUPS.SELECT] }
  ];

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
    "prefer-h3": false, // 关闭 H3 节省内存
    "enhanced-mode": fakeip ? "fake-ip" : "redir-host",
    listen: ":1053",
    "use-hosts": true,
    "fake-ip-range": "198.18.0.1/16",
    
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    nameserver: ["https://dns.alidns.com/dns-query", "https://doh.pub/dns-query"],
    fallback: ["https://1.1.1.1/dns-query", "https://8.8.8.8/dns-query"],
    
    // [Fake-IP 过滤] 强制这些域名返回真实 IP
    // 解决 Windows/Android 网络探测失败，以及直连服务的 IP 问题
    "fake-ip-filter": [
      // 系统网络探测
      "dns.msftncsi.com",
      "www.msftncsi.com",
      "www.msftconnecttest.com",
      "connectivitycheck.gstatic.com",
      
      // 游戏主机
      "*.xboxlive.com",
      "*.nintendo.net",
      "*.sonyentertainmentnetwork.com",
      
      // 强制直连的服务 (避免 FakeIP 污染)
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
  
  // 1. 检查是否有低倍率节点
  const hasLowCost = proxies.some(p => REGEX_LOW_COST.test(p.name));
  
  // 2. 解析节点，生成地区组配置
  const countryConfigs = parseCountries(proxies);
  
  // 3. 构建策略组
  const proxyGroups = buildProxyGroups(proxies, countryConfigs, hasLowCost);
  
  // 4. 构建分流规则
  const rules = buildRules(ARGS.quic);
  
  // 5. 构建 DNS 配置
  const dns = buildDnsConfig();

  // 6. 组装最终配置
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
    "tcp-concurrent": false, // 关闭 TCP 并发
    
    // 嗅探器配置 (解决 DNS 污染和 IP 识别问题)
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
