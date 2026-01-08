/*
powerfullz 的 Substore 订阅转换脚本 (Ultimate Edition - Optimized by LabulaLiu)
https://github.com/powerfullz/override-rules

[增强点]
1. 增加 DNS nameserver-policy：国内域名强制走国内 DNS，国外走国外，杜绝污染与 CDN 跑偏。
2. 增加 Emby/Plex 独立媒体策略组。
3. 扩充 Fake-IP 过滤列表，修复 Windows 更新和主机游戏连接问题。
4. 优化规则顺序，提升匹配效率。

[参数说明]
loadbalance=true&landing=true&fakeip=true&keepalive=true
*/

const NODE_SUFFIX = "节点";

// ==================== 1. 工具函数 (Utils) ====================

function parseBool(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
        return value.toLowerCase() === "true" || value === "1";
    }
    return false;
}

function parseNumber(value, defaultValue = 0) {
    if (value === null || typeof value === 'undefined') return defaultValue;
    const num = parseInt(value, 10);
    return isNaN(num) ? defaultValue : num;
}

function buildFeatureFlags(args) {
    const spec = {
        loadbalance: "loadBalance",
        landing: "landing",
        ipv6: "ipv6Enabled",
        full: "fullConfig",
        keepalive: "keepAliveEnabled",
        fakeip: "fakeIPEnabled",
        quic: "quicEnabled"
    };

    const flags = Object.entries(spec).reduce((acc, [sourceKey, targetKey]) => {
        acc[targetKey] = parseBool(args[sourceKey]) || false;
        return acc;
    }, {});

    flags.countryThreshold = parseNumber(args.threshold, 0);
    return flags;
}

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

// ==================== 2. 核心逻辑 (Logic) ====================

function getCountryGroupNames(countryInfo, minCount) {
    return countryInfo
        .filter(item => item.count >= minCount)
        .map(item => item.country + NODE_SUFFIX);
}

function stripNodeSuffix(groupNames) {
    const suffixPattern = new RegExp(`${NODE_SUFFIX}$`);
    return groupNames.map(name => name.replace(suffixPattern, ""));
}

const PROXY_GROUPS = {
    SELECT: "节点选择",
    MANUAL: "手动切换",
    FALLBACK: "自动切换",
    DIRECT: "全球直连",
    LANDING: "落地节点",
    LOW_COST: "低倍率节点",
    EMBY: "Emby媒体", // [优化] 新增 Emby 组
};

const buildList = (...elements) => elements.flat().filter(Boolean);

function buildBaseLists({ landing, lowCost, countryGroupNames }) {
    const defaultSelector = buildList(
        PROXY_GROUPS.FALLBACK,
        landing && PROXY_GROUPS.LANDING,
        countryGroupNames,
        lowCost && PROXY_GROUPS.LOW_COST,
        PROXY_GROUPS.MANUAL,
        "DIRECT"
    );

    const defaultProxies = buildList(
        PROXY_GROUPS.SELECT,
        countryGroupNames,
        lowCost && PROXY_GROUPS.LOW_COST,
        PROXY_GROUPS.MANUAL,
        PROXY_GROUPS.DIRECT
    );

    // [优化] 媒体类服务首选高性能节点或手动选择，避免自动跳到垃圾节点
    const mediaProxies = buildList(
        PROXY_GROUPS.SELECT,
        countryGroupNames,
        PROXY_GROUPS.MANUAL
    );

    const defaultProxiesDirect = buildList(
        PROXY_GROUPS.DIRECT,
        countryGroupNames,
        lowCost && PROXY_GROUPS.LOW_COST,
        PROXY_GROUPS.SELECT,
        PROXY_GROUPS.MANUAL
    );

    const defaultFallback = buildList(
        landing && PROXY_GROUPS.LANDING,
        countryGroupNames,
        lowCost && PROXY_GROUPS.LOW_COST,
        PROXY_GROUPS.MANUAL,
        "DIRECT"
    );

    return { defaultProxies, defaultProxiesDirect, defaultSelector, defaultFallback, mediaProxies };
}

// ==================== 3. 规则集 (Rule Providers) ====================

