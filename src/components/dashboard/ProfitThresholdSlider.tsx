import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SlidersHorizontal, Zap, Shield } from 'lucide-react';

interface ProfitThresholdSliderProps {
  threshold: number;
  onThresholdChange: (value: number) => void;
  autoExecute: boolean;
  onAutoExecuteChange: (value: boolean) => void;
  simulationMode: boolean;
  onSimulationModeChange: (value: boolean) => void;
}

export function ProfitThresholdSlider({
  threshold,
  onThresholdChange,
  autoExecute,
  onAutoExecuteChange,
  simulationMode,
  onSimulationModeChange,
}: ProfitThresholdSliderProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          Filter Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Profit Threshold</Label>
            <span className="text-lg font-bold text-primary">{threshold.toFixed(1)}%</span>
          </div>
          <Slider
            value={[threshold]}
            onValueChange={([value]) => onThresholdChange(value)}
            min={0}
            max={20}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Only show opportunities with profit ≥ {threshold.toFixed(1)}%
          </p>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <div>
              <Label className="text-sm font-medium">Auto-Execute</Label>
              <p className="text-xs text-muted-foreground">
                Automatically execute trades above threshold
              </p>
            </div>
          </div>
          <Switch
            checked={autoExecute}
            onCheckedChange={onAutoExecuteChange}
            disabled={simulationMode}
          />
        </div>

        <div className="flex items-center justify-between py-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" />
            <div>
              <Label className="text-sm font-medium">Simulation Mode</Label>
              <p className="text-xs text-muted-foreground">
                Test without real funds
              </p>
            </div>
          </div>
          <Switch
            checked={simulationMode}
            onCheckedChange={onSimulationModeChange}
          />
        </div>

        {!simulationMode && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Live Trading Enabled
            </p>
            <p className="text-xs text-destructive/80 mt-1">
              Real transactions will be executed. Proceed with caution.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
