import { ArbitrageOpportunity } from '@/hooks/useArbitrageOpportunities';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OpportunityTableProps {
  opportunities: ArbitrageOpportunity[];
  onExecute?: (opportunity: ArbitrageOpportunity) => void;
  minThreshold?: number;
}

export function OpportunityTable({ opportunities, onExecute, minThreshold = 0 }: OpportunityTableProps) {
  const filteredOpportunities = opportunities.filter(
    op => op.profit_percentage >= minThreshold
  );

  if (filteredOpportunities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No opportunities above {minThreshold}% threshold</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold">Market</TableHead>
            <TableHead className="font-semibold text-center">Polymarket</TableHead>
            <TableHead className="font-semibold text-center">Kalshi</TableHead>
            <TableHead className="font-semibold text-center">Profit %</TableHead>
            <TableHead className="font-semibold text-center">Win Prob</TableHead>
            <TableHead className="font-semibold text-center">Age</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOpportunities.map((opportunity, index) => (
            <TableRow 
              key={opportunity.id}
              className={index === 0 ? 'bg-primary/5' : ''}
            >
              <TableCell className="max-w-xs">
                <div className="flex items-center gap-2">
                  {index === 0 && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 text-xs">
                      TOP
                    </Badge>
                  )}
                  <span className="truncate font-medium">{opportunity.market_name}</span>
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-mono text-blue-400">
                    {(opportunity.polymarket_price! * 100).toFixed(1)}¢
                  </span>
                  {opportunity.polymarket_url && (
                    <a href={opportunity.polymarket_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-blue-400" />
                    </a>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="font-mono text-purple-400">
                    {(opportunity.kalshi_price! * 100).toFixed(1)}¢
                  </span>
                  {opportunity.kalshi_url && (
                    <a href={opportunity.kalshi_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-purple-400" />
                    </a>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="font-semibold text-green-500">
                    +{opportunity.profit_percentage.toFixed(2)}%
                  </span>
                </div>
              </TableCell>
              
              <TableCell className="text-center font-mono">
                {opportunity.win_probability?.toFixed(1)}%
              </TableCell>
              
              <TableCell className="text-center text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(opportunity.discovered_at), { addSuffix: true })}
              </TableCell>
              
              <TableCell className="text-right">
                {onExecute && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1"
                    onClick={() => onExecute(opportunity)}
                  >
                    Trade
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
