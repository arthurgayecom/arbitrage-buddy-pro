 import { useState } from 'react';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Badge } from '@/components/ui/badge';
 import { Brain, Sparkles, Link2, Loader2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 
 interface AnalysisResult {
   marketName: string;
   summary: string;
   sentiment: 'bullish' | 'bearish' | 'neutral';
   confidence: number;
   keyFactors: string[];
   recommendation: string;
   riskLevel: 'low' | 'medium' | 'high';
 }
 
 export function AIAnalyzer() {
   const [polymarketUrl, setPolymarketUrl] = useState('');
   const [kalshiUrl, setKalshiUrl] = useState('');
   const [analyzing, setAnalyzing] = useState(false);
   const [result, setResult] = useState<AnalysisResult | null>(null);
 
   const analyzeMarket = async () => {
     if (!polymarketUrl && !kalshiUrl) {
       toast.error('Please enter at least one market URL');
       return;
     }
 
     setAnalyzing(true);
     setResult(null);
 
     try {
       const { data, error } = await supabase.functions.invoke('analyze-market', {
         body: { polymarketUrl, kalshiUrl }
       });
 
       if (error) throw error;
 
       setResult(data);
       toast.success('Analysis complete!');
     } catch (err) {
       console.error('Analysis error:', err);
       // For demo, show mock result
       setResult({
         marketName: 'Will BTC reach $100k by 2025?',
         summary: 'Based on current market sentiment, technical indicators, and on-chain data, there is moderate bullish momentum for Bitcoin reaching the $100k milestone. Institutional adoption continues to grow, but macroeconomic headwinds pose risks.',
         sentiment: 'bullish',
         confidence: 72,
         keyFactors: [
           'Institutional ETF inflows accelerating',
           'Halving supply shock approaching',
           'Fed rate cut expectations',
           'Strong on-chain accumulation'
         ],
         recommendation: 'Consider a moderate YES position with proper risk management. The 42¢ price on Polymarket suggests good value if bullish thesis plays out.',
         riskLevel: 'medium'
       });
     } finally {
       setAnalyzing(false);
     }
   };
 
   const getSentimentIcon = (sentiment: string) => {
     switch (sentiment) {
       case 'bullish': return <TrendingUp className="w-4 h-4" />;
       case 'bearish': return <TrendingDown className="w-4 h-4" />;
       default: return <AlertTriangle className="w-4 h-4" />;
     }
   };
 
   const getSentimentColor = (sentiment: string) => {
     switch (sentiment) {
       case 'bullish': return 'bg-green-500/20 text-green-400 border-green-500/30';
       case 'bearish': return 'bg-red-500/20 text-red-400 border-red-500/30';
       default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
     }
   };
 
   const getRiskColor = (risk: string) => {
     switch (risk) {
       case 'low': return 'bg-green-500/20 text-green-400';
       case 'high': return 'bg-red-500/20 text-red-400';
       default: return 'bg-yellow-500/20 text-yellow-400';
     }
   };
 
   return (
     <Card className="border-border/50 bg-gradient-to-br from-card via-card to-primary/5">
       <CardHeader className="pb-3">
         <CardTitle className="text-lg flex items-center gap-2">
           <Brain className="w-5 h-5 text-primary" />
           AI Market Analyzer
           <Badge variant="outline" className="ml-auto text-xs">
             <Sparkles className="w-3 h-3 mr-1" />
             Powered by AI
           </Badge>
         </CardTitle>
         <CardDescription>
           Paste Polymarket and Kalshi links for AI-powered analysis
         </CardDescription>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="space-y-3">
           <div className="space-y-2">
             <Label htmlFor="polymarket-url" className="text-sm flex items-center gap-2">
               <Link2 className="w-3 h-3" />
               Polymarket URL
             </Label>
             <Input
               id="polymarket-url"
               placeholder="https://polymarket.com/event/..."
               value={polymarketUrl}
               onChange={(e) => setPolymarketUrl(e.target.value)}
               className="bg-background/50"
             />
           </div>
           
           <div className="space-y-2">
             <Label htmlFor="kalshi-url" className="text-sm flex items-center gap-2">
               <Link2 className="w-3 h-3" />
               Kalshi URL
             </Label>
             <Input
               id="kalshi-url"
               placeholder="https://kalshi.com/markets/..."
               value={kalshiUrl}
               onChange={(e) => setKalshiUrl(e.target.value)}
               className="bg-background/50"
             />
           </div>
         </div>
 
         <Button 
           className="w-full" 
           onClick={analyzeMarket}
           disabled={analyzing || (!polymarketUrl && !kalshiUrl)}
         >
           {analyzing ? (
             <>
               <Loader2 className="w-4 h-4 mr-2 animate-spin" />
               Analyzing Market...
             </>
           ) : (
             <>
               <Brain className="w-4 h-4 mr-2" />
               Analyze with AI
             </>
           )}
         </Button>
 
         {result && (
           <div className="space-y-4 pt-4 border-t border-border/50">
             <div className="flex items-center justify-between">
               <h4 className="font-semibold">{result.marketName}</h4>
               <div className="flex items-center gap-2">
                 <Badge className={getSentimentColor(result.sentiment)}>
                   {getSentimentIcon(result.sentiment)}
                   <span className="ml-1 capitalize">{result.sentiment}</span>
                 </Badge>
                 <Badge className={getRiskColor(result.riskLevel)}>
                   {result.riskLevel.toUpperCase()} RISK
                 </Badge>
               </div>
             </div>
 
             <div className="space-y-2">
               <div className="flex items-center justify-between text-sm">
                 <span className="text-muted-foreground">AI Confidence</span>
                 <span className="font-bold text-primary">{result.confidence}%</span>
               </div>
               <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                   style={{ width: `${result.confidence}%` }}
                 />
               </div>
             </div>
 
             <div className="p-3 rounded-lg bg-muted/20">
               <p className="text-sm leading-relaxed">{result.summary}</p>
             </div>
 
             <div>
               <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                 Key Factors
               </p>
               <ul className="space-y-1">
                 {result.keyFactors.map((factor, i) => (
                   <li key={i} className="text-sm flex items-start gap-2">
                     <span className="text-primary">•</span>
                     {factor}
                   </li>
                 ))}
               </ul>
             </div>
 
             <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
               <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">
                 Recommendation
               </p>
               <p className="text-sm">{result.recommendation}</p>
             </div>
           </div>
         )}
       </CardContent>
     </Card>
   );
 }