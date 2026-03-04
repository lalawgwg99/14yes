import { useState, useRef, useCallback } from 'react';
import { StockQuote, StockSearchResult, StockHistory } from '../lib/types';
import { searchTwStocks, suggestTwSymbols } from '../lib/twStocks';

export function useStock() {
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [history, setHistory] = useState<StockHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const searchStocks = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 1) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        // 1. Local TW stock search (supports Chinese)
        const localResults = searchTwStocks(query).map(s => ({
          symbol: s.symbol,
          name: s.name,
          type: 'EQUITY',
          exchange: 'TAI',
          exchangeDisplay: `Taiwan · ${s.industry}`,
        }));

        // 2. If pure number and not in local DB, suggest .TW/.TWO
        const suggested = suggestTwSymbols(query);
        const suggestedResults: StockSearchResult[] = [];
        if (suggested.length > 0 && localResults.length === 0) {
          for (const sym of suggested) {
            suggestedResults.push({
              symbol: sym,
              name: sym,
              type: 'EQUITY',
              exchange: sym.endsWith('.TWO') ? 'TWO' : 'TAI',
              exchangeDisplay: sym.endsWith('.TWO') ? 'Taiwan OTC' : 'Taiwan',
            });
          }
        }

        // 3. Yahoo Finance search (English/numbers only)
        let yahooResults: StockSearchResult[] = [];
        try {
          const res = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            yahooResults = (data.results || [])
              .filter((r: StockSearchResult) =>
                !localResults.some(l => l.symbol === r.symbol) &&
                !suggestedResults.some(s => s.symbol === r.symbol)
              );
          }
        } catch {}

        // Merge: local TW → suggested TW → Yahoo (prioritize Taiwan)
        const twYahoo = yahooResults.filter((r: StockSearchResult) => r.symbol.endsWith('.TW') || r.symbol.endsWith('.TWO'));
        const otherYahoo = yahooResults.filter((r: StockSearchResult) => !r.symbol.endsWith('.TW') && !r.symbol.endsWith('.TWO'));
        setSearchResults([...localResults, ...suggestedResults, ...twYahoo, ...otherYahoo].slice(0, 10));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const getQuote = useCallback(async (symbol: string): Promise<StockQuote | null> => {
    setQuoteLoading(true);
    try {
      const res = await fetch(`/api/stock/quote?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) throw new Error('Quote failed');
      const data: StockQuote = await res.json();
      setQuote(data);
      return data;
    } catch {
      setQuote(null);
      return null;
    } finally {
      setQuoteLoading(false);
    }
  }, []);

  const getHistory = useCallback(async (symbol: string, range: string = '6mo'): Promise<StockHistory | null> => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/stock/history?symbol=${encodeURIComponent(symbol)}&range=${range}`);
      if (!res.ok) throw new Error('History failed');
      const data: StockHistory = await res.json();
      setHistory(data);
      return data;
    } catch {
      setHistory(null);
      return null;
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setQuote(null);
    setHistory(null);
  }, []);

  return {
    searchResults, searching, searchStocks,
    quote, quoteLoading, getQuote,
    history, historyLoading, getHistory,
    clearSearch,
  };
}
