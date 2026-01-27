/**
 * Powerfullz Sub-Store 订阅增强脚本 (完整优化版)
 * * 功能亮点：
 * 1. 规则全集：集成 MetaCubeX 高质量规则集 (Domain + IP)。
 * 2. 策略对齐：自动生成与规则对应的策略组。
 * 3. IPv6 优化：默认开启 IPv6 及 DNS AAAA 解析。
 * 4. 逻辑清晰：详尽的中文注释，标准化的命名规范。
 * * 推荐参数 (Arguments):
 * ipv6=true        // 强制开启 IPv6 (默认开启)
 * loadbalance=false // 负载均衡 (建议 false)
 * landing=true     // 识别落地/家宽节点
 * fakeip=true      // 开启 Fake-IP (强烈建议开启)
 * quic=false       // 屏蔽 QUIC (UDP)
 */

// ============================================================================
// 1. 全局配置与工具函数
// ============================================================================

// 节点名称后缀常量
const NODE_SUFFIX = "节点";

// 正则表达式：用于筛选低倍率、家宽、落地节点
const REGEX_LOW_COST = /0\.[0-5]|低倍率|省流|大流量|实验性/i;
const REGEX_LANDING = /(?i:)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地/;

// 核心策略组名称定义
const GROUPS = {
  SELECT:   "节点选择", // 主手动选择
  MANUAL:   "手动切换", // 二级手动选择
  FALLBACK: "自动切换", // 自动测试延迟最低
  DIRECT:   "全球直连", // 不走代理
  LANDING:  "落地节点", // 家宽/ISP 专用组
  LOW_COST: "低倍率节点", // 0.x 倍率专用组
  AI:       "AI服务",
  CRYPTO:   "Crypto",
  APPLE:    "Apple",
  GOOGLE:   "Google",
  MICROSOFT:"Microsoft",
  TELEGRAM: "Telegram",
  YOUTUBE:  "YouTube",
  NETFLIX:  "Netflix",
  DISNEY:   "Disney+",
  SPOTIFY:  "Spotify",
  TIKTOK:   "TikTok",
  STEAM:    "Steam",
  GAMES:    "Games",
  ADS:      "广告拦截"
};

/**
 * 解析布尔值参数
 */
function parseBool(value, defaultValue = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return defaultValue;
}

/**
 * 解析数值参数
 */
