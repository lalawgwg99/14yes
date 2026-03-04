const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const symbol = url.searchParams.get('symbol');

  if (!symbol) {
    return new Response(JSON.stringify({ error: 'Missing symbol parameter' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check Cloudflare Cache
  const cacheKey = new Request(`https://nexus-stock-cache/${symbol}/quote`, { method: 'GET' });
  const cache = caches.default;
  let cached = await cache.match(cacheKey);
  if (cached) {
    return new Response(cached.body, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
    });
  }

  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const resp = await fetch(yahooUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!resp.ok) {
      return new Response(JSON.stringify({ error: `Yahoo Finance error: ${resp.status}` }), {
        status: resp.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data: any = await resp.json();
    const meta = data?.chart?.result?.[0]?.meta;

    if (!meta) {
      return new Response(JSON.stringify({ error: 'No data found for symbol' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const indicators = data.chart.result[0].indicators?.quote?.[0];
    const timestamps = data.chart.result[0].timestamp;
    const lastVolume = indicators?.volume?.filter((v: any) => v != null).pop() || 0;

    const quote = {
      symbol: meta.symbol,
      name: meta.shortName || meta.longName || symbol,
      currency: meta.currency || 'TWD',
      price: meta.regularMarketPrice,
      previousClose: meta.previousClose || meta.chartPreviousClose,
      change: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose),
      changePercent: ((meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose)) / (meta.previousClose || meta.chartPreviousClose)) * 100,
      volume: lastVolume,
      dayHigh: meta.regularMarketDayHigh || meta.regularMarketPrice,
      dayLow: meta.regularMarketDayLow || meta.regularMarketPrice,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      marketTime: meta.regularMarketTime,
      exchangeName: meta.exchangeName,
    };

    const body = JSON.stringify(quote);
    const response = new Response(body, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=300' },
    });

    // Cache for 5 minutes
    const cacheResponse = new Response(body, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=300' },
    });
    context.waitUntil(cache.put(cacheKey, cacheResponse));

    return response;
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Failed to fetch quote' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};
