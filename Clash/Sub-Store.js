/*
powerfullz 的 Substore 订阅转换脚本 (Fixed & Optimized by LabulaLiu)
https://github.com/powerfullz/override-rules

支持的传入参数 (Arguments)：
- loadbalance: 启用负载均衡（url-test -> load-balance，默认 false）
- landing:     启用落地节点/家宽分组功能（默认 false）
- ipv6:        启用 IPv6 支持（默认 false）
- full:        输出完整配置（适合纯内核启动，默认 false）
- keepalive:   启用 tcp-keep-alive（默认 false）
- fakeip:      DNS 使用 FakeIP 模式（默认 false，false 为 RedirHost）
- quic:        允许 QUIC 流量（UDP 443，默认 false，建议关闭以防 QoS）
- threshold:   国家节点数量小于该值时不显示分组 (默认 0)

使用示例：
loadbalance=true&landing=true&fakeip=true&threshold=2
*/

const NODE_SUFFIX = "节点";

// ==================== 工具函数 Utils ====================

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

// 解析参数
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

// ==================== 逻辑处理 Logic ====================

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
};

// 过滤无效值构建数组
const buildList = (...elements) => elements.flat().filter(Boolean);

function buildBaseLists({ landing, lowCost, countryGroupNames }) {
    // “选择节点”组的候选列表
    const defaultSelector = buildList(
        PROXY_GROUPS.FALLBACK,
        landing && PROXY_GROUPS.LANDING,
        countryGroupNames,
        lowCost && PROXY_GROUPS.LOW_COST,
        PROXY_GROUPS.MANUAL,
        "DIRECT"
    );

    // 默认列表
    const defaultProxies = buildList(
        PROXY_GROUPS.SELECT,
        countryGroupNames,
        lowCost && PROXY_GROUPS.LOW_COST,
        PROXY_GROUPS.MANUAL,
        PROXY_GROUPS.DIRECT
    );

    // 直连优先列表
    const defaultProxiesDirect = buildList(
        PROXY_GROUPS.DIRECT,
        countryGroupNames,
        lowCost && PROXY_GROUPS.LOW_COST,
        PROXY_GROUPS.SELECT,
        PROXY_GROUPS.MANUAL
    );

    // 故障转移列表
    const defaultFallback = buildList(
        landing && PROXY_GROUPS.LANDING,
        countryGroupNames,
        lowCost && PROXY_GROUPS.LOW_COST,
        PROXY_GROUPS.MANUAL,
        "DIRECT"
    );

    return { defaultProxies, defaultProxiesDirect, defaultSelector, defaultFallback };
}

// ==================== 规则与配置 Configuration ====================