function parseNumber(value, defaultValue = 0) {
  if (value === null || typeof value === 'undefined') return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 构建功能开关标志
 */
function buildFeatureFlags(args) {
  const ipv6Enabled = parseBool(args.ipv6Enabled, true); // 默认开启 IPv6

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
  
  flags.ipv6Enabled = ipv6Enabled;
  flags.countryThreshold = parseNumber(args.threshold, 0);
  return flags;
}

// 获取脚本传入参数
const rawArgs = typeof $arguments !== 'undefined' ? $arguments : {};
const FLAGS = buildFeatureFlags(rawArgs);


// ============================================================================
// 2. 规则集定义 (Rule Providers)
// ============================================================================
// 使用 MetaCubeX 官方 .mrs 二进制规则，性能更佳
// 格式统一为: Name_Type (Domain/IP)

const PROVIDERS_BASE_URL = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo";

const ruleProviders = {
  // --- 1. 域名类规则 (Domain) ---
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
  "OneDrive_Domain": {
    type: "http", behavior: "domain", format: "mrs", interval: 86400,
    url: `${PROVIDERS_BASE_URL}/geosite/onedrive.mrs`
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
  // 补充常用
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

  // --- 2. IP 类规则 (IPCIDR) ---
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
    // 1. QUIC 阻断 (如果未开启 QUIC，拦截 UDP 443)
    !quicEnabled ? "AND,((DST-PORT,443),(NETWORK,UDP)),REJECT" : null,

    // 2. 基础反恐与广告
    `RULE-SET,ADBlock,${GROUPS.ADS}`,
    
    // 3. 隐私与局域网 (直连)
    `RULE-SET,Private_Domain,${GROUPS.DIRECT}`,
    `RULE-SET,Private_IP,${GROUPS.DIRECT},no-resolve`,

    // 4. 重点应用分流
    `RULE-SET,AI_Domain,${GROUPS.AI}`,
    `RULE-SET,GitHub_Domain,${GROUPS.SELECT}`, // Github 经常需要代理
    `RULE-SET,YouTube_Domain,${GROUPS.YOUTUBE}`,
    `RULE-SET,Google_Domain,${GROUPS.GOOGLE}`,
    `RULE-SET,Google_IP,${GROUPS.GOOGLE},no-resolve`,
    
    // 微软与苹果
    `RULE-SET,OneDrive_Domain,${GROUPS.MICROSOFT}`,
    `RULE-SET,Microsoft_Domain,${GROUPS.MICROSOFT}`,
    `RULE-SET,AppleTV_Domain,${GROUPS.APPLE}`,
    `RULE-SET,Apple_Domain,${GROUPS.APPLE}`,
    `RULE-SET,Apple_IP,${GROUPS.APPLE},no-resolve`,

    // 社交与媒体
    `RULE-SET,Telegram_Domain,${GROUPS.TELEGRAM}`,
    `RULE-SET,Telegram_IP,${GROUPS.TELEGRAM},no-resolve`,
    `RULE-SET,Twitter_Domain,${GROUPS.SELECT}`, // Twitter 归入 Select 或新建组
    `RULE-SET,Twitter_IP,${GROUPS.SELECT},no-resolve`,
    `RULE-SET,TikTok_Domain,${GROUPS.TIKTOK}`,
    `RULE-SET,Netflix_Domain,${GROUPS.NETFLIX}`,
    `RULE-SET,Netflix_IP,${GROUPS.NETFLIX},no-resolve`,
    `RULE-SET,Disney_Domain,${GROUPS.DISNEY}`,
    `RULE-SET,Spotify_Domain,${GROUPS.SPOTIFY}`,
    
    // 游戏与工具
    `RULE-SET,SteamCN,${GROUPS.DIRECT}`,
    `RULE-SET,Epic,${GROUPS.GAMES}`,
    `RULE-SET,Speedtest_Domain,${GROUPS.DIRECT}`, // 测速建议直连
    `RULE-SET,PayPal_Domain,${GROUPS.DIRECT}`,    // 支付风控建议直连

    // 5. 非 CN 地区与 CN 地区逻辑
    `RULE-SET,Geolocation_Not_CN,${GROUPS.SELECT}`,
    `RULE-SET,CN_Domain,${GROUPS.DIRECT}`,
    `RULE-SET,CN_IP,${GROUPS.DIRECT},no-resolve`,

    // 6. 兜底策略
    `MATCH,${GROUPS.SELECT}`
  ];

  return rules.filter(Boolean); // 过滤掉 null/undefined
};


// ============================================================================
// 4. 国家与地区策略组生成逻辑
// ============================================================================

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
  // 可根据需要添加更多国家...
};

// 辅助函数：构建列表
const buildList = (...elements) => elements.flat().filter(Boolean);

// 统计国家节点
function parseCountries(proxies) {
  const countryCounts = {};
  const compiledRegex = {};
  
  // 预编译正则
  for (const [country, meta] of Object.entries(countriesMeta)) {
    compiledRegex[country] = new RegExp(meta.pattern.replace(/^\(\?i\)/, ''), 'i');
  }

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

  return Object.entries(countryCounts)
    .filter(([, count]) => count > FLAGS.countryThreshold) // 过滤掉节点数太少的国家
    .map(([country]) => `${country}${NODE_SUFFIX}`);
}

// 移除节点后缀
const stripSuffix = (names) => names.map(n => n.replace(new RegExp(`${NODE_SUFFIX}$`), ""));

/**
 * 构建所有策略组
 */
