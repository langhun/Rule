/**
 * ==================================================================================
 * Sub-Store 终极策略增强脚本 V5.9.3 (Landing Optional)
 * ==================================================================================
 * 内核支持：Clash / Mihomo / OpenClash
 * 适用场景：Sub-Store 集成
 * 
 * [版本特性]
 * 1. ⚙️ 灵活落地：恢复落地识别逻辑，但默认不隔离。落地节点默认会进入地区分组。
 * 2. 🎛️ 参数控制：可通过 landing=true 开启强制隔离模式 (将落地节点移出地区组)。
 * 3. 🛡️ 核心逻辑：保留 V5.9 的所有特性 (Crypto日本 / Apple直连 / 兜底防断)。
 * 4. ✨ 增强功能：完整的错误处理、性能优化、配置验证。
 *
 * [使用参数 (Arguments)]
 * ipv6=true          // [默认开启] 强制开启 IPv6 解析
 * loadbalance=false  // [默认关闭] 负载均衡 (建议 false)
 * landing=false      // [默认关闭] 是否隔离落地节点 (False=不隔离, True=隔离)
 * fakeip=true        // [默认开启] 开启 Fake-IP 模式
 * threshold=0        // [默认 0]  地区节点数量阈值
 * quic=false         // [默认关闭] 启用 QUIC 协议支持
 * fullConfig=false   // [默认关闭] 完整配置模式
 */

// ============================================================================
// 1. 全局常量定义 (Constants) - 定义脚本中使用的所有常量
// ============================================================================

// 定义节点后缀名称，用于拼接国家分组名
const NODE_SUFFIX = "节点";

// 正则表达式：匹配低倍率、公益或实验性节点
// 用于过滤掉这类低质量节点，不纳入国家分组计数
const REGEX_LOW_COST = /0\.[0-5]|低倍率|省流|大流量|实验性|公益/i;

// 正则表达式：匹配明确标记为"落地"、"中转"或"Relay"的节点
// 当 landing=true 时，这类节点会被隔离到专门的策略组
const REGEX_LANDING_ISOLATE = /落地|Relay|To-user|中转/i;

// 策略组名称映射表 - 使用全 Emoji 化的名称，便于视觉识别
const GROUPS = {
  // --- 基础控制组 - 用于节点选择和流量控制 ---
  SELECT:     "🚀 节点选择",  // 主入口，用户首选
  MANUAL:     "🎯 手动切换",  // 备用手动选择
  FALLBACK:   "⚡ 自动切换",  // 自动优选，用于故障转移
  DIRECT:     "🎯 全球直连",  // 强制直连，不走代理
  LANDING:    "🏳️‍🌈 落地节点", // [可选] 仅在 landing=true 时生成
  LOW_COST:   "🐢 低倍率",    // 低倍率/公益节点
  OTHER:      "🐟 兜底节点",  // [防断网] 当无地区分组时显示

  // --- 业务策略组 - 根据应用类型进行分流 ---
  AI:         "🤖 AI服务",     // ChatGPT 等 AI 服务
  CRYPTO:     "💰 加密货币",   // 特性：优先日本（低 ping）
  APPLE:      "🍎 Apple",      // 特性：默认直连（优化体验）
  MICROSOFT:  "Ⓜ️ 微软服务",   // Office、Teams 等
  GOOGLE:     "🇬 Google",      // Google 搜索等
  BING:       "🔍 Bing",       // 特性：默认直连
  ONEDRIVE:   "☁️ OneDrive",   // 云存储服务

  TELEGRAM:   "✈️ Telegram",   // 即时通讯
  YOUTUBE:    "📹 YouTube",    // 视频平台
  NETFLIX:    "🎥 Netflix",    // 流媒体
  DISNEY:     "🏰 Disney+",    // 流媒体
  SPOTIFY:    "🎧 Spotify",    // 音乐流媒体
  TIKTOK:     "🎵 TikTok",     // 短视频

  STEAM:      "🚂 Steam",      // 游戏平台
  GAMES:      "🎮 游戏加速",   // 其他游戏
  PT:         "📦 PT下载",     // 特性：默认直连（禁用代理）
  SPEEDTEST:  "📈 网络测速",   // 特性：默认直连
  ADS:        "🛑 广告拦截"    // 广告过滤
};

// ============================================================================
// 2. 工具与参数解析 (Utils) - 辅助函数集合
// ============================================================================

/**
 * 将各种类型的值转换为布尔值
 * @param {any} val - 待转换的值 (boolean | string | 其他)
 * @param {boolean} def - 默认值，当无法转换时使用 (默认 false)
 * @returns {boolean} 转换后的布尔值
 */