const ruleProviders = {
    "LocalAreaNetwork": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/LocalAreaNetwork.list",
        "path": "./ruleset/ACL4SSR/LocalAreaNetwork.list"
    },
    "ADBlock": {
        "type": "http",
        "behavior": "domain",
        "format": "mrs",
        "interval": 86400,
        "url": "https://adrules.top/adrules-mihomo.mrs",
        "path": "./ruleset/ADBlock.mrs"
    },
    "BanAD": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/BanAD.list",
        "path": "./ruleset/ACL4SSR/BanAD.list"
    },
    "BanProgramAD": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/BanProgramAD.list",
        "path": "./ruleset/ACL4SSR/BanProgramAD.list"
    },
    "ChinaDomain": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list",
        "path": "./ruleset/ACL4SSR/ChinaDomain.list"
    },
    "ChinaCompanyIp": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ChinaCompanyIp.list",
        "path": "./ruleset/ACL4SSR/ChinaCompanyIp.list"
    },
    "Download": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Download.list",
        "path": "./ruleset/ACL4SSR/Download.list"
    },
    "ProxyGFWlist": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/ProxyGFWlist.list",
        "path": "./ruleset/ACL4SSR/ProxyGFWlist.list"
    },
    "OpenAI": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/openai.yaml",
        "path": "./ruleset/MetaCubeX/OpenAI.yaml"
    },
    "Gemini": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/classical/google-gemini.yaml",
        "path": "./ruleset/MetaCubeX/Gemini.yaml"
    },
    "AI": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/AI.list",
        "path": "./ruleset/ACL4SSR/AI.list"
    },
    "TikTok": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/TikTok.list",
        "path": "./ruleset/powerfullz/TikTok.list"
    },
    "Telegram": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list",
        "path": "./ruleset/ACL4SSR/Telegram.list"
    },
    "SteamCN": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/SteamCN.list",
        "path": "./ruleset/ACL4SSR/SteamCN.list"
    },
    "SteamFix": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/SteamFix.list",
        "path": "./ruleset/powerfullz/SteamFix.list"
    },
    "Epic": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/Ruleset/Epic.list",
        "path": "./ruleset/ACL4SSR/Epic.list"
    },
    "GoogleFCM": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/GoogleFCM.list",
        "path": "./ruleset/ACL4SSR/GoogleFCM.list"
    },
    "GoogleCN": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://testingcf.jsdelivr.net/gh/ACL4SSR/ACL4SSR@master/Clash/GoogleCN.list",
        "path": "./ruleset/ACL4SSR/GoogleCN.list"
    },
    "AdditionalFilter": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/AdditionalFilter.list",
        "path": "./ruleset/powerfullz/AdditionalFilter.list"
    },
    "Crypto": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/ruleset/Crypto.list",
        "path": "./ruleset/powerfullz/Crypto.list"
    },
    "Bing": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Bing.list",
        "path": "./ruleset/ACL4SSR/Bing.list"
    },
    "OneDrive": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/OneDrive.list",
        "path": "./ruleset/ACL4SSR/OneDrive.list"
    },
    "Microsoft": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list",
        "path": "./ruleset/ACL4SSR/Microsoft.list"
    },
    "Apple": {
        "type": "http",
        "behavior": "classical",
        "format": "text",
        "interval": 86400,
        "url": "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list",
        "path": "./ruleset/ACL4SSR/Apple.list"
    },
};

const baseRules = [
    `RULE-SET,ADBlock,广告拦截`,
    `RULE-SET,AdditionalFilter,广告拦截`,
    `RULE-SET,BanAD,广告拦截`,
    `RULE-SET,BanProgramAD,广告拦截`,
    `RULE-SET,Crypto,Crypto`,
    `RULE-SET,TikTok,TikTok`,
    `RULE-SET,Telegram,Telegram`,
    `RULE-SET,Bing,Bing`,
    `RULE-SET,OneDrive,OneDrive`,
    `RULE-SET,Microsoft,Microsoft`,
    `RULE-SET,Apple,Apple`,
    `RULE-SET,Epic,Games`,
    `RULE-SET,OpenAI,AI服务`,
    `RULE-SET,Gemini,AI服务`,

    "GEOSITE,CATEGORY-AI-!CN,AI服务",
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

    `DOMAIN,services.googleapis.cn,${PROXY_GROUPS.SELECT}`,
    `GEOSITE,GFW,${PROXY_GROUPS.SELECT}`,
    `RULE-SET,ProxyGFWlist,${PROXY_GROUPS.SELECT}`,
    `MATCH,${PROXY_GROUPS.SELECT}`,
];

function buildRules({ quicEnabled }) {
    const ruleList = [...baseRules];
    if (!quicEnabled) {
        // 屏蔽 QUIC 流量，避免网络环境 UDP 速度不佳时影响体验
        ruleList.unshift("AND,((DST-PORT,443),(NETWORK,UDP)),REJECT");
    }
    return ruleList;
}

// ==================== Sniffer & DNS ====================

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
        "Mijia Cloud",
        "dlg.io.mi.com",
        "+.push.apple.com"
    ]
};

