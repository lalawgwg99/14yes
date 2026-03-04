const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const minPe = url.searchParams.get('minPe') || '0';
  const maxPe = url.searchParams.get('maxPe') || '50';
  const minDividend = url.searchParams.get('minDividend') || '0';
  const region = url.searchParams.get('region') || 'tw';
  const sortBy = url.searchParams.get('sortBy') || 'intradaymarketcap';

  try {
    // Use Yahoo Finance screener API
    const query = encodeURIComponent(JSON.stringify({
      size: 20,
      offset: 0,
      sortField: sortBy,
      sortType: 'DESC',
      quoteType: 'EQUITY',
      query: {
        operator: 'AND',
        operands: [
          { operator: 'or', operands: [
            { operator: 'EQ', operands: ['region', region === 'tw' ? 'tw' : 'us'] },
          ]},
          { operator: 'BTWN', operands: ['peratio.lasttwelvemonths', parseFloat(minPe), parseFloat(maxPe)] },
          { operator: 'GT', operands: ['dividendyield', parseFloat(minDividend)] },
        ],
      },
    }));

    // Fallback: use Yahoo Finance trending/most-active
    const yahooUrl = region === 'tw'
      ? `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=most_actives_tw&count=20`
      : `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=most_actives&count=20`;

    const resp = await fetch(yahooUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!resp.ok) {
      // Fallback to simple trending
      const trendingUrl = `https://query1.finance.yahoo.com/v1/finance/trending/${region === 'tw' ? 'TW' : 'US'}?count=20`;
      const trendResp = await fetch(trendingUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      if (!trendResp.ok) {
        return new Response(JSON.stringify({ error: 'Screener unavailable', results: [] }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const trendData: any = await trendResp.json();
      const symbols = trendData?.finance?.result?.[0]?.quotes?.map((q: any) => ({
        symbol: q.symbol,
      })) || [];

      return new Response(JSON.stringify({ results: symbols }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data: any = await resp.json();
    const quotes = data?.finance?.result?.[0]?.quotes?.map((q: any) => ({
      symbol: q.symbol,
      name: q.shortName || q.longName,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      volume: q.regularMarketVolume,
      marketCap: q.marketCap,
      pe: q.trailingPE,
      dividendYield: q.dividendYield,
    })) || [];

    return new Response(JSON.stringify({ results: quotes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=300' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Screener failed', results: [] }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