function parseBool(val, def = false) {
  // 如果已经是布尔类型，直接返回
  if (typeof val === "boolean") {
    return val;
  }
  // 如果是字符串，判断是否为 "true" 或 "1"
  if (typeof val === "string") {
    return val.toLowerCase() === "true" || val === "1";
  }
  // 其他情况返回默认值
  return def;
}

/**
 * 将字符串转换为数字
 * @param {any} val - 待转换的值
 * @param {number} def - 默认值，当转换失败时使用 (默认 0)
 * @returns {number} 转换后的数字
 */
function parseNumber(val, def = 0) {
  // 使用 parseInt 转换，基数为 10
  const num = parseInt(val, 10);
  // 如果转换失败 (NaN)，返回默认值
  return isNaN(num) ? def : num;
}

/**
 * 验证配置参数的完整性和合法性
 * @param {object} args - 用户传入的参数对象
 * @returns {object} 验证和规范化后的参数
 */
function validateArgs(args) {
  // 检查 threshold 参数是否合法 (必须为非负整数)
  const threshold = parseNumber(args.threshold, 0);
  if (threshold < 0) {
    console.warn("⚠️ 警告: threshold 不能为负数，已重置为 0");
    return { ...args, threshold: 0 };
  }
  return args;
}

// 解析用户传入的参数，提供默认值
// $arguments 是 Sub-Store 提供的全局参数对象
const ARGS = ((args) => {
  // 首先验证参数合法性
  const validatedArgs = validateArgs(args);
  // 返回规范化后的参数对象
  return {
    ipv6:      parseBool(validatedArgs.ipv6Enabled, true),        // [默认开启] IPv6 支持
    lb:        parseBool(validatedArgs.loadBalance, false),        // [默认关闭] 负载均衡
    landing:   parseBool(validatedArgs.landing, false),            // [默认关闭] 是否隔离落地节点
    full:      parseBool(validatedArgs.fullConfig, false),         // [默认关闭] 完整配置模式
    fakeip:    parseBool(validatedArgs.fakeIPEnabled, true),       // [默认开启] Fake-IP 模式
    quic:      parseBool(validatedArgs.quicEnabled, false),        // [默认关闭] QUIC 协议支持
    threshold: parseNumber(validatedArgs.threshold, 0)             // [默认 0] 国家节点数量阈值
  };
})(typeof $arguments !== 'undefined' ? $arguments : {});


// ============================================================================
// 3. 规则集配置 (Rule Providers) - 定义规则数据源
// ============================================================================

// MetaCubeX 规则库的基础 URL
const META_URL = "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo";

// 规则提供商配置对象
const ruleProviders = {
  // --- 基础规则 - 用于基本的流量分类 ---
  // 私有域名和 IP (本地网络、内部服务)
  "Private":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/private.mrs` },
  // 中国大陆域名 (用于判断国内流量)
  "CN":           { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/cn.mrs` },
  // 广告阻止列表
  "ADBlock":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: "https://adrules.top/adrules-mihomo.mrs" },
  // 非中国大陆域名 (用于判断国际流量)
  "Geo_Not_CN":   { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/geolocation-!cn.mrs` },

  // --- 应用分流 - 针对特定应用/服务的规则 ---
  // AI 服务 (ChatGPT、Claude 等)
  "AI":           { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/category-ai-!cn.mrs` },
  // 加密货币交易所 (自定义规则)
  "Crypto":       { type: "http", behavior: "classical", format: "text", interval: 86400, url: "https://raw.githubusercontent.com/langhun/Rule/refs/heads/main/Clash/Ruleset/Crypto.list" },

  // 视频平台
  "YouTube":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/youtube.mrs` },
  // 搜索引擎
  "Google":       { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/google.mrs` },
  // 代码托管
  "GitHub":       { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/github.mrs` },
  // 即时通讯
  "Telegram":     { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/telegram.mrs` },
  // 流媒体
  "Netflix":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/netflix.mrs` },
  "Disney":       { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/disney.mrs` },
  "Spotify":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/spotify.mrs` },
  "TikTok":       { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/tiktok.mrs` },
  
  // --- 厂商服务 - 特定公司的域名集合 ---
  "Microsoft":    { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/microsoft.mrs` },
  // 微软搜索引擎
  "Bing":         { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/bing.mrs` },
  // 微软云存储
  "OneDrive":     { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/onedrive.mrs` },
  // 苹果相关服务
  "Apple":        { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/apple.mrs` },
  "AppleTV":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/apple-tvplus.mrs` },
  // 游戏平台 - Steam 中国区
  "SteamCN":      { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/steam@cn.mrs` },
  // Epic Games 商店
  "Epic":         { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/epicgames.mrs` },
  
  // --- 工具类 - 特定用途的规则 ---
  // 网络测速 (Speedtest)
  "Speedtest":    { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/ookla-speedtest.mrs` },
  // PT 下载 (私人种子)
  "PT":           { type: "http", behavior: "domain", format: "mrs", interval: 86400, url: `${META_URL}/geosite/category-pt.mrs` },
  // 直连列表 (自定义的需要直连的域名)
  "DirectList":   { type: "http", behavior: "classical", format: "text", interval: 86400, url: "https://raw.githubusercontent.com/langhun/Rule/refs/heads/main/Clash/Direct.list" },

  // --- IP 规则 - 基于 IP 段的分流 ---
  // 中国大陆 IP 段
  "CN_IP":        { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geoip/cn.mrs` },
  // 私有 IP 段 (局域网、回环等)
  "Private_IP":   { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geoip/private.mrs` },
  // Google IP 段
  "Google_IP":    { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geoip/google.mrs` },
  // Telegram IP 段
  "Telegram_IP":  { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geoip/telegram.mrs` },
  // Netflix IP 段
  "Netflix_IP":   { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: `${META_URL}/geoip/netflix.mrs` },
  // 苹果 IP 段 (使用精简版)
  "Apple_IP":     { type: "http", behavior: "ipcidr", format: "mrs", interval: 86400, url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo-lite/geoip/apple.mrs" }
};


