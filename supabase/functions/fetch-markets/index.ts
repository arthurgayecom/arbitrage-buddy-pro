import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // TODO: When you have API keys, add them as secrets and use:
    // const POLYMARKET_API_KEY = Deno.env.get('POLYMARKET_API_KEY')
    // const KALSHI_API_KEY = Deno.env.get('KALSHI_API_KEY')

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch markets from Polymarket
    // Note: This is a stub - replace with actual API calls when you have credentials
    const polymarketMarkets = await fetchPolymarketMarkets()
    
    // Fetch markets from Kalshi
    const kalshiMarkets = await fetchKalshiMarkets()

    // Match markets between platforms and find arbitrage opportunities
    const opportunities = findArbitrageOpportunities(polymarketMarkets, kalshiMarkets)

    // Store opportunities in database
    if (opportunities.length > 0) {
      const { error } = await supabase
        .from('arbitrage_opportunities')
        .upsert(opportunities, { onConflict: 'id' })

      if (error) {
        console.error('Error storing opportunities:', error)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Markets fetched and analyzed',
        opportunitiesFound: opportunities.length,
        opportunities: opportunities.slice(0, 10), // Return top 10
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('Error in fetch-markets:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Stub function for Polymarket API
async function fetchPolymarketMarkets() {
  // TODO: Replace with actual Polymarket API call
  // The Polymarket API typically uses:
  // - CLOB API for order book data: https://clob.polymarket.com/
  // - Gamma API for market data
  
  // Example structure of what you'd fetch:
  return [
    {
      id: 'poly-btc-100k',
      question: 'Will BTC reach $100k by end of 2024?',
      price: 0.42, // Price for YES
      volume: 1500000,
      url: 'https://polymarket.com/event/btc-100k',
    },
    {
      id: 'poly-election-2024',
      question: 'US Presidential Election 2024 - Republican Win',
      price: 0.55,
      volume: 3200000,
      url: 'https://polymarket.com/event/election-2024',
    },
    // Add more mock markets...
  ]
}

// Stub function for Kalshi API
async function fetchKalshiMarkets() {
  // TODO: Replace with actual Kalshi API call
  // Kalshi API docs: https://trading-api.readme.io/reference/
  // You'll need API credentials from your Kalshi account
  
  // Example structure:
  return [
    {
      id: 'kalshi-btc-100k',
      title: 'Will BTC reach $100k by end of 2024?',
      yes_price: 0.38, // Slightly different price creates arb opportunity
      no_price: 0.62,
      volume: 890000,
      url: 'https://kalshi.com/events/btc-100k',
    },
    {
      id: 'kalshi-election-2024',
      title: 'US Presidential Election 2024 - Republican Win',
      yes_price: 0.52,
      no_price: 0.48,
      volume: 2100000,
      url: 'https://kalshi.com/events/election-2024',
    },
    // Add more mock markets...
  ]
}

interface ArbitrageOpportunity {
  id: string
  market_name: string
  polymarket_price: number
  kalshi_price: number
  polymarket_url: string
  kalshi_url: string
  profit_percentage: number
  win_probability: number
  expected_value: number
  status: string
}

function findArbitrageOpportunities(
  polymarkets: any[],
  kalshiMarkets: any[]
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = []
  
  // Simple matching by similar market names
  // In production, you'd use more sophisticated matching
  for (const poly of polymarkets) {
    for (const kalshi of kalshiMarkets) {
      // Check if markets are similar (simplified matching)
      if (areMarketsSimilar(poly.question, kalshi.title)) {
        const polyPrice = poly.price
        const kalshiPrice = kalshi.yes_price
        
        // Calculate arbitrage opportunity
        // Buy YES on cheaper platform, NO on expensive platform
        const arbProfit = calculateArbProfit(polyPrice, kalshiPrice)
        
        if (arbProfit > 0) {
          opportunities.push({
            id: `arb-${poly.id}-${kalshi.id}`,
            market_name: poly.question,
            polymarket_price: polyPrice,
            kalshi_price: kalshiPrice,
            polymarket_url: poly.url,
            kalshi_url: kalshi.url,
            profit_percentage: arbProfit * 100,
            win_probability: (polyPrice + kalshiPrice) / 2 * 100,
            expected_value: arbProfit * 100 * ((polyPrice + kalshiPrice) / 2),
            status: 'active',
          })
        }
      }
    }
  }
  
  // Sort by profit percentage
  return opportunities.sort((a, b) => b.profit_percentage - a.profit_percentage)
}

function areMarketsSimilar(question1: string, question2: string): boolean {
  // Simplified similarity check
  // In production, use fuzzy matching or NLP
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  return normalize(question1).includes(normalize(question2).slice(0, 20)) ||
         normalize(question2).includes(normalize(question1).slice(0, 20))
}

function calculateArbProfit(price1: number, price2: number): number {
  // Arbitrage exists when buying YES on one platform and NO on another
  // yields guaranteed profit
  const buyYes = Math.min(price1, price2)
  const buyNo = 1 - Math.max(price1, price2)
  const totalCost = buyYes + buyNo
  
  // If total cost < 1, there's an arbitrage opportunity
  if (totalCost < 1) {
    return 1 - totalCost
  }
  return 0
}
