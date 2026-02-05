 import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
 }
 
 serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders })
   }
 
   try {
     const { polymarketUrl, kalshiUrl } = await req.json()
     
     const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
     if (!LOVABLE_API_KEY) {
       throw new Error('LOVABLE_API_KEY is not configured')
     }
 
     // Build prompt for market analysis
     const prompt = `You are an expert prediction market analyst. Analyze the following market(s) and provide trading insights.
 
 ${polymarketUrl ? `Polymarket URL: ${polymarketUrl}` : ''}
 ${kalshiUrl ? `Kalshi URL: ${kalshiUrl}` : ''}
 
 Based on the market question (infer from the URL slug), provide:
 1. A brief summary of current market sentiment and key factors
 2. Your sentiment (bullish/bearish/neutral) with confidence level (0-100)
 3. Key factors that could influence the outcome
 4. A trading recommendation
 5. Risk assessment (low/medium/high)
 
 Respond ONLY with a JSON object in this exact format:
 {
   "marketName": "The market question",
   "summary": "2-3 sentence analysis",
   "sentiment": "bullish" | "bearish" | "neutral",
   "confidence": 75,
   "keyFactors": ["factor 1", "factor 2", "factor 3"],
   "recommendation": "Your trading advice",
   "riskLevel": "low" | "medium" | "high"
 }`
 
     const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${LOVABLE_API_KEY}`,
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         model: 'google/gemini-3-flash-preview',
         messages: [
           { role: 'system', content: 'You are a prediction market analyst. Always respond with valid JSON only, no markdown or extra text.' },
           { role: 'user', content: prompt }
         ],
         temperature: 0.7,
       }),
     })
 
     if (!response.ok) {
       const errorText = await response.text()
       console.error('AI API error:', response.status, errorText)
       throw new Error(`AI API error: ${response.status}`)
     }
 
     const aiResponse = await response.json()
     const content = aiResponse.choices?.[0]?.message?.content
 
     if (!content) {
       throw new Error('No content in AI response')
     }
 
     // Parse the JSON response
     const jsonMatch = content.match(/\{[\s\S]*\}/)
     if (!jsonMatch) {
       throw new Error('Could not parse AI response as JSON')
     }
 
     const analysis = JSON.parse(jsonMatch[0])
 
     return new Response(
       JSON.stringify(analysis),
       { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     )
   } catch (error) {
     console.error('Error in analyze-market:', error)
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
       { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
     )
   }
 })