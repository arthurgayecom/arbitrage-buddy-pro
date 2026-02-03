import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';

type DbTrade = Tables<'trades'>;

export interface Trade {
  id: string;
  user_id: string;
  opportunity_id: string | null;
  market_name: string;
  platform: 'polymarket' | 'kalshi';
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  profit_loss: number | null;
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  transaction_hash: string | null;
  is_simulation: boolean | null;
  executed_at: string;
  confirmed_at: string | null;
  metadata: Record<string, any> | null;
}

function mapDbToTrade(row: DbTrade): Trade {
  return {
    ...row,
    platform: row.platform as 'polymarket' | 'kalshi',
    side: row.side as 'buy' | 'sell',
    status: row.status as 'pending' | 'confirmed' | 'failed' | 'cancelled',
    metadata: row.metadata as Record<string, any> | null,
  };
}

export function useTrades() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = useCallback(async () => {
    if (!user) {
      setTrades([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('executed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTrades((data || []).map(mapDbToTrade));
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const createTrade = async (trade: Omit<Trade, 'id' | 'user_id' | 'executed_at' | 'confirmed_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('trades')
        .insert({
          ...trade,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setTrades(prev => [mapDbToTrade(data), ...prev]);
      return { data: mapDbToTrade(data), error: null };
    } catch (error) {
      console.error('Error creating trade:', error);
      return { data: null, error };
    }
  };

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTrades(prev => prev.map(t => t.id === id ? mapDbToTrade(data) : t));
      return { data: mapDbToTrade(data), error: null };
    } catch (error) {
      console.error('Error updating trade:', error);
      return { data: null, error };
    }
  };

  const totalProfitLoss = trades
    .filter(t => t.status === 'confirmed' && t.profit_loss !== null)
    .reduce((sum, t) => sum + (t.profit_loss || 0), 0);

  const totalTrades = trades.length;
  const successfulTrades = trades.filter(t => t.status === 'confirmed').length;

  return {
    trades,
    loading,
    createTrade,
    updateTrade,
    refresh: fetchTrades,
    stats: {
      totalProfitLoss,
      totalTrades,
      successfulTrades,
      successRate: totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0,
    },
  };
}