// ============================================================================
// 4. 规则匹配逻辑 (Rules Construction) - 构建流量分流规则列表
// ============================================================================

/**
 * 构建规则数组，定义了流量如何分配到不同的策略组
 * @param {boolean} quicEnabled - 是否启用 QUIC 协议支持
 * @returns {Array<string>} 规则数组
 */
const buildRules = (quicEnabled) => {
  // 初始化规则数组
  const rules = [
    // [协议控制] 如果不支持 QUIC，则拒绝所有 UDP 443 连接
    !quicEnabled ? "AND,((DST-PORT,443),(NETWORK,UDP)),REJECT" : null,

    // [基础拦截] 广告过滤、私有域名、私有 IP 直接拦截或直连
    `RULE-SET,ADBlock,${GROUPS.ADS}`,                    // 广告域名 → 广告拦截组
    `RULE-SET,Private,${GROUPS.DIRECT}`,                 // 私有域名 → 直连
    `RULE-SET,Private_IP,${GROUPS.DIRECT},no-resolve`,   // 私有 IP → 直连（不解析域名）

    // [业务分流] 将特定应用流量路由到对应策略组
    `RULE-SET,AI,${GROUPS.AI}`,                          // AI 服务 → AI 组
    `RULE-SET,Crypto,${GROUPS.CRYPTO}`,                  // 加密货币 → Crypto 组（优先日本）

    // 视频和社交媒体
    `RULE-SET,YouTube,${GROUPS.YOUTUBE}`,                // YouTube → YouTube 组
    `RULE-SET,Google,${GROUPS.GOOGLE}`,                  // Google → Google 组
    `RULE-SET,Google_IP,${GROUPS.GOOGLE},no-resolve`,    // Google IP → Google 组
    
    // 微软服务
    `RULE-SET,Bing,${GROUPS.BING}`,                      // Bing → Bing 组（优先直连）
    `RULE-SET,OneDrive,${GROUPS.ONEDRIVE}`,              // OneDrive → OneDrive 组
    `RULE-SET,Microsoft,${GROUPS.MICROSOFT}`,            // 其他微软服务 → Microsoft 组
    
    // 苹果服务 - 优先直连以保证体验
    `RULE-SET,AppleTV,${GROUPS.APPLE}`,                  // Apple TV → Apple 组
    `RULE-SET,Apple,${GROUPS.APPLE}`,                    // 其他苹果服务 → Apple 组
    `RULE-SET,Apple_IP,${GROUPS.APPLE},no-resolve`,      // 苹果 IP → Apple 组

    // 即时通讯和其他
    `RULE-SET,Telegram,${GROUPS.TELEGRAM}`,              // Telegram → Telegram 组
    `RULE-SET,Telegram_IP,${GROUPS.TELEGRAM},no-resolve`, // Telegram IP → Telegram 组
    `RULE-SET,TikTok,${GROUPS.TIKTOK}`,                  // TikTok → TikTok 组
    
    // 流媒体服务
    `RULE-SET,Netflix,${GROUPS.NETFLIX}`,                // Netflix → Netflix 组
    `RULE-SET,Netflix_IP,${GROUPS.NETFLIX},no-resolve`,  // Netflix IP → Netflix 组
    `RULE-SET,Disney,${GROUPS.DISNEY}`,                  // Disney+ → Disney 组
    `RULE-SET,Spotify,${GROUPS.SPOTIFY}`,                // Spotify → Spotify 组
    
    // 游戏和工具
    `RULE-SET,SteamCN,${GROUPS.DIRECT}`,                 // Steam 中国区 → 直连（国内优化）
    `RULE-SET,Epic,${GROUPS.GAMES}`,                     // Epic Games → 游戏组
    `RULE-SET,PT,${GROUPS.PT}`,                          // PT 下载 → PT 组（禁用代理）
    `RULE-SET,Speedtest,${GROUPS.SPEEDTEST}`,            // 网络测速 → 测速组（禁用代理）
    `RULE-SET,GitHub,${GROUPS.SELECT}`,                  // GitHub → 主选择（自定义选择）

    // [兜底规则] 处理未被上述规则匹配的流量
    `RULE-SET,DirectList,${GROUPS.DIRECT}`,              // 直连列表 → 直连
    `RULE-SET,Geo_Not_CN,${GROUPS.SELECT}`,              // 非国内域名 → 主选择（手动选择国家）
    `RULE-SET,CN,${GROUPS.DIRECT}`,                      // 国内域名 → 直连
    `RULE-SET,CN_IP,${GROUPS.DIRECT},no-resolve`,        // 国内 IP → 直连
    `MATCH,${GROUPS.SELECT}`                             // 其他流量 → 主选择（最后的兜底）
  ];
  // 过滤掉所有 null 值 (由 quic 判断导出)
  return rules.filter(Boolean);
};