const ruleProviders = {
    "LocalAreaNetwork": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/LocalAreaNetwork.list",
        "path": "./ruleset/ACL4SSR/LocalAreaNetwork.list"
    },
    "ADBlock": {
        "type": "http", "behavior": "domain", "format": "mrs", "interval": 86400,
        "url": "https://adrules.top/adrules-mihomo.mrs",
        "path": "./ruleset/ADBlock.mrs"
    },
    "BanAD": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/BanAD.list",
        "path": "./ruleset/ACL4SSR/BanAD.list"
    },
    "BanProgramAD": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/BanProgramAD.list",
        "path": "./ruleset/ACL4SSR/BanProgramAD.list"
    },
    "ChinaDomain": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list",
        "path": "./ruleset/ACL4SSR/ChinaDomain.list"
    },
    "ChinaCompanyIp": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ChinaCompanyIp.list",
        "path": "./ruleset/ACL4SSR/ChinaCompanyIp.list"
    },
    "Download": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Download.list",
        "path": "./ruleset/ACL4SSR/Download.list"
    },
    "ProxyGFWlist": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ProxyGFWlist.list",
        "path": "./ruleset/ACL4SSR/ProxyGFWlist.list"
    },
    "OpenAI": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/openai.yaml",
        "path": "./ruleset/MetaCubeX/OpenAI.yaml"
    },
    "Gemini": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/google-gemini.yaml",
        "path": "./ruleset/MetaCubeX/Gemini.yaml"
    },
    "AI": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/AI.list",
        "path": "./ruleset/ACL4SSR/AI.list"
    },
    "TikTok": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/TikTok.list",
        "path": "./ruleset/powerfullz/TikTok.list"
    },
    "Telegram": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list",
        "path": "./ruleset/ACL4SSR/Telegram.list"
    },
    "SteamCN": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/SteamCN.list",
        "path": "./ruleset/ACL4SSR/SteamCN.list"
    },
    "SteamFix": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/SteamFix.list",
        "path": "./ruleset/powerfullz/SteamFix.list"
    },
    "Epic": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Epic.list",
        "path": "./ruleset/ACL4SSR/Epic.list"
    },
    "GoogleFCM": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/GoogleFCM.list",
        "path": "./ruleset/ACL4SSR/GoogleFCM.list"
    },
    "GoogleCN": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/GoogleCN.list",
        "path": "./ruleset/ACL4SSR/GoogleCN.list"
    },
    "AdditionalFilter": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/AdditionalFilter.list",
        "path": "./ruleset/powerfullz/AdditionalFilter.list"
    },
    "Crypto": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/Crypto.list",
        "path": "./ruleset/powerfullz/Crypto.list"
    },
    "Bing": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Bing.list",
        "path": "./ruleset/ACL4SSR/Bing.list"
    },
    "OneDrive": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/OneDrive.list",
        "path": "./ruleset/ACL4SSR/OneDrive.list"
    },
    "Microsoft": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list",
        "path": "./ruleset/ACL4SSR/Microsoft.list"
    },
    "Apple": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list",
        "path": "./ruleset/ACL4SSR/Apple.list"
    },
    // [优化] 增加 Emby 规则集
    "Emby": {
        "type": "http", "behavior": "classical", "format": "text", "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Emby.list",
        "path": "./ruleset/ACL4SSR/Emby.list"
    }
};

