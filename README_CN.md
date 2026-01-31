# Nikki_fallback_Rule-Set 配置指南

## 📋 文件概述

**名称**: Nikki_fallback_Rule-Set  
**版本**: V2026.1.30  
**内核**: Mihomo / Clash / OpenClash  
**优化**: 基于 Sub-Store.js V5.9.3，适配 Nikki 插件

---

## 🔧 使用前必读

### 1. 必须配置项（两处修改）

#### ① 代理订阅地址（第 15 行）
```yaml
url: '机场订阅'  # 替换为实际的 Sub.link 或 Panel 订阅地址
```
**示例**:
```yaml
url: 'https://sub.example.com/link/xxxxxxxxxxxxxx?clash=clashx'
```

#### ② 机场名称（第 9 行）
```yaml
机场名:  # 需替换为真实的机场标识符（如：IEPL、AirPort、TL 等）
```

---

## 📊 配置结构解析

### I. 代理集合 (Proxy Providers)
- **类型**: HTTP 订阅拉取
- **更新间隔**: 86400秒（1天）
- **健康检查**: 每5分钟检测一次（Cloudflare 204 检测）
- **节点过滤**: 自动排除过期、剩余流量等关键词节点
- **前缀标记**: 不可用节点自动标记 `[Xx]` 前缀

### II. 核心配置
| 配置项 | 值 | 说明 |
|---------|-------|--------|
| 混合端口 | 7893 | HTTP + SOCKS5 代理端口 |
| 工作模式 | rule | 规则模式分流 |
| 局域网 | true | LAN 设备可通过本机代理 |
| 面板 | Zashboard | Web UI 访问地址: http://localhost:9090 |

### III. 网卡模式 (TUN)
- **启用**: true（虚拟网卡模式，拦截系统所有 DNS 查询）
- **网络栈**: system（系统栈）
- **DNS 劫持**: 0.0.0.0:53（UDP/TCP 53 端口）

### IV. 协议嗅探 (Sniffer)
**强制嗅探对象**:
- Netflix（流媒体识别）
- Disney+（迪士尼流媒体）
- OpenAI（ChatGPT）
- Anthropic（Claude）
- Google API（API 调用识别）

**跳过嗅探对象**:
- Apple（避免苹果服务干扰）
- 小米设备（IoT 设备）
- 花生壳、向日葵（内网穿透）

### V. DNS 配置
| 类型 | 服务商 | 用途 |
|------|---------|--------|
| **主 DNS** | 腾讯 DoH | HTTPS 加密查询 |
| **主 DNS** | 阿里云 DoH | HTTPS 加密查询 |
| **备用 DNS** | 114 公共 | 应急备用 |
| **备用 DNS** | 阿里云 DoT | TLS 加密查询 |

**Fake-IP 过滤**:
- `.lan` 域名：本地局域网（返回真实 IP）
- `rule-set:cn_domain`：大陆域名（返回真实 IP，Mihomo 专用）

---

## 🎯 策略组设计

### 主要策略组
| 组名 | 类型 | 功能 | 优先级 |
|------|------|------|--------|
| 🚀 节点选择 | select | 手动选择代理 | 1 |
| ⚡ 自动切换 | fallback | 故障转移（容灾） | 2 |
| 🎯 手动切换 | select | 所有订阅节点 | - |

### 业务分流组
| 组名 | 优先级 | 说明 |
|------|---------|--------|
| 🤖 AI 服务 | 推荐美国 | ChatGPT、Claude、Gemini |
| 💰 加密货币 | 优先日本 | 交易所、钱包、NFT |
| 🔍 Bing | 优先直连 | 微软搜索（快速） |
| 📦 PT 下载 | 优先直连 | 私有种子网站（最快） |
| 🍎 Apple | 优先直连 | CDN 多地部署 |
| 📹 YouTube | 代理 | 视频流媒体 |
| 🎥 Netflix | 代理 + SNI 嗅探 | 流媒体识别 |
| 🎵 TikTok | 代理 | 短视频平台 |

### 地区分流组
- 🇭🇰 香港节点：URL-Test 自动选择最佳
- 🇹🇼 台湾节点：定期健康检查
- 🇯🇵 日本节点：加密货币优先
- 🇰🇷 韩国节点
- 🇸🇬 新加坡节点
- 🇺🇸 美国节点：AI/Google 推荐
- 🇪🇺 欧洲节点
- 🐟 其他节点：排除已分类节点

---

## 📐 规则匹配优先级

### 1. 基础拦截（最高优先级）
- 私有 IP（RFC1918）→ **直连**
- 私有域名（.local）→ **直连**
- 广告域名 → **阻止**
- 直连列表 → **直连**

