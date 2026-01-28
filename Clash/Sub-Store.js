/**
 * Sub-Store 订阅增强脚本 (策略定制 & 深度优化版)
 *
 * [脚本核心功能]
 * 1. 动态策略生成：自动识别节点地区，并生成对应的自动测速分组。
 * 2. 定制化路由：
 * - Crypto (加密货币) -> 优先自动选择 [日本节点]，若无则走节点选择。
 * - Apple/Bing/PT/Speedtest -> 默认 [全球直连] (DIRECT)，但保留手动切换能力。
 * 3. 深度兼容修复：自动处理 JS 正则与 Clash YAML 正则格式的差异。
 * 4. 性能优化：关闭 HTTP/3 DNS，开启 Lazy 懒加载测速，降低内存与连接数占用。
 *
 * [推荐参数 (Arguments)]
 * ipv6=true          // 强制开启 IPv6 (脚本已默认开启)
 * loadbalance=false  // 负载均衡 (建议 false，家用推荐 url-test)
 * landing=true       // 自动识别并隔离 落地/家宽/高倍率 节点
 * fakeip=true        // 开启 Fake-IP 模式 (强烈建议开启以提升响应速度)
 */

// ============================================================================
// 1. 全局常量定义与参数解析
// ============================================================================

const NODE_SUFFIX = "节点";

// [正则说明] 
// JS 中使用 /pattern/i 表示不区分大小写。
// 在生成 Clash YAML 配置时，我们需要将其转换为字符串格式 `(?i)...` 以便核心识别。
const REGEX_LOW_COST = /0\.[0-5]|低倍率|省流|大流量|实验性/i;
const REGEX_LANDING = /家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地/i;

// 策略组名称映射 (集中管理，方便后续统一修改名称)
const GROUPS = {
  SELECT:     "节点选择",
  MANUAL:     "手动切换",
  FALLBACK:   "自动切换",
  DIRECT:     "全球直连",
  LANDING:    "落地节点",
  LOW_COST:   "低倍率节点",
  
  // 应用分组
  AI:         "AI服务",
  CRYPTO:     "Crypto",     // [定制] 默认日本
  APPLE:      "Apple",      // [定制] 默认直连
  GOOGLE:     "Google",
  MICROSOFT:  "Microsoft",
  BING:       "Bing",       // [定制] 默认直连
  ONEDRIVE:   "OneDrive",
  TELEGRAM:   "Telegram",
  YOUTUBE:    "YouTube",
  NETFLIX:    "Netflix",
  DISNEY:     "Disney+",
  SPOTIFY:    "Spotify",
  TIKTOK:     "TikTok",
  STEAM:      "Steam",
  GAMES:      "Games",
  PT:         "PT下载",     // [定制] 默认直连
  SPEEDTEST:  "Speedtest",  // [定制] 默认直连
  ADS:        "广告拦截"
};

/**
 * 工具函数：解析布尔值参数
 */
function parseBool(value, defaultValue = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return defaultValue;
}

/**
 * 工具函数：解析数值参数
 */
