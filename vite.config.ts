import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    tailwindcss(),
    // Dev proxy plugin for stock APIs — mimics Cloudflare Worker behavior
    {
      name: 'stock-api-proxy',
      configureServer(server) {
        // Quote API
        server.middlewares.use('/api/stock/quote', async (req, res) => {
          const url = new URL(req.url || '', 'http://localhost');
          const symbol = url.searchParams.get('symbol');
          if (!symbol) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing symbol' }));
            return;
          }
          try {
            const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
            const resp = await fetch(yahooUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const data = await resp.json() as any;
            const meta = data?.chart?.result?.[0]?.meta;
            if (!meta) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'No data' }));
              return;
            }
            const indicators = data.chart.result[0].indicators?.quote?.[0];
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
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(quote));
          } catch (e: any) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
          }
        });

        // History API
        server.middlewares.use('/api/stock/history', async (req, res) => {
          const url = new URL(req.url || '', 'http://localhost');
          const symbol = url.searchParams.get('symbol');
          const range = url.searchParams.get('range') || '6mo';
          if (!symbol) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing symbol' }));
            return;
          }
          const intervalMap: Record<string, string> = {
            '1d': '5m', '5d': '15m', '1mo': '1d', '3mo': '1d', '6mo': '1d', '1y': '1wk', '5y': '1mo',
          };
          const interval = intervalMap[range] || '1d';
          try {
            const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
            const resp = await fetch(yahooUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const data = await resp.json() as any;
            const result = data?.chart?.result?.[0];
            if (!result) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'No data' }));
              return;
            }
            const timestamps = result.timestamp || [];
            const q = result.indicators?.quote?.[0] || {};
            const candles = timestamps.map((t: number, i: number) => ({
              time: t, open: q.open?.[i], high: q.high?.[i], low: q.low?.[i], close: q.close?.[i], volume: q.volume?.[i],
            })).filter((c: any) => c.open != null && c.close != null);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ symbol: result.meta?.symbol || symbol, currency: result.meta?.currency || 'TWD', range, candles }));
          } catch (e: any) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
          }
        });

        // Search API
        server.middlewares.use('/api/stock/search', async (req, res) => {
          const url = new URL(req.url || '', 'http://localhost');
          const q = url.searchParams.get('q');
          if (!q) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing q' }));
            return;
          }
          try {
            const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&listsCount=0`;
            const resp = await fetch(yahooUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const data = await resp.json() as any;
            const quotes = (data?.quotes || []).map((item: any) => ({
              symbol: item.symbol,
              name: item.shortname || item.longname || item.symbol,
              type: item.quoteType,
              exchange: item.exchange,
              exchangeDisplay: item.exchDisp,
            }));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ results: quotes }));
          } catch (e: any) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
          }
        });

        // Screener API
        server.middlewares.use('/api/stock/screener', async (req, res) => {
          const url = new URL(req.url || '', 'http://localhost');
          const region = url.searchParams.get('region') || 'tw';
          try {
            const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/trending/${region === 'tw' ? 'TW' : 'US'}?count=20`;
            const resp = await fetch(yahooUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const data = await resp.json() as any;
            const symbols = data?.finance?.result?.[0]?.quotes?.map((item: any) => ({
              symbol: item.symbol,
            })) || [];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ results: symbols }));
          } catch (e: any) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ results: [], error: e.message }));
          }
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'charts': ['lightweight-charts'],
          'router': ['react-router-dom'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