function buildDnsConfig({ mode, fakeIpFilter }) {
    const config = {
        "enable": true,
        "ipv6": ipv6Enabled,
        "prefer-h3": true,
        "enhanced-mode": mode,
        "default-nameserver": ["119.29.29.29", "223.5.5.5"],
        "nameserver": [
            "system",
            "223.5.5.5",
            "119.29.29.29",
            "180.184.1.1",
            "114.114.114.114"
        ],
        "fallback": [
            "quic://dns0.eu",
            "https://dns.cloudflare.com/dns-query",
            "https://dns.sb/dns-query",
            "tcp://208.67.222.222",
            "tcp://8.26.56.2"
        ],
        "proxy-server-nameserver": [
            "https://dns.alidns.com/dns-query",
            "tls://dot.pub"
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
    fakeIpFilter: [
        "geosite:private",
        "geosite:connectivity-check",
        "geosite:cn",
        "Mijia Cloud",
        "dlg.io.mi.com", // Fixed typo: dig -> dlg
        "localhost.ptlogin2.qq.com",
        "*.icloud.com",
        "*.stun.*.*",
        "*.stun.*.*.*"
    ]
});

// ==================== 地理数据库配置 GeoData ====================

const geoxURL = {
    "geoip": "https://gcore.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geoip.dat",
    "geosite": "https://gcore.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat",
    "mmdb": "https://gcore.jsdelivr.net/gh/Loyalsoldier/geoip@release/Country.mmdb",
    "asn": "https://gcore.jsdelivr.net/gh/Loyalsoldier/geoip@release/GeoLite2-ASN.mmdb"
};

const countriesMeta = {
    "香港": {
        pattern: "(?i)香港|港|HK|hk|Hong Kong|HongKong|hongkong|🇭🇰",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png"
    },
    "澳门": {
        pattern: "(?i)澳门|MO|Macau|🇲🇴",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Macao.png"
    },
    "台湾": {
        pattern: "(?i)台|新北|彰化|TW|Taiwan|🇹🇼",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png"
    },
    "狮城": {
        pattern: "(?i)新加坡|坡|狮城|SG|Singapore|🇸🇬",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png"
    },
    "日本": {
        pattern: "(?i)日本|川日|东京|大阪|泉日|埼玉|沪日|深日|JP|Japan|🇯🇵",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png"
    },
    "韩国": {
        pattern: "(?i)KR|Korea|KOR|首尔|韩|韓|🇰🇷",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Korea.png"
    },
    "美国": {
        pattern: "(?i)美国|美|US|United States|🇺🇸",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png"
    },
    "枫叶": {
        pattern: "(?i)加拿大|Canada|CA|🇨🇦",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Canada.png"
    },
    "英国": {
        pattern: "(?i)英国|United Kingdom|UK|伦敦|London|🇬🇧",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_Kingdom.png"
    },
    "袋鼠": {
        pattern: "(?i)澳洲|澳大利亚|AU|Australia|🇦🇺",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Australia.png"
    },
    "德国": {
        pattern: "(?i)德国|德|DE|Germany|🇩🇪",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Germany.png"
    },
    "法国": {
        pattern: "(?i)法国|法|FR|France|🇫🇷",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/France.png"
    },
    "毛子": {
        pattern: "(?i)俄罗斯|俄|RU|Russia|🇷🇺",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Russia.png"
    },
    "泰国": {
        pattern: "(?i)泰国|泰|TH|Thailand|🇹🇭",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Thailand.png"
    },
    "印度": {
        pattern: "(?i)印度|IN|India|🇮🇳",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/India.png"
    },
    "大马": {
        pattern: "(?i)马来西亚|马来|MY|Malaysia|🇲🇾",
        icon: "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Malaysia.png"
    },
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
        compiledRegex[country] = new RegExp(
            meta.pattern.replace(/^\(\?i\)/, ''),
            'i'
        );
    }

    for (const proxy of proxies) {
        // 安全检查：如果 proxy.name 不存在则跳过
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
                "interval": 60,
                "tolerance": 20,
                "lazy": false
            });
        }
        groups.push(groupConfig);
    }
    return groups;
}

