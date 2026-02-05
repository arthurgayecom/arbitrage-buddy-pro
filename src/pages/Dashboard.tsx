import { useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TopOpportunityCard } from '@/components/dashboard/TopOpportunityCard';
import { OpportunityTable } from '@/components/dashboard/OpportunityTable';
import { ProfitThresholdSlider } from '@/components/dashboard/ProfitThresholdSlider';
import { WalletCard } from '@/components/dashboard/WalletCard';
import { TradeHistoryTable } from '@/components/dashboard/TradeHistoryTable';
import { ArbitrageFinder } from '@/components/dashboard/ArbitrageFinder';
import { AIAnalyzer } from '@/components/dashboard/AIAnalyzer';
import { useArbitrageOpportunities, ArbitrageOpportunity } from '@/hooks/useArbitrageOpportunities';
import { useTrades } from '@/hooks/useTrades';
import { useProfile } from '@/hooks/useProfile';
import { usePhantomWallet } from '@/hooks/usePhantomWallet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Dashboard() {
  const { profile, updateProfile } = useProfile();
  const [threshold, setThreshold] = useState(profile?.profit_threshold || 2);
  const [autoExecute, setAutoExecute] = useState(profile?.auto_execute || false);
  const [simulationMode, setSimulationMode] = useState(profile?.simulation_mode ?? true);
  
  const { opportunities, loading: opportunitiesLoading, refresh, topOpportunity } = useArbitrageOpportunities(threshold);
  const { trades, createTrade, stats } = useTrades();
  const wallet = usePhantomWallet();
  
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ArbitrageOpportunity | null>(null);
  const [tradeAmount, setTradeAmount] = useState('100');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleThresholdChange = async (value: number) => {
    setThreshold(value);
    await updateProfile({ profit_threshold: value });
  };

  const handleAutoExecuteChange = async (value: boolean) => {
    setAutoExecute(value);
    await updateProfile({ auto_execute: value });
  };

  const handleSimulationModeChange = async (value: boolean) => {
    setSimulationMode(value);
    await updateProfile({ simulation_mode: value });
  };

  const openTradeDialog = (opportunity: ArbitrageOpportunity) => {
    setSelectedOpportunity(opportunity);
    setTradeDialogOpen(true);
  };

  const executeTrade = async () => {
    if (!selectedOpportunity) return;

    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Create buy trade on lower platform, sell on higher
    const buyPlatform = selectedOpportunity.polymarket_price! < selectedOpportunity.kalshi_price! 
      ? 'polymarket' : 'kalshi';
    const sellPlatform = buyPlatform === 'polymarket' ? 'kalshi' : 'polymarket';

    const buyPrice = buyPlatform === 'polymarket' 
      ? selectedOpportunity.polymarket_price! 
      : selectedOpportunity.kalshi_price!;

    await createTrade({
      opportunity_id: selectedOpportunity.id.startsWith('mock-') ? null : selectedOpportunity.id,
      market_name: selectedOpportunity.market_name,
      platform: buyPlatform,
      side: 'buy',
      amount,
      price: buyPrice,
      profit_loss: null,
      status: simulationMode ? 'confirmed' : 'pending',
      transaction_hash: simulationMode ? `sim-${Date.now()}` : null,
      is_simulation: simulationMode,
      metadata: {},
    });

    toast.success(
      simulationMode 
        ? 'Simulated trade executed!' 
        : 'Trade submitted for execution'
    );

    setTradeDialogOpen(false);
    setSelectedOpportunity(null);
    setTradeAmount('100');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onRefresh={handleRefresh} refreshing={refreshing} />
      
      <main className="container py-6 space-y-6">
        <StatsCards
          totalProfitLoss={stats.totalProfitLoss}
          totalTrades={stats.totalTrades}
          successRate={stats.successRate}
          activeOpportunities={opportunities.length}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TopOpportunityCard
              opportunity={topOpportunity}
              onExecute={openTradeDialog}
              simulationMode={simulationMode}
            />
            
            <Tabs defaultValue="opportunities" className="w-full">
              <TabsList>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="arbitrage">Arbitrage Finder</TabsTrigger>
              <TabsTrigger value="ai">AI Analyzer</TabsTrigger>
                <TabsTrigger value="history">Trade History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="opportunities" className="mt-4">
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">All Arbitrage Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {opportunitiesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <OpportunityTable
                        opportunities={opportunities}
                        onExecute={openTradeDialog}
                        minThreshold={threshold}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
          
          <TabsContent value="arbitrage" className="mt-4">
            <ArbitrageFinder />
          </TabsContent>
          
          <TabsContent value="ai" className="mt-4">
            <AIAnalyzer />
          </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Trade History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TradeHistoryTable trades={trades} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <ProfitThresholdSlider
              threshold={threshold}
              onThresholdChange={handleThresholdChange}
              autoExecute={autoExecute}
              onAutoExecuteChange={handleAutoExecuteChange}
              simulationMode={simulationMode}
              onSimulationModeChange={handleSimulationModeChange}
            />
            
            <WalletCard
              connected={wallet.connected}
              connecting={wallet.connecting}
              publicKey={wallet.publicKey}
              balance={wallet.balance}
              isPhantomInstalled={wallet.isPhantomInstalled}
              onConnect={wallet.connect}
              onDisconnect={wallet.disconnect}
              onRefreshBalance={wallet.refreshBalance}
            />
          </div>
        </div>
      </main>

      <Dialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {simulationMode ? 'Simulate Trade' : 'Execute Trade'}
            </DialogTitle>
            <DialogDescription>
              {selectedOpportunity?.market_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Trade Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                placeholder="100"
              />
            </div>
            
            {selectedOpportunity && (
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Profit Potential</span>
                  <span className="text-green-500 font-semibold">
                    +{selectedOpportunity.profit_percentage.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Profit</span>
                  <span className="font-semibold">
                    ${((parseFloat(tradeAmount) || 0) * selectedOpportunity.profit_percentage / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {!simulationMode && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ This will execute a real trade
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={executeTrade}>
              {simulationMode ? 'Simulate' : 'Execute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