// 基础规则顺序优化
const baseRules = [
    `RULE-SET,ADBlock,广告拦截`,
    `RULE-SET,AdditionalFilter,广告拦截`,
    `RULE-SET,BanAD,广告拦截`,
    `RULE-SET,BanProgramAD,广告拦截`,
    
    // [优化] 优先匹配 AI 和 Crypto
    `RULE-SET,OpenAI,AI服务`,
    `RULE-SET,Gemini,AI服务`,
    "GEOSITE,CATEGORY-AI-!CN,AI服务",
    `RULE-SET,Crypto,Crypto`,

    // [优化] 媒体规则
    `RULE-SET,Emby,Emby`, // Emby 优先匹配
    `RULE-SET,TikTok,TikTok`,
    `RULE-SET,Telegram,Telegram`,
    `RULE-SET,Bing,Bing`,
    `RULE-SET,OneDrive,OneDrive`,
    `RULE-SET,Microsoft,Microsoft`,
    `RULE-SET,Apple,Apple`,
    `RULE-SET,Epic,Games`,
    
    "GEOSITE,Category-Games,Games",
    "GEOSITE,Steam,Steam",
    "GEOSITE,GitHub,GitHub",
    "GEOSITE,Telegram,Telegram",
    "GEOSITE,YouTube,YouTube",
    "GEOSITE,Google,Google",
    "GEOSITE,Netflix,Netflix",
    "GEOSITE,Spotify,Spotify",
    "GEOSITE,Bilibili,Bilibili",
    "GEOSITE,category-pt,PT站点",

    "GEOIP,Netflix,Netflix,no-resolve",
    "GEOIP,Telegram,Telegram,no-resolve",

    // 直连规则
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

    // 兜底
    `DOMAIN,services.googleapis.cn,${PROXY_GROUPS.SELECT}`,
    `GEOSITE,GFW,${PROXY_GROUPS.SELECT}`,
    `RULE-SET,ProxyGFWlist,${PROXY_GROUPS.SELECT}`,
    `MATCH,${PROXY_GROUPS.SELECT}`,
];

function buildRules({ quicEnabled }) {
    const ruleList = [...baseRules];
    if (!quicEnabled) {
        ruleList.unshift("AND,((DST-PORT,443),(NETWORK,UDP)),REJECT");
    }
    return ruleList;
}

// ==================== 4. 嗅探与 DNS (Enhanced) ====================

const snifferConfig = {
    "sniff": {
        "TLS": { "ports": [443, 8443] },
        "HTTP": { "ports": [80, 8080, 8880] },
        "QUIC": { "ports": [443, 8443] }
    },
    "override-destination": false,
    "enable": true,
    "force-dns-mapping": true,
    "skip-domain": [
        "Mijia Cloud", "dlg.io.mi.com", "+.push.apple.com", "+.apple.com"
    ]
};

