const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const RANGE_MAP: Record<string, { interval: string; range: string }> = {
  '1d': { interval: '5m', range: '1d' },
  '5d': { interval: '15m', range: '5d' },
  '1mo': { interval: '1d', range: '1mo' },
  '3mo': { interval: '1d', range: '3mo' },
  '6mo': { interval: '1d', range: '6mo' },
  '1y': { interval: '1wk', range: '1y' },
  '5y': { interval: '1mo', range: '5y' },
};

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const symbol = url.searchParams.get('symbol');
  const range = url.searchParams.get('range') || '6mo';

  if (!symbol) {
    return new Response(JSON.stringify({ error: 'Missing symbol parameter' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const config = RANGE_MAP[range] || RANGE_MAP['6mo'];

  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${config.interval}&range=${config.range}`;
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
    const result = data?.chart?.result?.[0];

    if (!result) {
      return new Response(JSON.stringify({ error: 'No data found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};

    const candles = timestamps.map((t: number, i: number) => ({
      time: t,
      open: quote.open?.[i] ?? null,
      high: quote.high?.[i] ?? null,
      low: quote.low?.[i] ?? null,
      close: quote.close?.[i] ?? null,
      volume: quote.volume?.[i] ?? null,
    })).filter((c: any) => c.open != null && c.close != null);

    const body = JSON.stringify({
      symbol: result.meta?.symbol || symbol,
      currency: result.meta?.currency || 'TWD',
      range,
      candles,
    });

    return new Response(body, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=300' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Failed to fetch history' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { headers: corsHeaders });
};
