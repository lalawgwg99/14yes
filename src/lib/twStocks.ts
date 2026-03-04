// Taiwan stock name → symbol mapping for Chinese search
// Top 100+ most traded Taiwan stocks
export const TW_STOCK_MAP: { symbol: string; name: string; industry: string }[] = [
  // 半導體
  { symbol: '2330.TW', name: '台積電', industry: '半導體' },
  { symbol: '2454.TW', name: '聯發科', industry: '半導體' },
  { symbol: '2303.TW', name: '聯電', industry: '半導體' },
  { symbol: '3034.TW', name: '聯詠', industry: '半導體' },
  { symbol: '2379.TW', name: '瑞昱', industry: '半導體' },
  { symbol: '3711.TW', name: '日月光投控', industry: '半導體' },
  { symbol: '2408.TW', name: '南亞科', industry: '半導體' },
  { symbol: '3661.TW', name: '世芯-KY', industry: '半導體' },
  { symbol: '5274.TW', name: '信驊', industry: '半導體' },
  { symbol: '3443.TW', name: '創意', industry: '半導體' },
  { symbol: '6770.TW', name: '力積電', industry: '半導體' },
  { symbol: '2344.TW', name: '華邦電', industry: '半導體' },
  { symbol: '3529.TW', name: '力旺', industry: '半導體' },
  // 電子代工 / AI伺服器
  { symbol: '2317.TW', name: '鴻海', industry: '電子代工' },
  { symbol: '2382.TW', name: '廣達', industry: 'AI伺服器' },
  { symbol: '3231.TW', name: '緯創', industry: 'AI伺服器' },
  { symbol: '2356.TW', name: '英業達', industry: 'AI伺服器' },
  { symbol: '3017.TW', name: '奇鋐', industry: '散熱' },
  { symbol: '6669.TW', name: '緯穎', industry: 'AI伺服器' },
  { symbol: '2345.TW', name: '智邦', industry: '網通' },
  // 電子零組件
  { symbol: '2308.TW', name: '台達電', industry: '電源' },
  { symbol: '3008.TW', name: '大立光', industry: '光學' },
  { symbol: '2327.TW', name: '國巨', industry: '被動元件' },
  { symbol: '2301.TW', name: '光寶科', industry: '電子' },
  { symbol: '2395.TW', name: '研華', industry: '工業電腦' },
  { symbol: '3037.TW', name: '欣興', industry: 'PCB' },
  { symbol: '4938.TW', name: '和碩', industry: '電子代工' },
  { symbol: '2357.TW', name: '華碩', industry: '電腦' },
  { symbol: '2353.TW', name: '宏碁', industry: '電腦' },
  { symbol: '3706.TW', name: '神達', industry: 'AI伺服器' },
  // 金融
  { symbol: '2881.TW', name: '富邦金', industry: '金融' },
  { symbol: '2882.TW', name: '國泰金', industry: '金融' },
  { symbol: '2891.TW', name: '中信金', industry: '金融' },
  { symbol: '2886.TW', name: '兆豐金', industry: '金融' },
  { symbol: '2884.TW', name: '玉山金', industry: '金融' },
  { symbol: '2887.TW', name: '台新金', industry: '金融' },
  { symbol: '2880.TW', name: '華南金', industry: '金融' },
  { symbol: '2883.TW', name: '開發金', industry: '金融' },
  { symbol: '2885.TW', name: '元大金', industry: '金融' },
  { symbol: '2890.TW', name: '永豐金', industry: '金融' },
  { symbol: '2892.TW', name: '第一金', industry: '金融' },
  { symbol: '5880.TW', name: '合庫金', industry: '金融' },
  // 傳產
  { symbol: '1301.TW', name: '台塑', industry: '塑化' },
  { symbol: '1303.TW', name: '南亞', industry: '塑化' },
  { symbol: '1326.TW', name: '台化', industry: '塑化' },
  { symbol: '6505.TW', name: '台塑化', industry: '塑化' },
  { symbol: '2002.TW', name: '中鋼', industry: '鋼鐵' },
  { symbol: '1216.TW', name: '統一', industry: '食品' },
  { symbol: '2912.TW', name: '統一超', industry: '零售' },
  { symbol: '2207.TW', name: '和泰車', industry: '汽車' },
  { symbol: '9910.TW', name: '豐泰', industry: '製鞋' },
  { symbol: '2105.TW', name: '正新', industry: '輪胎' },
  // 航運
  { symbol: '2603.TW', name: '長榮', industry: '航運' },
  { symbol: '2609.TW', name: '陽明', industry: '航運' },
  { symbol: '2615.TW', name: '萬海', industry: '航運' },
  { symbol: '2610.TW', name: '華航', industry: '航空' },
  { symbol: '2618.TW', name: '長榮航', industry: '航空' },
  // 電信
  { symbol: '2412.TW', name: '中華電', industry: '電信' },
  { symbol: '3045.TW', name: '台灣大', industry: '電信' },
  { symbol: '4904.TW', name: '遠傳', industry: '電信' },
  // 營建
  { symbol: '2504.TW', name: '國產', industry: '營建' },
  { symbol: '2542.TW', name: '興富發', industry: '營建' },
  // ETF
  { symbol: '0050.TW', name: '元大台灣50', industry: 'ETF' },
  { symbol: '0056.TW', name: '元大高股息', industry: 'ETF' },
  { symbol: '00878.TW', name: '國泰永續高股息', industry: 'ETF' },
  { symbol: '00919.TW', name: '群益台灣精選高息', industry: 'ETF' },
  { symbol: '00929.TW', name: '復華台灣科技優息', industry: 'ETF' },
  { symbol: '00940.TW', name: '元大台灣價值高息', industry: 'ETF' },
  { symbol: '006208.TW', name: '富邦台50', industry: 'ETF' },
  { symbol: '00713.TW', name: '元大台灣高息低波', industry: 'ETF' },
  { symbol: '00850.TW', name: '元大臺灣ESG永續', industry: 'ETF' },
  { symbol: '00692.TW', name: '富邦公司治理', industry: 'ETF' },
  // 上櫃 (OTC) 熱門
  { symbol: '5483.TWO', name: '中美晶', industry: '太陽能' },
  { symbol: '6770.TWO', name: '力積電', industry: '半導體' },
  { symbol: '4966.TWO', name: '譜瑞-KY', industry: '半導體' },
  { symbol: '5269.TWO', name: '祥碩', industry: '半導體' },
  { symbol: '6488.TWO', name: '環球晶', industry: '半導體' },
  { symbol: '3293.TWO', name: '鑫創電子', industry: '電子' },
  { symbol: '8069.TWO', name: '元太', industry: '電子紙' },
  { symbol: '6446.TWO', name: '藥華藥', industry: '生技' },
  { symbol: '6547.TWO', name: '高端疫苗', industry: '生技' },
  { symbol: '4743.TWO', name: '合一', industry: '生技' },
  { symbol: '6789.TWO', name: '采鈺', industry: '半導體' },
  { symbol: '3105.TWO', name: '穩懋', industry: '半導體' },
  { symbol: '5876.TWO', name: '上海商銀', industry: '金融' },
  { symbol: '6533.TWO', name: '晶心科', industry: '半導體' },
  // 更多上市
  { symbol: '1590.TW', name: '亞德客-KY', industry: '氣動元件' },
  { symbol: '2207.TW', name: '和泰車', industry: '汽車' },
  { symbol: '9945.TW', name: '潤泰新', industry: '營建' },
  { symbol: '2049.TW', name: '上銀', industry: '工具機' },
  { symbol: '8046.TW', name: '南電', industry: 'PCB' },
  { symbol: '2377.TW', name: '微星', industry: '電腦' },
  { symbol: '2474.TW', name: '可成', industry: '機殼' },
  { symbol: '3044.TW', name: '健鼎', industry: 'PCB' },
  { symbol: '2347.TW', name: '聯強', industry: '通路' },
  { symbol: '9904.TW', name: '寶成', industry: '製鞋' },
  { symbol: '5871.TW', name: '中租-KY', industry: '租賃' },
  { symbol: '1101.TW', name: '台泥', industry: '水泥' },
  { symbol: '1102.TW', name: '亞泥', industry: '水泥' },
  { symbol: '2823.TW', name: '中壽', industry: '保險' },
  { symbol: '2801.TW', name: '彰銀', industry: '金融' },
  { symbol: '3481.TW', name: '群創', industry: '面板' },
  { symbol: '2409.TW', name: '友達', industry: '面板' },
  { symbol: '4958.TW', name: '臻鼎-KY', industry: 'PCB' },
  { symbol: '2324.TW', name: '仁寶', industry: '電子代工' },
  { symbol: '3702.TW', name: '大聯大', industry: '通路' },
  { symbol: '6415.TW', name: '矽力-KY', industry: '半導體' },
  { symbol: '2388.TW', name: '威盛', industry: '半導體' },
  { symbol: '3023.TW', name: '信邦', industry: '連接器' },
  { symbol: '2360.TW', name: '致茂', industry: '量測' },
  { symbol: '6269.TW', name: '台郡', industry: 'PCB' },
  { symbol: '2618.TW', name: '長榮航', industry: '航空' },
];

