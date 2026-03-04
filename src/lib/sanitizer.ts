// Privacy sanitizer — redacts sensitive information before sending to API

const PATTERNS: { regex: RegExp; label: string }[] = [
  // Company/org names (CJK + English patterns like "XX公司", "XX Corp")
  { regex: /[\u4e00-\u9fff]{2,6}(公司|企業|集團|股份|有限|科技|銀行|控股)/g, label: '[公司名]' },
  { regex: /[A-Z][a-zA-Z]+(?: (?:Corp|Inc|Ltd|LLC|Co\.|Group|Holdings|Bank|Capital))/g, label: '[COMPANY]' },
  // Money amounts
  { regex: /(?:NT\$|US\$|\$|￥|¥|€|£)\s?[\d,]+(?:\.\d{1,2})?(?:\s?(?:萬|億|千萬|百萬|million|billion|M|B|K))?/gi, label: '[金額]' },
  { regex: /[\d,]+(?:\.\d{1,2})?\s?(?:萬|億|千萬|百萬|million|billion)/gi, label: '[金額]' },
  // Email
  { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, label: '[EMAIL]' },
  // Phone
  { regex: /(?:\+?\d{1,3}[-\s]?)?\(?\d{2,4}\)?[-\s]?\d{3,4}[-\s]?\d{3,4}/g, label: '[電話]' },
  // Chinese names (2-4 char surnames)
  { regex: /(?:王|李|張|劉|陳|楊|趙|黃|周|吳|徐|孫|胡|朱|高|林|何|郭|馬|羅|梁|宋|鄭|謝|韓|唐|馮|于|董|蕭|程|曹|袁|鄧|許|傅|沈|曾|彭|呂|蘇|盧|蔣|蔡|賈|丁|魏|薛|葉|閻|余|潘|杜|戴|夏|鍾|汪|田|任|姜|范|方|石|姚|譚|廖|鄒|熊|金|陸|郝|孔|白|崔|康|毛|邱|秦|江|史|顧|侯|邵|孟|龍|萬|段|雷|錢|湯|尹|黎|易|常|武|喬|賀|賴|龔|文)[\u4e00-\u9fff]{1,3}/g, label: '[人名]' },
];

export function sanitizeInput(text: string): string {
  let result = text;
  for (const { regex, label } of PATTERNS) {
    result = result.replace(regex, label);
  }
  return result;
}

export function detectSensitiveItems(text: string): string[] {
  const found: string[] = [];
  for (const { regex, label } of PATTERNS) {
    const matches = text.match(regex);
    if (matches) {
      found.push(...matches.map(m => `${m} → ${label}`));
    }
  }
  return [...new Set(found)];
}
