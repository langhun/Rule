/**
 * ============================================================================
 * Sub-Store 终极策略增强脚本 V5.2 (Deep Optimized)
 * ============================================================================
 * * [脚本核心功能]
 * 1. 动态拓扑：自动识别节点地区，生成对应的自动测速分组。
 * 2. 智能路由：
 * - Crypto -> 优先锁定 [日本节点] (低延迟交易)。
 * - Apple/Bing/PT/Speedtest -> 默认 [全球直连]，保留手动接管权限。
 * 3. 深度兼容：自动处理 JS 正则与 Clash YAML 格式差异，修复规则匹配 Bug。
 * 4. 性能压榨：
 * - 内存优化：关闭 TCP 并发 & DNS H3，使用二进制 MRS 规则集。
 * - 连接优化：全链路 Lazy 懒加载，5分钟心跳检测。
 * - 网络修复：内置 Fake-IP 过滤列表，解决系统网络探测失败问题。
 *
 * [使用参数 (Arguments)]
 * ipv6=true          // [默认开启] 强制开启 IPv6 解析
 * loadbalance=false  // [默认关闭] 负载均衡 (家用建议 false，使用 url-test)
 * landing=true       // [默认开启] 自动隔离 落地/家宽/高倍率 节点到单独分组
 * fakeip=true        // [默认开启] 开启 Fake-IP 模式 (极大提升浏览速度)
 * threshold=0        // [默认 0]  地区节点数量阈值 (少于此数量不生成独立国家组)
 */

// ============================================================================
// 1. 全局常量与参数解析 (Configuration)
// ============================================================================

const NODE_SUFFIX = "节点";

// [正则定义]
// JS正则字面量，用于脚本内部匹配节点名称
const REGEX_LOW_COST = /0\.[0-5]|低倍率|省流|大流量|实验性|公益/i;
const REGEX_LANDING  = /家宽|家庭|住宅|商宽|商业|ISP|星链|Starlink|落地/i;

// 策略组名称映射表 (集中管理，修改此处可一键变更 UI 显示名称)
const GROUPS = {
  // 基础组
  SELECT:     "🚀 节点选择",
  MANUAL:     "🎯 手动切换",
  FALLBACK:   "⚡ 自动切换",
  DIRECT:     "🎯 全球直连",
  LANDING:    "🏠 落地节点",
  LOW_COST:   "🐢 低倍率",
  
  // 业务组
  AI:         "🤖 AI服务",
  CRYPTO:     "💰 金融服务",    // 定制：优先日本
  APPLE:      "🍎 Apple",       // 定制：默认直连
  MICROSOFT:  "Ⓜ️ 微软服务",
  BING:       "🔍 Bing",        // 定制：默认直连
  ONEDRIVE:   "☁️ OneDrive",
  
  TELEGRAM:   "✈️ Telegram",
  YOUTUBE:    "📹 YouTube",
  NETFLIX:    "🎥 Netflix",
  DISNEY:     "🏰 Disney+",
  SPOTIFY:    "🎧 Spotify",
  TIKTOK:     "🎵 TikTok",
  
  STEAM:      "🚂 Steam",
  GAMES:      "🎮 游戏加速",
  PT:         "📦 PT下载",      // 定制：默认直连
  SPEEDTEST:  "📈 网络测速",    // 定制：默认直连
  ADS:        "🛑 广告拦截"
};

/**
 * 辅助函数：解析布尔参数
 */
function parseBool(value, defaultValue = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return defaultValue;
}

/**
 * 辅助函数：解析数值参数
 */
