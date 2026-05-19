/**
 * Sub-Store 节点过滤脚本：
 * 只保留“当前 OpenAI 官方支持使用 ChatGPT 的国家/地区”节点。
 *
 * 官方来源（本次核对时间：2026-05-19）：
 * https://help.openai.com/en/articles/7947663-chatgpt-supported-countries
 *
 * 规则：
 * 1. 优先使用 Sub-Store 内置 `ProxyUtils.getISO()` 做国家识别。
 * 2. 内置识别失败时，再按 name / server / sni / host 等字段做别名兜底。
 * 3. 仍无法识别的节点，默认丢弃。
 * 4. 若整批节点 0 命中，为避免误杀导致订阅清空，会自动回退原始节点数组。
 *
 * 用法：
 * 1. 可直接作为 Sub-Store Script Operator 使用。
 * 2. 也可作为 Sub-Store File 脚本使用；File 模式下会自动拉取下方配置的 collection。
 * 函数签名兼容常见的 function operator(proxies) 形式。
 */

const FILE_MODE_SOURCE = Object.freeze({
  type: "collection",
  name: "zz",
  internalPlatform: "ClashMeta",
  outputPlatform: "V2Ray"
});

const OFFICIAL_SUPPORTED_REGIONS = Object.freeze([
  "Albania",
  "Algeria",
  "Afghanistan",
  "Aland Islands",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Aruba",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belgium",
  "Belize",
  "Bermuda",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cayman Islands",
  "Central African Republic",
  "Chad",
  "Chile",
  "Colombia",
  "Comoros",
  "Congo (Brazzaville)",
  "Congo (DRC)",
  "Costa Rica",
  "Cote d'Ivoire",
  "Croatia",
  "Cyprus",
  "Czechia (Czech Republic)",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini (Swaziland)",
  "Ethiopia",
  "Faroe Islands",
  "Fiji",
  "Finland",
  "France",
  "French Guiana",
  "French Polynesia",
  "French Southern Territories",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Greenland",
  "Guatemala",
  "Guadeloupe",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Holy See (Vatican City)",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Martinique",
  "Mauritania",
  "Mauritius",
  "Mayotte",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Reunion",
  "Romania",
  "Rwanda",
  "Saint Barthelemy",
  "Saint Helena",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Martin (French part)",
  "Saint Pierre and Miquelon",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Sudan",
  "Svalbard and Jan Mayen",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste (East Timor)",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States of America",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vietnam",
  "Wallis and Futuna",
  "Yemen",
  "Zambia",
  "Zimbabwe"
]);

