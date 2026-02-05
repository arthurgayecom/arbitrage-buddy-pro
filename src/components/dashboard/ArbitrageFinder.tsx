 import { useState, useEffect, useCallback } from 'react';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Crosshair, TrendingUp, RefreshCw, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface ArbitrageMatch {
   id: string;
   marketName: string;
   polymarketYes: number;
   kalshiNo: number;
   totalCost: number;
   guaranteedProfit: number;
   profitPercentage: number;
   polymarketUrl?: string;
   kalshiUrl?: string;
 }
 
 export function ArbitrageFinder() {
   const [scanning, setScanning] = useState(false);
   const [matches, setMatches] = useState<ArbitrageMatch[]>([]);
   const [lastScan, setLastScan] = useState<Date | null>(null);
 
   const scanForArbitrage = useCallback(async () => {
     setScanning(true);
     
     // Simulate API call to scan markets
     await new Promise(resolve => setTimeout(resolve, 2000));
     
     // Generate mock arbitrage opportunities where YES + NO < $1
     const mockMatches: ArbitrageMatch[] = [
       {
         id: 'arb-1',
         marketName: 'Will BTC reach $100k by end of 2025?',
         polymarketYes: 0.42,
         kalshiNo: 0.54,
         totalCost: 0.96,
         guaranteedProfit: 0.04,
         profitPercentage: 4.17,
         polymarketUrl: 'https://polymarket.com',
         kalshiUrl: 'https://kalshi.com',
       },
       {
         id: 'arb-2',
         marketName: 'Fed Rate Cut in Q1 2025',
         polymarketYes: 0.35,
         kalshiNo: 0.62,
         totalCost: 0.97,
         guaranteedProfit: 0.03,
         profitPercentage: 3.09,
         polymarketUrl: 'https://polymarket.com',
         kalshiUrl: 'https://kalshi.com',
       },
       {
         id: 'arb-3',
         marketName: 'Trump wins 2024 Election',
         polymarketYes: 0.48,
         kalshiNo: 0.49,
         totalCost: 0.97,
         guaranteedProfit: 0.03,
         profitPercentage: 3.09,
         polymarketUrl: 'https://polymarket.com',
         kalshiUrl: 'https://kalshi.com',
       },
     ];
     
     setMatches(mockMatches);
     setLastScan(new Date());
     setScanning(false);
   }, []);
 
   useEffect(() => {
     scanForArbitrage();
   }, [scanForArbitrage]);
 
   return (
     <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
       <CardHeader className="pb-3">
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="text-lg flex items-center gap-2">
               <Crosshair className="w-5 h-5 text-primary" />
               Arbitrage Scanner
             </CardTitle>
             <CardDescription className="mt-1">
               Finding guaranteed profit: YES + NO {'<'} $1.00
             </CardDescription>
           </div>
           <Button 
             size="sm" 
             variant="outline" 
             onClick={scanForArbitrage}
             disabled={scanning}
           >
             <RefreshCw className={cn("w-4 h-4 mr-1", scanning && "animate-spin")} />
             {scanning ? 'Scanning...' : 'Scan'}
           </Button>
         </div>
       </CardHeader>
       <CardContent className="space-y-4">
         {lastScan && (
           <p className="text-xs text-muted-foreground">
             Last scan: {lastScan.toLocaleTimeString()}
           </p>
         )}
         
         {matches.length === 0 && !scanning && (
           <div className="text-center py-8 text-muted-foreground">
             <Crosshair className="w-8 h-8 mx-auto mb-2 opacity-50" />
             <p>No guaranteed arbitrage found</p>
             <p className="text-xs mt-1">Keep scanning for opportunities</p>
           </div>
         )}
 
         {scanning && matches.length === 0 && (
           <div className="text-center py-8">
             <div className="animate-pulse space-y-3">
               <div className="h-16 bg-muted/30 rounded-lg" />
               <div className="h-16 bg-muted/30 rounded-lg" />
             </div>
           </div>
         )}
 
         <div className="space-y-3">
           {matches.map((match) => (
             <div 
               key={match.id}
               className="p-4 rounded-lg border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-colors"
             >
               <div className="flex items-start justify-between mb-3">
                 <h4 className="font-medium text-sm leading-tight pr-2">
                   {match.marketName}
                 </h4>
                 <Badge className="bg-green-500/20 text-green-400 shrink-0">
                   <CheckCircle2 className="w-3 h-3 mr-1" />
                   Guaranteed
                 </Badge>
               </div>
               
               <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                 <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                   <p className="text-muted-foreground">Polymarket YES</p>
                   <p className="text-blue-400 font-mono font-bold">
                     ${match.polymarketYes.toFixed(2)}
                   </p>
                 </div>
                 <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20">
                   <p className="text-muted-foreground">Kalshi NO</p>
                   <p className="text-purple-400 font-mono font-bold">
                     ${match.kalshiNo.toFixed(2)}
                   </p>
                 </div>
                 <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                   <p className="text-muted-foreground">Total Cost</p>
                   <p className="text-green-400 font-mono font-bold">
                     ${match.totalCost.toFixed(2)}
                   </p>
                 </div>
               </div>
 
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-green-500" />
                   <span className="text-green-500 font-bold">
                     +{match.profitPercentage.toFixed(2)}% profit
                   </span>
                   <span className="text-muted-foreground text-xs">
                     (${match.guaranteedProfit.toFixed(2)}/share)
                   </span>
                 </div>
                 <div className="flex items-center gap-1">
                   {match.polymarketUrl && (
                     <a href={match.polymarketUrl} target="_blank" rel="noopener noreferrer">
                       <Button size="sm" variant="ghost" className="h-7 px-2">
                         <ExternalLink className="w-3 h-3" />
                       </Button>
                     </a>
                   )}
                   <Button size="sm" className="h-7 gap-1">
                     Trade <ArrowRight className="w-3 h-3" />
                   </Button>
                 </div>
               </div>
             </div>
           ))}
         </div>
 
         <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
           <p className="text-xs text-muted-foreground">
             <strong className="text-foreground">How it works:</strong> Buy YES on Polymarket + NO on Kalshi. 
             If total cost {'<'} $1.00, you profit regardless of outcome.
           </p>
         </div>
       </CardContent>
     </Card>
   );
 }