function parseNumber(value, defaultValue = 0) {
  if (value == null) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 构建特性开关对象
 */
function buildFeatureFlags(args) {
  return {
    ipv6Enabled:      parseBool(args.ipv6Enabled, true),      // 默认开启 IPv6
    loadBalance:      parseBool(args.loadBalance, false),     // 默认关闭负载均衡
    landing:          parseBool(args.landing, true),          // 默认开启落地隔离
    fullConfig:       parseBool(args.fullConfig, false),
    keepAliveEnabled: parseBool(args.keepAliveEnabled, false),
    fakeIPEnabled:    parseBool(args.fakeIPEnabled, true),    // 默认开启 FakeIP
    quicEnabled:      parseBool(args.quicEnabled, false),     // 默认关闭 QUIC (防限速)
    countryThreshold: parseNumber(args.threshold, 0)
  };
}

// 获取 Sub-Store 传入参数
const rawArgs = typeof $arguments !== 'undefined' ? $arguments : {};
const FLAGS = buildFeatureFlags(rawArgs);


// ============================================================================
// 2. 规则集配置 (Rule Providers)
// ============================================================================

// 使用 MetaCubeX 优化的二进制规则集 (MRS)，内存占用极低
const PROVIDERS_BASE = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo";

const ruleProviders = {
  // --- 核心规则 (Domain) ---
  "Private_Domain": { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/private.mrs` },
  "CN_Domain":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/cn.mrs` },
  "ADBlock":        { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: "https://adrules.top/adrules-mihomo.mrs" },
  "Geo_Not_CN":     { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/geolocation-!cn.mrs` },

  // --- 应用规则 (Domain) ---
  "AI_Domain":        { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/category-ai-!cn.mrs` },
  "Binance_Domain":   { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/binance.mrs` },
  "YouTube_Domain":   { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/youtube.mrs` },
  "Google_Domain":    { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/google.mrs` },
  "GitHub_Domain":    { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/github.mrs` },
  "Telegram_Domain":  { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/telegram.mrs` },
  "Netflix_Domain":   { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/netflix.mrs` },
  "Disney_Domain":    { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/disney.mrs` },
  "Spotify_Domain":   { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/spotify.mrs` },
  "TikTok_Domain":    { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/tiktok.mrs` },
  
  // --- 微软/苹果/其他 (Domain) ---
  "Microsoft_Domain": { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/microsoft.mrs` },
  "Bing_Domain":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/bing.mrs` },
  "OneDrive_Domain":  { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/onedrive.mrs` },
  "Apple_Domain":     { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/apple.mrs` },
  "AppleTV_Domain":   { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/apple-tvplus.mrs` },
  "SteamCN":          { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/steam@cn.mrs` },
  "Epic":             { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/epicgames.mrs` },
  "Speedtest":        { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/ookla-speedtest.mrs` },
  "PT_Domain":        { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geosite/category-pt.mrs` },
  "Direct_List":      { type: "http", behavior: "domain", format: "txt", interval: 86400, url: "https://raw.githubusercontent.com/Simondler/Surge/refs/heads/main/Direct.list" },

  // --- IP 规则 (IP-CIDR) ---
  // 用于解决 DNS 污染或某些仅通过 IP 访问的服务
  "CN_IP":        { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geo/geoip/cn.mrs` },
  "Private_IP":   { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geo/geoip/private.mrs` },
  "Binance_IP":   { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geo/geoip/binance.mrs` },
  "Google_IP":    { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geo/geoip/google.mrs` },
  "Telegram_IP":  { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geo/geoip/telegram.mrs` },
  "Netflix_IP":   { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geo/geoip/netflix.mrs` },
  "Apple_IP":     { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${PROVIDERS_BASE}/geo-lite/geoip/apple.mrs` }
};


// ============================================================================
// 3. 规则匹配逻辑 (Rules Construction)
// ============================================================================

const buildRules = ({ quicEnabled }) => {
  const rules = [
    // 1. 协议控制: 阻断 QUIC/UDP443 防止运营商限速
    !quicEnabled ? "AND,((DST-PORT,443),(NETWORK,UDP)),REJECT" : null,

    // 2. 基础拦截与隐私
    `RULE-SET,ADBlock,${GROUPS.ADS}`,
    `RULE-SET,Private_Domain,${GROUPS.DIRECT}`,
    `RULE-SET,Private_IP,${GROUPS.DIRECT},no-resolve`,

    // 3. 核心应用分流
    `RULE-SET,AI_Domain,${GROUPS.AI}`,
    
    // Crypto: 优先走定制的 CRYPTO 组 (默认日本)
    `RULE-SET,Binance_Domain,${GROUPS.CRYPTO}`,
    `RULE-SET,Binance_IP,${GROUPS.CRYPTO},no-resolve`,

    // Google & YouTube
    `RULE-SET,YouTube_Domain,${GROUPS.YOUTUBE}`,
    `RULE-SET,Google_Domain,${GROUPS.GOOGLE}`,
    `RULE-SET,Google_IP,${GROUPS.GOOGLE},no-resolve`,
    
    // 微软系 (Bing/OneDrive 独立)
    `RULE-SET,Bing_Domain,${GROUPS.BING}`,
    `RULE-SET,OneDrive_Domain,${GROUPS.ONEDRIVE}`,
    `RULE-SET,Microsoft_Domain,${GROUPS.MICROSOFT}`,
    
    // 苹果系 (定制直连)
    `RULE-SET,AppleTV_Domain,${GROUPS.APPLE}`,
    `RULE-SET,Apple_Domain,${GROUPS.APPLE}`,
    `RULE-SET,Apple_IP,${GROUPS.APPLE},no-resolve`,

    // 社交与流媒体
    `RULE-SET,Telegram_Domain,${GROUPS.TELEGRAM}`,
    `RULE-SET,Telegram_IP,${GROUPS.TELEGRAM},no-resolve`,
    `RULE-SET,TikTok_Domain,${GROUPS.TIKTOK}`,
    `RULE-SET,Netflix_Domain,${GROUPS.NETFLIX}`,
    `RULE-SET,Netflix_IP,${GROUPS.NETFLIX},no-resolve`,
    `RULE-SET,Disney_Domain,${GROUPS.DISNEY}`,
    `RULE-SET,Spotify_Domain,${GROUPS.SPOTIFY}`,
    
    // 游戏、下载与测速
    `RULE-SET,SteamCN,${GROUPS.DIRECT}`,
    `RULE-SET,Epic,${GROUPS.GAMES}`,
    `RULE-SET,PT_Domain,${GROUPS.PT}`,
    `RULE-SET,Speedtest,${GROUPS.SPEEDTEST}`,
    `RULE-SET,GitHub_Domain,${GROUPS.SELECT}`,

    // 4. 地区规则 (最后的防线)
    // 非中国大陆 IP/域名 -> 走节点选择
    `RULE-SET,Geo_Not_CN,${GROUPS.SELECT}`,
    // 中国大陆 IP/域名 -> 直连
    `RULE-SET,CN_Domain,${GROUPS.DIRECT}`,
    `RULE-SET,Direct_List,${GROUPS.DIRECT}`,
    `RULE-SET,CN_IP,${GROUPS.DIRECT},no-resolve`,

    // 5. 最终兜底
    `MATCH,${GROUPS.SELECT}`
  ];

  return rules.filter(Boolean);
};


// ============================================================================
// 4. 策略组生成逻辑 (Proxy Group Factory)
// ============================================================================

// 国家与地区元数据 (正则匹配规则 + 图标)
const countriesMeta = {
  // 热门区域
  "香港": { pattern: "(?i)香港|港|HK|Hong Kong|🇭🇰", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png" },
  "台湾": { pattern: "(?i)台湾|台|TW|Taiwan|🇹🇼", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Taiwan.png" },
  "日本": { pattern: "(?i)日本|东京|大阪|JP|Japan|🇯🇵", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png" },
  "新加坡": { pattern: "(?i)新加坡|坡|狮城|SG|Singapore|🇸🇬", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png" },
  "美国": { pattern: "(?i)美国|美|US|United States|🇺🇸", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png" },
  "韩国": { pattern: "(?i)韩国|KR|Korea|🇰🇷", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Korea.png" },
  
  // 补充区域
  "英国": { pattern: "(?i)英国|UK|United Kingdom|🇬🇧", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_Kingdom.png" },
  "德国": { pattern: "(?i)德国|DE|Germany|🇩🇪", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Germany.png" },
  "法国": { pattern: "(?i)法国|FR|France|🇫🇷", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/France.png" },
  "土耳其": { pattern: "(?i)土耳其|TR|Turkey|🇹🇷", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Turkey.png" },
  "阿根廷": { pattern: "(?i)阿根廷|AR|Argentina|🇦🇷", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Argentina.png" },
  "巴西": { pattern: "(?i)巴西|BR|Brazil|🇧🇷", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Brazil.png" }
};

/**
 * 核心逻辑：分析订阅节点，返回有效的国家组配置
 */
function parseCountries(proxies) {
  const countryCounts = {};
  const compiledRegex = {};
  
  // 预编译正则，提升性能
  for (const [country, meta] of Object.entries(countriesMeta)) {
    const cleanPattern = meta.pattern.replace(/^\(\?i\)/, '');
    compiledRegex[country] = new RegExp(cleanPattern, 'i');
  }

  // 遍历节点进行分类
  for (const proxy of proxies) {
    const name = proxy.name || '';
    if (REGEX_LANDING.test(name)) continue; // 跳过落地节点
    
    for (const [country, regex] of Object.entries(compiledRegex)) {
      if (regex.test(name)) {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
        break;
      }
    }
  }

  // 返回满足阈值的国家组名
  return Object.entries(countryCounts)
    .filter(([, count]) => count > FLAGS.countryThreshold)
    .map(([country]) => `${country}${NODE_SUFFIX}`);
}

/**
 * 组装所有策略组
 */
function buildProxyGroups(proxies, countryGroupNames) {
  const { landing, loadBalance, lowCost: hasLowCostNodes } = FLAGS;
  
  // 1. 构建全量候选列表
  const allProxies = [
    GROUPS.FALLBACK,
    landing ? GROUPS.LANDING : null,
    ...countryGroupNames,
    hasLowCostNodes ? GROUPS.LOW_COST : null,
    GROUPS.MANUAL,
    "DIRECT"
  ].filter(Boolean);

  // 2. [定制] 直连优先列表 (Direct First)
  // 将 DIRECT 放在首位，默认走直连，但允许手动切换到代理
  const directFirstProxies = [
    "DIRECT", 
    GROUPS.SELECT, 
    ...allProxies.filter(p => p !== "DIRECT" && p !== GROUPS.SELECT)
  ];

  // 3. [定制] 日本优先列表 (Japan First for Crypto)
  // 自动寻找名称包含"日本"的策略组
  const japanGroupName = countryGroupNames.find(n => n.includes("日本"));
  let cryptoProxies = [...allProxies];
  if (japanGroupName) {
    // 如果有日本组，将其置顶
    cryptoProxies = [japanGroupName, ...allProxies.filter(n => n !== japanGroupName)];
  }

  // 4. 媒体专用列表 (去除直连，避免流量偷跑)
  const mediaProxies = [GROUPS.SELECT, ...countryGroupNames, GROUPS.MANUAL];

  // --- 生成动态国家策略组 ---
  const countryGroups = countryGroupNames.map(groupName => {
    const country = groupName.replace(NODE_SUFFIX, "");
    const meta = countriesMeta[country];
    // 过滤正则：如果开启了落地隔离，则在国家组中排除落地节点
    const excludeFilter = landing 
      ? `(?i)${REGEX_LANDING.source}|${REGEX_LOW_COST.source}` 
      : `(?i)${REGEX_LOW_COST.source}`;

    return {
      name: groupName,
      type: loadBalance ? "load-balance" : "url-test",
      icon: meta ? meta.icon : undefined,
      "include-all": true,
      filter: meta ? meta.pattern : undefined,
      "exclude-filter": excludeFilter,
      interval: 300, tolerance: 50, lazy: true, 
      url: "https://cp.cloudflare.com/generate_204"
    };
  });

  // --- 生成固定功能策略组 ---
  const functionalGroups = [
    // 基础控制
    { 
      name: GROUPS.SELECT, type: "select", 
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png",
      proxies: [GROUPS.FALLBACK, ...countryGroupNames, GROUPS.MANUAL, "DIRECT"] 
    },
    { 
      name: GROUPS.MANUAL, type: "select", "include-all": true, 
      icon: "https://raw.githubusercontent.com/shindgewongxj/WHATSINStash/master/icon/select.png"
    },
    { 
      name: GROUPS.FALLBACK, type: "fallback", 
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Bypass.png",
      proxies: [landing ? GROUPS.LANDING : null, ...countryGroupNames, GROUPS.MANUAL].filter(Boolean),
      url: "https://cp.cloudflare.com/generate_204", interval: 300, tolerance: 50, lazy: true
    },
    
    // 核心业务
    { name: GROUPS.AI,       type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/powerfullz/override-rules/master/icons/chatgpt.png" },
    { name: GROUPS.TELEGRAM, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png" },
    { name: GROUPS.GOOGLE,   type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/powerfullz/override-rules/master/icons/Google.png" },
    
    // 微软系 (Bing 定制直连)
    { name: GROUPS.MICROSOFT, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png" },
    { name: GROUPS.BING,      type: "select", proxies: directFirstProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Bing.png" },
    { name: GROUPS.ONEDRIVE,  type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/OneDrive.png" },
    
    // 苹果系 (定制直连)
    { name: GROUPS.APPLE,     type: "select", proxies: directFirstProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple.png" },
    
    // 流媒体
    { name: GROUPS.YOUTUBE,   type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png" },
    { name: GROUPS.NETFLIX,   type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Netflix.png" },
    { name: GROUPS.DISNEY,    type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Disney.png" },
    { name: GROUPS.SPOTIFY,   type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Spotify.png" },
    { name: GROUPS.TIKTOK,    type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/TikTok.png" },
    
    // 其他业务
    { name: GROUPS.GAMES,     type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Game.png" },
    { name: GROUPS.CRYPTO,    type: "select", proxies: cryptoProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Cryptocurrency_3.png" },
    { name: GROUPS.PT,        type: "select", proxies: directFirstProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Download.png" },
    { name: GROUPS.SPEEDTEST, type: "select", proxies: directFirstProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Speedtest.png" },

    // 广告与兜底
    { name: GROUPS.ADS,       type: "select", proxies: ["REJECT", "REJECT-DROP", GROUPS.DIRECT], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/AdBlack.png" },
    { name: GROUPS.DIRECT,    type: "select", proxies: ["DIRECT", GROUPS.SELECT], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Direct.png" }
  ];

  // 动态追加 "落地节点" 组
  if (landing) {
    functionalGroups.push({
      name: GROUPS.LANDING, type: "select", "include-all": true,
      filter: `(?i)${REGEX_LANDING.source}`,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    });
  }
  
  // 动态追加 "低倍率" 组
  if (hasLowCostNodes) {
    functionalGroups.push({
      name: GROUPS.LOW_COST, type: "url-test", "include-all": true,
      filter: `(?i)${REGEX_LOW_COST.source}`,
      interval: 300, lazy: true,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Lab.png"
    });
  }

  return [...functionalGroups, ...countryGroups];
}


// ============================================================================
// 5. DNS 配置 (Network Layer)
// ============================================================================

function buildDnsConfig() {
  const { fakeIPEnabled, ipv6Enabled } = FLAGS;
  
  return {
    enable: true,
    ipv6: ipv6Enabled,   // 关键：开启 IPv6 解析
    "prefer-h3": false,  // 关键：关闭 H3 节省内存
    "enhanced-mode": fakeIPEnabled ? "fake-ip" : "redir-host",
    listen: ":1053",
    "use-hosts": true,
    "fake-ip-range": "198.18.0.1/16",
    
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    nameserver: [
      "https://dns.alidns.com/dns-query",
      "https://doh.pub/dns-query"
    ],
    fallback: [
      "https://1.1.1.1/dns-query",
      "https://8.8.8.8/dns-query"
    ],
    // 关键：Fake-IP 模式下必须过滤的域名，防止网络连通性检测失败
    "fake-ip-filter": [
      "dns.msftncsi.com",
      "www.msftncsi.com",
      "www.msftconnecttest.com",
      "connectivitycheck.gstatic.com",
      "*.xboxlive.com",
      "*.nintendo.net",
      "*.sonyentertainmentnetwork.com"
    ],
    // 关键：防止国内域名被解析为国外 IP
    "fallback-filter": {
      geoip: true,
      "geoip-code": "CN",
      ipcidr: ["240.0.0.0/4"]
    },
    // 精细化 DNS 分流
    "nameserver-policy": {
      "private,apple,steam,microsoft@cn": [
        "https://dns.alidns.com/dns-query", 
        "https://doh.pub/dns-query"
      ],
      "geosite:geolocation-!cn,gfw,google,youtube,telegram": [
        "https://1.1.1.1/dns-query", 
        "https://8.8.8.8/dns-query"
      ]
    }
  };
}


// ============================================================================
// 6. 主程序入口 (Main Entry)
// ============================================================================

function main(config) {
  if (!config || !config.proxies) {
    console.log("⚠️ 错误: 配置文件为空或未找到代理节点。");
    return config || {};
  }

  const proxies = config.proxies;
  FLAGS.lowCost = proxies.some(p => REGEX_LOW_COST.test(p.name));
  
  // 1. 解析节点，生成地区组名列表
  const countryGroupNames = parseCountries(proxies);
  
  // 2. 构建策略组
  const proxyGroups = buildProxyGroups(proxies, countryGroupNames);
  
  // 3. 构建分流规则
  const rules = buildRules(FLAGS);
  
  // 4. 构建 DNS
  const dns = buildDnsConfig();

  // 5. 组装最终配置
  const result = {
    ...config,
    "proxy-groups": proxyGroups,
    "rule-providers": ruleProviders,
    rules: rules,
    dns: dns,
    
    "mixed-port": 7890,
    ipv6: FLAGS.ipv6Enabled,
    "allow-lan": true,
    "unified-delay": true,
    "tcp-concurrent": false, // [关键] 关闭并发
    
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

  // 如果开启 Full Config 模式，设置日志等级
  if (FLAGS.fullConfig) {
    result["log-level"] = "info";
  }

  return result;
}