/**
 * Search TW stocks by Chinese name, symbol number, or industry.
 * Supports: "台積", "2330", "半導體", "ETF"
 */
export function searchTwStocks(query: string): { symbol: string; name: string; industry: string }[] {
  const q = query.trim();
  if (!q) return [];
  const ql = q.toLowerCase();

  // Exact symbol match first (e.g. "2330" → 2330.TW)
  const exactNum = TW_STOCK_MAP.filter(s => s.symbol.split('.')[0] === q);
  if (exactNum.length > 0) return exactNum;

  return TW_STOCK_MAP.filter(s =>
    s.name.includes(q) ||
    s.symbol.toLowerCase().includes(ql) ||
    s.industry.includes(q)
  ).slice(0, 10);
}

/**
 * Check if a pure number could be a TW stock, return suggested symbols
 */
export function suggestTwSymbols(query: string): string[] {
  const q = query.trim();
  if (!/^\d{4,6}$/.test(q)) return [];
  const suggestions: string[] = [];
  // Check local DB first
  const local = TW_STOCK_MAP.find(s => s.symbol.startsWith(q + '.'));
  if (local) {
    suggestions.push(local.symbol);
  } else {
    // Not in local DB — suggest both .TW and .TWO
    suggestions.push(`${q}.TW`, `${q}.TWO`);
  }
  return suggestions;
}