// ============================================================================
// 5. 策略组生成逻辑 (Proxy Groups - Optional Landing)
// ============================================================================

// 国家/地区配置映射表
// 每个国家都有正则表达式和对应的旗帜emoji
const countriesMeta = {
  // 亚太地区
  "香港": { pattern: "(?i)香港|港|HK|Hong Kong|🇭🇰", flag: "🇭🇰" },
  "台湾": { pattern: "(?i)台湾|台|TW|Taiwan|🇹🇼",    flag: "🇹🇼" },
  "日本": { pattern: "(?i)日本|东京|大阪|JP|Japan|🇯🇵", flag: "🇯🇵" },
  "狮城": { pattern: "(?i)新加坡|坡|狮城|SG|Singapore|🇸🇬", flag: "🇸🇬" },
  "韩国": { pattern: "(?i)韩国|KR|Korea|🇰🇷", flag: "🇰🇷" },
  
  // 美洲
  "美国": { pattern: "(?i)美国|美|US|United States|🇺🇸", flag: "🇺🇸" },
  "阿根廷": { pattern: "(?i)阿根廷|AR|Argentina|🇦🇷", flag: "🇦🇷" },
  "巴西": { pattern: "(?i)巴西|BR|Brazil|🇧🇷", flag: "🇧🇷" },
  "枫叶": { pattern: "(?i)加拿大|CA|Canada|🇨🇦", flag: "🇨🇦" },
  
  // 欧洲
  "英国": { pattern: "(?i)英国|UK|United Kingdom|🇬🇧", flag: "🇬🇧" },
  "德国": { pattern: "(?i)德国|DE|Germany|🇩🇪", flag: "🇩🇪" },
  "法国": { pattern: "(?i)法国|FR|France|🇫🇷", flag: "🇫🇷" },
  
  // 其他地区
  "土耳其": { pattern: "(?i)土耳其|TR|Turkey|🇹🇷", flag: "🇹🇷" },
  "袋鼠": { pattern: "(?i)澳洲|澳大利亚|AU|Australia|🇦🇺", flag: "🇦🇺" },
  "毛熊": { pattern: "(?i)俄罗斯|俄|RU|Russia|🇷🇺", flag: "🇷🇺" },
  
  // 别称映射 (同一国家的多个别称)
  "花旗": { pattern: "(?i)美国|美|US|United States|🇺🇸", flag: "🇺🇸" },
  "霓虹": { pattern: "(?i)日本|东京|大阪|JP|Japan|🇯🇵", flag: "🇯🇵" },
  "英伦": { pattern: "(?i)英国|UK|United Kingdom|🇬🇧", flag: "🇬🇧" },
  "高丽": { pattern: "(?i)韩国|KR|Korea|🇰🇷", flag: "🇰🇷" },
  "战车": { pattern: "(?i)德国|DE|Germany|🇩🇪", flag: "🇩🇪" },
  "高卢": { pattern: "(?i)法国|FR|France|🇫🇷", flag: "🇫🇷" }
};

/**
 * 解析节点列表，生成结构化国家配置
 * 统计各国家节点数量，过滤低质量节点
 * @param {Array<object>} proxies - 所有代理节点数组
 * @returns {Array<object>} 返回按国家分组的配置数组
 */