function parseNumber(value, defaultValue = 0) {
  if (value === null || typeof value === 'undefined') return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 构建功能开关 (Feature Flags)
 */
function buildFeatureFlags(args) {
  // 默认开启 IPv6，除非用户显式关闭
  const ipv6Enabled = parseBool(args.ipv6Enabled, true);

  const spec = {
    loadbalance: "loadBalance",
    landing:     "landing",
    full:        "fullConfig",
    keepalive:   "keepAliveEnabled",
    fakeip:      "fakeIPEnabled",
    quic:        "quicEnabled"
  };

  const flags = Object.entries(spec).reduce((acc, [sourceKey, targetKey]) => {
    acc[targetKey] = parseBool(args[sourceKey], false);
    return acc;
  }, {});
  
  flags.ipv6Enabled = ipv6Enabled;
  flags.countryThreshold = parseNumber(args.threshold, 0);
  return flags;
}

// 获取 Sub-Store 传入的参数
const rawArgs = typeof $arguments !== 'undefined' ? $arguments : {};
const FLAGS = buildFeatureFlags(rawArgs);


// ============================================================================
// 2. 规则集配置 (Rule Providers)
// ============================================================================

// 使用 MetaCubeX 的规则集，格式为 mrs (二进制)，加载速度快且占用内存小
const PROVIDERS_BASE_URL = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo";

const ruleProviders = {
  // --- 域名规则 (Domain) ---
  "Private_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/private.mrs`
  },
  "Speedtest_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/ookla-speedtest.mrs`
  },
  "AI_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/category-ai-!cn.mrs`
  },
  "Bing_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/bing.mrs`
  },
  "OneDrive_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/onedrive.mrs`
  },
  "Binance_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/binance.mrs`
  },
  "PT_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/category-pt.mrs`
  },
  "GitHub_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/github.mrs`
  },
  "YouTube_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/youtube.mrs`
  },
  "Google_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/google.mrs`
  },
  "Microsoft_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/microsoft.mrs`
  },
  "AppleTV_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/apple-tvplus.mrs`
  },
  "Apple_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/apple.mrs`
  },
  "TikTok_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/tiktok.mrs`
  },
  "Twitter_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/twitter.mrs`
  },
  "Telegram_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/telegram.mrs`
  },
  "Netflix_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/netflix.mrs`
  },
  "Disney_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/disney.mrs`
  },
  "Spotify_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/spotify.mrs`
  },
  "PayPal_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/paypal.mrs`
  },
  "Geolocation_Not_CN": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/geolocation-!cn.mrs`
  },
  "CN_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/cn.mrs`
  },
  "SteamCN": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400, 
    url: `${PROVIDERS_BASE_URL}/geosite/steam@cn.mrs`
  },
  "Epic": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/epicgames.mrs`
  },
  "ADBlock": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: "https://adrules.top/adrules-mihomo.mrs"
  },
  "Direct": {
    type: "http", behavior: "domain", format: "txt", interval: 86400,
    url: "https://raw.githubusercontent.com/Simondler/Surge/refs/heads/main/Direct.list"
  },

  // --- IP 规则 (IPCIDR) ---
  "Binance_IP": {
    type: "http", behavior: "ipcidr", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geo/geoip/binance.mrs` 
  },
  "Apple_IP": {
    type: "http", behavior: "ipcidr", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geo-lite/geoip/apple.mrs`
  },
  "Private_IP": {
    type: "http", behavior: "ipcidr", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geo/geoip/private.mrs`
  },
  "Google_IP": {
    type: "http", behavior: "ipcidr", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geo/geoip/google.mrs`
  },
  "Telegram_IP": {
    type: "http", behavior: "ipcidr", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geo/geoip/telegram.mrs`
  },
  "Twitter_IP": {
    type: "http", behavior: "ipcidr", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geo/geoip/twitter.mrs`
  },
  "Netflix_IP": {
    type: "http", behavior: "ipcidr", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geo/geoip/netflix.mrs`
  },
  "CN_IP": {
    type: "http", behavior: "ipcidr", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geo/geoip/cn.mrs`
  }
};


// ============================================================================
// 3. 规则匹配逻辑 (Rules)
// ============================================================================

const buildRules = ({ quicEnabled }) => {
  const rules = [
    // 1. QUIC 协议控制 (建议屏蔽以防 UDP 限速)
    !quicEnabled ? "AND,((DST-PORT,443),(NETWORK,UDP)),REJECT" : null,

    // 2. 广告拦截
    `RULE-SET,ADBlock,${GROUPS.ADS}`,
    
    // 3. 隐私与局域网 (no-resolve 避免 DNS 污染)
    `RULE-SET,Private_Domain,${GROUPS.DIRECT}`,
    `RULE-SET,Private_IP,${GROUPS.DIRECT},no-resolve`,

    // 4. PT下载 (直连)
    `RULE-SET,PT_Domain,${GROUPS.PT}`,

    // 5. 应用分流
    `RULE-SET,AI_Domain,${GROUPS.AI}`,
    
    // Crypto (Binance 等) -> 优先日本
    `RULE-SET,Binance_Domain,${GROUPS.CRYPTO}`,
    `RULE-SET,Binance_IP,${GROUPS.CRYPTO},no-resolve`,

    // 常用应用
    `RULE-SET,GitHub_Domain,${GROUPS.SELECT}`,
    `RULE-SET,YouTube_Domain,${GROUPS.YOUTUBE}`,
    `RULE-SET,Google_Domain,${GROUPS.GOOGLE}`,
    `RULE-SET,Google_IP,${GROUPS.GOOGLE},no-resolve`,
    
    // 独立分组 (微软系)
    `RULE-SET,Bing_Domain,${GROUPS.BING}`,
    `RULE-SET,OneDrive_Domain,${GROUPS.ONEDRIVE}`,
    `RULE-SET,Microsoft_Domain,${GROUPS.MICROSOFT}`,
    
    // 苹果服务 (Apple TV + Apple)
    `RULE-SET,AppleTV_Domain,${GROUPS.APPLE}`,
    `RULE-SET,Apple_Domain,${GROUPS.APPLE}`,
    `RULE-SET,Apple_IP,${GROUPS.APPLE},no-resolve`,

    // 社交软件
    `RULE-SET,Telegram_Domain,${GROUPS.TELEGRAM}`,
    `RULE-SET,Telegram_IP,${GROUPS.TELEGRAM},no-resolve`,
    `RULE-SET,Twitter_Domain,${GROUPS.SELECT}`,
    `RULE-SET,Twitter_IP,${GROUPS.SELECT},no-resolve`,
    `RULE-SET,TikTok_Domain,${GROUPS.TIKTOK}`,

    // 流媒体
    `RULE-SET,Netflix_Domain,${GROUPS.NETFLIX}`,
    `RULE-SET,Netflix_IP,${GROUPS.NETFLIX},no-resolve`,
    `RULE-SET,Disney_Domain,${GROUPS.DISNEY}`,
    `RULE-SET,Spotify_Domain,${GROUPS.SPOTIFY}`,
    
    // 游戏与支付
    `RULE-SET,SteamCN,${GROUPS.DIRECT}`,
    `RULE-SET,Epic,${GROUPS.GAMES}`,
    `RULE-SET,Speedtest_Domain,${GROUPS.SPEEDTEST}`, 
    `RULE-SET,PayPal_Domain,${GROUPS.DIRECT}`,

    // 6. 区域规则 (非CN走代理，CN走直连)
    `RULE-SET,Geolocation_Not_CN,${GROUPS.SELECT}`,
    `RULE-SET,CN_Domain,${GROUPS.DIRECT}`,
    `RULE-SET,Direct,${GROUPS.DIRECT}`,
    `RULE-SET,CN_IP,${GROUPS.DIRECT},no-resolve`,

    // 7. 兜底策略
    `MATCH,${GROUPS.SELECT}`
  ];

  return rules.filter(Boolean);
};


// ============================================================================
// 4. 策略组生成逻辑 (Proxy Groups)
// ============================================================================

// 国家地区元数据 (正则 + 图标)
const countriesMeta = {
  // --- 常见地区 ---
  "香港": { pattern: "(?i)香港|港|HK|hk|Hong Kong|HongKong|hongkong|🇭🇰", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png" },
  "澳门": { pattern: "(?i)澳门|MO|Macau|🇲🇴", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Macao.png" },
  "台湾": { pattern: "(?i)台|新北|彰化|TW|Taiwan|🇹🇼", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Taiwan.png" },
  "狮城": { pattern: "(?i)新加坡|坡|狮城|SG|Singapore|🇸🇬", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png" },
  "日本": { pattern: "(?i)日本|川日|东京|大阪|泉日|埼玉|沪日|深日|JP|Japan|🇯🇵", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png" },
  "韩国": { pattern: "(?i)KR|Korea|KOR|首尔|韩|韓|🇰🇷", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Korea.png" },
  "美国": { pattern: "(?i)美国|美|US|United States|🇺🇸", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png" },
  "枫叶": { pattern: "(?i)加拿大|Canada|CA|🇨🇦", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Canada.png" },
  "英国": { pattern: "(?i)英国|United Kingdom|UK|伦敦|London|🇬🇧", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_Kingdom.png" },
  "袋鼠": { pattern: "(?i)澳洲|澳大利亚|AU|Australia|🇦🇺", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Australia.png" },
  "德国": { pattern: "(?i)德国|德|DE|Germany|🇩🇪", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Germany.png" },
  "法国": { pattern: "(?i)法国|法|FR|France|🇫🇷", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/France.png" },
  "毛子": { pattern: "(?i)俄罗斯|俄|RU|Russia|🇷🇺", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Russia.png" },
  "泰国": { pattern: "(?i)泰国|泰|TH|Thailand|🇹🇭", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Thailand.png" },
  "印度": { pattern: "(?i)印度|IN|India|🇮🇳", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/India.png" },
  "大马": { pattern: "(?i)马来西亚|马来|MY|Malaysia|🇲🇾", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Malaysia.png" },

  // --- 补充地区 (土耳其/阿根廷等低价区) ---
  "土耳其": { pattern: "(?i)土耳其|土|Turkey|TR|🇹🇷", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Turkey.png" },
  "阿根廷": { pattern: "(?i)阿根廷|Argentina|AR|🇦🇷", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Argentina.png" },
  "越南": { pattern: "(?i)越南|Vietnam|VN|🇻🇳", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Vietnam.png" },
  "菲律宾": { pattern: "(?i)菲律宾|Philippines|PH|🇵🇭", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Philippines.png" },
  "巴西": { pattern: "(?i)巴西|Brazil|BR|🇧🇷", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Brazil.png" },
  "印尼": { pattern: "(?i)印尼|印度尼西亚|Indonesia|ID|🇮🇩", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Indonesia.png" },
  "荷兰": { pattern: "(?i)荷兰|Netherlands|NL|🇳🇱", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Netherlands.png" },
  "意大利": { pattern: "(?i)意大利|Italy|IT|🇮🇹", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Italy.png" },
};

/**
 * 统计节点地区，返回存在的地区组名列表
 */
function parseCountries(proxies) {
  const countryCounts = {};
  const compiledRegex = {};
  
  // 预编译正则：移除字符串中的 (?i) 以兼容 JS 引擎
  for (const [country, meta] of Object.entries(countriesMeta)) {
    const cleanPattern = meta.pattern.replace(/^\(\?i\)/, '');
    compiledRegex[country] = new RegExp(cleanPattern, 'i');
  }

  for (const proxy of proxies) {
    const name = proxy.name || '';
    if (REGEX_LANDING.test(name)) continue; // 跳过落地/家宽节点
    for (const [country, regex] of Object.entries(compiledRegex)) {
      if (regex.test(name)) {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
        break;
      }
    }
  }

  // 过滤出节点数大于阈值的地区
  return Object.entries(countryCounts)
    .filter(([, count]) => count > FLAGS.countryThreshold)
    .map(([country]) => `${country}${NODE_SUFFIX}`);
}

/**
 * 构建所有策略组
 */
function buildProxyGroups(proxies, countryGroupNames) {
  const { landing, loadBalance, lowCost: hasLowCostNodes } = FLAGS;
  
  // 1. 基础候选列表 (包含所有自动组 + 手动组)
  const allProxies = [
    GROUPS.FALLBACK,
    landing ? GROUPS.LANDING : null,
    ...countryGroupNames,
    hasLowCostNodes ? GROUPS.LOW_COST : null,
    GROUPS.MANUAL,
    "DIRECT"
  ].filter(Boolean);

  // 2. [定制逻辑] 默认直连的候选列表
  // 原理：将 "DIRECT" 放在第一位，若不手动选择其他，则流量默认走直连
  const directFirstProxies = [
    "DIRECT", 
    GROUPS.SELECT, 
    ...allProxies.filter(p => p !== "DIRECT" && p !== GROUPS.SELECT)
  ];

  // 3. [定制逻辑] Crypto 优先寻找日本节点
  // 原理：在地区组中查找含“日本”的组名，若存在，将其置于首位
  const japanGroupName = countryGroupNames.find(n => n.includes("日本"));
  let cryptoProxies = [...allProxies];
  if (japanGroupName) {
    cryptoProxies = [
      japanGroupName, 
      ...allProxies.filter(n => n !== japanGroupName)
    ];
  }

  // 4. 媒体专用列表 (不包含直连，避免流量跑流量)
  const mediaProxies = [GROUPS.SELECT, ...countryGroupNames, GROUPS.MANUAL];

  // --- 生成自动国家分组 ---
  const countryGroups = countryGroupNames.map(groupName => {
    const country = groupName.replace(NODE_SUFFIX, "");
    const meta = countriesMeta[country];
    // 排除过滤逻辑：如果是落地组开启，则排除落地节点；始终排除低倍率节点
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
      interval: 300, tolerance: 50, lazy: true, url: "https://cp.cloudflare.com/generate_204"
    };
  });

  // --- 生成固定功能策略组 ---
  const functionalGroups = [
    // 核心控制组
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
    
    // 综合应用组
    { name: GROUPS.AI, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/powerfullz/override-rules/master/icons/chatgpt.png" },
    { name: GROUPS.TELEGRAM, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png" },
    { name: GROUPS.GOOGLE, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/powerfullz/override-rules/master/icons/Google.png" },
    
    // 微软系 (Bing 独立)
    { name: GROUPS.MICROSOFT, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png" },
    { 
      name: GROUPS.BING, type: "select", 
      proxies: directFirstProxies, // [默认直连]
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Bing.png" 
    },
    { name: GROUPS.ONEDRIVE, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/OneDrive.png" },
    
    // 苹果系 (独立且默认直连)
    { 
      name: GROUPS.APPLE, type: "select", 
      proxies: directFirstProxies, // [默认直连]
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple.png" 
    },
    
    // 媒体组
    { name: GROUPS.YOUTUBE, type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png" },
    { name: GROUPS.NETFLIX, type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Netflix.png" },
    { name: GROUPS.DISNEY, type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Disney.png" },
    { name: GROUPS.SPOTIFY, type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Spotify.png" },
    { name: GROUPS.TIKTOK, type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/TikTok.png" },
    
    // 游戏与金融
    { name: GROUPS.GAMES, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Game.png" },
    
    // Crypto (默认日本)
    { 
      name: GROUPS.CRYPTO, type: "select", 
      proxies: cryptoProxies, // [默认日本]
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Cryptocurrency_3.png" 
    },
    
    // PT 下载 (默认直连)
    { 
      name: GROUPS.PT, type: "select", 
      proxies: directFirstProxies, 
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Download.png" 
    },
    
    // Speedtest (默认直连)
    { 
      name: GROUPS.SPEEDTEST, type: "select", 
      proxies: directFirstProxies, 
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Speedtest.png" 
    },

    // 广告拦截与直连
    { 
      name: GROUPS.ADS, type: "select", 
      proxies: ["REJECT", "REJECT-DROP", GROUPS.DIRECT], 
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/AdBlack.png" 
    },
    { 
      name: GROUPS.DIRECT, type: "select", 
      proxies: ["DIRECT", GROUPS.SELECT], 
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Direct.png" 
    }
  ];

  // 动态追加可选分组
  if (landing) {
    functionalGroups.push({
      name: GROUPS.LANDING, type: "select", "include-all": true,
      filter: `(?i)${REGEX_LANDING.source}`,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    });
  }
  
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
// 5. DNS 配置 (DNS)
// ============================================================================

function buildDnsConfig() {
  const { fakeIPEnabled, ipv6Enabled } = FLAGS;
  
  return {
    enable: true,
    ipv6: ipv6Enabled,
    "prefer-h3": false, // [性能优化] 设为 false 以保持内存稳定
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
    // 防止 Fake-IP 模式下返回国外 IP 导致访问国内变慢
    "fallback-filter": {
      geoip: true,
      "geoip-code": "CN",
      ipcidr: ["240.0.0.0/4"]
    },
    
    // DNS 分流策略：指定域名使用指定 DNS
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
// 6. 主程序入口 (Main)
// ============================================================================

function main(config) {
  if (!config || !config.proxies) {
    console.log("⚠️ 错误: 配置文件为空或未找到代理节点。");
    return config || {};
  }

  const proxies = config.proxies;
  FLAGS.lowCost = proxies.some(p => REGEX_LOW_COST.test(p.name));
  
  const countryGroupNames = parseCountries(proxies);
  const proxyGroups = buildProxyGroups(proxies, countryGroupNames);
  const rules = buildRules(FLAGS);
  const dns = buildDnsConfig();

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
    "tcp-concurrent": false, // [性能优化] 关闭并发
    
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

  if (FLAGS.fullConfig) {
    result["log-level"] = "info";
  }

  return result;
}