const SUPPORTED_REGION_TO_ISO = Object.freeze({
  "Albania": "AL",
  "Algeria": "DZ",
  "Afghanistan": "AF",
  "Aland Islands": "AX",
  "Andorra": "AD",
  "Angola": "AO",
  "Antigua and Barbuda": "AG",
  "Argentina": "AR",
  "Armenia": "AM",
  "Aruba": "AW",
  "Australia": "AU",
  "Austria": "AT",
  "Azerbaijan": "AZ",
  "Bahamas": "BS",
  "Bahrain": "BH",
  "Bangladesh": "BD",
  "Barbados": "BB",
  "Belgium": "BE",
  "Belize": "BZ",
  "Bermuda": "BM",
  "Benin": "BJ",
  "Bhutan": "BT",
  "Bolivia": "BO",
  "Bosnia and Herzegovina": "BA",
  "Botswana": "BW",
  "Brazil": "BR",
  "Brunei": "BN",
  "Bulgaria": "BG",
  "Burkina Faso": "BF",
  "Burundi": "BI",
  "Cabo Verde": "CV",
  "Cambodia": "KH",
  "Cameroon": "CM",
  "Canada": "CA",
  "Cayman Islands": "KY",
  "Central African Republic": "CF",
  "Chad": "TD",
  "Chile": "CL",
  "Colombia": "CO",
  "Comoros": "KM",
  "Congo (Brazzaville)": "CG",
  "Congo (DRC)": "CD",
  "Costa Rica": "CR",
  "Cote d'Ivoire": "CI",
  "Croatia": "HR",
  "Cyprus": "CY",
  "Czechia (Czech Republic)": "CZ",
  "Denmark": "DK",
  "Djibouti": "DJ",
  "Dominica": "DM",
  "Dominican Republic": "DO",
  "Ecuador": "EC",
  "Egypt": "EG",
  "El Salvador": "SV",
  "Equatorial Guinea": "GQ",
  "Eritrea": "ER",
  "Estonia": "EE",
  "Eswatini (Swaziland)": "SZ",
  "Ethiopia": "ET",
  "Faroe Islands": "FO",
  "Fiji": "FJ",
  "Finland": "FI",
  "France": "FR",
  "French Guiana": "GF",
  "French Polynesia": "PF",
  "French Southern Territories": "TF",
  "Gabon": "GA",
  "Gambia": "GM",
  "Georgia": "GE",
  "Germany": "DE",
  "Ghana": "GH",
  "Greece": "GR",
  "Grenada": "GD",
  "Greenland": "GL",
  "Guatemala": "GT",
  "Guadeloupe": "GP",
  "Guinea": "GN",
  "Guinea-Bissau": "GW",
  "Guyana": "GY",
  "Haiti": "HT",
  "Holy See (Vatican City)": "VA",
  "Honduras": "HN",
  "Hungary": "HU",
  "Iceland": "IS",
  "India": "IN",
  "Indonesia": "ID",
  "Iraq": "IQ",
  "Ireland": "IE",
  "Israel": "IL",
  "Italy": "IT",
  "Jamaica": "JM",
  "Japan": "JP",
  "Jordan": "JO",
  "Kazakhstan": "KZ",
  "Kenya": "KE",
  "Kiribati": "KI",
  "Kuwait": "KW",
  "Kyrgyzstan": "KG",
  "Laos": "LA",
  "Latvia": "LV",
  "Lebanon": "LB",
  "Lesotho": "LS",
  "Liberia": "LR",
  "Libya": "LY",
  "Liechtenstein": "LI",
  "Lithuania": "LT",
  "Luxembourg": "LU",
  "Madagascar": "MG",
  "Malawi": "MW",
  "Malaysia": "MY",
  "Maldives": "MV",
  "Mali": "ML",
  "Malta": "MT",
  "Marshall Islands": "MH",
  "Martinique": "MQ",
  "Mauritania": "MR",
  "Mauritius": "MU",
  "Mayotte": "YT",
  "Mexico": "MX",
  "Micronesia": "FM",
  "Moldova": "MD",
  "Monaco": "MC",
  "Mongolia": "MN",
  "Montenegro": "ME",
  "Morocco": "MA",
  "Mozambique": "MZ",
  "Myanmar": "MM",
  "Namibia": "NA",
  "Nauru": "NR",
  "Nepal": "NP",
  "Netherlands": "NL",
  "New Caledonia": "NC",
  "New Zealand": "NZ",
  "Nicaragua": "NI",
  "Niger": "NE",
  "Nigeria": "NG",
  "North Macedonia": "MK",
  "Norway": "NO",
  "Oman": "OM",
  "Pakistan": "PK",
  "Palau": "PW",
  "Palestine": "PS",
  "Panama": "PA",
  "Papua New Guinea": "PG",
  "Paraguay": "PY",
  "Peru": "PE",
  "Philippines": "PH",
  "Poland": "PL",
  "Portugal": "PT",
  "Qatar": "QA",
  "Reunion": "RE",
  "Romania": "RO",
  "Rwanda": "RW",
  "Saint Barthelemy": "BL",
  "Saint Helena": "SH",
  "Saint Kitts and Nevis": "KN",
  "Saint Lucia": "LC",
  "Saint Martin (French part)": "MF",
  "Saint Pierre and Miquelon": "PM",
  "Saint Vincent and the Grenadines": "VC",
  "Samoa": "WS",
  "San Marino": "SM",
  "Sao Tome and Principe": "ST",
  "Saudi Arabia": "SA",
  "Senegal": "SN",
  "Serbia": "RS",
  "Seychelles": "SC",
  "Sierra Leone": "SL",
  "Singapore": "SG",
  "Slovakia": "SK",
  "Slovenia": "SI",
  "Solomon Islands": "SB",
  "Somalia": "SO",
  "South Africa": "ZA",
  "South Korea": "KR",
  "South Sudan": "SS",
  "Spain": "ES",
  "Sri Lanka": "LK",
  "Suriname": "SR",
  "Sweden": "SE",
  "Switzerland": "CH",
  "Sudan": "SD",
  "Svalbard and Jan Mayen": "SJ",
  "Taiwan": "TW",
  "Tajikistan": "TJ",
  "Tanzania": "TZ",
  "Thailand": "TH",
  "Timor-Leste (East Timor)": "TL",
  "Togo": "TG",
  "Tonga": "TO",
  "Trinidad and Tobago": "TT",
  "Tunisia": "TN",
  "Turkey": "TR",
  "Turkmenistan": "TM",
  "Tuvalu": "TV",
  "Uganda": "UG",
  "Ukraine": "UA",
  "United Arab Emirates": "AE",
  "United Kingdom": "GB",
  "United States of America": "US",
  "Uruguay": "UY",
  "Uzbekistan": "UZ",
  "Vanuatu": "VU",
  "Vietnam": "VN",
  "Wallis and Futuna": "WF",
  "Yemen": "YE",
  "Zambia": "ZM",
  "Zimbabwe": "ZW"
});