function buildProxyGroups(proxies, countryGroupNames) {
  const { landing, loadBalance, lowCost: hasLowCostNodes } = FLAGS;
  
  // 1. 定义基础候选列表
  const allProxies = [
    GROUPS.FALLBACK,
    landing ? GROUPS.LANDING : null,
    ...countryGroupNames,
    hasLowCostNodes ? GROUPS.LOW_COST : null,
    GROUPS.MANUAL,
    "DIRECT" // 部分场景允许直连
  ].filter(Boolean);

  // 媒体组优先列表 (包含手动选择)
  const mediaProxies = [
    GROUPS.SELECT,
    ...countryGroupNames,
    GROUPS.MANUAL
  ];

  // 2. 生成国家策略组配置
  const countryGroups = countryGroupNames.map(groupName => {
    const country = groupName.replace(NODE_SUFFIX, "");
    const meta = countriesMeta[country];
    return {
      name: groupName,
      type: loadBalance ? "load-balance" : "url-test",
      icon: meta ? meta.icon : undefined,
      "include-all": true,
      filter: meta ? meta.pattern : undefined,
      "exclude-filter": landing ? `${REGEX_LANDING.source}|${REGEX_LOW_COST.source}` : REGEX_LOW_COST.source,
      interval: 300, tolerance: 50, lazy: true, url: "https://cp.cloudflare.com/generate_204"
    };
  });

  // 3. 生成功能性策略组
  const functionalGroups = [
    // 核心选择组
    { 
      name: GROUPS.SELECT, type: "select", 
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png",
      proxies: [GROUPS.FALLBACK, ...countryGroupNames, GROUPS.MANUAL, "DIRECT"] 
    },
    { 
      name: GROUPS.MANUAL, type: "select", "include-all": true, 
      icon: "https://raw.githubusercontent.com/shindgewongxj/WHATSINStash/master/icon/select.png"
    },
    // 自动选择组
    { 
      name: GROUPS.FALLBACK, type: "fallback", 
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Bypass.png",
      proxies: [landing ? GROUPS.LANDING : null, ...countryGroupNames, GROUPS.MANUAL].filter(Boolean),
      url: "https://cp.cloudflare.com/generate_204", interval: 300, tolerance: 50, lazy: true
    },
    // 应用特定组
    { name: GROUPS.AI, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/powerfullz/override-rules/master/icons/chatgpt.png" },
    { name: GROUPS.TELEGRAM, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png" },
    { name: GROUPS.GOOGLE, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/powerfullz/override-rules/master/icons/Google.png" },
    { name: GROUPS.MICROSOFT, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png" },
    { name: GROUPS.APPLE, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple.png" },
    
    // 媒体组
    { name: GROUPS.YOUTUBE, type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png" },
    { name: GROUPS.NETFLIX, type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Netflix.png" },
    { name: GROUPS.DISNEY, type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Disney.png" },
    { name: GROUPS.SPOTIFY, type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Spotify.png" },
    { name: GROUPS.TIKTOK, type: "select", proxies: mediaProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/TikTok.png" },
    
    // 游戏与其他
    { name: GROUPS.GAMES, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Game.png" },
    { name: GROUPS.CRYPTO, type: "select", proxies: allProxies, icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Cryptocurrency_3.png" },

    // 特殊处理组
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

  // 落地/家宽/低倍率可选组
  if (landing) {
    functionalGroups.push({
      name: GROUPS.LANDING, type: "select", "include-all": true,
      filter: REGEX_LANDING.source,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Airport.png"
    });
  }
  
  if (hasLowCostNodes) {
    functionalGroups.push({
      name: GROUPS.LOW_COST, type: "url-test", "include-all": true,
      filter: REGEX_LOW_COST.source,
      interval: 300, lazy: true,
      icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Lab.png"
    });
  }

  return [...functionalGroups, ...countryGroups];
}


// ============================================================================
// 5. DNS 与其他核心配置
// ============================================================================

function buildDnsConfig() {
  const { fakeIPEnabled, ipv6Enabled } = FLAGS;
  
  return {
    enable: true,
    ipv6: ipv6Enabled, // 核心：开启 IPv6 DNS 解析
    "prefer-h3": true,
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
    "fallback-filter": {
      geoip: true,
      "geoip-code": "CN",
      ipcidr: ["240.0.0.0/4"]
    },
    
    // 指定 DNS 策略，防止 DNS 泄露
    "nameserver-policy": {
      "geosite:cn,private,apple,steam,microsoft@cn": [
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

/**
 * Sub-Store 脚本入口
 * @param {object} config - 传入的原始配置对象
 */
function main(config) {
  // 1. 基础检查
  if (!config || !config.proxies) {
    console.log("⚠️ 错误: 配置文件为空或未找到代理节点。");
    return config || {};
  }

  // 2. 环境探测与预处理
  const proxies = config.proxies;
  FLAGS.lowCost = proxies.some(p => REGEX_LOW_COST.test(p.name));
  
  // 3. 生成国家分组列表
  const countryGroupNames = parseCountries(proxies);
  
  // 4. 构建核心配置块
  const proxyGroups = buildProxyGroups(proxies, countryGroupNames);
  const rules = buildRules(FLAGS);
  const dns = buildDnsConfig();

  // 5. 组装结果对象
  const result = {
    ...config,
    "proxy-groups": proxyGroups,
    "rule-providers": ruleProviders,
    rules: rules,
    dns: dns,
    
    // 全局基础设置
    "mixed-port": 7890,
    ipv6: FLAGS.ipv6Enabled,
    "allow-lan": true,
    "unified-delay": true,
    "tcp-concurrent": false, // 关闭并发以降低内存消耗
    
    // 嗅探设置
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
    
    // Geo 资源配置
    "geodata-mode": true,
    "geox-url": {
      geoip: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geoip.dat",
      geosite: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geosite.dat",
      mmdb: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/country.mmdb"
    }
  };

  // 6. 处理完整配置模式
  if (FLAGS.fullConfig) {
    // 如果需要生成完整配置，可以在这里添加更多字段
    result["log-level"] = "info";
  }

  return result;
}