import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify user
    const token = authHeader.replace('Bearer ', '')
    const { data: authData, error: authError } = await supabase.auth.getClaims(token)
    if (authError || !authData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = authData.claims.sub

    // Parse request body
    const { opportunityId, amount, simulationMode = true } = await req.json()

    if (!opportunityId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: opportunityId, amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch the opportunity
    const { data: opportunity, error: oppError } = await supabase
      .from('arbitrage_opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single()

    if (oppError || !opportunity) {
      return new Response(
        JSON.stringify({ error: 'Opportunity not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (simulationMode) {
      // Simulation mode - just record the trade without executing
      const trades = createSimulatedTrades(userId, opportunity, amount)
      
      const { data: insertedTrades, error: insertError } = await supabase
        .from('trades')
        .insert(trades)
        .select()

      if (insertError) {
        throw insertError
      }

      return new Response(
        JSON.stringify({
          success: true,
          simulation: true,
          message: 'Simulated trade executed successfully',
          trades: insertedTrades,
          estimatedProfit: amount * (opportunity.profit_percentage / 100),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Live trading mode
    // TODO: Implement actual trading when you have API credentials
    // This would involve:
    // 1. Connecting to Polymarket API to place order
    // 2. Connecting to Kalshi API to place order
    // 3. If using Phantom, signing transactions on-chain
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Live trading not yet implemented. Please use simulation mode.',
        hint: 'Add POLYMARKET_API_KEY and KALSHI_API_KEY secrets to enable live trading',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Error in execute-trade:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function createSimulatedTrades(userId: string, opportunity: any, amount: number) {
  const polyPrice = opportunity.polymarket_price
  const kalshiPrice = opportunity.kalshi_price
  
  // Determine which platform to buy YES and which to buy NO
  const buyYesOnPoly = polyPrice < kalshiPrice
  
  const trades = [
    {
      user_id: userId,
      opportunity_id: opportunity.id,
      market_name: opportunity.market_name,
      platform: buyYesOnPoly ? 'polymarket' : 'kalshi',
      side: 'buy',
      amount: amount / 2,
      price: buyYesOnPoly ? polyPrice : kalshiPrice,
      status: 'confirmed',
      is_simulation: true,
      transaction_hash: `sim-${Date.now()}-1`,
      profit_loss: (amount / 2) * (opportunity.profit_percentage / 100) / 2,
      metadata: { type: 'YES' },
    },
    {
      user_id: userId,
      opportunity_id: opportunity.id,
      market_name: opportunity.market_name,
      platform: buyYesOnPoly ? 'kalshi' : 'polymarket',
      side: 'buy', // Buying NO is like selling YES
      amount: amount / 2,
      price: 1 - (buyYesOnPoly ? kalshiPrice : polyPrice),
      status: 'confirmed',
      is_simulation: true,
      transaction_hash: `sim-${Date.now()}-2`,
      profit_loss: (amount / 2) * (opportunity.profit_percentage / 100) / 2,
      metadata: { type: 'NO' },
    },
  ]
  
  return trades
}