const EXTRA_ALIASES = Object.freeze({
  "Albania": ["阿尔巴尼亚", "ALB", "Tirana", "地拉那"],
  "Algeria": ["阿尔及利亚", "DZA", "Algiers", "阿尔及尔"],
  "Afghanistan": ["阿富汗", "AFG", "Kabul", "喀布尔"],
  "Aland Islands": ["Åland Islands", "Aland", "奥兰群岛"],
  "Andorra": ["安道尔", "AND"],
  "Angola": ["安哥拉", "AGO", "Luanda", "罗安达"],
  "Antigua and Barbuda": ["安提瓜和巴布达", "ATG"],
  "Argentina": ["阿根廷", "AR", "ARG", "Buenos Aires", "布宜诺斯艾利斯"],
  "Armenia": ["亚美尼亚", "AM", "ARM", "Yerevan", "埃里温"],
  "Aruba": ["阿鲁巴"],
  "Australia": ["澳大利亚", "澳洲", "袋鼠", "AU", "AUS", "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "悉尼", "墨尔本", "布里斯班", "珀斯", "阿德莱德", "🇦🇺"],
  "Austria": ["奥地利", "AT", "AUT", "Vienna", "维也纳"],
  "Azerbaijan": ["阿塞拜疆", "AZ", "AZE", "Baku", "巴库"],
  "Bahamas": ["巴哈马", "BHS"],
  "Bahrain": ["巴林", "BH", "BHR", "Manama", "麦纳麦"],
  "Bangladesh": ["孟加拉", "孟加拉国", "BD", "BGD", "Dhaka", "达卡"],
  "Barbados": ["巴巴多斯", "BRB"],
  "Belgium": ["比利时", "BE", "BEL", "Brussels", "布鲁塞尔"],
  "Belize": ["伯利兹", "BLZ"],
  "Bermuda": ["百慕大", "BMU"],
  "Benin": ["贝宁", "BEN"],
  "Bhutan": ["不丹", "BTN"],
  "Bolivia": ["玻利维亚", "BO", "BOL", "La Paz", "Santa Cruz", "拉巴斯", "圣克鲁斯"],
  "Bosnia and Herzegovina": ["波黑", "波斯尼亚", "波斯尼亚和黑塞哥维那", "BA", "BIH", "Sarajevo", "萨拉热窝"],
  "Botswana": ["博茨瓦纳", "BWA"],
  "Brazil": ["巴西", "BR", "BRA", "Sao Paulo", "São Paulo", "圣保罗", "Rio", "里约", "🇧🇷"],
  "Brunei": ["文莱", "BN", "BRN"],
  "Bulgaria": ["保加利亚", "BG", "BGR", "Sofia", "索菲亚"],
  "Burkina Faso": ["布基纳法索", "BFA"],
  "Burundi": ["布隆迪", "BDI"],
  "Cabo Verde": ["Cape Verde", "佛得角", "CPV"],
  "Cambodia": ["柬埔寨", "KH", "KHM", "Phnom Penh", "金边"],
  "Cameroon": ["喀麦隆", "CMR"],
  "Canada": ["加拿大", "枫叶", "CA", "CAN", "Toronto", "Vancouver", "Montreal", "多伦多", "温哥华", "蒙特利尔", "🇨🇦"],
  "Cayman Islands": ["开曼群岛", "CYM"],
  "Central African Republic": ["中非", "中非共和国", "CAF"],
  "Chad": ["乍得", "TCD"],
  "Chile": ["智利", "CL", "CHL", "Santiago", "圣地亚哥"],
  "Colombia": ["哥伦比亚", "CO", "COL", "Bogota", "Bogotá", "波哥大"],
  "Comoros": ["科摩罗", "COM"],
  "Congo (Brazzaville)": ["刚果(布)", "刚果布", "Congo Brazzaville", "COG", "Brazzaville"],
  "Congo (DRC)": ["刚果(金)", "刚果金", "DRC", "COD", "Congo DRC", "Kinshasa", "金沙萨"],
  "Costa Rica": ["哥斯达黎加", "CRI"],
  "Cote d'Ivoire": ["Côte d'Ivoire", "Ivory Coast", "科特迪瓦", "CIV", "Abidjan", "阿比让"],
  "Croatia": ["克罗地亚", "HR", "HRV", "Zagreb", "萨格勒布"],
  "Cyprus": ["塞浦路斯", "CY", "CYP", "Nicosia", "尼科西亚"],
  "Czechia (Czech Republic)": ["Czechia", "Czech Republic", "捷克", "CZ", "CZE", "Prague", "布拉格"],
  "Denmark": ["丹麦", "DK", "DNK", "Copenhagen", "哥本哈根"],
  "Djibouti": ["吉布提", "DJI"],
  "Dominica": ["多米尼克", "DMA"],
  "Dominican Republic": ["多米尼加", "多米尼加共和国", "DOM"],
  "Ecuador": ["厄瓜多尔", "EC", "ECU", "Quito", "基多"],
  "Egypt": ["埃及", "EG", "EGY", "Cairo", "开罗"],
  "El Salvador": ["萨尔瓦多", "SLV"],
  "Equatorial Guinea": ["赤道几内亚", "GNQ"],
  "Eritrea": ["厄立特里亚", "ERI"],
  "Estonia": ["爱沙尼亚", "EE", "EST", "Tallinn", "塔林"],
  "Eswatini (Swaziland)": ["Eswatini", "Swaziland", "斯威士兰", "斯威士兰王国", "SWZ"],
  "Ethiopia": ["埃塞俄比亚", "ETH"],
  "Faroe Islands": ["法罗群岛", "FRO"],
  "Fiji": ["斐济", "FJI"],
  "Finland": ["芬兰", "FI", "FIN", "Helsinki", "赫尔辛基"],
  "France": ["法国", "FR", "FRA", "Paris", "Marseille", "巴黎", "马赛", "🇫🇷"],
  "French Guiana": ["法属圭亚那", "GUF"],
  "French Polynesia": ["法属波利尼西亚", "PYF", "Tahiti", "大溪地"],
  "French Southern Territories": ["法属南部领地"],
  "Gabon": ["加蓬", "GAB"],
  "Gambia": ["冈比亚", "GMB"],
  "Georgia": ["格鲁吉亚", "GE", "GEO", "Tbilisi", "第比利斯"],
  "Germany": ["德国", "DE", "DEU", "Frankfurt", "Berlin", "Munich", "法兰克福", "柏林", "慕尼黑", "🇩🇪"],
  "Ghana": ["加纳", "GHA"],
  "Greece": ["希腊", "GR", "GRC", "Athens", "雅典"],
  "Grenada": ["格林纳达", "GRD"],
  "Greenland": ["格陵兰", "GRL"],
  "Guatemala": ["危地马拉", "GTM"],
  "Guadeloupe": ["瓜德罗普", "GLP"],
  "Guinea": ["几内亚", "GIN"],
  "Guinea-Bissau": ["几内亚比绍", "GNB"],
  "Guyana": ["圭亚那", "GUY"],
  "Haiti": ["海地", "HTI"],
  "Holy See (Vatican City)": ["Holy See", "Vatican City", "梵蒂冈", "VAT"],
  "Honduras": ["洪都拉斯", "HND"],
  "Hungary": ["匈牙利", "HU", "HUN", "Budapest", "布达佩斯"],
  "Iceland": ["冰岛", "IS", "ISL", "Reykjavik", "雷克雅未克"],
  "India": ["印度", "IN", "IND", "Mumbai", "Bombay", "Delhi", "Chennai", "Bangalore", "孟买", "德里", "金奈", "班加罗尔", "🇮🇳"],
  "Indonesia": ["印尼", "印度尼西亚", "ID", "IDN", "Indonesia", "Jakarta", "Surabaya", "雅加达", "泗水", "🇮🇩"],
  "Iraq": ["伊拉克", "IRQ", "Baghdad", "巴格达"],
  "Ireland": ["爱尔兰", "IE", "IRL", "Dublin", "都柏林"],
  "Israel": ["以色列", "IL", "ISR", "Tel Aviv", "Jerusalem", "特拉维夫", "耶路撒冷"],
  "Italy": ["意大利", "IT", "ITA", "Milan", "Rome", "米兰", "罗马", "🇮🇹"],
  "Jamaica": ["牙买加", "JAM"],
  "Japan": ["日本", "JP", "JPN", "Tokyo", "Osaka", "Nagoya", "Fukuoka", "Saitama", "东京", "大阪", "名古屋", "福冈", "埼玉", "🇯🇵"],
  "Jordan": ["约旦", "JO", "JOR", "Amman", "安曼"],
  "Kazakhstan": ["哈萨克", "哈萨克斯坦", "KZ", "KAZ", "Almaty", "Astana", "阿拉木图", "阿斯塔纳"],
  "Kenya": ["肯尼亚", "KE", "KEN", "Nairobi", "内罗毕"],
  "Kiribati": ["基里巴斯", "KIR"],
  "Kuwait": ["科威特", "KW", "KWT", "Kuwait City", "科威特城"],
  "Kyrgyzstan": ["吉尔吉斯", "吉尔吉斯斯坦", "KG", "KGZ", "Bishkek", "比什凯克"],
  "Laos": ["老挝", "LA", "LAO", "Vientiane", "万象"],
  "Latvia": ["拉脱维亚", "LV", "LVA", "Riga", "里加"],
  "Lebanon": ["黎巴嫩", "LB", "LBN", "Beirut", "贝鲁特"],
  "Lesotho": ["莱索托", "LSO"],
  "Liberia": ["利比里亚", "LBR"],
  "Libya": ["利比亚", "LY", "LBY", "Tripoli", "的黎波里"],
  "Liechtenstein": ["列支敦士登", "LIE"],
  "Lithuania": ["立陶宛", "LT", "LTU", "Vilnius", "维尔纽斯"],
  "Luxembourg": ["卢森堡", "LU", "LUX", "Luxembourg City", "卢森堡市"],
  "Madagascar": ["马达加斯加", "MDG"],
  "Malawi": ["马拉维", "MWI"],
  "Malaysia": ["马来西亚", "大马", "MY", "MYS", "Kuala Lumpur", "Penang", "Johor", "吉隆坡", "槟城", "柔佛", "🇲🇾"],
  "Maldives": ["马尔代夫", "MDV"],
  "Mali": ["马里", "MLI"],
  "Malta": ["马耳他", "MT", "MLT", "Valletta", "瓦莱塔"],
  "Marshall Islands": ["马绍尔群岛", "MHL"],
  "Martinique": ["马提尼克", "MTQ"],
  "Mauritania": ["毛里塔尼亚", "MRT"],
  "Mauritius": ["毛里求斯", "MUS"],
  "Mayotte": ["马约特", "MYT"],
  "Mexico": ["墨西哥", "MX", "MEX", "Mexico City", "墨西哥城", "🇲🇽"],
  "Micronesia": ["密克罗尼西亚", "FSM"],
  "Moldova": ["摩尔多瓦", "MD", "MDA", "Chisinau", "Chișinău", "基希讷乌"],
  "Monaco": ["摩纳哥", "MCO"],
  "Mongolia": ["蒙古", "MN", "MNG", "Ulaanbaatar", "乌兰巴托"],
  "Montenegro": ["黑山", "ME", "MNE", "Podgorica", "波德戈里察"],
  "Morocco": ["摩洛哥", "MA", "MAR", "Casablanca", "Rabat", "卡萨布兰卡", "拉巴特"],
  "Mozambique": ["莫桑比克", "MOZ"],
  "Myanmar": ["缅甸", "MM", "MMR", "Yangon", "仰光"],
  "Namibia": ["纳米比亚", "NAM"],
  "Nauru": ["瑙鲁", "NRU"],
  "Nepal": ["尼泊尔", "NP", "NPL", "Kathmandu", "加德满都"],
  "Netherlands": ["荷兰", "NL", "NLD", "Amsterdam", "Rotterdam", "阿姆斯特丹", "鹿特丹", "🇳🇱"],
  "New Caledonia": ["新喀里多尼亚", "NCL"],
  "New Zealand": ["新西兰", "NZ", "NZL", "Auckland", "奥克兰", "🇳🇿"],
  "Nicaragua": ["尼加拉瓜", "NIC"],
  "Niger": ["尼日尔", "NER"],
  "Nigeria": ["尼日利亚", "NG", "NGA", "Lagos", "Abuja", "拉各斯", "阿布贾"],
  "North Macedonia": ["北马其顿", "马其顿", "MK", "MKD", "Skopje", "斯科普里"],
  "Norway": ["挪威", "NO", "NOR", "Oslo", "奥斯陆"],
  "Oman": ["阿曼", "OM", "OMN", "Muscat", "马斯喀特"],
  "Pakistan": ["巴基斯坦", "PK", "PAK", "Karachi", "Islamabad", "Lahore", "卡拉奇", "伊斯兰堡", "拉合尔"],
  "Palau": ["帕劳", "PLW"],
  "Palestine": ["巴勒斯坦", "PSE"],
  "Panama": ["巴拿马", "PA", "PAN", "Panama City", "巴拿马城"],
  "Papua New Guinea": ["巴布亚新几内亚", "PNG"],
  "Paraguay": ["巴拉圭", "PY", "PRY", "Asuncion", "Asunción", "亚松森"],
  "Peru": ["秘鲁", "PE", "PER", "Lima", "利马"],
  "Philippines": ["菲律宾", "PH", "PHL", "Manila", "Cebu", "Davao", "马尼拉", "宿务", "达沃", "🇵🇭"],
  "Poland": ["波兰", "PL", "POL", "Warsaw", "华沙"],
  "Portugal": ["葡萄牙", "PT", "PRT", "Lisbon", "Porto", "里斯本", "波尔图"],
  "Qatar": ["卡塔尔", "QA", "QAT", "Doha", "多哈"],
  "Reunion": ["Réunion", "留尼汪", "REU"],
  "Romania": ["罗马尼亚", "RO", "ROU", "Bucharest", "布加勒斯特"],
  "Rwanda": ["卢旺达", "RWA"],
  "Saint Barthelemy": ["Saint Barthélemy", "圣巴泰勒米"],
  "Saint Helena": ["圣赫勒拿"],
  "Saint Kitts and Nevis": ["圣基茨和尼维斯"],
  "Saint Lucia": ["圣卢西亚"],
  "Saint Martin (French part)": ["Saint Martin", "法属圣马丁"],
  "Saint Pierre and Miquelon": ["圣皮埃尔和密克隆"],
  "Saint Vincent and the Grenadines": ["圣文森特和格林纳丁斯"],
  "Samoa": ["萨摩亚", "WSM"],
  "San Marino": ["圣马力诺", "SMR"],
  "Sao Tome and Principe": ["São Tomé and Príncipe", "圣多美和普林西比", "STP"],
  "Saudi Arabia": ["沙特", "沙特阿拉伯", "SA", "SAU", "Riyadh", "Jeddah", "利雅得", "吉达"],
  "Senegal": ["塞内加尔", "SEN"],
  "Serbia": ["塞尔维亚", "RS", "SRB", "Belgrade", "贝尔格莱德"],
  "Seychelles": ["塞舌尔", "SYC"],
  "Sierra Leone": ["塞拉利昂", "SLE"],
  "Singapore": ["新加坡", "狮城", "SG", "SGP", "Singapore", "🇸🇬"],
  "Slovakia": ["斯洛伐克", "SK", "SVK", "Bratislava", "布拉迪斯拉发"],
  "Slovenia": ["斯洛文尼亚", "SI", "SVN", "Ljubljana", "卢布尔雅那"],
  "Solomon Islands": ["所罗门群岛", "SLB"],
  "Somalia": ["索马里", "SOM"],
  "South Africa": ["南非", "ZA", "ZAF", "Johannesburg", "Cape Town", "约翰内斯堡", "开普敦"],
  "South Korea": ["韩国", "KR", "KOR", "Korea", "Seoul", "首尔", "🇰🇷"],
  "South Sudan": ["南苏丹", "SSD"],
  "Spain": ["西班牙", "ES", "ESP", "Madrid", "Barcelona", "马德里", "巴塞罗那", "🇪🇸"],
  "Sri Lanka": ["斯里兰卡", "LK", "LKA", "Colombo", "科伦坡"],
  "Suriname": ["苏里南", "SUR"],
  "Sweden": ["瑞典", "SE", "SWE", "Stockholm", "斯德哥尔摩"],
  "Switzerland": ["瑞士", "CH", "CHE", "Zurich", "Geneva", "苏黎世", "日内瓦", "🇨🇭"],
  "Sudan": ["苏丹", "SD", "SDN"],
  "Svalbard and Jan Mayen": ["斯瓦尔巴和扬马延"],
  "Taiwan": ["台湾", "TW", "TWN", "Taipei", "台北", "新北", "🇹🇼"],
  "Tajikistan": ["塔吉克斯坦", "TJ", "TJK"],
  "Tanzania": ["坦桑尼亚", "TZA"],
  "Thailand": ["泰国", "TH", "THA", "Bangkok", "曼谷", "🇹🇭"],
  "Timor-Leste (East Timor)": ["Timor-Leste", "East Timor", "东帝汶"],
  "Togo": ["多哥", "TGO"],
  "Tonga": ["汤加", "TON"],
  "Trinidad and Tobago": ["特立尼达和多巴哥", "TTO"],
  "Tunisia": ["突尼斯", "TN", "TUN", "Tunis", "突尼斯市"],
  "Turkey": ["土耳其", "TR", "TUR", "Turkey", "Istanbul", "伊斯坦布尔", "🇹🇷"],
  "Turkmenistan": ["土库曼斯坦", "TKM"],
  "Tuvalu": ["图瓦卢", "TUV"],
  "Uganda": ["乌干达", "UGA"],
  "Ukraine": ["乌克兰", "UA", "UKR", "Kyiv", "Kiev", "基辅"],
  "United Arab Emirates": ["阿联酋", "UAE", "AE", "ARE", "Dubai", "Abu Dhabi", "Sharjah", "迪拜", "阿布扎比", "沙迦", "🇦🇪"],
  "United Kingdom": ["英国", "英区", "英伦", "UK", "GB", "GBR", "Britain", "London", "伦敦", "🇬🇧"],
  "United States of America": ["United States", "America", "美国", "美区", "US", "USA", "Los Angeles", "Seattle", "San Jose", "Santa Clara", "Oregon", "Phoenix", "Dallas", "Chicago", "Las Vegas", "Portland", "Fremont", "硅谷", "洛杉矶", "西雅图", "圣何塞", "圣克拉拉", "俄勒冈", "凤凰城", "达拉斯", "芝加哥", "拉斯维加斯", "波特兰", "费利蒙", "🇺🇸"],
  "Uruguay": ["乌拉圭", "UY", "URY", "Montevideo", "蒙得维的亚"],
  "Uzbekistan": ["乌兹别克", "乌兹别克斯坦", "UZ", "UZB", "Tashkent", "塔什干"],
  "Vanuatu": ["瓦努阿图", "VUT"],
  "Vietnam": ["越南", "VN", "VNM", "Hanoi", "Ho Chi Minh", "HCM", "河内", "胡志明", "🇻🇳"],
  "Wallis and Futuna": ["瓦利斯和富图纳"],
  "Yemen": ["也门", "YEM"],
  "Zambia": ["赞比亚", "ZMB"],
  "Zimbabwe": ["津巴布韦", "ZWE"]
});

const INFO_PROXY_PATTERN = /剩余流量|套餐到期|到期时间|流量重置|官网|官方网址|最新域名|备用网址|回家地址|地址发布页|订阅说明|使用说明|工单群|客服群|售后群|防失联|频道|公告|联系|到期|流量/i;

const SUBSCRIPTION_SPECIFIC_HINTS = Object.freeze([
  {
    regionName: "Japan",
    patterns: [
      /dmitjp/i,
      /dmit[\s._-]*jp/i
    ]
  },
  {
    regionName: "United States of America",
    patterns: [
      /dmitlac/i,
      /dmit[\s._-]*lac/i,
      /dmit.*lax/i,
      /dmit.*sjc/i,
      /dmit.*san[\s._-]*jose/i,
      /dmit.*圣何塞/i,
      /堪萨斯/i,
      /\bkansas\b/i,
      /圣何塞/i,
      /san[\s._-]*jose/i,
      /(^|[^a-z0-9])sjc([^a-z0-9]|$)/i,
      /(^|[^a-z0-9])lax([^a-z0-9]|$)/i
    ]
  }
]);

function uniqueStrings(items) {
  return Array.from(new Set((items || []).filter(Boolean).map((item) => String(item).trim()).filter(Boolean)));
}

function stripDiacritics(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeText(text) {
  return stripDiacritics(text)
    .replace(/\u00A0/g, " ")
    .replace(/[|_/\\]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function escapeRegex(text) {
  return String(text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildNameVariants(name) {
  const raw = String(name || "").trim();
  if (!raw) {
    return [];
  }
  const variants = [raw];
  const match = raw.match(/^(.*?)\s*\((.*?)\)\s*$/);
  if (match) {
    variants.push(match[1]);
    variants.push(match[2]);
  }
  variants.push(raw.replace(/\s+/g, " "));
  variants.push(raw.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim());
  return uniqueStrings(variants);
}

function buildSupportedDefinitions() {
  return OFFICIAL_SUPPORTED_REGIONS.map((name) => ({
    name,
    iso: SUPPORTED_REGION_TO_ISO[name],
    aliases: uniqueStrings(buildNameVariants(name).concat(EXTRA_ALIASES[name] || []))
  }));
}

const SUPPORTED_DEFINITIONS = buildSupportedDefinitions();
const SUPPORTED_ISO_SET = new Set(
  SUPPORTED_DEFINITIONS.map((definition) => String(definition.iso || "").trim().toUpperCase()).filter(Boolean)
);
const SUPPORTED_DEFINITION_BY_ISO = SUPPORTED_DEFINITIONS.reduce((accumulator, definition) => {
  if (definition.iso) {
    accumulator[definition.iso] = definition;
  }
  return accumulator;
}, Object.create(null));
const SUPPORTED_DEFINITION_BY_NAME = SUPPORTED_DEFINITIONS.reduce((accumulator, definition) => {
  accumulator[definition.name] = definition;
  return accumulator;
}, Object.create(null));

function isFlagAlias(alias) {
  return /[\u{1F1E6}-\u{1F1FF}]{2}/u.test(alias);
}

function isShortAsciiCode(alias) {
  return /^[A-Z0-9]{2,4}$/.test(alias);
}

function matchAlias(rawText, normalizedText, alias) {
  const rawAlias = String(alias || "").trim();
  if (!rawAlias) {
    return false;
  }

  if (isFlagAlias(rawAlias)) {
    return rawText.includes(rawAlias);
  }

  const normalizedAlias = normalizeText(rawAlias);
  if (!normalizedAlias) {
    return false;
  }

  if (isShortAsciiCode(rawAlias)) {
    const codePattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(normalizedAlias)}($|[^a-z0-9])`, "i");
    return codePattern.test(normalizedText);
  }

  const phrasePattern = new RegExp(escapeRegex(normalizedAlias).replace(/\\ /g, "[\\s._-]*"), "i");
  return phrasePattern.test(normalizedText);
}

function collectOtherStrings(value, bucket, depth) {
  if (!value || depth > 2) {
    return;
  }
  if (typeof value === "string" || typeof value === "number") {
    bucket.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectOtherStrings(item, bucket, depth + 1));
    return;
  }
  if (typeof value === "object") {
    Object.keys(value).forEach((key) => collectOtherStrings(value[key], bucket, depth + 1));
  }
}

function buildCandidateTexts(proxy) {
  const primary = [];
  const secondary = [];

  if (proxy && typeof proxy === "object") {
    [
      proxy.name,
      proxy.server,
      proxy.sni,
      proxy.servername,
      proxy.serverName,
      proxy.host,
      proxy._host,
      proxy._domain,
      proxy._ip,
      proxy["obfs-host"],
      proxy["ws-opts"] && proxy["ws-opts"].path,
      proxy["ws-opts"] && proxy["ws-opts"].headers && proxy["ws-opts"].headers.Host,
      proxy.grpcOpts && proxy.grpcOpts.serviceName,
      proxy.h2Opts && proxy.h2Opts.host,
      proxy._subName,
      proxy._subDisplayName,
      proxy._collectionName,
      proxy._collectionDisplayName
    ].forEach((item) => {
      if (item !== undefined && item !== null && String(item).trim()) {
        primary.push(String(item).trim());
      }
    });

    collectOtherStrings(proxy, secondary, 0);
  }

  const primaryUnique = uniqueStrings(primary);
  const secondaryUnique = uniqueStrings(secondary).filter((item) => !primaryUnique.includes(item));
  return primaryUnique.concat(secondaryUnique);
}

function shouldIgnoreProxy(proxy) {
  const texts = buildCandidateTexts(proxy);
  return texts.some((text) => INFO_PROXY_PATTERN.test(String(text || "")));
}

function normalizeISO(iso) {
  const normalized = String(iso || "").trim().toUpperCase();
  if (!normalized) {
    return "";
  }
  if (normalized === "UK") {
    return "GB";
  }
  return normalized;
}

function getIsoByProxyUtils(text) {
  try {
    if (typeof ProxyUtils === "undefined" || !ProxyUtils || typeof ProxyUtils.getISO !== "function") {
      return "";
    }
    return normalizeISO(ProxyUtils.getISO(String(text || "")));
  } catch (error) {
    return "";
  }
}

function findSupportedDefinitionByISO(iso) {
  const normalized = normalizeISO(iso);
  if (!normalized) {
    return null;
  }
  return SUPPORTED_DEFINITION_BY_ISO[normalized] || null;
}

function findSubscriptionSpecificHint(text) {
  const rawText = String(text || "");
  if (!rawText) {
    return null;
  }
  for (const hint of SUBSCRIPTION_SPECIFIC_HINTS) {
    if (!hint || !hint.regionName || !Array.isArray(hint.patterns)) {
      continue;
    }
    if (hint.patterns.some((pattern) => pattern && pattern.test(rawText))) {
      return SUPPORTED_DEFINITION_BY_NAME[hint.regionName] || null;
    }
  }
  return null;
}

function detectSupportedRegion(proxy) {
  if (shouldIgnoreProxy(proxy)) {
    return null;
  }

  const texts = buildCandidateTexts(proxy);

  for (const text of texts) {
    const matchedDefinition = findSupportedDefinitionByISO(getIsoByProxyUtils(text));
    if (matchedDefinition) {
      return {
        name: matchedDefinition.name,
        iso: matchedDefinition.iso,
        source: "ProxyUtils"
      };
    }
  }

  for (const text of texts) {
    const matchedDefinition = findSubscriptionSpecificHint(text);
    if (matchedDefinition) {
      return {
        name: matchedDefinition.name,
        iso: matchedDefinition.iso,
        source: "subscription-hint"
      };
    }
  }

  for (const text of texts) {
    const rawText = String(text || "");
    const normalizedText = normalizeText(rawText);
    if (!normalizedText) {
      continue;
    }
    for (const definition of SUPPORTED_DEFINITIONS) {
      for (const alias of definition.aliases) {
        if (matchAlias(rawText, normalizedText, alias)) {
          return {
            name: definition.name,
            iso: definition.iso,
            source: "fallback"
          };
        }
      }
    }
  }
  return null;
}

function formatProxyLabel(proxy) {
  if (!proxy || typeof proxy !== "object") {
    return "Unnamed";
  }
  return String(proxy.name || proxy.server || proxy.type || "Unnamed").trim() || "Unnamed";
}

function isFileModeInput(input) {
  return !!(input && typeof input === "object" && (Object.prototype.hasOwnProperty.call(input, "$content") || Object.prototype.hasOwnProperty.call(input, "$files")));
}

function normalizeFileModeRawInput(input) {
  if (!input || typeof input !== "object") {
    return "";
  }
  if (Array.isArray(input.$files) && input.$files.length > 0) {
    return input.$files.filter((item) => item != null && item !== "").join("\n");
  }
  return String(input.$content || "");
}

function parseProxiesFromRawContent(rawContent) {
  const raw = String(rawContent || "").trim();
  if (!raw) {
    return [];
  }
  if (typeof ProxyUtils === "undefined" || !ProxyUtils || typeof ProxyUtils.parse !== "function") {
    throw new Error("ProxyUtils.parse 不可用，无法解析文件内容");
  }
  return ProxyUtils.parse(raw);
}

async function loadFileModeProxies(input) {
  const rawContent = normalizeFileModeRawInput(input);
  const parsedFromContent = parseProxiesFromRawContent(rawContent);
  if (parsedFromContent.length > 0) {
    return {
      proxies: parsedFromContent,
      source: "file-content"
    };
  }

  if (typeof produceArtifact === "function") {
    const produced = await produceArtifact({
      type: FILE_MODE_SOURCE.type,
      name: FILE_MODE_SOURCE.name,
      platform: FILE_MODE_SOURCE.internalPlatform,
      produceType: "internal"
    });
    if (Array.isArray(produced) && produced.length > 0) {
      return {
        proxies: produced,
        source: "configured-source"
      };
    }
  }

  return {
    proxies: [],
    source: "empty"
  };
}

async function rewriteFileModeContent(input, targetPlatform) {
  if (!isFileModeInput(input)) {
    return input;
  }

  const output = Object.assign({}, input);
  const loaded = await loadFileModeProxies(input);
  const filtered = filterSupportedProxies(loaded.proxies, `文件对象模式(${loaded.source})`);
  const outputPlatform = targetPlatform || FILE_MODE_SOURCE.outputPlatform || FILE_MODE_SOURCE.internalPlatform;
  output.$content = ProxyUtils.produce(filtered.proxies, outputPlatform);
  output.$files = [output.$content];
  return output;
}

function filterSupportedProxies(proxies, modeLabel) {
  if (!Array.isArray(proxies)) {
    console.log("[ChatGPT Supported Countries Only] 输入不是数组，已原样返回。");
    return {
      proxies,
      fellBackToOriginal: true
    };
  }

  const kept = [];
  const removed = [];
  const stats = Object.create(null);
  const sourceStats = Object.create(null);

  for (const proxy of proxies) {
    const region = detectSupportedRegion(proxy);
    if (region) {
      kept.push(proxy);
      stats[region.name] = (stats[region.name] || 0) + 1;
      sourceStats[region.source] = (sourceStats[region.source] || 0) + 1;
    } else {
      removed.push(proxy);
    }
  }

  const keptSummary = Object.entries(stats)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([name, count]) => `${name}x${count}`)
    .join(", ");

  if (kept.length === 0 && proxies.length > 0) {
    console.log(`[ChatGPT Supported Countries Only] ${modeLabel} 0/${proxies.length} 个节点命中支持地区，已自动回退原始节点，避免整份订阅被清空。`);
    console.log(`[ChatGPT Supported Countries Only] ${modeLabel} 未命中样本：${removed.slice(0, 12).map(formatProxyLabel).join(" | ")}`);
    return {
      proxies,
      fellBackToOriginal: true
    };
  }

  console.log(`[ChatGPT Supported Countries Only] ${modeLabel} 保留 ${kept.length}/${proxies.length} 个节点，移除 ${removed.length} 个节点。`);
  if (keptSummary) {
    console.log(`[ChatGPT Supported Countries Only] ${modeLabel} 命中地区：${keptSummary}`);
  }
  if (Object.keys(sourceStats).length) {
    console.log(`[ChatGPT Supported Countries Only] ${modeLabel} 识别来源：${Object.entries(sourceStats).map(([name, count]) => `${name}x${count}`).join(", ")}`);
  }
  if (removed.length) {
    console.log(`[ChatGPT Supported Countries Only] ${modeLabel} 被移除样本：${removed.slice(0, 8).map(formatProxyLabel).join(" | ")}`);
  }

  return {
    proxies: kept,
    fellBackToOriginal: false
  };
}

async function tryRunFileMode(targetPlatform) {
  if (typeof produceArtifact !== "function" || typeof ProxyUtils === "undefined" || !ProxyUtils || typeof ProxyUtils.produce !== "function") {
    return null;
  }

  const sourcePlatform = targetPlatform || FILE_MODE_SOURCE.internalPlatform;
  const produced = await produceArtifact({
    type: FILE_MODE_SOURCE.type,
    name: FILE_MODE_SOURCE.name,
    platform: sourcePlatform,
    produceType: "internal"
  });

  if (!Array.isArray(produced)) {
    console.log("[ChatGPT Supported Countries Only] 文件模式未拿到节点数组，已输出空内容。");
    globalThis.$content = "";
    return {
      proxies: [],
      fellBackToOriginal: true
    };
  }

  const filtered = filterSupportedProxies(produced, "文件模式");
  const outputPlatform = targetPlatform || sourcePlatform;
  globalThis.$content = ProxyUtils.produce(filtered.proxies, outputPlatform);
  return filtered;
}

async function operator(proxies = [], targetPlatform) {
  if (isFileModeInput(proxies)) {
    return await rewriteFileModeContent(proxies, targetPlatform);
  }

  if (Array.isArray(proxies) && proxies.length > 0) {
    return filterSupportedProxies(proxies, "订阅模式").proxies;
  }

  const fileModeResult = await tryRunFileMode(targetPlatform);
  if (fileModeResult) {
    return fileModeResult.proxies;
  }

  if (Array.isArray(proxies)) {
    return proxies;
  }
  console.log("[ChatGPT Supported Countries Only] 输入不是数组，且文件模式不可用，已原样返回。");
  return proxies;
}