function parseCountries(proxies) {
  // 用于统计各国家的节点数量
  const countryCounts = {};
  // 获取 landing 参数（是否隔离落地节点）
  const { landing } = ARGS;
  
  // 预编译正则表达式以提高性能（避免重复编译）
  const compiledMeta = Object.entries(countriesMeta)
    .map(([key, meta]) => ({
      key,                                           // 国家名称
      flag: meta.flag,                               // 国家旗帜
      outputPattern: meta.pattern.replace(/^\(\?i\)/, ''), // 去掉 (?i) 后的正则表达式
      regex: new RegExp(meta.pattern.replace(/^\(\?i\)/, ''), 'i') // 编译的正则表达式对象
    }))
    .filter((item, index, self) => {
      // 去重：同一 flag 只保留第一个出现的配置（去除别称重复）
      return self.findIndex(x => x.flag === item.flag) === index;
    });

  // [验证] 检查代理数组是否为空
  if (!Array.isArray(proxies) || proxies.length === 0) {
    console.warn("⚠️ 警告: 代理节点数组为空，无法解析国家信息");
    return [];
  }

  // 遍历所有代理节点
  for (const proxy of proxies) {
    // [防御] 检查节点对象是否合法
    if (!proxy || typeof proxy.name !== 'string') {
      continue; // 跳过无效节点
    }
    
    const name = proxy.name;
    
    // [关键逻辑] 只有当开启 landing 参数时，才在国家统计中跳过落地节点
    // 默认 landing=false，所以落地节点会被计入国家分组
    if (landing && REGEX_LANDING_ISOLATE.test(name)) {
      continue; // 如果启用落地隔离且该节点是落地节点，则跳过统计
    }
    
    // 遍历所有国家正则，寻找匹配的国家
    for (const meta of compiledMeta) {
      if (meta.regex.test(name)) {
        // 该国家节点数 +1
        countryCounts[meta.key] = (countryCounts[meta.key] || 0) + 1;
        break; // 找到匹配国家后停止继续匹配
      }
    }
  }

  // 返回符合条件的国家配置
  return Object.entries(countryCounts)
    .filter(([, count]) => count > ARGS.threshold)  // 只保留超过阈值的国家
    .map(([key]) => {
      // 找到该国家的 meta 配置
      const meta = compiledMeta.find(m => m.key === key);
      if (!meta) {
        return null; // 防御性编程：节点不存在则跳过
      }
      return {
        name: `${meta.flag} ${key}${NODE_SUFFIX}`,   // 生成策略组名称 (e.g., "🇭🇰 香港节点")
        filter: meta.outputPattern                    // 用于节点过滤的正则表达式
      };
    })
    .filter(Boolean); // 过滤掉 null 值
}

/**
 * 构建完整的策略组配置
 * 包括基础控制组、业务分流组、国家分组等
 * @param {Array<object>} proxies - 所有代理节点
 * @param {Array<object>} countryConfigs - 国家配置数组
 * @param {boolean} hasLowCost - 是否存在低倍率节点
 * @returns {Array<object>} 返回策略组数组
 */
