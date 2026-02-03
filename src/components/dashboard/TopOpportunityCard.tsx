import { ArbitrageOpportunity } from '@/hooks/useArbitrageOpportunities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, Zap, Trophy } from 'lucide-react';

interface TopOpportunityCardProps {
  opportunity: ArbitrageOpportunity | null;
  onExecute?: (opportunity: ArbitrageOpportunity) => void;
  simulationMode?: boolean;
}

export function TopOpportunityCard({ opportunity, onExecute, simulationMode = true }: TopOpportunityCardProps) {
  if (!opportunity) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">No opportunities found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-lg shadow-primary/10 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <CardTitle className="text-lg">Top Arbitrage Opportunity</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Zap className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground line-clamp-2">
          {opportunity.market_name}
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Polymarket</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-400">
                {(opportunity.polymarket_price! * 100).toFixed(1)}¢
              </span>
              {opportunity.polymarket_url && (
                <a href={opportunity.polymarket_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Kalshi</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-400">
                {(opportunity.kalshi_price! * 100).toFixed(1)}¢
              </span>
              {opportunity.kalshi_url && (
                <a href={opportunity.kalshi_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Profit Potential</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xl font-bold text-green-500">
                +{opportunity.profit_percentage.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div className="space-y-1 text-right">
            <p className="text-xs text-muted-foreground">Win Probability</p>
            <span className="text-lg font-semibold">
              {opportunity.win_probability?.toFixed(1)}%
            </span>
          </div>
        </div>

        {onExecute && (
          <Button 
            className="w-full mt-2" 
            onClick={() => onExecute(opportunity)}
            variant={simulationMode ? "secondary" : "default"}
          >
            {simulationMode ? 'Simulate Trade' : 'Execute Trade'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
