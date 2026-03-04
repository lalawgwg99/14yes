import { useState, useEffect, useCallback } from 'react';
import { Position, Portfolio, StockQuote } from '../lib/types';

const STORAGE_KEY = 'nexus-portfolio';

function loadPortfolio(): Portfolio {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { positions: [], cash: 0, currency: 'TWD' };
}

function savePortfolio(portfolio: Portfolio) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  } catch {}
}

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio>(loadPortfolio);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    savePortfolio(portfolio);
  }, [portfolio]);

  const addPosition = useCallback((position: Position) => {
    setPortfolio(prev => {
      const existing = prev.positions.find(p => p.symbol === position.symbol);
      if (existing) {
        const totalShares = existing.shares + position.shares;
        const totalCost = existing.shares * existing.avgCost + position.shares * position.avgCost;
        const newPositions = prev.positions.map(p =>
          p.symbol === position.symbol
            ? { ...p, shares: totalShares, avgCost: totalCost / totalShares }
            : p
        );
        return { ...prev, positions: newPositions };
      }
      return { ...prev, positions: [...prev.positions, position] };
    });
  }, []);

  const removePosition = useCallback((symbol: string) => {
    setPortfolio(prev => ({
      ...prev,
      positions: prev.positions.filter(p => p.symbol !== symbol),
    }));
  }, []);

  const updatePosition = useCallback((symbol: string, updates: Partial<Position>) => {
    setPortfolio(prev => ({
      ...prev,
      positions: prev.positions.map(p =>
        p.symbol === symbol ? { ...p, ...updates } : p
      ),
    }));
  }, []);

  const setCash = useCallback((cash: number) => {
    setPortfolio(prev => ({ ...prev, cash }));
  }, []);

  const setCurrency = useCallback((currency: 'TWD' | 'USD') => {
    setPortfolio(prev => ({ ...prev, currency }));
  }, []);

  const refreshQuotes = useCallback(async () => {
    if (portfolio.positions.length === 0) return;
    setLoading(true);
    try {
      const results: Record<string, StockQuote> = {};
      await Promise.all(
        portfolio.positions.map(async (pos) => {
          try {
            const res = await fetch(`/api/stock/quote?symbol=${encodeURIComponent(pos.symbol)}`);
            if (res.ok) {
              results[pos.symbol] = await res.json();
            }
          } catch {}
        })
      );
      setQuotes(results);
    } finally {
      setLoading(false);
    }
  }, [portfolio.positions]);

  // Computed values
  const totalCost = portfolio.positions.reduce((sum, p) => sum + p.shares * p.avgCost, 0);
  const totalMarketValue = portfolio.positions.reduce((sum, p) => {
    const q = quotes[p.symbol];
    return sum + (q ? p.shares * q.price : p.shares * p.avgCost);
  }, 0);
  const totalPnL = totalMarketValue - totalCost;
  const totalReturn = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  const todayPnL = portfolio.positions.reduce((sum, p) => {
    const q = quotes[p.symbol];
    return sum + (q ? p.shares * q.change : 0);
  }, 0);
  const totalAssets = totalMarketValue + portfolio.cash;

  return {
    portfolio,
    quotes,
    loading,
    addPosition,
    removePosition,
    updatePosition,
    setCash,
    setCurrency,
    refreshQuotes,
    totalCost,
    totalMarketValue,
    totalPnL,
    totalReturn,
    todayPnL,
    totalAssets,
  };
}