function buildProxyGroups(proxies, countryConfigs, hasLowCost) {
  // 获取 lb (负载均衡) 和 landing (落地隔离) 参数
  const { lb, landing } = ARGS;
  // 提取所有国家策略组的名称
  const countryGroupNames = countryConfigs.map(c => c.name);

  // [安全检查] 如果没有国家分组，使用兜底组
  if (countryGroupNames.length === 0) {
    console.warn("⚠️ 警告: 未检测到有效的国家分组，将使用兜底节点组");
  }

  // [兜底组] 当所有国家分组都不可用时的备选
  const fallbackAllGroup = [{ 
    name: GROUPS.OTHER,     // 策略组名称
    type: "select",         // 类型为选择 (手动选择)
    "include-all": true     // 包含所有节点
  }];
  
  // [基础候选列表] 所有策略组都可以选择的节点列表
  // 包含：自动切换 → 落地节点 (可选) → 所有国家 → 兜底 → 低倍率 (可选) → 手动 → 直连
  const baseProxies = [
    GROUPS.FALLBACK,
    landing ? GROUPS.LANDING : null,            // 仅 landing=true 时包含
    ...countryGroupNames,
    GROUPS.OTHER, 
    hasLowCost ? GROUPS.LOW_COST : null,        // 仅存在低倍率节点时包含
    GROUPS.MANUAL,
    "DIRECT"
  ].filter(Boolean);  // 过滤掉 null 值

  // [直连优先列表] 用于 Bing、Apple 等需要优先直连的服务
  // 把 DIRECT 放在最前面，其次是 SELECT，然后是其他
  const directFirstProxies = [
    "DIRECT",
    GROUPS.SELECT,
    ...baseProxies.filter(p => p !== "DIRECT" && p !== GROUPS.SELECT)
  ];
  
  // [Crypto 日本优先] 加密货币服务优先使用日本节点 (低 ping，快速响应)
  const japanGroup = countryConfigs.find(c => 
    c.name.includes("🇯🇵") || c.name.includes("日本") || c.name.includes("霓虹")
  );
  const cryptoProxies = japanGroup 
    ? [japanGroup.name, ...baseProxies.filter(n => n !== japanGroup.name)]  // 日本优先
    : [...baseProxies];

  // [媒体优先选择] 用于 YouTube、Netflix 等流媒体
  const mediaProxies = [GROUPS.SELECT, ...countryGroupNames, GROUPS.MANUAL];

  // --- 1. 生成国家分组 ---
  const countryGroups = countryConfigs.map(config => {
    // 构建排除过滤器：过滤掉低倍率节点
    // 如果 landing=true，还需过滤掉落地节点
    const excludeFilter = landing 
      ? `(?i)${REGEX_LANDING_ISOLATE.source}|${REGEX_LOW_COST.source}`  // 同时过滤落地和低倍率
      : `(?i)${REGEX_LOW_COST.source}`;                                  // 仅过滤低倍率

    return {
      name: config.name,                      // 策略组名称 (e.g., "🇭🇰 香港节点")
      type: lb ? "load-balance" : "url-test", // 类型：负载均衡 或 URL 测速
      "include-all": true,                    // 包含所有符合条件的节点
      filter: config.filter,                  // 匹配该国家的正则表达式
      "exclude-filter": excludeFilter,        // 排除低倍率 (和落地) 节点
      interval: 600,                          // 测速间隔 (秒)
      tolerance: 100,                         // 容错值 (ms)
      lazy: true,                             // 启用懒加载 (需要时才测速)
      url: "https://cp.cloudflare.com/generate_204" // 测速地址
    };
  });

  // --- 2. 生成功能分组 ---
  const functionalGroups = [
    // [基础控制组]
    { 
      name: GROUPS.SELECT,          // 🚀 节点选择 (主入口)
      type: "select",               // 手动选择
      proxies: [
        GROUPS.FALLBACK,
        ...countryGroupNames,
        GROUPS.OTHER,
        GROUPS.MANUAL,
        "DIRECT"
      ]  // 可选项
    },
    { 
      name: GROUPS.MANUAL,          // 🎯 手动切换
      type: "select", 
      "include-all": true           // 包含所有节点，用户自由选择
    },
    { 
      name: GROUPS.FALLBACK,        // ⚡ 自动切换
      type: "url-test",             // 自动测速选择最快节点
      // 可选节点：落地 (可选) → 所有国家 → 兜底
      proxies: [
        landing ? GROUPS.LANDING : null,
        ...countryGroupNames,
        GROUPS.OTHER
      ].filter(Boolean),
      url: "https://cp.cloudflare.com/generate_204", 
      interval: 600, 
      tolerance: 100, 
      lazy: true 
    },
    
    // [业务应用组] - 根据服务类型进行分流
    { name: GROUPS.AI,        type: "select", proxies: baseProxies },        // AI 服务
    { name: GROUPS.TELEGRAM,  type: "select", proxies: baseProxies },        // Telegram
    { name: GROUPS.GOOGLE,    type: "select", proxies: baseProxies },        // Google
    { name: GROUPS.MICROSOFT, type: "select", proxies: baseProxies },        // 微软服务
    { name: GROUPS.BING,      type: "select", proxies: directFirstProxies }, // Bing (优先直连)
    { name: GROUPS.ONEDRIVE,  type: "select", proxies: baseProxies },        // OneDrive
    { name: GROUPS.APPLE,     type: "select", proxies: directFirstProxies }, // Apple (优先直连)
    
    // [媒体娱乐组] - 流媒体服务
    { name: GROUPS.YOUTUBE,   type: "select", proxies: mediaProxies },   // YouTube
    { name: GROUPS.NETFLIX,   type: "select", proxies: mediaProxies },   // Netflix
    { name: GROUPS.DISNEY,    type: "select", proxies: mediaProxies },   // Disney+
    { name: GROUPS.SPOTIFY,   type: "select", proxies: mediaProxies },   // Spotify
    { name: GROUPS.TIKTOK,    type: "select", proxies: mediaProxies },   // TikTok
    
    // [其他服务组]
    { name: GROUPS.GAMES,     type: "select", proxies: baseProxies },        // 游戏加速
    { name: GROUPS.CRYPTO,    type: "select", proxies: cryptoProxies },      // Crypto (日本优先)
    { name: GROUPS.PT,        type: "select", proxies: directFirstProxies }, // PT 下载 (禁用代理)
    { name: GROUPS.SPEEDTEST, type: "select", proxies: directFirstProxies }, // 测速 (禁用代理)

    // [拦截与直连组]
    { 
      name: GROUPS.ADS,       type: "select", 
      proxies: ["REJECT", "REJECT-DROP", GROUPS.DIRECT]  // 可选：拒绝 / 拒绝丢弃 / 直连
    },
    { 
      name: GROUPS.DIRECT,    type: "select", 
      proxies: ["DIRECT", GROUPS.SELECT]  // 可选：强制直连 / 切换为代理
    }
  ];

  // [可选] 仅在 landing=true 时生成落地节点隔离组
  if (landing) {
    functionalGroups.push({
      name: GROUPS.LANDING,        // 🏳️‍🌈 落地节点
      type: "select",              // 手动选择
      "include-all": true,         // 包含所有落地节点
      filter: REGEX_LANDING_ISOLATE.source  // 只包含匹配"落地"标记的节点
    });
  }
  
  // [可选] 仅当存在低倍率节点时生成低倍率组
  if (hasLowCost) {
    functionalGroups.push({
      name: GROUPS.LOW_COST,       // 🐢 低倍率
      type: "url-test",            // 自动测速
      "include-all": true,         // 包含所有低倍率节点
      filter: REGEX_LOW_COST.source,  // 只包含低倍率节点
      interval: 600, 
      tolerance: 100, 
      lazy: true
    });
  }

  // 返回完整策略组：功能组 + 国家组 + 兜底组
  return [...functionalGroups, ...countryGroups, ...fallbackAllGroup];
}


