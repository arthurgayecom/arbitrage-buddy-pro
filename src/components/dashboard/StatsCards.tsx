import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Target, BarChart3 } from 'lucide-react';

interface StatsCardsProps {
  totalProfitLoss: number;
  totalTrades: number;
  successRate: number;
  activeOpportunities: number;
}

export function StatsCards({
  totalProfitLoss,
  totalTrades,
  successRate,
  activeOpportunities,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Total P/L',
      value: `$${Math.abs(totalProfitLoss).toFixed(2)}`,
      icon: totalProfitLoss >= 0 ? TrendingUp : TrendingDown,
      color: totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: totalProfitLoss >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      prefix: totalProfitLoss >= 0 ? '+' : '-',
    },
    {
      label: 'Total Trades',
      value: totalTrades.toString(),
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Success Rate',
      value: `${successRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Active Opportunities',
      value: activeOpportunities.toString(),
      icon: BarChart3,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className={`text-xl font-bold ${stat.color || ''}`}>
                  {stat.prefix || ''}{stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