### 2. 业务分流（内容类）
- AI 服务 → **🤖 AI 服务**
- 加密货币 → **💰 Crypto**（日本优先）
- Google → **🇬 Google**
- GitHub → **🤖 AI 服务**（推荐分离为独立组）
- YouTube → **📹 YouTube**
- Netflix → **🎥 Netflix**（SNI 嗅探）
- Disney+ → **🏰 Disney+**
- Telegram → **✈️ Telegram**

### 3. 厂商服务（直连优先）
- Apple → **直连**（CDN 全球部署）
- Microsoft → **直连**
- OneDrive → **直连**
- Bing 搜索 → **直连**（快速）

### 4. 地理位置（低优先级）
- 非大陆地理位置 → **🚀 节点选择**（代理）
- 大陆域名 → **🎯 全球直连**（直连）
- 大陆 IP → **🎯 全球直连**（直连）

### 5. 兜底规则（最低优先级）
- 不匹配以上规则 → **🐟 兜底节点**（故障转移）

---

## 📦 规则来源 (Rule Providers)

### 直连规则
- **direct_list**: 自定义直连域名列表（langhun/Rule）

### 域名规则（MetaCubeX）
- **private_domain**: RFC1918 私有域名
- **adblock_domain**: 广告域名（AdRules）
- **ai**: AI 服务（category-ai-!cn）
- **crypto_domain**: 加密货币（自定义）
- **github_domain**: GitHub
- **youtube_domain**: YouTube
- **google_domain**: Google
- **netflix_domain**: Netflix（SNI 识别）
- **spotify_domain**: Spotify
- **steam_cn_domain**: Steam 国内
- **cn_domain**: 大陆域名（Baidu、QQ、Taobao 等）

### IP 规则（CIDR）
- **apple_ip**: Apple IP 段（geo-lite 高精度库）
- **private_ip**: 私有 IP（192.168、10.0、172.16）
- **google_ip**: Google 数据中心 IP
- **telegram_ip**: Telegram 服务器 IP
- **cn_ip**: 中国 IP 段（CIDR）

---

## ⚙️ 高级配置说明

### DNS 兼容性注意
- **Mihomo 专用**: `rule-set:cn_domain` 语法
- **通用备选**: 可改用 `geosite:cn`

### Fake-IP 模式
- 拦截 DNS 查询，返回虚拟 IP（198.18.0.1/16）
- 防止 DNS 泄露，保护隐私
- 需要配合 TUN 模式使用

### 故障转移链
故障转移优先级（从上到下）:
1. 🇭🇰 香港
2. 🇹🇼 台湾
3. 🇯🇵 日本
4. 🇰🇷 韩国
5. 🇸🇬 新加坡
6. 🇺🇸 美国
7. 🎯 手动切换
8. 🎯 全球直连
9. 🐟 其他节点

---

## 🔍 故障排查

### 问题1: 某些网站无法访问
**可能原因**:
- 规则版本过旧（建议 24 小时更新一次）
- 节点被对方 IP 黑名单封禁
- 某个代理节点故障

**解决方案**:
1. 在 Web 面板手动切换不同节点测试
2. 查看 Mihomo 日志（log-level: debug）
3. 检查 rule-providers 是否正常更新

### 问题2: 大陆网站走了代理（速度慢）
**可能原因**:
- `cn_domain` 规则未正常更新
- 某些大陆新域名未被规则覆盖

**解决方案**:
1. 在 Direct.list 中手动添加域名
2. 在相应业务组的规则条目前加入特定规则
3. 可改用 IP 段规则（cn_ip）

### 问题3: DNS 解析超时
**可能原因**:
- DNS 上游连接失败
- Fake-IP 过滤规则冲突

**解决方案**:
1. 更换 nameserver（如使用 Cloudflare `1.1.1.1`）
2. 禁用 Fake-IP-Filter 中的规则集
3. 检查 TUN 模式是否正常启用

---

## 📝 自定义指南

### 添加直连域名
编辑 `Direct.list`，按行添加：
```
DOMAIN,example.com
DOMAIN-SUFFIX,.example.com
```

### 添加自定义规则组
在 proxy-groups 中添加:
```yaml
- {name: 🌐 自定义组, type: select, proxies: [🚀 节点选择, 🎯 全球直连]}
```

在 rules 中添加:
```yaml
- RULE-SET,custom_domain,🌐 自定义组
```

---

## 📞 支持信息

- **配置生成工具**: Sub-Store.js V5.9.3
- **核心引擎**: MetaCubeX Mihomo
- **地理数据**: MetaCubeX meta-rules-dat
- **Web 面板**: Zashboard

---

## ✅ 最后检查清单

- [ ] 已替换真实的代理订阅地址
- [ ] 已确认机场名称正确
- [ ] 已启用 Fake-IP 防 DNS 泄露
- [ ] 已验证地区节点正常健康检查
- [ ] 已根据需要自定义规则

**配置完成后请重启 Mihomo 内核使其生效！**

---

*最后更新: 2026年1月30日 | 适配内核: Mihomo 1.x+*