// ============================================================================
// 6. DNS 配置 (DNS Configuration) - DNS 和 Fake-IP 设置
// ============================================================================

/**
 * 构建 DNS 配置对象
 * @returns {object} DNS 配置对象
 */
function buildDnsConfig() {
  // 获取 fakeip 和 ipv6 参数
  const { fakeip, ipv6 } = ARGS;
  
  return {
    enable: true,                            // 启用 DNS 配置
    ipv6: ipv6,                              // 是否启用 IPv6 解析
    "prefer-h3": false,                      // 不优先使用 HTTP/3
    // DNS 模式：Fake-IP (适合游戏) 或重定向主机 (兼容性更好)
    "enhanced-mode": fakeip ? "fake-ip" : "redir-host",
    listen: ":1053",                         // DNS 监听端口
    "use-hosts": true,                       // 使用 hosts 文件
    "fake-ip-range": "198.18.0.1/16",        // Fake-IP 地址范围 (RFC 6598 标准)
    
    // [上游 DNS] 用于解析国内域名 (阿里 / 腾讯，响应快)
    "default-nameserver": ["223.5.5.5", "119.29.29.29"],
    // [主 DNS] 支持 DoH (DNS over HTTPS) 协议，更安全
    nameserver: [
      "https://dns.alidns.com/dns-query",    // 阿里公共 DNS
      "https://doh.pub/dns-query"            // 腾讯公共 DNS (DNSPod)
    ],
    // [备用 DNS] 用于解析国际域名 (Cloudflare / Google)
    fallback: [
      "https://1.1.1.1/dns-query",           // Cloudflare DNS
      "https://8.8.8.8/dns-query"            // Google DNS
    ],
    
    // [Fake-IP 过滤] 这些域名不使用 Fake-IP，直接真实解析
    "fake-ip-filter": [
      // 系统网络检测 (需要真实 IP，否则连接检测会失败)
      "dns.msftncsi.com",           // 微软网络检测
      "www.msftncsi.com",
      "www.msftconnecttest.com",
      "connectivitycheck.gstatic.com", // Google 网络检测
      // 游戏主机 (需要真实 IP 进行连接)
      "*.xboxlive.com",             // Xbox Live
      "*.nintendo.net",             // Nintendo 网络
      "*.sonyentertainmentnetwork.com", // PlayStation 网络
      // 强制直连的服务 (geosite 规则引用)
      "geosite:cn",                 // 国内域名
      "geosite:apple",              // 苹果服务
      "geosite:microsoft",          // 微软服务
      "geosite:steam@cn"            // Steam 中国区
    ],
    
    // [Fallback 过滤] 防止国内 IP 误匹配为国际流量
    "fallback-filter": { 
      geoip: true,                  // 启用 GeoIP 过滤
      "geoip-code": "CN",           // 过滤掉中国 IP，避免国内域名走备用 DNS
      ipcidr: ["240.0.0.0/4"]       // 过滤掉保留 IP 段
    },
    
    // [DNS 策略] 根据不同域名使用不同的 DNS
    "nameserver-policy": {
      // 国内域名、私有域名、苹果、微软、Steam 中国区 → 使用国内 DNS
      "geosite:cn,private,apple,steam,microsoft@cn": [
        "https://dns.alidns.com/dns-query",
        "https://doh.pub/dns-query"
      ],
      // 国际域名、Google、YouTube、Telegram → 使用国际 DNS
      "geosite:geolocation-!cn,gfw,google,youtube,telegram": [
        "https://1.1.1.1/dns-query",
        "https://8.8.8.8/dns-query"
      ]
    }
  };
}


