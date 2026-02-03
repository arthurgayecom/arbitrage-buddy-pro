import { Trade } from '@/hooks/useTrades';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TradeHistoryTableProps {
  trades: Trade[];
}

export function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No trades yet</p>
      </div>
    );
  }

  const getStatusColor = (status: Trade['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return '';
    }
  };

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="font-semibold">Market</TableHead>
            <TableHead className="font-semibold text-center">Platform</TableHead>
            <TableHead className="font-semibold text-center">Side</TableHead>
            <TableHead className="font-semibold text-center">Amount</TableHead>
            <TableHead className="font-semibold text-center">Price</TableHead>
            <TableHead className="font-semibold text-center">P/L</TableHead>
            <TableHead className="font-semibold text-center">Status</TableHead>
            <TableHead className="font-semibold text-center">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell className="max-w-xs">
                <div className="flex items-center gap-2">
                  {trade.is_simulation && (
                    <Badge variant="outline" className="text-xs">SIM</Badge>
                  )}
                  <span className="truncate">{trade.market_name}</span>
                </div>
              </TableCell>
              
              <TableCell className="text-center">
                <Badge 
                  variant="secondary"
                  className={trade.platform === 'polymarket' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}
                >
                  {trade.platform}
                </Badge>
              </TableCell>
              
              <TableCell className="text-center">
                <span className={trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                  {trade.side.toUpperCase()}
                </span>
              </TableCell>
              
              <TableCell className="text-center font-mono">
                ${Number(trade.amount).toFixed(2)}
              </TableCell>
              
              <TableCell className="text-center font-mono">
                {(Number(trade.price) * 100).toFixed(1)}¢
              </TableCell>
              
              <TableCell className="text-center">
                {trade.profit_loss !== null ? (
                  <span className={Number(trade.profit_loss) >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {Number(trade.profit_loss) >= 0 ? '+' : ''}${Number(trade.profit_loss).toFixed(2)}
                  </span>
                ) : (
                  '—'
                )}
              </TableCell>
              
              <TableCell className="text-center">
                <Badge variant="outline" className={getStatusColor(trade.status)}>
                  {trade.status}
                </Badge>
              </TableCell>
              
              <TableCell className="text-center text-muted-foreground text-sm">
                {format(new Date(trade.executed_at), 'MMM d, HH:mm')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
