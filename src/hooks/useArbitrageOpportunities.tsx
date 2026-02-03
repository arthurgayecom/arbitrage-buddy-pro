import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type DbOpportunity = Tables<'arbitrage_opportunities'>;

export interface ArbitrageOpportunity {
  id: string;
  market_name: string;
  polymarket_price: number | null;
  kalshi_price: number | null;
  polymarket_url: string | null;
  kalshi_url: string | null;
  profit_percentage: number;
  win_probability: number | null;
  expected_value: number | null;
  status: string | null;
  discovered_at: string;
  expires_at: string | null;
  metadata: Record<string, any> | null;
}

function mapDbToOpportunity(row: DbOpportunity): ArbitrageOpportunity {
  return {
    ...row,
    metadata: row.metadata as Record<string, any> | null,
  };
}

export function useArbitrageOpportunities(minProfitThreshold: number = 0) {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('arbitrage_opportunities')
        .select('*')
        .eq('status', 'active')
        .gte('profit_percentage', minProfitThreshold)
        .order('profit_percentage', { ascending: false });

      if (error) throw error;
      setOpportunities((data || []).map(mapDbToOpportunity));
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [minProfitThreshold]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // For demo purposes, generate mock data if no real data exists
  useEffect(() => {
    if (!loading && opportunities.length === 0) {
      setOpportunities(generateMockOpportunities());
    }
  }, [loading, opportunities.length]);

  return { 
    opportunities, 
    loading, 
    error, 
    refresh: fetchOpportunities,
    topOpportunity: opportunities[0] || null,
  };
}

function generateMockOpportunities(): ArbitrageOpportunity[] {
  const markets = [
    { name: 'Will BTC reach $100k by end of 2024?', polyUrl: 'https://polymarket.com/btc-100k', kalshiUrl: 'https://kalshi.com/btc-100k' },
    { name: 'US Presidential Election 2024 - Republican Win', polyUrl: 'https://polymarket.com/election-gop', kalshiUrl: 'https://kalshi.com/election-rep' },
    { name: 'Fed Rate Cut in December 2024', polyUrl: 'https://polymarket.com/fed-rate-dec', kalshiUrl: 'https://kalshi.com/fed-rate' },
    { name: 'Tesla Stock Above $300 EOY', polyUrl: 'https://polymarket.com/tsla-300', kalshiUrl: 'https://kalshi.com/tsla-eoy' },
    { name: 'AI Regulation Bill Passes in 2024', polyUrl: 'https://polymarket.com/ai-regulation', kalshiUrl: 'https://kalshi.com/ai-bill' },
    { name: 'GDP Growth Above 3% Q4 2024', polyUrl: 'https://polymarket.com/gdp-q4', kalshiUrl: 'https://kalshi.com/gdp-growth' },
    { name: 'Unemployment Below 4% December', polyUrl: 'https://polymarket.com/unemployment', kalshiUrl: 'https://kalshi.com/jobs-dec' },
    { name: 'Oil Price Above $90/barrel', polyUrl: 'https://polymarket.com/oil-90', kalshiUrl: 'https://kalshi.com/crude-oil' },
  ];

  return markets.map((market, index) => {
    const polyPrice = 0.3 + Math.random() * 0.4;
    const priceDiff = (Math.random() * 0.1) - 0.03;
    const kalshiPrice = Math.max(0.1, Math.min(0.9, polyPrice + priceDiff));
    const profitPercentage = Math.abs((1 - polyPrice) + (1 - kalshiPrice) - 1) * 100;
    
    return {
      id: `mock-${index}`,
      market_name: market.name,
      polymarket_price: polyPrice,
      kalshi_price: kalshiPrice,
      polymarket_url: market.polyUrl,
      kalshi_url: market.kalshiUrl,
      profit_percentage: Math.max(0.5, profitPercentage),
      win_probability: 50 + Math.random() * 40,
      expected_value: profitPercentage * (0.5 + Math.random() * 0.3),
      status: 'active',
      discovered_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      expires_at: new Date(Date.now() + Math.random() * 86400000 * 7).toISOString(),
      metadata: {},
    };
  }).sort((a, b) => b.profit_percentage - a.profit_percentage);
}