function buildProxyGroups({
    landing,
    countries,
    countryProxyGroups,
    lowCost,
    defaultSelector,
    defaultFallback,
    defaultProxies,
    defaultProxiesDirect
}) {
    const hasTW = countries.includes("台湾");
    const hasHK = countries.includes("香港");
    
    // 前置代理组选择器：排除落地和Fallback防止死循环
    const frontProxySelector = landing
        ? defaultSelector.filter(name => name !== PROXY_GROUPS.LANDING && name !== PROXY_GROUPS.FALLBACK)
        : [];
    
    // Bilibili 策略：如果同时有港台，只允许港台+直连，否则走 Default Direct
    const bilibiliProxies = (hasTW && hasHK) 
        ? [PROXY_GROUPS.DIRECT, "台湾节点", "香港节点"] 
        : defaultProxiesDirect;

    return [
        {
            "name": PROXY_GROUPS.SELECT,
            "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png",
            "type": "select",
            "proxies": defaultSelector
        },
        {
            "name": PROXY_GROUPS.MANUAL,
            "icon": "https://gcore.jsdelivr.net/gh/shindgewongxj/WHATSINStash@master/icon/select.png",
            "include-all": true,
            "type": "select"
        },
        (landing) ? {
            "name": "前置代理",
            "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Area.png",
            "type": "select",
            "include-all": true,
            "exclude-filter": "(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地",
            "proxies": frontProxySelector
        } : null,
        (landing) ? {
            "name": PROXY_GROUPS.LANDING,
            "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Airport.png",
            "type": "select",
            "include-all": true,
            "filter": "(?i)家宽|家庭|家庭宽带|商宽|商业宽带|星链|Starlink|落地",
        } : null,
        {
            "name": PROXY_GROUPS.FALLBACK,
            "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bypass.png",
            "type": "fallback",
            "url": "https://cp.cloudflare.com/generate_204",
            "proxies": defaultFallback,
            "interval": 180,
            "tolerance": 20,
            "lazy": false
        },
        // ... 应用策略组 ...
        {
            "name": "AI服务",
            "icon": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/icons/chatgpt.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Telegram",
            "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "YouTube",
            "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Bilibili",
            "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/bilibili.png",
            "type": "select",
            "proxies": bilibiliProxies
        },
        {
            "name": "Netflix",
            "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Spotify",
            "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Spotify.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "TikTok",
            "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/TikTok.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Crypto",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Cryptocurrency_3.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "GitHub",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/GitHub.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Bing",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Microsoft.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "OneDrive",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/OneDrive.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Microsoft",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Microsoft.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Apple",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Apple.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Google",
            "icon": "https://gcore.jsdelivr.net/gh/powerfullz/override-rules@master/icons/Google.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Steam",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Steam.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "Games",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Game.png",
            "type": "select",
            "proxies": defaultProxies
        },
        {
            "name": "PT站点",
            "icon": "https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Download.png",
            "type": "select",
            "proxies": defaultProxiesDirect
        },
        {
            "name": "广告拦截",
            "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/AdBlack.png",
            "type": "select",
            "proxies": ["REJECT", "REJECT-DROP", PROXY_GROUPS.DIRECT]
        },
        {
            "name": PROXY_GROUPS.DIRECT,
            "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Direct.png",
            "type": "select",
            "proxies": ["DIRECT", PROXY_GROUPS.SELECT]
        },
        (lowCost) ? {
            "name": PROXY_GROUPS.LOW_COST,
            "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Lab.png",
            "type": "url-test",
            "url": "https://cp.cloudflare.com/generate_204",
            "include-all": true,
            "filter": "(?i)0\.[0-5]|低倍率|省流|大流量|实验性"
        } : null,
        ...countryProxyGroups
    ].filter(Boolean);
}

// ==================== 主入口 Main ====================

function main(config) {
    if (!config.proxies) {
        console.log("Error: No proxies found in config.");
        return config; 
    }
    const resultConfig = { proxies: config.proxies };
    
    // 1. 解析地区与低倍率信息
    const countryInfo = parseCountries(resultConfig); 
    const lowCost = hasLowCost(resultConfig);
    const countryGroupNames = getCountryGroupNames(countryInfo, countryThreshold);
    const countries = stripNodeSuffix(countryGroupNames);

    // 2. 构建基础候选列表
    const {
        defaultProxies,
        defaultProxiesDirect,
        defaultSelector,
        defaultFallback
    } = buildBaseLists({ landing, lowCost, countryGroupNames });

    // 3. 构建地区分组
    const countryProxyGroups = buildCountryProxyGroups({ countries, landing, loadBalance });

    // 4. 生成所有策略组
    const proxyGroups = buildProxyGroups({
        landing,
        countries,
        countryProxyGroups,
        lowCost,
        defaultProxies,
        defaultProxiesDirect,
        defaultSelector,
        defaultFallback
    });
    
    // 5. 添加 GLOBAL 组（兼容性）
    const globalProxies = proxyGroups.map(item => item.name);   
    proxyGroups.push({
        "name": "GLOBAL",
        "icon": "https://gcore.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png",
        "include-all": true,
        "type": "select",
        "proxies": globalProxies
    });

    const finalRules = buildRules({ quicEnabled });

    // 6. 完整配置注入 (如果启用了 full 参数)
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