// ============================================================================
// 7. 主程序入口 (Main Entry) - 脚本执行的入口函数
// ============================================================================

/**
 * 主函数：将生成的配置与原配置合并
 * @param {object} config - Sub-Store 提供的原始配置对象
 * @returns {object} 返回合并后的完整配置
 */
function main(config) {
  // [安全检查 1] 如果配置文件为空，返回空配置
  if (!config) {
    console.error("❌ 错误: 配置对象不存在");
    return {};
  }

  // [安全检查 2] 如果没有代理节点，返回原配置
  if (!config.proxies || !Array.isArray(config.proxies)) {
    console.warn("⚠️ 警告: 配置文件中未找到代理节点数组");
    return config;
  }

  // [安全检查 3] 如果代理数组为空，返回原配置
  if (config.proxies.length === 0) {
    console.warn("⚠️ 警告: 代理节点数组为空，无法生成完整配置");
    return config;
  }

  try {
    // 获取代理节点列表
    const proxies = config.proxies;
    // 检查是否存在低倍率节点（用于生成低倍率组）
    const hasLowCost = proxies.some(p => 
      p && typeof p.name === 'string' && REGEX_LOW_COST.test(p.name)
    );
    
    // 解析国家配置
    const countryConfigs = parseCountries(proxies);
    // 构建策略组
    const proxyGroups = buildProxyGroups(proxies, countryConfigs, hasLowCost);
    // 构建规则
    const rules = buildRules(ARGS.quic);
    // 构建 DNS 配置
    const dns = buildDnsConfig();

    // [日志输出] 生成配置统计信息
    if (ARGS.full) {
      console.log(`📊 配置生成完毕:`);
      console.log(`   ✓ 代理节点: ${proxies.length} 个`);
      console.log(`   ✓ 国家分组: ${countryConfigs.length} 个`);
      console.log(`   ✓ 策略组: ${proxyGroups.length} 个`);
      console.log(`   ✓ 规则数: ${rules.length} 条`);
    }

    // 合并所有配置
    const result = {
      ...config,                          // 原始配置项（保留所有原有配置）
      "proxy-groups": proxyGroups,        // 策略组配置
      "rule-providers": ruleProviders,    // 规则提供商配置
      rules: rules,                       // 流量规则
      dns: dns,                           // DNS 配置
      
      // [其他全局配置]
      "mixed-port": 7890,                 // 混合代理端口 (HTTP + Socks5)
      ipv6: ARGS.ipv6,                    // IPv6 支持
      "allow-lan": true,                  // 允许局域网访问
      "unified-delay": true,              // 统一延迟计算
      "tcp-concurrent": false,            // 禁用 TCP 并发 (防止资源泄露)
      
      // [协议嗅探] 识别加密流量类型（不再依赖纯 TLS 指纹）
      sniffer: {
        enable: true,                     // 启用 SNI 嗅探
        "force-dns-mapping": true,        // 强制 DNS 映射（解决部分应用识别问题）
        "parse-pure-ip": true,            // 解析纯 IP 连接（支持 IP 直连）
        "override-destination": false,    // 不修改目标地址（保持兼容性）
        sniff: {
          TLS: { ports: [443, 8443] },    // TLS 协议端口
          HTTP: { ports: [80, 8080, 8880] }, // HTTP 协议端口
          QUIC: { ports: [443, 8443] }    // QUIC 协议端口
        }
      }
    };

    // [可选] 如果启用完整配置模式，添加日志等级和性能参数
    if (ARGS.full) {
      result["log-level"] = "info";     // 输出 info 及以上日志
      result["profile"] = {
        "store-selected": true,          // 保存策略组选择
        "store-fake-ip": true            // 保存 Fake-IP 映射
      };
    }

    // 返回最终配置
    return result;

  } catch (error) {
    // [异常处理] 捕获任何执行错误
    console.error(`❌ 配置生成失败: ${error.message}`);
    console.error(error.stack);
    // 返回原配置作为备份
    return config;
  }
}