function buildDnsConfig({ mode, fakeIpFilter }) {
    const config = {
        "enable": true,
        "ipv6": ipv6Enabled,
        "prefer-h3": true, // [优化] 开启 DoH/H3 支持
        "enhanced-mode": mode,
        "default-nameserver": ["223.5.5.5", "119.29.29.29"], // [优化] 阿里 DNS 首选，响应更快
        "nameserver": [
            "https://dns.alidns.com/dns-query", // [优化] 使用 DoH 格式
            "https://doh.pub/dns-query"
        ],
        // [优化] 增加 nameserver-policy：精准 DNS 分流
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

// [优化] 增强版 Fake-IP 过滤列表，防止 Windows/Xbox/PS5 连接问题
const enhancedFakeIpFilter = [
    "geosite:private",
    "geosite:connectivity-check", // 安卓/Win 连通性检查
    "geosite:cn",
    "Mijia Cloud",
    "dlg.io.mi.com",
    "localhost.ptlogin2.qq.com",
    "*.icloud.com",
    "*.stun.*.*",
    "*.stun.*.*.*",
    "*.msftconnecttest.com", // Windows 网络检查
    "*.msftncsi.com",
    "time.*.com",
    "ntp.*.com",
    "+.nflxvideo.net",
    "+.media.dssott.com",
    "lens.l.google.com" 
];

const dnsConfig = buildDnsConfig({ mode: "redir-host" });
const dnsConfigFakeIp = buildDnsConfig({
    mode: "fake-ip",
    fakeIpFilter: enhancedFakeIpFilter
});

// ==================== 5. GeoData & Meta ====================

const geoxURL = {
    "geoip": "https://gcore.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geoip.dat",
    "geosite": "https://gcore.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat",
    "mmdb": "https://gcore.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb",
    "asn": "https://gcore.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb"
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

function hasLowCost(config) {
    const lowCostRegex = /0\.[0-5]|低倍率|省流|大流量|实验性/i;
    return (config.proxies || []).some(proxy => proxy.name && lowCostRegex.test(proxy.name));
}

function parseCountries(config) {
    const proxies = config.proxies || [];
    const ispRegex = /家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地/i; 
    const countryCounts = Object.create(null);
    const compiledRegex = {};
    for (const [country, meta] of Object.entries(countriesMeta)) {
        compiledRegex[country] = new RegExp(meta.pattern.replace(/^\(\?i\)/, ''), 'i');
    }

    for (const proxy of proxies) {
        const name = proxy.name || '';
        if (ispRegex.test(name)) continue;
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

function buildCountryProxyGroups({ countries, landing, loadBalance }) {
    const groups = [];
    const baseExcludeFilter = "0\\.[0-5]|低倍率|省流|大流量|实验性";
    const landingExcludeFilter = "(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地";
    const groupType = loadBalance ? "load-balance" : "url-test";

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
                "interval": 60, "tolerance": 20, "lazy": false
            });
        }
        groups.push(groupConfig);
    }
    return groups;
}

function buildProxyGroups({
    landing, countries, countryProxyGroups, lowCost,
    defaultSelector, defaultFallback, defaultProxies, defaultProxiesDirect, mediaProxies
}) {
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
            "exclude-filter": "(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地", "proxies": frontProxySelector
        } : null,
        (landing) ? {
            "name": PROXY_GROUPS.LANDING, "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Airport.png", "type": "select", "include-all": true,
            "filter": "(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地",
        } : null,
        {
            "name": PROXY_GROUPS.FALLBACK, "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bypass.png", "type": "fallback", "url": "https://cp.cloudflare.com/generate_204",
            "proxies": defaultFallback, "interval": 180, "tolerance": 20, "lazy": false
        },
        
        // 策略组列表
        { "name": "AI服务", "icon": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/icons/chatgpt.png", "type": "select", "proxies": defaultProxies },
        { "name": "Telegram", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png", "type": "select", "proxies": defaultProxies },
        { "name": "YouTube", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png", "type": "select", "proxies": mediaProxies }, // [优化] 使用 mediaProxies
        { "name": "Bilibili", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/bilibili.png", "type": "select", "proxies": bilibiliProxies },
        { "name": "Netflix", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png", "type": "select", "proxies": mediaProxies }, // [优化] 使用 mediaProxies
        { "name": "Spotify", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Spotify.png", "type": "select", "proxies": mediaProxies },
        { "name": "Emby", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/TV.png", "type": "select", "proxies": mediaProxies }, // [优化] 新增 Emby 组
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
            "include-all": true, "filter": "(?i)0\.[0-5]|低倍率|省流|大流量|实验性"
        } : null,
        ...countryProxyGroups
    ].filter(Boolean);
}

// ==================== 6. Main ====================

function main(config) {
    if (!config.proxies) { console.log("Error: No proxies found."); return config; }
    const resultConfig = { proxies: config.proxies };
    
    const countryInfo = parseCountries(resultConfig); 
    const lowCost = hasLowCost(resultConfig);
    const countryGroupNames = getCountryGroupNames(countryInfo, countryThreshold);
    const countries = stripNodeSuffix(countryGroupNames);

    const {
        defaultProxies, defaultProxiesDirect, defaultSelector, defaultFallback, mediaProxies
    } = buildBaseLists({ landing, lowCost, countryGroupNames });

    const countryProxyGroups = buildCountryProxyGroups({ countries, landing, loadBalance });

    const proxyGroups = buildProxyGroups({
        landing, countries, countryProxyGroups, lowCost,
        defaultProxies, defaultProxiesDirect, defaultSelector, defaultFallback, mediaProxies
    });
    
    const globalProxies = proxyGroups.map(item => item.name);   
    proxyGroups.push({
        "name": "GLOBAL", "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png",
        "include-all": true, "type": "select", "proxies": globalProxies
    });

    const finalRules = buildRules({ quicEnabled });

    if (fullConfig) Object.assign(resultConfig, {
        "mixed-port": 7890, "redir-port": 7892, "tproxy-port": 7893, "routing-mark": 7894,
        "allow-lan": true, "ipv6": ipv6Enabled, "mode": "rule",
        "unified-delay": true, "tcp-concurrent": true,
        "find-process-mode": "off", "log-level": "info",
        "geodata-loader": "standard", "external-controller": ":9999",
        "disable-keep-alive": !keepAliveEnabled,
        "profile": { "store-selected": true }
    });

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